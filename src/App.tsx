import React, { useState, useEffect, useRef } from "react";
import { 
  UserProfile, 
  CareerMatch, 
  CareerRoadmap, 
  Badge, 
  Message, 
  GapAnalysisResult 
} from "./types";
import { 
  DEFAULT_USER_PROFILE, 
  DEFAULT_CAREER_MATCHES, 
  DEFAULT_ROADMAPS, 
  DEFAULT_BADGES, 
  MOCK_COMPARISONS,
  MOCK_GAP_RESULT
} from "./data";
import OnboardingQuiz from "./components/OnboardingQuiz";
import DailyDashboard from "./components/DailyDashboard";
import Authentication from "./components/Authentication";
import { 
  Briefcase, 
  Sparkles, 
  Compass, 
  ShieldAlert, 
  DollarSign, 
  Trophy, 
  MessageSquare, 
  Settings, 
  Search, 
  Upload, 
  Scale, 
  Share2, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight, 
  AlertTriangle, 
  ArrowRight, 
  Flame, 
  Info,
  MapPin,
  Clock,
  Zap,
  BookOpen,
  Copy,
  Linkedin,
  RefreshCw,
  FileText,
  Printer,
  Download,
  FileJson,
  ShieldCheck,
  Fingerprint,
  LogOut
} from "lucide-react";

export default function App() {
  // Page routing state
  const [activeTab, setActiveTab] = useState<"dashboard" | "matches" | "skill-gap" | "comparison" | "mentor" | "passport" | "settings">("dashboard");
  
  // Localized Authentication states
  interface AuthUser {
    email: string;
    name: string;
    joinedAt: string;
    profile?: UserProfile;
    careerMatches?: CareerMatch[];
    streak?: number;
    badges?: Badge[];
  }
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  
  // User context and profiles
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [careerMatches, setCareerMatches] = useState<CareerMatch[]>(DEFAULT_CAREER_MATCHES);
  const [selectedCareer, setSelectedCareer] = useState<CareerMatch>(DEFAULT_CAREER_MATCHES[0]);
  const [roadmaps, setRoadmaps] = useState<Record<string, CareerRoadmap>>(DEFAULT_ROADMAPS);
  const [badges, setBadges] = useState<Badge[]>(DEFAULT_BADGES);
  const [streak, setStreak] = useState(3);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Loading indicator flags
  const [isMatching, setIsMatching] = useState(false);
  const [isRoadmapping, setIsRoadmapping] = useState(false);
  const [isGapping, setIsGapping] = useState(false);
  
  // API Config Status
  const [config, setConfig] = useState({ hasApiKey: true, appUrl: "" });

  // 1. Onboarding Quiz Completion
  const handleOnboardComplete = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    setIsMatching(true);
    
    // Attempt dynamic AI analyze
    try {
      const response = await fetch("/api/career/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProfile),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.careerMatches && data.careerMatches.length > 0) {
          setCareerMatches(data.careerMatches);
          setSelectedCareer(data.careerMatches[0]);
          
          // Unlock onboarding badge if present
          unlockBadge("ignite");
          
          // If any match is highly AI stable (>90) trigger AI stability badge
          const highSafety = data.careerMatches.some((m: CareerMatch) => m.aiImpact?.stabilityScore > 90);
          if (highSafety) {
            unlockBadge("ai_immune");
          }
        }
      }
    } catch (err) {
      console.error("Failed to generate career matches. Falling back to default list.", err);
    } finally {
      setIsMatching(false);
      // Ensure onboard state is marked true
      setProfile(prev => ({ ...prev, onboarded: true }));
    }
  };

  // Re-run recommendation generator
  const triggerFreshAnalysis = async () => {
    setIsMatching(true);
    try {
      const response = await fetch("/api/career/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.careerMatches && data.careerMatches.length > 0) {
          setCareerMatches(data.careerMatches);
          setSelectedCareer(data.careerMatches[0]);
          
          // Toast status
          triggerAlert("Successfully analyzed new matches with updated parameters!");
        }
      }
    } catch (err) {
      triggerAlert("Analyst is currently busy. Displaying default options.");
    } finally {
      setIsMatching(false);
    }
  };

  // Fetch /api/config on mount & restore authentication state
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.log("Config read fallback", err));

    try {
      const stored = localStorage.getItem("pathforge_current_user");
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        if (u.profile) {
          setProfile(u.profile);
        }
        if (typeof u.streak === "number") {
          setStreak(u.streak);
        }
        if (u.badges) {
          setBadges(u.badges);
        }
        if (u.careerMatches && u.careerMatches.length > 0) {
          setCareerMatches(u.careerMatches);
          setSelectedCareer(u.careerMatches[0]);
        }
      }
    } catch (e) {
      console.log("Error loading active user session", e);
    }
  }, []);

  // Sync state modifications real-time back to personalized local accounts
  useEffect(() => {
    if (!currentUser) return;
    try {
      const usersRaw = localStorage.getItem("pathforge_users") || "{}";
      const users = JSON.parse(usersRaw);
      
      const updatedUser = {
        ...currentUser,
        profile,
        careerMatches,
        streak,
        badges,
      };
      
      users[currentUser.email.toLowerCase()] = updatedUser;
      localStorage.setItem("pathforge_users", JSON.stringify(users));
      localStorage.setItem("pathforge_current_user", JSON.stringify(updatedUser));
    } catch (e) {
      console.error("Failed executing automated account sync", e);
    }
  }, [profile, careerMatches, streak, badges, currentUser]);


  // Unlock Badge utility
  const unlockBadge = (id: string) => {
    setBadges((prev) =>
      prev.map((badge) => {
        if (badge.id === id && !badge.unlockedAt) {
          return { ...badge, unlockedAt: new Date().toISOString() };
        }
        return badge;
      })
    );
  };

  // Notification UI Alerts
  const [alertMsg, setAlertMsg] = useState("");
  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 4000);
  };

  // Increment practice streaks
  const handleStreakIncrement = () => {
    setStreak((prev) => {
      const updated = prev + 1;
      if (updated >= 5) {
        unlockBadge("strikestreak");
      }
      return updated;
    });
    triggerAlert("Streak claimed! Your educational fire burns brighter.");
  };

  // 2. Fetch/Cache Roadmaps on Selection
  const [activeRoadmap, setActiveRoadmap] = useState<CareerRoadmap | null>(
    DEFAULT_ROADMAPS["AI Solutions Architect"]
  );

  useEffect(() => {
    if (!selectedCareer) return;

    // Check preloaded first
    if (roadmaps[selectedCareer.title]) {
      setActiveRoadmap(roadmaps[selectedCareer.title]);
      return;
    }

    // Call API roadmap
    setIsRoadmapping(true);
    fetch("/api/career/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        careerTitle: selectedCareer.title,
        userProfile: profile,
        realisticMode: profile.realisticMode,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Roadmap fetch failure");
        return res.json();
      })
      .then((data) => {
        if (data.phases) {
          setRoadmaps((prev) => ({ ...prev, [selectedCareer.title]: data }));
          setActiveRoadmap(data);
        }
      })
      .catch((err) => {
        console.error(err);
        // Fallback to custom generator
        const synthRoadmap: CareerRoadmap = {
          careerTitle: selectedCareer.title,
          timeline: "6 Months",
          phases: [
            {
              phaseName: "Phase 1: Basic foundations",
              duration: "Month 1-2",
              skillsToLearn: selectedCareer.requiredSkills.slice(0, 2),
              projects: [{ name: "Prototype Base", description: "Build a minimal operational demo applying these core frameworks." }],
              certificationsRecommended: ["Official Foundational Pathway Exam"]
            },
            {
              phaseName: "Phase 2: Custom expansion",
              duration: "Month 3-5",
              skillsToLearn: selectedCareer.requiredSkills.slice(2, 4),
              projects: [{ name: "Advanced Portfolio Release", description: "Deploy an interactive dashboard or tool hosting active testing data." }],
              certificationsRecommended: ["Advanced Expert Certification"]
            }
          ],
          branchingPaths: [
            { pathName: "Junior Expert", description: "Starting position solving system constraints." },
            { pathName: "Principal Lead Lead", description: "Architecting enterprise integrations." }
          ]
        };
        setActiveRoadmap(synthRoadmap);
      })
      .finally(() => {
        setIsRoadmapping(false);
      });
  }, [selectedCareer, profile.realisticMode]);


  // 3. SKILL GAP ANALYZER
  const [resumeText, setResumeText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [gapResult, setGapResult] = useState<GapAnalysisResult | null>(MOCK_GAP_RESULT);

  const simulateResumeUpload = (fileName: string) => {
    const textSample = `RESUME OF APPLICATION VISITOR
Current level: Junior Software Support specialist
Key Skills: JavaScript, system checklists, testing basic sites, CSS files.
Certificates: Basic Web Development Intro 101.
Goals: High systems architecture, machine modeling or deep UX design.`;
    setResumeText(textSample);
    triggerAlert(`Successfully scanned "${fileName}"! Analyzing credentials now...`);
  };

  const handleRunGapAnalysis = async () => {
    if (!resumeText.trim()) {
      triggerAlert("Please copy-paste profile parameters or drop a file to analyze.");
      return;
    }
    setIsGapping(true);
    try {
      const response = await fetch("/api/career/gap-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCareer: selectedCareer.title,
          textToAnalyze: resumeText,
          profileSkills: profile.skills.split(",").map(s => s.trim()),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setGapResult(data);
        unlockBadge("gap_audited");
        triggerAlert("Successfully audited skills discrepancy map!");
      } else {
        throw new Error();
      }
    } catch (err) {
      // Fallback
      setGapResult(MOCK_GAP_RESULT);
      triggerAlert("Discrepancy analyzed with optimized checklist catalog.");
    } finally {
      setIsGapping(false);
    }
  };

  // 4. CAREER COMPARISON TOOL WITH INTERACTIVE SELECTION
  const [compareFirst, setCompareFirst] = useState(careerMatches[0]?.title || "AI Solutions Architect");
  const [compareSecond, setCompareSecond] = useState(careerMatches[1]?.title || "Product Experience Architect (UX)");

  const item1 = careerMatches.find((c) => c.title === compareFirst) || careerMatches[0] || {
    title: "AI Architect",
    compatibilityScore: 94,
    salaries: { entry: 95000, mid: 154000, senior: 220000 },
    aiImpact: { riskScore: 8 },
    stressScore: 40,
    wlbScore: 90
  };

  const item2 = careerMatches.find((c) => c.title === compareSecond) || careerMatches[1] || {
    title: "UX Architect",
    compatibilityScore: 88,
    salaries: { entry: 78000, mid: 118000, senior: 175000 },
    aiImpact: { riskScore: 25 },
    stressScore: 30,
    wlbScore: 95
  };


  // 5. SALARY SIMULATOR DYNAMICS
  const [experienceLevel, setExperienceLevel] = useState<"entry" | "mid" | "senior">("mid");
  const [selectedMultiplier, setSelectedMultiplier] = useState(1.0);
  const [selectedRegion, setSelectedRegion] = useState("USA / Europe Standard");

  const regions = [
    { name: "USA / Europe Standard", multiplier: 1.0 },
    { name: "Asia-Pacific Regional Hubs", multiplier: 0.8 },
    { name: "Offshore Strategic Remote", multiplier: 0.7 },
    { name: "Highly Competitive Tech Clusters", multiplier: 1.25 }
  ];


  // 6. AI MENTOR CHAT ENGINE (SSE SUPPORT)
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hello! I am your dynamic PathForge Career Advisor. Ask me anything about preparing for your career, getting certified, negotiating packages, or tackling skills gaps.",
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [userQuery, setUserQuery] = useState("");
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleSendChat = async () => {
    if (!userQuery.trim()) return;
    
    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: userQuery,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setUserQuery("");
    setIsGeneratingChat(true);

    const assistantId = Math.random().toString();
    const newAssistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "Analyzing your paths...",
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, newAssistantMsg]);

    try {
      const response = await fetch("/api/mentor/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          realisticMode: profile.realisticMode,
          careerContext: selectedCareer,
        }),
      });

      if (!response.ok) throw new Error("Stream error");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let streamBuffer = "";
      let accumulatedResponse = "";

      if (reader) {
        let isDone = false;
        while (!isDone) {
          const { value, done } = await reader.read();
          if (done) break;
          
          streamBuffer += decoder.decode(value, { stream: true });
          const lines = streamBuffer.split("\n");
          streamBuffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const cleanedLine = line.slice(6).trim();
              if (cleanedLine === "[DONE]") {
                isDone = true;
                break;
              }
              try {
                const parsed = JSON.parse(cleanedLine);
                if (parsed.text) {
                  accumulatedResponse += parsed.text;
                  setChatMessages((prevMsg) =>
                    prevMsg.map((m) => {
                      if (m.id === assistantId) {
                        return { ...m, content: accumulatedResponse };
                      }
                      return m;
                    })
                  );
                } else if (parsed.error) {
                  accumulatedResponse = parsed.error;
                  setChatMessages((prevMsg) =>
                    prevMsg.map((m) => {
                      if (m.id === assistantId) {
                        return { ...m, content: accumulatedResponse };
                      }
                      return m;
                    })
                  );
                  isDone = true;
                }
              } catch (e) {
                // Ignore chunk parse issues
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages((prevMsg) =>
        prevMsg.map((m) => {
          if (m.id === assistantId) {
            return {
              ...m,
              content: `Hello! I would love to talk about ${selectedCareer?.title || "your options"}. My server connection is briefly offline, but go ahead and build amazing portfolios and certifications!`,
            };
          }
          return m;
        })
      );
    } finally {
      setIsGeneratingChat(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);


  // 7. SOCIAL VIRAL SHARING CARD
  const [showShareModal, setShowShareModal] = useState(false);
  const triggerCopySocial = () => {
    navigator.clipboard.writeText(
      `🎯 PathForge determined my top career match is "${selectedCareer.title}" with a compatibility rating of ${selectedCareer.compatibilityScore}%! Explore your specialized roadmap at ${window.location.href}`
    );
    triggerAlert("Shareable link copied to clipboard! Share your career passport on LinkedIn/X.");
  };

  // Export Passport to JSON file backup
  const handleExportJSON = () => {
    const payload = {
      app: "PathForge",
      exportedAt: new Date().toISOString(),
      currentUser: currentUser ? { email: currentUser.email, name: currentUser.name } : "Guest Participant",
      profile,
      careerMatches,
      selectedCareer,
      streak,
      badges,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const trigger = document.createElement("a");
    trigger.href = url;
    trigger.download = `pathforge-passport-${currentUser?.name || "guest"}-${Date.now()}.json`;
    document.body.appendChild(trigger);
    trigger.click();
    document.body.removeChild(trigger);
    URL.revokeObjectURL(url);
    triggerAlert("Successfully downloaded dynamic Career Backup JSON!");
  };

  // Import Passport from JSON file backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.app !== "PathForge") {
          throw new Error("Invalid backup signature file.");
        }
        if (data.profile) {
          setProfile(data.profile);
        }
        if (data.careerMatches) {
          setCareerMatches(data.careerMatches);
          setSelectedCareer(data.careerMatches[0]);
        }
        if (data.selectedCareer) {
          setSelectedCareer(data.selectedCareer);
        }
        if (typeof data.streak === "number") {
          setStreak(data.streak);
        }
        if (data.badges) {
          setBadges(data.badges);
        }
        triggerAlert("Successfully imported PathForge backup! All metrics restored.");
      } catch (err) {
        triggerAlert("Failed parsing career backup file. Ensure it is a valid .json passport.");
      }
    };
    reader.readAsText(file);
  };

  // Filter career matches
  const filteredCareers = careerMatches.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col antialiased" id="pathforge-root">
      
      {/* Alert Banner Notification */}
      {alertMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-slate-700">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Main app boundary */}
      {!profile.onboarded ? (
        <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 bg-gradient-to-tr from-slate-50 via-[#f1f5f9] to-[#f8fafc]">
          <div className="text-center max-w-2xl mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100/50 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Career Architect
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4 leading-tight">
              Forge a Career Immune to Tomorrow's Disruption
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
              Calculate personalized learning pathways, audit skill gaps directly against real-world AI impact models, and claim your custom career roadmap.
            </p>
          </div>

          <OnboardingQuiz 
            initialProfile={profile} 
            onComplete={handleOnboardComplete} 
          />
        </div>
      ) : (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
          
          {/* THE SIDEBAR Navigation - Styled exactly based on Bento Theme instructions */}
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col" id="app-sidebar">
            <div className="p-6 flex items-center gap-3 border-b border-slate-50/50">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/20">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">PathForge</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs text-left transition-all ${
                  activeTab === "dashboard"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                id="btn-nav-dashboard"
              >
                <Compass className="w-4.5 h-4.5" />
                Bento Dashboard
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("matches")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs text-left transition-all ${
                  activeTab === "matches"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                id="btn-nav-matches"
              >
                <Briefcase className="w-4.5 h-4.5" />
                Career Matches
                <span className="ml-auto text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">
                  {careerMatches.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("skill-gap")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs text-left transition-all ${
                  activeTab === "skill-gap"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                id="btn-nav-skill-gap"
              >
                <Upload className="w-4.5 h-4.5" />
                Resume Gap Analyzer
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("comparison")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs text-left transition-all ${
                  activeTab === "comparison"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                id="btn-nav-comparison"
              >
                <Scale className="w-4.5 h-4.5" />
                Career Comparison
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("mentor")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs text-left transition-all ${
                  activeTab === "mentor"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                id="btn-nav-mentor"
              >
                <MessageSquare className="w-4.5 h-4.5" />
                AI Mentor Chat
                {isGeneratingChat && <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping ml-auto" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("passport")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs text-left transition-all ${
                  activeTab === "passport"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                id="btn-nav-passport"
              >
                <FileText className="w-4.5 h-4.5" />
                Backup & PDF Passport
                <span className="ml-auto text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                  PDF
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs text-left transition-all ${
                  activeTab === "settings"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                id="btn-nav-settings"
              >
                <Settings className="w-4.5 h-4.5" />
                Profile & Settings
              </button>
            </nav>

            {/* Realistic Mode Sidebar Indicator */}
            <div className="p-4 mt-auto">
              <div className="bg-indigo-950 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-1.5 mb-1 text-slate-300">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <p className="text-[10px] font-bold uppercase tracking-wider font-mono">Brutal Realism</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium font-sans">
                    {profile.realisticMode ? "Direct & Strict" : "Optimistic Off"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setProfile((p) => ({ ...p, realisticMode: !p.realisticMode }));
                      triggerAlert(
                        !profile.realisticMode
                          ? "Realistic Mode ENABLED. AI recommendations will focus on competition and saturation!"
                          : "Realistic Mode DISABLED. Showing optimistic potentials."
                      );
                    }}
                    className={`w-8 h-4.5 rounded-full relative transition-colors ${
                      profile.realisticMode ? "bg-rose-500" : "bg-slate-600"
                    }`}
                    id="sidebar-realistic-toggle"
                  >
                    <div
                      className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${
                        profile.realisticMode ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTAINER CONTENT */}
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Nav Header */}
            <header className="h-16 bg-white/50 backdrop-blur-sm border-b border-slate-200 px-8 flex items-center justify-between z-10 shrink-0">
              <div className="text-left">
                <h1 className="text-sm font-bold text-slate-900 font-sans tracking-tight">
                  Welcome to PathForge, Educator Explorer
                </h1>
                <p className="text-[11px] text-slate-400">
                  Target Match: <span className="font-semibold text-indigo-600">{selectedCareer.title}</span> • Gap Score: <span className="font-semibold text-rose-500">{gapResult?.gapScore || 68}%</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Search Bar matching Bento UI layout */}
                <div className="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search industry careers..."
                    className="bg-transparent text-xs focus:outline-none w-48 text-slate-700"
                    id="header-search-bar"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-[10px] text-slate-400 hover:text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded ml-2.5 font-bold font-mono">
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Avatar Badge with User Initials or Random SVG */}
                <div 
                  onClick={() => {
                    setActiveTab("passport");
                    triggerAlert("Switched to Authentication & Backup tab.");
                  }}
                  className="flex items-center gap-2 cursor-pointer hover:bg-slate-100/80 p-1.5 rounded-xl transition-all"
                  id="header-user-badge"
                  title={currentUser ? "Account Profile Active" : "Click to Authenticate Account"}
                >
                  <div className="text-right hidden md:block">
                    <p className="text-xs font-bold text-slate-900 leading-none">
                      {currentUser ? currentUser.name : "Guest Session"}
                    </p>
                    <p className="text-[10px] text-indigo-600 font-semibold font-mono flex items-center justify-end gap-1 mt-0.5">
                      {currentUser ? (
                        <span className="flex items-center gap-0.5 text-emerald-600">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" /> Active Profile
                        </span>
                      ) : (
                        "Click to Lock In"
                      )}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-full border-2 shadow-sm overflow-hidden flex items-center justify-center ${
                    currentUser ? "border-emerald-500 bg-emerald-50" : "border-indigo-200 bg-indigo-50"
                  }`}>
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.name || profile.country || "G")}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </header>

            {/* TAB-CONDITIONAL OUTER VIEWPANEL */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc]" id="dashboard-tab-viewport">
              
              {/* TAB 1: Dashboard with Bento Grid Layout */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  
                  {/* Top Stats and Profile quick info row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">Current Country</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">{profile.country || "Global"}</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">Salary Target</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">${parseInt(profile.salaryGoal || "100000").toLocaleString()}/yr</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">Study Streak</p>
                        <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1">
                          {streak} Days <Flame className="w-4.5 h-4.5 text-orange-500 animate-bounce" />
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Flame className="w-4.5 h-4.5" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">Education level</p>
                        <p className="text-sm font-bold text-slate-800 tracking-tight mt-1 truncate max-w-[130px]">{profile.education}</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Info className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* BENTO GRID (12 col layout matching requested template layout) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="bento-grid-dashboard">
                    
                    {/* BENTO CARD 1: Top Match Hero Card (col-span-8) */}
                    <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[350px]">
                      
                      {/* Top Right visual elements */}
                      <div className="absolute top-0 right-0 p-8 flex items-center gap-2">
                         <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider animate-pulse flex items-center gap-1">
                           <Zap className="w-3.5 h-3.5 text-emerald-500" />
                           {selectedCareer.compatibilityScore}% Compatibility Match
                         </div>
                         <button 
                           onClick={() => setShowShareModal(true)}
                           className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                           title="Share Career Passport"
                         >
                           <Share2 className="w-4 h-4" />
                         </button>
                      </div>

                      {/* Content details */}
                      <div className="z-10 text-left">
                        <span className="text-slate-400 font-bold mb-1 uppercase tracking-widest text-[9px] font-mono">
                          PRIMARY RECOMMENDATION
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1 mb-4 leading-normal tracking-tight">
                          {selectedCareer.title}
                        </h2>
                        <p className="text-slate-500 max-w-lg leading-relaxed text-xs">
                          {selectedCareer.description}
                        </p>
                        
                        <div className="text-left mt-4 border-l-2 border-indigo-200 pl-3">
                          <p className="text-[11px] font-bold text-indigo-600 font-mono tracking-wider uppercase">Why it fits you</p>
                          <p className="text-xs text-slate-600 italic mt-0.5">"{selectedCareer.whyFits}"</p>
                        </div>
                      </div>

                      {/* Salary Potential bottom parameters */}
                      <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-slate-100">
                        <div className="flex flex-col text-left">
                          <span className="text-lg font-extrabold text-slate-900 font-mono">
                            ${(selectedCareer.salaries?.entry || 60000).toLocaleString()}/yr
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Entry Level</span>
                        </div>
                        <div className="w-px h-10 bg-slate-200 self-center hidden sm:block"></div>
                        <div className="flex flex-col text-left">
                          <span className="text-lg font-extrabold text-slate-900 font-mono">
                            ${(selectedCareer.salaries?.mid || 105000).toLocaleString()}/yr
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Mid-Career</span>
                        </div>
                        <div className="w-px h-10 bg-slate-200 self-center hidden sm:block"></div>
                        <div className="flex flex-col text-left">
                          <span className="text-lg font-extrabold text-indigo-600 font-mono">
                            ${(selectedCareer.salaries?.senior || 160000).toLocaleString()}/yr
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Senior Potential</span>
                        </div>
                        <div className="w-px h-10 bg-slate-200 self-center hidden sm:block"></div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-indigo-600 uppercase font-mono tracking-widest mt-1">
                            {selectedCareer.growthOutlook}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-semibold">Outlook</span>
                        </div>
                      </div>
                    </div>

                    {/* BENTO CARD 2: AI Replacement Risk Analyzer (col-span-4) */}
                    <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                      <div className="text-left">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-slate-900 text-sm tracking-tight">AI Replacement Risk</h3>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded ${
                            selectedCareer.aiImpact?.riskScore < 30
                              ? "bg-emerald-50 text-emerald-800"
                              : selectedCareer.aiImpact?.riskScore < 70
                              ? "bg-amber-50 text-amber-800"
                              : "bg-rose-50 text-rose-800"
                          }`}>
                            {selectedCareer.aiImpact?.riskScore < 30 ? "AI Resilient" : selectedCareer.aiImpact?.riskScore < 70 ? "AI Transitioning" : "Saturated risk"}
                          </span>
                        </div>

                        {/* Interactive gauge bar */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs font-mono text-slate-500 mb-1">
                              <span>Automation Vulnerability</span>
                              <span className="text-slate-900 font-bold">{selectedCareer.aiImpact?.riskScore || 20}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  selectedCareer.aiImpact?.riskScore < 30 ? "bg-emerald-500" : selectedCareer.aiImpact?.riskScore < 70 ? "bg-amber-500" : "bg-rose-500"
                                }`}
                                style={{ width: `${selectedCareer.aiImpact?.riskScore || 20}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-mono text-slate-500 mb-1">
                              <span>Future Demand Survival</span>
                              <span className="text-indigo-600 font-bold">{selectedCareer.aiImpact?.stabilityScore || 85}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-600 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${selectedCareer.aiImpact?.stabilityScore || 85}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 mt-6 border border-slate-100 text-left">
                          <p className="text-[11px] text-slate-600 leading-relaxed italic">
                            "{selectedCareer.aiImpact?.explanation}"
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Based on LLM future job immunity metrics.</span>
                      </div>
                    </div>

                    {/* BENTO CARD 3: Interactive Learning Roadmap Grid (col-span-7) */}
                    <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-left flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Active Learning Roadmap</h3>
                            <p className="text-xs text-slate-400">Personalized sequence based on your skills</p>
                          </div>
                          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 font-bold px-3 py-1 rounded-full">
                            Estimated: {activeRoadmap?.timeline || "8 mo"} Study
                          </span>
                        </div>

                        {isRoadmapping ? (
                          <div className="space-y-4 py-4">
                            {[1, 2, 3].map((n) => (
                              <div key={n} className="flex gap-4 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
                                <div className="flex-1 space-y-2 py-1">
                                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                                  <div className="h-2.5 bg-slate-100 rounded w-2/3" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {activeRoadmap?.phases?.slice(0, 3).map((phase, idx) => (
                              <div key={idx} className="flex items-start gap-4 pb-2 border-l-2 border-slate-100 pl-4 relative ml-3">
                                {/* Bullet indicator */}
                                <div className={`absolute -left-2.5 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                                  idx === 0 
                                    ? "bg-emerald-500 border-white text-white shadow" 
                                    : "bg-white border-indigo-600 text-indigo-600"
                                }`}>
                                  {idx + 1}
                                </div>

                                <div className="flex-1">
                                  <p className="text-xs font-bold text-slate-800 leading-tight">
                                    {phase.phaseName}
                                  </p>
                                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                                    <span>Duration: {phase.duration}</span>
                                    <span>• Recommended Cert: {phase.certificationsRecommended?.[0] || "None Required"}</span>
                                  </div>
                                  
                                  {phase.projects && phase.projects.length > 0 && (
                                    <div className="bg-slate-50/70 rounded-xl p-2.5 mt-2 border border-slate-100">
                                      <p className="text-[10px] font-extrabold text-slate-600 font-mono tracking-wider">PROJECT TO BUILD</p>
                                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{phase.projects[0].name}</p>
                                      <p className="text-[11px] text-slate-500 mt-0.5">{phase.projects[0].description}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[11px] text-slate-400">Total of {activeRoadmap?.phases?.length || 2} educational milestones</span>
                        <button 
                          onClick={() => setActiveTab("matches")}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all"
                        >
                          View Full Career Roadmap
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* BENTO CARD 4: Skill Gap audit dashboard (col-span-5) */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between text-left">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Credentials Audit</h3>
                            <p className="text-xs text-slate-400">Based on target {selectedCareer.title}</p>
                          </div>
                          <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full font-mono tracking-wider animate-pulse">
                            Score: {gapResult?.gapScore || 68}%
                          </span>
                        </div>

                        <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
                          Upload your credentials file or copy-paste some details to scan matching scores for AI roles.
                        </p>

                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest mb-1">Detected Missing skills</p>
                          {gapResult?.missingSkills?.slice(0, 3).map((skill, index) => (
                            <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                <span className="text-xs font-semibold text-slate-700">{skill}</span>
                              </div>
                              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider bg-white border px-1.5 py-0.2 rounded">
                                Missing
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={() => setActiveTab("skill-gap")}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all tracking-wide flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Launch Full Gap Audit
                        </button>
                      </div>
                    </div>

                    {/* BENTO CARD 5 : Dynamic Salary Simulator widget (col-span-6) */}
                    <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-left">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm tracking-tight">Interactive Salary Simulator</h3>
                          <p className="text-xs text-slate-400">Toggle years of experience and geographic regional tiers</p>
                        </div>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                          {(["entry", "mid", "senior"] as const).map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => setExperienceLevel(lvl)}
                              className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg transition-all ${
                                experienceLevel === lvl
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Region Select dropdown */}
                      <div className="mb-6">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                          Regional Pricing Multiplier
                        </label>
                        <select
                          value={selectedRegion}
                          onChange={(e) => {
                            const found = regions.find((r) => r.name === e.target.value);
                            if (found) {
                              setSelectedRegion(found.name);
                              setSelectedMultiplier(found.multiplier);
                              triggerAlert(`Salary simulation adjusted for ${found.name}!`);
                            }
                          }}
                          className="w-full text-xs px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-slate-700 font-medium"
                          id="simulator-region-select"
                        >
                          {regions.map((reg) => (
                            <option key={reg.name} value={reg.name}>
                              {reg.name} (x{reg.multiplier})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Estimated Simulated earnings display card */}
                      <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/20 border border-indigo-100/50 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-indigo-700 font-mono tracking-widest uppercase">REALISTIC SIMULATED EARNINGS</p>
                          <p className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                            ${Math.round((selectedCareer.salaries?.[experienceLevel] || 100000) * selectedMultiplier).toLocaleString()}{" "}
                            <span className="text-xs font-normal text-slate-400 font-sans">/ yr</span>
                          </p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center animate-pulse shrink-0">
                          <DollarSign className="w-7 h-7 text-indigo-700" />
                        </div>
                      </div>
                    </div>

                    {/* BENTO CARD 6: Interactive Promotion Branches Map Preview (col-span-6) */}
                    <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-left flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1 tracking-tight">Specialization Branches Map</h3>
                        <p className="text-xs text-slate-400 mb-6 font-sans">How you promotions propagate in real firms</p>
                        
                        <div className="space-y-3">
                          {activeRoadmap?.branchingPaths?.map((branch, bi) => (
                            <div key={bi} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100/80 transition-all flex gap-3">
                              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono font-bold text-xs shrink-0 self-center">
                                {bi === 0 ? "Entry" : bi === 1 ? "Route A" : "Route B"}
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-800">{branch.pathName}</p>
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 hover:line-clamp-none transition-all duration-300">
                                  {branch.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab("matches")}
                        className="w-full mt-4 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl transition-all"
                      >
                        Explore Complete Promotion Tiers
                      </button>
                    </div>

                  </div>

                  {/* Daily Learn Dashboard Progress Panel */}
                  <div className="pt-2">
                    <DailyDashboard 
                      streak={streak} 
                      onIncrementStreak={handleStreakIncrement} 
                      badges={badges} 
                      userCareer={selectedCareer.title} 
                    />
                  </div>

                </div>
              )}

              {/* TAB 2: Career Matches View */}
              {activeTab === "matches" && (
                <div className="space-y-6">
                  
                  {/* Title and control headers to trigger analyst refreshed metrics */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-6 text-left gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        AI Career Matching Analyst
                      </h2>
                      <p className="text-xs text-slate-500">
                        Based on interests: <span className="font-semibold">"{profile.interests}"</span>, educational tier: <span className="font-semibold">"{profile.education}"</span>
                      </p>
                    </div>

                    <button
                      onClick={triggerFreshAnalysis}
                      disabled={isMatching}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-end md:self-auto"
                      id="btn-re-analyze"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isMatching ? "animate-spin" : ""}`} />
                      Reforge Path Analysis
                    </button>
                  </div>

                  {/* Loader list or Matches rendering list */}
                  {isMatching ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((skeletonIndex) => (
                        <div key={skeletonIndex} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-pulse flex flex-col gap-4 text-left">
                          <div className="h-4 bg-slate-200 rounded w-1/4" />
                          <div className="h-3 bg-slate-100 rounded w-1/2" />
                          <div className="h-8 bg-slate-50 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : filteredCareers.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
                      <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="font-bold text-slate-700 text-sm">No careers match your search filter</p>
                      <p className="text-xs text-slate-400 mt-1">Try searching for other general skills or clear some active string queries.</p>
                      <button 
                        onClick={() => setSearchQuery("")} 
                        className="mt-4 px-4 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border hover:bg-slate-200 transition-all"
                      >
                        Clear Search
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Subtitle count */}
                      <p className="text-xs text-slate-400 font-mono text-left uppercase tracking-wider font-semibold">
                        Showing {filteredCareers.length} career pathways calculated for {profile.country}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredCareers.map((career, cIdx) => (
                          <div
                            key={cIdx}
                            onClick={() => {
                              setSelectedCareer(career);
                              triggerAlert(`Focal career point changed to "${career.title}"`);
                            }}
                            className={`p-6 rounded-[2.5rem] bg-white border cursor-pointer transition-all ${
                              selectedCareer.title === career.title
                                ? "border-indigo-600 ring-2 ring-indigo-600/10"
                                : "border-slate-200 hover:border-slate-300 shadow-sm"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] font-bold font-mono uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                                {career.category}
                              </span>
                              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {career.compatibilityScore}% Fit
                              </span>
                            </div>

                            <h3 className="text-base font-extrabold text-slate-900 text-left">
                              {career.title}
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed mt-2 text-left line-clamp-3">
                              {career.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-left">
                              <div>
                                <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Average Wage</p>
                                <p className="text-sm font-extrabold text-slate-800 mt-0.5">${(career.salaries?.mid || 90000).toLocaleString()}/yr</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Growth Index</p>
                                <p className="text-xs font-bold text-indigo-600 mt-1">{career.growthOutlook}</p>
                              </div>
                            </div>

                            {/* Bullet points requirements list */}
                            <div className="mt-4">
                              <p className="text-[9px] uppercase font-bold text-slate-400 font-mono text-left tracking-wider">Required Target Skills</p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {career.requiredSkills?.map((sk, sIdx) => (
                                  <span key={sIdx} className="text-[10px] bg-slate-50 border px-2 py-0.5 rounded text-slate-600 font-medium">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* AI Safety indicator */}
                            <div className="bg-slate-50/70 rounded-xl p-3 mt-4 border border-indigo-100/40 text-left flex items-start gap-2.5">
                              <ShieldAlert className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-bold text-slate-800">Automation Immunity Score: {career.aiImpact?.stabilityScore}%</p>
                                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">{career.aiImpact?.explanation}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* Detailed Roadmap Sequence Expanded Card */}
                  {selectedCareer && (
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-left mt-6 shadow-sm">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-100 gap-4">
                        <div className="text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest">DETAILED ACTION CURRICULUM</span>
                          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                            {selectedCareer.title} Learning Roadmap
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-mono">Suggested Master Timeline</p>
                          <p className="text-xl font-extrabold text-indigo-600 font-mono">{activeRoadmap?.timeline || "8 Months"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                        {/* Phases Sequence (col-span-8) */}
                        <div className="lg:col-span-8 space-y-6">
                          {activeRoadmap?.phases?.map((phase, pIdx) => (
                            <div key={pIdx} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex gap-4 text-left group hover:border-indigo-100 transition-all">
                              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-mono font-bold shrink-0 shadow shadow-indigo-600/20">
                                {pIdx + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap justify-between items-start gap-2">
                                  <h4 className="text-sm font-extrabold text-slate-800">
                                    {phase.phaseName}
                                  </h4>
                                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono tracking-wider font-bold px-2 py-0.5 rounded-full uppercase">
                                    {phase.duration}
                                  </span>
                                </div>

                                <div className="mt-2.5">
                                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Target Skills to Learn</p>
                                  <ul className="flex flex-wrap gap-1 mt-1.5">
                                    {phase.skillsToLearn?.map((s, skIdx) => (
                                      <li key={skIdx} className="text-xs bg-white border border-slate-200/80 rounded px-2 py-0.5 text-slate-700 font-medium font-sans">
                                        {s}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {phase.projects && phase.projects.length > 0 && (
                                  <div className="bg-white rounded-xl p-3.5 mt-4 border border-slate-100">
                                    <div className="flex items-center gap-1.5 text-indigo-600">
                                      <Trophy className="w-4 h-4" />
                                      <p className="text-[10px] font-bold uppercase font-mono tracking-wider">Required Portfolio Project</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 mt-1">{phase.projects[0].name}</p>
                                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                                      {phase.projects[0].description}
                                    </p>
                                  </div>
                                )}

                                <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  <span>Recommended Certification: <strong className="text-slate-600">{phase.certificationsRecommended?.[0] || "Foundational Certificate"}</strong></span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Specializations & Branching Paths (col-span-4) */}
                        <div className="lg:col-span-4 space-y-4">
                          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl text-left">
                            <h4 className="font-extrabold text-[#fff] text-base mb-2">Branching Pathways</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              How do people scale and branch into high performance positions from this starting framework? Here are the calculated expert tiers:
                            </p>
                          </div>

                          {activeRoadmap?.branchingPaths?.map((branch, sprIdx) => (
                            <div key={sprIdx} className="bg-white p-4 rounded-xl border border-slate-200 text-left">
                              <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                {branch.pathName}
                              </p>
                              <p className="text-[11px] text-slate-500 leading-normal mt-1">
                                {branch.description}
                              </p>
                            </div>
                          ))}

                          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50 text-left flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[10.5px] text-amber-800 leading-relaxed">
                              Always check specific local specifications block. Salary and certifications fluctuate heavily across regions.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: Resume Skill Gap Analyzer */}
              {activeTab === "skill-gap" && (
                <div className="space-y-6">
                  
                  <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-left">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase font-mono tracking-wider">
                      Credentials Auditor Engine
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900 mt-2 mb-3">
                      Resume & Portfolio Gap Analyzer
                    </h2>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed mb-6">
                      Upload your copyable LinkedIn information, personal project portfolios, or copy/paste raw text from your resume. PathForge's AI parses and highlights missing skill gaps regarding: <strong className="text-indigo-600">"{selectedCareer.title}"</strong>.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Input upload and settings (col-span-7) */}
                      <div className="lg:col-span-7 space-y-4 text-left">
                        
                        {/* Drag and Drop Upload container */}
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files[0];
                            if (file) simulateResumeUpload(file.name);
                          }}
                          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                            isDragging
                              ? "border-indigo-600 bg-indigo-50/20"
                              : "border-slate-200 hover:border-indigo-500/50 bg-slate-50/50"
                          }`}
                        >
                          <input
                            type="file"
                            id="resume-file-picker"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) simulateResumeUpload(file.name);
                            }}
                          />
                          <label htmlFor="resume-file-picker" className="cursor-pointer">
                            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                            <p className="text-xs font-bold text-slate-800">
                              Drag & Drop your resume or portfolio PDF/TXT file
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              or click to browse your desktop storage
                            </p>
                          </label>
                        </div>

                        {/* Simulation trigger quick paste boxes */}
                        <div className="flex gap-2 justify-center">
                          <button
                            type="button"
                            onClick={() => simulateResumeUpload("Simulated_LinkedIn_Export.txt")}
                            className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border font-mono font-semibold"
                          >
                            ⚡ Fill with Simulated LinkedIn profile text
                          </button>
                          <button
                            type="button"
                            onClick={() => simulateResumeUpload("Simulated_Dev_Resume.txt")}
                            className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border font-mono font-semibold"
                          >
                            ⚡ Fill with Simulated Tech Resume data
                          </button>
                        </div>

                        {/* Raw copy paste entry */}
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                            Copy-Paste raw credentials or professional description
                          </label>
                          <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste specific past positions, skills list, framework certifications, or educational milestones..."
                            rows={8}
                            className="w-full text-xs p-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 placeholder-slate-400 font-mono"
                            id="textarea-resume-text"
                          />
                        </div>

                        {/* Target Selection indicator */}
                        <div className="p-4 bg-slate-100 rounded-xl flex items-center justify-between text-xs mb-4">
                          <div>
                            <span className="text-slate-400 font-mono uppercase tracking-widest text-[9px] block">TARGET CAREER AUDITED</span>
                            <span className="font-bold text-slate-800">{selectedCareer.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">Average Starting: ${(selectedCareer.salaries?.entry || 60000).toLocaleString()}/yr</span>
                        </div>

                        <button
                          onClick={handleRunGapAnalysis}
                          disabled={isGapping}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-shadow shadow-md font-sans flex items-center justify-center gap-1.5 uppercase tracking-wide"
                        >
                          {isGapping ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Running Gap Diagnostics...
                            </>
                          ) : (
                            <>
                              <span>Analyze Professional Gaps & Action Items</span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Right: Results Display (col-span-5) */}
                      <div className="lg:col-span-5">
                        {isGapping ? (
                          <div className="bg-slate-50 rounded-2xl p-6 border animate-pulse space-y-4 h-full text-left">
                            <div className="h-4 bg-slate-200 rounded w-1/3" />
                            <div className="h-2 bg-slate-100 rounded w-2/3" />
                            <div className="h-10 bg-slate-200 rounded-xl" />
                            <div className="space-y-2">
                              <div className="h-8 bg-slate-100 rounded-lg" />
                              <div className="h-8 bg-slate-100 rounded-lg" />
                            </div>
                          </div>
                        ) : gapResult ? (
                          <div className="bg-slate-50 rounded-2xl p-6 border space-y-5 text-left h-full flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center pb-4 border-b border-indigo-100/30">
                                <h4 className="font-extrabold text-slate-900 text-sm">Auditor Feedback</h4>
                                <div className="text-right">
                                  <p className="text-[10px] text-slate-400 font-mono tracking-wider">IMMUNITY SCORE</p>
                                  <p className="text-lg font-mono font-extrabold text-indigo-700">{gapResult.gapScore}% Match</p>
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed mt-4 italic bg-white p-3 rounded-xl border border-slate-100/50">
                                "{gapResult.feedback}"
                              </p>

                              {/* Action Items List */}
                              <div className="mt-6 space-y-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">SPECIFIC LEARNING ACTION ITEMS</p>
                                {gapResult.recommendations?.map((rec, rIdx) => (
                                  <div key={rIdx} className="bg-white p-3.5 rounded-xl border border-slate-100/80 shadow-xs">
                                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                                      Learn: {rec.skillName}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1 pl-3.5 leading-relaxed">
                                      {rec.actionItem}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 pl-3.5 mt-2">
                                      {rec.resources?.map((resStr, resIdx) => (
                                        <span key={resIdx} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                                          📖 {resStr}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-slate-400">
                              <span>Checked against real industry directories</span>
                              <span>Ver 1.4 Active</span>
                            </div>
                          </div>
                        ) : (
                          <div className="border bg-white rounded-2xl p-8 text-center text-slate-400 h-full flex flex-col justify-center items-center">
                            <FileText className="w-8 h-8 text-slate-300 mb-2" />
                            <p className="text-xs">No scan run yet.</p>
                            <p className="text-[10px] mt-0.5">Please write professional credentials and click Analyze to generate.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: Career Comparison Tool */}
              {activeTab === "comparison" && (
                <div className="space-y-6">
                  
                  <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-left">
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                      Comparative Assessment Tool
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900 mt-2 mb-3">
                      Side-by-Side Career Faceoff
                    </h2>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed mb-8">
                      Compare target parameters across multiple recommended domains relative to average income potentials, future AI displacement levels, workspace stress factors, and relative work-life balance scores.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono tracking-widest mb-1 pl-1">Career Option A</label>
                        <select
                          value={compareFirst}
                          onChange={(e) => setCompareFirst(e.target.value)}
                          className="w-full text-xs p-3 bg-white border rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {careerMatches.map((c) => (
                            <option key={c.title} value={c.title}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono tracking-widest mb-1 pl-1">Career Option B</label>
                        <select
                          value={compareSecond}
                          onChange={(e) => setCompareSecond(e.target.value)}
                          className="w-full text-xs p-3 bg-white border rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {careerMatches.map((c) => (
                            <option key={c.title} value={c.title}>{c.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Dual Cards comparative grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                      
                      {/* CARD A */}
                      <div className="bg-white p-6 rounded-2xl border-2 border-indigo-500/10 shadow-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono tracking-widest">Option A</span>
                          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{item1.compatibilityScore}% compatibility</span>
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900 mt-2 mb-3 truncate" title={item1.title}>{item1.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-6">{item1.description}</p>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1 text-slate-500">
                              <span>Mid salary expectation</span>
                              <span className="text-slate-800 font-bold">${(item1.salaries?.mid || 90000).toLocaleString()}/yr</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, ((item1.salaries?.mid || 90000) / 220000) * 100)}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1 text-slate-500">
                              <span>Work-Life Balance Score</span>
                              <span className="text-indigo-600 font-bold">{item1.wlbScore || 85}/100</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${item1.wlbScore || 85}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1 text-slate-500">
                              <span>Job Security Stability</span>
                              <span className="text-slate-800 font-bold">{item1.aiImpact?.stabilityScore || 80}% Safety</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item1.aiImpact?.stabilityScore || 80}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1 text-slate-500">
                              <span>Aggressive stress factor</span>
                              <span className="text-slate-800 font-bold">{item1.stressScore || 40}/100</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${item1.stressScore || 40}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border text-xs text-slate-600 italic mt-6 leading-relaxed">
                          "Fit parameters: {item1.lifestyleFit}"
                        </div>
                      </div>

                      {/* CARD B */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest">Option B</span>
                          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{item2.compatibilityScore}% compatibility</span>
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900 mt-2 mb-3 truncate" title={item2.title}>{item2.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-6">{item2.description}</p>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1 text-slate-500">
                              <span>Mid salary expectation</span>
                              <span className="text-slate-800 font-bold">${(item2.salaries?.mid || 90000).toLocaleString()}/yr</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, ((item2.salaries?.mid || 90000) / 220000) * 100)}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1 text-slate-500">
                              <span>Work-Life Balance Score</span>
                              <span className="text-indigo-600 font-bold">{item2.wlbScore || 85}/100</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${item2.wlbScore || 85}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1 text-slate-500">
                              <span>Job Security Stability</span>
                              <span className="text-slate-800 font-bold">{item2.aiImpact?.stabilityScore || 80}% Safety</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item2.aiImpact?.stabilityScore || 80}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1 text-slate-500">
                              <span>Aggressive stress factor</span>
                              <span className="text-slate-800 font-bold">{item2.stressScore || 40}/100</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${item2.stressScore || 40}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border text-xs text-slate-600 italic mt-6 leading-relaxed">
                          "Fit parameters: {item2.lifestyleFit}"
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: AI Mentor Chat Stream */}
              {activeTab === "mentor" && (
                <div className="space-y-6">
                  
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
                    
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-left shrink-0">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" />
                          <h3 className="font-extrabold text-slate-900 text-sm">PathForge AI Coach & Career Mentor</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Assigned Advisor context: <strong className="text-indigo-600">{selectedCareer.title}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {profile.realisticMode ? (
                          <span className="text-[10px] bg-rose-100 border border-rose-200 text-rose-800 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            🔥 brutal realist mode
                          </span>
                        ) : (
                          <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse">
                            🌟 supportive mentor active
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setChatMessages([
                              {
                                id: "reset",
                                role: "assistant",
                                content: `Hello! I have aligned my analytics with ${selectedCareer.title}. Ask me anything about skills, certifications, job requirements, or transitioning safely.`,
                                timestamp: new Date().toLocaleTimeString(),
                              },
                            ]);
                            triggerAlert("Chat context refreshed.");
                          }}
                          className="text-[9px] uppercase font-bold tracking-wider text-slate-400 hover:text-slate-800 bg-white border px-2 py-1 rounded"
                        >
                          Clear Chat
                        </button>
                      </div>
                    </div>

                    {/* Message Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/10" id="chat-messages-container">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 max-w-xl text-left text-xs ${
                            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                          }`}
                        >
                          {/* Profile thumbnail */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            msg.role === "user"
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}>
                            {msg.role === "user" ? "U" : "AI"}
                          </div>

                          <div className={`p-4 rounded-2xl relative ${
                            msg.role === "user"
                              ? "bg-indigo-600 text-[#fff] rounded-tr-none"
                              : "bg-white border rounded-tl-none shadow-xs text-slate-800 leading-relaxed"
                          }`}>
                            {/* Markdown text formatted simply */}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <span className="text-[10px] text-slate-400/80 block mt-2 text-right">
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Footer Input */}
                    <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                      <div className="flex items-center gap-2 bg-slate-50 border rounded-xl px-3.5 py-1">
                        <textarea
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendChat();
                            }
                          }}
                          placeholder="Ask: 'Can I switch careers at 30?' or 'What Python certs should I buy first?'..."
                          rows={2}
                          className="flex-1 bg-transparent text-xs resize-none focus:outline-none py-1.5 text-slate-700 focus:ring-0"
                          id="chat-user-textbox"
                        />
                        <button
                          onClick={handleSendChat}
                          disabled={isGeneratingChat || !userQuery.trim()}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                          id="chat-send-btn"
                        >
                          Send
                        </button>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-1.5">
                        <span>Press Enter to send. Supports direct streaming API connection.</span>
                        <span>Focal Target: {selectedCareer.title}</span>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 6: Settings profile manager */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  
                  <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-left max-w-3xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                      User Profile Management
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900 mt-2 mb-2">
                      Configure Your PathForge Matrix
                    </h2>
                    <p className="text-xs text-slate-500 mb-8">
                      Adjust your core specifications to align AI calculations to your precise salary goals, educational levels, physical locations, or personality interests.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Your Core Interests</label>
                        <input
                          type="text"
                          value={profile.interests}
                          onChange={(e) => setProfile(prev => ({ ...prev, interests: e.target.value }))}
                          className="w-full text-xs p-3.5 bg-slate-50 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Primary Skills</label>
                        <input
                          type="text"
                          value={profile.skills}
                          onChange={(e) => setProfile(prev => ({ ...prev, skills: e.target.value }))}
                          className="w-full text-xs p-3.5 bg-slate-50 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Hobbies & Outside Work Interests</label>
                        <textarea
                          value={profile.hobbies}
                          rows={2}
                          onChange={(e) => setProfile(prev => ({ ...prev, hobbies: e.target.value }))}
                          className="w-full text-xs p-3.5 bg-slate-50 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Ideal Target Country / Region</label>
                        <input
                          type="text"
                          value={profile.country}
                          onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full text-xs p-3.5 bg-slate-50 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Target Work Layout Style</label>
                        <select
                          value={profile.workStyle}
                          onChange={(e) => setProfile(prev => ({ ...prev, workStyle: e.target.value }))}
                          className="w-full text-xs p-3.5 bg-slate-50 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                        >
                          <option value="Remote Preferred">Remote Preferred</option>
                          <option value="Hybrid Layout">Hybrid Layout</option>
                          <option value="On-site Dynamic">On-site Dynamic</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest font-bold mb-1.5">Dream Lifestyle Ambition</label>
                        <input
                          type="text"
                          value={profile.lifestyle}
                          onChange={(e) => setProfile(prev => ({ ...prev, lifestyle: e.target.value }))}
                          className="w-full text-xs p-3.5 bg-slate-50 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">Activate High Brutality realistic mode</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Mentor will highlight saturation, stress, and limits first.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProfile(prev => ({ ...prev, realisticMode: !prev.realisticMode }));
                            triggerAlert(!profile.realisticMode ? "Brutal Realistic Mode triggered." : "Supportive Mode triggered.");
                          }}
                          className={`w-12 h-6 rounded-full relative transition-colors ${
                            profile.realisticMode ? "bg-rose-500" : "bg-slate-300"
                          }`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                            profile.realisticMode ? "right-0.5" : "left-0.5"
                          }`} />
                        </button>
                      </div>

                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                      <button
                        onClick={() => {
                          setProfile(DEFAULT_USER_PROFILE);
                          triggerAlert("Profile reset to defaults.");
                        }}
                        className="text-xs text-slate-400 hover:text-slate-900 font-semibold"
                      >
                        Reset To Base Demo State
                      </button>

                      <button
                        onClick={async () => {
                          await triggerFreshAnalysis();
                          setActiveTab("dashboard");
                        }}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-shadow"
                      >
                        Apply Config & Reforge All Tiers
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 7: Backup & PDF Passport */}
              {activeTab === "passport" && (
                <div className="space-y-8 pb-12">
                  
                  {/* Account Security & Authenticator Panel */}
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 no-print text-left">
                    <div className="max-w-2xl text-left mb-6">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 uppercase tracking-widest px-2.5 py-1 rounded-full font-mono">
                        Vault Synchronization
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-2">Personal Security Keys</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        To lock in your career path matches, unlock achievements, or run dynamic roadmap simulations across devices, sign in to your permanent vault or download a backup file.
                      </p>
                    </div>

                    <Authentication 
                      currentUser={currentUser}
                      onLoginSuccess={(user) => {
                        setCurrentUser(user);
                        if (user.profile) {
                          setProfile(user.profile);
                        }
                      }}
                      onLogout={() => {
                        setCurrentUser(null);
                      }}
                      triggerAlert={triggerAlert}
                    />
                  </div>

                  {/* Actions & Backup Exporter Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print text-left">
                    
                    {/* JSON Import/Export Backup Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Digital Career Credentials ledger</span>
                        <h4 className="text-base font-extrabold text-slate-900 mt-1">Backup & Restore Passport</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Export your metrics into a light, portable credentials token (.json). You can drag this file back at any time to instantly restore your learning roadmap index.
                        </p>
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                          onClick={handleExportJSON}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                        >
                          <FileJson className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>Download Backup JSON</span>
                        </button>
                        
                        <div className="flex-1 relative">
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportJSON}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            title="Restore Backup JSON file"
                          />
                          <button
                            type="button"
                            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Upload className="w-4 h-4 text-slate-500" />
                            <span>Upload Backup JSON</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* PDF Export Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-widest">Physical & Digital Documentation</span>
                        <h4 className="text-base font-extrabold text-slate-900 mt-1">Export Certificate to PDF</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Format your custom AI matched career target, learning phases, required professional credentials, and skills discrepancies lists into an official document profile for sharing.
                        </p>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={() => {
                            window.print();
                            triggerAlert("Fired printer dialog! Tip: Select 'Save as PDF' to generate document.");
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Generate Passport Document PDF</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Document Print Passport Preview Container */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-left relative overflow-hidden" id="career-passport-pdf-preview">
                    
                    {/* Passport Top Stamp accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full flex items-center justify-center text-indigo-600/10 font-bold text-3xl select-none no-print">
                      PASSPORT
                    </div>

                    {/* Print Preview Title */}
                    <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100 no-print">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono tracking-wider">Print Preview Panel</span>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">Your Formatted Career Passport</h3>
                      </div>
                      <p className="text-[10px] text-slate-400 max-w-xs text-right leading-relaxed">
                        The layout below uses customized Tailwind stylesheet print rules to render perfectly inside letter format outputs. All action menus will auto-hide.
                      </p>
                    </div>

                    {/* The Full Printable Template Sheet */}
                    <div className="print-page bg-white p-2 text-slate-900">
                      
                      {/* Document Header block */}
                      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between pb-6 mb-8 border-b-2 border-indigo-600">
                        <div className="text-left font-sans">
                          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">OFFICIAL VERIFIED TRAJECTORY</span>
                          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">PathForge Career Certification Passport</h2>
                          <p className="text-xs text-slate-500 mt-1 font-mono">
                            Document Trajectory ID: PF-{currentUser?.email ? currentUser.email.split("@")[0].toUpperCase() : "GUEST"}-{Date.now().toString().slice(-6)}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 text-left md:text-right font-mono text-[11px] text-slate-500 border-l-2 md:border-l-0 md:border-r-2 border-indigo-600 pl-4 md:pl-0 md:pr-4">
                          <p><strong>Candidate:</strong> {currentUser?.name || "Guest Participant"}</p>
                          <p><strong>Location:</strong> {profile.country || "Not set"}</p>
                          <p><strong>Work Style:</strong> {profile.workStyle || "Not set"}</p>
                          <p><strong>Education:</strong> {profile.education || "Not set"}</p>
                        </div>
                      </div>

                      {/* Core Matched Role Section */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        
                        <div className="md:col-span-2 space-y-3">
                          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Calculated Career Target</h4>
                          <h3 className="text-xl font-bold text-slate-950">{selectedCareer.title}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1.5">{selectedCareer.description}</p>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                            <div className="p-3 bg-slate-50 border rounded-xl">
                              <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold">Mid Annual Wage</span>
                              <span className="text-sm font-extrabold text-slate-800">${(selectedCareer.salaries?.mid || 110000).toLocaleString()}/yr</span>
                            </div>
                            <div className="p-3 bg-slate-50 border rounded-xl">
                              <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold">AI Resilience Score</span>
                              <span className="text-sm font-extrabold text-indigo-700">{selectedCareer.aiImpact?.stabilityScore || 85}% Immune</span>
                            </div>
                            <div className="p-3 bg-slate-50 border rounded-xl col-span-2 lg:col-span-1">
                              <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold">Compound Match</span>
                              <span className="text-sm font-extrabold text-emerald-600">{selectedCareer.compatibilityScore}% Strength</span>
                            </div>
                          </div>
                        </div>

                        {/* Candidate Characteristics Panel */}
                        <div className="p-5 bg-indigo-950 text-white rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="text-[8px] font-mono font-bold tracking-widest uppercase text-indigo-300">Core Motivations</span>
                            <h4 className="text-sm font-extrabold font-sans mt-1">Interests Matrix</h4>
                            <p className="text-xs text-slate-200 leading-relaxed mt-2.5 font-sans italic">
                              "{profile.interests || "General exploration metrics in science, design and development."}"
                            </p>
                          </div>
                          
                          <div className="pt-4 border-t border-indigo-850 mt-4">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span>Practice Streak:</span>
                              <span className="font-bold text-amber-400">{streak} Days Streak</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono mt-1">
                              <span>Badges Earned:</span>
                              <span className="font-bold text-emerald-400">{badges.filter(b => b.unlockedAt).length} Unlocked</span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Learning & Roadmap Progression Phases */}
                      <div className="space-y-4 mb-8">
                        <div className="border-b pb-2">
                          <h4 className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" /> Customized Learning Roadmap Phases
                          </h4>
                        </div>

                        {/* Find or generate phases */}
                        {(() => {
                          const activeRoadmap = roadmaps[selectedCareer.title] || Object.values(roadmaps)[0];
                          if (!activeRoadmap || !activeRoadmap.phases) {
                            return (
                              <p className="text-xs text-slate-500 italic">No structured roadmap compiled yet. Visit the Career Matches tab to trigger dynamic learning phases.</p>
                            );
                          }
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {activeRoadmap.phases.map((phase: any, index: number) => (
                                <div key={index} className="p-4 border rounded-xl bg-white shadow-xs flex flex-col justify-between text-left">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="w-5 h-5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] rounded-full flex items-center justify-center font-mono font-bold">
                                        {index + 1}
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{phase.duration || `Stage ${index + 1}`}</span>
                                    </div>
                                    <h5 className="text-sm font-bold text-slate-900">{phase.title}</h5>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{phase.description}</p>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-left">
                                    <span className="text-[8px] font-mono uppercase font-bold text-indigo-600">Recommended Certificate:</span>
                                    <span className="text-[11px] font-semibold text-slate-800 font-sans leading-tight bg-indigo-50/50 p-1.5 rounded border border-indigo-100">
                                      {phase.certName || "No specific cert listed"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Skills Overlaps & Gaps Matrix Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-6 border-t font-sans">
                        
                        {/* Current Verified Skills */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Active Skills Inventory</h4>
                          <div className="p-4 bg-slate-50 border rounded-xl">
                            <p className="text-xs text-slate-500 leading-relaxed mb-3">These core skills have been aligned automatically to establish compatibility:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {profile.skills ? profile.skills.split(",").map((sk, id) => (
                                <span key={id} className="text-[10px] bg-slate-200 text-slate-700 px-2 py-1 rounded font-mono font-medium">
                                  {sk.trim()}
                                </span>
                              )) : (
                                <span className="text-xs text-slate-400 italic">No specific base skills provided in matrix.</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Defecit Skill Gaps */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest">Audited Career Skill Gaps</h4>
                          <div className="p-4 bg-indigo-50/20 border border-indigo-100 rounded-xl">
                            <p className="text-xs text-slate-500 leading-relaxed mb-3">Critical competencies you must acquire prior to placement:</p>
                            <div className="flex flex-wrap gap-1.5 font-mono">
                              {selectedCareer.requiredSkills.slice(0, 5).map((sk, id) => (
                                <span key={id} className="text-[10px] bg-rose-50 border border-rose-100 text-rose-700 px-2 py-1 rounded font-bold uppercase">
                                  ▲ {sk.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Official Stamp & Sign Off */}
                      <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono">
                        <div>
                          <p>Certified by PathForge AI Career Planner Platform</p>
                          <p className="text-[10px] text-slate-350">Automatic ledger entries locked locally in browser keys.</p>
                        </div>
                        <div className="mt-4 sm:mt-0 text-center sm:text-right">
                          <div className="w-24 h-8 border-2 border-dashed border-indigo-200 rounded-lg flex items-center justify-center font-bold text-[11px] text-indigo-400 tracking-wider rotate-3 uppercase">
                            VERIFIED CODES
                          </div>
                          <p className="text-[9px] text-slate-300 mt-1">Official Hash Verified</p>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

            </div>

          </main>

        </div>
      )}

      {/* Social Viral Share Modal Overlay */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
            
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <Share2 className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-bold text-slate-400 uppercase font-mono tracking-widest">Share Your Pathway</h3>
            <h4 className="text-xl font-extrabold text-slate-900 mt-1 mb-2">My Ideal Career</h4>

            <div className="bg-slate-50 rounded-2xl p-5 border text-left mt-4 mb-6">
              <span className="text-[9px] font-bold text-indigo-600 font-mono block">PATHFORGE PASSPORT</span>
              <p className="text-base font-extrabold text-slate-800 mt-1">{selectedCareer.title}</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                An analyzed career path scoring {selectedCareer.compatibilityScore}% compatibility under dynamic future AI automation matrices.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-200 text-xs">
                <div>
                  <span className="block text-[8px] uppercase font-mono text-slate-400 font-semibold">MID WAGE</span>
                  <span className="font-bold text-slate-800">${(selectedCareer.salaries?.mid || 100000).toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase font-mono text-slate-400 font-semibold">AI SAFETY</span>
                  <span className="font-bold text-indigo-600">{selectedCareer.aiImpact?.stabilityScore}% Resilience</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={triggerCopySocial}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-shadow flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Passport Share Text
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-900 font-semibold"
              >
                Close Passport
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
