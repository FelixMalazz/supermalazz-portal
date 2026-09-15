# Product Requirement Document (PRD)
## Project: SuperMalazz Community Web App & Portal

**Version:** 2.0 (Full-Stack MVP)  
**Status:** Architecture & Development  
**Target Environment:** Node.js (Next.js App Router), PostgreSQL, Tailwind CSS, Antigravity AI Agent  
**Last Updated:** September 2026  

---

### 1. Project Overview & Background
**SuperMalazz** adalah platform web terpadu untuk server Discord komunitas tongkrongan *SuperMalazz*. Sistem ini berevolusi dari sekadar landing page statis menjadi *web application* berbasis basis data relasional.

Tujuan utama platform adalah memfasilitasi kebutuhan tongkrongan online:
* Pintu gerbang akuisisi dan onboarding member baru.
* Sistem sinkronisasi profil dan hirarki role langsung dari Discord.
* Hub penjadwalan main bareng (*mabar*) interaktif dengan sistem reservasi slot (RSVP).
* Papan pengumuman terpusat (*CMS*) yang dikelola pengurus komunitas.

---

### 2. Goals & Success Metrics

#### 2.1 Tujuan Produk
* Mengotomatisasi pemetaan peran server Discord (**CHEF**, **SIRKEL**, **MALAZZ**) ke sistem otorisasi aplikasi web.
* Menghilangkan friksi koordinasi jadwal mabar di chat Discord melalui antarmuka RSVP real-time.
* Menjaga performa loading cepat (skor Lighthouse $\ge 90$) dengan estetika kasual modern berbasis visual identity SuperMalazz.

#### 2.2 Key Performance Indicators (KPIs)
* Rasio konversi pengunjung menjadi member Discord $\ge 20\%$.
* Utilisasi fitur RSVP mabar aktif minimal 3 event per minggu.
* Zero data desync antara status role Discord dan role lokal user di PostgreSQL.

---

### 3. Brand & Visual Identity Guidelines

* **Desain UI:** Kasual, tegas, dan modern dengan sentuhan *subtle neo-brutalism* (border kontras tipis, solid block drop-shadow `4px 4px 0px #0A1128`, sudut tumpul `rounded-xl`).
* **Color Palette:**
  * **Primary Action / Red:** `#E31B23` (Tombol utama, aksen highlight, badge SIRKEL).
  * **Deep Navy:** `#0A1128` (Teks kontras, background dark section, bayangan blok).
  * **Canvas Background:** `#F8FAFC` (Light clean mode untuk halaman baca).
  * **Accent Amber / Gold:** `#F59E0B` (Badge eksklusif role CHEF).
  * **Muted Gray:** `#64748B` (Teks sekunder dan aksen role MALAZZ).
* **Tipografi:** Sans-serif modern (Google Font: *Plus Jakarta Sans*).

---

### 4. Role Hierarchy & Access Control Matrix

Sistem otorisasi (*Role-Based Access Control / RBAC*) diturunkan langsung dari status role member di Discord Guild SuperMalazz:

| Role | Posisi | Deskripsi Tongkrongan | Hak Akses di Web Portal |
| :--- | :--- | :--- | :--- |
| **CHEF** | Tier 1 (Puncak) | Admin & Founder (*The Mastermind*) | Akses penuh dashboard, publish/edit/pin/delete pengumuman, moderasi seluruh event mabar, kelola konfigurasi. |
| **SIRKEL** | Tier 2 (Inti) | Member reguler & inisiator (*The Homies*) | Membuat jadwal mabar baru, membatalkan event buatan sendiri, RSVP slot mabar, akses filter komunitas. |
| **MALAZZ** | Tier 3 (Umum) | Basis massa santai (*The Chillers*) | Akses publik landing page, melihat jadwal mabar aktif, RSVP ke slot mabar yang terbuka. |

---

### 5. Detailed Feature Specifications

