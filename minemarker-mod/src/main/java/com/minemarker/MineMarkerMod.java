package com.minemarker;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.loader.api.FabricLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MineMarkerMod implements ModInitializer {
	public static final String MOD_ID = "minemarker";
	public static final String PROJECT_NAME = "MineMarker";
	public static final String SCHEMA_VERSION = "1.0";
	public static final Logger LOGGER = LoggerFactory.getLogger(PROJECT_NAME);

	@Override
	public void onInitialize() {
		LOGGER.info("{} {} initialized", PROJECT_NAME, getModVersion());
	}

	public static String getModVersion() {
		return FabricLoader.getInstance()
				.getModContainer(MOD_ID)
				.map(container -> container.getMetadata().getVersion().getFriendlyString())
				.orElse("unknown");
	}

	public static String getMinecraftVersion() {
		return FabricLoader.getInstance()
				.getModContainer("minecraft")
				.map(container -> container.getMetadata().getVersion().getFriendlyString())
				.orElse("unknown");
	}
}
