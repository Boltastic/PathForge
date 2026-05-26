import { CareerMatch, CareerRoadmap, Badge, GapAnalysisResult } from "./types";

export const DEFAULT_USER_PROFILE = {
  interests: "Coding, solving complex puzzles, artificial intelligence, content creation",
  skills: "JavaScript, React, problem-solving, UI/UX fundamentals, writing",
  hobbies: "Gaming, hiking, reading tech blogs, filming videos",
  education: "Bachelor's Degree",
  salaryGoal: "120,000",
  country: "United States",
  workStyle: "Remote Preferred",
  lifestyle: "Digital nomad, flexible schedule, time for outdoor exploration",
  onboarded: false,
  realisticMode: false,
};

export const DEFAULT_CAREER_MATCHES: CareerMatch[] = [
  {
    title: "AI Solutions Architect",
    category: "Engineering",
    compatibilityScore: 94,
    salaries: {
      entry: 95000,
      mid: 154000,
      senior: 220000,
    },
    growthOutlook: "Explosive +32% YoY",
    description: "Designing, customising, and deploying custom Generative AI agents and Large Language Model fine-tuning workflows for enterprise teams.",
    requiredSkills: ["Python", "Prompt Engineering", "OpenAI / Gemini APIs", "Vector Databases", "System Integration"],
    whyFits: "Utilises your love for coding, complex AI solving mechanisms, and system storytellers to bridge raw models with actual human needs.",
    aiImpact: {
      riskScore: 8,
      explanation: "Since this path designs and governs AI models directly, it possesses excellent future immunity and is highly insulated against technology replacements.",
      stabilityScore: 98,
    },
    stressScore: 40,
    wlbScore: 90,
    lifestyleFit: "Perfectly accommodates digital nomad goals. Almost 85% of AI infrastructure projects are fully remote.",
  },
  {
    title: "Product Experience Architect (UX)",
    category: "Design",
    compatibilityScore: 88,
    salaries: {
      entry: 78000,
      mid: 118000,
      senior: 175000,
    },
    growthOutlook: "High +18% YoY",
    description: "Structuring human-centered product blueprints, high-fidelity prototypes, and conversational system interfaces for modern sass platforms.",
    requiredSkills: ["Figma & Prototyping", "User Research", "Interaction Design", "Design Systems", "HTML/CSS basics"],
    whyFits: "Directly implements your UI/UX fundamentals, creative visual hobbies, and story design interests.",
    aiImpact: {
      riskScore: 25,
      explanation: "AI accelerates screen-drawing, but user empathy, deep customer interviews, and brand experience design require high human logic and emotional intuition.",
      stabilityScore: 86,
    },
    stressScore: 30,
    wlbScore: 95,
    lifestyleFit: "Highly flexible hours, allowing ample time for reading, gaming, and hiking retreats.",
  },
  {
    title: "Cybersecurity Analyst & Threat Hunter",
    category: "Security",
    compatibilityScore: 82,
    salaries: {
      entry: 82000,
      mid: 125000,
      senior: 190000,
    },
    growthOutlook: "Exponential (Severe Talent Shortage)",
    description: "Securing modern cloud platforms and digital perimeters, proactively identifying security vulnerabilities, and responding to data anomalies.",
    requiredSkills: ["Network Security", "Ethical Hacking", "Cloud Architecture (AWS/GCP)", "SIEM tools", "Linux Diagnostics"],
    whyFits: "Caters perfectly to your 'puzzles and problem solving' interests, providing a gamified detective style workflow.",
    aiImpact: {
      riskScore: 15,
      explanation: "AI will automate simple log scanning, but complex security audits and physical perimeter penetration testing are highly secure from AI replacement.",
      stabilityScore: 93,
    },
    stressScore: 65,
    wlbScore: 78,
    lifestyleFit: "Remote friendly, but on-call duties could occasionally disrupt completely disconnected hiking travels.",
  },
  {
    title: "Technical Content Creator & Developer Advocate",
    category: "Creative",
    compatibilityScore: 80,
    salaries: {
      entry: 70000,
      mid: 105000,
      senior: 155000,
    },
    growthOutlook: "Stable / Growing",
    description: "Writing documentation, producing engaging video walkthroughs, and building open-source examples to foster product developer communities.",
    requiredSkills: ["Public Speaking", "Video Editing", "Technical Writing", "React / JavaScript", "Community Moderation"],
    whyFits: "Harmonizes your filming videos hobby with writing, coding, and story presentation skills.",
    aiImpact: {
      riskScore: 45,
      explanation: "AI outputs code blocks quickly, but human-led reviews, developer empathy, and engaging presentation are irreplaceable by AI agents.",
      stabilityScore: 75,
    },
    stressScore: 45,
    wlbScore: 85,
    lifestyleFit: "Exceptional match for full creative freedom and digital nomad lifestyle, recording content from anywhere globally.",
  },
];

