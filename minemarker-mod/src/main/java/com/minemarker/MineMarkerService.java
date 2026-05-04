package com.minemarker;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MineMarkerService {
	private final MarkerExporter exporter;
	private final MineMarkerConfig config;
	private final ExecutorService exportExecutor;
	private MarkerSession activeSession;
	private MarkerSession lastSession;
	private boolean autoEventsEnabled;

	public MineMarkerService(MarkerExporter exporter, MineMarkerConfig config) {
		this.exporter = exporter;
		this.config = config;
		this.exportExecutor = Executors.newSingleThreadExecutor(runnable -> {
			Thread thread = new Thread(runnable, "MineMarker Exporter");
			thread.setDaemon(true);
			return thread;
		});
		this.autoEventsEnabled = config.autoEventsEnabled();
	}

	public synchronized MarkerSession startSession(String requestedName, String minecraftVersion, String modVersion, String worldName, String playerName) {
		if (activeSession != null) {
			activeSession.stop();
			lastSession = activeSession;
		}
		activeSession = new MarkerSession(requestedName, minecraftVersion, modVersion, worldName, playerName, config.defaultVideoOffsetSeconds());
		return activeSession;
	}

	public synchronized Optional<MarkerSession> activeSession() {
		return Optional.ofNullable(activeSession);
	}

	public synchronized Optional<MarkerSession> lastOrActiveSession() {
		return Optional.ofNullable(activeSession == null ? lastSession : activeSession);
	}

	public synchronized Optional<Marker> addManualMarker(String label, String note, PlayerSnapshot snapshot) {
		if (activeSession == null) {
			return Optional.empty();
		}
		return Optional.of(activeSession.addManualMarker(label, note, snapshot));
	}

	public synchronized Optional<AutoEvent> addAutoEvent(String type, String eventKey, String importance, String label, java.util.Map<String, String> details, PlayerSnapshot snapshot) {
		if (activeSession == null || !autoEventsEnabled) {
			return Optional.empty();
		}
		return Optional.of(activeSession.addEvent(type, eventKey, importance, label, details, snapshot));
	}

	public synchronized Optional<Marker> undoLatestMarker() {
		if (activeSession == null) {
			return Optional.empty();
		}
		return activeSession.undoLatestMarker();
	}

	public synchronized Optional<MarkerSession> stopSession() {
		if (activeSession == null) {
			return Optional.empty();
		}
		activeSession.stop();
		lastSession = activeSession;
		activeSession = null;
		return Optional.of(lastSession);
	}

	public synchronized boolean setVideoOffset(double seconds) {
		MarkerSession session = activeSession == null ? lastSession : activeSession;
		if (session == null || Double.isNaN(seconds) || Double.isInfinite(seconds)) {
			return false;
		}
		session.setVideoOffsetSeconds(seconds);
		return true;
	}

	public synchronized List<Marker> currentMarkers() {
		return activeSession == null ? List.of() : activeSession.markers();
	}

	public synchronized boolean autoEventsEnabled() {
		return autoEventsEnabled;
	}

	public synchronized void setAutoEventsEnabled(boolean enabled) {
		this.autoEventsEnabled = enabled;
	}

	public CompletableFuture<ExportResult> exportAsync(MarkerSession session) {
		return CompletableFuture.supplyAsync(() -> {
			try {
				return exporter.export(session, config);
			} catch (IOException exception) {
				throw new ExportException("Failed to export MineMarker session", exception);
			}
		}, exportExecutor);
	}

	public static class ExportException extends RuntimeException {
		public ExportException(String message, Throwable cause) {
			super(message, cause);
		}
	}

	public static String relativeExportPath(Path path) {
		return ".minecraft/" + path.getFileName();
	}
}
