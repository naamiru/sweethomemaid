import { type ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import './App.css'
import BoardView from './BoardView'
import HistoryNav from './HistoryNav'
import StageSelect from './StageSelect'
import { AppProvider } from './app/provider'
import Capture from './capture/Capture'
import GoodMove from './good-move/GoodMove'
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
          <a
            className="social"
            href="https://github.com/naamiru/sweethomemaid?tab=readme-ov-file#chrome-%E6%8B%A1%E5%BC%B5%E6%A9%9F%E8%83%BD%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%9F%E7%9B%A4%E9%9D%A2%E8%AA%AD%E3%81%BF%E5%8F%96%E3%82%8A"
          >
            <i className="fa-brands fa-github fa-2xl"></i>
            <span className="tag is-danger">new</span>
          </a>
        </nav>

        <StageSelect />
        <div className="app-operations">
          <HistoryNav />
          <Capture />
        </div>
        <div className="app-main">
          <main>
            <BoardView />
          </main>
          <aside>
            <Options />
            <GoodMove />
          </aside>
        </div>
        <Toaster position="bottom-center" />
      </div>
    </AppProvider>
  )
}

export default App
