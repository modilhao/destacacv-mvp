import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("MERCADO_PAGO_ACCESS_TOKEN is not set.");
    return res.status(500).json({ error: "Internal server error" });
  }

  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  try {
    const { cvDataId, title } = req.body;
    
    if (!cvDataId) {
        return res.status(400).json({ error: 'cvDataId is required' });
    }

    const price = 4.97; // Preço fixo

    const result = await preference.create({
      body: {
        items: [
          {
            id: cvDataId.toString(),
            title: title || "Currículo DestacaCV",
            quantity: 1,
            unit_price: price,
          },
        ],
        payment_methods: {
            excluded_payment_methods: [],
            excluded_payment_types: [
                { id: "credit_card" },
                { id: "debit_card" },
                { id: "ticket" },
                { id: "prepaid_card" }
            ],
            installments: 1
        },
        external_reference: cvDataId.toString(),
        notification_url: `${process.env.API_URL}/api/payment-webhook`,
      },
    });

    res.status(200).json({ id: result.id });
  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).json({ error: 'Failed to create payment preference' });
  }
} 