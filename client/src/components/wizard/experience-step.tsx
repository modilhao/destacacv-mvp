import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { Experience } from "@/types/cv-data";

interface ExperienceStepProps {
  data: Experience[];
  onUpdate: (data: Experience[]) => void;
}

export function ExperienceStep({ data, onUpdate }: ExperienceStepProps) {
  const addExperience = () => {
    const newExperience: Experience = {
      position: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    onUpdate([...data, newExperience]);
  };

  const removeExperience = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onUpdate(newData);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | boolean) => {
    const newData = data.map((exp, i) => {
      if (i === index) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    onUpdate(newData);
  };

  return (
    <Card className="shadow-lg border border-gray-200">
      <CardContent className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-incluo-navy">Experiência Profissional</h2>
          <Button
            onClick={addExperience}
            className="bg-incluo-teal hover:bg-incluo-teal/90 text-white"
          >
            <Plus size={16} className="mr-2" />
            Adicionar
          </Button>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-8 text-incluo-gray">
            <p>Nenhuma experiência adicionada ainda.</p>
            <p className="text-sm mt-2">Clique em "Adicionar" para começar.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((experience, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <Label className="text-sm font-medium text-incluo-navy mb-2">
                      Cargo *
                    </Label>
                    <Input
                      type="text"
                      placeholder="Ex: Desenvolvedor Frontend"
                      value={experience.position}
                      onChange={(e) => updateExperience(index, "position", e.target.value)}
                      className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-incluo-navy mb-2">
                      Empresa *
                    </Label>
                    <Input
                      type="text"
                      placeholder="Nome da empresa"
                      value={experience.company}
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                      className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <Label className="text-sm font-medium text-incluo-navy mb-2">
                      Data Início *
                    </Label>
                    <Input
                      type="month"
                      value={experience.startDate}
                      onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                      className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-incluo-navy mb-2">
                      Data Fim
                    </Label>
                    <Input
                      type="month"
                      value={experience.endDate}
                      onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                      disabled={experience.current}
                      className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`current-${index}`}
                        checked={experience.current}
                        onCheckedChange={(checked) => updateExperience(index, "current", checked as boolean)}
                      />
                      <Label htmlFor={`current-${index}`} className="text-sm text-incluo-gray">
                        Emprego atual
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <Label className="text-sm font-medium text-incluo-navy mb-2">
                    Descrição das Atividades *
                  </Label>
                  <Textarea
                    placeholder="Ex: Desenvolvi e mantive interfaces de usuário responsivas usando React e TypeScript, resultando em uma melhoria de 20% na performance. Colaborei em equipes ágeis para entregar novas funcionalidades..."
                    value={experience.description}
                    onChange={(e) => updateExperience(index, "description", e.target.value)}
                    className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent h-32 resize-none"
                  />
                  <p className="text-xs text-incluo-gray mt-2">
                    Descreva suas responsabilidades e, mais importante, suas conquistas. Use números para quantificar seu impacto sempre que possível.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => removeExperience(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
