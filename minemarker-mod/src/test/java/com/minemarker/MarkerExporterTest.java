package com.minemarker;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

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
	void timeFormatterUsesHourMinuteSecondShape() {
		assertEquals("00:02:25", TimeUtil.formatTimestamp(145));
		assertEquals("01:00:01", TimeUtil.formatTimestamp(3601));
	}
}
