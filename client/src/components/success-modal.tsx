import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Linkedin, Mail } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (isOpen) {
      setCountdown(10); // Reset countdown when modal opens
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            window.location.href = "https://www.incluotalentos.com.br";
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      return () => clearInterval(timer); // Cleanup on unmount
    }
  }, [isOpen]);

  const handleRedirectNow = () => {
    window.location.href = "https://www.incluotalentos.com.br";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="text-green-500" size={32} />
          </div>
          <DialogTitle className="text-2xl font-bold text-incluo-navy">
            Tudo Certo! Seus documentos foram gerados.
          </DialogTitle>
          <DialogDescription className="text-incluo-gray">
            Seus arquivos foram baixados no seu navegador. Verifique sua pasta de downloads.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center space-y-6 py-4">
          <div className="text-left space-y-3 max-w-sm mx-auto p-4 bg-green-50 rounded-lg">
            <div className="flex items-start">
              <FileText
                className="text-green-600 mr-3 flex-shrink-0 mt-1"
                size={20}
              />
              <span className="text-incluo-gray font-medium">
                Currículo Profissional (PDF)
              </span>
            </div>
            <div className="flex items-start">
              <FileText
                className="text-green-600 mr-3 flex-shrink-0 mt-1"
                size={20}
              />
              <span className="text-incluo-gray font-medium">
                Documentos Auxiliares (PDF com Resumo LinkedIn e Carta de Apresentação)
              </span>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm text-incluo-gray mb-4">
              Você será redirecionado em {countdown} segundos...
            </p>
            <Button
              onClick={handleRedirectNow}
              className="bg-incluo-orange hover:bg-incluo-orange/90 text-white px-8 py-3 font-semibold"
            >
              Ir para Incluo Talentos agora
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
