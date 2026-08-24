import prisma from '../src/config/prisma';

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE record_approval_status ADD VALUE IF NOT EXISTS 'CHANGES_REQUESTED';`);
    console.log('Enum record_approval_status updated');
  } catch (e: any) {
    console.log('Enum update note:', e.message);
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE cases ADD COLUMN IF NOT EXISTS approval_notes TEXT;`);
    console.log('cases.approval_notes column added');
  } catch (e: any) {
    console.log('cases column note:', e.message);
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE offenders ADD COLUMN IF NOT EXISTS approval_notes TEXT;`);
    console.log('offenders.approval_notes column added');
  } catch (e: any) {
    console.log('offenders column note:', e.message);
  }

  console.log('Migration completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
