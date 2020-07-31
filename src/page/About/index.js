import React from 'react'
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'
import Topics from '../Topics'
import AboutChild from './AboutChild'

console.log('sss_3', About.prototype)
function About() {
    // const Fn = arguments.callee
    const propertyFunc = new FuncComponetFunc()

    const testClick = () => {
        propertyFunc.testClick()
    }
    return (
        <div>
            about
            <React.Fragment>ss</React.Fragment>
            <ul>
                <li><Link to="/about/detail">去看看详情吧</Link></li>
            </ul>
            <Switch>
                <Route path="/about/detail" component={AboutChild} />
            </Switch>
            {/* <div onClick={testClick}>函数组件外部方法</div> */}
        </div>
    )
}
export default About

class FuncComponetFunc {
    constructor(props) {

    }
    testClick = () => {
        console.log('父组件操作类', this)
    }
}