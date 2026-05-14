const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const plainPassword = '123456';

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`User "${username}" already exists (id=${existing.id}). Skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      fullName: 'Administrator',
      role: 'admin',
    },
  });

  console.log(`Seeded admin user (id=${user.id}, username=${user.username}).`);
  console.log('Default password: 123456 — change this in production.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
