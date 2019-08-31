
import React from 'react'
import { Breadcrumb, Menu, Dropdown, Icon } from 'antd'
import indexStyles from './index.less'
import globalStyles from '../../../../../../../globalset/css/globalClassName.less'

export default class FileDerailBreadCrumbFileNav extends React.Component {
  state = {
    breadcrumbWidthIsSuper: false, //面包屑的宽度是否超出规定宽度
    breadcrumbOutWidth: 0,
  }
  componentDidMount() {
    this.initialSet(this.props)
  }

  componentWillReceiveProps(nextProps) {
   this.initialSet(nextProps)
  }

  initialSet(props) {
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
  }

  fileNavClick(data) {
    const { value: { file_id, file_name, type }, key } = data
    if(type !== '1') {
      return false
    }

  }

  fileNavMenuClick(e) {
    const key = Number(e.key)
    const { datas = {} } = this.props.model
    const { breadcrumbList = [] } = datas
    const file_id = breadcrumbList[key]['file_id']
    const type = breadcrumbList[key]['type']

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
    const { breadcrumbList = [], filedata_2 = [] } = datas
    const { breadcrumbWidthIsSuper, breadcrumbOutWidth } = this.state

    const menu = (
      <Menu onClick={this.fileListItemClick.bind(this)}>
        {filedata_2.map((value, key) => {
          return(
            <Menu.Item key={key}>{value.file_name}</Menu.Item>
          )
        })}

      </Menu>
    );
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
