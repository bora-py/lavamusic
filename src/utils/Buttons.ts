import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import type { Player } from "lavalink-client";
import { I18N, t } from "../structures/I18n";

function getButtons(player: Player): ActionRowBuilder<ButtonBuilder>[] {
	const buttonData = [
		{
			customId: "PREV_BUT",
			label: t(I18N.buttons.previous),
			style: ButtonStyle.Secondary,
		},
		{
			customId: "REWIND_BUT",
			label: t(I18N.buttons.rewind),
			style: ButtonStyle.Secondary,
		},
		{
			customId: "PAUSE_BUT",
			label: player?.paused ? t(I18N.buttons.resume) : t(I18N.buttons.pause),
			style: player?.paused ? ButtonStyle.Success : ButtonStyle.Secondary,
		},
		{
			customId: "FORWARD_BUT",
			label: t(I18N.buttons.forward),
			style: ButtonStyle.Secondary,
		},
		{
			customId: "SKIP_BUT",
			label: t(I18N.buttons.skip),
			style: ButtonStyle.Secondary,
		},
		{
			customId: "LOW_VOL_BUT",
			label: t(I18N.buttons.volume_down),
			style: ButtonStyle.Secondary,
		},
		{
			customId: "LOOP_BUT",
			label: t(I18N.buttons.loop),
			style: ButtonStyle.Secondary,
		},
		{
			customId: "STOP_BUT",
			label: t(I18N.buttons.stop),
			style: ButtonStyle.Danger,
		},
		{
			customId: "SHUFFLE_BUT",
			label: t(I18N.buttons.shuffle),
			style: ButtonStyle.Secondary,
		},
		{
			customId: "HIGH_VOL_BUT",
			label: t(I18N.buttons.volume_up),
			style: ButtonStyle.Secondary,
		},
	];

	return buttonData.reduce((rows, { customId, label, style }, index) => {
		if (index % 5 === 0) rows.push(new ActionRowBuilder<ButtonBuilder>());

		const button = new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
		rows[rows.length - 1].addComponents(button);
		return rows;
	}, [] as ActionRowBuilder<ButtonBuilder>[]);
}

export { getButtons };

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
