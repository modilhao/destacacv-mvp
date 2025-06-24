import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { Skills, Education, Language } from "@/types/cv-data";

interface SkillsStepProps {
  skillsData: Skills;
  educationData: Education[];
  languagesData: Language[];
  onUpdateSkills: (data: Skills) => void;
  onUpdateEducation: (data: Education[]) => void;
  onUpdateLanguages: (data: Language[]) => void;
}

export function SkillsStep({
  skillsData,
  educationData,
  languagesData,
  onUpdateSkills,
  onUpdateEducation,
  onUpdateLanguages,
}: SkillsStepProps) {
  const [newTechnicalSkill, setNewTechnicalSkill] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newLanguageLevel, setNewLanguageLevel] = useState<Language["level"]>("basic");

  const addTechnicalSkill = () => {
    if (newTechnicalSkill.trim()) {
      onUpdateSkills({
        ...skillsData,
        technical: [...skillsData.technical, newTechnicalSkill.trim()],
      });
      setNewTechnicalSkill("");
    }
  };

  const removeTechnicalSkill = (index: number) => {
    onUpdateSkills({
      ...skillsData,
      technical: skillsData.technical.filter((_, i) => i !== index),
    });
  };

  const addSoftSkill = () => {
    if (newSoftSkill.trim()) {
      onUpdateSkills({
        ...skillsData,
        soft: [...skillsData.soft, newSoftSkill.trim()],
      });
      setNewSoftSkill("");
    }
  };

  const removeSoftSkill = (index: number) => {
    onUpdateSkills({
      ...skillsData,
      soft: skillsData.soft.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    const newEducation: Education = {
      course: "",
      institution: "",
      completionDate: "",
      status: "completed",
    };
    onUpdateEducation([...educationData, newEducation]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newData = educationData.map((edu, i) => {
      if (i === index) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    onUpdateEducation(newData);
  };

  const removeEducation = (index: number) => {
    onUpdateEducation(educationData.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      onUpdateLanguages([
        ...languagesData,
        { language: newLanguage.trim(), level: newLanguageLevel },
      ]);
      setNewLanguage("");
      setNewLanguageLevel("basic");
    }
  };

  const removeLanguage = (index: number) => {
    onUpdateLanguages(languagesData.filter((_, i) => i !== index));
  };

  return (
    <Card className="shadow-lg border border-gray-200">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-incluo-navy mb-6">Habilidades e Competências</h2>

        <div className="space-y-8">
          {/* Technical Skills */}
          <div>
            <Label className="text-sm font-medium text-incluo-navy mb-4 block">
              Habilidades Técnicas
            </Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {skillsData.technical.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-incluo-orange/10 text-incluo-orange hover:bg-incluo-orange/20 flex items-center gap-1"
                >
                  {skill}
                  <X
                    size={14}
                    className="cursor-pointer hover:text-red-500"
                    onClick={() => removeTechnicalSkill(index)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Digite uma habilidade técnica"
                value={newTechnicalSkill}
                onChange={(e) => setNewTechnicalSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTechnicalSkill()}
                className="flex-1 focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
              />
              <Button
                onClick={addTechnicalSkill}
                className="bg-incluo-orange hover:bg-incluo-orange/90 text-white"
              >
                <Plus size={16} />
              </Button>
            </div>
            <p className="text-xs text-incluo-gray mt-2">
              Ex: React, Node.js, Gestão de Projetos, Power BI, etc.
            </p>
          </div>

          {/* Soft Skills */}
          <div>
            <Label className="text-sm font-medium text-incluo-navy mb-4 block">
              Habilidades Comportamentais
            </Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {skillsData.soft.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-incluo-teal/10 text-incluo-teal hover:bg-incluo-teal/20 flex items-center gap-1"
                >
                  {skill}
                  <X
                    size={14}
                    className="cursor-pointer hover:text-red-500"
                    onClick={() => removeSoftSkill(index)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Digite uma habilidade comportamental"
                value={newSoftSkill}
                onChange={(e) => setNewSoftSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSoftSkill()}
                className="flex-1 focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
              />
              <Button
                onClick={addSoftSkill}
                className="bg-incluo-teal hover:bg-incluo-teal/90 text-white"
              >
                <Plus size={16} />
              </Button>
            </div>
            <p className="text-xs text-incluo-gray mt-2">
              Ex: Comunicação, Trabalho em Equipe, Liderança, Resolução de Problemas, etc.
            </p>
          </div>

          {/* Education */}
          <div>
            <Label className="text-sm font-medium text-incluo-navy mb-4 block">
              Formação Acadêmica
            </Label>
            <div className="space-y-4">
              {educationData.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <Input
                      placeholder="Ex: Bacharelado em Ciência da Computação"
                      value={edu.course}
                      onChange={(e) => updateEducation(index, "course", e.target.value)}
                      className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
                    />
                    <Input
                      placeholder="Ex: Universidade de São Paulo (USP)"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, "institution", e.target.value)}
                      className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-incluo-gray mb-1">Data de Conclusão</Label>
                      <Input
                        type="month"
                        value={edu.completionDate}
                        onChange={(e) => updateEducation(index, "completionDate", e.target.value)}
                        className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-incluo-gray mb-1">Status</Label>
                      <Select
                        value={edu.status}
                        onValueChange={(value) => updateEducation(index, "status", value)}
                      >
                        <SelectTrigger className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="ongoing">Em andamento</SelectItem>
                          <SelectItem value="paused">Trancado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X size={16} className="mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={addEducation}
              variant="ghost"
              className="mt-4 text-incluo-teal hover:text-incluo-teal/80"
            >
              <Plus size={16} className="mr-2" />
              Adicionar Formação
            </Button>
          </div>

          {/* Languages */}
          <div>
            <Label className="text-sm font-medium text-incluo-navy mb-4 block">
              Idiomas
            </Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {languagesData.map((lang, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 flex items-center gap-1"
                >
                  {lang.language} - {lang.level}
                  <X
                    size={14}
                    className="cursor-pointer hover:text-red-500"
                    onClick={() => removeLanguage(index)}
                  />
                </Badge>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              <Input
                placeholder="Ex: Inglês"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent"
              />
              <Select
                value={newLanguageLevel}
                onValueChange={(value) => setNewLanguageLevel(value as Language["level"])}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-incluo-orange focus:border-transparent">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                  <SelectItem value="fluent">Fluente</SelectItem>
                  <SelectItem value="native">Nativo</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={addLanguage}
                className="bg-incluo-orange hover:bg-incluo-orange/90 text-white"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
