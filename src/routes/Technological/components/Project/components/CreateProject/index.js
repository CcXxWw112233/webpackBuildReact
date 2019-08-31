import React from 'react'
import { Modal, Form, Button, Input, message, Select } from 'antd'
import DragValidation from '../../../../../../components/DragValidation'
import indexStyles from './index.less'
import StepTwoListItem from './StepTwoListItem'
import { validateTel, validateEmail } from '../../../../../../utils/verify'
import {MESSAGE_DURATION_TIME, PROJECTS, ORG_TEAM_BOARD_CREATE, NOT_HAS_PERMISION_COMFIRN} from "../../../../../../globalset/js/constant";
import {currentNounPlanFilterName, checkIsHasPermission} from "../../../../../../utils/businessFunction";
import CustormModal from '../../../../../../components/CustormModal'
import InviteOthers from './../../../InviteOthers/index'
import { getProjectList } from '../../../../../../services/technological/workbench'
import {isApiResponseOk} from "../../../../../../utils/handleResponseData";
import { connect } from 'dva'
import { getAppsList } from "../../../../../../services/technological/project";
const FormItem = Form.Item
const TextArea = Input.TextArea
const { Option } = Select;

@connect(mapStateToProps)
class CreateProject extends React.Component {
  state = {
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
    _organization_id: this.props._organization_id ||'', //选择的组织id
    appsList: [], //app列表
  }
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
      _organization_id: this.props._organization_id ||'', //选择的组织id
      // appsList: [], //app列表
    })
  }
  componentWillReceiveProps(nextProps) {
    const { addProjectModalVisible } = nextProps
    const { addProjectModalVisibleLocal } = this.state
    if(addProjectModalVisible && !addProjectModalVisibleLocal) {
      this.getProjectList()
    }
    this.setState({
      addProjectModalVisibleLocal: addProjectModalVisible
    })
  }
  componentDidMount() {
    this.getProjectList(true)
    this.getAppList(true)
  }
  getAppList = (init, payload = {}) => {
    const { dispatch } = this.props
    const { _organization_id, OrganizationId } = this.state
    let params = {
      type: '2'
    }
    if(OrganizationId != '0') { //如果是初始化和非全组织状态时才调用
      params = Object.assign(params, { _organization_id: OrganizationId })
    } else {
      params = Object.assign(params, { _organization_id })
      if(!_organization_id || _organization_id == '0') return
    }
   
    getAppsList(params).then(res => {
      if(isApiResponseOk(res)) {
        this.setState({
          appsList: res.data
        })
      } else {
        message.error(res.message)
      }
    })
  }
  //表单输入时记录值
  orgOnChange = (id) => {
    if(!checkIsHasPermission(ORG_TEAM_BOARD_CREATE, id)){
      message.warn('您在该组织没有创建项目权限')
      return false
    }
    this.setState({
      _organization_id: id
    }, () => {
      this.getAppList()
      this.getProjectList()
    })
  }
  boardNameChange(e){
    const value = e.target.value
    this.setState({
      board_name: value,
      stepOneContinueDisabled: !e.target.value
    })
  }
  descriptionChange(e){
    this.setState({
      description: e.target.value
    })
  }
  usersChange(e) {
    this.setState({
      users: e.target.value
    })
  }
  //下一步
  nextStep = () => {
    this.setState({
      step: this.state.step < 3 ? ++this.state.step : 3
    })
  }
  //上一步
  lastStep = (step) => {
    this.setState({
      step
    })
  }

  //监听是否完成验证
  listenCompleteValidation = (e) => {
    // console.log(e)
    this.setState({
      completeValidation: e,
      stepThreeContinueDisabled: !e
    })
  }
  onCancel = () => {
    this.setState({
      step: 1
    })
    this.props.setAddProjectModalVisible && this.props.setAddProjectModalVisible()
    this.initData()
  }

  //step 2 表单单项button点击
  stepTwoButtonClick(data) {
    const { isAdd, id, itemKey } = data
    const appsArray = this.state.appsArray
    if(isAdd) {
      appsArray[itemKey] = id
    }else{
      appsArray[itemKey] = 'itemIsNull'
    }
    this.setState({
      appsArray
    }, function () {
      let stepTwoContinueDisabled = true
      // console.log(this.state.appsArray)
      for(let val of this.state.appsArray) {
        if(val && val !== 'itemIsNull') {
          stepTwoContinueDisabled = false
          break
        }
      }
      this.setState({
        stepTwoContinueDisabled
      })
    })
  }
  // 提交表单
  handleSubmit = (e) => {
    e.preventDefault();
    const { step_2_type, select_project_id, copy_value = {}, _organization_id, OrganizationId } = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values['board_name'] = this.state.board_name
        values['description'] = this.state.description
        let appsString = ''
        for(let val of this.state.appsArray) {
          if(val && val !== 'itemIsNull') {
            appsString += val+','
          }
        }
        values['apps'] = appsString
        if(step_2_type == 'copy') {
          const copy_obj = {
            board_id: select_project_id,
            ...copy_value
          }
          values['copy'] = JSON.stringify(copy_obj)
        }

        //参与人
        // if(this.state.users) {
        //   let users = this.state.users.replace(/\n/gim, ',') //替代换行符
        //   let usersArr = users.split(',') //转成数组
        //   let usersNewArr = []
        //   for(let val of usersArr) {
        //     if(val) {
        //       usersNewArr.push(val)
        //     }
        //   }
        //   users = usersNewArr.join(',')
        //   for(let val of usersNewArr ) {
        //     if(!validateTel(val) && !validateEmail(val)) {
        //       message.warn('请正确输入被邀请人的手机号或者邮箱。', MESSAGE_DURATION_TIME)
        //       return false
        //     }
        //   }
        //   values['users'] = users
        // }
        const {users} = this.state
        values['users'] = this.handleUsersToUsersStr(users)
        values['_organization_id'] = _organization_id || OrganizationId
        this.props.addNewProject ? this.props.addNewProject(values) : false
        this.props.setAddProjectModalVisible && this.props.setAddProjectModalVisible({visible: false})
        this.initData()
      }
    });
  }
  handleUsersToUsersStr = (users = []) => {
    return users.reduce((acc, curr) => {
    const isCurrentUserFromPlatform = () => curr.type === 'platform' && curr.id
    if(isCurrentUserFromPlatform()) {
      if(acc) {
        return acc + "," + curr.id
      }
      return curr.id
    } else {
      if(acc) {
        return acc + ',' + curr.user
      }
      return curr.user
    }
    }, '')
  }
  handleInviteMemberReturnResult = selectedMember => {
    this.setState({
      users: selectedMember
    })
  }

  //复制
  selectProjectChange = (board_id) => {
    const { projects = [] } = this.state
    const apps = (projects.find(item => board_id == item.board_id) || {}).apps
    this.setState({
      select_project_id: board_id,
      project_apps: apps
    })
  }
  // 获取带有app的项目列表
  getProjectList = (init) => {
    const that = this
    const { OrganizationId, _organization_id } = this.state
    let params = {}
    if(OrganizationId != '0' && init) { //如果是初始化和非全组织状态时才调用
      
    } else {
      params['_organization_id'] = _organization_id
    }
    getProjectList(params).then(res => {
      if(isApiResponseOk(res)) {
        that.setState({
          projects: res.data
        })
      }else {
        message.warn(res.massage)
      }
    })
  }
  setStepTwotype = () => {
    const { step_2_type } = this.state
    this.setState({
      step_2_type: step_2_type == 'normal'? 'copy': 'normal',
      project_apps: [],
      select_project_id: undefined,
      appsArray: [],
      stepTwoContinueDisabled: true,
    })
  }
  setCopyValue = (data) => {
    const { copy_value = {} } = this.state
    const copyValueNew = Object.assign(copy_value, data)
    this.setState({
      copy_value: copyValueNew
    })
  }

  render() {
    const { 
      step,
      stepOneContinueDisabled, 
      stepTwoContinueDisabled, 
      stepThreeContinueDisabled, 
      step_2_type, 
      projects = [],
      project_apps = [], 
      select_project_id,
      _organization_id,
      appsList = [],
      OrganizationId
    } = this.state
    const { addProjectModalVisible, currentUserOrganizes = [] } = this.props;
    const { getFieldDecorator } = this.props.form;

    // console.log('sssssss', {
    //   _organization_id: !_organization_id,
    //   _organization_id_: this.props._organization_id
    // })
    //编辑第一步
    const step_1 = (
      <Form style={{margin: '0 auto', width: 336}}>
        <div style={{fontSize: 20, color: '#595959', marginTop: 28, marginBottom: 28}}>步骤一：给你的{currentNounPlanFilterName(PROJECTS)}起个名称</div>
        <div className={indexStyles.operateAreaOut}>
          <div className={indexStyles.operateArea}>
            {/* 组织 */}
            {
              OrganizationId == '0' && (
                // <FormItem style={{width: 336}}>
                // {getFieldDecorator('_organization_id', {
                // })(
                  <Select
                    size={'large'}
                    value={_organization_id == '0' || !_organization_id?undefined:_organization_id}
                    style={{height: 40, marginBottom: 24}}
                    placeholder={"请选择组织（单位）"}
                    onChange={this.orgOnChange}
                  >
                    {
                      currentUserOrganizes.map( item => {
                        const { name, id } = item
                        return (
                          <Option value={id}>{name}</Option> 
                        )
                      })
                    }
                  </Select>
              //   )}
              // {/* </FormItem> */}
              )
            }
           
            {/* 项目名称 */}
            <FormItem style={{width: 336}}>
              {getFieldDecorator('board_name', {
                // initialValue:
              })(
                <Input placeholder={`输入${currentNounPlanFilterName(PROJECTS)}名称`}
                       onChange={this.boardNameChange.bind(this)}
                       style={{height: 40}}/>
              )}
            </FormItem>
            {/* 项目描述 */}
            <FormItem style={{width: 336}}>
              {getFieldDecorator('description', {
                // rules: [{ required: false, message: '请输入姓名', whitespace: true }],
              })(
                <TextArea style={{height: 208, resize: 'none'}} placeholder={`${currentNounPlanFilterName(PROJECTS)}描述（选填)`}
                          onChange={this.descriptionChange.bind(this)}/>
              )}
            </FormItem>
          </div>
        </div>
        {/* 确认 */}
        <FormItem
        >
          <Button type="primary" disabled={stepOneContinueDisabled || (OrganizationId == '0' && (!_organization_id || !checkIsHasPermission(ORG_TEAM_BOARD_CREATE, _organization_id)))} onClick={this.nextStep} style={{width: 208, height: 40}}>下一步</Button>
        </FormItem>
      </Form>
    )

    //打开应用
    const step_2 = (
      <div style={{margin: '0 auto', width: 392, height: 'auto'}}>
        <div style={{fontSize: 20, color: '#595959', marginTop: 28, marginBottom: 28}}>步骤二：选择本{currentNounPlanFilterName(PROJECTS)}具备的功能</div>
        <div className={indexStyles.operateAreaOut} style={{height: '300px'}}>
          <div className={indexStyles.operateArea} style={{height: '300px'}}>
            <div style={{margin: '0 auto', width: 392}}>
              {appsList.map((value, key) => {
                return (
                  <StepTwoListItem step_2_type={step_2_type} itemValue={{...value, itemKey: key}} key={key} stepTwoButtonClick={this.stepTwoButtonClick.bind(this)}/>
                )
              })}
            </div>
            <div style={{color: '#1890ff', textDecoration: 'underline', marginTop: 28, textAlign: 'left', cursor: 'pointer'}} onClick={this.setStepTwotype}>从现有项目复制</div>
          </div>
        </div>

        <div style={{marginTop: 20, marginBottom: 40, }}>
          <Button onClick={this.lastStep.bind(this, 1)} style={{width: 100, height: 40, marginRight: 20}}>上一步</Button>
          <Button type="primary" disabled={stepTwoContinueDisabled} onClick={this.nextStep} style={{width: 100, height: 40}}>下一步</Button>
        </div>
      </div>
    )
   //复制应用
    const step_2_copy = (
      <div style={{margin: '0 auto', width: 392, height: 'auto'}}>
        <div style={{fontSize: 20, color: '#595959', marginTop: 28, marginBottom: 28}}>复制现有项目</div>
        <div className={indexStyles.operateAreaOut} style={{height: '300px'}}>
          <div className={indexStyles.operateArea} style={{height: '300px'}}>
            <Select
              value={select_project_id}
              style={{ width: '100%' }}
              size={'large'}
              placeholder="选择项目"
              optionFilterProp="children"
              onChange={this.selectProjectChange}
            >
              {projects.map((value, key) => {
                const { board_id, board_name } = value
                return (
                  <Option value={board_id} key={board_id}>{board_name}</Option>
                )
              })}
            </Select>
            {select_project_id? (
              <div style={{margin: '0 auto', width: 392}}>
                {project_apps.map((value, key) => {
                  return (
                    <StepTwoListItem setCopyValue={this.setCopyValue} step_2_type={step_2_type} itemValue={{...value, itemKey: key}} key={key} stepTwoButtonClick={this.stepTwoButtonClick.bind(this)}/>
                  )
                })}
              </div>
            ):(
              <div className={indexStyles.no_select_board}>选择项目后进行下一步操作</div>
            )}

            <div style={{color: '#1890ff', textDecoration: 'underline', marginTop: 28, textAlign: 'left', cursor: 'pointer'}} onClick={this.setStepTwotype}>返回基础功能选择</div>
          </div>
        </div>

        <div style={{marginTop: 20, marginBottom: 40, }}>
          <Button onClick={this.lastStep.bind(this, 1)} style={{width: 100, height: 40, marginRight: 20}}>上一步</Button>
          <Button type="primary" disabled={stepTwoContinueDisabled} onClick={this.nextStep} style={{width: 100, height: 40}}>下一步</Button>
        </div>
      </div>
    )

    //邀请他人信息
    const step_3 = (
      <Form onSubmit={this.handleSubmit} style={{margin: '0 auto', width: 336}}>
        <div style={{fontSize: 20, color: '#595959', marginTop: 28, marginBottom: 28}}>步骤三：邀请他人一起参加{currentNounPlanFilterName(PROJECTS)}</div>
        {/* 他人信息 */}
        <InviteOthers _organization_id={_organization_id} isShowTitle={false} isShowSubmitBtn={false} handleInviteMemberReturnResult={this.handleInviteMemberReturnResult} />
        {/* 确认 */}
        <div style={{marginTop: 20, marginBottom: 20, }}>
          <Button onClick={this.lastStep.bind(this, 2)} style={{width: 100, height: 40, marginRight: 20}}>上一步</Button>
          <Button type="primary" htmlType={'submit'} onClick={this.nextStep} style={{width: 100, height: 40}}>完成创建</Button>
        </div>
      </Form>
    )

    return(
      <div>
        <CustormModal
          visible={addProjectModalVisible} //addProjectModalVisible
          maskClosable={false}
          width={472}
          footer={null}
          destroyOnClose
          style={{textAlign: 'center'}}
          onCancel={this.onCancel}
          overInner={( <div style={{height: step=== 2 ? 440: 'auto' }}>
            <div style={{display: step === 1?'block': 'none'}}>
              {step_1}
            </div>
            <div style={{display: step === 2?'block': 'none'}}>
              {step_2_type == 'normal'? step_2 : step_2_copy}
            </div>
            <div style={{display: step === 3?'block': 'none'}}>
              {step_3}
            </div>
            <div className={indexStyles.circleOut}>
              <div className={step===1 ? indexStyles.chooseCircle : ''}></div>
              <div className={step===2 ? indexStyles.chooseCircle : ''}></div>
              <div className={step===3 ? indexStyles.chooseCircle : ''}></div>
            </div>
          </div>)}
        >
        </CustormModal>
      </div>
    )
  }
}
export default Form.create()(CreateProject)

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ technological: { datas: {currentUserOrganizes = [] }} }) {
  return { currentUserOrganizes };
}
