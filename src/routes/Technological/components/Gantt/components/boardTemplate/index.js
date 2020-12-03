import React, { Component } from 'react'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { date_area_height, ganttIsSingleBoardGroupView } from '../../constants'
import { Menu, message, Tree, Icon, Spin, Button, Popover, Input } from 'antd'
import { connect } from 'dva'
import {
  getBoardTemplateList,
  getBoardTemplateInfo,
  createCardByTemplate,
  importBoardTemplate,
  getBoardTempleteShareCode,
  generateTempleteWithShareCode
} from '../../../../../../services/technological/gantt'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import { createMilestone } from '../../../../../../services/technological/prjectDetail'
import {
  getGlobalData,
  checkIsHasPermissionInBoard,
  getOrgIdByBoardId
} from '../../../../../../utils/businessFunction'
import BoardTemplateManager from '@/routes/organizationManager/projectTempleteScheme/index.js'
import SafeConfirmModal from '../SafeConfirmModal'
import {
  PROJECT_TEAM_CARD_CREATE,
  PROJECT_TEAM_BOARD_MILESTONE,
  NOT_HAS_PERMISION_COMFIRN
} from '../../../../../../globalset/js/constant'
import { transformTimestamp } from '../../../../../../utils/util'
import { getXYDropPosition, getDropListPosition } from '../../ganttBusiness'
import { getTreeNodeValue } from '../../../../../../models/technological/workbench/gantt/gantt_utils'

const MenuItem = Menu.Item
const TreeNode = Tree.TreeNode

@connect(mapStateToProps)
export default class BoardTemplate extends Component {
  constructor(props) {
    super(props)
    const { gantt_card_height } = this.props
    this.state = {
      show_type: '0', // 0 1 2 //默认关闭 / 出现动画 / 隐藏动画
      drag_node_data: {
        data_id: '',
        data_type: '',
        data_name: ''
      },
      spinning: false,
      selected_template_id: '',
      selected_template_name: '请选择模板',
      template_list: [],
      template_data: [], //模板数据
      contain_height: gantt_card_height,
      checkedKeys: [], //已选择的key
      checkedKeysObj: [], ////已选择的keyobj
      selectedTpl: {},
      template_origin: '2', //0 || 2 平台或自有

      templete_share_visible: false, // 分享码显示隐藏
      templete_share_id: '', // 当前点击的分享ID
      share_content: '', // 分享码 code
      inputValue: '' // 输入内容
    }
    this.drag_init_inner_html = ''
    this.current_panel = ''
  }
  getHeight = () => {
    const target = document.getElementById('gantt_card_out_middle')
    // if (target) {
    //     return target.clientHeight + 30
    //     // return target.clientHeight - date_area_height
    // }
    // return '100%'
    const { gantt_card_height } = this.props
    // console.log('gantt_card_height', gantt_card_height)
    this.setState({
      // contain_height: target ? target.clientHeight + 30 : '100%'
      contain_height: gantt_card_height || '100%'
    })
  }
  // 初始化数据
  initState = is_new_board => {
    this.setState({
      show_type: is_new_board ? '1' : '0', // 0 1 2 //默认关闭 / 出现动画 / 隐藏动画
      drag_node_data: {
        data_id: '',
        data_type: '',
        data_name: ''
      },
      selected_template_id: '', //已选择的项目模板
      selected_template_name: '请选择模板',
      template_list: [],
      template_data: [], //模板数据
      templete_share_visible: false, // 分享码显示隐藏
      templete_share_id: '', // 当前点击的分享ID
      share_content: '', // 分享码 code
      inputValue: ''
    })
  }
  componentDidMount() {
    this.initState(this.props.is_new_board)
    this.getBoardTemplateList()
    this.listenDrag()
    this.getHeight()
    window.addEventListener('resize', this.getHeight, false)
  }
  componentWillReceiveProps(nextProps) {
    const { gantt_board_id: last_gantt_board_id } = this.props
    const { gantt_board_id: next_gantt_board_id, is_new_board } = nextProps
    if (
      last_gantt_board_id != next_gantt_board_id &&
      next_gantt_board_id != '0'
    ) {
      //当项目变化并且进入具体项目时
      this.initState(is_new_board)
      this.getBoardTemplateList()
    }
    this.listenGetBoardTemplateList(nextProps)
  }
  componentWillUnmount() {
    this.removeEvent()
    window.addEventListener('resize', this.getHeight, false)
  }

  // 选择模板类型
  selectTemplateType = template_origin => {
    const { template_origin: template_origin_od } = this.state
    if (template_origin == template_origin_od) return
    this.setState(
      {
        template_origin
      },
      () => {
        this.getBoardTemplateList()
      }
    )
  }
  listenGetBoardTemplateList = nextProps => {
    const { dispatch, triggle_request_board_template } = this.props
    const { template_origin } = this.state
    // console.log('triggle_request_board_template', nextProps.triggle_request_board_template, triggle_request_board_template, template_origin)
    // 保存模板时触发
    if (
      nextProps.triggle_request_board_template !=
        triggle_request_board_template &&
      nextProps.triggle_request_board_template &&
      template_origin == '2'
    ) {
      dispatch({
        type: 'gantt/updateDatas',
        payload: {
          triggle_request_board_template: false
        }
      })
      this.getBoardTemplateList()
    }
  }

