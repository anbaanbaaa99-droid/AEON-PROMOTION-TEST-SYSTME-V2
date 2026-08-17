# AEON Learning CMS v5.6

Versi ini melanjutkan v5.5 dengan fokus **maintenance materi tanpa edit Code.gs**, role admin yang terpisah, draft/publish/versioning, dan konten visual yang tetap ringan untuk peserta HP.

## Fitur baru

- Role: **SuperAdmin**, **ContentAdmin**, **Trainer**, **User**.
- Akun `ADMIN` utama dimigrasikan menjadi **SuperAdmin**.
- Menu Admin memiliki prioritas:
  1. Peserta / approval & monitoring
  2. Materi
  3. Soal
  4. Peran
- Materi memiliki **Draft -> Preview -> Publish**.
- Perubahan draft tidak mengubah materi yang sedang dibaca peserta sampai tombol **Publish** ditekan.
- Riwayat versi disimpan pada sheet `ModuleVersions` dan dapat di-rollback.
- Editor materi mendukung:
  - judul bagian
  - paragraf
  - bullet
  - subjudul
  - highlight
  - formula
  - gambar via URL/path
  - embed PPT/Google Slides/dokumen via URL
- Embed bersifat **click-to-load**. Iframe tidak dimuat saat halaman peserta dibuka.
- Gambar memakai `loading="lazy"` dan `decoding="async"`.
- Soal bisa ditambah/edit/aktif-nonaktif dari web oleh SuperAdmin/ContentAdmin.
- SuperAdmin dapat mengubah role akun.
- Credit scene `CREATED BY FINH.` ditambahkan secara ringan di bagian bawah aplikasi.

## Permission

| Role | Belajar | Approval/Monitoring | Materi & Soal | Kelola Role |
|---|---:|---:|---:|---:|
| SuperAdmin | Ya | Ya | Ya | Ya |
| ContentAdmin | Ya | Tidak | Ya | Tidak |
| Trainer | Ya | Ya | Tidak | Tidak |
| User | Ya | Tidak | Tidak | Tidak |

## Upgrade dari v5.5

1. Backup Google Sheet dan Apps Script terlebih dahulu.
2. Replace seluruh isi `Code.gs` dengan file v5.6.
3. `Security.gs` tetap berupa file kosong/komentar dari paket ini.
4. Save project.
5. Jalankan `setupSystem()` **sekali**.
6. Jalankan `upgradeLearningCmsV56()` **sekali**. Fungsi ini aman dijalankan ulang, tetapi satu kali sudah cukup.
7. Jalankan `testAdminSession()` untuk memastikan login/session backend normal.
8. Deploy -> Manage deployments -> Edit -> **New version** -> Deploy.
9. Upload frontend v5.6 ke GitHub Pages.
10. Refresh browser. Indikator login harus menampilkan `Server terhubung · v5.6.0`.

## Sheet baru / kolom baru

`setupSystem()` otomatis menambah kolom yang belum ada. Data lama tidak dihapus.

### Modules
Konten yang digunakan peserta tetap berada di `ContentJSON`.
Draft disimpan terpisah pada `DraftJSON` beserta metadata draft. Ini mencegah edit admin memengaruhi peserta sebelum publish.

### ModuleVersions
Snapshot setiap versi published.

### Questions
Ditambah metadata `UpdatedBy` dan `UpdatedAt`.

## Materi AEON Foundational Ideal

Versi v5.6 **tidak memaksakan perubahan isi Prinsip Dasar** karena versi terbaru masih menunggu konfirmasi pembuat materi. Konten yang sudah ada tetap menjadi versi published saat ini. Setelah materi resmi diterima:

1. Login sebagai SuperAdmin / ContentAdmin.
2. Admin -> Materi -> AEON Foundational Ideal -> Edit materi.
3. Perbarui draft.
4. Preview.
5. Perbarui soal di tab Soal.
6. Publish setelah terverifikasi.

Dengan alur ini perubahan materi berikutnya tidak memerlukan edit `Code.gs`.

## Gambar, PPT, PDF, dan dokumen

### Gambar
Editor saat ini menggunakan **URL/path gambar**, misalnya:

`assets/media/figure-2.webp`

atau URL HTTPS yang dapat diakses peserta.

Untuk performance, gunakan WebP/JPEG terkompresi dan jangan memasukkan gambar resolusi berlebihan.

### PPT / Google Slides / dokumen
Gunakan blok **Embed PPT/Doc** dan masukkan URL embed/share yang dapat diakses peserta. Di halaman peserta media **tidak langsung dimuat**. Peserta harus menekan tombol untuk memuat iframe.

Jika provider menolak iframe, tombol `Buka tab baru` tetap tersedia.

### PDF
PDF modul utama tetap menggunakan mekanisme lazy/click-to-load yang sudah ada.

> Upload file langsung dari editor ke Google Drive belum diaktifkan pada v5.6. Hal ini sengaja dipisahkan agar permission Drive dan upload file tidak menambah kompleksitas/kinerja pada alur peserta. Jika diperlukan, fitur upload Drive dapat dibuat khusus untuk admin pada versi berikutnya tanpa menambah beban frontend peserta.

## Performance

Fitur CMS hanya meminta data ketika user membuka menu Admin. User peserta tidak mengunduh library editor atau framework tambahan karena editor dibuat dengan JavaScript/CSS native.

- Tidak ada framework UI baru.
- Tidak ada webfont eksternal.
- Tidak ada library drag-and-drop.
- Reorder section/blok menggunakan tombol naik/turun yang lebih ringan dan mobile-friendly.
- Embed click-to-load.
- Gambar lazy-load.
- PDF tidak dimasukkan ke CacheStorage Service Worker.
- `config.js` selalu network fresh.

## Admin default

- ID: `ADMIN`
- Password mengikuti `APP.DEFAULT_ADMIN_PASSWORD` di `Code.gs`.

Jika password perlu disamakan ulang setelah mengganti constant, jalankan `resetAdminPassword()`.
