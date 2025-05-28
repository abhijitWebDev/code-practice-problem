import React from 'react'
import { useAuthStore } from '../store/useAuthStore'

const Home = () => {
  const { authUser } = useAuthStore()

  return (
    <div className="min-h-screen w-full bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Welcome, {authUser?.name}!
        </h1>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Your Dashboard</h2>
            <p className="text-lg text-base-content/70">
              This is your personalized homepage. Start exploring!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home