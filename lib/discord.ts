const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

export async function sendDiscordDM(discordUserId: string, content: string): Promise<boolean> {
  if (!BOT_TOKEN) return false

  const dmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: discordUserId }),
  })

  if (!dmRes.ok) return false
  const dmChannel = await dmRes.json()

  const msgRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  })

  return msgRes.ok
}

export async function sendDiscordDMEmbed(
  discordUserId: string,
  embed: { title: string; description: string; color?: number; fields?: { name: string; value: string; inline?: boolean }[] }
): Promise<boolean> {
  if (!BOT_TOKEN) return false

  const dmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: discordUserId }),
  })

  if (!dmRes.ok) return false
  const dmChannel = await dmRes.json()

  const msgRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ embeds: [embed] }),
  })

  return msgRes.ok
}
