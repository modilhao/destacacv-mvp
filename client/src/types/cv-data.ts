export interface PersonalData {
  name: string;
  title?: string;
  email: string;
  phone: string;
  linkedin?: string;
  address: string;
  summary: string;
}

export interface Experience {
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  course: string;
  institution: string;
  completionDate?: string;
  status: "completed" | "ongoing" | "paused";
}

export interface Language {
  language: string;
  level: "basic" | "intermediate" | "advanced" | "fluent" | "native";
}

export interface Skills {
  technical: string[];
  soft: string[];
}

export interface CVData {
  personalData: PersonalData;
  experiences: Experience[];
  skills: Skills;
  education: Education[];
  languages: Language[];
}

export interface CVSubmission extends CVData {
  email: string;
}
