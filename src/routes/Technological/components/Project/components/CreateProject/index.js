import React from 'react'
import {
  Modal,
  Form,
  Button,
  Input,
  message,
  Select,
  Tooltip,
  Dropdown,
  Menu
} from 'antd'
import DragValidation from '../../../../../../components/DragValidation'
import indexStyles from './index.less'
import StepTwoListItem from './StepTwoListItem'
import { validateTel, validateEmail } from '../../../../../../utils/verify'
import {
  MESSAGE_DURATION_TIME,
  PROJECTS,
  ORG_TEAM_BOARD_CREATE,
  NOT_HAS_PERMISION_COMFIRN
} from '../../../../../../globalset/js/constant'
import {
  currentNounPlanFilterName,
  checkIsHasPermission
} from '../../../../../../utils/businessFunction'
import CustormModal from '../../../../../../components/CustormModal'
import InviteOthers from './../../../InviteOthers/index'
import { getProjectList } from '../../../../../../services/technological/workbench'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import { connect } from 'dva'
import { getAppsList } from '../../../../../../services/technological/project'
import { getBoardTemplateList } from '../../../../../../services/technological/gantt'
import globalStyles from '@/globalset/css/globalClassName.less'
import { getIcons } from '../../../../../../utils/inviteMembersInWebJoin'

const FormItem = Form.Item
const TextArea = Input.TextArea
const { Option } = Select

@connect(mapStateToProps)
class CreateProject extends React.Component {
  state = {
    step: 1,
    step_2_type: 'normal', // normal / copy step = 2 时 默认类型/复制
    appsArray: [], // 项目功能列表
    // 步骤按钮的显示状态
    stepOneContinueDisabled: true,
    stepTwoContinueDisabled: true,
    stepThreeContinueDisabled: true,
    completeValidation: false, //完成滑块验证
    addProjectModalVisibleLocal: false,
    users: [], //被邀请人
    projects: [], //带有app列表的项目列表//
    select_project_id: undefined, // 当前选择的项目ID
    project_apps: [], //选择board后的app列表
    copy_value: {}, //复制的值
    OrganizationId: localStorage.getItem('OrganizationId'),
    _organization_id: this.props._organization_id || '', //选择的组织id
    appsList: [], //app列表
    board_template_list: [], //项目模板
    selected_board_template_id: undefined //项目模板id
  }

  // 初始化数据
  initData = () => {
    this.setState({
      step: 1,
      step_2_type: 'normal', // normal / copy step = 2 时 默认类型/复制
      appsArray: [],
      stepOneContinueDisabled: true,
      stepTwoContinueDisabled: true,
      stepThreeContinueDisabled: true,
      completeValidation: false, //完成滑块验证
      addProjectModalVisibleLocal: false,
      users: [], //被邀请人
      projects: [], //带有app列表的项目列表//
      select_project_id: undefined, //
      project_apps: [], //选择board后的app列表
      copy_value: {}, //复制的值
      OrganizationId: localStorage.getItem('OrganizationId'),
      _organization_id: this.props._organization_id || '', //选择的组织id
      copy_flow_template_visible: false,
      invit_others_visible: false
      // appsList: [], //app列表
    })
  }
  componentWillReceiveProps(nextProps) {
    const { addProjectModalVisible } = nextProps
    const { addProjectModalVisibleLocal } = this.state
    if (addProjectModalVisible && !addProjectModalVisibleLocal) {
      // this.getProjectList()
      this.handleOrgSetInit()
    }
    this.setAddProjectModalVisibleLocal(nextProps)
  }
  componentDidMount() {
    // this.getProjectList(true)
    // this.getAppList(true)
    this.handleOrgSetInit()
    this.setAddProjectModalVisibleLocal(this.props)
  }

  // 项目模板---end

  // 缓存是否可见在state
  setAddProjectModalVisibleLocal = props => {
    const { addProjectModalVisible } = this.props
    this.setState({
      addProjectModalVisibleLocal: addProjectModalVisible
    })
  }

