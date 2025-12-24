import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ResumePreview from '../components/ResumePreview';
import { ArrowLeftIcon, Loader, Download } from 'lucide-react';
import api from '../configs/api';

const Preview = () => {
  const { resumeId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);

  const loadResume = async () => {
    try {
      const { data } = await api.get('/api/resumes/public/' + resumeId);
      setResumeData(data.resume);
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
  }, []);

  // Professional Print Handler
  const handleDownload = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  return resumeData ? (
    <div className='bg-slate-100 min-h-screen'>
      {/* ACTION BAR: Hidden when the browser print dialog opens */}
      <nav className='bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50 print:hidden shadow-sm'>
        <div className='max-w-5xl mx-auto flex justify-between items-center'>
          <a href="/" className='flex items-center text-slate-600 hover:text-emerald-600 font-bold transition-colors group'>
            <ArrowLeftIcon className='mr-2 size-4 group-hover:-translate-x-1 transition-transform'/> 
            Back to Site
          </a>
          
          <button 
            onClick={handleDownload}
            className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95'
          >
            <Download size={16}/> Download PDF
          </button>
        </div>
      </nav>

      {/* RESUME DISPLAY */}
      <div className='max-w-4xl mx-auto py-10 px-4 print:p-0 print:max-w-full'>
        <div className="shadow-2xl print:shadow-none bg-white rounded-lg overflow-hidden">
          <ResumePreview 
            data={resumeData} 
            template={resumeData.template || 'classic'} 
            accentColor={resumeData.accent_color || '#10b981'} 
            classes='p-0'
          />
        </div>
        
        <footer className="mt-8 mb-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] print:hidden">
          Verified ATS-Optimized Resume • Created with AI Builder
        </footer>
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen bg-slate-50'>
      <div className="bg-white p-12 rounded-[40px] shadow-xl border border-slate-100 text-center">
        <p className='text-6xl mb-4 font-black text-slate-200 tracking-tighter'>404</p>
        <p className='text-xl text-slate-500 font-bold mb-8 uppercase tracking-widest'>Resume not found</p>
        <a href="/" className='inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-emerald-200 shadow-lg'>
          <ArrowLeftIcon className='mr-2 size-4'/>Go Home
        </a>
      </div>
    </div>
  );
};

export default Preview;