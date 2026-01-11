/** biome-ignore-all lint/style/noNonNullAssertion: explanation */
import {
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type CacheType,
	ChannelType,
	Collection,
	ContainerBuilder,
	EmbedBuilder,
	GuildMember,
	type Interaction,
	InteractionType,
	MessageFlags,
	PermissionFlagsBits,
	SectionBuilder,
	type TextChannel,
} from "discord.js";
import { I18N, t } from "../../structures/I18n";
import { Context, Event, type Lavamusic } from "../../structures/index";
import logger from "../../structures/Logger";
import { LavamusicEventType } from "../../types/events";
import { checkDj, createButtonRow } from "../player/TrackStart";

export default class InteractionCreate extends Event {
	constructor(client: Lavamusic, file: string) {
		super(client, file, {
			type: LavamusicEventType.Client,
			name: "interactionCreate",
		});
	}

	public async run(interaction: Interaction<CacheType>): Promise<any> {
		if (!(interaction.guild && interaction.guildId)) return;
		if (
			interaction.type === InteractionType.ApplicationCommand &&
			interaction.isChatInputCommand()
		) {
			const [setup, locale] = await Promise.all([
				this.client.db.getSetup(interaction.guildId),
				this.client.db.getLanguage(interaction.guildId),
			]);
			const allowedCategories = ["filters", "music", "playlist"];
			const commandInSetup = this.client.commands.get(interaction.commandName);

			if (
				setup &&
				interaction.channelId === setup.textId &&
				!(commandInSetup && allowedCategories.includes(commandInSetup.category))
			) {
				return await interaction.reply({
					content: t(I18N.events.interaction.setup_channel),
					flags: MessageFlags.Ephemeral,
				});
			}

			const { commandName } = interaction;
			await this.client.db.get(interaction.guildId);

			const command = this.client.commands.get(commandName);
			if (!command) return;

			const ctx = new Context(interaction, [...interaction.options.data]);
			ctx.setArgs([...interaction.options.data]);
			ctx.guildLocale = locale;
			const clientMember = interaction.guild.members.resolve(this.client.user!)!;
			if (
				!(
					interaction.inGuild() &&
					interaction.channel?.permissionsFor(clientMember)?.has(PermissionFlagsBits.ViewChannel)
				)
			)
				return;

			if (
				!(
					clientMember.permissions.has(PermissionFlagsBits.ViewChannel) &&
					clientMember.permissions.has(PermissionFlagsBits.SendMessages) &&
					clientMember.permissions.has(PermissionFlagsBits.EmbedLinks) &&
					clientMember.permissions.has(PermissionFlagsBits.ReadMessageHistory)
				)
			) {
				return await (interaction.member as GuildMember)
					.send({
						content: t(I18N.events.interaction.no_send_message),
					})
					.catch(() => {
						null;
					});
			}

			const logs = this.client.channels.cache.get(this.client.env.LOG_COMMANDS_ID!);

			if (command.permissions) {
				if (command.permissions?.client) {
					const clientRequiredPermissions = Array.isArray(command.permissions.client)
						? command.permissions.client
						: [command.permissions.client];

					const missingClientPermissions = clientRequiredPermissions.filter(
						(perm: any) => !clientMember.permissions.has(perm),
					);

					if (missingClientPermissions.length > 0) {
						return await interaction.reply({
							content: t(I18N.events.interaction.no_permission, {
								permissions: missingClientPermissions
									.map((perm: string) => `\`${perm}\``)
									.join(", "),
							}),
							flags: MessageFlags.Ephemeral,
						});
					}
				}

				if (
					command.permissions?.user &&
					!(interaction.member as GuildMember).permissions.has(command.permissions.user)
				) {
					await interaction.reply({
						content: t(I18N.events.interaction.no_user_permission),
						flags: MessageFlags.Ephemeral,
					});
					return;
				}

				if (command.permissions?.dev && this.client.env.OWNER_IDS) {
					const isDev = this.client.env.OWNER_IDS.includes(interaction.user.id);
					if (!isDev) return;
				}
			}
			if (command.vote && this.client.env.TOPGG) {
				const voted = await this.client.topGG.hasVoted(interaction.user.id);
				if (!voted) {
					const voteBtn = new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setLabel(t(I18N.events.interaction.vote_button))
							.setURL(`https://top.gg/bot/${this.client.user?.id}/vote`)
							.setStyle(ButtonStyle.Link),
					);

					return await interaction.reply({
						content: t(I18N.events.interaction.vote_message),
						components: [voteBtn],
						flags: MessageFlags.Ephemeral,
					});
				}
			}
			if (command.player) {
				if (command.player.voice) {
					if (!(interaction.member as GuildMember).voice.channel) {
						return await interaction.reply({
							content: t(I18N.events.interaction.no_voice_channel, { command: command.name }),
						});
					}

					if (!clientMember.permissions.has(PermissionFlagsBits.Connect)) {
						return await interaction.reply({
							content: t(I18N.events.interaction.no_connect_permission, { command: command.name }),
						});
					}

					if (!clientMember.permissions.has(PermissionFlagsBits.Speak)) {
						return await interaction.reply({
							content: t(I18N.events.interaction.no_speak_permission, { command: command.name }),
						});
					}

					if (
						(interaction.member as GuildMember).voice.channel?.type ===
						ChannelType.GuildStageVoice &&
						!clientMember.permissions.has(PermissionFlagsBits.RequestToSpeak)
					) {
						return await interaction.reply({
							content: t(I18N.events.interaction.no_request_to_speak, { command: command.name }),
						});
					}

					if (
						clientMember.voice.channel &&
						clientMember.voice.channelId !== (interaction.member as GuildMember).voice.channelId
					) {
						return await interaction.reply({
							content: t(I18N.events.interaction.different_voice_channel, {
								channel: `<#${clientMember.voice.channelId}>`,
								command: command.name,
							}),
						});
					}
				}

				if (command.player.active) {
					const queue = this.client.manager.getPlayer(interaction.guildId);
					if (!queue?.queue.current) {
						return await interaction.reply({
							content: t(I18N.events.interaction.no_music_playing),
						});
					}
				}

				if (command.player.dj) {
					const dj = await this.client.db.getDj(interaction.guildId);
					if (dj?.mode) {
						const djRole = await this.client.db.getRoles(interaction.guildId);
						if (!djRole) {
							return await interaction.reply({ content: t(I18N.events.interaction.no_dj_role) });
						}

						const hasDJRole = (interaction.member as GuildMember).roles.cache.some((role) =>
							djRole.map((r) => r.roleId).includes(role.id),
						);
						if (
							!(
								hasDJRole &&
								!(interaction.member as GuildMember).permissions.has(
									PermissionFlagsBits.ManageGuild,
								)
							)
						) {
							return await interaction.reply({
								content: t(I18N.events.interaction.no_dj_permission),
								flags: MessageFlags.Ephemeral,
							});
						}
					}
				}
			}

			if (!this.client.cooldown.has(commandName)) {
				this.client.cooldown.set(commandName, new Collection());
			}

			const now = Date.now();
			const timestamps = this.client.cooldown.get(commandName)!;
			const cooldownAmount = (command.cooldown || 5) * 1000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;
				const timeLeft = (expirationTime - now) / 1000;
				if (now < expirationTime && timeLeft > 0.9) {
					return await interaction.reply({
						content: t(I18N.events.interaction.cooldown, {
							lng: locale,
							time: timeLeft.toFixed(1),
							command: commandName,
						}),
					});
				}
				timestamps.set(interaction.user.id, now);
				setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
			} else {
				timestamps.set(interaction.user.id, now);
				setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
			}

