export interface TelegramPhotoSize {
  file_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface TelegramMessage {
  message_id: number;
  chat: { id: number };
  text?: string;
  photo?: TelegramPhotoSize[];
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export interface TelegramFileResponse {
  ok: boolean;
  result: {
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    file_path: string;
  };
}
