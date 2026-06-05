// config.js - здесь хранятся все ключи и адреса
// Замените на свои реальные данные из Supabase

const SUPABASE_URL = 'https://ryygwvivzojsnvuzaxpp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vJivT1c9MiiFvPZxB7A3sw_XLhKSj8x';

// Создаём клиент и сохраняем в window, чтобы он был доступен всем скриптам
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);