  // 全组织，在只有一个组织情况下，默认选中该组织.查询组织项目列表和app列表
  handleOrgSetInit = () => {
    const { currentUserOrganizes = [], _organization_id } = this.props
    if (currentUserOrganizes.length == 1 && !!!_organization_id) {
      this.setState(
        {
          _organization_id: currentUserOrganizes[0].id
        },
        () => {
          this.getProjectList(true)
          this.getAppList(true)
        }
      )
    } else {
      this.getProjectList(true)
      this.getAppList(true)
    }
  }

  getAppList = (init, payload = {}) => {
    const { dispatch } = this.props
    const { _organization_id, OrganizationId } = this.state
    let params = {
      type: '2'
    }
    if (OrganizationId != '0') {
      //如果是初始化和非全组织状态时才调用
      params = Object.assign(params, { _organization_id: OrganizationId })
    } else {
      params = Object.assign(params, { _organization_id })
      if (!_organization_id || _organization_id == '0') return
    }
    if (!params._organization_id) return
    getAppsList(params).then(res => {
      if (isApiResponseOk(res)) {
        this.setState({
          appsList: res.data
        })
      } else {
        message.error(res.message)
      }
    })
  }
  //表单输入时记录值 组织选择的下拉回调
  orgOnChange = ({ key }) => {
    const arr = key.split('__')
    const id = arr[0]
    const name = arr[1]
    if (!checkIsHasPermission(ORG_TEAM_BOARD_CREATE, id)) {
      message.warn('您在该组织没有创建项目权限')
      return false
    }
    this.setState(
      {
        _organization_id: id,
        _organization_name: name,
        selected_board_template_id: undefined,
        select_project_id: undefined
      },
      () => {
        this.getAppList()
        this.getProjectList()
      }
    )
  }

  // 项目名称 onChange 事件
  boardNameChange(e) {
    const value = e.target.value
    if (value.trimLR() == '') {
      this.setState({
        stepOneContinueDisabled: true
      })
      return false
    }
    this.setState({
      board_name: value,
      stepOneContinueDisabled: !e.target.value
    })
  }

  // 取消回调
  onCancel = () => {
    this.setState({
      step: 1
    })
    this.props.setAddProjectModalVisible &&
      this.props.setAddProjectModalVisible()
    this.initData()
  }

  handleUsersToUsersStr = (users = []) => {
    return users.reduce((acc, curr) => {
      if (acc) {
        return acc + ',' + curr.id
      }
      return curr.id
      // const isCurrentUserFromPlatform = () =>
      //   curr.type === 'platform' && curr.id
      // if (isCurrentUserFromPlatform()) {
      //   if (acc) {
      //     return acc + ',' + curr.id
      //   }
      //   return curr.id
      // } else {
      //   if (acc) {
      //     return acc + ',' + curr.user
      //   }
      //   return curr.user
      // }
    }, '')
  }
  handleInviteMemberReturnResult = selectedMember => {
    this.setState({
      users: selectedMember
    })
  }

  //复制
  selectProjectChange = board_id => {
    const { projects = [] } = this.state
    const apps = (projects.find(item => board_id == item.board_id) || {}).apps
    this.setState({
      select_project_id: board_id,
      project_apps: apps
    })
    this.setCopyValue()
  }
  // 获取带有app的项目列表
  getProjectList = init => {
    const that = this
    const { OrganizationId, _organization_id } = this.state
    let params = {}
    if (OrganizationId != '0' && init) {
      //如果是初始化和非全组织状态时才调用
    } else {
      params['_organization_id'] = _organization_id
    }
    getProjectList(params).then(res => {
      if (isApiResponseOk(res)) {
        that.setState({
          projects: res.data
        })
      } else {
        message.warn(res.massage)
      }
    })
  }

  setCopyValue = data => {
    this.setState({
      copy_value: {
        flows: {
          is_copy_flow_template: true
        }
      }
    })
  }

