import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('YOUR_PASSWORD_HERE')) {
    console.error('❌ DATABASE_URL belum dikonfigurasi dengan benar di .env!');
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log('🌱 Menyiapkan data awal SuperMalazz...');

  // 1. Seed Users
  const chef = await prisma.user.upsert({
    where: { id: '10001' },
    update: {},
    create: {
      id: '10001',
      username: 'ChefMaster',
      displayName: 'Bang Chef (Founder)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'CHEF',
    },
  });

  const sirkel = await prisma.user.upsert({
    where: { id: '10002' },
    update: {},
    create: {
      id: '10002',
      username: 'BroSirkel',
      displayName: 'Bro Sirkel (Core Member)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'SIRKEL',
    },
  });

  const malazz = await prisma.user.upsert({
    where: { id: '10003' },
    update: {},
    create: {
      id: '10003',
      username: 'KawanMalazz',
      displayName: 'Kawan Malazz (Chiller)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: 'MALAZZ',
    },
  });

  console.log('✅ User seeded:', { chef: chef.username, sirkel: sirkel.username, malazz: malazz.username });

  // 2. Seed Announcements (only if empty)
  const annCount = await prisma.announcement.count();
  if (annCount === 0) {
    await prisma.announcement.create({
      data: {
        title: '📢 Regulasi Server & Welcome to SuperMalazz 2.0! 🎉',
        content: `Halo semua warga tongkrongan **SuperMalazz**!\n\nPortal resmi komunitas kita akhirnya resmi mengudara! Di sini kalian bisa melihat hirarki peran (**CHEF**, **SIRKEL**, **MALAZZ**), galeri momen mabar, dan berita seputar server Discord.\n\n*Rule nomor 1:* **Respek sesama warga tongkrongan!** Jaga vibes santai dan no toxic berlebihan.`,
        category: 'PENTING',
        isPinned: true,
        authorId: chef.id,
      },
    });

    await prisma.announcement.create({
      data: {
        title: '🎮 Turnamen Akhir Pekan: SuperMalazz Party Games Cup',
        content: `Siap-siap buat turnamen fun party games Sabtu malam ini! Hadiah menarik buat pemenang dan badge eksklusif di server Discord. Registrasi slot akan segera dikoordinasikan oleh para **SIRKEL**! Pantau terus hub kita ya guys!`,
        category: 'TURNAMEN',
        isPinned: false,
        authorId: chef.id,
      },
    });

    await prisma.announcement.create({
      data: {
        title: '🔧 Maintenance Bot Musik & Optimalisasi Bitrate Voice Server',
        content: `Kami telah mengupdate bot musik server dan meningkatkan bitrate audio menjadi 384kbps di seluruh channel voice agar suara jernih dan bebas latency saat mabar intens!`,
        category: 'UPDATE',
        isPinned: false,
        authorId: chef.id,
      },
    });

    await prisma.announcement.create({
      data: {
        title: '☕ Sesi Nongkrong Bebas & Review Game Indie',
        content: `Malam ini mulai jam 20:30 WIB ada sesi chill ngobrol santai di Voice Channel #tongkrongan-santai. Bawa kopi dan camilan favorit lo, terbuka buat seluruh role baik member lama maupun yang baru join!`,
        category: 'SANTAI',
        isPinned: false,
        authorId: chef.id,
      },
    });

    console.log('✅ 4 Pengumuman kategori berhasil dibuat di database.');
  }

  // 3. Seed Moments (only if empty)
  const momCount = await prisma.moment.count();
  if (momCount === 0) {
    await prisma.moment.create({
      data: {
        title: '🏆 Juara 1 Turnamen Fun Cup SuperMalazz Season 1',
        description: 'Pertandingan sengit 5 ronde party games di malam minggu! Pemenang dapet role eksklusif dan selamat buat tim Bang Chef!',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
        category: 'TOURNAMENT',
        likes: 42,
        authorId: chef.id,
      },
    });

    await prisma.moment.create({
      data: {
        title: '💥 Momen Clutch 1v4 Valorant di Overtime 13-12!',
        description: 'Jantung mau copot pas sisa 1 orang lawan 4 di map Ascent. Defuse bom di detik 0.02, teriak bareng di voice channel!',
        imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
        category: 'MABAR',
        likes: 38,
        authorId: sirkel.id,
      },
    });

    await prisma.moment.create({
      data: {
        title: '🍿 Nobar Film Horor Tengah Malam di Voice #nonton-I',
        description: 'Niatnya nonton bareng santai, endingnya pada parno pas jump scare bareng 15 orang di voice channel sampai subuh.',
        imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&auto=format&fit=crop&q=80',
        category: 'VOICE',
        likes: 29,
        authorId: malazz.id,
      },
    });

    console.log('✅ 3 Momen galeri berhasil dibuat di database.');
  }

  console.log('🎉 Seeding selesai dengan sukses!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
