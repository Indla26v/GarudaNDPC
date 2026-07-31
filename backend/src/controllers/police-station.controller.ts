import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { successResponse } from '../utils/transformers';

export const getAllPoliceStations = async (req: AuthRequest, res: Response) => {
  try {
    const stations = await prisma.police_stations.findMany({
      where: {
        AND: [
          { station_type: { not: 'EXCISE' } },
          { NOT: { name: { contains: 'Excise', mode: 'insensitive' } } },
          { NOT: { ps_code: { startsWith: 'EX-', mode: 'insensitive' } } }
        ]
      },
      orderBy: { name: 'asc' }
    });
    const formatted = stations.map(s => ({
      id: s.id.toString(),
      name: s.name,
      district: s.district,
      state: s.state,
      psCode: s.ps_code,
      sdpo: s.sdpo
    }));
    res.json(successResponse(formatted));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPoliceStationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const s = await prisma.police_stations.findUnique({
      where: { id: BigInt(id as string) }
    });

    if (!s) return res.status(404).json({ message: 'Police station not found' });

    res.json(successResponse({
      id: s.id.toString(),
      name: s.name,
      district: s.district,
      state: s.state,
      psCode: s.ps_code,
      sdpo: s.sdpo
    }));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
