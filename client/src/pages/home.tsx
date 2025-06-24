import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Play, Eye, Check, Rocket, Sparkles, Shield, Clock } from "lucide-react";
import { ProgressIndicator } from "@/components/wizard/progress-indicator";
import { PersonalDataStep } from "@/components/wizard/personal-data-step";
import { ExperienceStep } from "@/components/wizard/experience-step";
import { SkillsStep } from "@/components/wizard/skills-step";
import { ReviewStep } from "@/components/wizard/review-step";
import { PaymentModal } from "@/components/payment-modal";
import { SuccessModal } from "@/components/success-modal";
import { CVData } from "@/types/cv-data";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [cvDataId, setCvDataId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [cvData, setCvData] = useState<CVData>({
    personalData: {
      name: "",
      email: "",
      phone: "",
      linkedin: "",
      address: "",
      summary: "",
    },
    experiences: [],
    skills: {
      technical: [],
      soft: [],
    },
    education: [],
    languages: [],
  });

  const totalSteps = 4;

  const handleStartWizard = () => {
    setShowWizard(true);
    setTimeout(() => {
      document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOpenPayment = async () => {
    try {
      // First, save the current CV data to get an ID
      const response = await fetch("/api/cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cvData,
          email: cvData.personalData.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar os dados do currículo.");
      }

      const savedCv = await response.json();
      setCvDataId(savedCv.id); // Save the returned ID
      setShowPaymentModal(true); // Now open the modal
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description:
          "Houve um problema ao iniciar o processo de pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async () => {
    setIsGenerating(true);
    setShowPaymentModal(false);

    try {
      const response = await fetch("/api/generate-texts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalData: cvData.personalData,
          experiences: cvData.experiences,
          skills: [
            ...cvData.skills.technical.map((skillName) => ({ name: skillName })),
            ...cvData.skills.soft.map((skillName) => ({ name: skillName })),
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar os textos. Tente novamente.");
      }

      const generatedTexts = await response.json();

      // Update state with generated texts
      const updatedCvData = {
        ...cvData,
        linkedinSummary: generatedTexts.linkedinSummary,
        coverLetter: generatedTexts.coverLetter,
      };
      setCvData(updatedCvData);

      // Now, generate the PDF
      const pdfResponse = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCvData),
      });

      if (!pdfResponse.ok) {
        throw new Error("Falha ao gerar o PDF.");
      }

      const pdfBlob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "curriculo-destaca-cv.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // --- Generate auxiliary documents ---
      const docsResponse = await fetch("/api/generate-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedinSummary: updatedCvData.linkedinSummary,
          coverLetter: updatedCvData.coverLetter,
        }),
      });

      if (!docsResponse.ok) {
        // We can choose to just log this error and not block the user,
        // as the main CV was already generated.
        console.error("Falha ao gerar os documentos auxiliares.");
        toast({
          title: "Aviso",
          description: "Seu currículo foi gerado, mas houve um problema ao criar os documentos auxiliares. Contate o suporte se precisar.",
          variant: "default",
        })
      } else {
        const docsBlob = await docsResponse.blob();
        const docsUrl = window.URL.createObjectURL(docsBlob);
        const docsLink = document.createElement("a");
        docsLink.href = docsUrl;
        docsLink.download = "documentos-auxiliares.pdf";
        document.body.appendChild(docsLink);
        docsLink.click();
        docsLink.remove();
        window.URL.revokeObjectURL(docsUrl);
      }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Houve um problema ao gerar seus documentos. Por favor, entre em contato com o suporte.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDataStep
            data={cvData.personalData}
            onUpdate={(data) => setCvData(prev => ({ ...prev, personalData: data }))}
          />
        );
      case 2:
        return (
          <ExperienceStep
            data={cvData.experiences}
            onUpdate={(data) => setCvData(prev => ({ ...prev, experiences: data }))}
          />
        );
      case 3:
        return (
          <SkillsStep
            skillsData={cvData.skills}
            educationData={cvData.education}
            languagesData={cvData.languages}
            onUpdateSkills={(data) => setCvData(prev => ({ ...prev, skills: data }))}
            onUpdateEducation={(data) => setCvData(prev => ({ ...prev, education: data }))}
            onUpdateLanguages={(data) => setCvData(prev => ({ ...prev, languages: data }))}
          />
        );
      case 4:
        return (
          <ReviewStep
            cvData={cvData}
            onOpenPayment={handleOpenPayment}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {isGenerating && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50 transition-opacity duration-300">
          <Rocket className="text-incluo-orange h-16 w-16 animate-bounce" />
          <h2 className="text-2xl font-bold text-incluo-navy mt-6">Gerando seus documentos...</h2>
          <p className="text-lg text-incluo-gray mt-2">Isso pode levar alguns segundos. Não feche esta página.</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-incluo-orange rounded-full flex items-center justify-center mr-3">
                  <Users className="text-white" size={16} />
                </div>
                <span className="text-xl font-semibold text-incluo-navy">Incluo Talentos</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#manifesto" className="text-incluo-gray hover:text-incluo-navy transition-colors">Manifesto</a>
              <a href="#beneficios" className="text-incluo-gray hover:text-incluo-navy transition-colors">Benefícios</a>
              <a href="#precos" className="text-incluo-gray hover:text-incluo-navy transition-colors">Preços</a>
              <Button onClick={handleStartWizard} className="bg-incluo-orange hover:bg-incluo-orange/90 text-white font-bold shadow-lg px-6 py-2 rounded-lg border-2 border-incluo-orange hover:scale-105 transition-all">
                Inicie já
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-incluo-teal/10 text-incluo-teal px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Rocket className="mr-2" size={16} />
                Destaca CV v2 - Novo!
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-incluo-navy mb-6 leading-tight">
                Conectando Talentos
                <span className="text-incluo-orange"> Diversos</span> ao Mercado
                de Trabalho
              </h1>
              <p className="text-lg text-incluo-gray mb-8 leading-relaxed">
                Transformamos a inclusão em realidade através de
                processos humanizados e tecnologia que aproxima
                pessoas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={handleStartWizard}
                  className="bg-incluo-orange hover:bg-incluo-orange/90 text-white px-8 py-4 h-auto font-semibold shadow-lg transform hover:scale-105 transition-all"
                >
                  <Play className="mr-2" size={16} />
                  Inicie já
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-incluo-gray">
                <div className="flex items-center">
                  <Check className="text-green-500 mr-2" size={16} />
                  PDF Acessível A4
                </div>
                <div className="flex items-center">
                  <Check className="text-green-500 mr-2" size={16} />
                  Resumo LinkedIn
                </div>
                <div className="flex items-center">
                  <Check className="text-green-500 mr-2" size={16} />
                  Carta de Apresentação
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="transform rotate-3 hover:rotate-0 transition-transform duration-300 shadow-2xl">
                <CardContent className="p-8">
                  <div className="bg-gray-100 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-incluo-orange rounded-full flex items-center justify-center">
                        <Users className="text-white" size={24} />
                      </div>
                      <div className="ml-4">
                        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-incluo-orange font-semibold">Currículo Gerado</span>
                    <div className="w-6 h-6 bg-incluo-teal rounded-full flex items-center justify-center">
                      <Check className="text-white" size={14} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Wizard Section */}
      {showWizard && (
        <section id="wizard-section" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
            
            <div className="mt-12">
              {renderCurrentStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="ghost"
                onClick={handlePrevStep}
                className={currentStep === 1 ? "invisible" : ""}
              >
                Voltar
              </Button>
              <Button
                onClick={handleNextStep}
                className="bg-incluo-orange hover:bg-incluo-orange/90 text-white px-8"
                disabled={currentStep === totalSteps}
              >
                {currentStep === totalSteps ? "Finalizar" : "Próximo"}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="beneficios" className="py-16 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-incluo-navy mb-4">Benefícios Exclusivos para Você</h2>
            <p className="text-lg text-incluo-gray max-w-2xl mx-auto">
              Potencialize sua carreira com um currículo profissional, acessível e pronto para destacar seus talentos. Simples, rápido e acessível para todos!
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-incluo-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-incluo-navy mb-3">Currículo Profissional</h3>
              <p className="text-incluo-gray">
                Seu currículo pronto em minutos, com design moderno e otimizado para recrutadores.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-incluo-teal rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-incluo-navy mb-3">Acessibilidade Total</h3>
              <p className="text-incluo-gray">
                Documentos acessíveis para todos, seguindo os mais altos padrões de inclusão.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-incluo-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-incluo-navy mb-3">Entrega Imediata</h3>
              <p className="text-incluo-gray">
                Receba seu currículo e documentos extras no seu e-mail em até 5 minutos após o pagamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preços Section */}
      <section id="precos" className="py-16 bg-incluo-teal/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-incluo-navy mb-4">Preço Especial de Lançamento</h2>
          <p className="text-lg text-incluo-gray mb-8">Tenha acesso a todos os benefícios por um valor simbólico. Invista no seu futuro agora mesmo!</p>
          <div className="inline-block bg-white rounded-2xl shadow-lg px-12 py-10 mb-8 border-4 border-incluo-orange">
            <span className="block text-incluo-gray text-lg mb-2">Apenas</span>
            <span className="text-5xl font-extrabold text-incluo-orange mb-2 block">R$ 4,97</span>
            <span className="block text-incluo-navy font-medium mb-4">Pagamento único, acesso imediato</span>
            <Button
              onClick={handleStartWizard}
              className="bg-incluo-orange hover:bg-incluo-orange/90 text-white font-bold px-10 py-4 rounded-lg text-lg shadow-lg hover:scale-105 transition-all mt-2"
            >
              Quero meu currículo agora!
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-incluo-gray text-sm">
            <div className="flex items-center justify-center"><Check className="text-green-500 mr-2" size={16} />Currículo Profissional</div>
            <div className="flex items-center justify-center"><Check className="text-green-500 mr-2" size={16} />Resumo LinkedIn</div>
            <div className="flex items-center justify-center"><Check className="text-green-500 mr-2" size={16} />Carta de Apresentação</div>
            <div className="flex items-center justify-center"><Check className="text-green-500 mr-2" size={16} />Entrega em até 5 minutos</div>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section id="manifesto" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-incluo-navy mb-4">Manifesto Incluo Talentos</h2>
          <p className="text-lg text-incluo-gray mb-6">
            Acreditamos que a diversidade é a força que move o futuro do trabalho. Nosso compromisso é tornar o acesso ao mercado mais justo, humano e inclusivo, conectando talentos de todas as origens a oportunidades reais.
          </p>
          <p className="text-incluo-navy text-xl font-semibold mb-4">Juntos, transformamos inclusão em realidade!</p>
          <Button onClick={handleStartWizard} className="bg-incluo-orange hover:bg-incluo-orange/90 text-white font-bold px-10 py-4 rounded-lg text-lg shadow-lg hover:scale-105 transition-all mt-2">
            Quero fazer parte dessa mudança
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-incluo-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-incluo-orange rounded-full flex items-center justify-center mr-3">
                  <Users className="text-white" size={16} />
                </div>
                <span className="text-xl font-semibold">Incluo Talentos</span>
              </div>
              <p className="text-gray-300 mb-4">
                Conectando talentos diversos ao mercado de trabalho através de tecnologia inclusiva.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Destaca CV</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Como funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Manifesto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Para Empresas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Incluo Talentos. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        cvDataId={cvDataId}
        amount={10} // Price in BRL
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
