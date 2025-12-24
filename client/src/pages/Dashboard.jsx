import { 
  FilePenIcon, PencilIcon, PlusIcon, TrashIcon, 
  UploadCloudIcon, UploadCloud, XIcon, LoaderCircleIcon, 
  Zap, ShieldCheck, Loader2, Sparkles, AlertTriangle, CheckCircle2
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../configs/api';
import pdfToText from 'react-pdftotext';
import ATSScoreReport from '../components/ATSScoreReport';

const Dashboard = () => {
  const { user, token } = useSelector(state => state.auth);
  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"];
  
  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [showATSSelector, setShowATSSelector] = useState(false);
  const [title, setTitle] = useState('');
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResumeForATS, setSelectedResumeForATS] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const [activeAuditTab, setActiveAuditTab] = useState('preview');
  
  //  Manage the Bottom Drawer height for mobile (peek, full, or hidden)
  const [sheetMode, setSheetMode] = useState('peek');

  const [scanReport, setScanReport] = useState(null);
  const navigate = useNavigate();

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get('/api/users/resumes', { headers: { Authorization: token } });
      setAllResumes(data.resumes);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const createResume = async (event) => {
    try {
      event.preventDefault();
      const { data } = await api.post('/api/resumes/create', { title }, { headers: { Authorization: token } });
      setAllResumes([...allResumes, data.resume]);
      setTitle(''); setShowCreateResume(false);
      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) { toast.error(error?.response?.data?.message || error.message); }
  };

  const uploadResume = async (event) => {
    event.preventDefault(); setIsLoading(true);
    try {
      const resumeText = await pdfToText(resume);
      const { data } = await api.post('/api/ai/upload-resume', { title, resumeText }, { headers: { Authorization: token } });
      setAllResumes([...allResumes, data.resume]);
      setTitle(''); setResume(null); setShowUploadResume(false);
      navigate(`/app/builder/${data.resumeId}`);
    } catch (error) { toast.error(error?.response?.data?.message || error.message); }
    setIsLoading(false);
  };

  const editTitle = async (event) => {
    try {
      const { data } = await api.put(`/api/resumes/update/`, { resumeId: editResumeId, resumeData: { title } }, { headers: { Authorization: token } });
      setAllResumes(allResumes.map(resume => resume._id === editResumeId ? { ...resume, title } : resume));
      setTitle(''); setEditResumeId(''); toast.success(data.message);
    } catch (error) { toast.error(error?.response?.data?.message || error.message); }
  };

  const deleteResume = async (resumeId) => {
    try {
      if (window.confirm('Are you sure you want to delete this resume?')) {
        const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, { headers: { Authorization: token } });
        setAllResumes(allResumes.filter(resume => resume._id !== resumeId));
        toast.success(data.message);
      }
    } catch (error) { toast.error(error?.response?.data?.message || error.message); }
  };

  const handleSectionClick = (sectionName) => {
    const sectionMap = {
      "Summary": "preview-summary",
      "Experience": "preview-experience",
      "Projects": "preview-projects",
      "Education": "preview-education",
      "Skills": "preview-skills",
      "Formatting": "resume-preview" 
    };

    const targetId = sectionMap[sectionName] || `preview-${sectionName.toLowerCase().replace(/\s+/g, '-')}`;
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Apply professional "Error Ring" highlight
      element.classList.add('ring-8', 'ring-rose-500/30', 'bg-rose-50/50', 'transition-all', 'duration-700', 'rounded-2xl');
      setTimeout(() => {
        element.classList.remove('ring-8', 'ring-rose-500/30', 'bg-rose-50/50');
      }, 3000);
    }
  };

  const saveAIChanges = async () => {
    try {
      await api.put(`/api/resumes/update/`, 
        { 
          resumeId: selectedResumeForATS._id, 
          resumeData: selectedResumeForATS 
        }, 
        { headers: { Authorization: token } }
      );
      setAllResumes(allResumes.map(r => r._id === selectedResumeForATS._id ? selectedResumeForATS : r));
      toast.success("AI improvements saved to database!");
    } catch (error) {
      toast.error("Failed to save AI updates.");
    }
  };

  useEffect(() => { loadAllResumes(); }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* MAIN VIEWPORT - Resume area stays at the top (order-1) on mobile */}
      <div className={`flex-1 overflow-y-auto transition-all duration-500 ${selectedResumeForATS ? 'bg-slate-200 p-4 lg:p-10 order-1' : 'max-w-7xl mx-auto px-6 py-12'}`}>
        
        {!selectedResumeForATS ? (
          /* 1. ORIGINAL DASHBOARD VIEW */
          <div className="animate-in fade-in duration-700">
            <p className='text-3xl font-black mb-8 text-slate-800 tracking-tight'>
              Welcome, {user?.name.split(' ')[0]} 👋
            </p>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12'>
              <button onClick={() => setShowCreateResume(true)} 
                className='w-full bg-white h-72 flex flex-col items-center justify-center rounded-[32px] gap-5 text-slate-600 border-2 border-dashed border-slate-200 group hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer shadow-sm'>
                <PlusIcon className='size-16 p-4 bg-gradient-to-br from-indigo-400 to-indigo-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform' />
                <div className="text-center">
                  <p className='text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight'>Create Resume</p>
                  <p className="text-sm text-slate-400 font-medium">Start from scratch</p>
                </div>
              </button>

              <button onClick={() => setShowUploadResume(true)} 
                className='w-full bg-white h-72 flex flex-col items-center justify-center rounded-[32px] gap-5 text-slate-600 border-2 border-dashed border-slate-200 group hover:border-purple-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer shadow-sm'>
                <UploadCloudIcon className='size-16 p-4 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform' />
                <div className="text-center">
                  <p className='text-xl font-black text-slate-800 group-hover:text-purple-600 transition-colors uppercase tracking-tight'>Upload Existing</p>
                  <p className="text-sm text-slate-400 font-medium">Auto-fill from PDF</p>
                </div>
              </button>

              <button onClick={() => setShowATSSelector(true)} 
                className='w-full bg-white h-72 flex flex-col items-center justify-center rounded-[32px] gap-5 text-slate-600 border-2 border-dashed border-slate-200 group hover:border-emerald-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer shadow-sm'>
                <Zap className='size-16 p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform' />
                <div className="text-center">
                  <p className='text-xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors uppercase tracking-tight'>ATS Scan</p>
                  <p className="text-sm text-slate-400 font-medium">Get a match score</p>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <hr className='flex-1 border-slate-200' />
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Your Library</span>
              <hr className='flex-1 border-slate-200' />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-20">
              {allResumes.map((resume, index) => (
                <div key={index} className='relative w-full aspect-[3/4] flex flex-col items-center justify-center rounded-2xl border-2 group hover:shadow-xl hover:-translate-y-1.5 transition-all cursor-pointer overflow-hidden shadow-sm bg-white' 
                  onClick={() => navigate(`/app/builder/${resume._id}`)}
                  style={{ borderColor: colors[index % colors.length] + '20' }}>
                  <div className="p-5 bg-slate-50 rounded-2xl shadow-inner mb-4 group-hover:scale-110 transition-transform duration-500">
                    <FilePenIcon className="size-10" style={{ color: colors[index % colors.length] }} />
                  </div>
                  <p className='text-[15px] font-black px-4 text-center text-slate-700 uppercase tracking-tighter line-clamp-2'>{resume.title}</p>
                  <div onClick={e => e.stopPropagation()} className='absolute bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0'>
                    <button onClick={() => deleteResume(resume._id)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm">
                      <TrashIcon size={18} />
                    </button>
                    <button onClick={() => { setEditResumeId(resume._id); setTitle(resume.title) }} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm">
                      <PencilIcon size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 2. DYNAMIC WORKSPACE - RESUME PREVIEW AREA */
          <div className="relative pb-[50vh] lg:pb-0">
            {isScanning && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl transition-all duration-300">
                <Loader2 className="animate-spin size-12 text-emerald-500 mb-4" />
                <p className="text-emerald-600 font-bold animate-pulse">Analyzing content...</p>
              </div>
            )}
            
            <div className="max-w-[1000px] mx-auto min-h-[1100px] relative">
              <button onClick={() => {setSelectedResumeForATS(null); setActiveAuditTab('preview')}} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-xl z-[60] transition-colors">
                <XIcon size={20} />
              </button>

              {activeAuditTab === 'tailoring' ? (
                <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-300">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-4 bg-indigo-100 rounded-2xl text-indigo-600 shadow-inner"><Sparkles size={28} /></div>
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-black text-slate-800 uppercase tracking-tight">Tailoring Insights</h2>
                        <p className="text-slate-500 text-sm font-medium">Add these {scanReport?.keywordGaps?.length || 0} missing keywords to improve match score.</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {scanReport?.keywordGaps?.map((gap, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-indigo-400 transition-all">
                           <div>
                              <p className="text-[10px] font-black text-indigo-600 uppercase">Missing {gap.type}</p>
                              <p className="font-bold text-slate-800">{gap.skill}</p>
                           </div>
                           <button className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                              <Plus size={16} />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
              ) : activeAuditTab === 'sections' ? (
                <div className="bg-white rounded-3xl p-6 lg:p-12 shadow-xl border border-slate-200 animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col items-center text-center">
                   <div className="size-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-8 shadow-inner">
                      <ShieldCheck size={48} />
                   </div>
                   <h2 className="text-2xl lg:text-3xl font-black text-slate-800 uppercase tracking-tight mb-3">Structure Check</h2>
                   <div className="w-full max-w-xl space-y-4">
                      {(scanReport?.sections || []).map((item) => (
                        <div key={item.name} className={`flex items-center justify-between p-5 bg-slate-50 rounded-2xl border transition-all ${item.found ? 'border-slate-100 opacity-60' : 'border-rose-200 bg-rose-50 shadow-sm'}`}>
                           <span className="font-black text-slate-700 uppercase tracking-tight">{item.name}</span>
                           <div className={`flex items-center gap-2 font-black text-xs uppercase ${item.found ? 'text-emerald-600' : 'text-rose-600'}`}>
                             {item.found ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
                             {item.found ? 'Found' : 'Missing'}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                /* RESUME PREVIEW - FULL DATA VISIBILITY */
                <div id="resume-preview" className="bg-white shadow-2xl p-6 lg:p-12 min-h-[1100px] rounded-sm border border-slate-200 animate-in fade-in duration-300 text-slate-800">
                  <header className="text-center mb-10 border-b-4 border-indigo-600 pb-6">
                    <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-2">
                      {selectedResumeForATS.personal_info?.full_name || "New Candidate"}
                    </h1>
                    <div className="text-slate-500 font-medium flex flex-wrap justify-center gap-4 text-[13px]">
                      {selectedResumeForATS.personal_info?.email && <span>{selectedResumeForATS.personal_info.email}</span>}
                      {selectedResumeForATS.personal_info?.phone && <span>• {selectedResumeForATS.personal_info.phone}</span>}
                      {selectedResumeForATS.personal_info?.location && <span>• {selectedResumeForATS.personal_info.location}</span>}
                      {selectedResumeForATS.personal_info?.links?.map((link, idx) => (
                        <span key={idx}>• <a href={link.url} className="text-indigo-600 underline">{link.label}</a></span>
                      ))}
                    </div>
                  </header>

                  {selectedResumeForATS.professional_summary && (
                    <section id="preview-summary" className="mb-8 px-4">
                      <h3 className="text-[16px] font-black border-b-2 border-slate-100 text-indigo-600 uppercase mb-3 tracking-tight">Professional Summary</h3>
                      <p className="leading-relaxed text-[14px] font-medium text-slate-700">{selectedResumeForATS.professional_summary}</p>
                    </section>
                  )}

                  {selectedResumeForATS.experience?.length > 0 && (
                    <section id="preview-experience" className="mb-8 px-4">
                      <h3 className="text-[16px] font-black border-b-2 border-slate-100 text-indigo-600 uppercase mb-3 tracking-tight">Work Experience</h3>
                      {selectedResumeForATS.experience.map((exp, i) => (
                        <div key={i} className="mb-6">
                          <div className="flex flex-col sm:flex-row justify-between items-baseline gap-1">
                            <h4 className="font-black text-[15px]">{exp.title}</h4>
                            <span className="text-slate-400 font-bold text-[12px] uppercase">{exp.startDate} — {exp.endDate || 'Present'}</span>
                          </div>
                          <p className="text-indigo-600 font-black text-[13px] italic mb-2 uppercase tracking-tighter">{exp.companyName} {exp.location && `• ${exp.location}`}</p>
                          <div className="space-y-1.5 mt-2">
                            {(String(exp.workSummary || "")).split('\n').filter(line => line.trim() !== '').map((point, idx) => (
                              <div key={idx} className="flex gap-2 text-slate-600 text-[14px]">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span className="flex-1">{point.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </section>
                  )}

                  {selectedResumeForATS.project?.length > 0 && (
                    <section id="preview-projects" className="mb-8 px-4">
                      <h3 className="text-[16px] font-black border-b-2 border-slate-100 text-indigo-600 uppercase mb-3 tracking-tight">Projects</h3>
                      {selectedResumeForATS.project.map((proj, i) => (
                        <div key={i} className="mb-5">
                          <h4 className="font-black text-[15px] flex items-center gap-2 mb-1">
                            {proj.name} 
                            {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-600"><Zap size={12}/></a>}
                          </h4>
                          <div className="space-y-1">
                            {/*  SAFE SPLIT FIX - Prevents crash if description is null */}
                            {(String(proj.description || "")).split('\n').filter(line => line.trim() !== '').map((point, idx) => (
                              <div key={idx} className="flex gap-2 text-slate-600 text-[14px] leading-relaxed">
                                <span className="text-slate-400 mt-1.5 size-1 bg-slate-400 rounded-full shrink-0" />
                                <span className="flex-1">{point.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </section>
                  )}

                  {selectedResumeForATS.education?.length > 0 && (
                    <section id="preview-education" className="mb-8 px-4">
                      <h3 className="text-[16px] font-black border-b-2 border-slate-100 text-indigo-600 uppercase mb-3 tracking-tight">Education</h3>
                      {selectedResumeForATS.education.map((edu, i) => (
                        <div key={i} className="mb-4">
                          <div className="flex justify-between items-baseline">
                             <h4 className="font-black text-[14px]">{edu.degree} in {edu.field}</h4>
                             <span className="text-slate-400 font-bold text-[12px]">{edu.graduationDate}</span>
                          </div>
                          <p className="text-slate-500 font-bold italic text-[13px]">{edu.institution}</p>
                        </div>
                      ))}
                    </section>
                  )}

                  {selectedResumeForATS.skills?.length > 0 && (
                    <section id="preview-skills" className="mb-8 px-4">
                      <h3 className="text-[16px] font-black border-b-2 border-slate-100 text-indigo-600 uppercase mb-3 tracking-tight">Skills & Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedResumeForATS.skills.map((skill, i) => (
                          <span key={i} className="text-slate-700 text-[13px] font-black uppercase tracking-widest px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SIDEBAR PANEL - Analysis sits at the bottom on mobile (order-2) */}
      {selectedResumeForATS && (
        <aside 
          className={`fixed lg:relative bottom-0 left-0 right-0 z-40 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out
            ${sheetMode === 'peek' ? 'h-[45vh] lg:h-full translate-y-0' : ''}
            ${sheetMode === 'full' ? 'h-[92vh] lg:h-full translate-y-0' : ''}
            ${sheetMode === 'hidden' ? 'translate-y-full lg:translate-y-0 lg:h-full' : ''}
            w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l rounded-t-[32px] lg:rounded-t-none shrink-0 overflow-hidden order-2`}
        >
          {/* Mobile Drag Handle */}
          <div 
            className="lg:hidden w-full pt-3 pb-2 flex justify-center cursor-pointer"
            onClick={() => setSheetMode(sheetMode === 'peek' ? 'full' : 'peek')}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </div>

          <div className="h-full overflow-y-auto pb-10">
            <ATSScoreReport 
              data={selectedResumeForATS} 
              activeTab={activeAuditTab}
              setActiveTab={(tab) => { setActiveAuditTab(tab); setSheetMode('peek'); }}
              onSectionClick={handleSectionClick} 
              setParentLoading={setIsScanning}
              setResumeData={(updated) => setSelectedResumeForATS(updated)}
              onSave={saveAIChanges}
              onReportReady={(report) => setScanReport(report)}
            />
          </div>
        </aside>
      )}

      {/* Toggle Button for Mobile Drawer Drawer */}
      {selectedResumeForATS && (
        <button 
          onClick={() => setSheetMode(sheetMode === 'hidden' ? 'peek' : 'hidden')} 
          className="lg:hidden fixed bottom-6 right-6 z-[70] bg-indigo-600 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95"
        >
          {sheetMode === 'hidden' ? <Zap size={24} /> : <XIcon size={24} />}
        </button>
      )}

      {/* MODALS REMAINS UNCHANGED */}
      {showATSSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur z-[100] flex items-center justify-center p-4" onClick={() => setShowATSSelector(false)}>
          <div className="bg-white rounded-[28px] w-full max-w-md p-8 relative" onClick={e => e.stopPropagation()}>
            <XIcon className="absolute top-6 right-6 cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => setShowATSSelector(false)} />
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-tighter"><ShieldCheck className="text-amber-500" /> Select Resume to Scan</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {allResumes.map((res) => (
                <button key={res._id} onClick={() => { setSelectedResumeForATS(res); setShowATSSelector(false); }}
                  className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50 flex justify-between items-center group transition-all duration-300">
                  <span className="font-bold text-slate-700 group-hover:text-amber-700 uppercase tracking-tight">{res.title}</span>
                  <Zap className="size-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCreateResume && (
        <form onSubmit={createResume} onClick={() => setShowCreateResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4'>
          <div onClick={e => e.stopPropagation()} className='relative bg-white border-2 border-slate-100 shadow-2xl rounded-[32px] w-full max-w-sm p-8'>
            <h2 className='text-2xl font-black mb-6 text-slate-800 uppercase tracking-tighter'>Create a Resume</h2>
            <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='w-full px-5 py-4 mb-6 border-2 rounded-2xl border-slate-100 focus:border-indigo-600 outline-none font-bold' required />
            <button className='w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl transition-all'>Create Project</button>
            <XIcon className='absolute top-6 right-6 text-slate-400 cursor-pointer' onClick={() => { setShowCreateResume(false); setTitle('') }} />
          </div>
        </form>
      )}

      {showUploadResume && (
        <form onSubmit={uploadResume} onClick={() => setShowUploadResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4'>
          <div onClick={e => e.stopPropagation()} className='relative bg-white border-2 border-slate-100 shadow-2xl rounded-[32px] w-full max-w-sm p-8'>
            <h2 className='text-2xl font-black mb-6 text-slate-800 uppercase tracking-tighter'>Upload Resume</h2>
            <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='w-full px-5 py-4 mb-4 border-2 rounded-2xl border-slate-100 focus:border-purple-600 outline-none font-bold' required />
            <label htmlFor="resume-input" className="block cursor-pointer">
              <div className='flex flex-col items-center justify-center gap-2 border-4 border-dashed border-slate-50 rounded-2xl p-6 py-10 my-4 text-slate-300 hover:border-purple-500 transition-all group'>
                {resume ? <p className='text-purple-700 font-black'>{resume.name}</p> : <><UploadCloud className='size-14 stroke-[3px] group-hover:scale-110 transition-transform' /><p className='font-bold uppercase tracking-widest text-xs'>Select PDF File</p></>}
              </div>
            </label>
            <input type="file" id='resume-input' accept='.pdf' hidden onChange={(e) => setResume(e.target.files[0])} />
            <button disabled={isLoading} className='w-full py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-purple-700 shadow-xl flex items-center justify-center gap-2 transition-all'>
              {isLoading ? <><LoaderCircleIcon className='animate-spin size-5' /> Processing...</> : 'Upload PDF'}
            </button>
            <XIcon className='absolute top-6 right-6 text-slate-400 cursor-pointer' onClick={() => { setShowUploadResume(false); setTitle(''); setResume(null); }} />
          </div>
        </form>
      )}
    </div>
  );
};

export default Dashboard;