import type { Lavamusic } from "../structures/index";
import logger from "../structures/Logger";
import type { BotPlugin } from "../types/botPlugin";
import { PluginList } from "./plugins";

/**
 * Validate if a loaded module matches the BotPlugin interface at runtime.
 */
function isBotPlugin(obj: any): obj is BotPlugin {
	return obj && typeof obj.name === "string" && typeof obj.initialize === "function";
}

/**
 * Loads all plugins from `plugins` subdirectory.
 *
 * Designed to be fault-tolerant: if one plugin fails, others continue to load.
 *
 * @param client - The bot client instance.
 */
export default function loadPlugins(client: Lavamusic): void {
	logger.info(`[PLUGINS] Loading ${PluginList.length} plugins...`);

	for (const PluginModule of PluginList) {
		try {
			const plugin: BotPlugin = (PluginModule as any).default || PluginModule;

			/**
			 * Validate structure before execution.
			 * Skip to the next plugin file to prevent crash
			 */
			if (!isBotPlugin(plugin)) {
				logger.warn(
					`[PLUGIN] Skipping invalid plugin object (Missing 'name' or 'initialize' method)`,
				);
				continue;
			}

			plugin.initialize(client);
			logger.info(`[PLUGIN] Loaded: ${plugin.name} v${plugin.version}`);
		} catch (error) {
			// Catch individual plugin errors to continues loading others
			logger.error(`[PLUGIN] Failed to initialize plugin:`, error);
		}
	}
}

/**
 * Project: lavamusic
 * Author: Appu
 * Main Contributor: LucasB25
 * Company: Coders
 * Copyright (c) 2024. All rights reserved.
 * This code is the property of Coder and may not be reproduced or
 * modified without permission. For more information, contact us at
 * https://discord.gg/YQsGbTwPBx
 */
