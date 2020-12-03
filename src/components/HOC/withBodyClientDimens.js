import React, { Component } from 'react'

function withBodyClientDimens(WrappedComponent) {
  return class withClientInfo extends Component {
    state = { bodyClientWidth: 0, bodyClientHeight: 0 }
    getDimensions = () => {
      this.setState({
        bodyClientWidth: document.body.clientWidth,
        bodyClientHeight: document.body.clientHeight
      })
    }
    componentDidMount() {
      this.getDimensions()
      window.addEventListener('resize', this.getDimensions, false)
    }
    componentWillUnmount() {
      window.removeEventListener('resize', this.getDimensions, false)
    }
    render() {
      const { bodyClientWidth, bodyClientHeight } = this.state
      const injected = {
        bodyClientWidth,
        bodyClientHeight
      }
      return (
        <div>
          <WrappedComponent {...injected} {...this.props} />
        </div>
      )
    }
  }
}

export default withBodyClientDimens
