import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, Sparkles, Loader2, Zap, CheckCircle, 
  X, AlertCircle, Share2, Eye, EyeOff, ListChecks, 
  UserCheck, ShieldCheck, Target, TrendingUp, AlertTriangle, Save,
  FileText, Check, Layers, ArrowRight, Differential
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ResumePreview from './ResumePreview';
import TemplateSelector from './TemplateSelector'; 

/* =========================================
   SUB-COMPONENTS (CircularScore & MetricBox)
   ========================================= */
const CircularScore = ({ score }) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const safeScore = isNaN(score) ? 0 : score;
  const offset = circumference - ((safeScore / 100) * circumference);
  
  const getColor = (s) => {
    if (s >= 80) return "text-emerald-500";
    if (s >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <div className="relative flex items-center justify-center w-32 h-32 mx-auto mb-3">
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
        <circle 
          cx="64" cy="64" r={radius} 
          stroke="currentColor" strokeWidth="8" fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-out ${getColor(safeScore)}`} 
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-black ${getColor(safeScore)}`}>
            {safeScore}
        </span>
      </div>
    </div>
  );
};

const MetricBox = ({ id, icon: Icon, label, onClick, data }) => {
  const score = data?.score; 
  const hasData = typeof score === 'number';

  const getStatus = (s) => {
    if (!hasData) return { color: "text-slate-400", bg: "bg-slate-50", badge: "N/A", bar: "bg-slate-300" };
    if (s >= 80) return { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", badge: "Excellent", bar: "bg-emerald-500" };
    if (s >= 50) return { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", badge: "Needs Work", bar: "bg-amber-500" };
    return { color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", badge: "Critical", bar: "bg-rose-500" };
  };

  const status = getStatus(score);

  return (
    <button 
      onClick={onClick}
      disabled={!hasData}
      className={`relative w-full text-left p-3.5 rounded-2xl border-2 transition-all duration-200 group
        ${status.bg} ${status.border || 'border-slate-100'} 
        ${hasData ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`p-1.5 rounded-xl bg-white shadow-xs ${status.color}`}>
          <Icon size={18} />
        </div>
        <div className="text-right">
          <span className={`block text-2xl font-black ${status.color}`}>
            {hasData ? score : "--"}
          </span>
        </div>
      </div>

      <div className="mb-2">
         <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{label}</h4>
         <p className={`text-[9px] font-bold uppercase mt-0.5 px-2 py-0.5 rounded-full w-fit bg-white border ${status.color === 'text-slate-400' ? 'border-slate-200 text-slate-400' : `${status.color} border-current opacity-80`}`}>
           {status.badge}
         </p>
      </div>

      <div className="w-full bg-white/60 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${status.bar}`} 
          style={{ width: `${score || 0}%` }} 
        />
      </div>
    </button>
  );
};

/* =========================================
   MAIN ATS AUDITOR COMPONENT
   ========================================= */
const ATSScoreReport = ({ 
  selectedResume, onBack, isScanning, scanReport, onScan, onSaveSuggestions, onUpdateVisibility, onUpdateTemplate 
}) => {
  const [activeMetric, setActiveMetric] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [showJdInput, setShowJdInput] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Dynamic Scale State for Preview Frame
  const [previewScale, setPreviewScale] = useState(0.7);
  const [previewHeight, setPreviewHeight] = useState(0);
  const previewBoxRef = useRef(null);
  const previewContentRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (!previewBoxRef.current) return;
      const { clientWidth } = previewBoxRef.current;
      if (clientWidth === 0) return;

      const scale = (clientWidth - 32) / 794; 
      const clampedScale = Math.min(Math.max(scale, 0.35), 1);
      setPreviewScale(clampedScale);

      if (previewContentRef.current) {
        setPreviewHeight(previewContentRef.current.scrollHeight || previewContentRef.current.offsetHeight || 0);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [selectedResume]);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setActiveMetric(null);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // REALISTIC ATS CALCULATOR ENGINE
  const localAnalysis = useMemo(() => {
    if (!selectedResume) return null;

    let contactScore = 0;
    const info = selectedResume.personal_info || {};
    if (info.full_name) contactScore += 25;
    if (info.email) contactScore += 25;
    if (info.phone) contactScore += 25;
    if (info.linkedin) contactScore += 25;

    let structureScore = 0;
    if (selectedResume.professional_summary) structureScore += 25;
    if (selectedResume.experience?.length > 0) structureScore += 30;
    if (selectedResume.education?.length > 0) structureScore += 25;
    if (selectedResume.skills?.length > 0) structureScore += 20;

    let impactScore = 0;
    const allExpText = (selectedResume.experience || []).map(e => e.description || '').join(' ');
    const hasNumbers = (allExpText.match(/\d+(%|\$|k|M|\+)?/g) || []).length;
    const bulletCount = (allExpText.match(/\n/g) || []).length + 1;
    
    impactScore += Math.min(hasNumbers * 15, 50); 
    impactScore += Math.min(bulletCount * 10, 50); 

    let tailoringScore = 50; 
    let missingKeywords = [];

    if (jobDescription.trim()) {
      const stopWords = new Set(['and', 'the', 'for', 'with', 'a', 'an', 'to', 'in', 'of', 'or', 'on', 'at', 'by', 'from', 'is', 'are', 'be']);
      const jdWords = jobDescription.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));
      
      const uniqueJdKeywords = [...new Set(jdWords)];
      const resumeFullText = JSON.stringify(selectedResume).toLowerCase();

      const matched = uniqueJdKeywords.filter(kw => resumeFullText.includes(kw));
      missingKeywords = uniqueJdKeywords.filter(kw => !resumeFullText.includes(kw)).slice(0, 8);

      if (uniqueJdKeywords.length > 0) {
        tailoringScore = Math.round((matched.length / uniqueJdKeywords.length) * 100);
      }
    }

    const totalScore = Math.round(
      (contactScore * 0.15) + 
      (structureScore * 0.25) + 
      (impactScore * 0.35) + 
      (tailoringScore * 0.25)
    );

    return {
      totalScore,
      missingKeywords,
      metrics: {
        contact: { score: contactScore, wrong: contactScore < 100 ? "Missing essential contact information like LinkedIn or Phone." : null, fix: "Ensure Full Name, Email, Phone, and LinkedIn are explicitly detailed." },
        sections: { score: structureScore, wrong: structureScore < 100 ? "Core sections (Summary, Experience, Skills, Education) are incomplete." : null, fix: "Add dedicated sections for Summary, Experience, Education, and Skills." },
        content: { score: impactScore, wrong: impactScore < 60 ? "Descriptions lack measurable metrics and quantifiable results." : null, fix: "Add specific achievements with %, $, or key numbers to bullet points." },
        tailoring: { score: tailoringScore, wrong: tailoringScore < 60 ? "Resume keywords do not align sufficiently with target job description." : null, fix: "Incorporate extracted job keywords naturally into skills and bullet points." }
      }
    };
  }, [selectedResume, jobDescription]);

  const activeReport = scanReport || localAnalysis;

  const handleShare = async () => {
    if (!selectedResume._id || !selectedResume.public) {
      return toast.error("Resume must be Public to share.");
    }
    const shareUrl = `${window.location.origin}/view/${selectedResume._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Resume - ${selectedResume.personal_info?.full_name}`, url: shareUrl });
      } catch (err) { /* ignore */ }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Public link copied!");
    }
  };

  const handleApplyOptimization = () => {
    if (!scanReport?.optimizedData) {
      return toast.error("Please run the ATS Audit to generate AI optimizations first.");
    }
    setShowConfirmModal(true);
  };

  const confirmAndSave = () => {
    const upgradedResume = {
      ...selectedResume,
      professional_summary: scanReport.optimizedData.professional_summary || selectedResume.professional_summary,
      skills: scanReport.optimizedData.skills || selectedResume.skills,
      experience: selectedResume.experience.map((exp, index) => ({
        ...exp,
        description: scanReport.optimizedData.experience?.[index]?.description || exp.description
      }))
    };

    onSaveSuggestions(upgradedResume);
    setShowConfirmModal(false);
    toast.success("AI Optimizations Applied!");
    onBack();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col font-sans overflow-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-6 z-20 shadow-xs shrink-0">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-all font-bold text-sm"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        <div className="flex items-center gap-4 mr-auto">
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-500" /> ATS Auditor
          </h1>

          <div className="flex items-center gap-3 ml-4">
            <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => onUpdateVisibility(selectedResume._id, false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!selectedResume.public ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'}`}>
                Private
              </button>
              <button 
                onClick={() => onUpdateVisibility(selectedResume._id, true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${selectedResume.public ? 'bg-white shadow-xs text-emerald-600' : 'text-slate-500'}`}>
                Public
              </button>
            </div>
            
            <TemplateSelector 
              selectedTemplate={selectedResume.template || 'classic'} 
              onChange={(id) => onUpdateTemplate(selectedResume._id, id)} 
            />

            {selectedResume.public && (
              <button onClick={handleShare} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Share Public Link">
                <Share2 size={18} />
              </button>
            )}
          </div>
        </div>

        <button 
          onClick={scanReport?.optimizedData ? handleApplyOptimization : onBack}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
        >
          <Save size={18} />
          {scanReport?.optimizedData ? "Review & Apply AI Changes" : "Save & Close"}
        </button>
      </nav>

      {/* --- MAIN LAYOUT (PREVIEW LEFT / AUDITOR RIGHT) --- */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* LEFT PANEL: PREVIEW FRAME */}
        <div 
          ref={previewBoxRef}
          className="flex-1 bg-slate-100/50 p-4 lg:p-8 flex justify-center items-start overflow-y-auto scroll-smooth custom-scrollbar"
        >
          <div 
            className="w-[794px] min-w-[794px] shrink-0"
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              marginBottom: previewHeight ? `-${previewHeight * (1 - previewScale)}px` : '0px'
            }}
          >
            <div 
              id="resume-preview-id"
              ref={previewContentRef}
              className="bg-white shadow-2xl rounded-sm ring-1 ring-slate-900/5 h-auto min-h-0 overflow-hidden box-border w-[794px] min-w-[794px] max-w-[794px]"
            >
              <ResumePreview 
                data={selectedResume} 
                template={selectedResume.template || "classic"} 
                accentColor={selectedResume.accent_color || "#10b981"} 
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AUDITOR DASHBOARD */}
        <div className="w-full lg:w-[460px] bg-white border-l border-slate-200 flex flex-col h-[50vh] lg:h-full shadow-2xl z-10 shrink-0">
          
          {/* Header Score Display */}
          <div className="p-5 border-b border-slate-100 text-center bg-gradient-to-b from-slate-50 to-white shrink-0">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Real-time ATS Match Index</h2>
            
            {activeReport ? (
              <div className="animate-in zoom-in duration-500">
                <CircularScore score={activeReport.totalScore || activeReport.score} />
                <p className="text-slate-500 text-xs font-medium">
                  Suitability score based on content metrics & structure
                </p>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center opacity-40">
                <Zap size={40} className="text-slate-300 mb-2" />
                <span className="text-xs font-medium text-slate-400">Ready to audit</span>
              </div>
            )}
            
            {/* Job Description Expandable Option */}
            <div className="mt-4 text-left">
              <button 
                onClick={() => setShowJdInput(!showJdInput)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 mb-2 cursor-pointer"
              >
                <FileText size={14} /> {showJdInput ? "Hide Job Description" : "+ Add Job Description for Keyword Match"}
              </button>
              
              {showJdInput && (
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste target Job Description (JD) here to evaluate keyword match..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                />
              )}
            </div>

            <button 
              onClick={() => onScan(jobDescription)}
              disabled={isScanning}
              className="mt-3 w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
            >
              {isScanning ? <Loader2 className="animate-spin" size={16} /> : <Target size={16} />}
              {isScanning ? 'Analyzing Resume Content...' : 'Run Comprehensive AI Audit'}
            </button>
          </div>

          {/* Metrics List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-slate-50/50">
            {activeReport && (
              <div className="space-y-5 pb-10">
                
                {/* Missing Keywords Gap Badge List */}
                {activeReport.missingKeywords && activeReport.missingKeywords.length > 0 && (
                  <div className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-2xs">
                    <h3 className="text-rose-800 font-bold text-[11px] flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                      <AlertTriangle size={14} /> Missing Target Keywords
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {activeReport.missingKeywords.map((kw, i) => (
                        <span key={i} className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-md font-bold">
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Score Breakdown Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <MetricBox 
                    id="content" label="Impact & Numbers" icon={TrendingUp} 
                    data={activeReport.metrics?.content}
                    onClick={() => setActiveMetric({ ...activeReport.metrics?.content, title: "Impact & Verbs" })} 
                  />
                  <MetricBox 
                    id="sections" label="Structure" icon={ListChecks} 
                    data={activeReport.metrics?.sections}
                    onClick={() => setActiveMetric({ ...activeReport.metrics?.sections, title: "Sections Formatting" })} 
                  />
                  <MetricBox 
                    id="tailoring" label="Relevance / JD" icon={Target} 
                    data={activeReport.metrics?.tailoring}
                    onClick={() => setActiveMetric({ ...activeReport.metrics?.tailoring, title: "Job Tailoring" })} 
                  />
                  <MetricBox 
                    id="contact" label="Contact Info" icon={UserCheck} 
                    data={activeReport.metrics?.contact}
                    onClick={() => setActiveMetric({ ...activeReport.metrics?.contact, title: "Personal Info" })} 
                  />
                </div>

                {/* Apply AI Action Trigger */}
                {scanReport?.optimizedData && (
                  <div className="pt-2">
                    <button 
                      onClick={handleApplyOptimization}
                      className="group w-full relative overflow-hidden bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-xs transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-95 cursor-pointer"
                    >
                      <span className="relative flex items-center justify-center gap-2">
                        <Sparkles size={16} /> Review & Apply AI Improvements
                      </span>
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2 px-2 leading-relaxed">
                      Compare original vs optimized content before committing changes.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL 1: METRIC ANALYSIS --- */}
      {activeMetric && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" 
          onClick={() => setActiveMetric(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-white/20" 
            onClick={e => e.stopPropagation()} 
          >
            <div className="bg-slate-900 p-5 flex justify-between items-center text-white">
              <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
                Analysis: {activeMetric.title}
              </h3>
              <button onClick={() => setActiveMetric(null)} className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
               <div className="flex gap-3 items-start">
                  <div className="bg-rose-100 p-2 rounded-full text-rose-600 mt-0.5 flex-shrink-0">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Issue Detected</h4>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                      {activeMetric.wrong || "No significant formatting or density issues found."}
                    </p>
                  </div>
               </div>
               <div className="h-px bg-slate-100" />
               <div className="flex gap-3 items-start">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 mt-0.5 flex-shrink-0">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Recommended Fix</h4>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                      {activeMetric.fix || "This area meets standard ATS guidelines."}
                    </p>
                  </div>
               </div>
            </div>

            <div className="bg-slate-50 p-3.5 flex justify-end border-t border-slate-100">
              <button 
                onClick={() => setActiveMetric(null)} 
                className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: RED VS GREEN DIFF CONFIRMATION --- */}
      {showConfirmModal && scanReport?.optimizedData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[250] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 flex justify-between items-center text-white shrink-0">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Sparkles className="text-emerald-400" size={18} /> Are you sure you want to apply AI updates?
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Review original vs optimized content before confirming.</p>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="text-white/70 hover:text-white p-1 rounded-full cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Comparison */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1 bg-slate-50">
              
              {/* Summary Comparison */}
              {scanReport.optimizedData.professional_summary && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Layers size={14} /> Professional Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-rose-900">
                      <span className="font-bold block text-[10px] text-rose-600 uppercase mb-1">Original</span>
                      {selectedResume.professional_summary || "Empty"}
                    </div>
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-900">
                      <span className="font-bold block text-[10px] text-emerald-600 uppercase mb-1">AI Optimized</span>
                      {scanReport.optimizedData.professional_summary}
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Bullet Comparisons */}
              {scanReport.optimizedData.experience && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <TrendingUp size={14} /> Work Experience Descriptions
                  </h4>
                  <div className="space-y-3 text-xs">
                    {scanReport.optimizedData.experience.map((exp, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-rose-900 whitespace-pre-line">
                          <span className="font-bold block text-[10px] text-rose-600 uppercase mb-1">Original Experience #{idx + 1}</span>
                          {selectedResume.experience?.[idx]?.description || "N/A"}
                        </div>
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-900 whitespace-pre-line">
                          <span className="font-bold block text-[10px] text-emerald-600 uppercase mb-1">Optimized Experience #{idx + 1}</span>
                          {exp.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Tag Comparisons */}
              {scanReport.optimizedData.skills && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Skills List Update</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
                      <span className="font-bold block text-[10px] text-rose-600 uppercase mb-2">Original Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {(selectedResume.skills || []).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                      <span className="font-bold block text-[10px] text-emerald-600 uppercase mb-2">Optimized Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {(scanReport.optimizedData.skills || []).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAndSave}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-200 flex items-center gap-2 cursor-pointer"
              >
                <Check size={16} /> Confirm & Apply Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ATSScoreReport;