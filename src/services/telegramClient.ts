import { env } from "../config/env.js";
import type { TelegramUpdate } from "../types/telegram.js";

const botBase = `${env.TELEGRAM_BASE_URL}/bot${env.TELEGRAM_BOT_TOKEN}`;

export async function getUpdates(offset?: number): Promise<TelegramUpdate[]> {
  const url = new URL(`${botBase}/getUpdates`);
  url.searchParams.set("timeout", "20");
  if (offset) url.searchParams.set("offset", String(offset));

  const res = await fetch(url);
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram getUpdates failed: ${JSON.stringify(json)}`);
  return json.result as TelegramUpdate[];
}

export async function sendMessage(chatId: number, text: string): Promise<void> {
  const res = await fetch(`${botBase}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram sendMessage failed: ${JSON.stringify(json)}`);
}

export async function getFile(fileId: string): Promise<string> {
  const res = await fetch(`${botBase}/getFile?file_id=${encodeURIComponent(fileId)}`);
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram getFile failed: ${JSON.stringify(json)}`);
  return json.result.file_path as string;
}

export async function downloadFile(filePath: string): Promise<Buffer> {
  const fileUrl = `${env.TELEGRAM_BASE_URL}/file/bot${env.TELEGRAM_BOT_TOKEN}/${filePath}`;
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}
