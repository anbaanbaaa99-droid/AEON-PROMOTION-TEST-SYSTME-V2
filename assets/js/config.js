/*
 * Konfigurasi frontend.
 * Ganti API_URL dengan URL deployment Google Apps Script (/exec).
 * Saat masih berisi placeholder, aplikasi otomatis berjalan dalam mode demo.
 */
window.APP_CONFIG = Object.freeze({
  APP_NAME: 'AEON Promotion Test',
  API_URL: 'MASUKKAN_URL_APPS_SCRIPT_DI_SINI',
  REQUEST_TIMEOUT_MS: 25000,
  PASSING_SCORE: 75,
  DEFAULT_QUESTION_COUNT: 10,
  DEFAULT_DURATION_MINUTES: 20,
  ENABLE_DEMO_WHEN_UNCONFIGURED: true
});
