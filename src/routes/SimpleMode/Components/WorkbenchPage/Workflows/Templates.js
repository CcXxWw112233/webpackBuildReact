import React, { Component } from 'react'
import globalStyles from '@/globalset/css/globalClassName.less'
import styles from './index.less'
import { Tooltip, Button, Popconfirm, message, DatePicker, Popover } from 'antd'
import { connect } from 'dva'
import {
  checkIsHasPermissionInBoard,
  setBoardIdStorage,
  setOrganizationIdStorage,
  getOrgNameWithOrgIdFilter,
  getGlobalData,
  isPaymentOrgUser,
  currentNounPlanFilterName
} from '../../../../../utils/businessFunction'
import {
  PROJECT_FLOWS_FLOW_TEMPLATE,
  PROJECT_FLOWS_FLOW_CREATE,
  NOT_HAS_PERMISION_COMFIRN,
  FLOWS
} from '../../../../../globalset/js/constant'
import SelectBoardModal from './SelectBoardModal'
import { timeToTimestamp } from '../../../../../utils/util'
import moment from 'moment'
import { isApiResponseOk } from '../../../../../utils/handleResponseData'
@connect(mapStateToProps)
export default class Templates extends Component {
  constructor(props) {
    super(props)
    this.state = {
      local_board_id: '', //用于做流程模板创建的board_id,当全部项目场景下会用到
      board_select_visible: false, //全项目下
      popoStartConfirmVisible: false,
      currentVisibleItem: ''
    }
  }
  initState = () => {
    this.setState({
      local_board_id: '', //用于做流程模板创建的board_id,当全部项目场景下会用到
      board_select_visible: false, //全项目下
      popoStartConfirmVisible: false,
      currentVisibleItem: '',
      flow_instance_start_time: '',
      curr_temp_info: {}
    })
  }
  componentDidMount() {
    const { simplemodeCurrentProject = {} } = this.props
    const { board_id } = simplemodeCurrentProject
    this.getTemplateList(this.props)
    this.setLocalBoardId(board_id)
  }
  componentWillReceiveProps(nextProps) {
    const { board_id, org_id } = this.props.simplemodeCurrentProject
    const {
      board_id: next_board_id,
      org_id: next_org_id
    } = nextProps.simplemodeCurrentProject
    if (board_id != next_board_id) {
      //切换项目时做请求
      this.getTemplateList(nextProps)
      this.setLocalBoardId(next_board_id)
    } else if (org_id != next_org_id) {
      this.getTemplateList(nextProps)
    }
  }
  // 获取流程列表
  getTemplateList = props => {
    const {
      dispatch,
      currentSelectOrganize,
      simplemodeCurrentProject = {}
    } = props
    const { board_id, org_id } = simplemodeCurrentProject
    const { id } = currentSelectOrganize
    // 全组织的时候 currentSelectOrganize是{}, 具体组织时才有ID
    // 但是切换mini导航选择项目的时候 不会变化
    const ORG_ID = localStorage.getItem('OrganizationId') == '0' ? org_id : id
    dispatch({
      type: 'publicProcessDetailModal/getProcessTemplateList',
      payload: {
        id: board_id || '0',
        board_id: board_id || '0',
        _organization_id: ORG_ID || '0'
      }
    })
  }

  // 和创建模板想关-----------start
  setLocalBoardId = board_id => {
    this.setState({
      local_board_id: board_id
    })
  }
  // 弹窗选择项目id回调
  selectModalBoardIdCalback = board_id => {
    const { dispatch } = this.props
    this.setLocalBoardId(board_id)
  }
  //
  setBoardSelectVisible = (visible, item, timeString) => {
    this.setState({
      board_select_visible: visible,
      flow_instance_start_time: timeString,
      curr_temp_info: item
    })
    this.setLocalBoardId('0')
  }
  modalOkCalback = () => {
    //确认回调
    this.setBoardSelectVisible(false)
    const { curr_temp_info = {} } = this.state
    const { enable_change } = curr_temp_info
    if (enable_change == '0') {
      // 表示不经过模板启动
      this.handleOperateStartConfirmProcessOne()
    } else if (enable_change == '1') {
      this.handleStartProcess(curr_temp_info)
    }
  }
  // 新增模板点击的确认
  beforeAddTemplateConfirm = () => {
    const { local_board_id } = this.state
    if (local_board_id == '0' || !local_board_id) {
      this.setBoardSelectVisible(true)
    } else {
      if (
        !checkIsHasPermissionInBoard(
          PROJECT_FLOWS_FLOW_CREATE,
          local_board_id
        ) &&
        !checkIsHasPermissionInBoard(
          PROJECT_FLOWS_FLOW_TEMPLATE,
          local_board_id
        )
      ) {
        message.warn(NOT_HAS_PERMISION_COMFIRN)
        return false
      }
      this.handleAddTemplate()
    }
  }
  // 和创建模板想关-----------end

