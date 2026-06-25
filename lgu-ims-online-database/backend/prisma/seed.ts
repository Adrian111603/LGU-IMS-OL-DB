import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);

  const barangays = await Promise.all(
    [
      { name: 'Barangay Poblacion', code: 'POB', district: 'Central' },
      { name: 'Barangay San Isidro', code: 'SAN-ISIDRO', district: 'North' },
      { name: 'Barangay Mabini', code: 'MABINI', district: 'South' }
    ].map((barangay) =>
      prisma.barangay.upsert({
        where: { id: barangay.code },
        update: barangay,
        create: { id: barangay.code, ...barangay }
      })
    )
  );

  await prisma.user.upsert({
    where: { email: 'superadmin@lguims.local' },
    update: {},
    create: {
      email: 'superadmin@lguims.local',
      passwordHash,
      fullName: 'LGU IMS Super Admin',
      role: UserRole.SUPER_ADMIN
    }
  });

  await prisma.user.upsert({
    where: { email: 'municipal@lguims.local' },
    update: {},
    create: {
      email: 'municipal@lguims.local',
      passwordHash,
      fullName: 'Municipal Admin',
      role: UserRole.MUNICIPAL_ADMIN
    }
  });

  await prisma.user.upsert({
    where: { email: 'barangay@lguims.local' },
    update: {},
    create: {
      email: 'barangay@lguims.local',
      passwordHash,
      fullName: 'Barangay User',
      role: UserRole.BARANGAY_USER,
      assignedBarangayId: barangays[0].id
    }
  });

  await prisma.setting.upsert({
    where: { key: 'systemName' },
    update: { value: 'LGU IMS Online Database' },
    create: { key: 'systemName', value: 'LGU IMS Online Database' }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });

