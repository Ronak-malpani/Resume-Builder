import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // UPDATED: Using the standard user endpoint
            const { data } = await axios.post('http://localhost:3000/api/users/forgot-password', { email });
            
            if (data.success) {
                toast.success("Reset link sent!");
                setIsSubmitted(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                {!isSubmitted ? (
                    <>
                        <div className="text-center">
                            <div className="mx-auto h-16 w-16 bg-green-100 flex items-center justify-center rounded-full mb-6">
                                <Mail className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900">Account Recovery</h2>
                            <p className="mt-4 text-gray-500 text-sm">Forgot your ATS Resume Builder password? Enter your email below.</p>
                        </div>
                        <form className="mt-10 space-y-6" onSubmit={handleFormSubmit}>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="name@email.com"
                            />
                            <button
                                disabled={loading}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-10">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
                        <h2 className="text-2xl font-bold">Email Sent!</h2>
                        <p className="text-gray-600 mt-2">Check <b>{email}</b> for instructions.</p>
                    </div>
                )}
                <div className="text-center mt-6">
                    <Link to="/login" className="flex items-center justify-center text-green-600 hover:underline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;