import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [error, setError] = useState<string | null>(null);
  const [isDevelopment, setIsDevelopment] = useState(false);
  const isMpInitialized = useRef(false);

  // Verificar se estamos em desenvolvimento
  useEffect(() => {
    setIsDevelopment(import.meta.env.DEV || window.location.hostname === 'localhost');
  }, []);

  // 1. Initialize Mercado Pago (apenas para produção)
  useEffect(() => {
    if (isMpInitialized.current || isDevelopment) return;

    console.log("=== Inicializando Mercado Pago ===");
    console.log("import.meta.env:", import.meta.env);
    console.log("VITE_MERCADO_PAGO_PUBLIC_KEY:", import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY);
    
    const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
    if (publicKey) {
      console.log("Chave pública encontrada, inicializando Mercado Pago...");
      initMercadoPago(publicKey, { locale: 'pt-BR' });
      isMpInitialized.current = true;
      console.log("Mercado Pago inicializado com sucesso");
    } else {
      console.error("VITE_MERCADO_PAGO_PUBLIC_KEY is not set.");
      console.error("Variáveis de ambiente disponíveis:", Object.keys(import.meta.env));
      setError("Erro de configuração do pagamento");
    }
  }, [isDevelopment]);

  // 2. Create Payment Preference when modal opens
  useEffect(() => {
    if (isOpen && cvDataId !== null) {
      console.log("=== Iniciando criação de preferência ===");
      console.log("cvDataId:", cvDataId);
      console.log("amount:", amount);
      console.log("isDevelopment:", isDevelopment);
      
      setIsInitializing(true);
      setPreferenceId(null);
      setError(null);
      
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
            throw new Error(`Erro ao criar preferência: ${response.status}`);
          }

          const responseData = await response.json();
          console.log("Resposta do servidor:", responseData);
          
          if (responseData.id) {
            setPreferenceId(responseData.id);
          } else {
            throw new Error("ID da preferência não recebido");
          }
        } catch (error) {
          console.error("Erro completo:", error);
          setError(error instanceof Error ? error.message : "Erro desconhecido");
        } finally {
          setIsInitializing(false);
        }
      };

      createPreference();
    }
  }, [isOpen, cvDataId, amount, isDevelopment]);

  const handlePaymentSubmit = async (formData: any) => {
    try {
      console.log("Pagamento submetido:", formData);
      onSuccess();
    } catch (error) {
      console.error("Erro no pagamento:", error);
      setError("Erro ao processar pagamento");
    }
  };

  const handlePaymentError = (error: any) => {
    console.error("Erro no pagamento:", error);
    setError("Erro no processamento do pagamento");
  };

  const handleMockPayment = () => {
    console.log("Pagamento simulado realizado");
    onSuccess();
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isInitializing && (
            <div className="text-center p-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
               <p className="text-gray-600">Preparando pagamento...</p>
            </div>
          )}

          {preferenceId && !isInitializing && (
            <>
              {isDevelopment ? (
                // Modo desenvolvimento: PIX simulado
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                    <p className="text-sm font-medium">Modo Desenvolvimento</p>
                    <p className="text-xs mt-1">Pagamento PIX simulado para testes</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Valor do PIX</Label>
                      <Input 
                        value={`R$ ${amount.toFixed(2)}`} 
                        readOnly 
                        className="font-mono"
                      />
                    </div>
                    
                    <div>
                      <Label>Chave PIX (Simulada)</Label>
                      <Input 
                        value="destacacv@teste.com" 
                        readOnly 
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label>Código PIX (Simulado)</Label>
                      <Input 
                        value="00020126580014br.gov.bcb.pix0136destacacv@teste.com52040000530398654054.975802BR5913DestacaCV6008Brasilia62070503***6304ABCD" 
                        readOnly 
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleMockPayment}
                    className="w-full"
                  >
                    Simular Pagamento PIX
                  </Button>
                </div>
              ) : (
                // Modo produção: Mercado Pago real
                <Payment
                  initialization={{
                    amount: amount,
                    preferenceId: preferenceId,
                  }}
                  customization={{
                    paymentMethods: {
                      creditCard: ["hidden"],
                      debitCard: ["hidden"],
                      ticket: ["hidden"],
                      mercadoPago: ["hidden"],
                    },
                  }}
                  onSubmit={handlePaymentSubmit}
                  onError={handlePaymentError}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
