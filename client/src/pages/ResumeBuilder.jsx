import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../configs/api';
import html2pdf from 'html2pdf.js';

// Icons
import { 
  ArrowLeftIcon, ChevronLeft, ChevronRight, 
  EyeIcon, EyeOffIcon, DownloadIcon, Loader2, Share2Icon 
} from 'lucide-react';

// Components
import PersonalInfoForm from '../components/PersonalInfoForm';
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm';
import ExperienceForm from '../components/ExperienceForm';
import EducationForm from '../components/EducationForm';
import ProjectForm from '../components/ProjectForm';
import SkillsForm from '../components/SkillsForm';
import TemplateSelector from '../components/TemplateSelector';
import Colorpicker from '../components/Colorpicker';
import ResumePreview from '../components/ResumePreview';

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const { token } = useSelector(state => state.auth);

  const [resumeData, setResumeData] = useState(null);
  const [debouncedResumeData, setDebouncedResumeData] = useState(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [scale, setScale] = useState(1);

  const previewParentRef = useRef(null);

  // Define Sections
  const sections = useMemo(() => [
    { id: "personal", name: "Personal Information" },
    { id: "summary", name: "Professional Summary" },
    { id: "experience", name: "Experience" },
    { id: "education", name: "Education" },
    { id: "projects", name: "Projects" },
    { id: "skills", name: "Skills" },
  ], []);

  const activeSection = sections[activeSectionIndex];

  // Dynamic Scale Calculation via ResizeObserver
  useEffect(() => {
    const parent = previewParentRef.current;
    if (!parent) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const availableWidth = entry.contentRect.width - 32; // subtracted padding
        // 794px is roughly 210mm at standard 96 DPI
        const calculatedScale = availableWidth / 794; 
        setScale(Math.min(Math.max(calculatedScale, 0.35), 1.1));
      }
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // 1. Load Resume
  useEffect(() => {
    const loadResume = async () => {
      try {
        const { data } = await api.get(`/api/resumes/get/${resumeId}`, { 
          headers: { Authorization: token } 
        });
        if (data.resume) {
          setResumeData(data.resume);
          setDebouncedResumeData(data.resume);
          document.title = data.resume.title || "Resume Builder";
        }
      } catch (error) {
        toast.error("Failed to load resume");
      }
    };
    if (resumeId && token) loadResume();
  }, [resumeId, token]);

  // 2. Debounce Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResumeData(resumeData);
    }, 500);
    return () => clearTimeout(timer);
  }, [resumeData]);

  // 3. Update Handler
  const handleDataChange = (sectionKey, newData) => {
    setResumeData((prev) => ({
      ...prev,
      [sectionKey]: newData
    }));
  };

  // 4. Save Function
  const saveResume = async () => {
    if (!resumeData) return;
    setIsSaving(true);
    try {
      const updatedData = structuredClone(resumeData);
      const imageFile = updatedData.personal_info?.image instanceof File ? updatedData.personal_info.image : null;
      if (imageFile) delete updatedData.personal_info.image;

      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify(updatedData));
      if (imageFile) formData.append("image", imageFile);

      const { data } = await api.put('/api/resumes/update', formData, { 
        headers: { Authorization: token } 
      });
      setResumeData(data.resume);
      setDebouncedResumeData(data.resume);
      toast.success("Changes saved!");
    } catch (error) {
      toast.error("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Download Function
  const downloadResume = async () => {
    const element = document.getElementById("resume-preview-id");
    if (!element) return toast.error("Preview not ready");
    
    try {
      toast.success("Downloading PDF...");
      await document.fonts.ready;
      
      const opt = {
        margin: 0,
        filename: `${resumeData?.personal_info?.full_name || 'Resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      
    } catch (e) {
      console.error(e);
      toast.error("Download failed");
    }
  };

  // 6. Toggle Visibility
  const toggleVisibility = async () => {
    const newStatus = !resumeData.public;
    try {
        setResumeData(prev => ({ ...prev, public: newStatus }));
        await api.put('/api/resumes/update', { 
            resumeId, 
            resumeData: { public: newStatus } 
        }, { headers: { Authorization: token } });
        toast.success(newStatus ? "Resume is now Public" : "Resume is now Private");
    } catch (e) {
        toast.error("Update failed");
    }
  };

  // 7. Share Function
  const handleShare = async () => {
    const url = `${window.location.origin}/view/${resumeId}`;
    const title = `${resumeData.personal_info?.full_name || 'My'} Resume`;
    const text = "Check out my professional resume created with Resume Builder.";

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        toast.success("Shared successfully!");
      } catch (error) {
        console.log('Share cancelled', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  if (!resumeData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        <Loader2 className="animate-spin mr-2" /> Loading Resume...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 w-full px-4 md:px-8 py-4 md:py-6">
      {/* Navigation Header */}
      <div className="w-full max-w-[1800px] mx-auto">
        <Link to="/app" className="inline-flex items-center gap-2 text-slate-500 hover:text-green-600 mb-4 font-medium transition-colors">
          <ArrowLeftIcon size={18} /> Back to Dashboard
        </Link>
      </div>

      {/* Main Grid Section */}
      <div className="w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* === LEFT SIDE: EDITOR (Equal Split - 6 Cols) === */}
        <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col z-10">
          
          {/* Editor Header Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center gap-2">
            <div className="flex gap-2 sm:gap-3">
               <TemplateSelector selectedTemplate={resumeData.template} onChange={t => setResumeData(prev => ({...prev, template: t}))} />
               <Colorpicker selectedColor={resumeData.accent_color} onChange={c => setResumeData(prev => ({...prev, accent_color: c}))} />
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
                <button onClick={() => setActiveSectionIndex(p => Math.max(0, p-1))} disabled={activeSectionIndex===0} className="hover:text-green-600 disabled:opacity-30 p-1 transition-colors"><ChevronLeft size={24} strokeWidth={2.5} /></button>
                <span className="text-xs sm:text-sm font-black text-slate-400 w-10 text-center select-none">{activeSectionIndex + 1} / {sections.length}</span>
                <button onClick={() => setActiveSectionIndex(p => Math.min(sections.length-1, p+1))} disabled={activeSectionIndex===sections.length-1} className="hover:text-green-600 disabled:opacity-30 p-1 transition-colors"><ChevronRight size={24} strokeWidth={2.5} /></button>
            </div>
          </div>

          {/* Form Fields Area */}
          <div className="p-4 sm:p-6 min-h-[500px]">
             {activeSection.id === 'personal' && <PersonalInfoForm data={resumeData.personal_info || {}} onChange={(d) => handleDataChange('personal_info', d)} />}
             {activeSection.id === 'summary' && <ProfessionalSummaryForm data={resumeData.professional_summary || ''} onChange={(d) => handleDataChange('professional_summary', d)} />}
             {activeSection.id === 'experience' && <ExperienceForm data={resumeData.experience || []} onChange={(d) => handleDataChange('experience', d)} />}
             {activeSection.id === 'education' && <EducationForm data={resumeData.education || []} onChange={(d) => handleDataChange('education', d)} />}
             {activeSection.id === 'projects' && <ProjectForm data={resumeData.project || []} onChange={(d) => handleDataChange('project', d)} />}
             {activeSection.id === 'skills' && <SkillsForm data={resumeData.skills || []} onChange={(d) => handleDataChange('skills', d)} />}
          </div>

          {/* Footer Save & Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-100 space-y-3">
            <button onClick={saveResume} disabled={isSaving} className="w-full py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-md shadow-green-100">
                {isSaving ? <Loader2 className="animate-spin" /> : "Save Changes"}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={toggleVisibility} 
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all ${resumeData.public ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                  {resumeData.public ? <EyeIcon size={18}/> : <EyeOffIcon size={18}/>}
                  {resumeData.public ? "Public" : "Private"}
              </button>

              <button onClick={downloadResume} className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all">
                  <DownloadIcon size={18}/> Download PDF
              </button>
            </div>

            {resumeData.public && (
              <button onClick={handleShare} className="w-full py-2.5 border-2 border-dashed border-blue-200 bg-blue-50 text-blue-600 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-100 transition-all">
                <Share2Icon size={18} /> Share Resume Link
              </button>
            )}
          </div>
        </div>

        {/* === RIGHT SIDE: PREVIEW CONTAINER (Equal Split - 6 Cols) === */}
        <div className="lg:col-span-6 w-full lg:sticky lg:top-4 h-[650px] lg:h-[88vh]">
           <div 
             ref={previewParentRef}
             className="w-full h-full bg-slate-200/60 rounded-2xl border border-slate-200/80 shadow-inner p-4 flex justify-center items-start overflow-y-auto overflow-x-hidden custom-scrollbar"
           >
              {/* Scaled Render Container */}
              <div 
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  marginBottom: `calc((297mm * ${scale}) - 297mm)`
                }}
                className="shrink-0 transition-transform duration-75 ease-out"
              >
                <div id="resume-preview-id" className="w-full h-full bg-white shadow-2xl rounded-sm">
                   {debouncedResumeData && (
                     <ResumePreview 
                         data={debouncedResumeData} 
                         template={debouncedResumeData.template} 
                         accentColor={debouncedResumeData.accent_color} 
                     />
                   )}
                </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeBuilder;