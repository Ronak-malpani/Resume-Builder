import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const Hero = () => {
    const { user } = useSelector(state => state.auth)
    const [menuOpen, setMenuOpen] = React.useState(false);

    // List for scrolling marquee - ensured slugs match SimpleIcons database
    const companyLogos = ["slack", "framer", "netflix", "google", "linkedin", "instagram", "facebook"];

    return (
        <>
            {/* Unified Styles */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

                * {
                    font-family: 'Poppins', sans-serif;
                    scroll-behavior: smooth;
                }

                .marquee-inner {
                    animation: marqueeScroll 25s linear infinite;
                }

                @keyframes marqueeScroll {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }

                .marquee-container:hover .marquee-inner {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="min-h-screen pb-20 bg-white">
                {/* Navbar */}
                <nav className="z-50 flex items-center justify-between w-full py-5 px-6 md:px-16 lg:px-24 xl:px-40 text-sm">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="size-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-200">R</div>
                        <span className="font-bold text-lg tracking-tight text-slate-800">ResumeAI</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
                        <a href="#" className="hover:text-green-600 transition">Home</a>
                        <a href="#features" className="hover:text-green-600 transition">Features</a>
                        <a href="#testimonials" className="hover:text-green-600 transition">Testimonials</a>
                        <a href="#contact" className="hover:text-green-600 transition">Contact</a>
                    </div>

                    <div className="flex gap-3">
                        {!user ? (
                            <>
                                <Link to='/app?state=register' className="hidden md:block px-6 py-2.5 bg-green-500 hover:bg-green-600 active:scale-95 transition-all rounded-full text-white font-medium shadow-md">
                                    Get started
                                </Link>
                                <Link to='/app?state=login' className="hidden md:block px-6 py-2.5 border border-slate-200 active:scale-95 hover:bg-slate-50 transition-all rounded-full text-slate-700 font-medium">
                                    Login
                                </Link>
                            </>
                        ) : (
                            <Link to='/app' className="hidden md:block px-6 py-2.5 bg-green-500 hover:bg-green-600 border active:scale-95 transition-all rounded-full text-white font-medium shadow-md">
                                Dashboard
                            </Link>
                        )}

                        <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu Overlay */}
                <div className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center text-2xl gap-8 md:hidden transition-all duration-500 ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible translate-y-10"}`}>
                    <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-8 text-4xl font-light text-slate-400">✕</button>
                    <a href="#" onClick={() => setMenuOpen(false)} className="font-semibold text-slate-800">Home</a>
                    <a href="#features" onClick={() => setMenuOpen(false)} className="font-semibold text-slate-800">Features</a>
                    <Link to="/app" className="px-10 py-4 bg-green-500 text-white rounded-full shadow-xl shadow-green-100">Get Started</Link>
                </div>

                {/* Hero Content */}
                <div className="relative flex flex-col items-center justify-center px-4 md:px-16 lg:px-24 xl:px-40">
                    <div className="absolute top-0 -z-10 size-[500px] bg-green-100 blur-[120px] opacity-40 rounded-full"></div>

                    {/* Social Proof */}
                    <div className="flex items-center mt-16 md:mt-24 bg-white/50 backdrop-blur-sm border border-slate-100 py-2 px-4 rounded-full shadow-sm">
                        <div className="flex -space-x-2 pr-4 border-r border-slate-200 mr-4">
                            {[1, 2, 3, 4].map(i => (
                                <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="size-7 rounded-full border-2 border-white object-cover" />
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="size-3 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                ))}
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trusted by 10k+ users</p>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold max-w-4xl text-center mt-8 text-slate-900 leading-[1.1] tracking-tight">
                        Land your dream job with <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">AI-powered</span> resumes.
                    </h1>

                    <p className="max-w-xl text-center text-lg text-slate-500 mt-8 mb-10 leading-relaxed">
                        The ultimate platform for developers to build, edit and export professional resumes that beat the ATS systems.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Link to='/app' className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full px-10 py-4 flex items-center justify-center transition shadow-xl shadow-green-100 active:scale-95">
                            Build My Resume <svg className="ml-2 size-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </Link>
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 transition rounded-full px-10 py-4 font-semibold text-slate-700 active:scale-95">
                             Watch Demo
                        </button>
                    </div>

                    {/* MARQUEE SECTION */}
                    <div className="mt-24 w-full text-center">
                        <p className="py-6 text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Trusted by teams at</p>

                        <div className="marquee-container overflow-hidden w-full relative max-w-5xl mx-auto select-none">
                            {/* Gradients to fade edges */}
                            <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
                            <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />

                            <div className="marquee-inner flex will-change-transform min-w-max">
                                {/* Tripling the array to prevent gaps in the loop */}
                                {[...companyLogos, ...companyLogos, ...companyLogos].map((company, index) => (
                                    <div key={index} className="mx-10 md:mx-14 flex items-center justify-center h-16">
                                        <img 
                                            /* FIXED: URL removed hex code to prevent 404 and show original colors */
                                            src={`https://cdn.simpleicons.org/${company}`} 
                                            alt={company} 
                                            className="h-7 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300" 
                                            draggable={false} 
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Hero;