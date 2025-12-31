import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../configs/api';
import { 
  ArrowLeftIcon, Briefcase, FileText, FolderIcon, GraduationCap, Sparkles, User,
  ChevronLeft, ChevronRight, Share2Icon, EyeIcon, EyeOffIcon, DownloadIcon, Loader2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import html2canvasPro from 'html2canvas-pro';
import jsPDF from 'jspdf';

// Form Components
import PersonalInfoForm from '../components/PersonalInfoForm';
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm';
import ExperienceForm from '../components/ExperienceForm';
import EducationForm from '../components/EducationForm';
import ProjectForm from '../components/ProjectForm';
import SkillsForm from '../components/SkillsForm';

// UI Components
import TemplateSelector from '../components/TemplateSelector';
import Colorpicker from '../components/Colorpicker';
import ResumePreview from '../components/ResumePreview';

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const { token } = useSelector(state => state.auth);

  const [resumeData, setResumeData] = useState(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sections = useMemo(() => [
    { id: "personal", name: "Personal Information", icon: User },
    { id: "summary", name: "Professional Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
  ], []);

  const activeSection = sections[activeSectionIndex];

  const loadExistingResume = async () => {
    try {
      const { data } = await api.get(`/api/resumes/get/${resumeId}`, {
        headers: { Authorization: token }
      });
      if (data.resume) {
        setResumeData(data.resume);
        document.title = data.resume.title || "Resume Builder";
      }
    } catch (error) {
      toast.error("Failed to load resume");
    }
  };

  useEffect(() => {
    if (resumeId && token) loadExistingResume();
  }, [resumeId, token]);

  const saveResume = async () => {
    if (!resumeData) return;
    setIsSaving(true);
    try {
      const imageFile = resumeData.personal_info?.image instanceof File 
        ? resumeData.personal_info.image 
        : null;

      const dataToSerialize = structuredClone(resumeData);
      if (imageFile) {
        dataToSerialize.personal_info.image = resumeData.personal_info.image.name;
      }

      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify(dataToSerialize));
      if (removeBackground) formData.append("removeBackground", "yes");
      if (imageFile) formData.append("image", imageFile);

      const { data } = await api.put('/api/resumes/update', formData, {
        headers: { Authorization: token }
      });

      setResumeData(data.resume);
      toast.success("Changes saved!");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const changeResumeVisibility = async () => {
    if (!resumeData) return;
    try {
      const newStatus = !resumeData.public;
      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify({ public: newStatus }));

      await api.put('/api/resumes/update', formData, { headers: { Authorization: token } });
      setResumeData(prev => ({ ...prev, public: newStatus }));
      toast.success(newStatus ? "Resume is now Public" : "Resume is now Private");
    } catch (error) {
      toast.error("Failed to update visibility");
    }
  };

  const handleShare = () => {
    const resumeUrl = `${window.location.origin}/view/${resumeId}`;
    if (navigator.share) {
      navigator.share({ url: resumeUrl, title: "My Resume" });
    } else {
      navigator.clipboard.writeText(resumeUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const downloadResume = async () => {
    const originalElement = document.getElementById('resume-preview');
    if (!originalElement) return;

    toast.success("Preparing high-quality A4 PDF...");

    const tempContainer = document.createElement('div');
    tempContainer.className = 'capture-sandbox';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    
    const clonedElement = originalElement.cloneNode(true);
    clonedElement.style.transform = 'none';
    clonedElement.style.zoom = '1';

    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    try {
      const canvas = await html2canvasPro(clonedElement, {
        scale: 3, 
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < elements.length; i++) {
            const style = window.getComputedStyle(elements[i]);
            elements[i].style.color = style.color;
            elements[i].style.backgroundColor = style.backgroundColor;
            elements[i].style.borderColor = style.borderColor;
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`${resumeData.personal_info?.full_name || 'resume'}.pdf`);
      
      toast.success("Downloaded successfully!");
    } catch (error) {
      console.error("Capture Error:", error);
      toast.error("Failed to generate PDF.");
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  if (!resumeData) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to={'/app'} className="no-print inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT PANEL: Editor */}
        <div className="no-print lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative h-fit">
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 rounded-t-xl overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500" 
              style={{ width: `${((activeSectionIndex + 1) / sections.length) * 100}%` }} 
            />
          </div>

          <div className="flex justify-between items-center mb-8 mt-2">
            <div className="flex items-center gap-3">
              <TemplateSelector
                selectedTemplate={resumeData.template}
                onChange={(t) => setResumeData(prev => ({ ...prev, template: t }))}
              />
              <Colorpicker
                selectedColor={resumeData.accent_color}
                onChange={(c) => setResumeData(prev => ({ ...prev, accent_color: c }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveSectionIndex(prev => Math.max(prev - 1, 0))} disabled={activeSectionIndex === 0} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30">
                <ChevronLeft size={20} />
              </button>
              <span className="text-xs font-bold text-slate-400">{activeSectionIndex + 1} / {sections.length}</span>
              <button onClick={() => setActiveSectionIndex(prev => Math.min(prev + 1, sections.length - 1))} disabled={activeSectionIndex === sections.length - 1} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="min-h-[400px]">
            {activeSection.id === 'personal' && <PersonalInfoForm data={resumeData.personal_info} onChange={(d) => setResumeData(prev => ({ ...prev, personal_info: d }))} removeBackground={removeBackground} setRemoveBackground={setRemoveBackground} />}
            {activeSection.id === 'summary' && <ProfessionalSummaryForm data={resumeData.professional_summary} onChange={(d) => setResumeData(prev => ({ ...prev, professional_summary: d }))} />}
            {activeSection.id === 'experience' && <ExperienceForm data={resumeData.experience} onChange={(d) => setResumeData(prev => ({ ...prev, experience: d }))} />}
            {activeSection.id === 'education' && <EducationForm data={resumeData.education} onChange={(d) => setResumeData(prev => ({ ...prev, education: d }))} />}
            {activeSection.id === 'projects' && <ProjectForm data={resumeData.project} onChange={(d) => setResumeData(prev => ({ ...prev, project: d }))} />}
            {activeSection.id === 'skills' && <SkillsForm data={resumeData.skills} onChange={(d) => setResumeData(prev => ({ ...prev, skills: d }))} />}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <button onClick={saveResume} disabled={isSaving} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={changeResumeVisibility} className="flex items-center justify-center p-3 gap-2 text-xs font-bold border border-slate-200 text-slate-600 rounded-lg">
                {resumeData.public ? <EyeIcon size={16} /> : <EyeOffIcon size={16} />} {resumeData.public ? 'Public' : 'Private'}
              </button>
              <button onClick={downloadResume} className="flex items-center justify-center p-3 gap-2 text-xs font-bold bg-slate-800 text-white rounded-lg">
                <DownloadIcon size={16} /> Download
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Live Preview */}
        <div className="lg:col-span-7 max-lg:mt-6 flex justify-center bg-slate-50 p-4 rounded-xl overflow-hidden">
          <div className="sticky top-8 w-full flex justify-center">
            <div className="w-full overflow-x-auto custom-scrollbar flex justify-center">
              <div 
                id="resume-preview" 
                className="bg-white shadow-2xl origin-top transition-all duration-300"
                style={{ transform: "scale(0.8)", transformOrigin: "top center", marginBottom: "-60mm" }} 
              >
                <ResumePreview
                  data={resumeData}
                  template={resumeData.template}
                  accentColor={resumeData.accent_color}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeBuilder;