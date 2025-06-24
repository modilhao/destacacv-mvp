import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
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
              exp.endDate || 'Atual'
            }): ${exp.description}`
        )
        .join('\n')}
      - Habilidades: ${skills.map((skill: any) => skill.name).join(', ')}

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
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error('A API da OpenAI não retornou conteúdo.');
    }

    const parsedResult = JSON.parse(result);
    res.status(200).json(parsedResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
} 