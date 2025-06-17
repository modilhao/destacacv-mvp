import { CVData } from "@/types/cv-data";

export function generateLinkedInSummary(cvData: CVData): string {
  const { personalData, experiences, skills } = cvData;
  
  let summary = `${personalData.summary}\n\n`;
  
  if (experiences.length > 0) {
    summary += "💼 Experiência Profissional:\n";
    experiences.forEach((exp, index) => {
      summary += `• ${exp.position} na ${exp.company}\n`;
    });
    summary += "\n";
  }
  
  if (skills.technical.length > 0) {
    summary += "🔧 Habilidades Técnicas:\n";
    summary += skills.technical.join(" • ") + "\n\n";
  }
  
  if (skills.soft.length > 0) {
    summary += "🤝 Habilidades Comportamentais:\n";
    summary += skills.soft.join(" • ") + "\n\n";
  }
  
  summary += "📧 Entre em contato: " + personalData.email;
  
  return summary;
}

export function generateCoverLetter(cvData: CVData): string {
  const { personalData, experiences, skills } = cvData;
  
  const currentDate = new Date().toLocaleDateString("pt-BR");
  
  let coverLetter = `${personalData.name}
${personalData.email}
${personalData.phone}
${personalData.address}

${currentDate}

Prezado(a) Recrutador(a),

Sou ${personalData.name}, e gostaria de expressar meu interesse em oportunidades em sua empresa.

${personalData.summary}

`;

  if (experiences.length > 0) {
    coverLetter += `Ao longo da minha carreira, tive a oportunidade de trabalhar em posições como ${experiences.map(exp => exp.position).join(", ")}, onde desenvolvi habilidades valiosas e contribuí para o sucesso das organizações.\n\n`;
  }

  if (skills.technical.length > 0 || skills.soft.length > 0) {
    coverLetter += "Minhas principais competências incluem:\n";
    
    if (skills.technical.length > 0) {
      coverLetter += `• Habilidades técnicas: ${skills.technical.join(", ")}\n`;
    }
    
    if (skills.soft.length > 0) {
      coverLetter += `• Habilidades comportamentais: ${skills.soft.join(", ")}\n`;
    }
    
    coverLetter += "\n";
  }

  coverLetter += `Acredito que minha experiência e habilidades podem contribuir significativamente para o crescimento da empresa. Estou disponível para uma conversa e ansioso(a) para discutir como posso agregar valor à sua equipe.

Agradeço pela oportunidade e aguardo um retorno.

Atenciosamente,
${personalData.name}`;

  return coverLetter;
}

export function generateEmailTemplate(cvData: CVData, pdfUrl: string): string {
  const linkedInSummary = generateLinkedInSummary(cvData);
  const coverLetter = generateCoverLetter(cvData);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Seus documentos estão prontos - Destaca CV</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin-bottom: 30px; }
        .section-title { color: #2C3E50; font-weight: bold; margin-bottom: 10px; }
        .download-button { background: #4ECDC4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .text-box { background: #f5f5f5; padding: 15px; border-left: 4px solid #4ECDC4; margin: 10px 0; white-space: pre-line; }
        .footer { background: #2C3E50; color: white; padding: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Parabéns, ${cvData.personalData.name}!</h1>
          <p>Seus documentos estão prontos para download</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2 class="section-title">📄 Seu Currículo em PDF</h2>
            <p>Clique no botão abaixo para fazer o download do seu currículo em formato PDF acessível:</p>
            <a href="${pdfUrl}" class="download-button">📥 Baixar Currículo PDF</a>
          </div>
          
          <div class="section">
            <h2 class="section-title">💼 Resumo para LinkedIn</h2>
            <p>Copie e cole este texto otimizado na seção "Sobre" do seu perfil no LinkedIn:</p>
            <div class="text-box">${linkedInSummary}</div>
          </div>
          
          <div class="section">
            <h2 class="section-title">📧 Carta de Apresentação</h2>
            <p>Use esta carta personalizada para se candidatar a vagas:</p>
            <div class="text-box">${coverLetter}</div>
          </div>
          
          <div class="section">
            <h2 class="section-title">🎯 Próximos Passos</h2>
            <ul>
              <li>Atualize seu perfil no LinkedIn com o novo resumo</li>
              <li>Use o currículo PDF para candidaturas</li>
              <li>Personalize a carta de apresentação para cada vaga</li>
              <li>Compartilhe seu sucesso com o #DestacaCV</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Obrigado por escolher o Destaca CV!</p>
          <p>Incluo Talentos - Conectando talentos diversos ao mercado de trabalho</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
