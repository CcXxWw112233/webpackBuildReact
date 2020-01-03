import React from 'react'
import { Dropdown, Input, Icon, Cascader, Spin } from 'antd'
import { getLinkList, getRelationsSelectionPre } from '../../services/technological/task'
import globalStyles from '../../globalset/css/globalClassName.less'
import {INPUT_CHANGE_SEARCH_TIME} from "../../globalset/js/constant";
import indexStyles from './index.less'
//需要传入的props
// link_id 关联者Id (任务Id，流程Id，流程某一步Id，文件Id。。。)
//link_local 关联者位置 （3任务 2流程 21单个流程 22模板单个流程 4文件）
// setIsInEditContentRelation(bool) 选择之后的回调
//board_id  当前查看项目的项目id
export default class SearchUrlRelation extends React.Component {
  state = {
    inputValue: '',
    searchTimer: null,
    searchLinkList: [],
    spinning: false,
  }
  componentWillMount() {

  }
  gotoRelation(data) {
    const { inputValue } = this.state
    const { link_id, link_local, board_id } = this.props
    const { origin_url, name } = data
    let obj = {
      link_id,
      link_local,
      board_id,
      linked_url: origin_url,
      linked_name: name,
    }
    this.props.addRelation && this.props.addRelation({...obj})

  }

  onChange(e) {
    const that = this
    const value = e.target.value
    this.setState({
      inputValue: value
    })
    //延时调用查询
    const { searchTimer } = this.state
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    this.setState({
      searchTimer: setTimeout(function () {
        //  此处调用请求
        that.getLinkList && that.getLinkList({url: value})
      }, INPUT_CHANGE_SEARCH_TIME)
    })
  }

  blur() {
    const that = this
    setTimeout(function () {
      that.props.setSearch && that.props.setSearch(false)
    }, 300)
  }

  async getLinkList(data) {
    this.setState({
      spinning: true
    })
    const res = await getLinkList(data)
    this.setState({
      spinning: false
    })
    if(res.code == '0') {
      this.setState({
        searchLinkList: [res.data]
      })
    } else {
      const { inputValue } = this.state
      this.setState({
        searchLinkList: [{
          name: inputValue,
          origin_url: inputValue
        }]
      })
    }
  }

  render() {
    const { inputValue, spinning, searchLinkList = [] } = this.state
    // const searchLinkList = [{
    //   name: '百度一下百度一下百度一下百度一下百度一下百度一下百度一下',
    //   icon: 'http://dian-lingxi-public.oss-cn-beijing.aliyuncs.com/2018-12-29/5eae0de80817e6d1160d6cf8f112a311.jpg',
    //   content: '拉萨的卢卡斯的拉萨的卢卡斯的拉萨的卢卡斯的拉萨的卢卡斯的拉萨的卢卡斯的拉萨的卢卡斯的拉萨的卢卡斯的拉萨的卢卡斯的',
    //   origin_url: 'https://www.baidu.com/'
    // }]
    return(
      <div style={{position: 'relative'}}>
        <Input
          autoFocus
          value={inputValue}
          onChange={this.onChange.bind(this)}
          prefix={<span className={`${globalStyles.authTheme}`}>&#xe61d;</span>}
          suffix={<span className={`${globalStyles.authTheme}`}
                        style={{cursor: 'pointer'}}>&#xe611;</span>}
          onBlur={this.blur.bind(this)}
          style={{width: 300, marginTop: 20 }}
        />
        {searchLinkList.length? (
          <div style={{...seachAreaStyles}} >
            <Spin spinning={spinning} size={'small'}>
              {searchLinkList.map((value, key) => {
                const {name, icon, content } = value
                return (
                  <div className={indexStyles.search_item} key={key} onClick={this.gotoRelation.bind(this, value)}>
                    <div className={indexStyles.search_item_left}>
                      {icon?
                        (<img src={icon}/>): (
                          <div className={`${globalStyles.authTheme}`} style={{color: '#1890FF', fontSize: 16}}>&#xe781;</div>)
                      }
                    </div>
                    <div className={indexStyles.search_item_right}>
                      <div className={indexStyles.title}>{name}</div>
                      <div className={indexStyles.description}>{content}</div>
                    </div>
                  </div>
                )
              })
              }
              </Spin>
          </div>
        ):(
          <div style={{...seachAreaStyles}} >
            <Spin spinning={spinning} size={'small'}>
              <div>暂无数据</div>
            </Spin>
          </div>
        )}
      </div>
    )
  }
}
const seachAreaStyles = {
  position: 'absolute',
  top: 60,
  width: 300,
  zIndex: 2,
  height: 'auto',
  padding: 10,
  borderRadius: 4,
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.15)',
  boxShadow: `0px 2px 15px 0px rgba(0,0,0,0.08)`,
  overflow: 'hidden'
}
