import React from 'react'
import { Zap } from "lucide-react";
import Title from './Title';

const Features = () => {
    // 0 = First card active by default
    const [activeIndex, setActiveIndex] = React.useState(0); 

  return (
   // CHANGE: mb-0 ensures we don't double up the spacing
   <div id='features' className='flex flex-col items-center mb-0 mt-4 scroll-mt-12'>

        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-400/10 rounded-full px-6 py-1.5">
            <Zap width={14} />
            <span>Simple Process</span>
        </div>
        
        <Title title='Build your resume' description='Our streamlined process helps you create a professional resume in minutes with intelligent AI-powered tools and features.'/>

            {/* CHANGE: xl:-mt-10 is the standard overlap. Use -mt-24 ONLY if you want the cards covering the title more. */}
            <div className="flex flex-col md:flex-row items-center justify-center xl:-mt-10">
                <img className="max-w-2xl w-full xl:-ml-32" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/group-image-1.png" alt="Features Preview" />
                
                <div className="px-4 md:px-0 flex flex-col gap-6">
                    
                    {/* CARD 1: VIOLET */}
                    <div 
                        onClick={() => setActiveIndex(0)} // Works on Mobile Tap & Laptop Click
                        className={`flex items-center gap-6 max-w-md p-6 rounded-xl border cursor-pointer transition-all duration-300
                            ${activeIndex === 0 
                                ? 'border-violet-300 bg-violet-100' // Active Style
                                : 'border-transparent hover:border-violet-200 hover:bg-violet-50' // Subtle hover for desktop
                            }`}
                    >
                        <div className="min-w-fit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-violet-600"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-base font-semibold text-slate-700">Real-Time Analytics</h3>
                            <p className="text-sm text-slate-600 max-w-xs">Get instant insights into your finances with live dashboards.</p>
                        </div>
                    </div>

                    {/* CARD 2: GREEN */}
                    <div 
                        onClick={() => setActiveIndex(1)} 
                        className={`flex items-center gap-6 max-w-md p-6 rounded-xl border cursor-pointer transition-all duration-300
                            ${activeIndex === 1 
                                ? 'border-green-300 bg-green-100' 
                                : 'border-transparent hover:border-green-200 hover:bg-green-50'
                            }`}
                    >
                        <div className="min-w-fit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-green-600"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-base font-semibold text-slate-700">Bank-Grade Security</h3>
                            <p className="text-sm text-slate-600 max-w-xs">End-to-end encryption, 2FA, compliance with GDPR standards.</p>
                        </div>
                    </div>

                    {/* CARD 3: ORANGE */}
                    <div 
                        onClick={() => setActiveIndex(2)} 
                        className={`flex items-center gap-6 max-w-md p-6 rounded-xl border cursor-pointer transition-all duration-300
                            ${activeIndex === 2 
                                ? 'border-orange-300 bg-orange-100' 
                                : 'border-transparent hover:border-orange-200 hover:bg-orange-50'
                            }`}
                    >
                        <div className="min-w-fit">
                            <svg className="size-6 stroke-orange-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-base font-semibold text-slate-700">Customizable Reports</h3>
                            <p className="text-sm text-slate-600 max-w-xs">Export professional, audit-ready financial reports for tax or internal review.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
  )
}

export default Features