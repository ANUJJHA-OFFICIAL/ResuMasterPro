export interface UserProfile {
  uid: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    nationality: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    profilePic?: string;
    coverPic?: string;
  };
  summary?: string;
  education: Education[];
  experience: Experience[];
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  projects: Project[];
  leadership: Leadership[];
  awards: Award[];
  achievements: Achievement[];
  additional: {
    certifications: string[];
    publications: string[];
    languages: string[];
    hobbies: string[];
  };
  completionPercentage: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  grade: string;
  achievements?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  department?: string;
}

export interface Project {
  id: string;
  title: string;
  role: string;
  techStack: string[];
  description: string;
  links?: {
    demo?: string;
    github?: string;
  };
}

export interface Leadership {
  id: string;
  role: string;
  organization: string;
  description: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
  type: 'hackathon' | 'quiz' | 'competition' | 'participation' | 'other';
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  role: string;
  template: string;
  type: 'chronological' | 'functional' | 'combination';
  data: UserProfile;
  createdAt: number;
  updatedAt: number;
}