  // 获取模板列表
  getBoardTemplateList = async () => {
    const OrganizationId = localStorage.getItem('OrganizationId')
    const aboutBoardOrganizationId = getGlobalData('aboutBoardOrganizationId')
    if (
      !OrganizationId ||
      (OrganizationId == '0' &&
        (!aboutBoardOrganizationId || aboutBoardOrganizationId == '0'))
    ) {
      return
    }
    const _organization_id =
      OrganizationId != '0' ? OrganizationId : aboutBoardOrganizationId
    const { template_origin } = this.state
    const res = await getBoardTemplateList({
      _organization_id,
      type: template_origin
    })
    if (isApiResponseOk(res)) {
      const { data } = res
      this.setState({
        template_list: data
      })
      const { selected_template_id } = this.state
      if (!!selected_template_id) {
        this.getTemplateInfo(selected_template_id)
        this.setState({
          selected_template_name:
            (data.find(item => item.id == selected_template_id) || {}).name ||
            '请选择模板'
        })
        return
      }
      // if (data && data.length) {
      //     this.setState({
      //         selected_template_name: data[0].name,
      //         selected_template_id: data[0].id
      //     })
      //     if (data.length) {
      //         this.getTemplateInfo(data[0].id)
      //     }
      // }
    } else {
      message.error(res.message)
    }
  }
  // 获取特定模板内容
  getTemplateInfo = async template_id => {
    this.setState({
      spinning: true
    })
    const res = await getBoardTemplateInfo({ template_id })
    this.setState({
      spinning: false
    })
    if (isApiResponseOk(res)) {
      this.setState({
        template_data: res.data
      })
      this.initSetCheckKeys(res.data)
    } else {
      message.error(res.message)
    }
  }
  // 是否显示去到组织管理的界面
  isShowSetting = () => {
    const OrganizationId = localStorage.getItem('OrganizationId')
    return true //OrganizationId && (OrganizationId != '0')
  }
  // 去到新建的管理后台界面
  routingJumpToOrgManager = () => {
    const { dispatch } = this.props
    this.setProjectTempleteSchemeModal() //全组织下
    return
    if (localStorage.getItem('OrganizationId') == '0') {
      this.setProjectTempleteSchemeModal() //全组织下
      return
    }
    if (
      window.location.hash.indexOf('/technological/simplemode/workbench') != -1
    ) {
      window.sessionStorage.setItem('simplemode_home_open_key', 'org')
      window.sessionStorage.setItem('orgManagerTabSelectKey', '6')
      dispatch({
        type: 'technological/routingJump',
        payload: {
          route: `/technological/simplemode/home`
        }
      })
    } else {
      window.sessionStorage.setItem('orgManagerTabSelectKey', '6')
      dispatch({
        type: 'technological/routingJump',
        payload: {
          route: `/organizationManager?nextpath=${window.location.hash.replace(
            '#',
            ''
          )}`
        }
      })
    }
  }
  selectTemplate = e => {
    const { key } = e
    const { template_list = [] } = this.state
    if ('0_0' == key) {
      this.routingJumpToOrgManager()
    } else {
      this.setState({
        selected_template_id: key,
        selected_template_name:
          template_list.find(item => item.id == key).name || '请选择模板'
      })
      this.getTemplateInfo(key)
    }
  }

  selectBoardTemplate = id => {
    if (id) {
      const { template_list = [] } = this.state
      this.setState({
        selected_template_id: id,
        selected_template_name:
          template_list.find(item => item.id == id).name || '请选择模板'
      })
      this.getTemplateInfo(id)
    } else {
      this.setState({
        selected_template_id: 0,
        selected_template_name: ''
      })
    }
  }
  // 设置管理模板弹窗是否出现
  setProjectTempleteSchemeModal = () => {
    const { project_templete_scheme_visible } = this.state
    if (!!project_templete_scheme_visible) {
      this.getBoardTemplateList()
    }
    this.setState({
      project_templete_scheme_visible: !project_templete_scheme_visible
    })
  }

