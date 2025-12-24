import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Sparkles, Loader2, Zap, CheckCircle, 
  X, AlertCircle, Share2, Eye, EyeOff, ListChecks, UserCheck, ShieldCheck, Target 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ResumePreview from './ResumePreview';
import TemplateSelector from './TemplateSelector'; 

const ATSScoreReport = ({ 
  selectedResume, onBack, isScanning, scanReport, onScan, onSaveSuggestions, onUpdateVisibility, onUpdateTemplate 
}) => {
  const [activeMetric, setActiveMetric] = useState(null);

  // Keyboard Support: Close modal on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setActiveMetric(null);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Score Color Helper
  const getScoreColor = (score) => {
    if (typeof score !== 'number') return "text-slate-400";
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  /* =========================================
     NEW DYNAMIC HANDLERS
     ========================================= */

  // 1. Dynamic Share Logic: Uses native share sheet or clipboard
  const handleShare = async () => {
    if (!selectedResume._id || !selectedResume.public) {
      return toast.error("Resume must be set to Public to share.");
    }

    const shareUrl = `${window.location.origin}/view/${selectedResume._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Resume - ${selectedResume.personal_info?.full_name || 'Professional Resume'}`,
          url: shareUrl,
        });
      } catch (err) { 
        if (err.name !== 'AbortError') toast.error("Sharing failed."); 
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Public link copied to clipboard!");
    }
  };

  // 2. Merge Logic: Combine AI suggestions with original resume data
  const handleApplyOptimization = () => {
    if (!scanReport?.optimizedData) {
      return toast.error("No optimization data available. Run a scan first.");
    }

    // Map AI's optimized data back to the existing resume structure
    const upgradedResume = {
      ...selectedResume,
      professional_summary: scanReport.optimizedData.professional_summary || selectedResume.professional_summary,
      skills: scanReport.optimizedData.skills || selectedResume.skills,
      experience: selectedResume.experience.map((exp, index) => ({
        ...exp,
        description: scanReport.optimizedData.experience?.[index]?.description || exp.description
      }))
    };

    // Save to MongoDB via parent Dashboard handler
    onSaveSuggestions(upgradedResume);
    // Return to dashboard to see results
    onBack(); 
  };

  const MetricBox = ({ id, icon: Icon, label, colorClass }) => {
    const metricData = scanReport?.metrics?.[id] ?? null;
    const displayScore = typeof metricData?.score === 'number' ? metricData.score : "—";
    
    const details = metricData || { 
      wrong: "No data available.", 
      fix: "Run an audit to see detailed findings." 
    };

    return (
      <button 
        onClick={() => setActiveMetric({ ...details, title: label })}
        className="flex flex-col items-center justify-center p-4 bg-white border-2 border-emerald-50 rounded-[32px] hover:border-emerald-500 hover:shadow-xl transition-all group"
        title="Click for analysis details"
      >
        <Icon className={`${colorClass} mb-2 group-hover:scale-110 transition-transform`} size={24} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
        <span className={`text-xl font-black ${getScoreColor(displayScore)}`}>
          {displayScore}{typeof displayScore === 'number' ? '/100' : ''}
        </span>
      </button>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f0fdf4]">
      
      {/* NAVIGATION BAR */}
      <nav className="bg-white border-b border-emerald-100 px-8 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="inline-flex gap-2 items-center text-emerald-600 hover:text-emerald-800 font-bold text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <div className="flex items-center gap-2">
            {/* Share button appears only when public is true */}
            {selectedResume.public === true && (
              <button 
                onClick={handleShare}
                className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-all font-bold shadow-sm">
                <Share2 size={14} /> Share
              </button>
            )}

            <button 
              onClick={() => onUpdateVisibility(selectedResume._id, selectedResume.public)}
              className="flex items-center p-2 px-4 gap-2 text-xs bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-100 transition-all hover:bg-emerald-100">
              {selectedResume.public ? <><Eye size={14} /> Public</> : <><EyeOff size={14} /> Private</>}
            </button>
            
            <TemplateSelector 
              selectedTemplate={selectedResume.template || 'classic'} 
              onChange={(id) => onUpdateTemplate(selectedResume._id, id)} />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Sparkles className="text-emerald-500" />
          <span className="font-black text-emerald-900 uppercase tracking-tighter text-lg italic">ATS Auditor</span>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6">
        
        {/* LEFT PANEL: PREVIEW */}
        <div className="flex-1 overflow-y-auto bg-white/50 rounded-[40px] border border-emerald-100 p-4 custom-scrollbar">
          <div className="scale-[0.9] origin-top">
            <ResumePreview 
              data={selectedResume} 
              template={selectedResume.template || "classic"} 
              accentColor={selectedResume.accent_color || "#10b981"} />
          </div>
        </div>

        {/* RIGHT PANEL: ANALYSIS */}
        <div className="w-full lg:w-[480px] flex flex-col bg-white rounded-[40px] border border-emerald-100 shadow-2xl overflow-hidden">
          <div className="p-8 bg-emerald-900 text-white flex justify-between items-center">
            <div>
              <h2 className={`text-4xl font-black italic ${getScoreColor(scanReport?.score)}`}>
                {scanReport?.score ?? "---"}
              </h2>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Industry Match Rate</span>
            </div>
            <button 
              onClick={onScan}
              disabled={isScanning}
              className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-8 py-3 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50">
              {isScanning ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Analyzing...
                </span>
              ) : 'Audit Now'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {scanReport ? (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <MetricBox id="content" label="Content" icon={Target} colorClass="text-blue-500" />
                  <MetricBox id="sections" label="Sections" icon={ListChecks} colorClass="text-emerald-500" />
                  <MetricBox id="contact" label="Contacts" icon={UserCheck} colorClass="text-purple-500" />
                  <MetricBox id="tailoring" label="Tailoring" icon={ShieldCheck} colorClass="text-amber-500" />
                </div>

                <button 
                  onClick={handleApplyOptimization}
                  className="w-full bg-emerald-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle size={20} /> Apply AI Optimizations
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
                <Zap size={64} className="mb-4 text-emerald-900" />
                <p className="font-black text-emerald-900 uppercase tracking-widest text-xs leading-loose px-10">
                  Click "Audit Now" to generate<br/>industry-standard metrics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {activeMetric && (
        <div className="fixed inset-0 bg-emerald-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300" onClick={() => setActiveMetric(null)}>
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 relative shadow-2xl border border-emerald-100" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveMetric(null)} className="absolute top-8 right-8 text-slate-300 hover:text-emerald-600 transition-colors">
              <X size={28} />
            </button>
            
            <h3 className="text-2xl font-black text-emerald-900 mb-8 uppercase tracking-tighter italic">
              {activeMetric.title} Analysis
            </h3>
            
            <div className="space-y-6">
              <div className="p-6 bg-rose-50 border-l-8 border-rose-500 rounded-2xl">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <AlertCircle size={12}/> Analysis Findings
                </p>
                <p className="text-rose-900 font-bold leading-relaxed">{activeMetric.wrong}</p>
              </div>

              <div className="p-6 bg-emerald-50 border-l-8 border-emerald-500 rounded-2xl">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <CheckCircle size={12}/> Optimization Strategy
                </p>
                <p className="text-emerald-900 font-bold leading-relaxed">{activeMetric.fix}</p>
              </div>
            </div>

            <button 
              onClick={() => setActiveMetric(null)}
              className="w-full mt-10 py-5 bg-emerald-900 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg"
            >
              Confirm Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSScoreReport;