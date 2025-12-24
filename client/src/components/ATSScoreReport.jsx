import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Loader2, Zap, Sparkles, Undo2,
  ChevronDown, AlertTriangle, FileText,
  Target, XCircle, Type, Plus, 
  Share2, Save, Copy 
} from "lucide-react";
import api from "../configs/api";
import toast from "react-hot-toast";
import { resumeToText } from "../utils/resumeToText";

const ATSScoreReport = ({
  setResumeData,
  onSave,
  activeTab,
  setActiveTab,
  onSectionClick
}) => {
  const { resumeId } = useParams();

  const [resume, setResume] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jdText, setJdText] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [openSections, setOpenSections] = useState({ content: true, tailoring: true });

  /* 🔹 FETCH SAVED RESUME */
  useEffect(() => {
    if (!resumeId) return;

    api.get(`/api/resumes/get/${resumeId}`)
      .then(res => {
        setResume(res.data.resume);
      })
      .catch(() => {
        toast.error("Failed to load resume");
      });
  }, [resumeId]);

  /* 🔹 COOLDOWN TIMER */
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  /* 🔹 RUN ATS SCAN */
  const handleRunScan = async () => {
    if (!resume) return toast.error("Resume not loaded yet");
    if (!jdText.trim()) return toast.error("Please provide a Job Description");

    try {
      setLoading(true);

      const resumeText = resumeToText(resume);

      const res = await api.post("/api/ai/ats-analysis", {
        resumeText,
        jobDescription: jdText,
      });

      setReport(res.data);
      setCooldown(30);
      setActiveTab("tailoring");
      toast.success("Analysis Complete!");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const text = `My ATS Score: ${report?.score || 0}/100`;
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const addSkillToResume = (skill) => {
    if (resume.skills?.includes(skill)) return toast.error("Skill exists");
    const updated = { ...resume, skills: [...(resume.skills || []), skill] };
    setResume(updated);
    setResumeData(updated);
  };

  const triggerSectionHighlight = (text) => {
    const t = text.toLowerCase();
    if (t.includes("experience")) onSectionClick("Experience");
    else if (t.includes("project")) onSectionClick("Projects");
    else if (t.includes("summary")) onSectionClick("Summary");
    else if (t.includes("education")) onSectionClick("Education");
    else if (t.includes("skill")) onSectionClick("Skills");
  };

  return (
    <div className="flex flex-col h-screen w-full lg:w-[420px] bg-white border-l shadow-xl">

      {/* HEADER */}
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-extrabold flex gap-2">
          <Sparkles className="text-emerald-500"/> ATS Analysis
        </h2>
        <button onClick={onSave} className="p-2 bg-emerald-600 text-white rounded-xl">
          <Save size={18}/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* BEFORE SCAN */}
        {!report && (
          <>
            <textarea
              className="w-full min-h-[120px] p-4 border rounded-xl"
              placeholder="Paste Job Description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />

            <button
              onClick={handleRunScan}
              disabled={loading || cooldown > 0}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold"
            >
              {loading ? <Loader2 className="animate-spin"/> : <Zap />}
              Run ATS Scan
            </button>
          </>
        )}

        {/* AFTER SCAN */}
        {report && (
          <>
            <div className="text-center">
              <div className="text-6xl font-black">{report.score}/100</div>
              <button onClick={handleShare} className="mt-2 text-indigo-600">
                <Share2 size={16}/> Share
              </button>
            </div>

            {/* RED FLAGS */}
            {report.redFlags?.map((flag, i) => (
              <div
                key={i}
                onClick={() => triggerSectionHighlight(flag)}
                className="p-4 bg-rose-50 border rounded-xl cursor-pointer"
              >
                <AlertTriangle size={16}/> {flag}
              </div>
            ))}

            {/* SKILL GAPS */}
            <div>
              <h4 className="font-bold text-sm mb-2">Skill Gaps</h4>
              <div className="flex flex-wrap gap-2">
                {report.keywordGaps?.map((k, i) => (
                  <button
                    key={i}
                    onClick={() => addSkillToResume(k.skill)}
                    className="px-3 py-1 border rounded-lg text-sm"
                  >
                    <Plus size={12}/> {k.skill}
                  </button>
                ))}
              </div>
            </div>

            {/* CONTENT AUDIT */}
            <button
              onClick={() => setOpenSections(p => ({...p, content: !p.content}))}
              className="flex justify-between w-full border-b pb-2"
            >
              Content Quality <ChevronDown />
            </button>

            {openSections.content && (
              <div className="text-sm text-slate-600">
                Experience, summary & formatting checked
              </div>
            )}

            {/* JOB FIT */}
            <button
              onClick={() => setOpenSections(p => ({...p, tailoring: !p.tailoring}))}
              className="flex justify-between w-full border-b pb-2"
            >
              Job Fit <ChevronDown />
            </button>

            {openSections.tailoring && (
              <div className="text-sm">
                Skill Match: {report.tailoring?.hardSkills || 0}%
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ATSScoreReport;
