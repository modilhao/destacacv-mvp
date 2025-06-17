import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCvDataSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create CV data endpoint
  app.post("/api/cv-data", async (req, res) => {
    try {
      const validatedData = insertCvDataSchema.parse(req.body);
      const cvData = await storage.createCvData(validatedData);
      
      // Generate PDF, LinkedIn summary, and cover letter
      const pdfUrl = await generatePDF(cvData);
      const linkedinSummary = generateLinkedInSummary(cvData);
      const coverLetter = generateCoverLetter(cvData);
      
      const updatedCvData = await storage.updateCvData(cvData.id, {
        pdfUrl,
        linkedinSummary,
        coverLetter,
      });
      
      res.json(updatedCvData);
    } catch (error) {
      console.error("Error creating CV data:", error);
      res.status(400).json({ message: "Invalid CV data" });
    }
  });

  // Get CV data endpoint
  app.get("/api/cv-data/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cvData = await storage.getCvData(id);
      
      if (!cvData) {
        return res.status(404).json({ message: "CV data not found" });
      }
      
      res.json(cvData);
    } catch (error) {
      console.error("Error fetching CV data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create payment endpoint
  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      
      // In a real implementation, this would integrate with Mercado Pago
      // For now, we'll simulate payment processing
      const processedPayment = await processPayment(payment);
      
      res.json(processedPayment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // Payment webhook endpoint (mock)
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const { paymentId, status } = req.body;
      
      const payment = await storage.updatePaymentStatus(paymentId, status);
      
      if (status === "approved") {
        // Update CV data payment status
        await storage.updateCvDataPaymentStatus(payment.cvDataId, "paid");
        
        // Send email with documents (mock)
        await sendEmailWithDocuments(payment.cvDataId);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Mock functions for PDF generation and text generation
async function generatePDF(cvData: any): Promise<string> {
  // In a real implementation, this would use a PDF generation library
  // For now, return a mock URL
  return `https://example.com/pdf/${cvData.id}.pdf`;
}

function generateLinkedInSummary(cvData: any): string {
  const personalData = cvData.personalData as any;
  const experiences = cvData.experiences as any[];
  
  let summary = `${personalData.summary}\n\n`;
  
  if (experiences.length > 0) {
    summary += "Experiência Profissional:\n";
    experiences.forEach((exp, index) => {
      summary += `• ${exp.position} na ${exp.company}\n`;
    });
  }
  
  return summary;
}

function generateCoverLetter(cvData: any): string {
  const personalData = cvData.personalData as any;
  
  return `Prezado(a) Recrutador(a),

Sou ${personalData.name}, e gostaria de expressar meu interesse em oportunidades em sua empresa.

${personalData.summary}

Acredito que minha experiência e habilidades podem contribuir significativamente para o crescimento da empresa. Estou disponível para uma conversa e ansioso(a) para discutir como posso agregar valor à sua equipe.

Atenciosamente,
${personalData.name}
${personalData.email}
${personalData.phone}`;
}

async function processPayment(payment: any): Promise<any> {
  // Mock payment processing
  // In a real implementation, this would integrate with Mercado Pago API
  return {
    ...payment,
    status: "approved",
    externalId: `MP_${Date.now()}`,
  };
}

async function sendEmailWithDocuments(cvDataId: number): Promise<void> {
  // Mock email sending
  // In a real implementation, this would use Brevo/Sendinblue API
  console.log(`Sending email with documents for CV data ID: ${cvDataId}`);
}
