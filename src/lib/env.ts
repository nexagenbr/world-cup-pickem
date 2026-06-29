function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseSecretKey: () => required("SUPABASE_SECRET_KEY"),
  footballApiKey: () => required("API_FOOTBALL_KEY"),
  cronSecret: () => required("CRON_SECRET"),
  adminSecret: () => required("ADMIN_SECRET"),
};
