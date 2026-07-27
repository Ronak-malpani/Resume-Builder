import { Lock, Mail, User2Icon } from 'lucide-react'
import React from 'react'
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
    const [state, setState] = React.useState(urlState || "login")

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data } = await api.post(`/api/users/${state}`, formData)
            
            dispatch(login(data))
            localStorage.setItem('token', data.token)
            
            toast.success(data.message)
            navigate('/app') 
            
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 py-8'>
            <form 
                onSubmit={handleSubmit} 
                className="w-full max-w-[350px] sm:max-w-[380px] text-center border border-gray-300/60 rounded-2xl px-6 sm:px-8 bg-white shadow-sm"
            >
                <h1 className="text-gray-900 text-2xl sm:text-3xl mt-8 sm:mt-10 font-medium">
                    {state === "login" ? "Login" : "Sign up"}
                </h1>
                <p className="text-gray-500 text-sm mt-2">Please {state} to continue</p>
                
                {state !== "login" && (
                    <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden px-5 gap-2 focus-within:border-green-500 transition-colors">
                        <User2Icon size={16} className="text-gray-500 shrink-0"/>
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Name" 
                            className="border-none outline-none ring-0 w-full text-sm sm:text-base bg-transparent" 
                            value={formData.name} 
                            onChange={handleChange} 
                            required={state !== "login"} 
                        />
                    </div>
                )}
                
                <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden px-5 gap-2 focus-within:border-green-500 transition-colors">
                    <Mail size={15} className="text-gray-500 shrink-0"/>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email id" 
                        className="border-none outline-none ring-0 w-full text-sm sm:text-base bg-transparent" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden px-5 gap-2 focus-within:border-green-500 transition-colors">
                    <Lock size={15} className="text-gray-500 shrink-0"/>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        className="border-none outline-none ring-0 w-full text-sm sm:text-base bg-transparent" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                {state === "login" && (
                    <div className="mt-4 text-left pl-1">
                        <Link to="/forgot-password" className="text-sm text-green-500 hover:text-green-600 transition-colors">
                            Forget password?
                        </Link>
                    </div>
                )}

                <button 
                    type="submit" 
                    className="mt-4 w-full h-11 rounded-full text-white bg-green-500 hover:bg-green-600 active:scale-95 transition-all font-medium text-sm sm:text-base"
                >
                    {state === "login" ? "Login" : "Sign up"}
                </button>
                
                <p 
                    onClick={() => setState(prev => prev === "login" ? "register" : "login")} 
                    className="text-gray-500 text-sm mt-3 mb-8 sm:mb-10 cursor-pointer select-none"
                >
                    {state === "login" ? "Don't have an account?" : "Already have an account?"} 
                    <span className="text-green-500 hover:underline ml-1">click here</span>
                </p>
            </form>
        </div>
    )
}

export default Login