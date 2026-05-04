package com.minemarker;

import java.time.LocalDateTime;

public class Marker {
	private final int id;
	private final String type;
	private final double timestampSeconds;
	private final String formattedTime;
	private final double adjustedTimestampSeconds;
	private final String adjustedFormattedTime;
	private final String label;
	private final String note;
	private final LocalDateTime createdAtLocal;
	private final PlayerSnapshot snapshot;

	public Marker(int id, String type, double timestampSeconds, double videoOffsetSeconds, String label, String note, LocalDateTime createdAtLocal, PlayerSnapshot snapshot) {
		this.id = id;
		this.type = type;
		this.timestampSeconds = timestampSeconds;
		this.formattedTime = TimeUtil.formatTimestamp(timestampSeconds);
		this.adjustedTimestampSeconds = Math.max(0.0D, timestampSeconds + videoOffsetSeconds);
		this.adjustedFormattedTime = TimeUtil.formatTimestamp(adjustedTimestampSeconds);
		this.label = FileUtil.sanitizeMarkerLabel(label);
		this.note = note == null ? "" : note;
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

	public String label() {
		return label;
	}

	public String note() {
		return note;
	}

	public LocalDateTime createdAtLocal() {
		return createdAtLocal;
	}

	public PlayerSnapshot snapshot() {
		return snapshot;
	}
}
