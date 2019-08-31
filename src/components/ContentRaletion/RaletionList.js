import React from 'react'
import { Dropdown, Input, Icon, Cascader, Tooltip } from 'antd'
import indexStyles from './index.less'
import globalStyles from '../../globalset/css/globalClassName.less'
//relations 关联内容的列表
export default class RaletionList extends React.Component {

  state = {
    isShowAll: false
  }

  handleDeleteRelation = (e, params) => {
    const { handleDeleteRelationItem } = this.props
    if (e) e.stopPropagation()
    handleDeleteRelationItem(params)
  }

  relationClick(content_url) {
    const protocol = content_url.substring(0, 4)
    const url = protocol == 'http' ? content_url : `http://${content_url}`
    window.open(url)
  }
  isShowAll() {
    this.setState({
      isShowAll: !this.state.isShowAll
    })
  }
  judgeType(linked_sign) {
    let themeCode = ''
    switch (linked_sign) {
      case 'board':
        themeCode = '&#xe67d;'
        break
      case 'app_2':
        themeCode = '&#xe66a;'
        break
      case 'app_3':
        themeCode = '&#xe68c;'
        break
      case 'app_4':
        themeCode = '&#xe690;'
        break
      case 'html':
        themeCode = '&#xe781;'
        break
      case 'group ':
        themeCode = '&#xe618;'
        break
      case 'template':
        themeCode = '&#xe68c;'
        break
      case 'folder':
        themeCode = '&#xe690;'
        break
      case 'task':
        themeCode = '&#xe662;'
        break
      case 'file':
        themeCode = '&#xe660;'
        break
      case 'flow':
        themeCode = '&#xe61e;'
        break
      case 'ma':
        themeCode = '&#xe65f;'
        break
      case 'psd':
        themeCode = '&#xe65d;'
        break
      case 'obj':
        themeCode = '&#xe65b;'
        break
      case 'png':
        themeCode = '&#xe69a;'
        break
      case 'xls':
        themeCode = '&#xe65e;'
        break
      case 'xlsx':
        themeCode = '&#xe65c;'
        break
      case 'ppt':
        themeCode = '&#xe650;'
        break
      case 'gif':
        themeCode = '&#xe657;'
        break
      case 'jpeg':
        themeCode = '&#xe659;'
        break
      case 'pdf':
        themeCode = '&#xe651;'
        break
      case 'docx':
        themeCode = '&#xe64a;'
        break
      case 'txt':
        themeCode = '&#xe654;'
        break
      case 'doc':
        themeCode = '&#xe64d;'
        break
      case 'jpg':
        themeCode = '&#xe653;'
        break
      case 'key':
        themeCode = '&#xe64e;'
        break
      case 'dwg':
        themeCode = '&#xe64c;'
        break
      case 'pptx':
        themeCode = '&#xe650;'
        break
      case 'mb':
        themeCode = '&#xe64f;'
        break
      case 'iges':
        themeCode = '&#xe658;'
        break
      case 'skp':
        themeCode = '&#xe660;'
        break
      default:
        themeCode = '&#xe660;'
        break
    }
    return themeCode
  }


  render() {
    const { relations } = this.props
    const { isShowAll } = this.state

    //  console.log('this is relations', relations)
    return (
      <div className={indexStyles.relaData}>
        {relations.map((value, key) => {
          const { id, link_id, linked_name, linked_url, linked_sign, link_local } = value
          if (isShowAll) {
            console.log(linked_sign);
            return (
              <div key={id} className={indexStyles.relaData_item} onClick={this.relationClick.bind(this, linked_url)}>
                <div>
                  <span className={globalStyles.authTheme} style={{ color: '#1890FF', fontSize: 24, marginRight: 4 }} dangerouslySetInnerHTML={{ __html: this.judgeType(linked_sign) }}></span>
                  <span>{linked_name}</span>
                </div>
                <Tooltip title='删除'>
                  <span className={indexStyles.relaData_item_delete_icon} onClick={(e) => this.handleDeleteRelation(e, { id, link_id, link_local })}><i className={globalStyles.authTheme}>&#xe7c3;</i></span>
                </Tooltip>
              </div>
            )
          } else {
            if (key < 2) {
              // console.log(linked_sign);

              return (
                <div key={id} className={indexStyles.relaData_item} onClick={this.relationClick.bind(this, linked_url)}>
                  <div>
                    <span className={globalStyles.authTheme} style={{ color: '#1890FF', fontSize: 24, marginRight: 4 }} dangerouslySetInnerHTML={{ __html: this.judgeType(linked_sign) }}></span>
                    <span>{linked_name}</span>
                  </div>
                  <Tooltip title='删除'>
                    <span className={indexStyles.relaData_item_delete_icon} onClick={(e) => this.handleDeleteRelation(e, { id, link_id, link_local })}><i className={globalStyles.authTheme}>&#xe7c3;</i></span>
                  </Tooltip>
                </div>
              )
            }
          }
        })}
        <span onClick={this.isShowAll.bind(this)} style={{ cursor: 'pointer', color: 'rgb(73, 155, 230)', marginTop: '8px' }}> {isShowAll ? '收起部分' : '查看更多'} </span>
      </div>
    )
  }
}
