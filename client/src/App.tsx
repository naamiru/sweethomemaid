import { type ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import './App.css'
import BoardView from './BoardView'
import CaptureButton from './CaptureButton.tsx'
import HistoryNav from './HistoryNav.tsx'
import StageSelect from './StageSelect'
import { AppProvider } from './context/app.tsx'

function App(): ReactNode {
  return (
    <AppProvider>
      <div className="container app-container is-max-desktop">
        <nav className="app-navbar">
          <div className="brand">
            <h1 className="title is-5">スイートホームメイド</h1>
            <h2 className="title is-5">パズルシミュレーター</h2>
          </div>
          <a className="social" href="https://github.com/naamiru/sweethomemaid">
            <i className="fa-brands fa-github fa-2xl"></i>
          </a>
        </nav>

        <StageSelect />
        <div className="app-operations">
          <HistoryNav />
          <CaptureButton />
        </div>
        <BoardView />
        <Toaster position="bottom-center" />
      </div>
    </AppProvider>
  )
}

export default App
