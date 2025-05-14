import { useState } from 'react'
import PromptManagerView from './components/PromptManagerView'
import VisualContextCanvasView from './components/VisualContextCanvasView'
import { useTheme } from './contexts/ThemeContext'
import './App.css'

function App() {
  // State to track the current view
  const [currentView, setCurrentView] = useState('promptManager')

  // Get theme context
  const { theme, toggleTheme } = useTheme()

  // Function to handle navigation
  const handleNavigation = (view) => {
    setCurrentView(view)
  }

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="app-header dark:bg-dark-bg-primary dark:text-dark-text-primary">
        <div className="flex items-center">
          <h1>Vibe Coder's Companion</h1>
          <button
            className="ml-4 p-2 rounded-full bg-neutral-200 dark:bg-dark-bg-tertiary flex items-center justify-center"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        <nav className="app-nav">
          <button
            className={`nav-button ${currentView === 'promptManager' ? 'active' : ''} dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-bg-tertiary`}
            onClick={() => handleNavigation('promptManager')}
            aria-pressed={currentView === 'promptManager'}
          >
            Prompt Manager
          </button>
          <button
            className={`nav-button ${currentView === 'visualContextCanvas' ? 'active' : ''} dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-bg-tertiary`}
            onClick={() => handleNavigation('visualContextCanvas')}
            aria-pressed={currentView === 'visualContextCanvas'}
          >
            Visual Context Canvas
          </button>
        </nav>
      </header>

      <main className={`app-content dark:bg-dark-bg-secondary ${currentView === 'visualContextCanvas' ? 'visual-canvas-view' : ''}`}>
        {currentView === 'promptManager' ? (
          <PromptManagerView />
        ) : (
          <VisualContextCanvasView />
        )}
      </main>

      <footer className="app-footer dark:bg-dark-bg-primary dark:text-dark-text-secondary">
        <p>Vibe Coder's Companion &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default App
