import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { HabitProvider } from './contexts/HabitContext'
import { ThemeProvider } from './contexts/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <HabitProvider>
          <App />
        </HabitProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
