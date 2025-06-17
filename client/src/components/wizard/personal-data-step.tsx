import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonalData } from "@/types/cv-data";

interface PersonalDataStepProps {
  data: PersonalData;
  onUpdate: (data: PersonalData) => void;
}

export function PersonalDataStep({ data, onUpdate }: PersonalDataStepProps) {
  const handleChange = (field: keyof PersonalData, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <Card className="shadow-lg border border-gray-200">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-incluo-navy mb-6">Dados Pessoais</h2>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-incluo-navy mb-2">
                Nome Completo *
              </Label>
              <Input
                type="text"
                placeholder="Digite seu nome completo"
                value={data.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-incluo-navy mb-2">
                Email *
              </Label>
              <Input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={data.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-incluo-navy mb-2">
                Telefone *
              </Label>
              <Input
                type="tel"
                placeholder="(11) 99999-9999"
                value={data.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-incluo-navy mb-2">
                LinkedIn
              </Label>
              <Input
                type="url"
                placeholder="https://linkedin.com/in/seuperfil"
                value={data.linkedin}
                onChange={(e) => handleChange("linkedin", e.target.value)}
                className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-incluo-navy mb-2">
              Endereço Completo *
            </Label>
            <Textarea
              placeholder="Rua, número, bairro, cidade, estado, CEP"
              value={data.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent h-24 resize-none"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-incluo-navy mb-2">
              Resumo Profissional *
            </Label>
            <Textarea
              placeholder="Descreva brevemente sua experiência e objetivos profissionais..."
              value={data.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent h-32 resize-none"
            />
            <p className="text-sm text-incluo-gray mt-2">
              Este texto será usado para gerar seu resumo do LinkedIn automaticamente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
