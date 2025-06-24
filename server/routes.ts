import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCvDataSchema, insertPaymentSchema } from "../shared/schema";
import OpenAI from "openai";
import { z } from "zod";
import puppeteer from "puppeteer";
import handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { db } from "./db";
import { sql } from "drizzle-orm";
import mercadopago from "mercadopago";
import { mercadopagoConfig, isDevelopment, urls } from "./config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure Mercado Pago
if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  throw new Error("MERCADO_PAGO_ACCESS_TOKEN is not set in .env file");
}
const mercadopagoClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Test database connection endpoint
  app.get("/api/test-db", async (req, res, next) => {
    try {
      const result = await db.execute(sql`SELECT 1 as test`);
      res.json({ success: true, result });
    } catch (error) {
      console.error("Database connection error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Test environment variables endpoint
  app.get("/api/test-env", async (req, res, next) => {
    try {
      res.json({ 
        success: true, 
        env: {
          MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN ? "Definido" : "Não definido",
          VITE_MERCADO_PAGO_PUBLIC_KEY: process.env.VITE_MERCADO_PAGO_PUBLIC_KEY ? "Definido" : "Não definido",
          DATABASE_URL: process.env.DATABASE_URL ? "Definido" : "Não definido",
          API_URL: process.env.API_URL,
          FRONTEND_URL: process.env.FRONTEND_URL,
          NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        }
      });
    } catch (error) {
      console.error("Environment test error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Create CV data endpoint
  app.post("/api/cvs", async (req, res, next) => {
    try {
      console.log("=== Iniciando criação de CV ===");
      console.log("Dados recebidos:", JSON.stringify(req.body, null, 2));
      
      // Adiciona valores padrão para campos obrigatórios que podem não ser enviados
      const dataWithDefaults = {
        ...req.body,
        education: req.body.education || [],
        languages: req.body.languages || [],
      };
      
      console.log("Dados com valores padrão:", JSON.stringify(dataWithDefaults, null, 2));
      
      let validatedData;
      try {
        validatedData = insertCvDataSchema.parse(dataWithDefaults);
        console.log("Dados validados com sucesso:", JSON.stringify(validatedData, null, 2));
      } catch (validationError) {
        console.error("Erro na validação:", validationError);
        throw validationError;
      }
      
      try {
        const cvData = await storage.createCvData(validatedData);
        console.log("CV criado com sucesso:", JSON.stringify(cvData, null, 2));
        res.status(201).json(cvData);
      } catch (dbError) {
        console.error("Erro ao salvar no banco:", dbError);
        throw dbError;
      }
    } catch (error) {
      console.error("Erro final:", error);
      next(error);
    }
  });

  // Get CV data endpoint
  app.get("/api/cvs/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const cvData = await storage.getCvData(id);

      if (!cvData) {
        return res.status(404).json({ message: "CV data not found" });
      }

      res.json(cvData);
    } catch (error) {
      next(error);
    }
  });

  // Text Generation Endpoint
  app.post("/api/generate-texts", async (req, res, next) => {
    try {
      // Define a specific schema for this request to match the frontend
      const textGenerationRequestSchema = z.object({
        personalData: z.any(),
        experiences: z.any(),
        skills: z.array(z.object({ name: z.string() })),
      });

      const validatedData = textGenerationRequestSchema.parse(req.body);
      const { personalData, experiences, skills } = validatedData;

      const prompt = `
        Com base nos seguintes dados de um currículo, gere um "resumo para LinkedIn" e uma "carta de apresentação".

        DADOS:
        - Nome: ${personalData.name}
        - Email: ${personalData.email}
        - Telefone: ${personalData.phone}
        - Resumo Pessoal: ${personalData.summary}
        - Experiências: ${experiences
          .map(
            (exp: any) =>
              `- ${exp.position} na ${exp.company} (${exp.startDate} - ${
                exp.endDate || "Atual"
              }): ${exp.description}`
          )
          .join("\n")}
        - Habilidades: ${skills.map((skill: any) => skill.name).join(", ")}

        REGRAS DE GERAÇÃO:
        1.  **Resumo para LinkedIn**: Deve ser um parágrafo conciso (2-4 frases) e profissional, destacando as principais qualificações e experiências. Use a primeira pessoa.
        2.  **Carta de Apresentação**: Deve ser formal, endereçada a "Prezado(a) Recrutador(a),". Deve ter 3 parágrafos: introdução, um parágrafo destacando como as experiências e habilidades se conectam a uma vaga em potencial, e uma conclusão com uma chamada para ação (ex: "ansioso(a) para discutir...").
        3.  **Formato da Resposta**: A resposta DEVE ser um objeto JSON válido, com exatamente duas chaves: "linkedinSummary" e "coverLetter". O conteúdo de cada chave deve ser uma string de texto puro. Não inclua markdown ou qualquer outra formatação.
        
        Exemplo de formato de resposta:
        {
          "linkedinSummary": "Profissional com X anos de experiência em...",
          "coverLetter": "Prezado(a) Recrutador(a),..."
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = completion.choices[0].message.content;
      if (!result) {
        throw new Error("A API da OpenAI não retornou conteúdo.");
      }

      const parsedResult = JSON.parse(result);
      res.json(parsedResult);
    } catch (error) {
      next(error);
    }
  });

  // PDF Generation Endpoint
  app.post("/api/generate-pdf", async (req, res, next) => {
    try {
      console.log("=== Iniciando geração de PDF ===");
      
      // Bypassing zod validation here to avoid type conflicts with handlebars
      const cvData = req.body;
      console.log("Dados recebidos:", JSON.stringify(cvData, null, 2));

      const templatePath = path.resolve(process.cwd(), "server", "cv-template.html");
      console.log("Caminho do template:", templatePath);
      
      const templateHtml = await fs.readFile(templatePath, "utf-8");
      console.log("Template HTML carregado com sucesso");
      
      const template = handlebars.compile(templateHtml);
      const html = template(cvData);
      console.log("Template preenchido com sucesso");

      console.log("Iniciando Puppeteer...");
      const browser = await puppeteer.launch({ 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      });
      console.log("Puppeteer iniciado com sucesso");

      const page = await browser.newPage();
      console.log("Nova página criada");
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      console.log("Conteúdo HTML definido na página");
      
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
      });
      console.log("PDF gerado com sucesso, tamanho do buffer:", pdfBuffer.length);
      
      await browser.close();
      console.log("Navegador fechado");

      // Configurando os headers corretamente
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=cv.pdf");
      res.setHeader("Content-Length", pdfBuffer.length);
      
      // Enviando o buffer diretamente
      res.end(pdfBuffer);
      console.log("PDF enviado com sucesso");

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      if (error instanceof Error) {
        console.error("Stack trace:", error.stack);
      }
      next(error);
    }
  });

  // Endpoint to generate auxiliary documents (LinkedIn summary, cover letter)
  app.post("/api/generate-documents", async (req, res, next) => {
    try {
      console.log("=== Iniciando geração de documentos auxiliares ===");
      const docData = req.body;
      console.log("Dados recebidos:", JSON.stringify(docData, null, 2));

      const templatePath = path.resolve(process.cwd(), "server", "documents-template.html");
      const templateHtml = await fs.readFile(templatePath, "utf-8");
      
      const template = handlebars.compile(templateHtml);
      const html = template(docData);

      const browser = await puppeteer.launch({ 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "25mm", right: "25mm", bottom: "25mm", left: "25mm" },
      });
      
      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=documentos-auxiliares.pdf");
      res.setHeader("Content-Length", pdfBuffer.length);
      
      res.end(pdfBuffer);
      console.log("Documentos auxiliares enviados com sucesso");

    } catch (error) {
      console.error("Erro ao gerar documentos auxiliares:", error);
      next(error);
    }
  });

  // Create Preference endpoint for Mercado Pago (Simplificado para desenvolvimento)
  app.post("/api/create-preference", async (req, res) => {
    try {
      console.log("=== Recebendo requisição de criação de preferência ===");
      console.log("Body recebido:", req.body);
      console.log("Ambiente:", isDevelopment ? "DESENVOLVIMENTO" : "PRODUÇÃO");

      // Para desenvolvimento, vamos simular uma preferência de pagamento
      if (isDevelopment) {
        console.log("Modo desenvolvimento: simulando preferência de pagamento");
        
        const { cvDataId, title, unit_price } = req.body;
        
        if (!cvDataId) {
          console.error("cvDataId é obrigatório");
          return res.status(400).json({ 
            error: "cvDataId é obrigatório"
          });
        }

        const price = unit_price || 4.97;
        const itemTitle = title || "Currículo DestacaCV";

        // Simular criação de preferência
        const mockPreferenceId = `mock_pref_${Date.now()}_${cvDataId}`;
        
        console.log("Preferência simulada criada:", {
          id: mockPreferenceId,
          cvDataId,
          title: itemTitle,
          price,
          status: "created"
        });

        // Retornar preferência simulada
        res.json({ 
          id: mockPreferenceId,
          status: "created",
          message: "Preferência simulada para desenvolvimento"
        });
        return;
      }

      // Para produção, usar Mercado Pago real
      console.log("Modo produção: usando Mercado Pago real");
      console.log("Configuração Mercado Pago:", {
        accessToken: mercadopagoConfig.accessToken.substring(0, 10) + "...",
        publicKey: mercadopagoConfig.publicKey.substring(0, 10) + "...",
        isTestToken: mercadopagoConfig.accessToken.startsWith('TEST-')
      });

      try {
        const client = new MercadoPagoConfig({ 
          accessToken: mercadopagoConfig.accessToken
        });
        console.log("Cliente Mercado Pago configurado com sucesso");
        
        const preference = new Preference(client);
        console.log("Objeto Preference criado com sucesso");

        // Validação dos dados recebidos
        const { cvDataId, title, unit_price } = req.body;
        
        if (!cvDataId) {
          console.error("cvDataId é obrigatório");
          return res.status(400).json({ 
            error: "cvDataId é obrigatório"
          });
        }

        const price = unit_price || 4.97;
        const itemTitle = title || "Currículo DestacaCV";

        console.log("Criando preferência com:", {
          cvDataId,
          title: itemTitle,
          price,
          isTestToken: mercadopagoConfig.accessToken.startsWith('TEST-')
        });

        const preferenceData = {
          body: {
            items: [
              {
                id: cvDataId.toString(),
                title: itemTitle,
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
            notification_url: `${urls.api}/api/payment-webhook`,
            expires: true,
            expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
            back_urls: {
              success: `${urls.frontend}/success`,
              failure: `${urls.frontend}/failure`,
              pending: `${urls.frontend}/pending`
            },
            auto_return: "approved",
          }
        };

        console.log("Dados da preferência a serem enviados:", JSON.stringify(preferenceData, null, 2));

        const result = await preference.create(preferenceData);

        console.log("Preferência criada com sucesso:", result.id);
        res.json({ id: result.id });
      } catch (mpError) {
        console.error("Erro específico do Mercado Pago:", mpError);
        
        // Log detalhado do erro
        if (mpError instanceof Error) {
          console.error('Error message:', mpError.message);
          console.error('Error stack:', mpError.stack);
        }
        
        // Se for erro de autenticação, pode ser token inválido
        if (mpError instanceof Error && mpError.message.includes('401')) {
          console.error('Erro 401: Token de acesso inválido ou expirado');
          return res.status(500).json({ 
            error: "Token de acesso do Mercado Pago inválido",
            details: "Verifique se o token está correto e se é um token de teste válido"
          });
        }
        
        throw mpError;
      }
    } catch (error) {
      console.error("Erro ao criar preferência:", error);
      res.status(500).json({ 
        error: "Erro ao criar preferência de pagamento",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  // Payment webhook endpoint for Mercado Pago
  app.post("/api/payment-webhook", async (req, res, next) => {
    try {
      console.log("=== Webhook recebido ===");
      console.log("Headers:", req.headers);
      console.log("Body:", JSON.stringify(req.body, null, 2));

      // Validação da assinatura do webhook (recomendado pelo Mercado Pago)
      const signature = req.headers['x-signature'] as string;
      const timestamp = req.headers['x-timestamp'] as string;
      
      if (signature && timestamp) {
        console.log("Assinatura recebida:", signature);
        console.log("Timestamp recebido:", timestamp);
        // TODO: Implementar validação da assinatura se necessário
        // const isValidSignature = validateWebhookSignature(signature, timestamp, req.body);
        // if (!isValidSignature) {
        //   console.error("Assinatura inválida do webhook");
        //   return res.status(401).json({ error: "Invalid signature" });
        // }
      }

      const { type, data } = req.body;

      if (type === "payment") {
        const paymentId = data.id;
        console.log("Processando pagamento ID:", paymentId);

        const paymentClient = new Payment(mercadopagoClient);
        const payment = await paymentClient.get({ id: data.id });
        
        console.log("Informações do pagamento:", {
          id: payment.id,
          status: payment.status,
          external_reference: payment.external_reference,
          payment_method_id: payment.payment_method_id,
          payment_type_id: payment.payment_type_id
        });
        
        if (payment && payment.external_reference && payment.status === "approved") {
          const cvDataId = parseInt(payment.external_reference);
          console.log(`Atualizando status do cvDataId ${cvDataId} para approved`);
          
          await storage.updateCvDataPaymentStatus(cvDataId, "paid");
          
          const paymentData = insertPaymentSchema.parse({
            cvDataId: cvDataId,
            amount: payment.transaction_amount,
            status: "approved",
            externalId: payment.id?.toString(),
          })
          await storage.createPayment(paymentData);
          
          console.log(`Pagamento para cvDataId ${cvDataId} aprovado e atualizado com sucesso.`);
        } else {
          console.log("Pagamento não aprovado ou sem external_reference:", {
            status: payment?.status,
            external_reference: payment?.external_reference
          });
        }
      } else if (type === "merchant_order") {
        console.log("Evento merchant_order recebido:", data);
        // TODO: Implementar processamento de merchant_order se necessário
      } else if (type === "topic_claims_integration_wh") {
        console.log("Evento de reclamação recebido:", data);
        // TODO: Implementar processamento de reclamações se necessário
      } else {
        console.log("Tipo de webhook não suportado:", type);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
