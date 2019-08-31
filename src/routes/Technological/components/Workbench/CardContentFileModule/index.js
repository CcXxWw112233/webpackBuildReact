import { Card, Icon, Dropdown, Input, Menu } from 'antd'
import indexstyles from '../index.less'
import React from 'react'
import MenuSearchMultiple from '../CardContent/MenuSearchMultiple'
import FileDetailModal from '../CardContent/Modal/FileDetailModal'
import FileList from './FileList'

const TextArea = Input.TextArea
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

export default class CardContent extends React.Component{
  state={
    dropDonwVisible: false, //下拉菜单是否可见
    previewFileModalVisibile: false,

    //修改项目名称所需state
    localTitle: '',
    isInEditTitle: false,
  }
  componentWillMount() {
    const { CardContentType, boxId } = this.props
    this.initSet(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.initSet(nextProps)
  }
  //初始化根据props设置state
  initSet(props) {
    const { title } = props
    this.setState({
      localTitle: title
    })
  }
  //项目操作----------------start
  //设置项目名称---start
  setIsInEditTitle() {
    this.setState({
      isInEditTitle: !this.state.isInEditTitle,
    })
  }
  localTitleChange(e) {
    this.setState({
      localTitle: e.target.value
    })
  }
  editTitleComplete(e) {
    this.setIsInEditTitle()
    const { boxId } = this.props
    this.props.updateBox({
      box_id: boxId,
      name: this.state.localTitle,
    })
  }

  selectMultiple(data) {
    this.setState({
      dropDonwVisible: false
    })

    const { boxId, itemKey } = this.props

    this.props.getItemBoxFilter({
      id: boxId,
      board_ids: data.join(','),
      selected_board_data: data,
      itemKey
    })
  }
  onVisibleChange(e, a){
    this.setState({
      dropDonwVisible: e
    })
  }
  handleMenuClick(e) {
    const key = e.key
    switch (key) {
      case 'rename':
        this.setIsInEditTitle()
        break
      case 'remove':
        const { itemValue } = this.props
        const { box_type_id } = itemValue
        this.props.deleteBox({box_type_id: box_type_id})
        break
      default:
        break
    }
  }

  setPreviewFileModalVisibile() {
    this.setState({
      previewFileModalVisibile: !this.state.previewFileModalVisibile
    })
  }

  render(){
    const { datas = {} } = this.props.model
    const { projectList = [] } = datas
    const { title, CardContentType, itemValue={} } = this.props
    const { selected_board_data = [] } = itemValue //已选board id

    const { localTitle, isInEditTitle } = this.state

    const filterItem = (CardContentType) => {
      let contanner = (<div></div>)
      switch (CardContentType) {

        case 'MY_UPLOAD_FILE':
          contanner = (
            <div>
              <FileList {...this.props} CardContentType={'MY_UPLOAD_FILE'} setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)} />
            </div>
          )
          break
        case 'MY_STAR_FILE':
          contanner = (
            <div>
               <FileList {...this.props} CardContentType={'MY_STAR_FILE'} setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)} />
            </div>
          )
          break
        default:
          break
      }
      return contanner
    }

    const menu = ()=> {
      return (
        <Menu
          onClick={this.handleMenuClick.bind(this)}
          // selectedKeys={[this.state.current]}
          // mode="horizontal"
        >
          <Menu.Item key="rename">
             重命名
          </Menu.Item>
          {'YINYI_MAP' === CardContentType || 'TEAM_SHOW' === CardContentType? (''): (
            <SubMenu title={'选择项目'}>
              <MenuSearchMultiple keyCode={'board_id'} onCheck={this.selectMultiple.bind(this)} selectedKeys={selected_board_data} menuSearchSingleSpinning={false} Inputlaceholder={'搜索项目'} searchName={'board_name'} listData={projectList} />
            </SubMenu>
          )}

          <Menu.Item key="remove">
            移除
          </Menu.Item>

        </Menu>
      )
    }

    return (
      <div className={indexstyles.cardDetail} style={{maxHeight: CardContentType=='MY_UPLOAD_FILE' ? 680: ''}}>
        <div className={indexstyles.contentTitle}>
          {/*<div>{title}</div>*/}
          <div className={indexstyles.titleDetail} >{localTitle}</div>
        </div>
        <div className={indexstyles.contentBody} style={{maxHeight: CardContentType=='MY_UPLOAD_FILE' ? 600: ''}}>
          {filterItem(CardContentType)}
        </div>

        <FileDetailModal {...this.props} modalVisible={this.state.previewFileModalVisibile} setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)} />

      </div>
    )
  }


}

