import React from 'react'
import ReactDOM from 'react-dom/client'
// ⚠️ colorPatch PHẢI import trước React/tldraw để patch màu trước khi render
import './colorPatch.js'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
