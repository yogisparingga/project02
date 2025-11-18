# Sistem Ujian Online

Platform ujian online lengkap dengan manajemen soal, AI generation, face recognition, ranking system, dan sertifikat digital.

## ✨ Fitur Utama

### 🎯 Untuk Admin
- **Manajemen Kategori Soal** - Atur kategori seperti TIU, TWK, TKP, Teknis, Manajerial, dll
- **Bank Soal Lengkap** - Buat, edit, dan import soal dalam 3 format (Multiple Choice, Essay, Linear Scale 1-5)
- **Import/Export Soal** - Upload soal dalam format Excel/CSV
- **Paket Ujian** - Buat paket ujian dengan multiple kategori (contoh: CPNS = TIU+TWK+TKP)
- **AI Question Generator** - Generate soal otomatis menggunakan OpenAI
- **Face Verification Dashboard** - Monitor verifikasi wajah peserta

### 👥 Untuk Peserta/Member
- **Dashboard Peserta** - Lihat progres dan statistik personal
- **Ambil Ujian** - Interface ujian yang user-friendly dengan timer
- **Session Persistence** - Lanjutkan ujian meski browser tertutup
- **Face Verification** - Verifikasi wajah saat ujian berlangsung
- **Ranking System** - Lihat peringkat per sesi dan global
- **Sertifikat Digital** - Download sertifikat untuk ujian yang lulus

## 🛠️ Tech Stack

- Next.js 14, React, TypeScript, Tailwind CSS
- MySQL + Prisma ORM
- NextAuth.js
- OpenAI API (GPT-4)

## 📋 Prerequisites

- Node.js 18+
- MySQL 8.0+
- OpenAI API Key (opsional)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MySQL Database

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE online_exam_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Konfigurasi Environment

Copy `.env.example` ke `.env`:

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/online_exam_db"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."  # Opsional
```

### 4. Setup Database Schema

```bash
npx prisma generate
npx prisma db push
```

### 5. Buat Admin User

```bash
npx prisma studio
```

Buka http://localhost:5555, masuk ke table `User`, dan buat user dengan:
- name: Admin
- email: admin@example.com
- password: (hash dari "admin123" menggunakan bcrypt)
- role: ADMIN

### 6. Run Development Server

```bash
npm run dev
```

Buka http://localhost:3000

## 📝 Format Import Soal (CSV/Excel)

```csv
question,type,option_a,option_b,option_c,option_d,option_e,correct_answer,points
"2+2=?",MULTIPLE_CHOICE,3,4,5,6,7,1,1
"Jelaskan demokrasi",ESSAY,,,,,,,1
"Seberapa setuju?",LINEAR_SCALE,,,,,3,1
```

## 🎓 Penggunaan

### Admin:
1. Login → Buat Kategori → Tambah Soal (manual/import/AI)
2. Buat Paket Ujian dengan multiple kategori
3. Publish ujian → Monitor peserta

### Peserta:
1. Register → Login → Pilih Ujian
2. Mulai ujian → Kerjakan soal → Submit
3. Lihat ranking & download sertifikat

## 🔧 Troubleshooting

**MySQL Connection Error:**
```bash
# Cek MySQL service
sudo service mysql start

# Periksa DATABASE_URL di .env
```

**Prisma Error:**
```bash
npx prisma generate
npx prisma db push
```

## 📚 Dokumentasi Lengkap

Lihat dokumentasi lengkap untuk:
- API Endpoints
- Database Schema
- Security Features
- Production Deployment

## 📄 License

MIT License

---

**Dibuat dengan ❤️ menggunakan Next.js & MySQL**
