import React, { Component } from 'react'
import { BrowserRouter, Route, Link } from 'react-router-dom'
import { hot } from 'react-hot-loader/root';
import Home from '../page/Home'
import About from '../page/About'
import Topics from '../page/Topics'

class App extends Component {

    render() {
        return (
            <BrowserRouter>
                <div>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/topics">Topics</Link></li>
                    </ul>

                    <hr/>

                    <Route exact path="/" component={Home}/>
                    <Route path="/about" component={About}/>
                    <Route path="/topics" component={Topics}/>
                </div>
            </BrowserRouter>
        )
    }
}

export default hot(App)