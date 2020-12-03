import React, { Component } from 'react'

export default class DetailContent extends Component {
  render() {
    const { mainContent = <div></div> } = this.props
    return <div>{mainContent}</div>
  }
}
