import { type ReactNode } from 'react'
import './App.css'
import BoardView from './BoardView'
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
        <BoardView />
      </div>
    </AppProvider>
  )
}

export default App
