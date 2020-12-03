import React, { Component } from 'react'
import indexStyles from './index.less'
import ProcessDefault from './ProcessDefault'

export default class Process extends Component {
  render() {
    return (
      <div className={indexStyles.processOut}>
        <ProcessDefault />
      </div>
    )
  }
}
