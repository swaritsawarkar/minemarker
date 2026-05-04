package com.minemarker.client;

import com.minemarker.AutoEvent;
import com.minemarker.MineMarkerConfig;
import com.minemarker.MineMarkerService;
import com.minemarker.PlayerSnapshot;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.minecraft.client.Minecraft;

import java.util.LinkedHashMap;
import java.util.Map;

public final class MineMarkerEventDetector {
	private static String trackedSessionId;
	private static String lastDimension;
	private static boolean wasDead;
	private static boolean lowHealthActive;

	private MineMarkerEventDetector() {
	}

	public static void register(MineMarkerService service, MineMarkerConfig config) {
		ClientTickEvents.END_CLIENT_TICK.register(client -> tick(client, service, config));
	}

	private static void tick(Minecraft client, MineMarkerService service, MineMarkerConfig config) {
		var session = service.activeSession().orElse(null);
		if (session == null || client.player == null || client.level == null || !service.autoEventsEnabled()) {
			reset();
			return;
		}

		if (!session.id().equals(trackedSessionId)) {
			trackedSessionId = session.id();
			lastDimension = ClientGameInfo.currentDimension(client);
			wasDead = client.player.getHealth() <= 0.0F;
			lowHealthActive = false;
		}

		PlayerSnapshot snapshot = ClientGameInfo.snapshot(client, config);
		detectDimensionChange(client, service, config, snapshot);
		detectDeath(client, service, config, snapshot);
		detectLowHealth(client, service, config, snapshot);
	}

	private static void detectDimensionChange(Minecraft client, MineMarkerService service, MineMarkerConfig config, PlayerSnapshot snapshot) {
		if (!config.detectDimensionChange()) {
			lastDimension = ClientGameInfo.currentDimension(client);
			return;
		}

		String currentDimension = ClientGameInfo.currentDimension(client);
		if (lastDimension != null && currentDimension != null && !lastDimension.equals(currentDimension)) {
			Map<String, String> details = new LinkedHashMap<>();
			details.put("from", lastDimension);
			details.put("to", currentDimension);
			addEvent(service, "dimension_change", "dimension_changed", "high", "Dimension changed", details, snapshot);
		}
		lastDimension = currentDimension;
	}

	private static void detectDeath(Minecraft client, MineMarkerService service, MineMarkerConfig config, PlayerSnapshot snapshot) {
		if (!config.detectDeaths()) {
			wasDead = false;
			return;
		}

		boolean dead = client.player.getHealth() <= 0.0F;
		if (dead && !wasDead) {
			Map<String, String> details = new LinkedHashMap<>();
			details.put("health", Float.toString(client.player.getHealth()));
			addEvent(service, "player_state", "player_death", "high", "Player death", details, snapshot);
		}
		wasDead = dead;
	}

	private static void detectLowHealth(Minecraft client, MineMarkerService service, MineMarkerConfig config, PlayerSnapshot snapshot) {
		if (!config.detectLowHealth()) {
			lowHealthActive = false;
			return;
		}

		float health = client.player.getHealth();
		double threshold = config.lowHealthThreshold();
		if (health > threshold + 2.0D) {
			lowHealthActive = false;
		}
		if (health > 0.0F && health <= threshold && !lowHealthActive) {
			Map<String, String> details = new LinkedHashMap<>();
			details.put("health", Float.toString(health));
			details.put("threshold", Double.toString(threshold));
			addEvent(service, "player_state", "low_health", "medium", "Low health warning", details, snapshot);
			lowHealthActive = true;
		}
	}

	private static void addEvent(MineMarkerService service, String type, String eventKey, String importance, String label, Map<String, String> details, PlayerSnapshot snapshot) {
		service.addAutoEvent(type, eventKey, importance, label, details, snapshot)
				.map(AutoEvent::label)
				.ifPresent(eventLabel -> MineMarkerClient.sendChat("MineMarker event: " + eventLabel));
	}

	private static void reset() {
		trackedSessionId = null;
		lastDimension = null;
		wasDead = false;
		lowHealthActive = false;
	}
}