  renderTemplateList = () => {
    const { template_list = [] } = this.state
    return (
      <Menu onClick={this.selectTemplate}>
        {/* {
                    this.isShowSetting() &&
                    (
                        <MenuItem key={`0_0`} style={{ color: '#1890FF' }}>
                            <i className={globalStyles.authTheme}>&#xe8fe;</i>
                            &nbsp;
                             新建方案
                        </MenuItem>
                    )
                } */}
        {template_list.map(item => {
          const { id, name } = item
          return (
            <MenuItem
              key={`${id}`}
              className={globalStyles.global_ellipsis}
              style={{ width: 216 }}
            >
              {name}
            </MenuItem>
          )
        })}
      </Menu>
    )
  }
  renderTreeItemName = ({
    template_data_type,
    name,
    parent_content_length = 0,
    parrent_name
  }) => {
    let icon = ''
    if (template_data_type == '1') {
      icon = (
        <div
          className={`${globalStyles.authTheme} main_can_drag_flag`}
          style={{ color: '#FAAD14', fontSize: 18, marginRight: 6 }}
        >
          &#xe6ef;
        </div>
      )
    } else if (template_data_type == '2') {
      icon = (
        <div
          className={`${globalStyles.authTheme} main_can_drag_flag`}
          style={{ color: '#18B2FF', fontSize: 18, marginRight: 6 }}
        >
          &#xe6f0;
        </div>
      )
    } else {
      icon = (
        <div
          className={`${globalStyles.authTheme} main_can_drag_flag`}
          style={{ color: '#7CB305', fontSize: 20, marginRight: 6 }}
        >
          &#xe629;
        </div>
      )
    }
    return (
      <div
        className={`main_can_drag_flag`}
        title={name}
        style={{ display: 'flex', alignItems: 'center' }}
        data-propertype={template_data_type}
        data-properlength={parent_content_length}
        data-propername={parrent_name}
      >
        {icon}
        <div
          style={{ maxWidth: 112 }}
          className={`${globalStyles.global_ellipsis} main_can_drag_flag`}
        >
          {name}
        </div>
      </div>
    )
  }
  // 渲染树
  renderTemplateTree = (
    data,
    parent_type,
    parrent_id,
    parrent_name,
    parent_content_length = 0
  ) => {
    const is_child_task = parent_type == '2'
    return data.map(item => {
      const {
        name,
        template_data_type,
        child_content = [],
        id,
        time_span
      } = item
      const params = {
        template_data_type,
        name,
        parrent_name: is_child_task ? parrent_name : name,
        parent_content_length: is_child_task
          ? parent_content_length
          : child_content.length //如果是父类任务，就取子任务长度，如果是子任务，就取父类任务的全部子任务长度
      }
      const { time_span: data_time_span } =
        getTreeNodeValue(this.state.template_data, parrent_id) || {} //统一取父的time_span,
      if (child_content) {
        return (
          <TreeNode
            data_type={template_data_type}
            data_id={is_child_task ? parrent_id : id} //当父级是任务的时候，默认存储的是父类任务
            data_name={is_child_task ? parrent_name : name}
            data_time_span={data_time_span || time_span} //父任务挂载在里程碑下，里程碑是没有time_span，所以取自己的time_span, 子任务取父任务的time_span
            icon={<i className={globalStyles.authTheme}>&#xe6f0;</i>}
            key={id}
            title={this.renderTreeItemName(params)}
            selectable={false}
          >
            {this.renderTemplateTree(
              child_content,
              template_data_type,
              id,
              name,
              child_content.length
            )}
          </TreeNode>
        )
      }
      return (
        <TreeNode
          data_type={template_data_type}
          data_id={id}
          data_name={is_child_task ? parrent_name : name}
          data_time_span={data_time_span || time_span} //父任务挂载在里程碑下，里程碑是没有time_span，所以取自己的time_span, 子任务取父任务的time_span
          key={id}
          title={this.renderTreeItemName(params)}
          selectable={false}
          icon={
            <Icon
              type="caret-down"
              style={{ fontSize: 20, color: 'rgba(0,0,0,.45)' }}
            />
          }
        />
      )
    })
  }
  setShowType = () => {
    const { show_type } = this.state
    let new_type
    if ('0' == show_type) {
      new_type = '1'
    } else if ('1' == show_type) {
      new_type = '2'
    } else if ('2' == show_type) {
      new_type = '1'
    } else {
    }
    this.setState({
      show_type: new_type
    })
  }
  // 渲染拖拽时子任务
  renderChildTaskUI = ({ propername, properlength, node_width = 130 }) => {
    const task_icon = document.getElementById('save_child_card_icon')
      .children[0].className //编译后的iconfont classname
    // console.log('ssssss_propername', propername)
    let string =
      '<div style="display: flex; align-items: center; min-width:' +
      node_width +
      'px">' +
      '<div style="display: flex; align-items: center;">' +
      '<div class="' +
      task_icon +
      '" style="color: rgb(24, 178, 255); font-size: 18px; margin-right: 6px;">' +
      '' +
      '</div>' +
      '<div>' +
      propername +
      '</div>' +
      '</div>' +
      '<div>' +
      `${
        properlength > 0
          ? '&nbsp; ' + '&nbsp;' + '等' + properlength + '项'
          : ''
      }` +
      '</div>' +
      '</div>'
    // string= '<div>asda</div>'
    return string
  }
  // ==================拖拽任务start
  // 处理document的drag事件
  listenDrag = () => {
    // const that = this
    // let drag_init_inner_html = '' //用来存储所拖拽的对象的内容

    document.body.addEventListener('dragstart', this.dragstart)
    //在拖动元素的同时,改变输出文本的颜色
    // document.addEventListener("drag", function (event) {
    // });
    // 当拖完p元素输出一些文本元素和重置透明度
    document.body.addEventListener('dragend', this.dragend)
    /* 拖动完成后触发 */
    // 当p元素完成拖动进入droptarget,改变div的边框样式
    // document.addEventListener("dragenter", function (event) {
    // });
    // 默认情况下,数据/元素不能在其他元素中被拖放。对于drop我们必须防止元素的默认处理
    document.body.addEventListener('dragover', this.dragover)
    // 当可拖放的p元素离开droptarget，重置div的边框样式
    // document.addEventListener("dragleave", function (event) { });
    /*对于drop,防止浏览器的默认处理数据(在drop中链接是默认打开)*/
    document.body.addEventListener('drop', this.drop)
  }
  removeEvent = () => {
    document.body.removeEventListener('dragstart', this.dragstart)
    document.body.removeEventListener('dragend', this.dragend)
    document.body.removeEventListener('dragover', this.dragover)
    document.body.removeEventListener('drop', this.drop)
  }
  onDragStart = ({ node }) => {
    this.current_panel = 'board_templete'
    const { data_id, data_type, data_name, data_time_span } = node.props
    this.setState({
      drag_node_data: {
        data_id,
        data_type,
        data_name,
        data_time_span
      }
    })
  }
  onDrop = () => {
    this.current_panel = ''
  }
  dragstart = event => {
    // console.log('sssssssssssss', 'dragstart')
    const drag_target = event.target
    // event.target.style.opacity = "0";
    if (!event) return
    if (!drag_target) return
    if (!drag_target.children) return
    if (!drag_target.children[0]) return
    if (!drag_target.children[0].children) return
    if (!drag_target.children[0].children[0]) return
    this.drag_init_inner_html = event.target.innerHTML

    const { propername, propertype, properlength } =
      event.target.children[0].children[0].dataset || {} //存储在渲染名称的ui里面，拖拽的时候拿出来，做改变ui（仅限于子任务）
    if (propertype == '2') {
      //当拖拽的是子任务的话，需要改变节点内容为 （‘父任务名称+父任务下的子任务个数’）
      event.target.innerHTML = this.renderChildTaskUI({
        propername,
        propertype,
        properlength,
        node_width: event.target.clientWidth - 10
      })
      setTimeout(() => {
        event.target.innerHTML = this.drag_init_inner_html
      }, 100)
    }
  }
  dragenter = event => {
    // console.log('sssssssssssss', 'dragstart')
  }
  dragleave = event => {
    // console.log('sssssssssssss', 'dragleave')
  }
  dragover = event => {
    // console.log('sssssssssssss', 'dragover')
    event.preventDefault()
  }
  dragend = event => {
    // console.log('sssssssssssss', 'dragend')
    if (!event) return
    if (!event.target) return
    if (!event.target.style) return
    event.target.style.opacity = '1'
  }
  drop = event => {
    // console.log('sssssssssssss', 'drop')
    if (this.current_panel != 'board_templete') return
    if (!event) return
    if (!event.target) return
    if (!event.target.className) return
    event.preventDefault()
    try {
      const { gantt_head_width } = this.props
      if (event.target.id == 'gantt_svg_area') {
        const { x, y } = getXYDropPosition(event, { gantt_head_width })
        const {
          ceilWidth,
          group_list_area_section_height,
          date_arr_one_level = [],
          list_group = []
        } = this.props
        // 得到下落的分组位置
        let { group_list_index, belong_group_row } = getDropListPosition({
          group_list_area_section_height,
          position_top: y - 24
        })

        // 获取下落分组的元素
        let { lane_id } = list_group[group_list_index]
        // 获取下落的日期位置
        let date_position = parseInt(x / ceilWidth)

        let { timestamp, timestampEnd } = date_arr_one_level[date_position]
        // console.log('进来了');
        if (!lane_id || !timestamp || !timestampEnd) return
        this.handleDragCompleted({
          list_id: lane_id,
          start_time: timestamp,
          end_time: timestampEnd,
          belong_group_row
        })
        this.current_panel = ''
      } else if (event.target.className.indexOf('ganttDetailItem') != -1) {
        const { list_id, start_time, end_time } = event.target.dataset
        if (!list_id || !start_time || !end_time) return
        this.handleDragCompleted({ list_id, start_time, end_time })
        this.current_panel = ''
      } else {
      }
    } catch (err) {
      // console.log(err)
    }
  }
  // =================拖拽任务end

  handleDragCompleted = ({
    list_id,
    start_time,
    end_time,
    belong_group_row
  }) => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        current_list_group_id: list_id
      }
    })
    const {
      drag_node_data: { data_type }
    } = this.state
    // console.log('sssss_目标位置', { list_id, start_time, end_time })
    // console.log('sssss_拖动对象', drag_node_data)
    if (data_type == '1') {
      this.createMilestone({ end_time })
    } else if (data_type == '2') {
      this.createCard({ list_id, start_time, end_time, belong_group_row })
    } else {
    }
  }
  // 创建里程碑
  createMilestone = async ({ end_time }) => {
    const { dispatch, gantt_board_id } = this.props
    if (
      !checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MILESTONE, gantt_board_id)
    ) {
      message.warn(NOT_HAS_PERMISION_COMFIRN)
      return
    }
    const {
      drag_node_data: { data_name }
    } = this.state
    const params = {
      board_id: gantt_board_id,
      deadline: end_time,
      name: data_name
    }
    if (!end_time) {
      return
    }
    const res = await createMilestone(params)
    if (isApiResponseOk(res)) {
      dispatch({
        type: 'gantt/getGttMilestoneList',
        payload: {}
      })
    } else {
      message.error(res.message)
    }
  }
  // 创建任务
  createCard = async ({ list_id, start_time, end_time, belong_group_row }) => {
    const {
      dispatch,
      gantt_board_id,
      group_view_type,
      gantt_board_list_id
    } = this.props
    if (
      !checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_CREATE, gantt_board_id)
    ) {
      message.warn(NOT_HAS_PERMISION_COMFIRN)
      return
    }
    const {
      drag_node_data: { data_id, data_time_span = 1 }
    } = this.state
    const due_time =
      transformTimestamp(start_time) +
      data_time_span * 24 * 60 * 60 * 1000 -
      1000
    const params = {
      board_id: gantt_board_id,
      content_id: data_id,
      due_time,
      start_time,
      list_id: list_id != '0' ? list_id : ''
    }
    if (group_view_type == '5') {
      //分组下=》成员视图下
      params.list_id = gantt_board_list_id
      if (list_id && list_id != '0') {
        params.users = list_id
      }
    }
    if (ganttIsSingleBoardGroupView({ gantt_board_id, group_view_type })) {
      params.row = belong_group_row
    }
    // console.log('sssssparams', params)
    const res = await createCardByTemplate({ ...params })
    if (isApiResponseOk(res)) {
      this.props.insertTaskToListGroup &&
        this.props.insertTaskToListGroup({ ...params, ...res.data }) //创建任务后，返回的数据手动插入
    } else {
      message.error(res.message)
    }
  }

  // 外部拖拽时
  outerMouseDown = e => {
    //在树组件区域内拖动时，如果没有选中某一个选项就直接在空白区域拖动，会产生拖动多个元素的影像
    const { className } = e.target
    if (!className || typeof className != 'string') {
      e.preventDefault()
      return
    }
    const is_tree_node_drag = className.indexOf('main_can_drag_flag') == -1
    if (is_tree_node_drag) {
      e.preventDefault()
      return
    }
  }

  // 复选框
  onCheck = e => {
    this.setState({
      checkedKeys: e
    })
  }
  // 初始化设置已选择
  initSetCheckKeys = () => {
    const { template_data = [] } = this.state
    // 将数据平铺
    let arr = []
    const recusion = obj => {
      //将树递归平铺成一级
      arr.push(obj)
      if (!obj.child_content) {
        return
      } else {
        if (obj.child_content.length) {
          for (let val of obj.child_content) {
            recusion(val)
          }
        }
      }
    }
    for (let val of template_data) {
      recusion(val)
    }
    const checkedKeys = arr.map(item => item.id)
    const checkedKeysObj = arr.map(item => {
      return {
        id: item.id,
        parent_id: item.parent_id,
        name: item.name
      }
    })
    this.setState({
      checkedKeys,
      checkedKeysObj
    })
  }

  // 引用到项目
  quoteTemplate = () => {
    const { checkedKeys, checkedKeysObj, template_data = [] } = this.state
    let new_checkedKeys = [...checkedKeys]
    // console.log('ssssssssss_0', checkedKeysObj)
    // 将里程碑id和任务id拆分开来
    let milestone_ids = checkedKeys.filter(
      item =>
        checkedKeysObj.findIndex(
          item2 => item == item2.id && item2.parent_id == '0'
        ) != -1
    )
    let card_ids = checkedKeys.filter(
      item =>
        checkedKeysObj.findIndex(
          item2 => item == item2.id && item2.parent_id != '0'
        ) != -1
    )
    let card_ids_objs = checkedKeysObj.filter(
      item => card_ids.findIndex(item2 => item2 == item.id) != -1
    )
    let arr = [] //装载
    for (let val of template_data) {
      const child_content_1 = val.child_content
      const id_1 = val.id
      let flag = false
      if (child_content_1.length) {
        for (let val2 of child_content_1) {
          const id_2 = val2.id
          if (card_ids_objs.findIndex(item => item.parent_id == id_2) != -1) {
            arr.push(id_2)
            flag = true
          }
        }
      }
      if (
        flag ||
        card_ids_objs.findIndex(item => item.parent_id == id_1) != -1
      ) {
        arr.push(id_1)
      }
    }

    new_checkedKeys = Array.from(new Set([].concat(new_checkedKeys, arr)))
    let abs = checkedKeysObj.filter(
      item => new_checkedKeys.findIndex(item2 => item2 == item.id) != -1
    )

    //最终所需要数据
    milestone_ids = new_checkedKeys.filter(
      item =>
        abs.findIndex(item2 => item == item2.id && item2.parent_id == '0') != -1
    )
    card_ids = new_checkedKeys.filter(
      item =>
        abs.findIndex(item2 => item == item2.id && item2.parent_id != '0') != -1
    )
    // console.log('new_checkedKeys', checkedKeys, new_checkedKeys)
    const { gantt_board_id, dispatch } = this.props
    const params = {
      board_id: gantt_board_id,
      template_id: template_data[0].template_id,
      select_ids: new_checkedKeys
      // milestone_ids,
      // card_ids
    }
    importBoardTemplate(params)
      .then(res => {
        if (isApiResponseOk(res)) {
          dispatch({
            type: 'gantt/getGanttData',
            payload: {}
          })
        } else {
          message.error(res.message)
        }
      })
      .catch(err => {
        message.error('引入模板失败')
      })
  }

  changeSafeConfirmModalVisible = () => {
    this.setState({
      safeConfirmModalVisible: !this.state.safeConfirmModalVisible
    })
  }

  openImportBoardModal = tplId => {
    const { outline_tree = [], group_view_type } = this.props
    const { template_list } = this.state
    if (group_view_type == '4' && !outline_tree.length) {
      this.onImportBoardTemplate()
      return
    }
    const selectedTpl = template_list.find(item => item.id == tplId)
    this.setState({
      safeConfirmModalVisible: true,
      selectedTpl
    })
  }

  onImportBoardTemplate = () => {
    this.quoteTemplate()
    const { dispatch, outline_tree } = this.props
    let startPlanType = 1
    if (outline_tree && outline_tree.length > 0) {
      startPlanType = -1
    }
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        startPlanType,
        get_gantt_data_loaded: false
      }
    })
  }

  toggleBoardTemplateDrawer = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        boardTemplateShow: this.props.boardTemplateShow == 1 ? 2 : 1
      }
    })
  }

  // 获取可复制内容
  getCopyTextValue = id => {
    let copyBtn = document.getElementById(`templete_share_${id}`)
    if (!copyBtn) return
    let copyText = copyBtn.innerText
    return copyText
  }

  copyContentToClipTemplete = content => {
    if (!content) {
      message.error('没有可复制内容')
    }
    const input = document.createElement('input')
    //ios 呼出虚拟键盘，造成屏幕闪烁一下
    input.setAttribute('readonly', 'readyonly')
    input.setAttribute('value', content)
    document.body.appendChild(input)
    input.setSelectionRange(0, 9999)
    input.select()
    if (document.execCommand('copy')) {
      document.execCommand('copy')
      // message.success('复制成功')
    }
    document.body.removeChild(input)
  }

  getBoardTempleteShareCode = id => {
    getBoardTempleteShareCode({ template_id: id }).then(res => {
      if (isApiResponseOk(res)) {
        if (this.state.templete_share_visible) {
          this.setState({
            templete_share_id: id,
            share_content: res.data
          })
          this.copyContentToClipTemplete(res.data)
        }
      } else {
        message.warn(res.message)
      }
    })
  }

  // 一次性提取码
  handleDisposableCode = async (e, id) => {
    e && e.stopPropagation()
    await this.getBoardTempleteShareCode(id)
  }

  // 控制模板分享窗口显示隐藏
  onTempleteShareVisibleChange = visible => {
    this.setState({
      templete_share_visible: visible
    })
    if (!visible) {
      this.setState({
        templete_share_id: '',
        share_content: ''
      })
    }
  }

  // 取消
  onCancelTempleteShareVisble = e => {
    e && e.stopPropagation()
    this.setState({
      templete_share_visible: false
    })
  }

  // 输入框事件
  handleInputChange = e => {
    let value = e.target.value
    console.log(value)
    this.setState({
      inputValue: value
    })
  }

  // 点击确定事件
  handlePickUpTemplete = () => {
    const { gantt_board_id } = this.props
    const { inputValue } = this.state
    const ogr_id = getOrgIdByBoardId(gantt_board_id)
    if (!ogr_id) return
    generateTempleteWithShareCode({
      share_code: inputValue,
      _organization_id: ogr_id
    }).then(res => {
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('提取模板成功')
        }, 200)
        this.getBoardTemplateList()
        this.setState({
          inputValue: ''
        })
      } else {
        message.warn(res.message)
        this.setState({
          inputValue: ''
        })
      }
    })
  }

  handlePickUpTempleteVisible = visible => {
    if (!visible) {
      this.setState({
        inputValue: ''
      })
    }
  }

  render() {
    const {
      template_origin,
      template_data,
      selected_template_name,
      spinning,
      project_templete_scheme_visible,
      checkedKeys = [],
      safeConfirmModalVisible,
      templete_share_visible,
      templete_share_id,
      share_content,
      inputValue
    } = this.state
    const {
      gantt_board_id,
      boardTemplateShow,
      group_view_type,
      outline_tree,
      gantt_card_height,
      gantt_view_mode
    } = this.props
    const reg = /^[A-Za-z0-9]{6}$/
    return gantt_board_id && gantt_board_id != '0' ? (
      <div
        className={`${styles.container_init}   ${boardTemplateShow == '1' &&
          styles.container_show} ${boardTemplateShow == '2' &&
          styles.container_hide}`}
        style={{
          height: gantt_card_height,
          // top: date_area_height
          visibility: group_view_type != '2' ? 'visible' : 'hidden'
        }}
      >
        {!this.state.selected_template_id && (
          <div style={{ height: date_area_height }} className={styles.top}>
            <div className={`${styles.top_select}`}>
              <div
                className={`${styles.top_select_left} ${template_origin ==
                  '2' && styles.selected}`}
                onClick={() => this.selectTemplateType('2')}
              >
                自有模版
              </div>
              <div
                className={`${styles.top_select_right} ${template_origin ==
                  '0' && styles.selected}`}
                onClick={() => this.selectTemplateType('0')}
              >
                行业模版
              </div>
            </div>

            {/* <span className={styles.title}>项目模板</span> */}
            {/* <Dropdown overlay={this.renderTemplateList()}>
                                <div className={styles.top_left}>
                                    <div className={`${globalStyles.global_ellipsis} ${styles.name}`}>{selected_template_name}</div>
                                    <div className={`${globalStyles.authTheme} ${styles.down}`}>&#xe7ee;</div>
                                </div>
                            </Dropdown> */}
            {/* {
                                this.isShowSetting() &&
                                (
                                    <div className={`${globalStyles.authTheme} ${styles.top_right}`} onClick={this.routingJumpToOrgManager}>&#xe78e;</div>
                                )
                            } */}
          </div>
        )}

        {/* 拖拽子任务时，用于存放任务图标的ui,做dom操作 */}
        <div style={{ display: 'none' }} id={'save_child_card_icon'}>
          <div
            className={globalStyles.authTheme}
            style={{ color: '#18B2FF', fontSize: 18, marginRight: 6 }}
          >
            &#xe6f0;
          </div>
        </div>
        {this.state.selected_template_id ? (
          <>
            <div
              className={`${styles.list_item} ${styles.list_item_flex}`}
              onClick={() => this.selectBoardTemplate(0)}
            >
              <span className={styles.backBtn}>
                {' '}
                <i className={globalStyles.authTheme}>&#xe7ec;</i>
              </span>
              <div
                className={`${styles.lable} ${globalStyles.global_ellipsis}`}
              >
                {selected_template_name}
              </div>
            </div>
            {/* 主区 */}
            <Spin spinning={spinning}>
              <div
                style={{ maxHeight: gantt_card_height - date_area_height - 48 }}
                onMouseDown={this.outerMouseDown}
                className={styles.main}
              >
                <div>
                  <Tree
                    checkable
                    // checkStrictly
                    checkedKeys={checkedKeys}
                    onCheck={this.onCheck}
                    draggable={gantt_view_mode == 'month'}
                    onDragStart={this.onDragStart}
                    data-currentpanel="board_templete"
                    onDrop={this.onDrop}
                    // onDragEnter={this.onDragEnter}
                    // onDragLeave={this.onDragLeave}
                    // onDragOver={this.onDragOver}
                    // onDragEnd={this.onDragEnd}
                    // onDrop={this.onDrop}
                    // switcherIcon={
                    //     <Icon type="caret-down" style={{ fontSize: 20, color: 'rgba(0,0,0,.45)' }} />
                    // }
                  >
                    {this.renderTemplateTree(template_data)}
                  </Tree>
                </div>
              </div>
            </Spin>
            {checkIsHasPermissionInBoard(
              PROJECT_TEAM_CARD_CREATE,
              gantt_board_id
            ) &&
              checkIsHasPermissionInBoard(
                PROJECT_TEAM_BOARD_MILESTONE,
                gantt_board_id
              ) && (
                // !outline_tree.length &&
                <div className={styles.footer}>
                  <Button
                    type="primary"
                    block
                    onClick={() =>
                      this.openImportBoardModal(this.state.selected_template_id)
                    }
                  >
                    引用到项目
                  </Button>
                </div>
              )}
          </>
        ) : (
          <>
            <div className={styles.temp_middle}>
              {this.state.template_list && this.state.template_list.length ? (
                this.state.template_list.map(item => {
                  const { id, name, template_type } = item
                  return (
                    <div
                      class={styles.boardTplItem}
                      onClick={() => this.selectBoardTemplate(id)}
                    >
                      <span
                        className={`${styles.left} ${globalStyles.global_ellipsis}`}
                      >
                        {name}
                      </span>
                      <span>
                        {template_type == '2' && (
                          <Popover
                            key={id}
                            trigger={['click']}
                            getPopupContainer={triggerNode =>
                              triggerNode.parentNode
                            }
                            visible={
                              item.id == templete_share_id &&
                              templete_share_visible
                            }
                            onVisibleChange={this.onTempleteShareVisibleChange}
                            placement="bottomRight"
                            title={null}
                            content={
                              <div
                                className={styles.popover_content}
                                onClick={e => e && e.stopPropagation()}
                              >
                                <span
                                  onClick={this.onCancelTempleteShareVisble}
                                  className={`${styles.popover_close}`}
                                >
                                  <i className={`${globalStyles.authTheme}`}>
                                    &#xe7fe;
                                  </i>
                                </span>
                                <div>一次性提取码</div>
                                <div id={`templete_share_${id}`}>
                                  {share_content}
                                </div>
                                <div>
                                  <span>
                                    <span className={globalStyles.authTheme}>
                                      &#xe7fc;
                                    </span>
                                  </span>
                                  已复制成功，快去分享模版吧！
                                </div>
                              </div>
                            }
                          >
                            <i
                              onClick={e => this.handleDisposableCode(e, id)}
                              className={`${globalStyles.authTheme} ${styles.share_icon}`}
                            >
                              &#xe7e7;
                            </i>
                          </Popover>
                        )}
                        <i className={globalStyles.authTheme}>&#xe7eb;</i>
                      </span>
                    </div>
                  )
                })
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    color: 'rgba(0,0,0,0.3)',
                    marginTop: 50
                  }}
                >
                  <div
                    className={`${globalStyles.authTheme}`}
                    style={{ fontSize: 50, textAlign: 'center' }}
                  >
                    &#xe703;
                  </div>
                  <div>暂无数据</div>
                </div>
              )}
            </div>
            {template_origin == '2' && (
              // !!(
              //   this.state.template_list && this.state.template_list.length
              // ) &&
              <Popover
                title={null}
                trigger={'click'}
                placement="top"
                onVisibleChange={this.handlePickUpTempleteVisible}
                content={
                  <div>
                    <div>输入提取码：</div>
                    <div style={{ display: 'flex', marginTop: '8px' }}>
                      <Input
                        value={inputValue}
                        onChange={this.handleInputChange}
                      />
                      <Button
                        disabled={!inputValue || !reg.test(inputValue)}
                        type="primary"
                        style={{ marginLeft: '16px' }}
                        onClick={this.handlePickUpTemplete}
                      >
                        确定
                      </Button>
                    </div>
                  </div>
                }
              >
                <div className={styles.pick_templete}>
                  <Button>提取模板</Button>
                </div>
              </Popover>
            )}
          </>
        )}

        {/* <div
                            onClick={this.toggleBoardTemplateDrawer}
                            className={`${styles.switchSpin_init} ${boardTemplateShow == '1' && styles.switchSpinShow} ${boardTemplateShow == '2' && styles.switchSpinClose}`}
                            style={{
                                top: contain_height / 2
                            }} >
                            <div className={`${styles.switchSpin_top}`}></div>
                            <div className={`${styles.switchSpin_bott}`}></div>
                        </div> */}
        <div
          onClick={this.toggleBoardTemplateDrawer}
          className={`${styles.switchExpand}`}
          style={{
            top: gantt_card_height / 2,
            right: boardTemplateShow == 1 ? '280px' : '20px'
          }}
        >
          {/* <div className={`${styles.switchExpandOpen} ${globalStyles.authTheme}`}>&#xe687;</div> */}
          <div className={`${styles.switchExpandIcon}`}>
            {boardTemplateShow == 1 ? (
              <span className={globalStyles.authTheme}>&#xe689;</span>
            ) : (
              <span className={globalStyles.authTheme}>&#xe687;</span>
            )}
          </div>
        </div>
        <BoardTemplateManager
          _organization_id={
            localStorage.getItem('OrganizationId') != '0'
              ? localStorage.getItem('OrganizationId')
              : getGlobalData('aboutBoardOrganizationId')
          }
          project_templete_scheme_visible={project_templete_scheme_visible}
          setProjectTempleteSchemeModal={this.setProjectTempleteSchemeModal}
        ></BoardTemplateManager>

        {safeConfirmModalVisible && (
          <SafeConfirmModal
            visible={safeConfirmModalVisible}
            selectedTpl={this.state.selectedTpl}
            onChangeVisible={this.changeSafeConfirmModalVisible}
            onOk={this.onImportBoardTemplate}
          />
        )}
      </div>
    ) : (
      <></>
    )
  }
}
function mapStateToProps({
  gantt: {
    datas: {
      gantt_board_id,
      is_new_board,
      boardTemplateShow,
      outline_tree,
      group_view_type,
      gantt_view_mode,
      triggle_request_board_template,
      gantt_board_list_id,
      ceilWidth,
      group_list_area_section_height = [],
      date_arr_one_level = [],
      list_group = [],
      gantt_head_width
    }
  },
  technological: {
    datas: { userBoardPermissions = [] }
  }
}) {
  return {
    gantt_board_id,
    is_new_board,
    userBoardPermissions,
    boardTemplateShow,
    outline_tree,
    group_view_type,
    gantt_view_mode,
    triggle_request_board_template,
    gantt_board_list_id,
    ceilWidth,
    group_list_area_section_height,
    date_arr_one_level,
    list_group,
    gantt_head_width
  }
}