  filterCurrentProjectListWithFlows = () => {
    const { projects = [] } = this.state
    let newProjects = [...projects]
    let arr = []
    for (let i = 0; i < newProjects.length; i++) {
      let element = newProjects[i].apps || []
      // console.log(element, 'ssssssssssssss')
      for (let j = 0; j < element.length; j++) {
        if (element[j].code == 'Flows') {
          arr.push(newProjects[i])
        }
      }
    }
    return arr
    let permissionArr = this.filterProjectWhichCurrentUserHasAccessFlowsPermission(
      arr
    )
    return permissionArr
    // console.log(newProjects, 'sssssssssssss_newProjects')
  }

  // 获取当前用户
  getInfoFromLocalStorage = item => {
    try {
      const userInfo = localStorage.getItem(item)
      return JSON.parse(userInfo)
    } catch (e) {
      message.error('从 Cookie 中获取用户信息失败, 当复制项目流程模板的时候')
    }
  }

  // 获取项目权限
  getProjectPermission = (permissionType, board_id) => {
    const userBoardPermissions = this.getInfoFromLocalStorage(
      'userBoardPermissions'
    )
    if (!userBoardPermissions || !userBoardPermissions.length) {
      return false
    }
    const isFindedBoard = userBoardPermissions.find(
      board => board.board_id === board_id
    )
    if (!isFindedBoard) return false
    const { permissions = [] } = isFindedBoard
    return !!permissions.find(
      permission =>
        permission.code === permissionType && permission.type === '1'
    )
  }
  // 查询当前用户是否有权限
  filterProjectWhichCurrentUserHasAccessFlowsPermission = (
    projectList = []
  ) => {
    return projectList.filter(({ board_id }) =>
      this.getProjectPermission('project:flows:flow:access', board_id)
    )
  }

  // 直接渲染复制流程模板
  renderCopyFlowTemplete = () => {
    const {
      stepTwoContinueDisabled,
      step_2_type,
      projects = [],
      project_apps = [],
      select_project_id
    } = this.state
    const filterProject = this.filterCurrentProjectListWithFlows() || []
    const step_2_copy = (
      <div style={{ margin: '12px auto', height: 'auto' }}>
        <div className={indexStyles.operateAreaOut}>
          <div className={indexStyles.operateArea}>
            <Select
              value={select_project_id}
              style={{ width: '100%', fontSize: '14px' }}
              size={'large'}
              placeholder="选择一个项目复制流程模版"
              optionFilterProp="children"
              onChange={this.selectProjectChange}
              allowClear={true}
            >
              {filterProject.map((value, key) => {
                const { board_id, board_name } = value
                return (
                  <Option value={board_id} key={board_id}>
                    {board_name}
                  </Option>
                )
              })}
            </Select>
          </div>
        </div>
      </div>
    )
    return step_2_copy
  }

  // 渲染组织menu
  renderOrgMenu = () => {
    const { currentUserOrganizes = [] } = this.props
    return (
      <Menu
        onClick={this.orgOnChange}
        style={{ maxHeight: 240, overflow: 'auto' }}
      >
        {currentUserOrganizes.map(value => {
          const { name, id } = value
          return (
            <Menu.Item key={`${id}__${name}`} style={{ width: 248 }}>
              <div
                style={{ maxWidth: 232 }}
                className={`${globalStyles.global_ellipsis}`}
                title={name}
              >
                {name}
              </div>
            </Menu.Item>
          )
        })}
      </Menu>
    )
  }

  // 复制流程模板显示
  setCopyFlowTemplateVisible = () => {
    this.setState({
      copy_flow_template_visible: !this.state.copy_flow_template_visible
    })
  }
  // 邀请他人显示
  setInviteOthersVisible = () => {
    this.setState({
      invit_others_visible: !this.state.invit_others_visible
    })
  }

