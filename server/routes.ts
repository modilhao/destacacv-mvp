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

  // Create CV data endpoint
  app.post("/api/cvs", async (req, res, next) => {
    try {
      console.log("=== Iniciando criação de CV ===");
      console.log("Dados recebidos:", JSON.stringify(req.body, null, 2));
      
      let validatedData;
      try {
        validatedData = insertCvDataSchema.parse(req.body);
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

  // Create Preference endpoint for Mercado Pago
  app.post("/api/create-preference", async (req, res) => {
    try {
      console.log("=== Recebendo requisição de criação de preferência ===");
      console.log("Body recebido:", req.body);
      console.log("Token de acesso:", process.env.MERCADO_PAGO_ACCESS_TOKEN ? "Presente" : "Ausente");

      if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
        console.error("Token de acesso do Mercado Pago não configurado");
        return res.status(500).json({ error: "Mercado Pago não configurado" });
      }

      try {
        const client = new MercadoPagoConfig({ 
          accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN 
        });
        console.log("Cliente Mercado Pago configurado com sucesso");
        
        const preference = new Preference(client);
        console.log("Objeto Preference criado com sucesso");

        // Validação dos dados recebidos
        const { cvDataId, title, unit_price } = req.body;
        
        if (!cvDataId || !title || !unit_price) {
          console.error("Dados inválidos:", { cvDataId, title, unit_price });
          return res.status(400).json({ 
            error: "Dados inválidos",
            details: {
              cvDataId: !cvDataId ? "ID do currículo é obrigatório" : undefined,
              title: !title ? "Título é obrigatório" : undefined,
              unit_price: !unit_price ? "Preço é obrigatório" : undefined
            }
          });
        }

        console.log("Valor de NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL);
        const backUrls = {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pending`,
        };
        console.log("Objeto enviado para preference.create:", {
          items: [
            {
              title,
              unit_price: Number(unit_price),
              quantity: 1,
              currency_id: "BRL",
            },
          ],
          back_urls: backUrls,
          auto_return: "approved",
        });
        const result = await preference.create({
          body: {
            items: [
              {
                title,
                unit_price: Number(unit_price),
                quantity: 1,
                currency_id: "BRL",
              },
            ],
            back_urls: backUrls,
            auto_return: "approved",
          }
        });

        console.log("Preferência criada com sucesso:", result);
        res.json(result);
      } catch (mpError) {
        console.error("Erro específico do Mercado Pago:", mpError);
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
  app.post("/api/payments/webhook", async (req, res, next) => {
    try {
      const { type, data } = req.body;

      if (type === "payment") {
        const paymentClient = new Payment(mercadopagoClient);
        const payment = await paymentClient.get({ id: data.id });
        
        if (payment && payment.external_reference && payment.status === "approved") {
          const cvDataId = parseInt(payment.external_reference);
          await storage.updateCvDataPaymentStatus(cvDataId, "paid");
          
          const paymentData = insertPaymentSchema.parse({
            cvDataId: cvDataId,
            amount: payment.transaction_amount,
            status: "approved",
            externalId: payment.id?.toString(),
          })
          await storage.createPayment(paymentData);
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
