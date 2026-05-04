package com.minemarker.client;

import com.minemarker.ConfigManager;
import com.minemarker.MineMarkerConfig;
import com.minemarker.MineMarkerMod;
import com.minemarker.MineMarkerService;
import com.minemarker.MarkerExporter;
import net.fabricmc.api.ClientModInitializer;
import net.minecraft.client.Minecraft;
import net.minecraft.network.chat.Component;

public class MineMarkerClient implements ClientModInitializer {
	private static MineMarkerService service;
	private static MineMarkerConfig config;

	@Override
	public void onInitializeClient() {
		ConfigManager configManager = new ConfigManager();
		config = configManager.load();
		service = new MineMarkerService(new MarkerExporter(), config);
		MineMarkerCommands.register(service, config);
		MineMarkerKeybinds.register(service, config);
		MineMarkerEventDetector.register(service, config);
		MineMarkerMod.LOGGER.info("MineMarker client initialized");
	}

	public static void sendChat(String message) {
		Minecraft client = Minecraft.getInstance();
		client.execute(() -> {
			if (client.player != null) {
				client.player.sendSystemMessage(Component.literal(message));
			} else {
				MineMarkerMod.LOGGER.info(message);
			}
		});
	}
}
