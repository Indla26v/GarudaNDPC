/**
 * GARUDA — Master Data Seeder
 *
 * Populates mst_states, mst_districts, and mst_mandals tables
 * from the official government reference Excel files in /docs.
 *
 * Usage: npx ts-node prisma/seed-master-data.ts
 */
import * as XLSX from 'xlsx';
import path from 'path';
import prisma from '../src/config/prisma';

interface StateRow {
  slno: number;
  state_code: number;
  state_name: string;
  state_ut: string;
}

interface DistrictRow {
  slno: number;
  state_code: number;
  district_code: number;
  district_name: string;
}

interface MandalRow {
  slno: number;
  state_code: number;
  district_code: number;
  subdt_mandal_code: number;
  subdt_mandal: string;
}

function readExcel<T>(filename: string): T[] {
  const filePath = path.resolve(__dirname, '..', '..', 'docs', filename);
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0] as string;
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<T>(ws!);
}

async function main() {
  console.log('[GARUDA SEED] Starting master data import...');

  // ── 1. States ──
  const states = readExcel<StateRow>('mst_state.csv.xlsx');
  console.log(`[GARUDA SEED] Importing ${states.length} states/UTs...`);

  for (const s of states) {
    await prisma.mst_states.upsert({
      where: { state_code: s.state_code },
      create: {
        state_code: s.state_code,
        state_name: s.state_name.trim(),
        state_ut: s.state_ut.trim(),
      },
      update: {
        state_name: s.state_name.trim(),
        state_ut: s.state_ut.trim(),
      },
    });
  }
  console.log(`[GARUDA SEED] ✓ ${states.length} states/UTs upserted.`);

  // ── 2. Districts ──
  const districts = readExcel<DistrictRow>('mst_district.csv.xlsx');
  console.log(`[GARUDA SEED] Importing ${districts.length} districts...`);

  // Batch upsert in chunks for performance
  const CHUNK_SIZE = 100;
  for (let i = 0; i < districts.length; i += CHUNK_SIZE) {
    const chunk = districts.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map((d) =>
        prisma.mst_districts.upsert({
          where: { district_code: d.district_code },
          create: {
            district_code: d.district_code,
            state_code: d.state_code,
            district_name: d.district_name.trim(),
          },
          update: {
            state_code: d.state_code,
            district_name: d.district_name.trim(),
          },
        })
      )
    );
  }
  console.log(`[GARUDA SEED] ✓ ${districts.length} districts upserted.`);

  // ── 3. Mandals ──
  const mandals = readExcel<MandalRow>('mst_subdt_mandal.csv.xlsx');
  console.log(`[GARUDA SEED] Importing ${mandals.length} mandals/sub-districts...`);

  for (let i = 0; i < mandals.length; i += CHUNK_SIZE) {
    const chunk = mandals.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map((m) =>
        prisma.mst_mandals.upsert({
          where: { mandal_code: m.subdt_mandal_code },
          create: {
            mandal_code: m.subdt_mandal_code,
            district_code: m.district_code,
            mandal_name: m.subdt_mandal.trim(),
          },
          update: {
            district_code: m.district_code,
            mandal_name: m.subdt_mandal.trim(),
          },
        })
      )
    );
    if ((i + CHUNK_SIZE) % 1000 === 0 || i + CHUNK_SIZE >= mandals.length) {
      console.log(`[GARUDA SEED]   ... ${Math.min(i + CHUNK_SIZE, mandals.length)} / ${mandals.length} mandals`);
    }
  }
  console.log(`[GARUDA SEED] ✓ ${mandals.length} mandals/sub-districts upserted.`);

  // ── Summary ──
  const stateCount = await prisma.mst_states.count();
  const districtCount = await prisma.mst_districts.count();
  const mandalCount = await prisma.mst_mandals.count();

  console.log('\n[GARUDA SEED] ═══════════════════════════════════════');
  console.log(`[GARUDA SEED]   States/UTs:     ${stateCount}`);
  console.log(`[GARUDA SEED]   Districts:      ${districtCount}`);
  console.log(`[GARUDA SEED]   Mandals:        ${mandalCount}`);
  console.log('[GARUDA SEED] ═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('[GARUDA SEED] Fatal error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
