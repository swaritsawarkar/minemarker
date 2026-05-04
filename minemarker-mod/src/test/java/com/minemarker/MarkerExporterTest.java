package com.minemarker;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MarkerExporterTest {
	@TempDir
	Path tempDir;

	@Test
	void exportsJsonTextCsvAndReadme() throws Exception {
		MarkerSession session = new MarkerSession("hardcore ep 3 !@#", "26.1.2", "1.0.0", "Hardcore World", "PlayerName", 0.0D);
		session.addManualMarker("diamond ore!!!", "found diamonds near lava", new PlayerSnapshot(120, -54, 302, "minecraft:overworld", null, 20.0F, 18));
		session.stop();

		ExportResult result = new MarkerExporter(tempDir).export(session, new MineMarkerConfig());

		assertEquals(4, result.writtenFiles().size());
		assertTrue(Files.exists(result.sessionDirectory().resolve("session.json")));
		assertTrue(Files.exists(result.sessionDirectory().resolve("markers.txt")));
		assertTrue(Files.exists(result.sessionDirectory().resolve("markers.csv")));
		assertTrue(Files.exists(result.sessionDirectory().resolve("README_session.txt")));

		String json = Files.readString(result.sessionDirectory().resolve("session.json"), StandardCharsets.UTF_8);
		assertTrue(json.contains("\"project\": \"MineMarker\""));
		assertTrue(json.contains("\"events\": []"));
		assertTrue(json.contains("\"label\": \"diamond-ore\""));

		String csv = Files.readString(result.sessionDirectory().resolve("markers.csv"), StandardCharsets.UTF_8);
		assertTrue(csv.contains("id,type,timestamp_seconds"));
		assertTrue(csv.contains("found diamonds near lava"));
	}

	@Test
	void exportsAutomaticEventsInJsonAndText() throws Exception {
		MarkerSession session = new MarkerSession("event session", "26.1.2", "2.0.0", "World", "Player", 1.0D);
		session.addEvent("player_state", "low_health", "medium", "Low health warning", Map.of("health", "5.0"), new PlayerSnapshot(10, 64, 20, "minecraft:overworld", null, 5.0F, 14));
		session.stop();

		ExportResult result = new MarkerExporter(tempDir).export(session, new MineMarkerConfig());
		String json = Files.readString(result.sessionDirectory().resolve("session.json"), StandardCharsets.UTF_8);
		String text = Files.readString(result.sessionDirectory().resolve("markers.txt"), StandardCharsets.UTF_8);

		assertTrue(json.contains("\"event_key\": \"low_health\""));
		assertTrue(json.contains("\"importance\": \"medium\""));
		assertTrue(json.contains("\"adjusted_timestamp_seconds\""));
		assertTrue(text.contains("Events:"));
		assertTrue(text.contains("low_health"));
	}

	@Test
	void timeFormatterUsesHourMinuteSecondShape() {
		assertEquals("00:02:25", TimeUtil.formatTimestamp(145));
		assertEquals("01:00:01", TimeUtil.formatTimestamp(3601));
	}

	@Test
	void serviceDoesNotCrashWithoutActiveSession() {
		MineMarkerService service = new MineMarkerService(new MarkerExporter(tempDir), new MineMarkerConfig());

		assertTrue(service.addManualMarker("diamond", "note with spaces", PlayerSnapshot.empty()).isEmpty());
		assertTrue(service.stopSession().isEmpty());
		assertTrue(service.undoLatestMarker().isEmpty());
	}

	@Test
	void sanitizesSessionNamesAndLabels() {
		MarkerSession session = new MarkerSession("episode <> : one", "26.1.2", "1.0.0", null, null, 0.0D);
		Marker marker = session.addManualMarker("diamond ore!!!", "note with spaces", PlayerSnapshot.empty());

		assertEquals("episode-one", session.name());
		assertEquals("diamond-ore", marker.label());
		assertEquals("note with spaces", marker.note());
	}

	@Test
	void exporterReportsPathFailures() throws Exception {
		Path fileInsteadOfDirectory = tempDir.resolve("not-a-directory");
		Files.writeString(fileInsteadOfDirectory, "blocking file", StandardCharsets.UTF_8);
		MarkerSession session = new MarkerSession("bad path", "26.1.2", "1.0.0", null, null, 0.0D);
		session.stop();

		Optional<Exception> failure = Optional.empty();
		try {
			new MarkerExporter(fileInsteadOfDirectory).export(session, new MineMarkerConfig());
		} catch (Exception exception) {
			failure = Optional.of(exception);
		}

		assertTrue(failure.isPresent());
	}
}
