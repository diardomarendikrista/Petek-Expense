# Petek Expense

Aplikasi pencatat pengeluaran yang ringan, cepat, dan mengutamakan perintah suara (Voice-First). Petek Expense memungkinkanmu mencatat pengeluaran harian dalam waktu kurang dari 5 detik hanya dengan berbicara. Dirancang sebagai PWA (Progressive Web App) yang mengutamakan tampilan mobile, aplikasi ini menggunakan AI untuk secara otomatis mengubah bahasa natural (suara) menjadi data pengeluaran yang terstruktur.

## Fitur Utama

- **Pencatatan Berbasis Suara (Voice-first):** Gunakan mikrofon untuk mencatat pengeluaran (contoh: "Beli bakso dua puluh ribu rupiah").
- **Pemrosesan AI:** Secara otomatis mengkategorikan dan memformat pengeluaranmu menggunakan API Gemini atau Deepseek.
- **Dukungan PWA:** Bisa diinstal layaknya aplikasi native di Android/iOS dan mendukung penggunaan berkesinambungan tanpa perlu login berulang kali.
- **Dashboard Interaktif:** Pantau total pengeluaran hari ini, transaksi terbaru, dan ringkasan bulanan secara instan.
- **Input Manual:** Jika sedang tidak bisa berbicara, kamu selalu bisa memasukkan data pengeluaran secara manual.
- **Auto-Backup ke Google Drive:** Data aman secara otomatis dicadangkan ke Google Drive setiap jam 5 pagi.

## Teknologi (Tech Stack)

- Next.js (App Router)
- Tailwind CSS v4 & Framer Motion
- Prisma & PostgreSQL
- NextAuth.js (Autentikasi Email/Password) dengan sesi non-expiring
- Web Speech API + Pemrosesan AI (Gemini / Deepseek)
- PM2 (Deployment & Manajemen Proses Pekerja)

## Cara Instalasi (Pengembangan Lokal)

1. **Kloning & Instal Dependensi**
   ```bash
   npm install
   ```

2. **Pengaturan Variabel Lingkungan**
   Salin file `.env.example` menjadi `.env` lalu sesuaikan isinya:
   - Atur URL koneksi PostgreSQL.
   - Atur variabel `PORT` yang diinginkan (misal `4019`)
   - Pilih dan masukkan salah satu API Key AI (Gemini atau Deepseek).
   - Isi konfigurasi OAuth2 Google Drive untuk fitur *auto-backup*.

3. **Migrasi Database**
   Pastikan PostgreSQL sudah berjalan, lalu jalankan perintah:
   ```bash
   npx prisma db push
   ```

4. **Isi Data Awal (Opsional - Seeding)**
   ```bash
   npx prisma db seed
   ```

5. **Jalankan Server Lokal**
   ```bash
   npm run dev
   ```

6. Buka URL sesuai port yang dikonfigurasi (contoh: `http://localhost:4019`) di browsermu.

---

## Panduan Server / Production (Deployment)

Aplikasi ini dilengkapi dengan skrip otomatisasi untuk deployment di lingkungan Windows/Linux yang menggunakan **PM2**.

### Menjalankan Deployment
Cukup jalankan file `deploy.bat` (untuk Windows) di dalam servermu. Skrip ini akan otomatis:
1. Menarik kode terbaru dari Git (Git Pull).
2. Mematikan proses PM2 lama (menghindari error *file lock* pada Prisma).
3. Menginstal dependensi NPM terbaru.
4. Memperbarui skema database (Prisma db push).
5. Membangun ulang (Build) proyek Next.js.
6. Menyalakan kembali **aplikasi utama** dan **proses auto-backup** secara otomatis.

*Jika aplikasinya sudah berjalan dan kamu hanya ingin menyalakan fitur backup saja secara manual:*
```bash
pm2 start npm --name "petek-expense-backup" -- run backup
pm2 save
```

---

## Manajemen Data (Backup & Restore)

Aplikasi ini dilengkapi dengan fitur pencadangan (backup) otomatis ke Google Drive dan pemulihan (restore) data yang sangat mudah digunakan.

### Mekanisme Auto-Backup
Setiap hari pada pukul **05:00 WIB**, proses worker `petek-expense-backup` akan berjalan di latar belakang:
- Mengekstrak semua data (User & Expense) menjadi file JSON tunggal.
- Mengunggah file tersebut secara otomatis ke folder Google Drive yang ditentukan.
- Memindai dan menghapus file backup lama yang sudah berumur lebih dari **30 hari** secara otomatis untuk menghemat ruang cloud storage kamu.

### Prosedur Pemulihan (Restore) Data
Jika terjadi perpindahan server atau kerusakan database, kamu bisa memulihkan datamu dengan cepat melalui cara berikut:
1. Unduh file backup terbaru berformat JSON dari folder Google Drive kamu.
2. Ganti nama file yang diunduh tersebut menjadi persis: **`backup.json`**.
3. Pindahkan file `backup.json` ke **folder paling luar / root** proyek (sejajar dengan file `package.json` dan `.env`).
4. Buka terminal di folder proyek, lalu jalankan perintah ini:
   ```bash
   npm run restore
   ```
5. Skrip akan secara cerdas memulihkan semua data User dan Expense secara berurutan. Skrip ini dilengkapi proteksi `skipDuplicates: true`, sehingga jika ada data lama yang sudah terlanjur ada di *database*, ia tidak akan tertimpa/menjadi ganda.

---

## Testing

Untuk keperluan pengujian (setelah menjalankan `npm run dev`), kamu dapat login menggunakan akun *seed* bawaan:
- **Email:** test@example.com
- **Password:** password123
