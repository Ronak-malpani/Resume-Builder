import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'
import Login from './Login'

const Layout = () => {
  const { user, loading } = useSelector(state => state.auth)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200/80">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-sm font-medium text-gray-600 animate-pulse">
            Authenticating...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {user ? (
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Outlet />
        </div>
      ) : (
        <Login />
      )}
    </div>
  )
}

export default Layout