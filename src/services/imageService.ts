import type { TelegramPhotoSize } from "../types/telegram.js";
import { downloadFile, getFile } from "./telegramClient.js";

export function pickBestPhoto(photos: TelegramPhotoSize[]): TelegramPhotoSize {
  return [...photos].sort((a, b) => (b.file_size ?? 0) - (a.file_size ?? 0))[0];
}

export async function fetchBestTelegramPhoto(photos: TelegramPhotoSize[]): Promise<Buffer> {
  const best = pickBestPhoto(photos);
  const filePath = await getFile(best.file_id);
  return downloadFile(filePath);
}

export function basicImageQualityChecks(photo: TelegramPhotoSize): string[] {
  const issues: string[] = [];
  if ((photo.width ?? 0) < 500 || (photo.height ?? 0) < 500) {
    issues.push("Image resolution is low");
  }
  if ((photo.file_size ?? 0) < 40_000) {
    issues.push("Image appears highly compressed");
  }
  return issues;
}
