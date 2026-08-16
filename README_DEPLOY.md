# AEON Learning & Promotion Test v5.4 — Editorial Performance

Versi ini mengubah UI/UX dengan pendekatan editorial yang terinspirasi dari Pillars Brewery: komposisi grid tegas, latar cream, kontras ink, tipografi display besar, framed CTA, dan ritme visual sederhana. Identitas AEON tetap menggunakan magenta dan seluruh aset dibuat ringan tanpa webfont atau hero image.

## Fokus performa v5.4
- `doPost()` tidak menjalankan `ensureSystem_()` pada setiap request.
- Session persisten memakai Script Properties; sheet `Sessions` hanya untuk audit.
- `readObjects_()` membaca header + data dalam satu `getValues()`.
- `updateObject_()` mengubah satu baris dengan satu write, bukan beberapa `setValue()`.
- katalog modul di-cache 15 menit karena jarang berubah.
- admin dashboard membaca `ReadingProgress` satu kali, bukan sekali per peserta.
- health-check tidak dijalankan bersamaan dengan bootstrap session tersimpan.
- registrasi service worker ditunda sampai halaman selesai dimuat / browser idle.
- service worker tidak menyimpan PDF besar ke CacheStorage.
- PDF tetap lazy: baru diambil setelah peserta membukanya.
- tidak ada external webfont, library UI, hero photo, backdrop blur, atau animasi berat.
- `content-visibility` dipakai pada area baca/tabel yang panjang.

## Upgrade dari v5.3
1. Backup project Apps Script dan Google Sheet.
2. Replace seluruh isi `Kode.gs` dengan `Code.gs` dari paket ini.
3. `Security.gs` tetap kosong/komentar seperti file dalam paket.
4. Save, lalu jalankan `setupSystem()` satu kali.
5. Jalankan `testAdminSession()` dan pastikan sukses.
6. Deploy → Manage deployments → Edit → **New version** → Deploy.
7. Upload seluruh frontend v5.4 ke GitHub Pages. Minimal replace `index.html`, `assets/css/style.css`, `assets/js/app.js`, `assets/js/api.js`, `service-worker.js`, dan `manifest.webmanifest`.
8. Hard refresh. Jika UI lama masih muncul, unregister service worker lama lalu reload.
9. Indikator login harus menampilkan `Server terhubung · v5.4.0`.

Tidak perlu menjalankan `upgradeContentV5()` bila modul dan soal v5 sudah terpasang.

## Catatan desain
Referensi dipakai sebagai arah visual/UX, bukan salinan identitas atau aset: editorial grid, cream/black contrast, display typography, simple framed calls-to-action, dan navigasi yang jelas. AEON magenta, isi training, alur akun, approval, modul, latihan, dan monitoring tetap milik aplikasi ini.
