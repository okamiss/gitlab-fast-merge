import React from 'react'
import ReactDOM from 'react-dom/client'
import 'reset-css'
import '@/assets/global.scss'

import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
