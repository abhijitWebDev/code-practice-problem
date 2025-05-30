import React, { useEffect } from 'react'
import { Route, Routes, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Home from './pages/Home'
import Login from './pages/authentication/Login'
import SignUp from './pages/authentication/SignUp'
import Layout from './layout/Layout'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from 'lucide-react'
import AdminRoute from './components/AdminRoute'
import AddProblem from './pages/AddProblem'
import ProblemPage from './pages/ProblemPage'

const App = () => {

  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(()=>{
checkAuth()
  },[checkAuth])

  if (isCheckingAuth && !authUser){
    return(
      <div className = "flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin"/>
      </div>
    )
  }
    return (
      <div className="flex flex-col items-center justify-start">
        <Toaster />
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route
            index
            element={authUser ? <Home /> : <Navigate to={"/login"} />}
          />
        </Route>
          <Route
            path="/"
            element={authUser ? <Home /> : <Navigate to={"/login"} />}
          />

          <Route
            path="/login"
            element={!authUser ? <Login /> : <Navigate to={"/"} />}
          />

          <Route
            path="/SignUp"
            element={!authUser ? <SignUp /> : <Navigate to={"/"} />}
          />
          <Route
          path="/problem/:id"
          element={authUser ? <ProblemPage />: <Navigate to={"/login"} />}
           />

          <Route element={<AdminRoute />}>
            <Route
              path="/add-problem"
              element={authUser?.role === "ADMIN" ? <AddProblem /> : <Navigate to={"/"} />}
            />
          </Route>
        </Routes>
      </div>
    );
}


export default App