  // 以上几步合成一步
  renderCreateStep = () => {
    const {
      _organization_id,
      OrganizationId,
      stepOneContinueDisabled,
      step_2_type,
      invit_others_visible,
      copy_flow_template_visible,
      _organization_name
    } = this.state
    const {
      currentUserOrganizes = [],
      form: { getFieldDecorator }
    } = this.props
    const { user_set = {} } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    const { is_simple_model } = user_set
    const step = (
      <div>
        <div className={indexStyles.head}>
          <div className={indexStyles.head_left}>
            新建{currentNounPlanFilterName(PROJECTS)}
            {OrganizationId == '0' && '到'}
          </div>
          {OrganizationId == '0' && (
            <Dropdown overlay={this.renderOrgMenu()}>
              <div className={indexStyles.head_org}>
                <div
                  style={{ maxWidth: 246 }}
                  className={`${globalStyles.global_ellipsis}`}
                >
                  {_organization_id && _organization_id != '0'
                    ? _organization_name
                    : '请选择组织'}
                </div>
                <div className={globalStyles.authTheme}>&#xe7ee;</div>
              </div>
            </Dropdown>
          )}
        </div>

        <div className={indexStyles.operateAreaOut}>
          <div className={indexStyles.operateArea}>
            {/* 项目名称 */}
            <Input
              placeholder={`输入${currentNounPlanFilterName(PROJECTS)}名称`}
              onChange={this.boardNameChange.bind(this)}
              style={{ height: 40, marginBottom: 16 }}
            />
            <div className={indexStyles.setelse}>
              <div className={indexStyles.setelse_left}>
                {/* {
                  is_simple_model == '0' && ( */}
                {/* <div className={indexStyles.setelse_item} onClick={this.setCopyFlowTemplateVisible}>
                  <div className={`${globalStyles.authTheme} ${indexStyles.addUSer}`}>&#xe68b;</div>
                  <div className={indexStyles.setelse_item_name}>复制流程模板</div>
                  <div className={`${globalStyles.authTheme} ${indexStyles.spin} ${!copy_flow_template_visible && indexStyles.spin_down}`}>&#xe66b;</div>
                </div> */}
                {/* )
                } */}
                <div
                  className={indexStyles.setelse_item}
                  onClick={this.setInviteOthersVisible}
                >
                  <div
                    className={`${globalStyles.authTheme} ${indexStyles.addUSer}`}
                  >
                    &#xe685;
                  </div>
                  <div className={indexStyles.setelse_item_name}>
                    邀请他人加入
                  </div>
                  <div
                    className={`${globalStyles.authTheme} ${
                      indexStyles.spin
                    } ${!invit_others_visible && indexStyles.spin_down}`}
                  >
                    &#xe66b;
                  </div>
                </div>
              </div>
              <div className={indexStyles.setelse_right}>
                <Button
                  type="primary"
                  disabled={
                    stepOneContinueDisabled ||
                    (OrganizationId == '0' &&
                      (!_organization_id ||
                        !checkIsHasPermission(
                          ORG_TEAM_BOARD_CREATE,
                          _organization_id
                        )))
                  }
                  onClick={this.createBoard}
                  style={{ width: 96, height: 40 }}
                >
                  创建{`${currentNounPlanFilterName(PROJECTS)}`}
                </Button>
              </div>
            </div>
            {/* 复制流程模板 */}
            <div
              style={{ display: copy_flow_template_visible ? 'block' : 'none' }}
            >
              {this.renderCopyFlowTemplete()}
            </div>
            {/* 邀请他人 */}
            <div style={{ display: invit_others_visible ? 'block' : 'none' }}>
              <InviteOthers
                selectDisabled={OrganizationId == '0' && !!!_organization_id}
                _organization_id={
                  _organization_id || localStorage.getItem('OrganizationId')
                }
                isShowTitle={false}
                isShowSubmitBtn={false}
                handleInviteMemberReturnResult={
                  this.handleInviteMemberReturnResult
                }
              />
            </div>
            {/* </div> */}
          </div>
        </div>
      </div>
    )
    return step
  }
  createBoard = () => {
    const {
      _organization_id,
      OrganizationId,
      board_name,
      users,
      appsList = [],
      copy_value,
      select_project_id,
      selected_board_template_id
    } = this.state
    if (copy_value && Object.keys(copy_value).length && select_project_id) {
      let apps = appsList.map(item => item.id).join(',')
      const copy_obj = {
        board_id: select_project_id,
        ...copy_value
      }
      const params = {
        apps,
        users: this.handleUsersToUsersStr(users),
        _organization_id: _organization_id || OrganizationId,
        board_name,
        copy: JSON.stringify(copy_obj),
        template_id: selected_board_template_id
      }
      this.props.addNewProject ? this.props.addNewProject(params) : false
      this.props.setAddProjectModalVisible &&
        this.props.setAddProjectModalVisible({ visible: false })
      this.initData()
      return
      getIcons(users).then(users => {
        const params = {
          apps,
          users: this.handleUsersToUsersStr(users),
          _organization_id: _organization_id || OrganizationId,
          board_name,
          copy: JSON.stringify(copy_obj),
          template_id: selected_board_template_id
        }
        this.props.addNewProject ? this.props.addNewProject(params) : false
        this.props.setAddProjectModalVisible &&
          this.props.setAddProjectModalVisible({ visible: false })
        this.initData()
      })
    } else {
      let apps = appsList.map(item => item.id).join(',')
      const params = {
        apps,
        users: this.handleUsersToUsersStr(users),
        _organization_id: _organization_id || OrganizationId,
        board_name,
        template_id: selected_board_template_id
      }
      this.props.addNewProject ? this.props.addNewProject(params) : false
      this.props.setAddProjectModalVisible &&
        this.props.setAddProjectModalVisible({ visible: false })
      this.initData()
      return
      getIcons(users).then(users => {
        let apps = appsList.map(item => item.id).join(',')
        const params = {
          apps,
          users: this.handleUsersToUsersStr(users),
          _organization_id: _organization_id || OrganizationId,
          board_name,
          template_id: selected_board_template_id
        }
        this.props.addNewProject ? this.props.addNewProject(params) : false
        this.props.setAddProjectModalVisible &&
          this.props.setAddProjectModalVisible({ visible: false })
        this.initData()
      })
      // let apps = appsList.filter(item => 'Tasks' == item.code || 'Files' == item.code).map(item => item.id).join(',')
    }
    // const apps = appsList.filter(item => 'Tasks' == item.code || 'Files' == item.code).map(item => item.id).join(',')
    // // copy: "{"board_id":"1206490600661192704","flows":{"is_copy_flow_template":true}}
    // const params = {
    //   apps,
    //   users: this.handleUsersToUsersStr(users),
    //   _organization_id: _organization_id || OrganizationId,
    //   board_name,

    // }
    // this.props.addNewProject ? this.props.addNewProject(params) : false
    // this.props.setAddProjectModalVisible &&
    //   this.props.setAddProjectModalVisible({ visible: false })
    // this.initData()
  }
  render() {
    const { addProjectModalVisible } = this.props

    return (
      <div>
        <CustormModal
          visible={addProjectModalVisible} //addProjectModalVisible
          maskClosable={false}
          width={640}
          footer={null}
          destroyOnClose
          style={{ textAlign: 'center' }}
          onCancel={this.onCancel}
          overInner={this.renderCreateStep()}
        ></CustormModal>
      </div>
    )
  }
}
export default Form.create()(CreateProject)

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  technological: {
    datas: { currentUserOrganizes = [], userOrgPermissions }
  }
}) {
  return { currentUserOrganizes, userOrgPermissions }
}

CreateProject.defaultProps = {
  setAddProjectModalVisible: function() {}, // 控制新建项目的弹窗回调
  addProjectModalVisible: false, // 该弹窗的显示隐藏
  addNewProject: function() {} // 创建完成时的回调
}
