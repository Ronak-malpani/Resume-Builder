import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import api from "../../configs/api";

export default function Contact() {
    // 1. State to store user input
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })
    const [loading, setLoading] = useState(false)

    // 2. Function to handle typing
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // 3. Function to handle sending
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            
            const { data } = await api.post('/api/contact', formData)
            
            toast.success(data.message || "Message sent successfully!")
            
           
            setFormData({ name: '', email: '', message: '' })
        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.message || "Failed to send message.")
        } finally {
            setLoading(false)
        }
    }

    return (
    <section id="contact" className="py-24 bg-white">
        <form onSubmit={handleSubmit} className="flex flex-col items-center text-sm px-4">
            
            {/* Title Section */}
            <p className="text-lg text-green-600 font-medium pb-2">Contact Us</p>
            <h1 className="text-4xl font-semibold text-slate-700 pb-4 text-center">Get in touch with us</h1>
            <p className="text-sm text-gray-500 text-center pb-10 max-w-lg">
                <strong>We’re here to help you succeed.</strong> Whether you have a question,
                feedback, or need support, send us a message below.
            </p>

            {/* Name & Email Row */}
            <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-[700px]">
                <div className="w-full">
                    <label className="text-black/70 font-medium" htmlFor="name">Your Name</label>
                    <input 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        className="h-12 p-3 mt-2 w-full border border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all" 
                        type="text" 
                        placeholder="John Doe"
                        required 
                    />
                </div>
                <div className="w-full">
                    <label className="text-black/70 font-medium" htmlFor="email">Your Email</label>
                    <input 
                        id="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleChange}
                        className="h-12 p-3 mt-2 w-full border border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all" 
                        type="email" 
                        placeholder="john@example.com"
                        required 
                    />
                </div>
            </div>
        
            {/* Message Area */}
            <div className="mt-6 w-full max-w-[700px]">
                <label className="text-black/70 font-medium" htmlFor="message">Message</label>
                <textarea 
                    id="message" 
                    name="message" 
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full mt-2 p-3 h-40 border border-gray-300 rounded-lg resize-none outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all" 
                    placeholder="How can we help you?"
                    required
                ></textarea>
            </div>
        
            {/* Submit Button */}
            <button 
                type="submit" 
                disabled={loading}
                className="mt-8 bg-green-500 hover:bg-green-600 text-white font-medium h-12 w-56 px-4 rounded-full active:scale-95 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? "Sending..." : "Send Message"}
            </button>
        </form>
    </section>
    );
};