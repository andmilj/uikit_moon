import React from 'react'
import ReactDOM from 'react-dom'
import HttpsRedirect from 'react-https-redirect'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App'
import Providers from './Providers'

ReactDOM.render(
  <React.StrictMode>
    <HttpsRedirect>
      <Providers>
        <App />
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnHover
        />
      </Providers>
    </HttpsRedirect>
  </React.StrictMode>,
  document.getElementById('root'),
)
