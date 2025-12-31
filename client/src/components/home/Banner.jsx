import React from 'react'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
  const navigate = useNavigate()

  const handleBannerClick = () => {
    // 1. Check if user is logged in
    const token = localStorage.getItem('token')

    if (token) {
      // 2. If Logged In -> Go straight to Dashboard (AI Feature)
      navigate('/dashboard') 
    } else {
      // 3. If Not Logged In -> Go to Login page
      // We add ?state=login to match the logic in your Login.jsx
      navigate('/app?state=login') 
    }
  }

  return (
    <div 
      onClick={handleBannerClick}
      className="w-full py-2.5 font-medium text-sm text-green-800 
      text-center bg-gradient-to-r from-[#ABFF7E] to-[#FDFEFF]
      cursor-pointer hover:opacity-95 transition-opacity" // Added cursor and hover effect
    >
        <p>
            <span className="px-3 py-1 rounded-lg text-white bg-green-600 mr-2">
            New</span>
            AI Feature Added
        </p>
    </div>
  )
}

export default Banner