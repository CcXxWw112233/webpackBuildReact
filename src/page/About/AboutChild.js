import React, { Component } from 'react'
import PropTypes from 'prop-types'
import HookTest from './HookTest'
import ObjectProto from './ObjectProto'

class AboutChild extends Component {
  constructor(props) {
    super(props)
    this.state = {
      count: 0,
    }
    const Func = new Fun(this)
    const iteratorFunc = { ...Func }
    // console.log('ssss_4', 0, iteratorFunc, this)
    for (let key in iteratorFunc) {
      if ('__proto__' != key) {
        this[key] = iteratorFunc[key].bind(this)
      }
    }
  }
  componentDidMount() {}
  renderCount = () => {
    return <div>子组件外部渲染---{this.count}---count</div>
  }

  render() {
    return (
      <div>
        <div onClick={this.onClick}>子组件的点击</div>
        <div>{this.renderCount()}</div>
        {/* <ObjectProto /> */}
        {/* <HookTest count={this.state.count} /> */}
      </div>
    )
  }
}
AboutChild.propTypes = {
  prop: PropTypes,
}
export default AboutChild

const funobj = {
  onClick: () => {
    // console.log('ssss_4', 3, this)
  },
}
// funcobj.prototype
class Fun {
  constructor(el) {}
  onClick = () => {
    // console.log('ssss_4', 3, this)
  }
}
