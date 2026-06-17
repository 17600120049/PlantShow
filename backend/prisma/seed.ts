import { PrismaClient, PlantListStatus, PlantStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DONATE_POINTS = 10;

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { openid: 'dev-user-openid' },
    update: { nickname: '叶子先生' },
    create: {
      openid: 'dev-user-openid',
      nickname: '叶子先生',
      avatar: null,
      city: '杭州',
      points: 0,
    },
  });

  const stations = [
    {
      id: 1,
      stationCode: 'ST-001',
      name: '城市根系驿站',
      address: '杭州市余杭区良渚街道好运街99号',
      hours: '09:00-20:00',
      phone: '0571 8723 5456',
      imageEmoji: '🏡',
    },
    {
      id: 2,
      stationCode: 'ST-002',
      name: '自丛驿站',
      address: '杭州市西湖区转塘街道象山艺术公社21号',
      hours: '10:00-19:00',
      phone: '0571 8675 3210',
      imageEmoji: '🌿',
    },
    {
      id: 3,
      stationCode: 'ST-003',
      name: '绿野中转站',
      address: '杭州市拱墅区运河上街购物中心B1层',
      hours: '10:00-22:00',
      phone: '0571 8899 1234',
      imageEmoji: '🌱',
    },
  ];

  for (const station of stations) {
    await prisma.station.upsert({
      where: { id: station.id },
      update: station,
      create: station,
    });
  }

  const seedPlants = [
    {
      plantCode: 'PW-000001',
      name: '鹿角蕨 OMG',
      species: '蕨类',
      imageEmoji: '🌿',
      stationId: 1,
      listedAt: new Date('2024-05-21'),
    },
    {
      plantCode: 'PW-000002',
      name: '龙舌兰 蓝鲸',
      species: '多肉',
      imageEmoji: '🌵',
      stationId: 2,
      listedAt: new Date('2024-05-18'),
    },
    {
      plantCode: 'PW-000003',
      name: '龟背竹',
      species: '观叶',
      imageEmoji: '🍃',
      stationId: 1,
      listedAt: new Date('2024-05-15'),
    },
    {
      plantCode: 'PW-000004',
      name: '观音莲',
      species: '多肉',
      imageEmoji: '🪴',
      stationId: 3,
      listedAt: new Date('2024-05-14'),
    },
  ];

  for (const plant of seedPlants) {
    await prisma.plant.upsert({
      where: { plantCode: plant.plantCode },
      update: {
        name: plant.name,
        species: plant.species,
        imageEmoji: plant.imageEmoji,
        stationId: plant.stationId,
        listStatus: PlantListStatus.AVAILABLE,
        listedAt: plant.listedAt,
        status: PlantStatus.ACTIVE,
      },
      create: {
        plantCode: plant.plantCode,
        name: plant.name,
        species: plant.species,
        source: 'donation',
        breederId: demoUser.id,
        currentOwnerId: demoUser.id,
        status: PlantStatus.ACTIVE,
        listStatus: PlantListStatus.AVAILABLE,
        stationId: plant.stationId,
        imageEmoji: plant.imageEmoji,
        listedAt: plant.listedAt,
        description: '来自爱心送养',
      },
    });
  }

  console.log('✅ 种子数据初始化完成');
  console.log('📝 管理员: admin / admin123');
  console.log('👤 演示用户:', demoUser.nickname, demoUser.id);
  console.log('🏡 驿站数量:', stations.length);
  console.log('🌿 待领养植物:', seedPlants.length);
  console.log('💰 送养积分:', DONATE_POINTS, '分/株');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
