import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Sparkles, Loader2, Zap, CheckCircle, 
  X, AlertCircle, Share2, Eye, EyeOff, ListChecks, 
  UserCheck, ShieldCheck, Target, TrendingUp, AlertTriangle, Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ResumePreview from './ResumePreview';
import TemplateSelector from './TemplateSelector'; 

/* =========================================
   SUB-COMPONENTS (CircularScore & MetricBox)
   (Keep these exactly as they were - hidden for brevity)
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
    <div className="relative flex items-center justify-center w-32 h-32 mx-auto mb-4">
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
      className={`relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 group
        ${status.bg} ${status.border || 'border-slate-100'} 
        ${hasData ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-xl bg-white shadow-sm ${status.color}`}>
          <Icon size={20} />
        </div>
        <div className="text-right">
          <span className={`block text-3xl font-black ${status.color}`}>
            {hasData ? score : "--"}
          </span>
        </div>
      </div>

      <div className="mb-3">
         <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</h4>
         <p className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded-full w-fit bg-white border ${status.color === 'text-slate-400' ? 'border-slate-200 text-slate-400' : `${status.color} border-current opacity-80`}`}>
           {status.badge}
         </p>
      </div>

      <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${status.bar}`} 
          style={{ width: `${score || 0}%` }} 
        />
      </div>
    </button>
  );
};

/* =========================================
   MAIN COMPONENT
   ========================================= */
