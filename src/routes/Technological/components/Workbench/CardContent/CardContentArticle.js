import React from 'react'
import { Card, Icon, Input, Dropdown, Menu } from 'antd'
import indexstyles from '../index.less'
import { getArticleList } from '../../../../../services/technological/workbench'
import {WE_APP_TYPE_KNOW_CITY} from "../../../../../globalset/js/constant";
import ArticleItem from "./ArticleItem";
import PreviewArticleModal from '../PreviewArticleModal'

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

export default class CardContentArticle extends React.Component{
  state={
    page_no: 1,
    page_size: 20,
    query_type: '1',
    previewArticleModalVisibile: false,
    listData: [], //所需加载的数据
    loadMoreText: '加载中...',
    loadMoreDisplay: 'none',
    scrollBlock: true, //滚动加载锁，true可以加载，false不执行滚动操作
  }
  componentWillMount() {
    this.getArticleList()
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


  //分页逻辑
  async getArticleList() {
    const { appType } = this.props
    const { page_size, page_no, query_type, listData= [] } = this.state
    const obj = {
      page_no,
      page_size,
      query_type,
      appType
    }
    const res = await getArticleList(obj)
    if(res.code === '0') {
      const data = res.data
      this.setState({
        listData: Number(page_no) === 1? res.data : listData.concat(...data),
        scrollBlock: !(data.length < page_size),
        loadMoreText: (data.length < page_size)?'暂无更多数据': '加载中...',
      }, () => {
        this.setState({
          loadMoreDisplay: this.state.listData.length?'block': 'none',
        })
      })
    }
  }
  contentBodyScroll(e) {
    if(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 20) {
      const { scrollBlock } = this.state
      if(!scrollBlock) {
        return false
      }
      this.setState({
        page_no: ++this.state.page_no,
        scrollBlock: false
      }, () => {
        this.getArticleList()
      })
    }
  }

  getArticleDetail(id, e) {
    this.setPreviewArticleModalVisibile()
    this.props.getArticleDetail({
      id,
      appType: this.props.appType
    })
  }
  setPreviewArticleModalVisibile() {
    this.setState({
      previewArticleModalVisibile: !this.state.previewArticleModalVisibile
    })
  }
  render() {
    const { loadMoreDisplay, loadMoreText, listData} = this.state
    const { appType, title } = this.props

    const { localTitle, isInEditTitle } = this.state

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
          <Menu.Item key="remove">
            移除
          </Menu.Item>

        </Menu>
      )
    }


    return (
      <div>
        <div className={indexstyles.cardDetail}>
          <div className={indexstyles.contentTitle}>
            {/*<div>{title}</div>*/}
            {!isInEditTitle?(
              <div className={indexstyles.titleDetail} onClick={this.setIsInEditTitle.bind(this)} >{localTitle}</div>
            ) : (
              <Input value={localTitle}
                // className={indexStyle.projectName}
                     style={{resize: 'none', color: '#595959', fontSize: 16}}
                     maxLength={30}
                     autoFocus
                     onChange={this.localTitleChange.bind(this)}
                     onPressEnter={this.editTitleComplete.bind(this)}
                     onBlur={this.editTitleComplete.bind(this)} />
            )}
            <Dropdown
              // trigger={['click']}
              // visible={this.state.dropDonwVisible}
              // onVisibleChange={this.onVisibleChange.bind(this)}
              overlay={menu()}>

              <div className={indexstyles.operate}><Icon type="ellipsis" style={{color: '#8c8c8c', fontSize: 20}} /></div>
            </Dropdown>
          </div>
          <div className={indexstyles.contentBody} onScroll={this.contentBodyScroll.bind(this)}>
            {listData.map((value, key) => {
              const { title, id} = value
              return (
                <div key={id} onClick={this.getArticleDetail.bind(this, id)}>
                  <ArticleItem {...this.props} appType={appType} itemValue={value}/>
                </div>
              )
            })}
            {!listData.length && !listData?(
              <div className={indexstyles.nodata} >暂无内容</div>
            ): ('')}
            <div className={indexstyles.Loading} style={{display: loadMoreDisplay }}>{loadMoreText}</div>
          </div>

        </div>

        <PreviewArticleModal {...this.props} modalVisible={this.state.previewArticleModalVisibile} setPreviewArticleModalVisibile={this.setPreviewArticleModalVisibile.bind(this)} />
      </div>
    )
  }


}

