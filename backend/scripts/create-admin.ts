import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME?.trim() || 'KhateJao Admin';
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.role !== 'ADMIN') {
    throw new Error('A non-admin user already exists with that email');
  }

  const admin = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash: await hash(password, 12) },
    create: {
      name,
      email,
      passwordHash: await hash(password, 12),
      role: 'ADMIN',
    },
    select: { id: true, name: true, email: true, role: true },
  });

  console.log(`Admin account ready: ${admin.email}`);
}

main()
  .finally(() => prisma.$disconnect())
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
