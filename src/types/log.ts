import { Colors } from "discord.js";

const LEVEL_KEYS = [
	"INFO",
	"WARN",
	"ERROR",
	"SUCCESS",
	"DEBUG",
	"LOG",
	"PAUSE",
	"START",
	"STAR",
] as const;

/**
 * Defines log levels derived directly from {@linkcode LEVEL_KEYS}.
 */
export type LogLevel = (typeof LEVEL_KEYS)[number];

export const LOG_LEVEL = Object.fromEntries(LEVEL_KEYS.map((key) => [key, key])) as {
	[K in LogLevel]: K;
};

/**
 * Discord Embed log colors.
 */
export const LOG_COLORS = {
	INFO: Colors.Blue, // 0x3498DB,
	WARN: Colors.Yellow, //0xffff00,
	ERROR: Colors.Red, // 0xff0000,
	SUCCESS: Colors.Green, //0x00ff00,
} as const;

/**
 * Type for log levels that support Discord Embeds.
 */
export type EmbedLogLevel = keyof typeof LOG_COLORS;


/**
 * Badge style options.
 * - {@linkcode LogBadgeStyle.emoji}: Uses custom emojis defined above.
 * - {@linkcode LogBadgeStyle.default}: Uses Signale's default badges.
 */
export const LogBadgeStyle = {
	emoji: "emoji",
	default: "default",
} as const;

export type LogBadgeStyle = (typeof LogBadgeStyle)[keyof typeof LogBadgeStyle];


/**
 * Colors for console output.
 */
export const CONSOLE_LOG_COLORS: Record<LogLevel, string> = {
	INFO: "blue",
	WARN: "yellow",
	ERROR: "red",
	DEBUG: "magenta",
	SUCCESS: "green",
	LOG: "grey",
	PAUSE: "yellow",
	START: "green",
	STAR: "yellow",
};
