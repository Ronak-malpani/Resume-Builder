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
  const [previewScale, setPreviewScale] = useState(0.45);

  const desktopPreviewRef = useRef(null);

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

  // Calculate dynamic scale for Desktop viewports
  useEffect(() => {
    const updateDesktopScale = () => {
      if (window.innerWidth < 1024) return; // Skip calculation for mobile

      if (!desktopPreviewRef.current) return;
      const { clientWidth, clientHeight } = desktopPreviewRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;

      const a4Width = 794; 
      const a4Height = 1123;
      const padding = 32;

      const scaleX = (clientWidth - padding) / a4Width;
      const scaleY = (clientHeight - padding) / a4Height;
      const fitScale = Math.min(scaleX, scaleY);
      
      setPreviewScale(Math.max(fitScale, 0.25));
    };

    updateDesktopScale();
    const timer = setTimeout(updateDesktopScale, 100);
    window.addEventListener('resize', updateDesktopScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDesktopScale);
    };
  }, [resumeData]);

  // Load Resume Data
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

  // Debounce Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResumeData(resumeData);
    }, 500);
    return () => clearTimeout(timer);
  }, [resumeData]);

  // Update Section Data
  const handleDataChange = (sectionKey, newData) => {
    setResumeData((prev) => ({
      ...prev,
      [sectionKey]: newData
    }));
  };

  // Save Function
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

  // Download PDF Function
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

  // Toggle Visibility
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

  // Share Function
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
    <div className="min-h-screen lg:h-screen w-full lg:overflow-hidden bg-slate-50 flex flex-col p-4 lg:p-3">
      
      {/* Top Header */}
      <div className="shrink-0 mb-4 lg:mb-1 flex justify-between items-center">
        <Link to="/app" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-green-600 text-sm lg:text-xs font-medium transition-colors">
          <ArrowLeftIcon size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-3 min-h-0 lg:overflow-hidden">
        
        {/* === LEFT SIDE: EDITOR === */}
        <div className="bg-white rounded-2xl lg:rounded-xl border border-slate-200 flex flex-col shadow-sm lg:shadow-xs lg:h-full lg:min-h-0 lg:overflow-hidden">
          
          {/* Controls Header */}
          <div className="p-4 lg:p-2 border-b border-slate-100 flex justify-between items-center gap-2 shrink-0">
            <div className="flex gap-2 lg:gap-1.5">
               <TemplateSelector selectedTemplate={resumeData.template} onChange={t => setResumeData(prev => ({...prev, template: t}))} />
               <Colorpicker selectedColor={resumeData.accent_color} onChange={c => setResumeData(prev => ({...prev, accent_color: c}))} />
            </div>
            
            <div className="flex items-center gap-2 lg:gap-1">
                <button onClick={() => setActiveSectionIndex(p => Math.max(0, p-1))} disabled={activeSectionIndex===0} className="hover:text-green-600 disabled:opacity-30 p-1 lg:p-0.5 transition-colors"><ChevronLeft size={22} className="lg:w-4 lg:h-4" strokeWidth={2.5} /></button>
                <span className="text-xs lg:text-[11px] font-bold text-slate-400 w-10 text-center select-none">{activeSectionIndex + 1}/{sections.length}</span>
                <button onClick={() => setActiveSectionIndex(p => Math.min(sections.length-1, p+1))} disabled={activeSectionIndex===sections.length-1} className="hover:text-green-600 disabled:opacity-30 p-1 lg:p-0.5 transition-colors"><ChevronRight size={22} className="lg:w-4 lg:h-4" strokeWidth={2.5} /></button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 lg:p-2 flex-1 lg:overflow-y-auto custom-scrollbar lg:min-h-0 text-sm lg:text-xs
                          lg:[&_label]:mb-0.5 lg:[&_label]:text-[11px] lg:[&_label]:font-semibold lg:[&_label]:text-slate-600 
                          lg:[&_input]:py-1 lg:[&_input]:px-2.5 lg:[&_input]:text-xs lg:[&_input]:h-8 lg:[&_input]:mb-2 
                          lg:[&_textarea]:py-1 lg:[&_textarea]:px-2.5 lg:[&_textarea]:text-xs 
                          lg:[&_p]:hidden lg:[&_h2]:hidden lg:[&_.space-y-4]:space-y-1 lg:[&_.space-y-6]:space-y-1">
             {activeSection.id === 'personal' && <PersonalInfoForm data={resumeData.personal_info || {}} onChange={(d) => handleDataChange('personal_info', d)} />}
             {activeSection.id === 'summary' && <ProfessionalSummaryForm data={resumeData.professional_summary || ''} onChange={(d) => handleDataChange('professional_summary', d)} />}
             {activeSection.id === 'experience' && <ExperienceForm data={resumeData.experience || []} onChange={(d) => handleDataChange('experience', d)} />}
             {activeSection.id === 'education' && <EducationForm data={resumeData.education || []} onChange={(d) => handleDataChange('education', d)} />}
             {activeSection.id === 'projects' && <ProjectForm data={resumeData.project || []} onChange={(d) => handleDataChange('project', d)} />}
             {activeSection.id === 'skills' && <SkillsForm data={resumeData.skills || []} onChange={(d) => handleDataChange('skills', d)} />}
          </div>

          {/* Footer */}
          <div className="p-4 lg:p-2 border-t border-slate-100 space-y-2 lg:space-y-1 shrink-0 bg-white rounded-b-2xl lg:rounded-b-xl">
            <button onClick={saveResume} disabled={isSaving} className="w-full py-3 lg:py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-xl lg:rounded-md font-bold text-sm lg:text-xs transition-all flex justify-center items-center gap-2 shadow-xs">
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : "Save Changes"}
            </button>

            <div className="grid grid-cols-2 gap-2 lg:gap-1">
              <button 
                onClick={toggleVisibility} 
                className={`flex items-center justify-center gap-1 py-2 lg:py-1 rounded-xl lg:rounded-md text-xs lg:text-[11px] font-bold border transition-all ${resumeData.public ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                  {resumeData.public ? <EyeIcon size={14}/> : <EyeOffIcon size={14}/>}
                  {resumeData.public ? "Public" : "Private"}
              </button>

              <button onClick={downloadResume} className="flex items-center justify-center gap-1 py-2 lg:py-1 bg-slate-800 text-white rounded-xl lg:rounded-md text-xs lg:text-[11px] font-bold hover:bg-slate-900 transition-all">
                  <DownloadIcon size={14}/> Download PDF
              </button>
            </div>

            {resumeData.public && (
              <button onClick={handleShare} className="w-full py-2 lg:py-1 border border-dashed border-blue-200 bg-blue-50 text-blue-600 rounded-xl lg:rounded-md text-xs lg:text-[11px] font-bold flex justify-center items-center gap-1 hover:bg-blue-100 transition-all">
                <Share2Icon size={14} /> Share Resume Link
              </button>
            )}
          </div>
        </div>

        {/* === RIGHT SIDE: PREVIEW === */}
        
        {/* --- MOBILE PREVIEW CONTAINER (Shown only on small screens) --- */}
        <div className="block lg:hidden bg-white rounded-2xl border border-slate-200 p-2 shadow-sm mb-6 overflow-x-auto">
          <div className="w-[794px] transform origin-top-left scale-[0.42] sm:scale-[0.55]">
            <div id="resume-preview-id-mobile" className="w-full bg-white border border-slate-100">
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

        {/* --- DESKTOP PREVIEW CONTAINER (Shown only on large screens) --- */}
        <div 
          ref={desktopPreviewRef}
          className="hidden lg:flex bg-white rounded-xl border border-slate-200 shadow-xs justify-center items-center h-full min-h-0 overflow-hidden relative p-1"
        >
          <div 
            style={{
              width: '210mm',
              height: '297mm',
              transform: `scale(${previewScale})`,
              transformOrigin: 'center center'
            }}
            className="shrink-0 transition-transform duration-75 ease-out flex justify-center items-center"
          >
            <div id="resume-preview-id" className="w-full h-full bg-white rounded-xs border border-slate-100">
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
  );
};

export default ResumeBuilder;