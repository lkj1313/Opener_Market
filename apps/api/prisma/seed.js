require('dotenv/config');

const {
  PrismaClient,
  Role,
  UserStatus,
} = require('../dist/src/generated/prisma/client.js');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@opener.market' },
  });

  if (!existing) {
    const passwordHash = await bcrypt.hash('admin1234', 10);

    await prisma.user.create({
      data: {
        email: 'admin@opener.market',
        nickname: '시스템 관리자',
        passwordHash,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        isSuperAdmin: true,
      },
    });
    console.log('Super Admin created: admin@opener.market');
  } else {
    console.log('Super Admin already exists');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
