package com.minemarker;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public class AutoEvent {
	private final int id;
	private final String type;
	private final double timestampSeconds;
	private final String formattedTime;
	private final double adjustedTimestampSeconds;
	private final String adjustedFormattedTime;
	private final String eventKey;
	private final String importance;
	private final String label;
	private final Map<String, String> details;
	private final LocalDateTime createdAtLocal;
	private final PlayerSnapshot snapshot;

	public AutoEvent(int id, String type, double timestampSeconds, double videoOffsetSeconds, String eventKey, String importance, String label, Map<String, String> details, LocalDateTime createdAtLocal, PlayerSnapshot snapshot) {
		this.id = id;
		this.type = type;
		this.timestampSeconds = timestampSeconds;
		this.formattedTime = TimeUtil.formatTimestamp(timestampSeconds);
		this.adjustedTimestampSeconds = Math.max(0.0D, timestampSeconds + videoOffsetSeconds);
		this.adjustedFormattedTime = TimeUtil.formatTimestamp(adjustedTimestampSeconds);
		this.eventKey = FileUtil.sanitizeToken(eventKey, "event");
		this.importance = FileUtil.sanitizeToken(importance, "normal");
		this.label = label == null || label.isBlank() ? this.eventKey : label.trim();
		this.details = details == null ? Map.of() : Collections.unmodifiableMap(new LinkedHashMap<>(details));
		this.createdAtLocal = createdAtLocal;
		this.snapshot = snapshot == null ? PlayerSnapshot.empty() : snapshot;
	}

	public int id() {
		return id;
	}

	public String type() {
		return type;
	}

	public double timestampSeconds() {
		return timestampSeconds;
	}

	public String formattedTime() {
		return formattedTime;
	}

	public double adjustedTimestampSeconds() {
		return adjustedTimestampSeconds;
	}

	public String adjustedFormattedTime() {
		return adjustedFormattedTime;
	}

	public String eventKey() {
		return eventKey;
	}

	public String importance() {
		return importance;
	}

	public String label() {
		return label;
	}

	public Map<String, String> details() {
		return details;
	}

	public LocalDateTime createdAtLocal() {
		return createdAtLocal;
	}

	public PlayerSnapshot snapshot() {
		return snapshot;
	}
}
