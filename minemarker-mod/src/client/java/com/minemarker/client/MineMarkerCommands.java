package com.minemarker.client;

import com.minemarker.ExportResult;
import com.minemarker.Marker;
import com.minemarker.MarkerSession;
import com.minemarker.MineMarkerConfig;
import com.minemarker.MineMarkerMod;
import com.minemarker.MineMarkerService;
import com.minemarker.TimeUtil;
import com.mojang.brigadier.arguments.DoubleArgumentType;
import com.mojang.brigadier.arguments.StringArgumentType;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource;
import net.minecraft.client.Minecraft;
import net.minecraft.network.chat.Component;

import java.util.List;

import static net.fabricmc.fabric.api.client.command.v2.ClientCommands.argument;
import static net.fabricmc.fabric.api.client.command.v2.ClientCommands.literal;

public final class MineMarkerCommands {
	private MineMarkerCommands() {
	}

	public static void register(MineMarkerService service, MineMarkerConfig config) {
		ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> dispatcher.register(literal("minemarker")
				.executes(context -> help(context.getSource()))
				.then(literal("start")
						.executes(context -> start(context.getSource(), service, "session"))
						.then(argument("session_name", StringArgumentType.greedyString())
								.executes(context -> start(context.getSource(), service, StringArgumentType.getString(context, "session_name")))))
				.then(literal("mark")
						.then(argument("label", StringArgumentType.word())
								.executes(context -> mark(context.getSource(), service, config, StringArgumentType.getString(context, "label"), ""))
								.then(argument("note", StringArgumentType.greedyString())
										.executes(context -> mark(context.getSource(), service, config, StringArgumentType.getString(context, "label"), StringArgumentType.getString(context, "note"))))))
				.then(literal("stop")
						.executes(context -> stop(context.getSource(), service)))
				.then(literal("status")
						.executes(context -> status(context.getSource(), service)))
				.then(literal("export")
						.executes(context -> export(context.getSource(), service)))
				.then(literal("offset")
						.then(argument("seconds", DoubleArgumentType.doubleArg())
								.executes(context -> offset(context.getSource(), service, DoubleArgumentType.getDouble(context, "seconds")))))
				.then(literal("help")
						.executes(context -> help(context.getSource())))
				.then(literal("list")
						.executes(context -> list(context.getSource(), service)))
				.then(literal("undo")
						.executes(context -> undo(context.getSource(), service)))
				.then(literal("events")
						.then(literal("on")
								.executes(context -> events(context.getSource(), service, true)))
						.then(literal("off")
								.executes(context -> events(context.getSource(), service, false)))
						.then(literal("status")
								.executes(context -> eventsStatus(context.getSource(), service, config))))));
	}

	private static int start(FabricClientCommandSource source, MineMarkerService service, String name) {
		Minecraft client = source.getClient();
		MarkerSession session = service.startSession(name, MineMarkerMod.getMinecraftVersion(), MineMarkerMod.getModVersion(), ClientGameInfo.worldName(client), ClientGameInfo.playerName(client));
		feedback(source, "MineMarker session started: " + session.name());
		return 1;
	}

	private static int mark(FabricClientCommandSource source, MineMarkerService service, MineMarkerConfig config, String label, String note) {
		Minecraft client = source.getClient();
		return service.addManualMarker(label, note, ClientGameInfo.snapshot(client, config))
				.map(marker -> {
					feedback(source, "Marker added at " + marker.formattedTime() + ": " + marker.label());
					return 1;
				})
				.orElseGet(() -> {
					feedback(source, "No active session. Use /minemarker start <name>");
					return 0;
				});
	}

	private static int stop(FabricClientCommandSource source, MineMarkerService service) {
		return service.stopSession()
				.map(session -> {
					int count = session.markerCount();
					feedback(source, "Session stopped. " + count + " markers saved.");
					exportSession(service, session);
					return 1;
				})
				.orElseGet(() -> {
					feedback(source, "No active session. Use /minemarker start <name>");
					return 0;
				});
	}

	private static int status(FabricClientCommandSource source, MineMarkerService service) {
		return service.activeSession()
				.map(session -> {
					feedback(source, "MineMarker active: " + session.name() + " | duration " + TimeUtil.formatTimestamp(session.currentDurationSeconds()) + " | markers " + session.markerCount());
					return 1;
				})
				.orElseGet(() -> {
					feedback(source, "No active session. Use /minemarker start <name>");
					return 0;
				});
	}

	private static int export(FabricClientCommandSource source, MineMarkerService service) {
		return service.lastOrActiveSession()
				.map(session -> {
					feedback(source, "Exporting MineMarker session: " + session.name());
					exportSession(service, session);
					return 1;
				})
				.orElseGet(() -> {
					feedback(source, "No session to export yet. Use /minemarker start <name>");
					return 0;
				});
	}

	private static int offset(FabricClientCommandSource source, MineMarkerService service, double seconds) {
		if (service.setVideoOffset(seconds)) {
			feedback(source, "MineMarker video offset set to " + seconds + " seconds.");
			return 1;
		}
		feedback(source, "No session found for offset. Start a session first.");
		return 0;
	}

	private static int help(FabricClientCommandSource source) {
		List<String> lines = List.of(
				"MineMarker commands:",
				"/minemarker start [session_name]",
				"/minemarker mark <label> [note]",
				"/minemarker stop",
				"/minemarker status",
				"/minemarker export",
				"/minemarker offset <seconds>",
				"/minemarker events on|off|status",
				"/minemarker list",
				"/minemarker undo"
		);
		for (String line : lines) {
			feedback(source, line);
		}
		return 1;
	}

	private static int list(FabricClientCommandSource source, MineMarkerService service) {
		List<Marker> markers = service.currentMarkers();
		if (markers.isEmpty()) {
			feedback(source, "No markers in the current session.");
			return 0;
		}
		int start = Math.max(0, markers.size() - 5);
		for (Marker marker : markers.subList(start, markers.size())) {
			feedback(source, marker.formattedTime() + " | " + marker.label() + " | " + marker.note());
		}
		return 1;
	}

	private static int undo(FabricClientCommandSource source, MineMarkerService service) {
		return service.undoLatestMarker()
				.map(marker -> {
					feedback(source, "Removed latest marker: " + marker.label() + " at " + marker.formattedTime());
					return 1;
				})
				.orElseGet(() -> {
					feedback(source, "No marker to undo in the current session.");
					return 0;
				});
	}

	private static int events(FabricClientCommandSource source, MineMarkerService service, boolean enabled) {
		service.setAutoEventsEnabled(enabled);
		feedback(source, "MineMarker automatic events " + (enabled ? "enabled." : "disabled."));
		return 1;
	}

	private static int eventsStatus(FabricClientCommandSource source, MineMarkerService service, MineMarkerConfig config) {
		feedback(source, "MineMarker automatic events: " + (service.autoEventsEnabled() ? "on" : "off"));
		feedback(source, "Detect deaths: " + config.detectDeaths());
		feedback(source, "Detect dimension changes: " + config.detectDimensionChange());
		feedback(source, "Detect low health: " + config.detectLowHealth());
		feedback(source, "Detect advancements: " + config.detectAdvancements() + " (not implemented in V2)");
		feedback(source, "Detect valuable blocks: " + config.detectValuableBlocks() + " (not implemented in V2)");
		return 1;
	}

	private static void exportSession(MineMarkerService service, MarkerSession session) {
		service.exportAsync(session).whenComplete((result, throwable) -> {
			if (throwable != null) {
				MineMarkerClient.sendChat("MineMarker export failed: " + throwable.getMessage());
				MineMarkerMod.LOGGER.warn("MineMarker export failed", throwable);
			} else {
				announceExport(result);
			}
		});
	}

	private static void announceExport(ExportResult result) {
		MineMarkerClient.sendChat("Exported to: " + result.sessionDirectory());
	}

	private static void feedback(FabricClientCommandSource source, String message) {
		source.sendFeedback(Component.literal(message));
	}
}
