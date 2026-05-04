package com.minemarker;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import net.fabricmc.loader.api.FabricLoader;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class ConfigManager {
	private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

	private final Path configPath;
	private MineMarkerConfig config = new MineMarkerConfig();

	public ConfigManager() {
		this(FabricLoader.getInstance().getConfigDir().resolve("minemarker.json"));
	}

	ConfigManager(Path configPath) {
		this.configPath = configPath;
	}

	public MineMarkerConfig load() {
		try {
			if (Files.notExists(configPath)) {
				save();
				return config;
			}

			String json = Files.readString(configPath, StandardCharsets.UTF_8);
			MineMarkerConfig loaded = GSON.fromJson(json, MineMarkerConfig.class);
			if (loaded != null) {
				loaded.normalize();
				config = loaded;
			}
		} catch (RuntimeException | IOException exception) {
			MineMarkerMod.LOGGER.warn("Failed to load MineMarker config, using defaults", exception);
			config = new MineMarkerConfig();
			save();
		}
		return config;
	}

	public MineMarkerConfig getConfig() {
		return config;
	}

	public void save() {
		try {
			Files.createDirectories(configPath.getParent());
			Files.writeString(configPath, GSON.toJson(config), StandardCharsets.UTF_8);
		} catch (IOException exception) {
			MineMarkerMod.LOGGER.warn("Failed to save MineMarker config", exception);
		}
	}
}
