import React from 'react'
import { Input, Button } from 'antd'
import { connect } from 'dva'

@connect(mapStateToProps)
export default class CreatDirector extends React.Component {
  state = {
    file_name: ''
  }
  nameInputChange(e) {
    this.setState({
      file_name: e.target.value
    })
  }
  onOk() {
    if (!this.state.file_name) {
      return false
    }
    const { projectDetailInfoData = {}, currentParrentDirectoryId, dispatch } = this.props
    const { board_id } = projectDetailInfoData

    const { fileList = [], filedata_1 = [] } = this.props
    const new_fileList = [...fileList]
    const new_filedata_1 = [...filedata_1]
    new_fileList.shift()
    new_filedata_1.shift()

    dispatch({
      type: 'projectDetailFile/addNewFolder',
      payload: {
        board_id,
        folder_name: this.state.file_name,
        parent_id: currentParrentDirectoryId
      }
    })
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        fileList: new_fileList,
        filedata_1: new_filedata_1,
        isInAddDirectory: false
      }
    })
  }
  onCancel() {
    const { fileList = [], filedata_1 = [], dispatch } = this.props
    const new_fileList = [...fileList]
    const new_filedata_1 = [...filedata_1]
    new_fileList.shift()
    new_filedata_1.shift()
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        fileList: new_fileList,
        filedata_1: new_filedata_1,
        isInAddDirectory: false
      }
    })
  }
  render() {
    return (
      <div style={{ fontSize: 14 }}>
        <Input autoFocus style={{ width: 160, height: 24 }} onChange={this.nameInputChange.bind(this)} />
        <Button style={{ height: 24, marginLeft: 8 }} type={'primary'} onClick={this.onOk.bind(this)}>确认</Button>
        <Button style={{ marginLeft: 8, height: 24 }} onClick={this.onCancel.bind(this)}>取消</Button>
      </div>
    )
  }
}
function mapStateToProps({
  projectDetailFile: {
    datas: {
      fileList = [],
      filedata_1 = [],
      currentParrentDirectoryId
    }
  },
  projectDetail: {
    datas: {
      projectDetailInfoData = {},
    }
  }
}) {
  return {
    fileList,
    filedata_1,
    currentParrentDirectoryId,
    projectDetailInfoData,
  }
}