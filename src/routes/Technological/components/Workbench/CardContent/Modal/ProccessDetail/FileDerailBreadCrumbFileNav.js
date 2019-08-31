
import React from 'react'
import { Breadcrumb, Menu, Dropdown, Icon } from 'antd'
import indexStyles from './index.less'

export default class FileDerailBreadCrumbFileNav extends React.Component {
  fileNavClick(data) {
    const { value: { file_id, file_name, type }, key } = data
    if(type !== '1') {
      return false
    }
    const { datas = {} } = this.props.model
    const { breadcrumbList = [] } = datas
    breadcrumbList.splice(key + 1, breadcrumbList.length - key - 1) //删除当前点击后面的元素下标
    this.props.updateDatas({breadcrumbList, currentParrentDirectoryId: file_id, isInOpenFile: false})
    //这里执行请求列表元素
    this.props.getFileList({
      folder_id: file_id
    })
  }
  fileListItemClick(e) {
    const key = Number(e.key)
    const { datas = {} } = this.props.model
    const { filedata_2 = [] } = datas
    const { file_id, version_id, file_resource_id } = filedata_2[key]
    //接下来打开文件
    this.props.updateDatas({filePreviewCurrentId: file_id, filePreviewCurrentVersionId: version_id, filePreviewCurrentFileId: file_id})
    this.props.filePreview({id: file_resource_id, file_id})
    this.props.fileVersionist({version_id: version_id})
  }
  render() {
    const { datas = {} } = this.props.model
    const { breadcrumbList = [], filedata_2 = [] } = datas
    const menu = (
      <Menu onClick={this.fileListItemClick.bind(this)}>
        {filedata_2.map((value, key) => {
          return(
            <Menu.Item key={key}>{value.file_name}</Menu.Item>
          )
        })}

      </Menu>
    );
    return (
      <div>
        <div style={{display: 'flex', cursor: 'pointer', }}>
          <Breadcrumb
            separator=">"
          >
            {breadcrumbList.map((value, key) => {
              return (<Breadcrumb.Item key={key} onClick={this.fileNavClick.bind(this, {value, key})}>{value.file_name}</Breadcrumb.Item> )
            })}
          </Breadcrumb>
          <Dropdown overlay={menu}>
            <Icon type="caret-down" theme="outlined" style={{ fontSize: 12, margin: '4px 0 0 8px'}} />
          </Dropdown>
        </div>

      </div>
    )
  }

}
