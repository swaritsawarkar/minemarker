package com.minemarker.client;

import com.minemarker.MineMarkerConfig;
import com.minemarker.MineMarkerMod;
import com.minemarker.PlayerSnapshot;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ServerData;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;

public final class ClientGameInfo {
	private ClientGameInfo() {
	}

	public static String worldName(Minecraft client) {
		try {
			if (client.getSingleplayerServer() != null) {
				return client.getSingleplayerServer().getWorldData().getLevelName();
			}
			ServerData server = client.getCurrentServer();
			return server == null ? null : server.name;
		} catch (RuntimeException exception) {
			MineMarkerMod.LOGGER.debug("World name unavailable", exception);
			return null;
		}
	}

	public static String playerName(Minecraft client) {
		return client.player == null ? null : client.player.getName().getString();
	}

	public static PlayerSnapshot snapshot(Minecraft client, MineMarkerConfig config) {
		LocalPlayer player = client.player;
		if (player == null || client.level == null) {
			return PlayerSnapshot.empty();
		}

		BlockPos position = player.blockPosition();
		Integer x = config.includeCoordinates() ? position.getX() : null;
		Integer y = config.includeCoordinates() ? position.getY() : null;
		Integer z = config.includeCoordinates() ? position.getZ() : null;
		String dimension = client.level.dimension().identifier().toString();
		Float health = player.getHealth();
		Integer hunger = player.getFoodData().getFoodLevel();

		return new PlayerSnapshot(x, y, z, dimension, null, health, hunger);
	}
}
