import { type ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import './App.css'
import BoardView from './BoardView'
import HistoryNav from './HistoryNav'
import StageSelect from './StageSelect'
import { AppProvider } from './app/provider'
import Capture from './capture/Capture'
import Options from './options/Options'

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
          <Capture />
        </div>
        <BoardView />
        <Options />
        <Toaster position="bottom-center" />
      </div>
    </AppProvider>
  )
}

export default App