export const DEFAULT_ROADMAPS: Record<string, CareerRoadmap> = {
  "AI Solutions Architect": {
    careerTitle: "AI Solutions Architect",
    timeline: "8 Months",
    phases: [
      {
        phaseName: "Phase 1: Python and Data Engineering Essentials",
        duration: "Months 1 - 2",
        skillsToLearn: ["Python Foundations", "Vector Database Structuring (Pinecone, Chroma)", "Pandas & Numpy", "JSON parsing"],
        projects: [
          {
            name: "Enterprise Data Parser",
            description: "Build an automated python pipeline that parses complex raw PDF folders into clean segmented JSON nodes for embeddings.",
          },
        ],
        certificationsRecommended: ["Python Institute PCEP", "DeepLearning.AI LangChain Integration"],
      },
      {
        phaseName: "Phase 2: Large Language Model Prompt Engineering & Orchestration",
        duration: "Months 3 - 4",
        skillsToLearn: ["Structured System Prompts", "Retrieval-Augmented Generation (RAG)", "LangChain Framework", "Gemini & OpenAI API SDKs"],
        projects: [
          {
            name: "RAG Knowledge Base Chatbot",
            description: "Build a persistent web console proxying local text resources to feed relevant custom context into Gemini system responses.",
          },
        ],
        certificationsRecommended: ["Google Cloud Certified Professional Machine Learning (Basics)"],
      },
      {
        phaseName: "Phase 3: Agentic Frameworks and Multi-Agent Orchestration",
        duration: "Months 5 - 6",
        skillsToLearn: ["AutoGen / CrewAI setup", "Function Calling Mechanisms", "State Machines", "Caching Strategy"],
        projects: [
          {
            name: "Autodoc AI Agent Network",
            description: "Establish 3 coordinate AI agents (Researcher, Writer, Reviewer) that collaborate via automated chat logs list to write comprehensive wikis.",
          },
        ],
        certificationsRecommended: ["PathForge AI Solutions Specialist Badge"],
      },
      {
        phaseName: "Phase 4: Cloud Security, Deployments and Scale Testing",
        duration: "Months 7 - 8",
        skillsToLearn: ["Docker Containerisation", "API Gateway Caching", "LLM Security Guardrails (LlamaGuard)", "Cloud Run deployment"],
        projects: [
          {
            name: "SafeAPI Production Gateway",
            description: "Deploy your chatbot server behind a containerised API filter proxy that blocks prompt injection and returns cached completions.",
          },
        ],
        certificationsRecommended: ["AWS Certified Solutions Architect - Associate"],
      },
    ],
    branchingPaths: [
      {
        pathName: "Junior Generative Developer (0-2 years)",
        description: "Focuses on writing prompt templates, hooking up vector databases, and managing simple node backend routes. Salary range: $85k - $110k.",
      },
      {
        pathName: "Applied AI Solutions Architect (2-5 years)",
        description: "Designs full RAG pipelines, configures agent collaboration logic, security controls, and advises enterprise client systems. Salary range: $130k - $185k.",
      },
      {
        pathName: "Director of Cognitive Systems (5+ years)",
        description: "Owns strategic direction of organizational AI deployments, managing engineering cohorts, model evaluation metrics, and licensing. Salary range: $200k+.",
      },
    ],
  },
  "Product Experience Architect (UX)": {
    careerTitle: "Product Experience Architect (UX)",
    timeline: "6 Months",
    phases: [
      {
        phaseName: "Phase 1: Interaction Foundations",
        duration: "Month 1 - 2",
        skillsToLearn: ["UX Principles (Gestalt, Heuristics)", "Figma Design Tools", "Wireframing", "User Flow Diagrams"],
        projects: [
          {
            name: "Eco-App Interactive Wireframes",
            description: "Design low-fidelity layout concepts of a localized grocery carbon tracker, mapping user onboarding to results screens.",
          },
        ],
        certificationsRecommended: ["Google UX Design Professional Certificate"],
      },
      {
        phaseName: "Phase 2: High-Fidelity & Design Systems",
        duration: "Month 3 - 4",
        skillsToLearn: ["Auto-layout & Variables in Figma", "Component Architecture", "Interactive Prototype Physics", "Micro-typography"],
        projects: [
          {
            name: "Modular SASS Dashboard Theme style",
            description: "Design a fully customizable, responsive bento style landing dashboard UI kit equipped with atomic variants for buttons and charts.",
          },
        ],
        certificationsRecommended: ["Figma Design Systems Intermediate Course"],
      },
      {
        phaseName: "Phase 3: Human Research and Testing Integration",
        duration: "Month 5 - 6",
        skillsToLearn: ["Usability Testing", "Heatmaps & Click Metrics", "A/B Testing Strategies", "Development Handoff spec"],
        projects: [
          {
            name: "Handoff Ready UI Walkthrough",
            description: "Conduct actual user walkthroughs on your mockup, index specific pain points, and write deep component alignment sheets for engineers.",
          },
        ],
        certificationsRecommended: ["Interaction Design Foundation Membership Cert"],
      },
    ],
    branchingPaths: [
      {
        pathName: "Junior UX/UI Designer",
        description: "Creating prototypes, designing screens, and preparing vectors based on templates. Salary range: $65k - $85k.",
      },
      {
        pathName: "Product UX Architect",
        description: "Directing interaction research, designing new system capabilities, and leading user interviews. Salary range: $110k - $150k.",
      },
      {
        pathName: "Chief Experience Officer (CXO)",
        description: "Leading branding strategies, cross-team product pathways, and governing organizational growth. Salary range: $180k+.",
      },
    ],
  },
};

