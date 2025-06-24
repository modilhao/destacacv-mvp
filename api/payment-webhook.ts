import { MercadoPagoConfig, Payment } from 'mercadopago';
import { storage } from '../server/storage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { type, data } = req.body;

  if (type === 'payment') {
    const paymentId = data.id;

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN is not set.");
      return res.status(500).json({ error: "Internal server error" });
    }

    try {
      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);

      const paymentInfo = await payment.get({ id: paymentId });
      
      if (paymentInfo && paymentInfo.status === 'approved' && paymentInfo.external_reference) {
        const cvDataId = parseInt(paymentInfo.external_reference, 10);
        await storage.updateCvDataPaymentStatus(cvDataId, 'approved');
        console.log(`Payment for cvDataId ${cvDataId} approved and updated.`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({ error: 'Error processing webhook' });
    }
  }

  res.status(200).send('OK');
} 