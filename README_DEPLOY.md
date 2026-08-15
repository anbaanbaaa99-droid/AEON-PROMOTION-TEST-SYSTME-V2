# AEON Learning & Promotion Test v5.1 — Auth & Layout Fix

Versi 5.1 adalah patch untuk masalah yang terlihat pada halaman login v5:

- hero/login kiri terpotong karena markup HTML dan CSS v5 tidak sinkron;
- kotak **Mode demo aktif** sebelumnya selalu terlihat walaupun backend sebenarnya sudah dikonfigurasi;
- session frontend dibuat lebih tahan reload dengan memory + localStorage/sessionStorage fallback;
- session backend sekarang menyimpan waktu kedaluwarsa sebagai epoch milliseconds agar tidak bergantung pada format tanggal/locale Google Sheet;
- `config.js`, `api.js`, dan `app.js` memakai cache-busting `?v=5.1.0`;
- Service Worker v5.1 selalu mengambil `config.js` terbaru dan menghapus cache versi lama;
- elemen PDF reader yang sudah dipanggil `app.js` tetapi belum ada di `index.html` sekarang sudah ditambahkan.

## PENTING — langkah upgrade

1. **Backup Google Sheet dan Apps Script terlebih dahulu.**
2. Ganti isi Apps Script dengan `Code.gs` v5.1.
3. Bila `DEFAULT_ADMIN_PASSWORD` pernah diubah setelah `setupSystem()` pertama kali dijalankan, jalankan:

   `resetAdminPassword()`

   Contoh: bila sekarang `DEFAULT_ADMIN_PASSWORD = 'admin1006'`, fungsi ini yang benar-benar memperbarui hash password akun ADMIN di sheet `Users`.

4. Jalankan:

   `testAdminSession()`

   Bila backend benar, hasilnya mengandung:

   `"ok": true` dan `"message": "Backend login dan session valid."`

5. Deploy ulang Apps Script sebagai **New version**:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Salin URL Web App yang berakhir `/exec` ke `assets/js/config.js` bila URL deployment berubah.
7. Replace **seluruh** frontend dengan folder v5.1, jangan hanya `index.html`.
8. Buka web lalu lakukan **Ctrl + Shift + R** satu kali.
9. Jika browser masih menampilkan versi lama, buka DevTools → Application → Service Workers → **Unregister**, lalu reload.

## Cara membaca status koneksi

Di kartu login sekarang ada indikator:

- **Server terhubung · v5.1.0** → frontend sudah berbicara dengan Apps Script.
- **Server tidak dapat dijangkau** → cek deployment Apps Script / URL `API_URL`.
- **API belum dikonfigurasi** → `API_URL` di `assets/js/config.js` kosong/tidak valid.

Mode demo dinonaktifkan secara default pada paket produksi v5.1.

## Tentang data lama

Patch v5.1 tidak perlu menghapus akun, nilai, modul, progress membaca, atau hasil ujian. Format session lama berupa Date masih dapat dibaca; session baru memakai epoch milliseconds.

## Struktur

```text
/index.html
/manifest.webmanifest
/service-worker.js
/assets/css/style.css
/assets/js/config.js
/assets/js/api.js
/assets/js/app.js
/assets/modules/*.pdf
/Code.gs
```

## Tes akhir

1. Jalankan `testAdminSession()` di Apps Script.
2. Login ADMIN dari web.
3. Reload halaman; akun harus tetap login selama session belum kedaluwarsa.
4. Register akun peserta baru → Pending.
5. ADMIN → Monitoring → ACC peserta.
6. Login peserta → Baca Modul → pindah bagian → progress tersimpan.
7. Buka PDF asli dari reader.
8. Kerjakan latihan dan cek riwayat nilai.