			try {
				await command.run(this.client, ctx, ctx.args);
				if (
					setup &&
					interaction.channelId === setup.textId &&
					allowedCategories.includes(command.category)
				) {
					setTimeout(() => {
						interaction.deleteReply().catch(() => {
							null;
						});
					}, 5000);
				}
				if (logs) {
					const embed = new EmbedBuilder()
						.setAuthor({
							name: "Slash - Command Logs",
							iconURL: this.client.user?.avatarURL({ size: 2048 }) ?? "",
						})
						.setColor(this.client.config.color.blue)
						.addFields(
							{ name: "Command", value: `\`${command.name}\``, inline: true },
							{
								name: "User",
								value: `${interaction.user.tag} (\`${interaction.user.id}\`)`,
								inline: true,
							},
							{
								name: "Guild",
								value: `${interaction.guild.name} (\`${interaction.guild.id}\`)`,
								inline: true,
							},
						)
						.setTimestamp();

					await (logs as TextChannel).send({ embeds: [embed] });
				}
			} catch (error) {
				logger.error(error);
				await interaction.reply({
					content: t(I18N.events.interaction.error, { error }),
				});
			}
		} else if (interaction.isButton()) {
			const { customId } = interaction;
			const nowPlayingIds = ["previous", "resume", "stop", "skip", "loop"];
			if (nowPlayingIds.includes(customId)) {
				const player = this.client.manager.getPlayer(interaction.guildId);
				if (!player || !player.queue.current) return;

				if (interaction.member instanceof GuildMember) {
					const isSameVoiceChannel =
						interaction.guild?.members.me?.voice.channelId === interaction.member.voice.channelId;
					if (!isSameVoiceChannel) {
						return await interaction.reply({
							content: t(I18N.player.trackStart.not_connected_to_voice_channel, {
								channel: interaction.guild?.members.me?.voice.channelId ?? "None",
							}),
							flags: MessageFlags.Ephemeral,
						});
					}
				}

				if (!(await checkDj(this.client, interaction as ButtonInteraction<"cached">))) {
					return await interaction.reply({
						content: t(I18N.player.trackStart.need_dj_role),
						flags: MessageFlags.Ephemeral,
					});
				}

				const track = player.queue.current;

				const editMessage = async (text: string): Promise<void> => {
					const mainSection = new SectionBuilder().addTextDisplayComponents((td) =>
						td.setContent(
							`**[${track.info.title}](${track.info.uri})**\n` +
							`-# ${text}\n` +
							`${t(I18N.player.trackStart.author)}: ${track.info.author}\n` +
							`${t(I18N.player.trackStart.duration)}: ${track.info.isStream ? "LIVE" : this.client.utils.formatTime(track.info.duration)}`,
						),
					);

					if (track.info.artworkUrl) {
						mainSection.setThumbnailAccessory((th) =>
							th.setURL(track.info.artworkUrl!).setDescription(`Artwork for ${track.info.title}`),
						);
					}

					const updatedContainer = new ContainerBuilder()
						.setAccentColor(this.client.color.main)
						.addSectionComponents(mainSection);

					await interaction.message.edit({
						components: [updatedContainer, createButtonRow(player)],
					});
				};

				switch (customId) {
					case "previous":
						if (player.queue.previous && player.queue.previous.length > 0) {
							await interaction.deferUpdate();
							const previousTrack = player.queue.previous[0];
							player.play({ track: previousTrack });
							await editMessage(t(I18N.player.trackStart.previous_by, { user: interaction.user.tag }));
						} else {
							await interaction.reply({
								content: t(I18N.player.trackStart.no_previous_song),
								flags: MessageFlags.Ephemeral,
							});
						}
						break;
					case "resume":
						if (player.paused) {
							player.resume();
							await interaction.deferUpdate();
							await editMessage(t(I18N.player.trackStart.resumed_by, { user: interaction.user.tag }));
						} else {
							player.pause();
							await interaction.deferUpdate();
							await editMessage(t(I18N.player.trackStart.paused_by, { user: interaction.user.tag }));
						}
						break;
					case "stop":
						player.stopPlaying(true, false);
						await interaction.deferUpdate();
						break;
					case "skip":
						if (player.queue.tracks.length > 0) {
							await interaction.deferUpdate();
							player.skip();
							await editMessage(t(I18N.player.trackStart.skipped_by, { user: interaction.user.tag }));
						} else {
							await interaction.reply({
								content: t(I18N.player.trackStart.no_more_songs_in_queue),
								flags: MessageFlags.Ephemeral,
							});
						}
						break;
					case "loop":
						await interaction.deferUpdate();
						switch (player.repeatMode) {
							case "off":
								player.setRepeatMode("track");
								await editMessage(t(I18N.player.trackStart.looping_by, { user: interaction.user.tag }));
								break;
							case "track":
								player.setRepeatMode("queue");
								await editMessage(
									t(I18N.player.trackStart.looping_queue_by, { user: interaction.user.tag }),
								);
								break;
							case "queue":
								player.setRepeatMode("off");
								await editMessage(
									t(I18N.player.trackStart.looping_off_by, { user: interaction.user.tag }),
								);
								break;
						}
						break;
				}
			}
		} else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
			const command = this.client.commands.get(interaction.commandName);
			if (!command) return;

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				logger.error(error);
			}
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
