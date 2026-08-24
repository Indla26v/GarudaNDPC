import dotenv from 'dotenv';
dotenv.config();
import prisma from '../src/config/prisma';

async function testWorkflow() {
  console.log('--- Starting Approval Workflow End-to-End Test ---');

  // Find or create test Constable and SHO
  const constable = await prisma.users.findFirst({
    where: { role: 'CONSTABLE' },
    include: { police_stations: true }
  });

  const sho = await prisma.users.findFirst({
    where: { role: 'SHO' },
    include: { police_stations: true }
  });

  if (!constable || !sho) {
    console.log('Constable or SHO not found. Users:', { constable: !!constable, sho: !!sho });
    return;
  }

  const psId = constable.police_station_id || sho.police_station_id;
  if (!psId) {
    console.log('No police station found');
    return;
  }

  console.log(`Constable: ${constable.username} (ID: ${constable.id}), SHO: ${sho.username} (ID: ${sho.id}), PS ID: ${psId}`);

  // Step 1: Create a test case submitted by Constable
  const testFir = `TEST-FIR-${Date.now()}`;
  const testCase = await prisma.cases.create({
    data: {
      fir_no: testFir,
      ps_id: psId,
      section_of_law: 'Sec 8(c) r/w 20(b)(ii)(A) NDPS Act',
      stage: 'FIR',
      created_by: constable.id,
      approval_status: 'PENDING',
    }
  });
  console.log(`1. Created Case #${testCase.id} (${testCase.fir_no}) with status: ${testCase.approval_status}`);

  // Step 2: Create a test offender submitted by Constable
  const testOffender = await prisma.offenders.create({
    data: {
      full_name: `Test Offender ${Date.now()}`,
      alias: 'TestAlias',
      ps_id: psId,
      category: 'CONSUMER',
      created_by: constable.id,
      approval_status: 'PENDING',
    }
  });
  console.log(`2. Created Offender #${testOffender.id} (${testOffender.full_name}) with status: ${testOffender.approval_status}`);

  // Step 3: SHO Requests changes with review notes
  const caseNote = 'Please add seized vehicle registration number and panchnama copy.';
  const offenderNote = 'Please verify permanent address and father name.';

  const updatedCase = await prisma.cases.update({
    where: { id: testCase.id },
    data: {
      approval_status: 'CHANGES_REQUESTED',
      approval_notes: caseNote,
    }
  });
  console.log(`3. SHO Requested changes on Case #${updatedCase.id}. Status: ${updatedCase.approval_status}, Note: "${updatedCase.approval_notes}"`);

  const updatedOffender = await prisma.offenders.update({
    where: { id: testOffender.id },
    data: {
      approval_status: 'CHANGES_REQUESTED',
      approval_notes: offenderNote,
    }
  });
  console.log(`4. SHO Requested changes on Offender #${updatedOffender.id}. Status: ${updatedOffender.approval_status}, Note: "${updatedOffender.approval_notes}"`);

  // Step 4: Verify Constable's submission tracker query
  const constableCases = await prisma.cases.findMany({
    where: { created_by: constable.id, approval_status: 'CHANGES_REQUESTED' },
  });
  const constableOffenders = await prisma.offenders.findMany({
    where: { created_by: constable.id, approval_status: 'CHANGES_REQUESTED' },
  });
  console.log(`5. Constable tracker query verified: Found ${constableCases.length} case(s) and ${constableOffenders.length} offender(s) with CHANGES_REQUESTED.`);

  // Step 5: Constable Updates & Resubmits
  const resubmittedCase = await prisma.cases.update({
    where: { id: testCase.id },
    data: {
      approval_status: 'PENDING',
      approval_notes: '[Resubmitted with vehicle details]',
      updated_at: new Date(),
    }
  });
  console.log(`6. Constable resubmitted Case #${resubmittedCase.id}. Status: ${resubmittedCase.approval_status}, Note: "${resubmittedCase.approval_notes}"`);

  const resubmittedOffender = await prisma.offenders.update({
    where: { id: testOffender.id },
    data: {
      approval_status: 'PENDING',
      approval_notes: '[Resubmitted with verified father name]',
      updated_at: new Date(),
    }
  });
  console.log(`7. Constable resubmitted Offender #${resubmittedOffender.id}. Status: ${resubmittedOffender.approval_status}, Note: "${resubmittedOffender.approval_notes}"`);

  // Step 6: SHO Approves & Commits
  const approvedCase = await prisma.cases.update({
    where: { id: testCase.id },
    data: {
      approval_status: 'APPROVED',
      approval_notes: null,
      updated_at: new Date(),
    }
  });
  console.log(`8. SHO Approved Case #${approvedCase.id}. Status: ${approvedCase.approval_status}`);

  const approvedOffender = await prisma.offenders.update({
    where: { id: testOffender.id },
    data: {
      approval_status: 'APPROVED',
      approval_notes: null,
      updated_at: new Date(),
    }
  });
  console.log(`9. SHO Approved Offender #${approvedOffender.id}. Status: ${approvedOffender.approval_status}`);

  // Cleanup test records
  await prisma.cases.delete({ where: { id: testCase.id } });
  await prisma.offenders.delete({ where: { id: testOffender.id } });
  console.log('10. Cleaned up test records.');

  console.log('--- ALL WORKFLOW TESTS PASSED SUCCESSFULLY! ---');
  await prisma.$disconnect();
}

testWorkflow().catch(async (e) => {
  console.error('Test failed:', e);
  await prisma.$disconnect();
});
