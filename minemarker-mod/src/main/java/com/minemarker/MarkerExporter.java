package com.minemarker;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import net.fabricmc.loader.api.FabricLoader;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class MarkerExporter {
	private static final Gson GSON = new GsonBuilder().setPrettyPrinting().serializeNulls().create();

	private final Path sessionsRoot;

	public MarkerExporter() {
		this(FabricLoader.getInstance().getGameDir().resolve("minemarker").resolve("sessions"));
	}

	public MarkerExporter(Path sessionsRoot) {
		this.sessionsRoot = sessionsRoot;
	}

	public ExportResult export(MarkerSession session, MineMarkerConfig config) throws IOException {
		Path sessionDirectory = sessionsRoot.resolve(session.id()).normalize();
		Files.createDirectories(sessionDirectory);

		List<Path> written = new ArrayList<>();
		if (config.exportJson()) {
			Path json = sessionDirectory.resolve("session.json");
			Files.writeString(json, GSON.toJson(toJson(session, config)), StandardCharsets.UTF_8);
			written.add(json);
		}
		if (config.exportTxt()) {
			Path text = sessionDirectory.resolve("markers.txt");
			Files.writeString(text, toText(session), StandardCharsets.UTF_8);
			written.add(text);
		}
		if (config.exportCsv()) {
			Path csv = sessionDirectory.resolve("markers.csv");
			Files.writeString(csv, toCsv(session), StandardCharsets.UTF_8);
			written.add(csv);
		}
		if (config.exportReadme()) {
			Path readme = sessionDirectory.resolve("README_session.txt");
			Files.writeString(readme, toSessionReadme(session), StandardCharsets.UTF_8);
			written.add(readme);
		}

		return new ExportResult(sessionDirectory, written);
	}

	private JsonObject toJson(MarkerSession session, MineMarkerConfig config) {
		JsonObject root = new JsonObject();
		root.addProperty("project", MineMarkerMod.PROJECT_NAME);
		root.addProperty("schema_version", MineMarkerMod.SCHEMA_VERSION);
		root.addProperty("mod_version", session.modVersion());
		root.addProperty("minecraft_version", session.minecraftVersion());

		JsonObject sessionJson = new JsonObject();
		sessionJson.addProperty("id", session.id());
		sessionJson.addProperty("name", session.name());
		addNullable(sessionJson, "world", session.worldName());
		addNullable(sessionJson, "player", session.playerName());
		sessionJson.addProperty("started_at_local", TimeUtil.formatLocalForJson(session.startedAtLocal()));
		addNullable(sessionJson, "stopped_at_local", TimeUtil.formatLocalForJson(session.stoppedAtLocal()));
		sessionJson.addProperty("duration_seconds", roundSeconds(session.currentDurationSeconds()));
		sessionJson.addProperty("video_offset_seconds", session.videoOffsetSeconds());
		sessionJson.addProperty("marker_count", session.markerCount());
		root.add("session", sessionJson);

		JsonArray markersJson = new JsonArray();
		for (Marker marker : session.markers()) {
			markersJson.add(markerToJson(marker, config));
		}
		root.add("markers", markersJson);

		JsonArray eventsJson = new JsonArray();
		for (AutoEvent event : session.events()) {
			eventsJson.add(eventToJson(event, config));
		}
		root.add("events", eventsJson);
		return root;
	}

	private JsonObject markerToJson(Marker marker, MineMarkerConfig config) {
		JsonObject json = new JsonObject();
		json.addProperty("id", marker.id());
		json.addProperty("type", marker.type());
		json.addProperty("timestamp_seconds", roundSeconds(marker.timestampSeconds()));
		json.addProperty("formatted_time", marker.formattedTime());
		json.addProperty("adjusted_timestamp_seconds", roundSeconds(marker.adjustedTimestampSeconds()));
		json.addProperty("adjusted_formatted_time", marker.adjustedFormattedTime());
		json.addProperty("label", marker.label());
		json.addProperty("note", marker.note());
		addNullable(json, "created_at_local", config.includeSystemTimestamps() ? TimeUtil.formatLocalForJson(marker.createdAtLocal()) : null);

		PlayerSnapshot snapshot = marker.snapshot();
		if (config.includeCoordinates() && snapshot.x() != null && snapshot.y() != null && snapshot.z() != null) {
			JsonObject position = new JsonObject();
			position.addProperty("x", snapshot.x());
			position.addProperty("y", snapshot.y());
			position.addProperty("z", snapshot.z());
			json.add("position", position);
		} else {
			json.add("position", null);
		}

		addNullable(json, "dimension", snapshot.dimension());
		addNullable(json, "biome", snapshot.biome());
		addNullable(json, "health", snapshot.health());
		addNullable(json, "hunger", snapshot.hunger());
		return json;
	}

	private JsonObject eventToJson(AutoEvent event, MineMarkerConfig config) {
		JsonObject json = new JsonObject();
		json.addProperty("id", event.id());
		json.addProperty("type", event.type());
		json.addProperty("timestamp_seconds", roundSeconds(event.timestampSeconds()));
		json.addProperty("formatted_time", event.formattedTime());
		json.addProperty("adjusted_timestamp_seconds", roundSeconds(event.adjustedTimestampSeconds()));
		json.addProperty("adjusted_formatted_time", event.adjustedFormattedTime());
		json.addProperty("event_key", event.eventKey());
		json.addProperty("importance", event.importance());
		json.addProperty("label", event.label());

		JsonObject details = new JsonObject();
		event.details().forEach(details::addProperty);
		json.add("details", details);
		addNullable(json, "created_at_local", config.includeSystemTimestamps() ? TimeUtil.formatLocalForJson(event.createdAtLocal()) : null);

		PlayerSnapshot snapshot = event.snapshot();
		if (config.includeCoordinates() && snapshot.x() != null && snapshot.y() != null && snapshot.z() != null) {
			JsonObject position = new JsonObject();
			position.addProperty("x", snapshot.x());
			position.addProperty("y", snapshot.y());
			position.addProperty("z", snapshot.z());
			json.add("position", position);
		} else {
			json.add("position", null);
		}

		addNullable(json, "dimension", snapshot.dimension());
		addNullable(json, "biome", snapshot.biome());
		addNullable(json, "health", snapshot.health());
		addNullable(json, "hunger", snapshot.hunger());
		return json;
	}

	private String toText(MarkerSession session) {
		StringBuilder builder = new StringBuilder();
		builder.append("MineMarker Session: ").append(session.name()).append('\n');
		builder.append("Started: ").append(TimeUtil.formatLocalReadable(session.startedAtLocal())).append('\n');
		builder.append("Stopped: ").append(TimeUtil.formatLocalReadable(session.stoppedAtLocal())).append('\n');
		builder.append("Duration: ").append(TimeUtil.formatTimestamp(session.currentDurationSeconds())).append('\n');
		builder.append("Video Offset: ").append(formatNumber(session.videoOffsetSeconds())).append(" seconds\n\n");
		builder.append("Markers:\n");

		for (Marker marker : session.markers()) {
			PlayerSnapshot snapshot = marker.snapshot();
			builder.append(marker.adjustedFormattedTime())
					.append(" | ")
					.append(marker.label())
					.append(" | ")
					.append(marker.note())
					.append(" | ")
					.append(snapshot.dimension() == null ? "unknown_dimension" : snapshot.dimension())
					.append(" | ")
					.append(positionText(snapshot))
					.append('\n');
		}
		builder.append('\n').append("Events:\n");
		for (AutoEvent event : session.events()) {
			PlayerSnapshot snapshot = event.snapshot();
			builder.append(event.adjustedFormattedTime())
					.append(" | ")
					.append(event.eventKey())
					.append(" | ")
					.append(event.label())
					.append(" | ")
					.append(snapshot.dimension() == null ? "unknown_dimension" : snapshot.dimension())
					.append(" | ")
					.append(positionText(snapshot))
					.append('\n');
		}

		return builder.toString();
	}

	private String toCsv(MarkerSession session) {
		StringBuilder builder = new StringBuilder();
		builder.append("id,type,timestamp_seconds,formatted_time,adjusted_timestamp_seconds,adjusted_formatted_time,label,note,created_at_local,x,y,z,dimension,biome,health,hunger\n");
		for (Marker marker : session.markers()) {
			PlayerSnapshot snapshot = marker.snapshot();
			builder.append(marker.id()).append(',')
					.append(FileUtil.csv(marker.type())).append(',')
					.append(roundSeconds(marker.timestampSeconds())).append(',')
					.append(FileUtil.csv(marker.formattedTime())).append(',')
					.append(roundSeconds(marker.adjustedTimestampSeconds())).append(',')
					.append(FileUtil.csv(marker.adjustedFormattedTime())).append(',')
					.append(FileUtil.csv(marker.label())).append(',')
					.append(FileUtil.csv(marker.note())).append(',')
					.append(FileUtil.csv(TimeUtil.formatLocalForJson(marker.createdAtLocal()))).append(',')
					.append(nullable(snapshot.x())).append(',')
					.append(nullable(snapshot.y())).append(',')
					.append(nullable(snapshot.z())).append(',')
					.append(FileUtil.csv(snapshot.dimension())).append(',')
					.append(FileUtil.csv(snapshot.biome())).append(',')
					.append(nullable(snapshot.health())).append(',')
					.append(nullable(snapshot.hunger())).append('\n');
		}
		return builder.toString();
	}

	private String toSessionReadme(MarkerSession session) {
		return """
				MineMarker session export

				session.json is the source of truth for this recording session.
				markers.txt is a human-readable editing checklist.
				markers.csv is spreadsheet-friendly and can be adapted for editor marker imports.

				Automatic events are included in session.json under the events array when enabled.
				Video offset is applied to adjusted timestamps.
				""";
	}

	private static void addNullable(JsonObject json, String key, String value) {
		if (value == null) {
			json.add(key, null);
		} else {
			json.addProperty(key, value);
		}
	}

	private static void addNullable(JsonObject json, String key, Number value) {
		if (value == null) {
			json.add(key, null);
		} else {
			json.addProperty(key, value);
		}
	}

	private static String positionText(PlayerSnapshot snapshot) {
		if (snapshot.x() == null || snapshot.y() == null || snapshot.z() == null) {
			return "position unavailable";
		}
		return "x=" + snapshot.x() + " y=" + snapshot.y() + " z=" + snapshot.z();
	}

	private static String nullable(Object value) {
		return value == null ? "" : value.toString();
	}

	private static double roundSeconds(double seconds) {
		return Math.round(seconds * 1000.0D) / 1000.0D;
	}

	private static String formatNumber(double value) {
		if (value == Math.rint(value)) {
			return Long.toString((long) value);
		}
		return String.format(Locale.ROOT, "%.3f", value);
	}
}
