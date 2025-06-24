import { MercadoPagoConfig, Payment } from 'mercadopago';
import { storage } from '../server/storage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  console.log("=== Webhook recebido ===");
  console.log("Body:", JSON.stringify(req.body, null, 2));

  const { type, data } = req.body;

  if (type === 'payment') {
    const paymentId = data.id;
    console.log("Processando pagamento ID:", paymentId);

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN is not set.");
      return res.status(500).json({ error: "Internal server error" });
    }

    try {
      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);

      const paymentInfo = await payment.get({ id: paymentId });
      console.log("Informações do pagamento:", {
        id: paymentInfo.id,
        status: paymentInfo.status,
        external_reference: paymentInfo.external_reference,
        payment_method_id: paymentInfo.payment_method_id,
        payment_type_id: paymentInfo.payment_type_id
      });
      
      if (paymentInfo && paymentInfo.status === 'approved' && paymentInfo.external_reference) {
        const cvDataId = parseInt(paymentInfo.external_reference, 10);
        console.log(`Atualizando status do cvDataId ${cvDataId} para approved`);
        
        await storage.updateCvDataPaymentStatus(cvDataId, 'approved');
        console.log(`Pagamento para cvDataId ${cvDataId} aprovado e atualizado com sucesso.`);
      } else {
        console.log("Pagamento não aprovado ou sem external_reference:", {
          status: paymentInfo?.status,
          external_reference: paymentInfo?.external_reference
        });
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      return res.status(500).json({ 
        error: 'Error processing webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    console.log("Tipo de webhook não suportado:", type);
  }

  res.status(200).send('OK');
} 