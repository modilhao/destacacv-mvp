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
    const { cvDataId, title, unit_price } = req.body;
    
    if (!cvDataId) {
        return res.status(400).json({ error: 'cvDataId is required' });
    }

    const price = unit_price || 4.97; // Usar o preço enviado ou o padrão

    console.log("Criando preferência com:", {
      cvDataId,
      title,
      price,
      accessToken: accessToken ? "Definido" : "Não definido"
    });

    const result = await preference.create({
      body: {
        items: [
          {
            id: cvDataId.toString(),
            title: title || "Currículo DestacaCV",
            quantity: 1,
            unit_price: price,
            currency_id: "BRL",
          },
        ],
        payment_methods: {
            excluded_payment_methods: [],
            excluded_payment_types: [
                { id: "credit_card" },
                { id: "debit_card" },
                { id: "ticket" },
                { id: "prepaid_card" },
                { id: "atm" }
            ],
            installments: 1
        },
        external_reference: cvDataId.toString(),
        notification_url: `${process.env.API_URL}/api/payment-webhook`,
        expires: true,
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        back_urls: {
          success: `${process.env.FRONTEND_URL}/success`,
          failure: `${process.env.FRONTEND_URL}/failure`,
          pending: `${process.env.FRONTEND_URL}/pending`
        },
        auto_return: "approved",
      },
    });

    console.log("Preferência criada com sucesso:", result.id);
    res.status(200).json({ id: result.id });
  } catch (error) {
    console.error('Error creating preference:', error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    res.status(500).json({ 
      error: 'Failed to create payment preference',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 