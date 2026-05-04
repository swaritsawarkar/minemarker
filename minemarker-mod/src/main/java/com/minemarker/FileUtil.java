package com.minemarker;

public final class FileUtil {
	private FileUtil() {
	}

	public static String sanitizeSessionName(String value) {
		String sanitized = sanitizeToken(value, "session");
		return sanitized.length() > 64 ? sanitized.substring(0, 64) : sanitized;
	}

	public static String sanitizeMarkerLabel(String value) {
		String sanitized = sanitizeToken(value, "marker");
		return sanitized.length() > 48 ? sanitized.substring(0, 48) : sanitized;
	}

	public static String sanitizeToken(String value, String fallback) {
		if (value == null || value.isBlank()) {
			return fallback;
		}

		String sanitized = value.trim()
				.replaceAll("\\s+", "-")
				.replaceAll("[^A-Za-z0-9._-]", "-")
				.replaceAll("-+", "-")
				.replaceAll("^[._-]+|[._-]+$", "");

		return sanitized.isBlank() ? fallback : sanitized;
	}

	public static String csv(String value) {
		if (value == null) {
			return "";
		}
		String escaped = value.replace("\"", "\"\"");
		if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n") || escaped.contains("\r")) {
			return "\"" + escaped + "\"";
		}
		return escaped;
	}
}
