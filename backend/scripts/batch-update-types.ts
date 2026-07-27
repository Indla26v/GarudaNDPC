/**
 * Batch-update remaining controllers to use AuthRequest.
 * Run with: npx ts-node scripts/batch-update-types.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');

const filesToUpdate = [
  'auth.controller.ts',
  'admin.controller.ts',
  'case-lifecycle.controller.ts',
  'deletion.controller.ts',
  'edit-request.controller.ts',
  'export.controller.ts',
  'imei.controller.ts',
  'informers.controller.ts',
  'intelligence.controller.ts',
  'police-station.controller.ts',
  'reports.controller.ts',
  'settings.controller.ts',
  'sse.controller.ts',
  'team.controller.ts',
  'vehicles.controller.ts',
];

let totalReplacements = 0;

for (const file of filesToUpdate) {
  const filePath = path.join(controllersDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP ${file} (not found)`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let replacements = 0;

  // 1. Replace "import { Request, Response } from 'express';"
  //    with "import { Response } from 'express';\nimport { AuthRequest } from '../middleware/auth.middleware';"
  if (content.includes("import { Request, Response } from 'express';")) {
    content = content.replace(
      "import { Request, Response } from 'express';",
      "import { Response } from 'express';\nimport { AuthRequest } from '../middleware/auth.middleware';"
    );
    replacements++;
  }

  // 2. Replace all "(req as any).user" with "req.user!"
  const castCount = (content.match(/\(req as any\)\.user/g) || []).length;
  content = content.replace(/\(req as any\)\.user/g, 'req.user!');
  replacements += castCount;

  // 3. Replace all "req: Request" with "req: AuthRequest" (in function signatures)
  const sigCount = (content.match(/req: Request/g) || []).length;
  content = content.replace(/req: Request/g, 'req: AuthRequest');
  replacements += sigCount;

  fs.writeFileSync(filePath, content, 'utf8');
  totalReplacements += replacements;
  console.log(`  ✓ ${file}: ${replacements} replacements`);
}

console.log(`\nDone. Total replacements: ${totalReplacements}`);
