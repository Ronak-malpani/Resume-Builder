import React, { useState } from 'react'
import { Lock, Mail, User2Icon, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import api from '../configs/api'
import { useDispatch } from 'react-redux'
import { login } from '../app/features/authSlice'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const query = new URLSearchParams(window.location.search)
    const urlState = query.get('state')
    const [state, setState] = useState(urlState || "login")
    
    // States for interactive features
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Explicitly set endpoint slug based on your Express backend routes
            const endpoint = state === "login" ? "login" : "register" 
            const { data } = await api.post(`/api/users/${endpoint}`, formData)
            
            // Update Redux and LocalStorage
            dispatch(login(data))
            if (data.token) {
                localStorage.setItem('token', data.token)
            }
            
            toast.success(data.message || `${state === "login" ? "Logged in" : "Signed up"} successfully!`)

            // Redirect to dashboard
            navigate('/app')
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const toggleState = () => {
        setState(prev => prev === "login" ? "register" : "login")
        setFormData(prev => ({ ...prev, password: '' }))
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 py-8 relative'>
            {/* Back to Home Button */}
            <Link 
                to="/" 
                className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
                <ArrowLeft size={18} />
                <span>Back to Home</span>
            </Link>

            <form 
                onSubmit={handleSubmit} 
                className="w-full max-w-sm sm:max-w-md text-center border border-gray-300/60 rounded-2xl p-6 sm:p-8 bg-white shadow-sm transition-all mt-12 sm:mt-0"
            >
                <h1 className="text-gray-900 text-2xl sm:text-3xl mt-4 font-medium capitalize">
                    {state === "login" ? "Login" : "Sign up"}
                </h1>
                <p className="text-gray-500 text-sm mt-1 mb-6">
                    Please {state} to continue
                </p>
                
                {/* Name Input (Only on Sign Up) */}
                {state !== "login" && (
                    <div className="flex items-center mb-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden px-4 gap-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
                        <User2Icon size={18} className='text-gray-400 shrink-0'/>
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Name" 
                            className="border-none outline-none ring-0 w-full text-sm bg-transparent" 
                            value={formData.name} 
                            onChange={handleChange} 
                            required={state !== "login"} 
                        />
                    </div>
                )}
                
                {/* Email Input */}
                <div className="flex items-center mb-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden px-4 gap-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
                    <Mail size={18} className='text-gray-400 shrink-0'/>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email id" 
                        className="border-none outline-none ring-0 w-full text-sm bg-transparent" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                {/* Password Input with Toggle Eye */}
                <div className="flex items-center mb-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden px-4 gap-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
                    <Lock size={18} className='text-gray-400 shrink-0'/>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder="Password" 
                        className="border-none outline-none ring-0 w-full text-sm bg-transparent" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(prev => !prev)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Forgot Password Link */}
                {state === "login" && (
                    <div className="mb-4 text-left px-1">
                        <Link to="/forgot-password" className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                )}

                {/* Submit Button with Spinner */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="mt-2 w-full h-11 rounded-full text-white bg-green-500 hover:bg-green-600 active:scale-[0.99] transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <span>{state === "login" ? "Login" : "Sign up"}</span>
                    )}
                </button>
                
                {/* Switch Mode toggle */}
                <p 
                    onClick={toggleState} 
                    className="text-gray-500 text-xs sm:text-sm mt-4 mb-4 cursor-pointer select-none"
                >
                    {state === "login" ? "Don't have an account?" : "Already have an account?"}
                    <span className="text-green-600 font-medium hover:underline ml-1">click here</span>
                </p>
            </form>
        </div>
    )
}

export default Login