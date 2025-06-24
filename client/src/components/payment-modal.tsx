import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cvDataId: number | null;
  amount: number; // in reais now
}

export function PaymentModal({ isOpen, onClose, onSuccess, cvDataId, amount }: PaymentModalProps) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // 1. Initialize Mercado Pago
  useEffect(() => {
    const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: 'pt-BR' });
    } else {
      console.error("VITE_MERCADO_PAGO_PUBLIC_KEY is not set.");
    }
  }, []);

  // 2. Create Payment Preference when modal opens
  useEffect(() => {
    if (isOpen && cvDataId !== null) {
      console.log("=== Iniciando criação de preferência ===");
      console.log("cvDataId:", cvDataId);
      console.log("amount:", amount);
      
      setIsInitializing(true);
      setPreferenceId(null);
      
      const createPreference = async () => {
        try {
          const requestBody = {
            cvDataId,
            title: "Currículo DestacaCV",
            unit_price: amount,
          };
          console.log("Dados da requisição:", requestBody);

          const response = await fetch("/api/create-preference", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error("Erro na resposta:", {
              status: response.status,
              statusText: response.statusText,
              errorData
            });
            throw new Error("Failed to create payment preference");
          }

          const responseData = await response.json();
          console.log("Resposta do servidor:", responseData);
          
          if (responseData.id) {
            setPreferenceId(responseData.id);
          }
        } catch (error) {
          console.error("Erro completo:", error);
          onClose();
        } finally {
          setIsInitializing(false);
        }
      };

      createPreference();
    }
  }, [isOpen, cvDataId, amount, onClose]);


  const customization = {
    paymentMethods: {
      pix: "all",
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Finalizar Pagamento
          </DialogTitle>
          <DialogDescription>
            Você está a um passo de destacar sua carreira.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isInitializing && (
            <div className="text-center p-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
               <p className="text-gray-600">Preparando pagamento...</p>
            </div>
          )}

          {preferenceId && (
            <Payment
              initialization={{
                amount: amount,
                preferenceId: preferenceId,
              }}
              customization={customization}
              onSubmit={async () => {
                 onSuccess(); 
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