  // 新增模板点击事件
  handleAddTemplate = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        processPageFlagStep: '1',
        process_detail_modal_visible: true,
        processEditDatas: []
      }
    })
  }
  // 这个是进入启动页, 那么先选择项目
  handleStartBoardProcess = item => {
    const { id, board_id, org_id } = item
    // setBoardIdStorage(board_id, org_id)
    const { local_board_id } = this.state
    // 如果是全部项目, 那么需要选择项目
    if (local_board_id == '0' || !local_board_id) {
      this.setBoardSelectVisible(true, item)
    } else {
      // 表示是具体项目
      this.handleStartProcess(item)
    }
  }
  // 启动流程的点击事件
  handleStartProcess = item => {
    const { dispatch } = this.props
    const { id } = item
    // setBoardIdStorage(board_id)
    dispatch({
      type: 'publicProcessDetailModal/getTemplateInfo',
      payload: {
        id,
        processPageFlagStep: '3',
        process_detail_modal_visible: true
      }
    })
    return
  }
  handleOperateStartConfirmProcess = (e, item, start_time) => {
    e && e.stopPropagation()
    const { id, board_id, org_id, enable_change } = item
    const { local_board_id } = this.state
    // setBoardIdStorage(board_id, org_id)
    if (local_board_id == '0' || !local_board_id) {
      this.setBoardSelectVisible(true, item, start_time)
      return
    }
    this.handleOperateStartConfirmProcessOne(e, item, start_time)
    return
  }
  handleOperateStartConfirmProcessOne = (e, item, start_time) => {
    let that = this
    const {
      flow_instance_start_time,
      curr_temp_info = {},
      local_board_id
    } = this.state
    const { id, board_id, org_id, enable_change } = item ? item : curr_temp_info
    const { dispatch, request_flows_params = {} } = this.props
    let BOARD_ID =
      (request_flows_params && request_flows_params.request_board_id) ||
      board_id
    Promise.resolve(
      dispatch({
        type: 'publicProcessDetailModal/nonAwayTempleteStartPropcess',
        payload: {
          start_up_type: start_time
            ? '2'
            : flow_instance_start_time
            ? '2'
            : '1',
          plan_start_time: start_time
            ? start_time
            : flow_instance_start_time
            ? flow_instance_start_time
            : '',
          flow_template_id: id,
          board_id: local_board_id
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        that.props.dispatch({
          type: 'publicProcessDetailModal/getProcessListByType',
          payload: {
            status: start_time ? '0' : '1',
            board_id: BOARD_ID,
            _organization_id: request_flows_params._organization_id || org_id
          }
        })
        this.handleProcessStartConfirmVisible(false)
        this.initState()
        if (local_board_id == '0' || !local_board_id) return
        this.selectModalBoardIdCalback(BOARD_ID)
      } else {
        message.warn(res.message)
      }
    })
  }
  // 开始时间气泡弹窗显示
  handleProcessStartConfirmVisible = (visible, id) => {
    this.setState({
      popoStartConfirmVisible: visible,
      currentVisibleItem: id
    })
    if (!visible) {
      const { startOpen } = this.state
      if (!startOpen) return
      this.setState({
        startOpen: false
      })
    }
  }

  // 预约开始时间
  startDatePickerChange = (timeString, item) => {
    this.setState(
      {
        start_time: timeToTimestamp(timeString)
      },
      () => {
        this.handleStartOpenChange(false)
        this.handleOperateStartConfirmProcess(
          '',
          item,
          timeToTimestamp(timeString)
        )
      }
    )
  }
  range = (start, end) => {
    const result = []
    for (let i = start; i < end; i++) {
      result.push(i)
    }
    return result
  }
  // 禁用的时间段
  disabledStartTime = current => {
    return current && current < moment().endOf('day')
  }
  // 这是保存一个点击此刻时不让日期面板关闭
  handleStartOpenChange = open => {
    // this.setState({ endOpen: true });
    this.setState({
      startOpen: open
    })
  }

  handleStartDatePickerChange = timeString => {
    this.setState(
      {
        start_time: timeToTimestamp(timeString)
      },
      () => {
        this.handleStartOpenChange(true)
      }
    )
  }
  // 渲染开始流程的气泡框
  renderProcessStartConfirm = value => {
    // 禁用开始流程的按钮逻辑 1.判断流程名称是否输入 ==> 2. 是否有步骤 并且步骤都不是配置的样子 ==> 3. 并且上一个节点有选择类型 都是或者的关系 只要有一个不满足返回 true 表示 禁用 false 表示不禁用
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '248px',
          height: '112px',
          justifyContent: 'space-around'
        }}
      >
        <Button
          onClick={e => {
            this.handleOperateStartConfirmProcess(e, value)
          }}
          type="primary"
        >
          立即开始
        </Button>
        <div>
          <span
            id={'datepicker_container'}
            style={{
              position: 'relative',
              zIndex: 1,
              minWidth: '80px',
              lineHeight: '38px',
              width: '100%',
              display: 'inline-block',
              textAlign: 'center'
            }}
          >
            <Button style={{ color: '#1890FF', width: '100%' }}>
              预约开始时间
            </Button>
            <DatePicker
              disabledDate={this.disabledStartTime}
              onOk={e => {
                this.startDatePickerChange(e, value)
              }}
              onChange={this.handleStartDatePickerChange}
              onOpenChange={this.handleStartOpenChange}
              open={this.state.startOpen}
              getCalendarContainer={() =>
                document.getElementById('datepicker_container')
              }
              placeholder={'开始时间'}
              format="YYYY/MM/DD HH:mm"
              showTime={{ format: 'HH:mm' }}
              style={{
                opacity: 0,
                zIndex: 1,
                background: '#000000',
                position: 'absolute',
                left: 0,
                width: '100%'
              }}
            />
          </span>
        </div>
      </div>
    )
  }
  renderTemplateList = () => {
    const { processTemplateList = [] } = this.props

    const {
      currentUserOrganizes = [],
      simplemodeCurrentProject = {}
    } = this.props
    const { board_id: select_board_id } = simplemodeCurrentProject
    const select_org_id = localStorage.getItem('OrganizationId')

    return processTemplateList
      .filter(item => isPaymentOrgUser(item.org_id))
      .map(value => {
        const {
          id,
          name,
          board_id,
          org_id,
          board_name,
          node_num,
          enable_change
        } = value
        const org_dec =
          select_org_id == '0' || !select_org_id
            ? `(${getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)})`
            : ''
        const board_dec =
          select_board_id == '0' || !select_board_id ? `#${board_name}` : ''
        return (
          <div className={styles.template_item} key={id}>
            <div className={styles.template_item_top}>
              <div
                className={`${globalStyles.authTheme} ${styles.template_logo}`}
              >
                &#xe682;
              </div>
              <div
                className={`${globalStyles.authTheme} ${styles.template_dec}`}
              >
                <div className={`${styles.template_dec_title}`}>
                  <span
                    className={`${styles.template_dec_title_instance} `}
                    title={name}
                  >
                    {name.length > 10 ? name.substr(0, 7) + '...' : name}
                  </span>
                  {(select_org_id == '0' || !select_org_id) && (
                    <span
                      className={`${styles.template_dec_title_org}`}
                      title={`${org_dec}`}
                    >
                      {/* {board_dec} */}
                      {org_dec}
                    </span>
                  )}
                </div>
                <div className={`${styles.template_dec_step}`}>
                  共{node_num}步
                </div>
              </div>
            </div>
            <div
              id={'template_item_bott'}
              className={styles.template_item_bott}
            >
              {enable_change == '0' ? (
                <>
                  {(checkIsHasPermissionInBoard(
                    PROJECT_FLOWS_FLOW_CREATE,
                    select_board_id
                  ) ||
                    select_board_id == '0' ||
                    !select_board_id) && (
                    <Tooltip title={`启用${currentNounPlanFilterName(FLOWS)}`}>
                      <Popover
                        trigger="click"
                        title={null}
                        visible={
                          this.state.popoStartConfirmVisible &&
                          id == this.state.currentVisibleItem
                        }
                        onVisibleChange={visible => {
                          this.handleProcessStartConfirmVisible(visible, id)
                        }}
                        content={this.renderProcessStartConfirm(value)}
                        icon={<></>}
                        getPopupContainer={() =>
                          document.getElementById('template_item_bott')
                        }
                      >
                        <div
                          className={`${globalStyles.authTheme} ${styles.template_operate}`}
                        >
                          &#xe796;{' '}
                          <span
                            style={{ fontSize: '12px' }}
                          >{`启用${currentNounPlanFilterName(FLOWS)}`}</span>
                        </div>
                      </Popover>
                    </Tooltip>
                  )}
                </>
              ) : (
                <>
                  {(checkIsHasPermissionInBoard(
                    PROJECT_FLOWS_FLOW_CREATE,
                    select_board_id
                  ) ||
                    select_board_id == '0' ||
                    !select_board_id) && (
                    <Tooltip title={'启用流程'}>
                      <div
                        className={`${globalStyles.authTheme} ${styles.template_operate}`}
                        onClick={() => this.handleStartBoardProcess(value)}
                      >
                        &#xe796;{' '}
                        <span style={{ fontSize: '12px' }}>启用流程</span>
                      </div>
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })
  }
  renderNodata = () => {
    return (
      <div className={styles.tempalte_nodata}>
        <div
          className={`${globalStyles.authTheme} ${styles.tempalte_nodata_logo}`}
        >
          &#xe703;
        </div>
        <div className={styles.tempalte_nodata_dec}>暂无模板数据</div>
        {/* <div className={styles.tempalte_nodata_dec}>还没有模版，赶快新建一个吧</div> */}
        {/* <div className={styles.tempalte_nodata_operate}>
                    <Button type="primary" style={{ width: 182 }} ghost onClick={this.beforeAddTemplateConfirm}>新建模板</Button>
                </div> */}
      </div>
    )
  }

  render() {
    const { processTemplateList = [] } = this.props
    const { local_board_id, board_select_visible } = this.state
    return (
      <>
        <div className={styles.templates_top}>
          <div className={`${styles.templates_top_title}`}>流程模板</div>
          {/* <div className={`${globalStyles.authTheme} ${styles.templates_top_add}`} onClick={this.beforeAddTemplateConfirm}>&#xe8fe;</div> */}
        </div>
        <div
          className={`${styles.templates_contain} ${globalStyles.global_vertical_scrollbar}`}
        >
          {processTemplateList.length
            ? this.renderTemplateList()
            : this.renderNodata()}
        </div>
        <SelectBoardModal
          selectModalBoardIdCalback={this.selectModalBoardIdCalback}
          setBoardSelectVisible={this.setBoardSelectVisible}
          modalOkCalback={this.modalOkCalback}
          visible={board_select_visible}
          local_board_id={local_board_id}
        />
      </>
    )
  }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  publicProcessDetailModal: { processTemplateList },
  simplemode: { simplemodeCurrentProject = {} },
  technological: {
    datas: {
      currentUserOrganizes = [],
      currentSelectOrganize = {},
      userBoardPermissions = []
    }
  },
  publicProcessDetailModal: { process_detail_modal_visible }
}) {
  return {
    processTemplateList,
    simplemodeCurrentProject,
    currentSelectOrganize,
    currentUserOrganizes,
    userBoardPermissions,
    process_detail_modal_visible
  }
}
