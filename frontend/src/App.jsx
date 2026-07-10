import React from 'react'
import { RouterProvider } from 'react-router'
import route from './routes/auth.router'
import { Provider } from 'react-redux'
import { store } from './redux/stores'
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={route} />
    </Provider>
  )
}

export default App
