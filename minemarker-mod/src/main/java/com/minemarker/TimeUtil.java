package com.minemarker;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class TimeUtil {
	public static final DateTimeFormatter JSON_LOCAL_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
	public static final DateTimeFormatter READABLE_LOCAL_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
	public static final DateTimeFormatter SESSION_ID_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");

	private TimeUtil() {
	}

	public static String formatTimestamp(double seconds) {
		long roundedSeconds = Math.max(0L, Math.round(seconds));
		long hours = roundedSeconds / 3600L;
		long minutes = (roundedSeconds % 3600L) / 60L;
		long remainingSeconds = roundedSeconds % 60L;
		return String.format("%02d:%02d:%02d", hours, minutes, remainingSeconds);
	}

	public static String formatLocalForJson(LocalDateTime localDateTime) {
		return localDateTime == null ? null : localDateTime.format(JSON_LOCAL_FORMAT);
	}

	public static String formatLocalReadable(LocalDateTime localDateTime) {
		return localDateTime == null ? "not stopped yet" : localDateTime.format(READABLE_LOCAL_FORMAT);
	}

	public static String formatSessionTimestamp(LocalDateTime localDateTime) {
		return localDateTime.format(SESSION_ID_FORMAT);
	}
}
