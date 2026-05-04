package com.minemarker;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class MarkerSession {
	private final String id;
	private final String name;
	private final String minecraftVersion;
	private final String modVersion;
	private final String worldName;
	private final String playerName;
	private final LocalDateTime startedAtLocal;
	private final long startedAtMillis;
	private final List<Marker> markers = new ArrayList<>();
	private final List<AutoEvent> events = new ArrayList<>();
	private LocalDateTime stoppedAtLocal;
	private Long stoppedAtMillis;
	private double videoOffsetSeconds;

	public MarkerSession(String requestedName, String minecraftVersion, String modVersion, String worldName, String playerName, double defaultVideoOffsetSeconds) {
		this.name = FileUtil.sanitizeSessionName(requestedName);
		this.minecraftVersion = minecraftVersion;
		this.modVersion = modVersion;
		this.worldName = worldName;
		this.playerName = playerName;
		this.startedAtLocal = LocalDateTime.now();
		this.startedAtMillis = System.currentTimeMillis();
		this.id = TimeUtil.formatSessionTimestamp(startedAtLocal) + "_" + this.name;
		this.videoOffsetSeconds = defaultVideoOffsetSeconds;
	}

	public synchronized Marker addManualMarker(String label, String note, PlayerSnapshot snapshot) {
		Marker marker = new Marker(markers.size() + 1, "manual", currentDurationSeconds(), videoOffsetSeconds, label, note, LocalDateTime.now(), snapshot);
		markers.add(marker);
		return marker;
	}

	public synchronized AutoEvent addEvent(String type, String eventKey, String importance, String label, java.util.Map<String, String> details, PlayerSnapshot snapshot) {
		AutoEvent event = new AutoEvent(events.size() + 1, type, currentDurationSeconds(), videoOffsetSeconds, eventKey, importance, label, details, LocalDateTime.now(), snapshot);
		events.add(event);
		return event;
	}

	public synchronized Optional<Marker> undoLatestMarker() {
		if (markers.isEmpty()) {
			return Optional.empty();
		}
		return Optional.of(markers.remove(markers.size() - 1));
	}

	public synchronized void stop() {
		if (stoppedAtMillis == null) {
			stoppedAtLocal = LocalDateTime.now();
			stoppedAtMillis = System.currentTimeMillis();
		}
	}

	public synchronized double currentDurationSeconds() {
		long end = stoppedAtMillis == null ? System.currentTimeMillis() : stoppedAtMillis;
		return Math.max(0.0D, (end - startedAtMillis) / 1000.0D);
	}

	public synchronized List<Marker> markers() {
		return Collections.unmodifiableList(new ArrayList<>(markers));
	}

	public synchronized List<AutoEvent> events() {
		return Collections.unmodifiableList(new ArrayList<>(events));
	}

	public String id() {
		return id;
	}

	public String name() {
		return name;
	}

	public String minecraftVersion() {
		return minecraftVersion;
	}

	public String modVersion() {
		return modVersion;
	}

	public String worldName() {
		return worldName;
	}

	public String playerName() {
		return playerName;
	}

	public LocalDateTime startedAtLocal() {
		return startedAtLocal;
	}

	public synchronized LocalDateTime stoppedAtLocal() {
		return stoppedAtLocal;
	}

	public synchronized double videoOffsetSeconds() {
		return videoOffsetSeconds;
	}

	public synchronized void setVideoOffsetSeconds(double videoOffsetSeconds) {
		this.videoOffsetSeconds = videoOffsetSeconds;
	}

	public synchronized int markerCount() {
		return markers.size();
	}

	public synchronized int eventCount() {
		return events.size();
	}
}