export const DEFAULT_BADGES: Badge[] = [
  {
    id: "ignite",
    title: "Forge Spark",
    description: "Completed your first onboarding questionnaire and generated career path profiles.",
    iconName: "Zap",
    unlockedAt: new Date().toISOString(),
  },
  {
    id: "strikestreak",
    title: "Continuous Learner",
    description: "Maintained a 5-day skill learning dashboard study cycle streak.",
    iconName: "Flame",
  },
  {
    id: "gap_audited",
    title: "Immunity Inspector",
    description: "Successfully carried out an automated Skill Gap analysis on your credentials.",
    iconName: "ShieldCheck",
  },
  {
    id: "ai_immune",
    title: "AI Immune Badge",
    description: "Identified a career match that excels in AI automation stability (>90%).",
    iconName: "Lock",
  },
];

export const MOCK_COMPARISONS = [
  {
    name: "AI Architect",
    income: 9.5,
    stress: 4.5,
    wlb: 8.5,
    aiSafety: 9.8,
    demand: 9.6,
  },
  {
    name: "UX Architect",
    income: 7.8,
    stress: 3.0,
    wlb: 9.2,
    aiSafety: 8.5,
    demand: 8.0,
  },
  {
    name: "Cyber Incident Responder",
    income: 8.5,
    stress: 7.5,
    wlb: 6.5,
    aiSafety: 9.2,
    demand: 9.0,
  },
];

export const MOCK_GAP_RESULT: GapAnalysisResult = {
  gapScore: 68,
  missingSkills: ["Python Programming", "Enterprise Vector Indices", "API Authentication Logic"],
  recommendations: [
    {
      skillName: "Python Programming",
      actionItem: "Go through interactive exercises covering functions, lists, and dict formats in Python.",
      resources: ["Official Python Quickstart Guide", "Kaggle Python Essentials"],
    },
    {
      skillName: "Enterprise Vector Indices",
      actionItem: "Configure a local index in Pinecone, store sample vectors, and perform query similarity scans.",
      resources: ["Pinecone Developer Foundations", "LangChain Vector DB Walkthroughs"],
    },
  ],
  feedback: "Your fundamental knowledge of JavaScript and User Experience design gives you excellent conceptual skills. However, to successfully match a robust AI Solutions Architect path, transitioning into basic Python server management and working with external APIs is your absolute next step.",
};
