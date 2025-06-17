import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Linkedin, Mail } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <div className="text-center space-y-6 py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="text-green-500" size={32} />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-incluo-navy mb-4">Pagamento Confirmado!</h3>
            <p className="text-incluo-gray mb-6">
              Seu currículo está sendo gerado. Em alguns minutos você receberá um email com:
            </p>
          </div>

          <div className="text-left space-y-3 max-w-sm mx-auto">
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-3 flex-shrink-0" size={20} />
              <span className="text-incluo-gray">Link para download do PDF</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-3 flex-shrink-0" size={20} />
              <span className="text-incluo-gray">Resumo LinkedIn</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-3 flex-shrink-0" size={20} />
              <span className="text-incluo-gray">Carta de apresentação</span>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={onClose}
              className="bg-incluo-orange hover:bg-incluo-orange/90 text-white px-8 py-3 font-semibold"
            >
              Entendi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
