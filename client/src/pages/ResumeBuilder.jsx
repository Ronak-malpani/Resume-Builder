import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../configs/api';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

// Icons
import { 
  ArrowLeftIcon, ChevronLeft, ChevronRight, 
  EyeIcon, EyeOffIcon, DownloadIcon, Loader2, 
  Bold, Italic, Underline, Type, Plus, Minus
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.55);
  const [previewHeight, setPreviewHeight] = useState(0);

  // Exact Numeric Font Size State
  const [fontSize, setFontSize] = useState(12);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const previewBoxRef = useRef(null);
  const previewContentRef = useRef(null);

  const fontSizesList = [10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 50];

  const sections = useMemo(() => [
    { id: "personal", name: "Personal Information" },
    { id: "summary", name: "Professional Summary" },
    { id: "experience", name: "Experience" },
    { id: "education", name: "Education" },
    { id: "projects", name: "Projects" },
    { id: "skills", name: "Skills" },
  ], []);

  const activeSection = sections[activeSectionIndex];

  // Precision scale & dynamic height calculation
  useEffect(() => {
    const updateDimensions = () => {
      if (!previewBoxRef.current) return;
      const { clientWidth } = previewBoxRef.current;
      if (clientWidth === 0) return;

      const scale = clientWidth / 794; 
      const clampedScale = Math.min(Math.max(scale, 0.40), 1);
      setPreviewScale(clampedScale);

      if (previewContentRef.current) {
        setPreviewHeight(previewContentRef.current.scrollHeight || previewContentRef.current.offsetHeight || 0);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [resumeData, debouncedResumeData, fontSize]);

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

  // 1. TEXT FORMATTING FUNCTION
  const applyTextFormat = (command) => {
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      
      if (command === 'bold') span.style.fontWeight = 'bold';
      if (command === 'italic') span.style.fontStyle = 'italic';
      if (command === 'underline') span.style.textDecoration = 'underline';
      
      try {
        range.surroundContents(span);
        selection.removeAllRanges();
      } catch (err) {
        document.execCommand(command, false, null);
      }
    } 
    else if (selectedTarget) {
      if (command === 'bold') {
        selectedTarget.style.fontWeight = selectedTarget.style.fontWeight === 'bold' ? 'normal' : 'bold';
      }
      if (command === 'italic') {
        selectedTarget.style.fontStyle = selectedTarget.style.fontStyle === 'italic' ? 'normal' : 'italic';
      }
      if (command === 'underline') {
        selectedTarget.style.textDecoration = selectedTarget.style.textDecoration === 'underline' ? 'none' : 'underline';
      }
    } else {
      toast.error("Please click or select specific text in the preview first.");
    }
  };

  // 2. PREVIEW TARGETING
  const handlePreviewClick = (e) => {
    e.stopPropagation();
    const clickedElement = e.target;
    
    if (clickedElement) {
      setSelectedTarget(clickedElement);
      
      const text = clickedElement.innerText?.toLowerCase() || '';
      if (text.includes('summary')) setActiveSectionIndex(1);
      else if (text.includes('experience')) setActiveSectionIndex(2);
      else if (text.includes('education')) setActiveSectionIndex(3);
      else if (text.includes('project')) setActiveSectionIndex(4);
      else if (text.includes('skill')) setActiveSectionIndex(5);
    }
  };

  // 3. ADJUST FONT SIZE
  const adjustFontSize = (delta) => {
    if (selectedTarget) {
      const computedSize = parseFloat(window.getComputedStyle(selectedTarget).fontSize);
      const newSize = Math.min(Math.max(computedSize + delta, 8), 50);
      selectedTarget.style.fontSize = `${newSize}px`;
    } else {
      setFontSize(prev => Math.min(Math.max(prev + delta, 8), 50));
    }
  };

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

  const toggleVisibility = () => {
    setResumeData(prev => ({ ...prev, public: !prev?.public }));
  };

  // BULLETPROOF DIRECT-DOM SNAPSHOT (NO CLONING SHIFT)
  const downloadResume = async () => {
    const element = document.getElementById("resume-preview-id");
    if (!element) return toast.error("Preview not ready");
    
    setIsDownloading(true);
    const toastId = toast.loading("Generating PDF...");

    // Store original scaling and parent styles to restore right after capture
    const parentContainer = previewBoxRef.current;
    const originalScale = previewScale;
    const originalHeight = previewHeight;

    try {
      await document.fonts.ready;

      // 1. Momentarily set live preview element to scale(1) in DOM for exact parity
      const scaleWrapper = element.parentElement;
      if (scaleWrapper) {
        scaleWrapper.style.transform = "scale(1)";
        scaleWrapper.style.marginBottom = "0px";
      }

      // Force synchronous DOM reflow
      void element.offsetHeight;
      await new Promise(resolve => setTimeout(resolve, 100));

      // 2. Measure actual tightly-wrapped height
      const contentHeight = Math.ceil(element.scrollHeight || element.offsetHeight);

      // 3. Render Canvas directly from the active, perfectly styled element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        height: contentHeight,
        windowWidth: 794,
        windowHeight: contentHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("resume-preview-id");
          if (clonedElement) {
            clonedElement.style.height = `${contentHeight}px`;
            clonedElement.style.minHeight = "0px";
            clonedElement.style.boxSizing = "border-box";
          }
        }
      });

      // 4. Instantly restore preview UI scale back to user's view
      if (scaleWrapper) {
        scaleWrapper.style.transform = `scale(${originalScale})`;
        scaleWrapper.style.marginBottom = originalHeight ? `-${originalHeight * (1 - originalScale)}px` : '0px';
      }

      // 5. Generate mm-proportional PDF matching actual content height
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (contentHeight * pdfWidth) / 794;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${resumeData?.personal_info?.full_name || 'Resume'}.pdf`);

      toast.success("Downloaded successfully!", { id: toastId });
    } catch (e) {
      console.error("PDF Export Error:", e);
      toast.error("Download failed. Please try again.", { id: toastId });

      // Fallback restore if canvas fails mid-generation
      const scaleWrapper = element.parentElement;
      if (scaleWrapper) {
        scaleWrapper.style.transform = `scale(${originalScale})`;
        scaleWrapper.style.marginBottom = originalHeight ? `-${originalHeight * (1 - originalScale)}px` : '0px';
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading Guard
  if (!resumeData) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <Loader2 className="animate-spin text-green-600" size={32} />
        <p className="text-slate-500 text-sm font-medium">Loading your resume...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col p-3 lg:p-4">
      
      {/* Top Header Navigation */}
      <div className="shrink-0 mb-2 flex justify-between items-center">
        <Link to="/app" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-green-600 text-xs font-medium transition-colors">
          <ArrowLeftIcon size={14} /> Back to Dashboard
        </Link>
      </div>

      {/* Main Layout Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full max-w-[1440px] mx-auto">
        
        {/* === LEFT SIDE: FORM EDITOR & RICH TOOLBAR === */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 flex flex-col shadow-xs overflow-hidden">
          
          {/* Header Controls & Rich Formatting Toolbar */}
          <div className="p-2 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2 shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-1.5 flex-wrap">
               <TemplateSelector selectedTemplate={resumeData?.template || 'classic'} onChange={t => setResumeData(prev => ({...prev, template: t}))} />
               <Colorpicker selectedColor={resumeData?.accent_color || '#000000'} onChange={c => setResumeData(prev => ({...prev, accent_color: c}))} />
               
               {/* BOLD / ITALIC / UNDERLINE CONTROLS */}
               <div className="flex items-center bg-white p-0.5 rounded-md border border-slate-200 text-xs shadow-2xs">
                  <button onClick={() => applyTextFormat('bold')} className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900" title="Bold">
                    <Bold size={13} />
                  </button>
                  <button onClick={() => applyTextFormat('italic')} className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900" title="Italic">
                    <Italic size={13} />
                  </button>
                  <button onClick={() => applyTextFormat('underline')} className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900" title="Underline">
                    <Underline size={13} />
                  </button>
               </div>

               {/* NUMERIC FONT SIZE SELECTOR */}
               <div className="flex items-center bg-white p-0.5 rounded-md border border-slate-200 text-xs shadow-2xs">
                  <Type size={13} className="text-slate-400 mx-1" />
                  <select 
                    value={fontSize} 
                    onChange={(e) => {
                      const newSz = Number(e.target.value);
                      setFontSize(newSz);
                      if (selectedTarget) selectedTarget.style.fontSize = `${newSz}px`;
                    }}
                    className="bg-transparent font-semibold text-slate-700 outline-none text-xs cursor-pointer py-0.5"
                  >
                    {fontSizesList.map(sz => (
                      <option key={sz} value={sz}>{sz}px</option>
                    ))}
                  </select>

                  <button onClick={() => adjustFontSize(1)} className="p-0.5 hover:bg-slate-100 rounded ml-1 text-slate-600"><Plus size={12}/></button>
                  <button onClick={() => adjustFontSize(-1)} className="p-0.5 hover:bg-slate-100 rounded text-slate-600"><Minus size={12}/></button>
               </div>
            </div>
            
            {/* Section Pagination */}
            <div className="flex items-center gap-1">
                <button onClick={() => setActiveSectionIndex(p => Math.max(0, p-1))} disabled={activeSectionIndex===0} className="hover:text-green-600 disabled:opacity-30 p-1 transition-colors"><ChevronLeft size={18} strokeWidth={2.5} /></button>
                <span className="text-xs font-bold text-slate-400 w-8 text-center select-none">{activeSectionIndex + 1}/{sections.length}</span>
                <button onClick={() => setActiveSectionIndex(p => Math.min(sections.length-1, p+1))} disabled={activeSectionIndex===sections.length-1} className="hover:text-green-600 disabled:opacity-30 p-1 transition-colors"><ChevronRight size={18} strokeWidth={2.5} /></button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4">
             {activeSection.id === 'personal' && <PersonalInfoForm data={resumeData?.personal_info || {}} onChange={(d) => handleDataChange('personal_info', d)} />}
             {activeSection.id === 'summary' && <ProfessionalSummaryForm data={resumeData?.professional_summary || ''} onChange={(d) => handleDataChange('professional_summary', d)} />}
             {activeSection.id === 'experience' && <ExperienceForm data={resumeData?.experience || []} onChange={(d) => handleDataChange('experience', d)} />}
             {activeSection.id === 'education' && <EducationForm data={resumeData?.education || []} onChange={(d) => handleDataChange('education', d)} />}
             {activeSection.id === 'projects' && <ProjectForm data={resumeData?.project || []} onChange={(d) => handleDataChange('project', d)} />}
             {activeSection.id === 'skills' && <SkillsForm data={resumeData?.skills || []} onChange={(d) => handleDataChange('skills', d)} />}
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50 shrink-0">
            <button onClick={saveResume} disabled={isSaving} className="w-full py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-lg font-bold text-xs transition-all flex justify-center items-center gap-2 shadow-xs">
                {isSaving ? <Loader2 className="animate-spin" size={14} /> : "Save Changes"}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={toggleVisibility} 
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition-all ${resumeData?.public ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                  {resumeData?.public ? <EyeIcon size={14}/> : <EyeOffIcon size={14}/>}
                  {resumeData?.public ? "Public" : "Private"}
              </button>

              <button 
                onClick={downloadResume} 
                disabled={isDownloading} 
                className="flex items-center justify-center gap-1.5 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-all disabled:opacity-50"
              >
                  {isDownloading ? <Loader2 className="animate-spin" size={14} /> : <DownloadIcon size={14}/>} Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* === RIGHT SIDE: PREVIEW === */}
        <div 
          ref={previewBoxRef}
          className="lg:col-span-5 w-full flex justify-center items-start sticky top-4 overflow-hidden"
        >
          {/* SCALE WRAPPER */}
          <div 
            className="w-[794px] min-w-[794px] shrink-0"
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              marginBottom: previewHeight ? `-${previewHeight * (1 - previewScale)}px` : '0px'
            }}
          >
            {/* DYNAMIC HEIGHT PREVIEW NODE */}
            <div 
              id="resume-preview-id"
              ref={previewContentRef}
              onClick={handlePreviewClick}
              className="bg-white shadow-xl border border-slate-100 rounded-sm cursor-pointer h-auto min-h-0 overflow-hidden box-border w-[794px] min-w-[794px] max-w-[794px]"
            >
               {debouncedResumeData && (
                 <ResumePreview 
                     data={debouncedResumeData} 
                     template={debouncedResumeData?.template || 'classic'} 
                     accentColor={debouncedResumeData?.accent_color}
                     baseFontSize={fontSize}
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