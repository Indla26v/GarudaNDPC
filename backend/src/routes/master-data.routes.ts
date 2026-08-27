/**
 * GARUDA — Master Data API Routes
 *
 * Serves states, districts, and mandals/sub-districts from
 * the government reference tables for cascading dropdowns.
 */
import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

// In-memory cache for fast responses (master data changes very rarely)
let statesCache: any[] | null = null;
let districtsByState: Map<number, any[]> = new Map();
let mandalsByDistrict: Map<number, any[]> = new Map();

// ── GET /api/master/states ──────────────────────────────────────────────
router.get('/states', async (_req: Request, res: Response) => {
  try {
    if (!statesCache) {
      statesCache = await prisma.mst_states.findMany({
        orderBy: { state_name: 'asc' },
        select: { state_code: true, state_name: true, state_ut: true },
      });
    }
    res.json(statesCache);
  } catch (err) {
    console.error('Error fetching states:', err);
    res.status(500).json({ message: 'Failed to fetch states' });
  }
});

// ── GET /api/master/districts?state_code=28 ─────────────────────────────
router.get('/districts', async (req: Request, res: Response) => {
  try {
    const stateCode = parseInt(req.query.state_code as string, 10);
    if (isNaN(stateCode)) {
      return res.status(400).json({ message: 'state_code query parameter is required' });
    }

    if (!districtsByState.has(stateCode)) {
      const districts = await prisma.mst_districts.findMany({
        where: { state_code: stateCode },
        orderBy: { district_name: 'asc' },
        select: { district_code: true, district_name: true, state_code: true },
      });
      districtsByState.set(stateCode, districts);
    }

    res.json(districtsByState.get(stateCode));
  } catch (err) {
    console.error('Error fetching districts:', err);
    res.status(500).json({ message: 'Failed to fetch districts' });
  }
});

// ── GET /api/master/mandals?district_code=523 ───────────────────────────
router.get('/mandals', async (req: Request, res: Response) => {
  try {
    const districtCode = parseInt(req.query.district_code as string, 10);
    if (isNaN(districtCode)) {
      return res.status(400).json({ message: 'district_code query parameter is required' });
    }

    if (!mandalsByDistrict.has(districtCode)) {
      const mandals = await prisma.mst_mandals.findMany({
        where: { district_code: districtCode },
        orderBy: { mandal_name: 'asc' },
        select: { mandal_code: true, mandal_name: true, district_code: true },
      });
      mandalsByDistrict.set(districtCode, mandals);
    }

    res.json(mandalsByDistrict.get(districtCode));
  } catch (err) {
    console.error('Error fetching mandals:', err);
    res.status(500).json({ message: 'Failed to fetch mandals' });
  }
});

export default router;
