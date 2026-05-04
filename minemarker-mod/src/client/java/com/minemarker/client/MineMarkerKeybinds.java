package com.minemarker.client;

import com.minemarker.Marker;
import com.minemarker.MineMarkerMod;
import com.minemarker.MineMarkerConfig;
import com.minemarker.MineMarkerService;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keymapping.v1.KeyMappingHelper;
import net.minecraft.client.KeyMapping;
import net.minecraft.resources.Identifier;
import org.lwjgl.glfw.GLFW;

public final class MineMarkerKeybinds {
	private MineMarkerKeybinds() {
	}

	public static void register(MineMarkerService service, MineMarkerConfig config) {
		KeyMapping.Category category = KeyMapping.Category.register(Identifier.fromNamespaceAndPath(MineMarkerMod.MOD_ID, "keybinds"));
		KeyMapping quickMarker = KeyMappingHelper.registerKeyMapping(new KeyMapping(
				"key.minemarker.quick_marker",
				GLFW.GLFW_KEY_M,
				category
		));

		ClientTickEvents.END_CLIENT_TICK.register(client -> {
			while (quickMarker.consumeClick()) {
				if (client.player == null) {
					continue;
				}

				service.addManualMarker(config.quickMarkerLabel(), "quick marker keybind", ClientGameInfo.snapshot(client, config))
						.ifPresentOrElse(
								marker -> MineMarkerClient.sendChat("Marker added at " + marker.formattedTime() + ": " + marker.label()),
								() -> MineMarkerClient.sendChat("No active session. Use /minemarker start <name>")
						);
			}
		});
	}
}
