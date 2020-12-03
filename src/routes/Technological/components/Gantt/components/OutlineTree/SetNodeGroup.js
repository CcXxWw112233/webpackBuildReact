import React, { Component } from 'react'
import { Menu, Button, Input, message, Modal, Dropdown } from 'antd'
import styles from './nodeOperate.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
import {
  addTaskGroup,
  changeTaskType,
  deleteTask,
  requestDeleteMiletone,
  deleteTaskVTwo,
  boardAppRelaMiletones,
  updateTaskVTwo,
  updateMilestone
} from '../../../../../../services/technological/task'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import OutlineTree from '.'
import { visual_add_item } from '../../constants'
import {
  nonAwayTempleteStartPropcess,
  workflowDelete
} from '../../../../../../services/technological/workFlow'
import { currentNounPlanFilterName } from '../../../../../../utils/businessFunction'
import { TASKS, FLOWS } from '../../../../../../globalset/js/constant'

@connect(mapStateToProps)
export default class SetNodeGroup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      group_sub_visible: false, //分组
      create_group_visible: false, //新建分组
      group_value: ''
    }
  }
  // 获取任务分组列表
  getCardGroups = () => {
    const { gantt_board_id, about_group_boards = [] } = this.props
    const item =
      about_group_boards.find(item => item.board_id == gantt_board_id) || {}
    const { list_data = [] } = item
    return list_data
  }
  // 创建分组的区域
  renderCreateGroup = () => {
    const { group_value } = this.state
    return (
      <div className={styles.create_group}>
        <div
          className={styles.create_group_top}
          onClick={e => e.stopPropagation()}
        >
          新建分组
          <div
            className={`${globalStyles.authTheme} ${styles.create_group_top_go}`}
            onClick={e => {
              e.stopPropagation()
              this.setCreateGroupVisible(false)
            }}
          >
            &#xe7ec;
          </div>
        </div>
        <div className={styles.create_group_middle}>
          <Input
            onClick={e => e.stopPropagation()}
            placeholder={'请输入分组标题'}
            value={group_value}
            onChange={this.groupValueChange}
          />
        </div>
        <div className={styles.create_group_bott}>
          <Button
            disabled={!!!group_value}
            style={{ width: '100%' }}
            type={'primary'}
            onClick={e => {
              e.stopPropagation()
              this.addGroup()
            }}
          >
            确认
          </Button>
        </div>
      </div>
    )
  }
  //设置选择分组二级菜单是否显示
  setGroupSubShow = bool => {
    this.setState({
      group_sub_visible: bool // !group_sub_visible
    })
  }
  //设置新建分组显示
  setCreateGroupVisible = bool => {
    this.setState({
      create_group_visible: bool
    })
  }
  setGroupList = list_id => {
    this.setGroupSubShow(false)
    this.setCreateGroupVisible(false)
    this.relationGroup(list_id)
  }
  // 分组列表
  renderGroupList = () => {
    const {
      nodeValue: { list_id: selected_list_id }
    } = this.props
    const groups = this.getCardGroups()
    return (
      <>
        <div
          className={`${styles.submenu_area_item} ${styles.submenu_area_item_create}`}
          onClick={e => {
            e.stopPropagation()
            this.setCreateGroupVisible(true)
          }}
        >
          <span className={`${globalStyles.authTheme}`}>&#xe782;</span>
          <span>新建分组</span>
        </div>
        {groups.map(item => {
          const { list_id, list_name } = item
          return (
            <div
              title={list_name}
              onClick={e => {
                e.stopPropagation()
                this.setGroupList(`${list_id}`)
              }}
              className={`${styles.submenu_area_item} `}
              key={list_id}
            >
              <div className={`${styles.name} ${globalStyles.global_ellipsis}`}>
                {list_name}
              </div>
              <div
                style={{
                  display: selected_list_id == list_id ? 'block' : 'none'
                }}
                className={`${globalStyles.authTheme} ${styles.check}`}
              >
                &#xe7fc;
              </div>
            </div>
          )
        })}
      </>
    )
  }
  //分组名输入
  groupValueChange = e => {
    const { value } = e.target
    this.setState({
      group_value: value
    })
  }
  addGroup = () => {
    const { gantt_board_id } = this.props
    const { group_value } = this.state
    const params = {
      board_id: gantt_board_id,
      name: group_value
    }
    addTaskGroup({ ...params }).then(res => {
      if (isApiResponseOk(res)) {
        const { id, name } = res.data
        const obj = {
          list_id: id,
          list_name: name
        }
        this.addGroupCalback(obj)
        message.success('创建分组成功')
        this.setCreateGroupVisible(false)
      } else {
        message.error(res.message)
      }
    })
    this.setState({
      group_value: ''
    })
  }
  addGroupCalback = arg => {
    const { dispatch, about_group_boards = [], gantt_board_id } = this.props
    const arr = [...about_group_boards]
    const index = arr.findIndex(item => item.board_id == gantt_board_id)
    arr[index].list_data.push({ ...arg })
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        about_group_boards: arr
      }
    })
  }
  relationGroup = list_id => {
    const {
      gantt_board_id,
      nodeValue: { id, list_id: selected_list_id },
      nodeValue: { tree_type }
    } = this.props
    let params = {
      list_id
    }
    const is_cancle = list_id == selected_list_id
    if (is_cancle) params.list_id = '0'
    if (tree_type == '1') {
      params = { ...params, id }
    } else {
      params = {
        ...params,
        board_id: gantt_board_id,
        card_id: id
      }
    }
    const func = tree_type == '1' ? updateMilestone : updateTaskVTwo
    func({ ...params }, { isNotLoading: false }).then(res => {
      if (isApiResponseOk(res)) {
        message.success(!is_cancle ? '关联分组成功' : '已取消关联')
        this.setRelationGroupId({ list_id: params.list_id })
      } else {
        message.error(res.message)
      }
    })
  }
  setRelationGroupId = ({ list_id }) => {
    let {
      nodeValue: { id },
      outline_tree = [],
      dispatch,
      nodeValue: { tree_type }
    } = this.props
    let node = OutlineTree.getTreeNodeValue(outline_tree, id)
    node.list_id = list_id
    // 父任务下所有子任务的分组和父任务一致
    if (tree_type == '2') {
      if (node.children) {
        node.children = node.children.map(item => {
          item.list_id = list_id
          return item
        })
      }
    }
    dispatch({
      type: 'gantt/handleOutLineTreeData',
      payload: {
        data: outline_tree
      }
    })
  }
  // ----------分组逻辑--------end+

  renderName = () => {
    const {
      nodeValue: { list_id: selected_list_id }
    } = this.props
    const groups = this.getCardGroups()
    return groups.find(item => item.list_id == selected_list_id)?.list_name
  }
  renderDrop = () => {
    const { create_group_visible, group_value } = this.state
    return (
      <Dropdown
        trigger={['click']}
        overlay={
          <div className={`${styles.submenu_area} ${styles.submenu_area2}`}>
            {create_group_visible
              ? this.renderCreateGroup()
              : this.renderGroupList()}
          </div>
        }
      >
        <div>
          {this.renderName() || (
            <span style={{ color: 'rgba(0,0,0,.15)' }}>未选择</span>
          )}
        </div>
      </Dropdown>
    )
  }
  renderTarget = () => {
    const {
      nodeValue: { tree_type, parent_card_id }
    } = this.props
    let vdom = ''
    if (tree_type == '3') {
      vdom = (
        <div>
          <span style={{ color: 'rgba(0,0,0,.25)' }}>--</span>
        </div>
      )
    } else if (tree_type == '2' && !!parent_card_id) {
      vdom = (
        <div>
          {this.renderName() || (
            <span style={{ color: 'rgba(0,0,0,.25)' }}>--</span>
          )}
        </div>
      )
    } else {
      vdom = this.renderDrop()
    }
    return vdom
  }
  render() {
    // 子任务和流程没有分组，子任务分组跟随父类任务
    return this.renderTarget()
  }
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  gantt: {
    datas: { gantt_board_id, about_group_boards = [], outline_tree = [] }
  },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  }
}) {
  return {
    gantt_board_id,
    projectDetailInfoData,
    about_group_boards,
    outline_tree
  }
}
