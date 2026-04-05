const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseAnonKey);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  hasSupabaseCredentials,
  supabaseUrl: supabaseUrl ?? "",
  supabaseAnonKey: supabaseAnonKey ?? "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
  openClawWebhookUrl: process.env.OPENCLAW_WEBHOOK_URL ?? "",
};
