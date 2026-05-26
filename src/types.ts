export interface UserProfile {
  interests: string;
  skills: string;
  hobbies: string;
  education: string;
  salaryGoal: string;
  country: string;
  workStyle: string;
  lifestyle: string;
  onboarded: boolean;
  realisticMode: boolean;
}

export interface SalaryRange {
  entry: number;
  mid: number;
  senior: number;
}

export interface AIImpact {
  riskScore: number; // 0 to 100
  explanation: string;
  stabilityScore: number;
}

export interface CareerMatch {
  title: string;
  category: string;
  compatibilityScore: number;
  salaries: SalaryRange;
  growthOutlook: string;
  description: string;
  requiredSkills: string[];
  whyFits: string;
  aiImpact: AIImpact;
  stressScore: number;
  wlbScore: number;
  lifestyleFit: string;
}

export interface RoadmapProject {
  name: string;
  description: string;
}

export interface RoadmapPhase {
  phaseName: string;
  duration: string;
  skillsToLearn: string[];
  projects: RoadmapProject[];
  certificationsRecommended: string[];
}

export interface BranchingPath {
  pathName: string;
  description: string;
}

export interface CareerRoadmap {
  careerTitle: string;
  timeline: string;
  phases: RoadmapPhase[];
  branchingPaths: BranchingPath[];
}

export interface GapRecommendation {
  skillName: string;
  actionItem: string;
  resources: string[];
}

export interface GapAnalysisResult {
  gapScore: number;
  missingSkills: string[];
  recommendations: GapRecommendation[];
  feedback: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt?: string;
}

export interface LearnTask {
  id: string;
  title: string;
  phaseId: string;
  completed: boolean;
}
