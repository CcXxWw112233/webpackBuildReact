import React, { Component } from 'react'
export default class BasicFieldContainer extends Component {
  render() {
    const {
      BasicFieldUIComponent,
      boardFolderTreeData,
      milestoneList,
      whetherUpdateParentTaskTime,
      handleTaskDetailChange,
      handleChildTaskChange,
      updateParentPropertiesList,
      updatePrivateVariablesWithOpenFile,
      handleRelyUploading
    } = this.props
    return (
      <BasicFieldUIComponent
        LogicWithMainContent={this.props.LogicWithMainContent}
        boardFolderTreeData={boardFolderTreeData}
        milestoneList={milestoneList}
        whetherUpdateParentTaskTime={whetherUpdateParentTaskTime}
        handleTaskDetailChange={handleTaskDetailChange}
        handleChildTaskChange={handleChildTaskChange}
        updateParentPropertiesList={updateParentPropertiesList}
        updatePrivateVariablesWithOpenFile={updatePrivateVariablesWithOpenFile}
        handleRelyUploading={handleRelyUploading}
      />
    )
  }
}