const ATSScoreReport = ({ 
  selectedResume, onBack, isScanning, scanReport, onScan, onSaveSuggestions, onUpdateVisibility, onUpdateTemplate 
}) => {
  const [activeMetric, setActiveMetric] = useState(null);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setActiveMetric(null);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleShare = async () => {
    if (!selectedResume._id || !selectedResume.public) {
      return toast.error("Resume must be Public to share.");
    }
    const shareUrl = `${window.location.origin}/view/${selectedResume._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Resume - ${selectedResume.personal_info?.full_name}`,
          url: shareUrl,
        });
      } catch (err) { /* ignore */ }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Public link copied!");
    }
  };

  const handleApplyOptimization = () => {
    if (!scanReport?.optimizedData) return toast.error("No suggestions available.");

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
    // Success toast is handled in parent, but we can add one here too
    // toast.success("AI Optimizations applied!");
    onBack(); 
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col font-sans overflow-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-6 z-20 shadow-sm shrink-0">
        
        {/* 1. GO BACK TO DASHBOARD (Explicit Text Button) */}
        <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-all font-bold text-sm"
        >
            <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        {/* 2. TITLE & TOOLS (Left Aligned) */}
        <div className="flex items-center gap-4 mr-auto">
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-500" /> ATS Auditor
            </h1>

            {/* Tools Group */}
            <div className="flex items-center gap-3 ml-4">
                <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => onUpdateVisibility(selectedResume._id, false)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!selectedResume.public ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
                        Private
                    </button>
                    <button 
                        onClick={() => onUpdateVisibility(selectedResume._id, true)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${selectedResume.public ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}>
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

        {/* 3. SAVE BUTTON (Right Aligned) */}
        {/* If scanned data exists, it applies it. If not, it just closes (saves current state). */}
        <button 
            onClick={scanReport?.optimizedData ? handleApplyOptimization : onBack}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-200 transition-all active:scale-95"
        >
            <Save size={18} />
            {scanReport?.optimizedData ? "Save AI Changes" : "Save & Close"}
        </button>

      </nav>

      {/* --- CONTENT (Preview & Analysis) --- */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* LEFT PANEL: PREVIEW */}
        <div className="flex-1 bg-slate-100/50 p-4 lg:p-8 flex justify-center items-start overflow-y-auto scroll-smooth custom-scrollbar">
          <div className="w-full max-w-2xl shadow-2xl rounded-sm ring-1 ring-slate-900/5 bg-white mb-20">
            <ResumePreview 
              data={selectedResume} 
              template={selectedResume.template || "classic"} 
              accentColor={selectedResume.accent_color || "#10b981"} 
            />
          </div>
        </div>

        {/* RIGHT PANEL: DASHBOARD */}
        <div className="w-full lg:w-[450px] bg-white border-l border-slate-200 flex flex-col h-[50vh] lg:h-full shadow-2xl z-10 shrink-0">
            
            {/* Header & Score */}
            <div className="p-6 border-b border-slate-100 text-center bg-gradient-to-b from-slate-50 to-white shrink-0">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">ATS Suitability Score</h2>
                
                {scanReport ? (
                    <div className="animate-in zoom-in duration-500">
                        <CircularScore score={scanReport.score} />
                        <p className="text-slate-500 text-sm font-medium">
                            Matches <strong>{scanReport.score}%</strong> of industry standards
                        </p>
                    </div>
                ) : (
                    <div className="py-8 flex flex-col items-center opacity-40">
                        <Zap size={48} className="text-slate-300 mb-2" />
                        <span className="text-sm font-medium text-slate-400">Ready to audit</span>
                    </div>
                )}
                
                <button 
                    onClick={onScan}
                    disabled={isScanning}
                    className="mt-6 w-full py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {isScanning ? <Loader2 className="animate-spin" /> : <Target size={18} />}
                    {isScanning ? 'Analyzing Resume...' : 'Run ATS Audit'}
                </button>
            </div>

            {/* Metrics Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
                {scanReport && (
                    <div className="animate-in slide-in-from-bottom-5 duration-500 space-y-6 pb-10">
                        
                        {/* Missing Keywords */}
                        {scanReport.keywordGaps && scanReport.keywordGaps.length > 0 && (
                             <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
                                <h3 className="text-rose-800 font-bold text-xs flex items-center gap-2 mb-3 uppercase tracking-wider">
                                    <AlertTriangle size={14} /> Missing Keywords
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {scanReport.keywordGaps.map((kw, i) => (
                                        <span key={i} className="text-xs bg-rose-50 text-rose-700 border border-rose-100 px-2 py-1 rounded-md font-bold">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                             </div>
                        )}

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <MetricBox 
                              id="content" label="Impact" icon={TrendingUp} 
                              data={scanReport.metrics?.content}
                              onClick={() => setActiveMetric({ ...scanReport.metrics?.content, title: "Impact & Verbs" })} 
                            />
                            <MetricBox 
                              id="sections" label="Structure" icon={ListChecks} 
                              data={scanReport.metrics?.sections}
                              onClick={() => setActiveMetric({ ...scanReport.metrics?.sections, title: "Sections Formatting" })} 
                            />
                            <MetricBox 
                              id="tailoring" label="Relevance" icon={Target} 
                              data={scanReport.metrics?.tailoring}
                              onClick={() => setActiveMetric({ ...scanReport.metrics?.tailoring, title: "Job Tailoring" })} 
                            />
                            <MetricBox 
                              id="contact" label="Contact" icon={UserCheck} 
                              data={scanReport.metrics?.contact}
                              onClick={() => setActiveMetric({ ...scanReport.metrics?.contact, title: "Personal Info" })} 
                            />
                        </div>

                        {/* Apply Fixes (Contextual) */}
                        <div className="pt-2">
                            <button 
                                onClick={handleApplyOptimization}
                                className="group w-full relative overflow-hidden bg-emerald-600 text-white py-4 rounded-xl font-bold transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-95"
                            >
                                <span className="relative flex items-center justify-center gap-2">
                                  <Sparkles size={18} /> Apply AI Improvements
                                </span>
                            </button>
                            <p className="text-[10px] text-center text-slate-400 mt-3 px-4 leading-relaxed">
                                Automatically updates summary, skills, and bullet points.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- DETAIL MODAL --- */}
      {/* (Modal code remains same as previous version) */}
      {activeMetric && (
        <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" 
            onClick={() => setActiveMetric(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20" 
            onClick={e => e.stopPropagation()} 
          >
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                 Analysis: {activeMetric.title}
              </h3>
              <button onClick={() => setActiveMetric(null)} className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
               <div className="flex gap-4 items-start">
                  <div className="bg-rose-100 p-2 rounded-full text-rose-600 mt-0.5 flex-shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Issue Detected</h4>
                    <p className="text-slate-600 text-sm mt-2 leading-relaxed bg-rose-50 p-3 rounded-lg border border-rose-100">
                        {activeMetric.wrong || "No specific issues detected."}
                    </p>
                  </div>
               </div>
               <div className="h-px bg-slate-100" />
               <div className="flex gap-4 items-start">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 mt-0.5 flex-shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Recommended Fix</h4>
                    <p className="text-slate-600 text-sm mt-2 leading-relaxed bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        {activeMetric.fix || "This section looks good! Keep it up."}
                    </p>
                  </div>
               </div>
            </div>

            <div className="bg-slate-50 p-4 flex justify-end border-t border-slate-100">
                <button 
                    onClick={() => setActiveMetric(null)} 
                    className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors shadow-sm"
                >
                    Close Analysis
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSScoreReport;