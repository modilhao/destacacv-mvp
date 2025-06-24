import { insertCvDataSchema } from '../shared/schema';
import { storage } from '../server/storage';

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      let validatedData;
      try {
        validatedData = insertCvDataSchema.parse(req.body);
      } catch (validationError) {
        res.status(400).json({ error: 'Erro na validação', details: validationError });
        return;
      }
      try {
        const cvData = await storage.createCvData(validatedData);
        res.status(201).json(cvData);
      } catch (dbError) {
        res.status(500).json({ error: 'Erro ao salvar no banco', details: dbError });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro interno' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 