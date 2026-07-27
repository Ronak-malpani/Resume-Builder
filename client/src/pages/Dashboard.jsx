import { 
  FilePenIcon, PencilIcon, PlusIcon, TrashIcon, 
  UploadCloudIcon, XIcon, LoaderCircleIcon, 
  Zap, CheckCircle, SearchIcon
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../configs/api';
import pdfToText from 'react-pdftotext';
import ATSScoreReport from '../components/ATSScoreReport'; 
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user, token } = useSelector(state => state.auth);
  
  // State
  const [allResumes, setAllResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Modals
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [showATSSelector, setShowATSSelector] = useState(false);
  const [showEditTitle, setShowEditTitle] = useState(false);
  
  // Form Data
  const [title, setTitle] = useState('');
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ATS Data
  const [selectedResumeForATS, setSelectedResumeForATS] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanReport, setScanReport] = useState(null);

  const navigate = useNavigate();

  // Load Resumes
  const loadAllResumes = async () => {
    setIsLoadingData(true);
    try {
      const { data } = await api.get('/api/users/resumes', { headers: { Authorization: token } });
      setAllResumes(data.resumes);
      setFilteredResumes(data.resumes);
    } catch (error) { 
      toast.error(error?.response?.data?.message || error.message); 
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = allResumes.filter(r => r.title.toLowerCase().includes(lowerQuery));
    setFilteredResumes(filtered);
  }, [searchQuery, allResumes]);

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
    
    setIsProcessing(true);
    try {
      const resumeText = await pdfToText(resume);
      const { data } = await api.post('/api/ai/upload-resume', { title, resumeText }, { headers: { Authorization: token } });
      setAllResumes([...allResumes, data.resume]);
      setTitle(''); setResume(null); setShowUploadResume(false);
      toast.success("Resume parsed successfully!");
      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) {
       toast.error(error?.response?.data?.message || "Error processing resume");
    }
    setIsProcessing(false);
  };

  const handleScanRequest = async (overrideResume = null) => {
    const targetResume = overrideResume || selectedResumeForATS;
    if (!targetResume) return;
    
    setIsScanning(true);
    try {
      const cleanResumeText = `
        [CONTACT INFO]
        Name: ${targetResume.personal_info?.full_name || ""}
        Email: ${targetResume.personal_info?.email || ""}
        Phone: ${targetResume.personal_info?.phone || ""}
        LinkedIn: ${targetResume.personal_info?.linkedin || ""}
        GitHub: ${targetResume.personal_info?.github || ""}
        Portfolio: ${targetResume.personal_info?.portfolio || ""}

        [SUMMARY]
        ${targetResume.professional_summary || ""}

        [SKILLS]
        ${(targetResume.skills || []).join(", ")}

        [EXPERIENCE]
        ${(targetResume.experience || []).map(e => `${e.position} at ${e.company} (${e.start_date} - ${e.end_date}): ${e.description}`).join("\n")}

        [PROJECTS]
        ${(targetResume.projects || []).map(p => `${p.name}: ${p.description} (Tech: ${p.technologies})`).join("\n")}

        [EDUCATION]
        ${(targetResume.education || []).map(e => `${e.degree} in ${e.field} from ${e.school} (GPA: ${e.gpa})`).join("\n")}
      `;

      const { data } = await api.post('/api/ai/ats-scan', { 
        resumeText: cleanResumeText,
        experienceData: targetResume.experience 
      }, { headers: { Authorization: token } });
      
      setScanReport(data);
    } catch (err) { 
      console.error(err);
      toast.error("Audit failed. Please try again."); 
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
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await api.delete(`/api/resumes/delete/${resumeId}`, { headers: { Authorization: token } });
        setAllResumes(allResumes.filter(resume => resume._id !== resumeId));
        toast.success("Resume deleted");
      } catch (error) { toast.error(error?.response?.data?.message || error.message); }
    }
  };

  const saveAIChanges = async (upgradedResume) => {
    try {
      const { data } = await api.put(`/api/resumes/update/`, { resumeId: upgradedResume._id, resumeData: upgradedResume }, { headers: { Authorization: token } });
      const savedResume = data.resume || upgradedResume; 
      setAllResumes(prev => prev.map(r => r._id === savedResume._id ? savedResume : r));
      setSelectedResumeForATS(savedResume);
      toast.success("Optimizations persisted!");
      setTimeout(() => { handleScanRequest(savedResume); }, 400);
    } catch (error) { toast.error("Database sync failed."); }
  };

  const updateVisibility = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/api/resumes/update/`, { resumeId: id, resumeData: { public: newStatus } }, { headers: { Authorization: token } });
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-8 sm:mb-12 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-black text-emerald-900 tracking-tight">
              Welcome, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-emerald-700 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-1 sm:mt-2 opacity-80">
              Manage your career documents
            </p>
          </div>
          
          <div className="relative w-full sm:w-96">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 size-5" />
            <input 
              type="text" 
              placeholder="Search resumes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border-2 border-emerald-50 focus:border-emerald-500 focus:outline-none transition-all shadow-sm font-medium text-emerald-900 placeholder:text-emerald-300"
            />
          </div>
        </header>

        {/* ACTIONS SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-16"
        >
          <ActionCard onClick={() => setShowCreateResume(true)} icon={PlusIcon} color="bg-emerald-600" label="Create New" />
          <ActionCard onClick={() => setShowUploadResume(true)} icon={UploadCloudIcon} color="bg-emerald-500" label="Upload PDF" />
          <ActionCard onClick={() => setShowATSSelector(true)} icon={Zap} color="bg-emerald-400" label="ATS Scan" />
        </motion.div>

        {/* LIBRARY GRID */}
        {isLoadingData ? (
           <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8 pb-24">
             {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4.5] bg-emerald-50/50 rounded-[32px] animate-pulse" />)}
           </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8 pb-24"
          >
            {filteredResumes.length === 0 ? (
               <div className="col-span-full text-center py-20 opacity-50 font-bold text-emerald-800">No resumes found. Create one to get started!</div>
            ) : filteredResumes.map((resume) => {
              const sections = ["personal_info", "professional_summary", "experience", "education", "project", "skills"];
              const completedCount = sections.filter(sec => resume[sec] && (Array.isArray(resume[sec]) ? resume[sec].length > 0 : true)).length;
              const progress = Math.round((completedCount / sections.length) * 100);

              return (
                <motion.div 
                  key={resume._id} 
                  variants={itemVariants}
                  layoutId={resume._id}
                  whileHover={{ scale: 1.02, translateY: -5 }}
                  onClick={() => navigate(`/app/builder/${resume._id}`)}
                  className="relative cursor-pointer aspect-[3/4] sm:aspect-[3/4.5] flex flex-col p-5 sm:p-6 rounded-[32px] border-2 bg-white shadow-sm hover:shadow-xl hover:border-emerald-300 border-emerald-50 transition-all duration-300 group"
                >
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="p-3 sm:p-4 bg-emerald-50 rounded-full mb-3 sm:mb-4 group-hover:bg-emerald-100 transition-colors">
                      <FilePenIcon className="size-8 sm:size-10 text-emerald-600" />
                    </div>
                    <p className="text-lg sm:text-xl font-black text-emerald-950 uppercase tracking-tighter text-center mb-2 line-clamp-2">{resume.title}</p>
                    <div className="flex flex-col items-center gap-2 w-full">
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{progress}% Ready</p>
                      <div className="w-24 h-2 bg-emerald-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-emerald-500" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS (Always visible on mobile, hover-reveal on desktop) */}
                  <div className="mt-auto pt-4 sm:pt-6 border-t border-emerald-50 flex items-center justify-center gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteResume(resume._id); }} 
                      className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-colors"
                      title="Delete Resume"
                    >
                      <TrashIcon size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditResumeId(resume._id); setTitle(resume.title); setShowEditTitle(true); }} 
                      className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-colors"
                      title="Rename Title"
                    >
                      <PencilIcon size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigate(`/app/builder/${resume._id}`); }} 
                      className="p-2.5 bg-emerald-600 text-white hover:bg-emerald-800 rounded-xl transition-colors"
                      title="Open Builder"
                    >
                      <FilePenIcon size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {(showATSSelector || showCreateResume || showEditTitle || showUploadResume) && (
          <ModalBackdrop onClose={() => { setShowATSSelector(false); setShowCreateResume(false); setShowEditTitle(false); setShowUploadResume(false); setTitle(''); }}>
            {showATSSelector && (
               <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 <h2 className="text-2xl font-black text-emerald-900 mb-6 uppercase tracking-tighter sticky top-0 bg-white">Select Resume</h2>
                 {allResumes.map((res) => (
                   <button key={res._id} onClick={() => { setSelectedResumeForATS(res); setShowATSSelector(false); }} className="w-full text-left p-4 rounded-2xl border-2 border-emerald-50 hover:border-emerald-500 hover:bg-emerald-50 flex justify-between items-center transition-all">
                     <span className="font-bold text-emerald-800">{res.title}</span>
                     <Zap className="size-5 text-emerald-600" />
                   </button>
                 ))}
               </div>
            )}

            {(showCreateResume || showEditTitle) && (
              <>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-900 uppercase tracking-tighter mb-6 sm:mb-8 italic text-center">{showCreateResume ? "New Resume" : "Edit Title"}</h2>
                <form onSubmit={showCreateResume ? createResume : editTitle} className="space-y-6">
                  <input autoFocus onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder="Resume Title..." className="w-full px-6 py-4 rounded-2xl bg-emerald-50 border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-emerald-900 text-center" required />
                  <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">{showCreateResume ? "Launch Builder" : "Update"}</button>
                </form>
              </>
            )}

            {showUploadResume && (
               <form onSubmit={uploadResume} className="space-y-6">
                 <h2 className="text-2xl sm:text-3xl font-black text-emerald-900 uppercase tracking-tighter mb-6 italic text-center">PDF Import</h2>
                 <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder="Resume Title" className="w-full px-6 py-4 rounded-2xl bg-emerald-50 border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-emerald-900 text-center" required />
                 <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-emerald-200 border-dashed rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                   <UploadCloudIcon className="w-10 h-10 text-emerald-400 mb-2" />
                   <p className="text-sm text-emerald-600 font-bold">{resume ? resume.name : "Choose PDF file"}</p>
                   <input type="file" className="hidden" accept=".pdf" onChange={(e) => setResume(e.target.files[0])} required />
                 </label>
                 <button disabled={isProcessing} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                   {isProcessing ? <LoaderCircleIcon className="animate-spin" /> : <><CheckCircle size={20}/> Upload & Parse</>}
                 </button>
               </form>
            )}
          </ModalBackdrop>
        )}
      </AnimatePresence>

      {/* ATS REPORT OVERLAY */}
      {selectedResumeForATS && (
        <ATSScoreReport 
          selectedResume={selectedResumeForATS}
          onBack={() => { setSelectedResumeForATS(null); setScanReport(null); }}
          isScanning={isScanning}
          scanReport={scanReport}
          onScan={() => handleScanRequest(selectedResumeForATS)}
          onUpdateVisibility={updateVisibility}
          onUpdateTemplate={updateTemplate}
          onSaveSuggestions={saveAIChanges}
        />
      )}
    </div>
  );
};

const ActionCard = ({ onClick, icon: Icon, color, label }) => (
  <button onClick={onClick} className="group bg-white h-32 sm:h-56 flex flex-col items-center justify-center rounded-[28px] sm:rounded-[32px] border-2 border-emerald-50 hover:border-emerald-400 hover:shadow-xl transition-all duration-300">
    <Icon className={`size-10 sm:size-12 p-2.5 sm:p-3 ${color} text-white rounded-2xl group-hover:scale-110 transition-transform`} />
    <p className="text-base sm:text-xl font-black text-emerald-900 mt-3 sm:mt-4 uppercase tracking-tight">{label}</p>
  </button>
);

const ModalBackdrop = ({ children, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" 
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-[32px] sm:rounded-[40px] w-full max-w-md p-6 sm:p-8 relative shadow-2xl border-4 border-emerald-50" 
      onClick={e => e.stopPropagation()}
    >
      <XIcon className="absolute top-5 right-5 sm:top-6 sm:right-6 cursor-pointer text-emerald-300 hover:text-emerald-600 transition-colors" size={24} onClick={onClose} />
      {children}
    </motion.div>
  </motion.div>
);

export default Dashboard;