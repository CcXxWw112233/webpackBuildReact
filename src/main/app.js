import React, { Component, Suspense, lazy } from 'react'
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader/root'
import NotFound from '../page/NotFound'
import styles from './index.less'
// import Home from '../page/Home'
// import About from '../page/About'
// import Topics from '../page/Topics'

const Home = lazy(() => import('../page/Home'))
const About = lazy(() => import('../page/About'))
const Topics = lazy(() => import('../page/Topics'))

// const Topics = React.lazy(async () => {
//     const com = await import("../page/Topics");
//     return { default: com.default || com };
// })

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className={styles.ccc}>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/topics">Topics</Link>
            </li>
          </ul>

          <hr />
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/about" component={About} />
              <Route path="/topics" component={Topics} />
              <Route path="*" component={NotFound} />
            </Switch>
          </Suspense>
        </div>
      </BrowserRouter>
    )
  }
}

export default hot(App)
