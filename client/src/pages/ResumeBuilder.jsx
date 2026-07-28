import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../configs/api';
import html2pdf from 'html2pdf.js';

// Icons
import { 
  ArrowLeftIcon, ChevronLeft, ChevronRight, 
  EyeIcon, EyeOffIcon, DownloadIcon, Loader2, Share2Icon, Type
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
  const [previewScale, setPreviewScale] = useState(0.42);
  
  // Font scaling mode: 'small' | 'normal' | 'large'
  const [fontScale, setFontScale] = useState('normal');

  const previewBoxRef = useRef(null);

  const sections = useMemo(() => [
    { id: "personal", name: "Personal Information" },
    { id: "summary", name: "Professional Summary" },
    { id: "experience", name: "Experience" },
    { id: "education", name: "Education" },
    { id: "projects", name: "Projects" },
    { id: "skills", name: "Skills" },
  ], []);

  const activeSection = sections[activeSectionIndex];

  // Dynamic preview scaling calculation
  useEffect(() => {
    const updateScale = () => {
      if (!previewBoxRef.current) return;
      const { clientWidth } = previewBoxRef.current;
      if (clientWidth === 0) return;

      const availableWidth = clientWidth - 20;
      const scale = availableWidth / 794;
      setPreviewScale(Math.min(Math.max(scale, 0.25), 0.85));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [resumeData]);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResumeData(resumeData);
    }, 500);
    return () => clearTimeout(timer);
  }, [resumeData]);

  const handleDataChange = (sectionKey, newData) => {
    setResumeData((prev) => ({
      ...prev,
      [sectionKey]: newData
    }));
  };

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
    <div className="w-full max-w-6xl mx-auto lg:max-h-[calc(100vh-120px)] lg:h-[620px] bg-slate-50 flex flex-col p-2 lg:p-3 overflow-y-auto lg:overflow-hidden">
      
      {/* Navigation link */}
      <div className="shrink-0 mb-1 flex justify-between items-center">
        <Link to="/app" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-green-600 text-xs font-medium transition-colors">
          <ArrowLeftIcon size={14} /> Back to Dashboard
        </Link>
      </div>

      {/* Main Grid Container with controlled width and smaller boxes */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0 lg:overflow-hidden items-start">
        
        {/* === LEFT SIDE: COMPACT FORM EDITOR === */}
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-xs lg:h-full lg:min-h-0 overflow-hidden">
          
          {/* Header Controls with Density / Font Size buttons */}
          <div className="p-1.5 border-b border-slate-100 flex justify-between items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1">
               <TemplateSelector selectedTemplate={resumeData.template} onChange={t => setResumeData(prev => ({...prev, template: t}))} />
               <Colorpicker selectedColor={resumeData.accent_color} onChange={c => setResumeData(prev => ({...prev, accent_color: c}))} />
               
               {/* FONT SIZE / DENSITY CONTROLLER */}
               <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 text-[10px] ml-1">
                  <Type size={12} className="text-slate-400 mx-0.5" />
                  <button 
                    onClick={() => setFontScale('small')} 
                    className={`px-1 py-0.5 rounded font-bold transition-colors ${fontScale === 'small' ? 'bg-white shadow-xs text-green-700' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    S
                  </button>
                  <button 
                    onClick={() => setFontScale('normal')} 
                    className={`px-1 py-0.5 rounded font-bold transition-colors ${fontScale === 'normal' ? 'bg-white shadow-xs text-green-700' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    M
                  </button>
                  <button 
                    onClick={() => setFontScale('large')} 
                    className={`px-1 py-0.5 rounded font-bold transition-colors ${fontScale === 'large' ? 'bg-white shadow-xs text-green-700' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    L
                  </button>
               </div>
            </div>
            
            {/* Section Pagination */}
            <div className="flex items-center gap-0.5">
                <button onClick={() => setActiveSectionIndex(p => Math.max(0, p-1))} disabled={activeSectionIndex===0} className="hover:text-green-600 disabled:opacity-30 p-1 transition-colors"><ChevronLeft size={16} strokeWidth={2.5} /></button>
                <span className="text-[10px] font-bold text-slate-400 w-7 text-center select-none">{activeSectionIndex + 1}/{sections.length}</span>
                <button onClick={() => setActiveSectionIndex(p => Math.min(sections.length-1, p+1))} disabled={activeSectionIndex===sections.length-1} className="hover:text-green-600 disabled:opacity-30 p-1 transition-colors"><ChevronRight size={16} strokeWidth={2.5} /></button>
            </div>
          </div>

          {/* Form Content - Compact spacing */}
          <div className="p-2 lg:p-1 flex-1 lg:overflow-y-auto custom-scrollbar lg:min-h-0 
                          lg:[&_input]:!h-5 lg:[&_input]:!py-0 lg:[&_input]:!px-2 lg:[&_input]:!mb-0 lg:[&_input]:!text-[10px] 
                          lg:[&_label]:!mb-0 lg:[&_label]:!text-[9px] lg:[&_label]:!font-semibold lg:[&_label]:!text-slate-500
                          lg:[&_textarea]:!py-0.5 lg:[&_textarea]:!px-2 lg:[&_textarea]:!text-[11px]
                          lg:[&_div]:!gap-0 lg:[&_div]:!space-y-0.5 lg:[&_div]:!my-0
                          lg:[&_.space-y-4]:!space-y-0.5 lg:[&_.space-y-6]:!space-y-0.5 lg:[&_p]:hidden">
             {activeSection.id === 'personal' && <PersonalInfoForm data={resumeData.personal_info || {}} onChange={(d) => handleDataChange('personal_info', d)} />}
             {activeSection.id === 'summary' && <ProfessionalSummaryForm data={resumeData.professional_summary || ''} onChange={(d) => handleDataChange('professional_summary', d)} />}
             {activeSection.id === 'experience' && <ExperienceForm data={resumeData.experience || []} onChange={(d) => handleDataChange('experience', d)} />}
             {activeSection.id === 'education' && <EducationForm data={resumeData.education || []} onChange={(d) => handleDataChange('education', d)} />}
             {activeSection.id === 'projects' && <ProjectForm data={resumeData.project || []} onChange={(d) => handleDataChange('project', d)} />}
             {activeSection.id === 'skills' && <SkillsForm data={resumeData.skills || []} onChange={(d) => handleDataChange('skills', d)} />}
          </div>

          {/* Footer Actions */}
          <div className="p-1 border-t border-slate-100 space-y-1 shrink-0 bg-white">
            <button onClick={saveResume} disabled={isSaving} className="w-full py-1 bg-green-600 text-white hover:bg-green-700 rounded font-bold text-[11px] transition-all flex justify-center items-center gap-1 shadow-xs">
                {isSaving ? <Loader2 className="animate-spin" size={13} /> : "Save Changes"}
            </button>

            <div className="grid grid-cols-2 gap-1">
              <button 
                onClick={toggleVisibility} 
                className={`flex items-center justify-center gap-1 py-0.5 rounded text-[10px] font-bold border transition-all ${resumeData.public ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                  {resumeData.public ? <EyeIcon size={12}/> : <EyeOffIcon size={12}/>}
                  {resumeData.public ? "Public" : "Private"}
              </button>

              <button onClick={downloadResume} className="flex items-center justify-center gap-1 py-0.5 bg-slate-800 text-white rounded text-[10px] font-bold hover:bg-slate-900 transition-all">
                  <DownloadIcon size={12}/> Download PDF
              </button>
            </div>

            {resumeData.public && (
              <button onClick={handleShare} className="w-full py-0.5 border border-dashed border-blue-200 bg-blue-50 text-blue-600 rounded text-[10px] font-bold flex justify-center items-center gap-1 hover:bg-blue-100 transition-all">
                <Share2Icon size={12} /> Share Resume Link
              </button>
            )}
          </div>
        </div>

        {/* === RIGHT SIDE: PREVIEW CONTAINER === */}
        <div 
          ref={previewBoxRef}
          className="w-full flex justify-center items-start lg:max-h-full overflow-hidden"
        >
          <div 
            style={{
              width: '210mm',
              height: 'auto',
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center'
            }}
            className="shrink-0 transition-transform duration-75 ease-out flex justify-center items-start"
          >
            <div 
              id="resume-preview-id" 
              className="w-full h-auto bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden"
            >
               {debouncedResumeData && (
                 <ResumePreview 
                     data={debouncedResumeData} 
                     template={debouncedResumeData.template} 
                     accentColor={debouncedResumeData.accent_color}
                     fontScale={fontScale}
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