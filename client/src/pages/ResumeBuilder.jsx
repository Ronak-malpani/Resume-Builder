import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../configs/api';
import { 
  ArrowLeftIcon, Briefcase, FileText, FolderIcon, GraduationCap, Sparkles, User,
  ChevronLeft, ChevronRight, Share2Icon, EyeIcon, EyeOffIcon, DownloadIcon
} from 'lucide-react';
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast';

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
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);

  const sections = [
    { id: "personal", name: "Personal Information", icon: User },
    { id: "summary", name: "Professional Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
  ];

  const activeSection = sections[activeSectionIndex];

  // Fetch existing resume
  const loadExistingResume = async () => {
    try {
      const { data } = await api.get('/api/resumes/get/' + resumeId, {
        headers: { Authorization: token }
      });
      if (data.resume) {
        setResumeData(data.resume);
        document.title = data.resume.title;
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
    }
  };

  useEffect(() => {
    loadExistingResume();
  }, []);

  useEffect(() => {
    console.log("🔴 resumeData changed:", resumeData);
  }, [resumeData]);

  // Save resume
  const saveResume = async () => {
    if (!resumeData) {
      toast.error("Resume data is empty, cannot save!");
      return;
    }
    try {
      let updatedResumeData = structuredClone(resumeData);
      if (typeof updatedResumeData.personal_info.image === 'object') {
        delete updatedResumeData.personal_info.image;
      }

      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify(updatedResumeData));
      removeBackground && formData.append("removeBackground", "yes");
      typeof resumeData.personal_info.image === 'object' && formData.append("image", resumeData.personal_info.image);

      const { data } = await api.put('/api/resumes/update', formData, {
        headers: { Authorization: token }
      });

      setResumeData(data.resume);
      toast.success(data.message);

    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume");
    }
  };

  const changeResumeVisibility = async () => {
    if (!resumeData) return;
    try {
      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify({ public: !resumeData.public }));

      await api.put('/api/resumes/update', formData, { headers: { Authorization: token } });

      setResumeData(prev => ({ ...prev, public: !prev.public }));
      toast.success(resumeData.public ? "Set to Private" : "Set to Public");
    } catch (error) {
      console.error("Error changing visibility:", error);
    }
  };

  const handleShare = () => {
    if (!resumeData) return;
    const frontendUrl = window.location.href.split('/app/')[0];
    const resumeUrl = frontendUrl + '/view/' + resumeId;

    if (navigator.share) {
      navigator.share({ url: resumeUrl, text: "My Resume" });
    } else {
      alert("Share not supported in this browser");
    }
  };

  const downloadResume = () => window.print();

  if (!resumeData) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to={'/app'} className="inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all">
        <ArrowLeftIcon className="size-4" /> Back to Dashboard
      </Link>

      <div className="grid lg:grid-cols-12 gap-8 mt-6">
        {/* Left Panel */}
        <div className="lg:col-span-5 bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
          {/* Progress Bar */}
          <hr className="absolute top-0 left-0 right-0 border-2 border-gray-200" />
          <hr
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-2000"
            style={{ width: `${activeSectionIndex * 100 / (sections.length - 1)}%` }}
          />

          {/* Template & Color */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-300 py-1">
            <div className="flex items-center gap-2">
              <TemplateSelector
                selectedTemplate={resumeData.template}
                onChange={(template) => setResumeData(prev => ({ ...prev, template }))}
              />
              <Colorpicker
                selectedColor={resumeData.accent_color}
                onChange={(color) => setResumeData(prev => ({ ...prev, accent_color: color }))}
              />
            </div>

            <div className="flex items-center gap-2">
              {activeSectionIndex !== 0 && (
                <button
                  onClick={() => setActiveSectionIndex(prev => Math.max(prev - 1, 0))}
                  className="flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="size-4" /> Previous
                </button>
              )}
              <button
                onClick={() => setActiveSectionIndex(prev => Math.min(prev + 1, sections.length - 1))}
                className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex === sections.length - 1 ? 'opacity-50' : ''}`}
                disabled={activeSectionIndex === sections.length - 1}
              >
                Next <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Forms */}
          <div className="space-y-6">
            {activeSection.id === 'personal' && (
              <PersonalInfoForm
                data={resumeData.personal_info}
                onChange={(data) => setResumeData(prev => ({ ...prev, personal_info: data }))}
                removeBackground={removeBackground}
                setRemoveBackground={setRemoveBackground}
              />
            )}

            {activeSection.id === 'summary' && (
              <ProfessionalSummaryForm
                data={resumeData.professional_summary}
                onChange={(data) => setResumeData(prev => ({ ...prev, professional_summary: data }))}
              />
            )}

            {activeSection.id === 'experience' && (
              <ExperienceForm
                data={resumeData.experience}
                onChange={(data) => setResumeData(prev => ({ ...prev, experience: data }))}
              />
            )}

            {activeSection.id === 'education' && (
              <EducationForm
                data={resumeData.education}
                onChange={(data) => setResumeData(prev => ({ ...prev, education: data }))}
              />
            )}

            {activeSection.id === 'projects' && (
              <ProjectForm
                data={resumeData.project}
                onChange={(data) => setResumeData(prev => ({ ...prev, project: data }))}
              />
            )}

            {activeSection.id === 'skills' && (
              <SkillsForm
                data={resumeData.skills}
                onChange={(data) => setResumeData(prev => ({ ...prev, skills: data }))}
              />
            )}
          </div>

          <button
            onClick={() => toast.promise(saveResume, { loading: 'Saving...' })}
            className="bg-gradient-to-br from-green-100 to-green-200 ring-green-300 text-green-600
              hover:ring hover:from-green-200 hover:to-green-400 transition-all rounded-md px-6 py-2 mt-6 text-sm"
          >
            Save Changes
          </button>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 max-lg:mt-6 relative">
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-end gap-2">
            {resumeData.public && (
              <button onClick={handleShare} className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors">
                <Share2Icon className="size-4" /> Share
              </button>
            )}

            <button
              onClick={changeResumeVisibility}
              className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 ring-blue-300 rounded-lg hover:ring transition-colors"
            >
              {resumeData.public ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
              {resumeData.public ? 'Public' : 'Private'}
            </button>

            <button
              onClick={downloadResume}
              className="flex items-center gap-2 px-6 py-2 text-xs bg-gradient from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors"
            >
              <DownloadIcon className="size-4" /> Download
            </button>
          </div>

          <ResumePreview
            data={resumeData}
            template={resumeData.template}
            accentColor={resumeData.accent_color}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
