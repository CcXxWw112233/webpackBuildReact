import React from 'react'
import { Dropdown, Input, Icon, Cascader, Menu, message } from 'antd'
import RaletionDrop from './RaletionDrop'
import RaletionList from './RaletionList'
import indexStyles from './index.less'
import SearchUrlRelation from './SearchUrlRelation'
import globalStyles from '../../globalset/css/globalClassName.less'
import { isApiResponseOk } from '../../utils/handleResponseData'
import {
  getRelations,
  JoinRelation,
  deleteRelation
} from '../../services/technological/task'

//内容关联相关
//props link_local 3任务 2流程 21单个流程 22模板单个流程 4文件
export default class ContentRaletion extends React.Component {
  state = {
    isInEditContentRelation: false,
    isInChoose: false,
    isInSearCh: false,
    relations: [],
    local_link_id: ''
  }
  componentDidMount() {
    const { link_id } = this.props
    if (link_id) {
      this.getRelations()
      this.setState({
        local_link_id: link_id
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    const { board_id, link_id, link_local } = nextProps
    const { local_link_id } = this.state
    if (link_id && local_link_id != link_id && local_link_id != '') {
      this.getRelations({ board_id, link_id, link_local })
      this.setState({
        local_link_id: link_id
      })
    }
  }
  async getRelations(data) {
    const { board_id, link_id, link_local } = data || this.props
    const res = await getRelations({
      board_id,
      link_id,
      link_local
    })
    if (isApiResponseOk(res)) {
      this.setState({
        relations: res.data || []
      })
    } else {
      message.warn(res.message)
    }
  }
  async addRelation(data) {
    const res = await JoinRelation(data)
    if (isApiResponseOk(res)) {
      this.getRelations()
    } else {
      message.warn(res.message)
      this.handleRelationContentRepeatError(res)
    }
  }
  handleRelationContentRepeatError = res => {
    const message = '关联内容已存在，请勿重复关联。'
    const isSameMsg = (str1, str2) => str1 === str2
    if (res && res.message && isSameMsg(res.message, message)) {
      message.error(message)
    }
  }
  setIsInEditContentRelation(bool) {
    this.setState({
      isInEditContentRelation: bool,
      isInSearCh: !bool,
      isInChoose: bool
    })
  }
  async handleDeleteRelationItem(data) {
    const res = await deleteRelation(data)
    if (isApiResponseOk(res)) {
      message.success('取消关联成功')
      return this.getRelations()
    }
    message.error('取消关联失败')
  }
  setSearch(bool) {
    this.setState({
      isInEditContentRelation: bool,
      isInSearCh: bool,
      isInChoose: !bool
    })
  }
  render() {
    const {
      isInEditContentRelation,
      isInChoose,
      isInSearCh,
      relations = []
    } = this.state
    const {
      board_id,
      link_id,
      link_local,
      relations_Prefix,
      is_showAdd
    } = this.props
    return (
      <div style={{ width: 'auto' }}>
        {!isInEditContentRelation ? (
          <div
            className={`${indexStyles.contain_6} ${indexStyles.contain_6_2}`}
          >
            {is_showAdd == false ? (
              ''
            ) : (
              <div className={indexStyles.contain_6_add}>
                <Icon type="plus" style={{ marginRight: 4 }} />
                关联内容
              </div>
            )}
            <div className={indexStyles.contain_6_add_2}>
              <div
                className={indexStyles.contain_6_add_2_left}
                onClick={this.setIsInEditContentRelation.bind(this, true)}
              >
                <span
                  className={`${globalStyles.authTheme} ${indexStyles.iconMargin}`}
                >
                  &#xe612;
                </span>
                选择内容
              </div>
              <div className={indexStyles.contain_6_add_2_middle}></div>
              <div
                className={indexStyles.contain_6_add_2_right}
                onClick={this.setSearch.bind(this, true)}
              >
                <span
                  className={`${globalStyles.authTheme} ${indexStyles.iconMargin}`}
                >
                  &#xe611;
                </span>
                搜索内容
              </div>
            </div>
          </div>
        ) : isInChoose ? (
          <div className={indexStyles.contain_6}>
            <RaletionDrop
              relations_Prefix={relations_Prefix}
              board_id={board_id}
              link_id={link_id}
              link_local={link_local}
              addRelation={this.addRelation.bind(this)}
              setIsInEditContentRelation={this.setIsInEditContentRelation.bind(
                this
              )}
            />
          </div>
        ) : (
          <SearchUrlRelation
            setSearch={this.setSearch.bind(this)}
            board_id={board_id}
            link_id={link_id}
            link_local={link_local}
            addRelation={this.addRelation.bind(this)}
          />
        )}
        <RaletionList
          relations={relations}
          handleDeleteRelationItem={this.handleDeleteRelationItem.bind(this)}
        />
      </div>
    )
  }
}
