// このファイルはReactアプリをブラウザに描画する最初の入口です。
// StrictMode は開発中に意図しない挙動を見つけやすくするための仕組みです。
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
