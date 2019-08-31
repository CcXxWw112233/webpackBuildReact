
import React from 'react'
import { Breadcrumb, Menu, Dropdown, Icon } from 'antd'
import indexStyles from './index.less'
import globalStyles from '../../../../../../globalset/css/globalClassName.less'

export default class FileDerailBreadCrumbFileNav extends React.Component {
  state = {
    breadcrumbWidthIsSuper: false, //面包屑的宽度是否超出规定宽度
    breadcrumbOutWidth: 0,
  }
  componentDidMount() {
    const breadcrumbOut = this.refs.breadcrumbOut
    const documentWidth = document.querySelector('body').clientWidth
    let breadcrumbOutWidth = 0
    if(breadcrumbOut) {
      breadcrumbOutWidth = breadcrumbOut.clientWidth
    }
    const maxWidth = documentWidth * 0.6 * 0.8
    if(breadcrumbOutWidth > maxWidth) {
      this.setState({
        breadcrumbWidthIsSuper: true,
      })
    }
    this.setState({
      breadcrumbOutWidth: breadcrumbOutWidth > maxWidth ? maxWidth : breadcrumbOutWidth
    })
    // console.log('breadcrumbOutWidth', breadcrumbOutWidth)
    // console.log('breadcrumbOutWidth1', documentWidth)
  }

  fileNavClick(data) {
    const { value: { file_id, file_name, type }, key } = data
    if(type !== '1') {
      return false
    }
    const { datas = {} } = this.props.model
    const { breadcrumbList = [] } = datas
    breadcrumbList.splice(key + 1, breadcrumbList.length - key - 1) //删除当前点击后面的元素下标
    this.props.updateDatasFile({breadcrumbList, currentParrentDirectoryId: file_id, isInOpenFile: false})
    //这里执行请求列表元素
    this.props.getFileList({
      folder_id: file_id
    })
  }

  fileNavMenuClick(e) {
    const key = Number(e.key)
    const { datas = {} } = this.props.model
    const { breadcrumbList = [] } = datas
    const file_id = breadcrumbList[key]['file_id']
    const type = breadcrumbList[key]['type']
    if(type !== '1') {
      return false
    }
    const breadcrumbList_new = [...breadcrumbList]
    breadcrumbList_new.splice(key + 1, breadcrumbList.length - key - 1) //删除当前点击后面的元素下标
    this.props.updateDatasFile({breadcrumbList: breadcrumbList_new, currentParrentDirectoryId: file_id, isInOpenFile: false})
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
    this.props.updateDatasFile({filePreviewCurrentId: file_id, filePreviewCurrentVersionId: version_id, filePreviewCurrentFileId: file_id})
    this.props.filePreview({id: file_resource_id, file_id})
    this.props.fileVersionist({version_id: version_id})
  }

  render() {
    const { datas = {} } = this.props.model
    const { filedata_2 = [], breadcrumbList=[] } = datas
    const { breadcrumbWidthIsSuper, breadcrumbOutWidth } = this.state

    // let breadcrumbList = []
    // for(let i = 0; i < 10; i ++) {
    //   const obj = {
    //     belong_folder_id: "1110417727866146816",
    //     create_time: "2019-03-27 14:53:41",
    //     creator: "David.Chen",
    //     file_id: "1110797015513698304",
    //     file_name: `${i}`.repeat(100),
    //     folder_id: "1110797015513698304",
    //     folder_name: `${i}`.repeat(100),
    //     type: "1",
    //     update_time: "2019-03-27 14:53:41",
    //   }
    //   breadcrumbList.push(obj)
    // }
    // const menu = (
    //   <Menu onClick={this.fileListItemClick.bind(this)}>
    //     {filedata_2.map((value, key) => {
    //       return(
    //         <Menu.Item key={key}>{value.file_name}</Menu.Item>
    //       )
    //     })}
    //
    //   </Menu>
    // );

    const breadcrumbListMenu = () => {
      return (
        <Menu style={{ maxWidth: 200}} onClick={this.fileNavMenuClick.bind(this)}>
          {breadcrumbList.map((value, key) => {
            return key < breadcrumbList.length - 1 && (
              <Menu.Item key={key}>
                <div className={`${indexStyles.eplise}`} style={{ maxWidth: 200}}>{value && value.file_name}</div>
              </Menu.Item>
            )
          })}
        </Menu>
      )
    }

    return (
      <div>
        <div style={{display: 'flex', cursor: 'pointer', background: 'rgba(245,245,245,1)', borderRadius: 4, padding: '0 8px'}} ref={'breadcrumbOut'} >
          <div className={globalStyles.authTheme} style={{margin: '2px 10px 0 0', color: '#8c8c8c'}}>&#xe6d6;</div>
          {breadcrumbWidthIsSuper ? (
            <Dropdown overlay={breadcrumbListMenu()}>
              <div className={`${indexStyles.eplise}`} style={{maxWidth: breadcrumbOutWidth}}>{breadcrumbList[breadcrumbList.length - 1] && breadcrumbList[breadcrumbList.length - 1].file_name}</div>
            </Dropdown>
          ) : (
            <Breadcrumb separator=">">
              {breadcrumbList.map((value, key) => {
                return (
                  <Breadcrumb.Item key={key} onClick={this.fileNavClick.bind(this, {value, key})}>
                    <span className={key != breadcrumbList.length - 1 && indexStyles.breadItem}>{value && value.file_name}</span>
                  </Breadcrumb.Item>
 )
              })}
            </Breadcrumb>
          )}
          {/*<Dropdown overlay={menu}>*/}
            {/*<Icon type="caret-down" theme="outlined" style={{ fontSize: 12, margin: '4px 0 0 8px'}} />*/}
          {/*</Dropdown>*/}
        </div>

      </div>
    )
  }

}

const publicStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}
