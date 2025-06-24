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
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-incluo-navy mb-2">
                Endereço
              </Label>
              <Input
                placeholder="Ex: São Paulo, SP, Brasil"
                value={data.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
              />
              <p className="text-xs text-incluo-gray mt-2">
                Apenas a cidade e estado são suficientes. Usado para vagas na sua região.
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-incluo-navy mb-2">
                Cargo ou Título
              </Label>
              <Input
                type="text"
                placeholder="Ex: Desenvolvedor(a) Full-Stack Sênior"
                value={data.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
              />
              <p className="text-xs text-incluo-gray mt-2">
                O título que aparece logo abaixo do seu nome.
              </p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-incluo-navy mb-2">
              Resumo Profissional *
            </Label>
            <Textarea
              placeholder="Faça um resumo de 2 a 4 parágrafos sobre sua trajetória, principais habilidades e objetivos. Este é um dos campos mais importantes!"
              value={data.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent h-40 resize-none"
            />
            <p className="text-xs text-incluo-gray mt-2">
              Capriche! Usaremos este texto como base para a inteligência artificial criar uma carta de apresentação e um resumo para o seu LinkedIn.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
