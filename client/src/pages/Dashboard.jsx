import {  
  FilePenIcon, PencilIcon, PlusIcon, TrashIcon, 
  UploadCloudIcon, UploadCloud, XIcon, LoaderCircleIcon, 
  Zap, ShieldCheck, CheckCircle
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
  const colors = ["#059669", "#10b981", "#34d399", "#059669", "#10b981"];

  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [showATSSelector, setShowATSSelector] = useState(false);
  const [showEditTitle, setShowEditTitle] = useState(false);
  
  const [title, setTitle] = useState('');
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResumeForATS, setSelectedResumeForATS] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanReport, setScanReport] = useState(null);

  const navigate = useNavigate();

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get('/api/users/resumes', { headers: { Authorization: token } });
      setAllResumes(data.resumes);
    } catch (error) { toast.error(error?.response?.data?.message || error.message); }
  };

  const createResume = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post('/api/resumes/create', { title }, { headers: { Authorization: token } });
      setAllResumes([...allResumes, data.resume]);
      setTitle(''); setShowCreateResume(false);
      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) { toast.error(error?.response?.data?.message || error.message); }
  };

  const uploadResume = async (event) => {
    event.preventDefault();
    if (!resume) return toast.error("Please select a PDF file");
    
    setIsLoading(true);
    try {
      const resumeText = await pdfToText(resume);
      const { data } = await api.post(
        '/api/ai/upload-resume', 
        { title, resumeText }, 
        { headers: { Authorization: token } }
      );
      setAllResumes([...allResumes, data.resume]);
      setTitle(''); setResume(null); setShowUploadResume(false);
      toast.success("Resume parsed successfully!");
      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("AI is busy. Please wait a moment.");
      } else {
        toast.error(error?.response?.data?.message || "Error processing resume");
      }
    }
    setIsLoading(false);
  };

  const handleScanRequest = async (overrideResume = null) => {
  
  const targetResume = overrideResume || selectedResumeForATS;
  if (!targetResume) return;
  
  setIsScanning(true);
  try {
    const cleanResumeText = `
      Name: ${targetResume.personal_info?.full_name || "Unknown"}
      Summary: ${targetResume.professional_summary || ""}
      Skills: ${(targetResume.skills || []).slice(0, 15).join(", ")}
      Experience: ${(targetResume.experience || []).slice(0, 3).map(e => `${e.position}: ${e.description}`).join("\n")}
    `;

    const { data } = await api.post(
      '/api/ai/ats-analysis', 
      { resumeText: cleanResumeText }, 
      { headers: { Authorization: token } }
    );
    
    setScanReport(data);
  } catch (err) {
    toast.error("Audit failed. AI may be busy.");
  } finally {
    setIsScanning(false);
  }
};

  const editTitle = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.put(`/api/resumes/update/`, { resumeId: editResumeId, resumeData: { title } }, { headers: { Authorization: token } });
      setAllResumes(allResumes.map(resume => resume._id === editResumeId ? { ...resume, title } : resume));
      setTitle(''); setEditResumeId(''); setShowEditTitle(false);
      toast.success(data.message);
    } catch (error) { toast.error(error?.response?.data?.message || error.message); }
  };

  const deleteResume = async (resumeId) => {
    try {
      if (window.confirm('Are you sure you want to delete this resume?')) {
        await api.delete(`/api/resumes/delete/${resumeId}`, { headers: { Authorization: token } });
        setAllResumes(allResumes.filter(resume => resume._id !== resumeId));
        toast.success("Resume deleted");
      }
    } catch (error) { toast.error(error?.response?.data?.message || error.message); }
  };

 
  const saveAIChanges = async (upgradedResume) => {
  try {
    const { data } = await api.put(`/api/resumes/update/`, 
      { resumeId: upgradedResume._id, resumeData: upgradedResume }, 
      { headers: { Authorization: token } }
    );

  const savedResume = data.resume || upgradedResume; 
    
    setAllResumes(prev => prev.map(r => r._id === savedResume._id ? savedResume : r));
    setSelectedResumeForATS(savedResume);
    toast.success("Optimizations persisted to MongoDB!");
    setTimeout(() => {
      handleScanRequest(savedResume); 
    }, 400);

  } catch (error) { 
    toast.error("Database sync failed."); 
  }
};

  const updateVisibility = async (id, currentStatus) => {
  try {
    const newStatus = !currentStatus;
    await api.put(`/api/resumes/update/`, { resumeId: id, resumeData: { public: newStatus } }, { headers: { Authorization: token } });
    
    // CRITICAL: Update the state that ATSScoreReport is using
    setAllResumes(prev => prev.map(r => r._id === id ? { ...r, public: newStatus } : r));
    setSelectedResumeForATS(prev => ({ ...prev, public: newStatus })); 
    
    toast.success(newStatus ? "Resume is now Public" : "Resume is now Private");
  } catch (err) { toast.error("Update failed"); }
};

  const updateTemplate = async (id, templateId) => {
    try {
      await api.put(`/api/resumes/update/`, { resumeId: id, resumeData: { template: templateId } }, { headers: { Authorization: token } });
      setAllResumes(prev => prev.map(r => r._id === id ? { ...r, template: templateId } : r));
      setSelectedResumeForATS(prev => ({ ...prev, template: templateId }));
      toast.success("Template Changed!");
    } catch (err) { toast.error("Template update failed"); }
  };

  useEffect(() => { loadAllResumes(); }, []);

  // --- CONDITIONAL RENDERING FOR ATS MODE ---
  // We place this logic before the final return but after all function definitions
  if (selectedResumeForATS) {
    return (
      <ATSScoreReport 
        selectedResume={selectedResumeForATS}
        onBack={() => { setSelectedResumeForATS(null); setScanReport(null); }}
        isScanning={isScanning}
        scanReport={scanReport}
        onScan={handleScanRequest}
        onUpdateVisibility={updateVisibility}
        onUpdateTemplate={updateTemplate}
        onSaveSuggestions={saveAIChanges}
      />
    );
  }

  // --- MAIN DASHBOARD RENDER ---
  return (
    <div className="min-h-screen bg-[#f0fdf4] font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12">
        <header className="mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-emerald-900 tracking-tight">
            Welcome, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-emerald-700 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-2 opacity-80">
            Manage your career documents and optimize for ATS
          </p>
        </header>

        {/* ACTIONS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-16">
          <button onClick={() => setShowCreateResume(true)} className="group bg-white h-56 sm:h-72 flex flex-col items-center justify-center rounded-[40px] border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-2xl transition-all duration-500 shadow-sm">
            <PlusIcon className="size-12 sm:size-16 p-4 bg-emerald-600 text-white rounded-3xl group-hover:scale-110 transition-transform" />
            <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-6 uppercase tracking-tight">Create New</p>
          </button>
          <button onClick={() => setShowUploadResume(true)} className="group bg-white h-56 sm:h-72 flex flex-col items-center justify-center rounded-[40px] border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-2xl transition-all duration-500 shadow-sm">
            <UploadCloudIcon className="size-12 sm:size-16 p-4 bg-emerald-500 text-white rounded-3xl group-hover:scale-110 transition-transform" />
            <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-6 uppercase tracking-tight">Upload PDF</p>
          </button>
          <button onClick={() => setShowATSSelector(true)} className="group bg-white h-56 sm:h-72 flex flex-col items-center justify-center rounded-[40px] border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-2xl transition-all duration-500 shadow-sm">
            <Zap className="size-12 sm:size-16 p-4 bg-emerald-400 text-white rounded-3xl group-hover:scale-110 transition-transform" />
            <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-6 uppercase tracking-tight">ATS Scan</p>
          </button>
        </div>

        {/* LIBRARY GRID */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8 pb-24">
          {allResumes.map((resume) => {
            const sections = ["personal_info", "professional_summary", "experience", "education", "project", "skills"];
            const completedCount = sections.filter(sec => resume[sec] && (Array.isArray(resume[sec]) ? resume[sec].length > 0 : true)).length;
            const progress = Math.round((completedCount / sections.length) * 100);

            return (
              <div key={resume._id} className="relative aspect-[3/4.5] flex flex-col p-6 rounded-[32px] border-2 bg-white shadow-sm border-emerald-50 transition-all duration-300">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="p-4 bg-emerald-50 rounded-full mb-4">
                    <FilePenIcon className="size-10 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-emerald-950 uppercase tracking-tighter text-center mb-2">{resume.title}</p>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{progress}% Complete</p>
                    <div className="w-24 h-2 bg-emerald-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-6 border-t border-emerald-50 flex items-center justify-center gap-4">
                  <button onClick={() => deleteResume(resume._id)} className="p-3 bg-emerald-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm transition-all"><TrashIcon size={18} /></button>
                  <button onClick={() => { setEditResumeId(resume._id); setTitle(resume.title); setShowEditTitle(true); }} className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl shadow-sm transition-all"><PencilIcon size={18} /></button>
                  <button onClick={() => navigate(`/app/builder/${resume._id}`)} className="p-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-md transition-all"><FilePenIcon size={18} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showATSSelector && (
        <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowATSSelector(false)}>
          <div className="bg-white rounded-[40px] w-full max-w-xl p-10 relative shadow-2xl border border-emerald-100" onClick={e => e.stopPropagation()}>
            <XIcon className="absolute top-8 right-8 cursor-pointer text-emerald-300 hover:text-emerald-600" size={32} onClick={() => setShowATSSelector(false)} />
            <h2 className="text-3xl font-black text-emerald-900 mb-8 uppercase tracking-tighter">Choose Resume</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {allResumes.map((res) => (
                <button key={res._id} onClick={() => { setSelectedResumeForATS(res); setShowATSSelector(false); }} className="w-full text-left p-6 rounded-[32px] border-4 border-emerald-50 hover:border-emerald-500 hover:bg-emerald-50 flex justify-between items-center transition-all duration-300">
                  <span className="font-black text-emerald-800 uppercase tracking-tight text-lg">{res.title}</span>
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Zap className="size-6 text-emerald-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(showCreateResume || showEditTitle) && (
        <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => { setShowCreateResume(false); setShowEditTitle(false); setTitle(''); }}>
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 relative shadow-2xl border border-emerald-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter mb-8 italic text-center">{showCreateResume ? "New Resume" : "Edit Title"}</h2>
            <form onSubmit={showCreateResume ? createResume : editTitle} className="space-y-6">
              <input autoFocus onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder="Title..." className="w-full px-6 py-4 rounded-2xl bg-emerald-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-bold text-emerald-900 transition-all text-center" required />
              <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg transition-all">{showCreateResume ? "Launch Builder" : "Update Title"}</button>
            </form>
            <XIcon className="absolute top-6 right-6 cursor-pointer text-emerald-300 hover:text-emerald-600" size={24} onClick={() => { setShowCreateResume(false); setShowEditTitle(false); setTitle(''); }} />
          </div>
        </div>
      )}

      {showUploadResume && (
        <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowUploadResume(false)}>
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 relative shadow-2xl border border-emerald-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter mb-8 italic text-center">PDF Import</h2>
            <form onSubmit={uploadResume} className="space-y-6">
              <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder="Resume Title" className="w-full px-6 py-4 rounded-2xl bg-emerald-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-bold text-emerald-900 transition-all text-center mb-2" required />
              <label className="flex flex-col items-center justify-center w-full h-32 transition bg-white border-2 border-emerald-200 border-dashed rounded-2xl cursor-pointer hover:border-emerald-500">
                <UploadCloudIcon className="w-10 h-10 text-emerald-400 mb-2" />
                <p className="text-sm text-emerald-600 font-bold">{resume ? resume.name : "Choose PDF file"}</p>
                <input type="file" className="hidden" accept=".pdf" onChange={(e) => setResume(e.target.files[0])} required />
              </label>
              <button disabled={isLoading} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg transition-all disabled:bg-emerald-300 flex items-center justify-center gap-2">
                {isLoading ? <LoaderCircleIcon className="animate-spin" /> : <><CheckCircle size={20}/> Upload & Parse</>}
              </button>
            </form>
            <XIcon className="absolute top-6 right-6 cursor-pointer text-emerald-300 hover:text-emerald-600" size={24} onClick={() => setShowUploadResume(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;