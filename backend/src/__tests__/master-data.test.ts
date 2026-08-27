import request from 'supertest';
import express from 'express';
import masterDataRoutes from '../routes/master-data.routes';

const app = express();
app.use(express.json());
app.use('/api/master', masterDataRoutes);

describe('Master Data API Endpoints', () => {
  describe('GET /api/master/states', () => {
    it('should return a list of states and UTs', async () => {
      const res = await request(app).get('/api/master/states');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(30);

      const ap = res.body.find((s: any) => s.state_name === 'Andhra Pradesh');
      expect(ap).toBeDefined();
      expect(ap.state_code).toBe(28);
      expect(ap.state_ut).toBe('State');
    });
  });

  describe('GET /api/master/districts', () => {
    it('should return 400 if state_code is missing or invalid', async () => {
      const res = await request(app).get('/api/master/districts');
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('state_code query parameter is required');
    });

    it('should return districts for Andhra Pradesh (state_code=28)', async () => {
      const res = await request(app).get('/api/master/districts?state_code=28');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(10);

      const dist = res.body[0];
      expect(dist).toHaveProperty('district_code');
      expect(dist).toHaveProperty('district_name');
      expect(dist.state_code).toBe(28);
    });
  });

  describe('GET /api/master/mandals', () => {
    it('should return 400 if district_code is missing or invalid', async () => {
      const res = await request(app).get('/api/master/mandals');
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('district_code query parameter is required');
    });

    it('should return mandals for a valid district', async () => {
      // First get a district code for AP
      const distRes = await request(app).get('/api/master/districts?state_code=28');
      const distCode = distRes.body[0].district_code;

      const res = await request(app).get(`/api/master/mandals?district_code=${distCode}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const mandal = res.body[0];
      expect(mandal).toHaveProperty('mandal_code');
      expect(mandal).toHaveProperty('mandal_name');
      expect(mandal.district_code).toBe(distCode);
    });
  });
});
