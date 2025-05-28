import React from 'react'
import { useAuthStore } from '../store/useAuthStore'

const LogoutButton = ({children}) => {
const { logout } = useAuthStore();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
     <button className="btn btn-primary" onClick={handleLogout}> 
            {children}
        </button>
  )
}

export default LogoutButton