import React, { Component } from 'react'
import { Breadcrumb } from 'antd'
import { compareACoupleOfObjects } from '@/utils/util'
import { getSubfixName } from '@/utils/businessFunction.js'

export default class FileDetailBreadCrumbFileNav extends Component {
  constructor(props) {
    super(props)
    this.state = {
      breadcrumbList: []
    }
  }

  // 获取面包屑路径
  getBreadCrumbList = props => {
    const { targetFilePath = {}, currentPreviewFileData = {} } = props
    let arr = []
    let target_path = targetFilePath
    //递归添加路径
    const digui = (name, data) => {
      if (data[name]) {
        arr.push({ file_name: data.folder_name, file_id: data.id, type: '1' })
        digui(name, data[name])
      } else if (data['parent_id'] == '0') {
        arr.push({ file_name: '根目录', file_id: data.id, type: '1' })
      }
    }
    if (!target_path) return
    digui('parent_folder', target_path)
    const newbreadcrumbList = arr.reverse()
    newbreadcrumbList.push({
      file_name: currentPreviewFileData.file_name,
      file_id: currentPreviewFileData.id,
      type: '2',
      folder_id: currentPreviewFileData.folder_id
    })
    this.setState({
      breadcrumbList: newbreadcrumbList
    })
  }

  componentWillReceiveProps(nextProps) {
    this.getBreadCrumbList(nextProps)
    // if (!compareACoupleOfObjects(this.props, nextProps)) {
    //   this.getBreadCrumbList(nextProps)
    // }
  }

  getEllipsisFileName = name => {
    // wx6535e025f795dca9.o6zAJs5_pqZsbrr7sJng7qkxKKbM.ZhMftVUvAIJ9b5dcb721199c1b8f4f84b0954a80e589.png
    // let str = 'wx6535e025f795dca9.o6zAJs5_pqZsbrr7sJng7qkxKKbM.ZhMftVUvAIJ9b5dcb721199c1b8f4f84b0954a80e589.png'
    let str = name
    if (!name) return
    let arr = str.split('.')
    arr.splice(-1, 1)
    arr.join('.')
    return arr
  }

  render() {
    const { breadcrumbList = [] } = this.state
    return (
      <div>
        <Breadcrumb
          separator=">"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {breadcrumbList &&
            breadcrumbList.length &&
            breadcrumbList.map((value, key) => {
              return (
                <Breadcrumb.Item key={key}>
                  {value.type == '2' ? (
                    <span
                      style={{
                        wordBreak: 'break-all',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span
                        style={{
                          maxWidth: '300px',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {this.getEllipsisFileName(value && value.file_name)}
                      </span>
                      {`${getSubfixName(
                        value && value.file_name && value.file_name
                      )}`}
                    </span>
                  ) : (
                    <span style={{ wordBreak: 'break-all' }}>
                      {value && value.file_name}
                    </span>
                  )}
                </Breadcrumb.Item>
              )
            })}
        </Breadcrumb>
      </div>
    )
  }
}
