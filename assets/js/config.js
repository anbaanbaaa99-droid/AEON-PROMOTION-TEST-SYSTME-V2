/*
 * Konfigurasi frontend.
 * Ganti API_URL dengan URL deployment Google Apps Script (/exec).
 * Paket produksi v5.1 tidak otomatis masuk mode demo bila API belum dikonfigurasi.
 */
window.APP_CONFIG = Object.freeze({
  APP_NAME: 'AEON Learning & Promotion Test',
  API_URL: 'https://script.google.com/macros/s/AKfycby_RbDyr8_oUJ7S0U5hovnPhaqh-U9C1GM-EvXbYwUmYIxtfIyF9EcsuzntCNGetMY9Rg/exec',
  REQUEST_TIMEOUT_MS: 25000,
  PASSING_SCORE: 75,
  DEFAULT_QUESTION_COUNT: 10,
  DEFAULT_DURATION_MINUTES: 20,
  ENABLE_DEMO_WHEN_UNCONFIGURED: false
});
