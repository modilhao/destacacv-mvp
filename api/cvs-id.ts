import { storage } from '../server/storage';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      const cvData = await storage.getCvData(Number(id));
      if (!cvData) {
        res.status(404).json({ message: 'CV data not found' });
        return;
      }
      res.status(200).json(cvData);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro interno' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 