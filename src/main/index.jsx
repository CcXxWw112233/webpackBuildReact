import React from 'react'
import ReactDOM from 'react-dom'
// import { hot  } from 'react-hot-loader/root'
import App from './app.js'

const render = Component => {
    ReactDOM.render(
        <App />,
        document.getElementById('root'),
    )
}

render()
