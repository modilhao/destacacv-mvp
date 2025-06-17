import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, X } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number; // in cents
}

export function PaymentModal({ isOpen, onClose, onSuccess, amount }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (method: "pix" | "card") => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-incluo-navy">
            Finalizar Pagamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-incluo-orange mb-2">
              {formatCurrency(amount)}
            </div>
            <p className="text-sm text-incluo-gray">Destaca CV v2</p>
          </div>

          {isProcessing ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-incluo-orange mx-auto mb-4"></div>
                <p className="text-incluo-gray">Processando pagamento...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={() => handlePayment("pix")}
                className="w-full bg-incluo-orange hover:bg-incluo-orange/90 text-white py-4 h-auto font-semibold"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Pagar com PIX
              </Button>
              
              <Button
                onClick={() => handlePayment("card")}
                variant="outline"
                className="w-full border-2 border-incluo-orange text-incluo-orange hover:bg-incluo-orange hover:text-white py-4 h-auto font-semibold"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Pagar com Cartão
              </Button>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-incluo-gray">
              Pagamento seguro processado pelo Mercado Pago
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
