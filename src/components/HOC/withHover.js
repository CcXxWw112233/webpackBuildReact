import React, {Component} from 'react'

//为了避免命名冲突，我们可以做的是让我的 HOC 组件能够允许用户支持定义传入子组件的 prop 名。

function withHover(WrappedComponent, propName = 'hovering') {
  return class withHover extends Component {
    state = {hovering: false}
    onMouseOver = () => this.setState({hovering: true})
    onMouseOut = () => this.setState({hovering: false})
    render() {
      const {hovering} = this.state
      const injected = {
        [propName]: hovering
      }
      return (
        <div onMouseEnter={this.onMouseOver} onMouseLeave={this.onMouseOut} style={{display: 'inline-block'}}>
          <WrappedComponent {...injected} {...this.props} />
        </div>
      )
    }
  }
}

export default withHover