#### 5.1 Landing Page & Discord Gateway (Public View)
* **Hero Banner:** Tagline khas tongkrongan, indikator server online, dan tombol CTA utama *"Gabung SuperMalazz"*.
* **Hierarchy Showcase:** 3 kartu interaktif yang menjelaskan kultur CHEF, SIRKEL, dan MALAZZ.
* **Mabar Hub Radar:** Showcase game populer (FPS, Fighting Games, Party Games) dan ringkasan event mabar yang sedang terbuka.
* **Tongkrongan Rules:** 3 aturan dasar server (Respek sama rata, no toxic berlebihan, santai tanpa beban).

#### 5.2 Discord OAuth2 & Role Synchronization
* Autentikasi berbasis Discord OAuth2 (`identify`, `guilds.members.read`).
* Saat login berhasil:
  1. Ambil data Discord: `id`, `username`, `global_name`, `avatar`.
  2. Panggil Discord API `/guilds/{GUILD_ID}/members/{USER_ID}` untuk membaca daftar role Discord.
  3. Petakan Role ID Discord ke Enum Database:
     * Punya Role ID Admin $\rightarrow$ `role = 'CHEF'`
     * Punya Role ID Core $\rightarrow$ `role = 'SIRKEL'`
     * Tidak punya / role umum $\rightarrow$ `role = 'MALAZZ'`
  4. Simpan atau perbarui record ke tabel `users`.

#### 5.3 Mabar Hub & RSVP Engine
* **Pembuatan Event:** Hanya dapat dibuat oleh user dengan role `CHEF` atau `SIRKEL`.
  * Input: Judul, nama game, deskripsi, waktu mulai (*UTC timestamp*), dan batas kuota peserta (*max slots*).
* **Mekanisme RSVP:**
  * User mengklik *"Ikut Mabar"* $\rightarrow$ validasi kuota tersisa.
  * Jika slot masih ada, insert ke tabel `event_participants`.
  * Sistem mencegah pendaftaran ganda via constraint `UNIQUE(event_id, user_id)`.
  * Jika kuota penuh, status event otomatis berubah menjadi `FULL`.
  * Pembuat event atau admin CHEF berhak membatalkan event (`status = 'CANCELLED'`).

#### 5.4 Community Announcements (Mini CMS)
* Ruang broadcast khusus yang hanya dapat dibuat/diedit oleh role `CHEF`.
* Mendukung format Markdown untuk teks tebal, tautan, dan daftar berpoin.
* Fitur *Pinned Post* untuk info krusial yang selalu muncul di urutan paling atas.

---

### 6. Database Architecture & PostgreSQL Schema

Skema dirancang strictly-typed, mengamankan Discord Snowflake 64-bit menggunakan format string `VARCHAR(32)` agar tidak terjadi overflow integer.

```sql
-- 1. Inisialisasi Ekstensi & Enum
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('CHEF', 'SIRKEL', 'MALAZZ');
CREATE TYPE event_status AS ENUM ('OPEN', 'FULL', 'CANCELLED', 'COMPLETED');

-- 2. Tabel Users
CREATE TABLE users (
    id VARCHAR(32) PRIMARY KEY, -- Discord Snowflake ID
    username VARCHAR(64) NOT NULL,
    display_name VARCHAR(64),
    avatar VARCHAR(255),
    role user_role NOT NULL DEFAULT 'MALAZZ',
    joined_guild_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Mabar Events
CREATE TABLE mabar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    game_title VARCHAR(50) NOT NULL,
    description TEXT,
    max_slots INT NOT NULL CHECK (max_slots > 0),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status event_status DEFAULT 'OPEN',
    created_by VARCHAR(32) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Relasi RSVP Peserta
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES mabar_events(id) ON DELETE CASCADE,
    user_id VARCHAR(32) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_event_participant UNIQUE (event_id, user_id)
);

-- 5. Tabel Pengumuman / Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    author_id VARCHAR(32) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Indeks Optimalisasi Query
CREATE INDEX idx_events_scheduled ON mabar_events(scheduled_at);
CREATE INDEX idx_events_status ON mabar_events(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned, created_at DESC);