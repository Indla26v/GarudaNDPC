const fs = require('fs');
const path = require('path');

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
    console.log(`SKIP ${file} (not found)`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;

  if (content.includes("import { Request, Response } from 'express';")) {
    content = content.replace(
      "import { Request, Response } from 'express';",
      "import { Response } from 'express';\nimport { AuthRequest } from '../middleware/auth.middleware';"
    );
    count++;
  }

  const castMatches = (content.match(/\(req as any\)\.user/g) || []).length;
  if (castMatches > 0) {
    content = content.replace(/\(req as any\)\.user/g, 'req.user!');
    count += castMatches;
  }

  const sigMatches = (content.match(/req: Request/g) || []).length;
  if (sigMatches > 0) {
    content = content.replace(/req: Request/g, 'req: AuthRequest');
    count += sigMatches;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  totalReplacements += count;
  console.log(`✓ Updated ${file} (${count} changes)`);
}

console.log(`Total replacements across remaining controllers: ${totalReplacements}`);
