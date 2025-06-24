import { db } from '../server/db';
import { sql } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const result = await db.execute(sql`SELECT 1 as test`);
      res.status(200).json({ success: true, result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Erro ao conectar ao banco' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 