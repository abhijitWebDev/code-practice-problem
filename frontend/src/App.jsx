import React, { useEffect } from 'react'
import { Route, Routes, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Home from './pages/Home'
import Login from './pages/authentication/Login'
import SignUp from './pages/authentication/SignUp'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from 'lucide-react'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  

  // Add debug logging
  

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  console.log(authUser);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-start">
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={authUser ? <Home /> : <Navigate to="/login"  />}
        />
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUp /> : <Navigate to="/"  />}
        />
      </Routes>
    </div>
  );
}

export default App