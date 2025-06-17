import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Linkedin, Mail, AlertCircle } from "lucide-react";
import { CVData } from "@/types/cv-data";

interface ReviewStepProps {
  cvData: CVData;
  onOpenPayment: () => void;
}

export function ReviewStep({ cvData, onOpenPayment }: ReviewStepProps) {
  return (
    <Card className="shadow-lg border border-gray-200">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-incluo-navy mb-6">Revisão e Pagamento</h2>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-incluo-navy mb-4">Resumo dos seus dados</h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <span className="text-sm font-medium text-incluo-gray">Nome:</span>
                <p className="text-incluo-navy">{cvData.personalData.name || "Não informado"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-incluo-gray">Email:</span>
                <p className="text-incluo-navy">{cvData.personalData.email || "Não informado"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-incluo-gray">Experiências:</span>
                <p className="text-incluo-navy">
                  {cvData.experiences.length} experiência{cvData.experiences.length !== 1 ? "s" : ""} adicionada{cvData.experiences.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-incluo-gray">Habilidades:</span>
                <p className="text-incluo-navy">
                  {cvData.skills.technical.length + cvData.skills.soft.length} habilidades adicionadas
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-incluo-gray">Formação:</span>
                <p className="text-incluo-navy">
                  {cvData.education.length} formação{cvData.education.length !== 1 ? "ões" : ""} adicionada{cvData.education.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-incluo-gray">Idiomas:</span>
                <p className="text-incluo-navy">
                  {cvData.languages.length} idioma{cvData.languages.length !== 1 ? "s" : ""} adicionado{cvData.languages.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-incluo-navy mb-3">Você receberá:</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FileText className="text-red-500 mr-3" size={20} />
                  <span className="text-incluo-gray">Currículo em PDF (template acessível A4)</span>
                </div>
                <div className="flex items-center">
                  <Linkedin className="text-blue-500 mr-3" size={20} />
                  <span className="text-incluo-gray">Resumo otimizado para LinkedIn</span>
                </div>
                <div className="flex items-center">
                  <Mail className="text-incluo-orange mr-3" size={20} />
                  <span className="text-incluo-gray">Carta de apresentação personalizada</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-incluo-navy mb-4">Detalhes do Pagamento</h3>
            <div className="bg-incluo-orange/5 border border-incluo-orange/20 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-incluo-navy font-medium">Destaca CV v2</span>
                <span className="text-2xl font-bold text-incluo-orange">R$ 29,90</span>
              </div>
              <p className="text-sm text-incluo-gray mb-6">
                Pagamento único. Receba tudo por email em até 5 minutos.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={onOpenPayment}
                  className="w-full bg-incluo-orange hover:bg-incluo-orange/90 text-white py-4 h-auto font-semibold shadow-lg transform hover:scale-105 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Pagar com PIX
                </Button>
                <Button
                  onClick={onOpenPayment}
                  variant="outline"
                  className="w-full border-2 border-incluo-orange text-incluo-orange hover:bg-incluo-orange hover:text-white py-4 h-auto font-semibold transition-all"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                  </svg>
                  Pagar com Cartão
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="text-yellow-600 mr-2 mt-1 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>Importante:</strong> Após o pagamento, você receberá um email com o link para download do seu currículo em PDF, além do resumo LinkedIn e carta de apresentação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
