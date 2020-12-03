import React, { Component } from 'react'
import { Menu, Button, Input, message, Modal } from 'antd'
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
export default class NodeOperate extends Component {
  constructor(props) {
    super(props)
    this.state = {
      group_sub_visible: false, //分组
      create_group_visible: false, //新建分组
      group_value: '',
      templist_visible: false
    }
  }

  setTemplistVisible = bool => {
    //流程模板列表显示
    const { templist_visible } = this.state
    this.setState(
      {
        templist_visible: bool //!templist_visible
      },
      () => {
        if (bool) {
          this.setGroupSubShow(false)
        }
      }
    )
  }

  setGroupSubShow = bool => {
    //设置选择分组二级菜单是否显示
    const { group_sub_visible } = this.state
    this.setState(
      {
        group_sub_visible: bool // !group_sub_visible
      },
      () => {
        if (bool) {
          this.setTemplistVisible(false)
        }
      }
    )
  }
  setCreateGroupVisible = bool => {
    //设置新建分组显示
    this.setState({
      create_group_visible: bool
    })
  }

  // ---------分组逻辑-------start
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
        <div className={styles.create_group_top}>
          新建分组
          <div
            className={`${globalStyles.authTheme} ${styles.create_group_top_go}`}
            onClick={() => this.setCreateGroupVisible(false)}
          >
            &#xe7ec;
          </div>
        </div>
        <div className={styles.create_group_middle}>
          <Input
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
            onClick={() => this.addGroup()}
          >
            确认
          </Button>
        </div>
      </div>
    )
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
          onClick={() => this.setCreateGroupVisible(true)}
        >
          <span className={`${globalStyles.authTheme}`}>&#xe782;</span>
          <span>新建分组</span>
        </div>
        {groups.map(item => {
          const { list_id, list_name } = item
          return (
            <div
              title={list_name}
              onClick={() => this.menuItemClick(`group_id_${list_id}`)}
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
      dispatch
    } = this.props
    let node = OutlineTree.getTreeNodeValue(outline_tree, id)
    node.list_id = list_id
    dispatch({
      type: 'gantt/handleOutLineTreeData',
      payload: {
        data: outline_tree
      }
    })
  }
  // ----------分组逻辑--------end+
  // 选择项点击
  menuItemClick = (key, data) => {
    const { setDropVisble = function() {} } = this.props
    setDropVisble(false)
    this.setGroupSubShow(false)
    this.setCreateGroupVisible(false)
    this.setTemplistVisible(false)
    switch (key) {
      case 'add_card':
        this.addCard()
        break
      case 'add_child_card':
        this.addCard(true)
        break
      case 'delete':
        this.delete()
        break
      case 'insert_card':
        this.insertItem({ type: 'card' })
        break
      case 'insert_flow':
        this.insertItem({ type: 'flow', data })
        break
      case 'insert_milestone':
        this.insertItem({ type: 'milestone', data })
        break
      case 'create_child_milestone':
        this.addChildMilestone(true)
        break
      case 'rename':
        if (typeof this.props.editName == 'function') {
          this.props.editName()
        }
        break
      default:
        if (/^group_id_+/.test(key)) {
          //选择任务分组
          const list_id = key.replace('group_id_', '')
          this.relationGroup(list_id)
        }
        break
    }
  }

  delete = () => {
    const {
      nodeValue: { id, tree_type }
    } = this.props
    // this.props.deleteOutLineTreeNode(id)

    Modal.confirm({
      title: '提示',
      content: '确认删除该节点？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        if (tree_type == '1') {
          this.deleteMilestone(id)
        } else if (tree_type == '2') {
          this.deleteCard(id)
        } else if (tree_type == '3') {
          this.deleteWorkFlow(id)
        } else {
        }
      }
    })
  }
  deleteCard = id => {
    deleteTaskVTwo(id).then(res => {
      if (isApiResponseOk(res)) {
        this.props.deleteOutLineTreeNode(id, undefined, res.data)
      } else {
        message.error(res.message)
      }
    })
  }
  deleteMilestone = (id, calback) => {
    requestDeleteMiletone({ id }).then(res => {
      if (isApiResponseOk(res)) {
        this.props.deleteOutLineTreeNode(id)
      } else {
        message.error(res.message)
      }
    })
  }
  deleteWorkFlow = id => {
    workflowDelete({ id }).then(res => {
      if (isApiResponseOk(res)) {
        this.props.deleteOutLineTreeNode(id)
      } else {
        message.error(res.message)
      }
    })
  }
  // 插入节点
  insertItem = async ({ type, data = {} }) => {
    let {
      nodeValue: { parent_id, id },
      outline_tree = [],
      dispatch
    } = this.props
    let target_id = parent_id //|| id
    this.props.onExpand(target_id, true) //展开
    let node = OutlineTree.getTreeNodeValue(outline_tree, target_id)
    let new_children = []
    if (!node) {
      new_children = outline_tree
    } else {
      new_children = node.children
    }
    const index = new_children.findIndex(item => item.id == id)
    if (type == 'card') {
      //插入任务
      new_children.splice(index + 1, 0, {
        ...visual_add_item,
        editing: true,
        add_id: id
      })
    } else if (type == 'flow') {
      //插入流程
      const { id: flow_template_id } = data
      const { id: flow_id, name: flow_name, status } = await this.insertFlow({
        flow_template_id
      })

      if (!flow_id) {
        return
      }
      new_children.splice(index + 1, 0, {
        ...visual_add_item,
        add_id: '',
        tree_type: '3',
        id: flow_id,
        name: flow_name,
        status
      })
    } else if (type == 'milestone') {
      new_children.splice(index + 1, 0, { ...visual_add_item, editing: true })
    }
    if (node) {
      node.children = new_children
    } else {
      outline_tree = new_children
    }
    dispatch({
      type: 'gantt/handleOutLineTreeData',
      payload: {
        data: outline_tree
      }
    })
    if (type == 'flow') {
      // 保存位置
      dispatch({
        type: 'gantt/saveGanttOutlineSort',
        payload: {
          outline_tree
        }
      })
    }
  }
  // 插入流程节点
  insertFlow = async ({ flow_template_id }) => {
    const {
      gantt_board_id,
      nodeValue: { parent_milestone_id }
    } = this.props
    // 插入先预先启动流程，再将流程和里程碑关联上
    const res = await nonAwayTempleteStartPropcess({
      flow_template_id,
      board_id: gantt_board_id,
      start_up_type: '3'
    })
    if (isApiResponseOk(res)) {
      const { id, name } = res.data
      if (!parent_milestone_id) {
        //如果不是挂载在里程碑下面
        return { ...res.data }
        // return { id, name }
      } else {
        const res2 = await boardAppRelaMiletones({
          id: parent_milestone_id,
          rela_id: id,
          origin_type: '2'
        })
        if (isApiResponseOk(res2)) {
          return { ...res.data }
          // return { id, name }
        } else {
          message.error(res.message)
          return {}
        }
      }
    } else {
      message.error(res.message)
      return {}
    }
  }
  // 往后添加
  addCard = create_child => {
    //创建任务分为里程碑创建任务和任务创建同级任务
    const {
      nodeValue: { id, parent_id, tree_type, parent_type, children = [] },
      outline_tree = [],
      dispatch
    } = this.props
    let target_id = id
    let target_name
    // debugger
    if (create_child) {
      //如果是创建子任务
      console.log('sssssssssasdx', 0)
    } else {
      if (tree_type == '1') {
        //如果是里程碑节点创建任务，则是操作children, 否则操作的是父级
        console.log('sssssssssasdx', 1)
      } else {
        console.log('sssssssssasdx', 2)
        target_id = parent_id //创建任务都是创建父级节点里的任务
      }
    }
    this.props.onExpand(target_id, true) //展开
    let node = OutlineTree.getTreeNodeValue(outline_tree, target_id)
    if (!node) {
      return
    }
    let new_children = node.children || []
    // add_id: create_child ? id : parent_id || id
    new_children.push({
      ...visual_add_item,
      editing: true,
      add_id: create_child ? id : parent_id || id
    }) //插入创建的虚拟节点
    node.children = new_children
    // debugger
    dispatch({
      type: 'gantt/handleOutLineTreeData',
      payload: {
        data: outline_tree
      }
    })
  }
  // 创建子里程碑
  addChildMilestone = () => {
    const {
      nodeValue: { id },
      outline_tree = [],
      dispatch
    } = this.props
    let target_id = id
    this.props.onExpand(target_id, true) //展开
    let node = OutlineTree.getTreeNodeValue(outline_tree, target_id)
    console.log('sssssaa_0', target_id, node)
    if (!node) {
      return
    }
    let new_children = node.children || []
    // add_id: create_child ? id : parent_id || id
    new_children.push({ ...visual_add_item, editing: true }) //插入创建的虚拟节点
    node.children = new_children
    console.log('sssssaa_1', node.children)
    // debugger
    dispatch({
      type: 'gantt/handleOutLineTreeData',
      payload: {
        data: outline_tree
      }
    })
  }
  render() {
    const { group_sub_visible, create_group_visible } = this.state
    const { nodeValue = {} } = this.props
    const {
      tree_type,
      parent_type,
      parent_id,
      parent_card_id,
      parent_milestone_id
    } = nodeValue
    return (
      <div className={styles.menu} onWheel={e => e.stopPropagation()}>
        {/* {((tree_type == '2' && parent_type != '2') || tree_type == '1') && ( //只有一级任务选择分组
          <div className={`${styles.menu_item} ${styles.submenu}`}>
            <div
              className={`${styles.menu_item_title}`}
              onClick={() => this.setGroupSubShow(true)}
            >
              选择分组
              <div
                className={`${globalStyles.authTheme} ${styles.menu_item_title_go}`}
              >
                &#xe7eb;
              </div>
            </div>
            {group_sub_visible && (
              <div className={`${styles.submenu_area}`}>
                {create_group_visible
                  ? this.renderCreateGroup()
                  : this.renderGroupList()}
              </div>
            )}
          </div>
        )} */}
        <div
          className={styles.menu_item}
          onClick={() => this.menuItemClick('rename')}
        >
          重命名
        </div>
        {//一级任务是顶级则没有
        tree_type == '1' && (
          <div
            className={styles.menu_item}
            onClick={() => this.menuItemClick('add_card')}
          >
            新建{currentNounPlanFilterName(TASKS)}
          </div>
        )}

        {//一级任务是顶级则没有
        tree_type == '1' && (
          <div
            className={styles.menu_item}
            onClick={() => this.menuItemClick('insert_milestone')}
          >
            插入里程碑
          </div>
        )}
        {//一级里程碑上有
        tree_type == '1' && !parent_milestone_id && (
          <div
            className={styles.menu_item}
            onClick={() => this.menuItemClick('create_child_milestone')}
          >
            新建子里程碑
          </div>
        )}
        {//一级任务是顶级则没有
        (tree_type == '2' || tree_type == '3') && (
          <div
            className={styles.menu_item}
            onClick={() => this.menuItemClick('insert_card')}
          >
            新建同级{currentNounPlanFilterName(TASKS)}
          </div>
        )}

        {(parent_type == '1' || !parent_type) &&
        tree_type == '2' && ( //一级任务才有创建子任务功能
            <div
              className={styles.menu_item}
              onClick={() => this.menuItemClick('add_child_card')}
            >
              新建子级{currentNounPlanFilterName(TASKS)}
            </div>
          )}

        {//一级任务是顶级则没有
        ((tree_type == '2' && !parent_card_id) || tree_type == '3') && (
          <InsertFlows
            menuItemClick={this.menuItemClick}
            templist_visible={this.state.templist_visible}
            setTemplistVisible={this.setTemplistVisible}
          />
          // <div className={styles.menu_item} onClick={() => this.menuItemClick('insert_flow')}>
          //     插入流程
          // </div>
        )}

        <div
          className={styles.menu_item}
          style={{ color: '#F5222D' }}
          onClick={() => this.menuItemClick('delete')}
        >
          删除
        </div>
      </div>
    )
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

@connect(({ gantt: { datas: { proccess_templates = [] } } }) => ({
  proccess_templates
}))
class InsertFlows extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  selectTemp = ({ name, id }) => {
    this.props.menuItemClick('insert_flow', { name, id })
  }
  // 模板列表
  renderTempList = () => {
    const { proccess_templates = [] } = this.props
    return (
      <>
        {proccess_templates.map(item => {
          const { id, name } = item
          return (
            <div
              title={name}
              onClick={() => this.selectTemp({ id, name })}
              className={`${styles.submenu_area_item} ${globalStyles.global_ellipsis}`}
              key={id}
            >
              {name}
            </div>
          )
        })}
      </>
    )
  }
  render() {
    const { templist_visible } = this.props
    return (
      <div className={`${styles.menu_item} ${styles.submenu}`}>
        <div
          className={`${styles.menu_item_title}`}
          onClick={() => this.props.setTemplistVisible(true)}
        >
          插入{currentNounPlanFilterName(FLOWS)}
          <div
            className={`${globalStyles.authTheme} ${styles.menu_item_title_go}`}
          >
            &#xe7eb;
          </div>
        </div>
        {templist_visible && (
          <div className={`${styles.submenu_area}`}>
            {this.renderTempList()}
          </div>
        )}
      </div>
    )
  }
}
