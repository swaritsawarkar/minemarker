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

	public void normalize() {
		quickMarkerLabel = FileUtil.sanitizeMarkerLabel(quickMarkerLabel);
		if (Double.isNaN(defaultVideoOffsetSeconds) || Double.isInfinite(defaultVideoOffsetSeconds)) {
			defaultVideoOffsetSeconds = 0.0D;
		}
	}
}
