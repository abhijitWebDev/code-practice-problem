
import './App.css'
import { useState } from 'react'

function App() {
  const [isDisplayed, setIsDisplayed] = useState("Hello Abhijit")

  const handleClick = () => {
    setIsDisplayed("Hope you expand to your true potential")
  }
  

  return (
    <>
      <h1 className="text-red-500">{isDisplayed} Welcome to Leet lab</h1>
      <button class="btn btn-primary rounded-lg" onClick={handleClick}>Primary Button</button>
    </>
  )
}

export default App
