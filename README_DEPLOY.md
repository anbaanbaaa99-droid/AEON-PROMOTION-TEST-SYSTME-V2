# AEON Learning & Promotion Test v5

Versi ini memperbarui **Baca Modul** dan **bank soal** berdasarkan materi PDF yang diberikan untuk project ini.

## Konten v5

Tersedia 11 kelompok materi:
1. HORENSO — Lancar Tanpa Hambatan
2. JISEKI — Bekerja dengan Ownership
3. K.Y.O. — Know Yourself and Others
4. TWIJI — Training Within Industry Job Instruction
5. DOUKIZUKE — Motivation
6. ALEC — Active Listening for Effective Communication
7. AEON Foundational Ideal
8. Future Vision Grup AEON
9. AEON Figure 1, 2 & 3
10. Semua Demi Pelanggan — AEON DNA
11. Management — ringkasan konsep pilihan Peter F. Drucker

Bank latihan berisi **88 soal pilihan ganda**, masing-masing 8 soal per kelompok materi.

Setiap materi juga menyertakan tombol **Buka PDF asli**. File PDF sumber ditempatkan di `/assets/modules/`, sehingga peserta dapat membaca ringkasan cepat di web atau membuka modul lengkap.

## Sumber materi yang dipakai

- JISEKI - Bekerja Dengan Ownership.pdf
- HORENSO - Lancar Tanpa Hambatan.pdf
- KYO - Know Yourself and Others.pdf
- TWIJI - Training Within Industry Job Instruction.pdf
- Doukizuke.pdf
- ALEC - Active Listening for Effective Communication.pdf
- AEON Foundational Ideal (ID).pdf
- Future Vision Booklet (ID).pdf
- AEON Figure 1 2 3 (ID).pdf
- Comic Everything We Do We Do For Our Customers (Ch. 1-5).pdf
- Management - Tasks, Responsibilities, Practices by Peter Drucker.pdf

Materi baca di web adalah **ringkasan pembelajaran**, bukan salinan penuh PDF. Isi pertanyaan disusun dari konsep yang didukung sumber-sumber tersebut.

## Instalasi baru

1. Backup Google Sheet dan Apps Script.
2. Ganti isi Apps Script dengan `Code.gs` v5.
3. Ubah `DEFAULT_ADMIN_PASSWORD` sebelum produksi.
4. Jalankan `setupSystem()` sekali.
5. Deploy Web App sebagai versi baru:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Pastikan `assets/js/config.js` memakai URL `/exec` deployment yang benar.
7. Upload/replace seluruh frontend v5.
8. Hard refresh (`Ctrl+Shift+R`) sekali.

## Upgrade dari v3/v4 tanpa menghapus akun dan hasil

1. **Backup Spreadsheet terlebih dahulu.**
2. Ganti `Code.gs` dengan versi v5.
3. Jalankan **`upgradeContentV5()` satu kali** dari editor Apps Script.
4. Fungsi ini mengganti isi sheet `Modules` dan `Questions` dengan konten v5.
5. Fungsi tersebut **tidak menghapus** `Users`, `ReadingProgress`, `Results`, `Sessions`, atau `QuizSessions`.
6. Deploy ulang Web App sebagai **New version**.
7. Upload frontend v5 dan lakukan hard refresh.

> Catatan: progress lama untuk modul dengan nama yang masih sama tetap ada. Katalog lama `8 BASIC` diganti dengan modul sumber yang lebih spesifik.

## Struktur frontend

```text
/index.html
/manifest.webmanifest
/service-worker.js
/assets/icon.svg
/assets/css/style.css
/assets/js/config.js
/assets/js/api.js
/assets/js/app.js
/assets/modules/*.pdf
```

## Tes yang disarankan

1. Register peserta baru → status Pending.
2. Login admin → ACC peserta.
3. Login peserta.
4. Buka **Baca Modul** dan pastikan 11 kelompok materi tampil.
5. Buka HORENSO/JISEKI/KYO lalu pindah section dan cek progress.
6. Klik **Latihan soal modul ini**.
7. Pastikan latihan mengambil soal dari modul yang sama.
8. Uji AEON Figure untuk memastikan soal perhitungan tampil.
9. Selesaikan tes dan cek riwayat serta monitoring admin.

Service Worker v5 menggunakan cache `aeon-promotion-test-v5`.
