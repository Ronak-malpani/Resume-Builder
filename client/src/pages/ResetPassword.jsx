import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return toast.error("Passwords do not match");

        setLoading(true);
        try {
            const { data } = await axios.put(`http://localhost:3000/api/users/reset-password/${token}`, { password });
            if (data.success) {
                toast.success("Password updated! Redirecting...");
                setTimeout(() => navigate("/login"), 3000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Link expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        /* MAIN CONTAINER: Subtle Slate background */
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans px-4">
            
            {/* 1. TECHNICAL DOT GRID: Mimics blueprint paper for the Resume Builder theme */}
            <div className="absolute inset-0 z-0 opacity-[0.4]" 
                 style={{ backgroundImage: `radial-gradient(#cbd5e1 1.2px, transparent 1.2px)`, backgroundSize: '30px 30px' }}>
            </div>

            {/* 2. ANIMATED RESUME PAGE (Top Left): Visible and drifting */}
            <div className="absolute top-20 left-20 w-64 h-80 bg-white border border-slate-200 rounded-xl shadow-2xl -rotate-6 hidden xl:block opacity-90 z-0 p-6 space-y-4 animate-bounce [animation-duration:6s]">
                <div className="h-4 w-1/2 bg-slate-100 rounded-full"></div>
                <div className="space-y-3">
                    <div className="h-1.5 w-full bg-slate-50 rounded-full"></div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full"></div>
                    <div className="h-1.5 w-2/3 bg-slate-50 rounded-full"></div>
                </div>
                <div className="pt-6 grid grid-cols-2 gap-2">
                    <div className="h-10 bg-slate-50 rounded-lg border border-dashed border-slate-200"></div>
                    <div className="h-10 bg-slate-50 rounded-lg border border-dashed border-slate-200"></div>
                </div>
            </div>

            {/* 3. ANIMATED RESUME PAGE (Bottom Right): Drifting slowly */}
            <div className="absolute bottom-20 right-20 w-72 h-96 bg-white border border-slate-200 rounded-xl shadow-2xl rotate-3 hidden xl:block opacity-90 z-0 p-8 animate-bounce [animation-duration:8s]">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 bg-slate-100 rounded-full"></div>
                    <div className="h-3 w-24 bg-slate-100 rounded-full"></div>
                 </div>
                 <div className="h-2 w-full bg-slate-50 rounded-full mb-3"></div>
                 <div className="h-2 w-full bg-slate-50 rounded-full mb-3"></div>
                 <div className="h-32 w-full bg-slate-50 rounded-lg border border-slate-100 border-dashed mt-6"></div>
            </div>

            {/* --- MAIN CONTENT CARD: High Elevation --- */}
            <div className="max-w-md w-full bg-white/95 backdrop-blur-md z-10 p-10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white relative">
                
                <div className="text-center mb-10">
                    <div className="mx-auto h-20 w-20 bg-green-50 flex items-center justify-center rounded-3xl shadow-inner border border-green-100/50 mb-6 transition-transform hover:scale-105 duration-300">
                        <Lock className="h-10 w-10 text-green-500" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">New Password</h2>
                    <p className="text-slate-500 font-medium">Secure your professional profile</p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    {/* NEW PASSWORD */}
                    <div className="relative group">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-green-600 transition-colors">
                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </button>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="relative group">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-green-600 transition-colors">
                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </button>
                    </div>

                    <button 
                        disabled={loading} 
                        className="w-full bg-green-600 text-white py-5 rounded-2xl font-bold hover:bg-green-700 active:scale-[0.98] transition-all shadow-xl shadow-green-200 disabled:bg-slate-300 flex items-center justify-center gap-3 text-lg"
                    >
                        {loading ? "Updating..." : (
                            <>
                                Update Password
                                <CheckCircle2 className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <button 
                        onClick={() => navigate('/login')} 
                        className="text-sm font-bold text-slate-400 hover:text-green-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                       Back to login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;