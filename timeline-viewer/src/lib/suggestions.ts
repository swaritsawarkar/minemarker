import type { CreatorSuggestion, MineMarkerExport, SuggestionPriority, TimelineItem } from '../types';
import { formatTime } from './timeline';

const BORING_GAP_SECONDS = 8 * 60;

const highPriorityPattern = /death|diamond|debris|dimension|low_health|boss|totem|ancient/;
const mediumPriorityPattern = /funny|jumpscare|fight|raid|clutch|nether|end|village|treasure|loot/;
const timelapsePattern = /build|base|farm|terraform|timelapse|montage|mining|dig|bridge|tower|roof|storage/;

export function buildCreatorSuggestions(items: TimelineItem[], durationSeconds: number): CreatorSuggestion[] {
  const sorted = [...items].sort((a, b) => a.adjustedTimestamp - b.adjustedTimestamp);
  const suggestions: CreatorSuggestion[] = [];

  for (const item of sorted) {
    const searchable = `${item.type} ${item.label} ${item.note}`.toLowerCase();
    const priority = clipPriority(searchable, item.importance);

    if (priority) {
      suggestions.push({
        key: `clip-${item.key}`,
        kind: 'clip_candidate',
        title: item.label,
        reason: clipReason(item, priority),
        priority,
        startSeconds: item.adjustedTimestamp,
        formattedStart: item.adjustedFormatted,
        sourceKeys: [item.key]
      });
    }

    if (timelapsePattern.test(searchable)) {
      suggestions.push({
        key: `timelapse-${item.key}`,
        kind: 'timelapse_candidate',
        title: item.label,
        reason: 'Label or note looks build/mining related, so this may work better as a montage or timelapse beat.',
        priority: 'medium',
        startSeconds: item.adjustedTimestamp,
        formattedStart: item.adjustedFormatted,
        sourceKeys: [item.key]
      });
    }
  }

  suggestions.push(...findBoringGaps(sorted, durationSeconds));
  return suggestions.sort((a, b) => a.startSeconds - b.startSeconds || priorityRank(a.priority) - priorityRank(b.priority));
}

export function exportSuggestionNotes(session: MineMarkerExport, suggestions: CreatorSuggestion[]): string {
  const lines = [
    `MineMarker Creator Suggestions: ${session.session.name}`,
    `World: ${session.session.world || 'unknown'}`,
    `Duration: ${formatTime(session.session.duration_seconds)}`,
    '',
    'These suggestions are rule-based. They are not AI analysis and should be reviewed by the editor.',
    '',
    'Suggestions:'
  ];

  if (suggestions.length === 0) {
    lines.push('No suggestions generated from the current markers/events.');
  }

  for (const suggestion of suggestions) {
    const range = suggestion.formattedEnd ? `${suggestion.formattedStart}-${suggestion.formattedEnd}` : suggestion.formattedStart;
    lines.push(`${range} | ${suggestion.priority} | ${suggestion.kind} | ${suggestion.title} | ${suggestion.reason}`);
  }

  return `${lines.join('\n')}\n`;
}

export function exportReviewCsv(items: TimelineItem[], suggestions: CreatorSuggestion[]): string {
  const rows = [
    ['kind', 'priority', 'start_seconds', 'start_time', 'end_seconds', 'end_time', 'label', 'source', 'notes', 'color']
  ];

  for (const item of items) {
    rows.push([
      item.kind,
      item.importance,
      secondsCell(item.adjustedTimestamp),
      item.adjustedFormatted,
      '',
      '',
      item.label,
      item.type,
      item.note,
      colorForPriority(item.importance)
    ]);
  }

  for (const suggestion of suggestions) {
    rows.push([
      suggestion.kind,
      suggestion.priority,
      secondsCell(suggestion.startSeconds),
      suggestion.formattedStart,
      suggestion.endSeconds === undefined ? '' : secondsCell(suggestion.endSeconds),
      suggestion.formattedEnd || '',
      suggestion.title,
      suggestion.sourceKeys.join(' '),
      suggestion.reason,
      colorForPriority(suggestion.priority)
    ]);
  }

  return rows.map((row) => row.map(csvCell).join(',')).join('\n') + '\n';
}

function clipPriority(searchable: string, importance: string): SuggestionPriority | null {
  if (importance === 'high' || highPriorityPattern.test(searchable)) {
    return 'high';
  }
  if (importance === 'medium' || mediumPriorityPattern.test(searchable)) {
    return 'medium';
  }
  return null;
}

function clipReason(item: TimelineItem, priority: SuggestionPriority): string {
  if (priority === 'high') {
    return 'High-impact Minecraft moment based on marker/event type, label, or importance.';
  }
  if (item.kind === 'marker') {
    return 'Manual creator marker looks like a useful review beat.';
  }
  return 'Automatic event looks worth checking during edit review.';
}

function findBoringGaps(items: TimelineItem[], durationSeconds: number): CreatorSuggestion[] {
  const suggestions: CreatorSuggestion[] = [];
  let previous = 0;
  let previousKey = 'session_start';

  for (const item of items) {
    addGapSuggestion(suggestions, previous, item.adjustedTimestamp, previousKey, item.key);
    previous = item.adjustedTimestamp;
    previousKey = item.key;
  }

  addGapSuggestion(suggestions, previous, Math.max(durationSeconds, previous), previousKey, 'session_end');
  return suggestions;
}

function addGapSuggestion(
  suggestions: CreatorSuggestion[],
  startSeconds: number,
  endSeconds: number,
  fromKey: string,
  toKey: string
) {
  const gap = endSeconds - startSeconds;
  if (gap < BORING_GAP_SECONDS) {
    return;
  }

  suggestions.push({
    key: `gap-${Math.round(startSeconds)}-${Math.round(endSeconds)}`,
    kind: 'boring_gap',
    title: 'Long quiet stretch',
    reason: `No MineMarker markers or events for ${formatTime(gap)}. Review for cuts, timelapse, or removal.`,
    priority: 'low',
    startSeconds,
    endSeconds,
    formattedStart: formatTime(startSeconds),
    formattedEnd: formatTime(endSeconds),
    sourceKeys: [fromKey, toKey]
  });
}

function priorityRank(priority: SuggestionPriority): number {
  if (priority === 'high') return 0;
  if (priority === 'medium') return 1;
  return 2;
}

function colorForPriority(priority: string): string {
  if (priority === 'high') return 'red';
  if (priority === 'medium') return 'yellow';
  if (priority === 'low') return 'blue';
  return 'green';
}

function secondsCell(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
