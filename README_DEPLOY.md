# AEON Learning & Promotion Test v5.5 — Mobile First Balanced UI

Versi ini merapikan UI/UX berdasarkan penggunaan utama melalui HP dan tetap mempertahankan backend/performance v5.4.

## Arah desain
- Density: medium, bukan landing page yang terlalu lega.
- Tipografi: system font/Arial, judul normal-profesional (tidak oversized).
- Warna: AEON magenta sebagai warna utama, background tetap terang agar nyaman membaca.
- Login: form sederhana di tengah; hero besar dihapus.
- Navigasi HP: dipindah menjadi bottom navigation agar tidak menabrak heading.
- Dashboard: `Lanjutkan modul Anda` diprioritaskan sebelum statistik.
- Modul: materi yang sedang dipelajari otomatis naik ke posisi pertama dan diberi label `LANJUTKAN`.
- Latihan: satu soal per layar; nomor soal menjadi strip horizontal pada HP.
- Admin priority: Approval akun -> statistik ringkas -> hasil/pencarian peserta -> analitik modul.

## Animasi & performance
Animasi hanya memakai `opacity` dan `transform` (toast, dialog, halaman, login card, hasil ujian). Tidak ada animation library, webfont, video background, blur backdrop, atau aset tambahan.
`prefers-reduced-motion` tetap didukung.

PDF modul tidak diprecache oleh Service Worker dan baru dimuat saat peserta memilih untuk menampilkan PDF.

## Upgrade
1. Backup deployment lama.
2. Replace `Kode.gs` dengan `Code.gs` v5.5. `Security.gs` tetap file kosong/komentar seperti paket ini.
3. Jalankan `setupSystem()` sekali jika sheet belum lengkap.
4. Jalankan `testAdminSession()`.
5. Deploy Apps Script: **Manage deployments -> Edit -> New version -> Deploy**.
6. Replace frontend GitHub Pages. Minimal: `index.html`, `assets/css/style.css`, `assets/js/app.js`, `service-worker.js`.
7. Hard refresh / tutup-buka browser. Indikator login harus membaca `Server terhubung · v5.5.0`.

Tidak perlu menjalankan upgrade konten lagi jika modul dan soal sudah ada.
