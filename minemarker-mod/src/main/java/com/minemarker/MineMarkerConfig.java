package com.minemarker;

public class MineMarkerConfig {
	private boolean exportJson = true;
	private boolean exportTxt = true;
	private boolean exportCsv = true;
	private boolean exportReadme = true;
	private double defaultVideoOffsetSeconds = 0.0D;
	private String quickMarkerLabel = "quick_marker";
	private boolean includeCoordinates = true;
	private boolean includeSystemTimestamps = true;
	private boolean autoEventsEnabled = true;
	private boolean detectDeaths = true;
	private boolean detectDimensionChange = true;
	private boolean detectAdvancements = false;
	private boolean detectValuableBlocks = false;
	private boolean detectLowHealth = true;
	private double lowHealthThreshold = 6.0D;

	public boolean exportJson() {
		return exportJson;
	}

	public boolean exportTxt() {
		return exportTxt;
	}

	public boolean exportCsv() {
		return exportCsv;
	}

	public boolean exportReadme() {
		return exportReadme;
	}

	public double defaultVideoOffsetSeconds() {
		return defaultVideoOffsetSeconds;
	}

	public String quickMarkerLabel() {
		return FileUtil.sanitizeMarkerLabel(quickMarkerLabel);
	}

	public boolean includeCoordinates() {
		return includeCoordinates;
	}

	public boolean includeSystemTimestamps() {
		return includeSystemTimestamps;
	}

	public boolean autoEventsEnabled() {
		return autoEventsEnabled;
	}

	public boolean detectDeaths() {
		return detectDeaths;
	}

	public boolean detectDimensionChange() {
		return detectDimensionChange;
	}

	public boolean detectAdvancements() {
		return detectAdvancements;
	}

	public boolean detectValuableBlocks() {
		return detectValuableBlocks;
	}

	public boolean detectLowHealth() {
		return detectLowHealth;
	}

	public double lowHealthThreshold() {
		return lowHealthThreshold;
	}

	public void normalize() {
		quickMarkerLabel = FileUtil.sanitizeMarkerLabel(quickMarkerLabel);
		if (Double.isNaN(defaultVideoOffsetSeconds) || Double.isInfinite(defaultVideoOffsetSeconds)) {
			defaultVideoOffsetSeconds = 0.0D;
		}
		if (Double.isNaN(lowHealthThreshold) || Double.isInfinite(lowHealthThreshold) || lowHealthThreshold <= 0.0D) {
			lowHealthThreshold = 6.0D;
		}
	}
}
