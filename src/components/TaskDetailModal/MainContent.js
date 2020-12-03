import React, { Component } from 'react'
import MainContainer from './UIWithContainerComponent/MainContainer'
import DefaultMainContentUIComponent from './UIWithContainerComponent/MainUIComponent'

export default class MainContent extends Component {
  render() {
    const {
      MainUIComponent,
      handleRelyUploading,
      handleTaskDetailChange,
      handleChildTaskChange
    } = this.props
    return (
      <MainContainer
        handleRelyUploading={handleRelyUploading}
        handleTaskDetailChange={handleTaskDetailChange}
        handleChildTaskChange={handleChildTaskChange}
        MainUIComponent={
          MainUIComponent ? MainUIComponent : DefaultMainContentUIComponent
        }
      />
    )
  }
}
