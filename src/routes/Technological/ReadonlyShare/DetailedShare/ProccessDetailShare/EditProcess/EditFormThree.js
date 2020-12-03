/* eslint-disable react/jsx-pascal-case */
/* eslint-disable import/first,react/react-in-jsx-scope */
import React from 'react'
import { Input, Mention, Radio, Icon, Checkbox, Menu, Dropdown } from 'antd'
import indexStyles from './index.less'
import { validatePositiveInt } from '../../../../../../utils/verify'

const TextArea = Input.TextArea
const RadioGroup = Radio.Group
const { toString } = Mention
import EditFormThree_One from './EditFormThree_One'
import EditFormThree_Two from './EditFormThree_Two'
import EditFormThree_Three from './EditFormThree_Three'
import MentionAssignees from './MentionAssignees'
import { currentNounPlanFilterName } from '../../../../../../utils/businessFunction'
import { FLOWS } from '../../../../../../globalset/js/constant'
import { connect } from 'dva'

@connect(mapStateToProps)
export default class EditFormThree extends React.Component {
  //更新
  updateEdit(data, key) {
    //更新单个数组单个属性
    const { value } = data
    const {
      processEditDatasRecords = [],
      processEditDatas = [],
      processCurrentEditStep,
      dispatch
    } = this.props

    const new_processEditDatas = [...processEditDatas]
    const new_processEditDatasRecords_ = [...processEditDatasRecords]

    //更新processEditDatasRecords操作解构赋值避免操作污染
    const alltypedata =
      processEditDatasRecords[processCurrentEditStep]['alltypedata']
    let newAlltypedata = [...alltypedata]
    let obj = {}
    for (let i = 0; i < newAlltypedata.length; i++) {
      if (newAlltypedata[i]['node_type'] === '3') {
        obj = { ...newAlltypedata[i] }
        obj[key] = value
        newAlltypedata[i] = obj
      }
    }

    new_processEditDatas[processCurrentEditStep][key] = value
    new_processEditDatasRecords_[processCurrentEditStep] = {
      node_type: '3',
      alltypedata: newAlltypedata
    }
    ///更新processEditDatasRecords操作解构赋值避免操作污染

    dispatch({
      type: 'projectDetailProcess/updateDatas',
      payload: {
        processEditDatas: new_processEditDatas,
        processEditDatasRecords: new_processEditDatasRecords_
      }
    })
  }
  //名称
  nameChange(e) {
    this.updateEdit({ value: e.target.value }, 'name')
  }
  //描述
  descriptionChange(e) {
    this.updateEdit({ value: e.target.value }, 'description')
  }
  //完成类型
  deadlineChange(e) {
    this.updateEdit({ value: e.target.value }, 'deadline_type')
  }
  //完成时间
  deadlineDayChange(value) {
    if (!validatePositiveInt(value)) {
      return false
    }
    this.updateEdit({ value: value.toString() }, 'deadline_value')
  }
  // 是否工作日
  isWorkdayChange(e) {
    this.updateEdit({ value: e.target.checked ? '1' : '0' }, 'is_workday')
  }
  //推进人类型
  assigneeTypeChange(e) {
    this.updateEdit({ value: e.target.value }, 'assignee_type')
  }
  //提及
  mentionOnChange(contentState) {
    const str = toString(contentState)
    // const newStr = str.length > 2 ? str.replace('@', '').replace(/@/gim, ',').replace(/\s/gim, '') : str
    const newStr =
      str.length > 2
        ? str
            .replace(/\s/, '')
            .replace('@', '')
            .replace(/@/gim, ',')
            .replace(/\s,/gim, ',')
        : str
    this.updateEdit({ value: newStr }, 'assignees')
  }
  //流转类型
  transferModeChange(e) {
    this.updateEdit({ value: e.target.value }, 'transfer_mode')
  }
  //可撤回
  enableRevocationChange(e) {
    this.updateEdit(
      { value: e.target.checked ? '1' : '0' },
      'enable_revocation'
    )
  }
  //是否填写意见
  enableOpinionChange(e) {
    this.updateEdit({ value: e.target.checked ? '1' : '0' }, 'enable_opinion')
  }
  //删除
  deleteProcessStep() {
    const {
      processEditDatasRecords = [],
      processEditDatas = [],
      processCurrentEditStep,
      dispatch
    } = this.props
    if (processEditDatas.length <= 1 || processEditDatasRecords.length <= 1) {
      return false
    }
    if (processEditDatasRecords.length) {
      processEditDatasRecords.splice(processCurrentEditStep, 1)
    }
    if (processEditDatas.length) {
      processEditDatas.splice(processCurrentEditStep, 1)
    }
    dispatch({
      type: 'projectDetailProcess/updateDatas',
      payload: {
        processEditDatasRecords,
        processEditDatas,
        processCurrentEditStep:
          processCurrentEditStep > 1 ? processCurrentEditStep - 1 : 0
      }
    })
  }

  //表单填写项
  menuAddFormClick({ key }) {
    const { processEditDatas = [], processCurrentEditStep = 0 } = this.props
    const { form_data = [] } = processEditDatas[processCurrentEditStep]
    //推进人一项
    let obj = {}
    switch (key) {
      case '1':
        obj = {
          //输入框
          field_type: '1',
          property_name: '',
          default_value: '',
          verification_rule: '',
          val_length: '20',
          is_required: '0'
        }
        break
      case '2':
        obj = {
          //日期
          field_type: '2',
          property_name: '',
          default_value: '',
          verification_rule: 'SINGLE_DATE_TIME',
          is_required: '1'
        }
        break
      case '3': //下拉
        obj = {
          field_type: '3',
          property_name: '',
          default_value: '',
          verification_rule: 'redio',
          is_required: '0',
          options_data: []
        }
        break
      default:
        break
    }
    form_data.push(obj)
    this.updateEdit({ value: form_data }, 'form_data')
  }

  render() {
    const {
      processEditDatasRecords = [],
      processEditDatas = [],
      processCurrentEditStep = 0,
      projectDetailInfoData = {}
    } = this.props
    const {
      name,
      description,
      deadline_type,
      deadline_value,
      is_workday,
      assignee_type,
      assignees,
      transfer_mode,
      enable_revocation,
      enable_opinion,
      form_data = []
    } = processEditDatas[processCurrentEditStep]
    //推进人一项
    const users = projectDetailInfoData.data
    let suggestions = []
    for (let i = 0; i < users.length; i++) {
      suggestions.push(users[i].full_name || users[i].email || users[i].mobile)
    }
    let defaultAssignees = assignees
      ? `@${assignees.replace(/,/gim, ' @')}`
      : ''
    // defaultAssignees = defaultAssignees || `@${suggestions[0]}`

    const filterForm = (value, key) => {
      const { field_type } = value
      let container = <div></div>
      switch (field_type) {
        case '1':
          container = (
            <EditFormThree_One
              itemKey={key}
              itemValue={value}
              updateEdit={this.updateEdit.bind(this)}
            />
          )
          break
        case '3':
          container = (
            <EditFormThree_Two
              itemKey={key}
              itemValue={value}
              updateEdit={this.updateEdit.bind(this)}
            />
          )
          break
        case '2':
          container = (
            <EditFormThree_Three
              itemKey={key}
              itemValue={value}
              updateEdit={this.updateEdit.bind(this)}
            />
          )
          break
        default:
          break
      }
      return container
    }
    const menuAddForm = (
      <Menu onClick={this.menuAddFormClick.bind(this)}>
        <Menu.Item key="1">文本框</Menu.Item>
        <Menu.Item key="2">日期</Menu.Item>
        <Menu.Item key="3">下拉选项</Menu.Item>
      </Menu>
    )

    return (
      <div className={indexStyles.editFormOut}>
        <div className={indexStyles.editTop}>
          <div className={indexStyles.editTop_left}></div>
          <div className={indexStyles.editTop_right}>
            <div>填写</div>
            <div>
              通过手动标记或关联其他对象导致可自动触发来完成的节点步骤被称之为里程碑，可泛用在
              {currentNounPlanFilterName(FLOWS)}中的任意步骤。
            </div>
          </div>
        </div>
        <div className={indexStyles.editBott}>
          {/*名称*/}
          <div className={indexStyles.editBottItem}>
            <div className={indexStyles.editBottItem_left}>
              <span style={{ fontSize: 14 }}>名称</span>
              <br />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                给步骤起个名称
              </span>
            </div>
            <div className={indexStyles.editBottItem_right}>
              <Input
                value={name}
                placeholder="输入步骤名称"
                style={{ height: 40 }}
                onChange={this.nameChange.bind(this)}
              />
            </div>
          </div>
          {/*描述*/}
          <div className={indexStyles.editBottItem}>
            <div className={indexStyles.editBottItem_left}>
              <span style={{ fontSize: 14 }}>描述</span>
              <br />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                指引如何完成与
                <br />
                明确标准
              </span>
            </div>
            <div className={indexStyles.editBottItem_right}>
              <TextArea
                value={description}
                style={{ height: 72, resize: 'none' }}
                onChange={this.descriptionChange.bind(this)}
                placeholder="输入描述"
              />
            </div>
          </div>
          {/*表单*/}
          <div className={indexStyles.editBottItem}>
            <div className={indexStyles.editBottItem_left}>
              <span style={{ fontSize: 14 }}>表单</span>
              <br />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>填写项</span>
            </div>
            <div className={indexStyles.editBottItem_right}>
              {form_data.map((value, key) => {
                return <div key={key}>{filterForm(value, key)}</div>
              })}
              <Dropdown overlay={menuAddForm}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    cursor: 'pointer',
                    borderRadius: 18,
                    marginTop: 10,
                    alignItems: 'center',
                    border: '2px solid #595959',
                    textAlign: 'center',
                    display: 'flex'
                  }}
                >
                  <Icon
                    type="plus"
                    theme="outlined"
                    style={{ fontSize: 12, color: '#262626', marginLeft: 2 }}
                  />
                </div>
              </Dropdown>
            </div>
          </div>
          {/*完成期限*/}
          {/*<div className={indexStyles.editBottItem}>*/}
          {/*<div className={indexStyles.editBottItem_left}>*/}
          {/*<span>完成期限</span><br/>*/}
          {/*<span style={{fontSize: 12, color: '#8c8c8c'}}>从发起{currentNounPlanFilterName(FLOWS)}开始<br/>计算</span>*/}
          {/*</div>*/}
          {/*<div className={indexStyles.editBottItem_right}>*/}
          {/*<RadioGroup onChange={this.deadlineChange.bind(this)} value={deadline_type}>*/}
          {/*<Radio className={indexStyles.ratio} value={'1'}>无限期</Radio>*/}
          {/*<Radio className={indexStyles.ratio}value={'2'}>启动{currentNounPlanFilterName(FLOWS)}时指定</Radio>*/}
          {/*<Radio className={indexStyles.ratio} value={'3'}>固定天数</Radio>*/}
          {/*</RadioGroup>*/}
          {/*{deadline_type === '3'? (*/}
          {/*<div>*/}
          {/*<InputNumber min={1} value={Number(deadline_value)} onChange={this.deadlineDayChange.bind(this)} style={{width: 70, height: 32, marginRight: 8}} />天 <Checkbox onChange={this.isWorkdayChange.bind(this)} checked={is_workday === '1'} style={{margin: '8px 8px 0 12px '}}/>只计算工作日*/}
          {/*</div>*/}
          {/*):('')}*/}
          {/*</div>*/}
          {/*</div>*/}
          {/*推进人*/}
          <div className={indexStyles.editBottItem}>
            <div className={indexStyles.editBottItem_left}>
              <span>推进人</span>
              <br />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                由谁来推进{currentNounPlanFilterName(FLOWS)}
              </span>
            </div>
            <div className={indexStyles.editBottItem_right}>
              <RadioGroup
                onChange={this.assigneeTypeChange.bind(this)}
                value={assignee_type}
              >
                <Radio className={indexStyles.ratio} value={'1'}>
                  任何人
                </Radio>
                <Radio className={indexStyles.ratio} value={'2'}>
                  启动{currentNounPlanFilterName(FLOWS)}时指定
                </Radio>
                <Radio className={indexStyles.ratio} value={'3'}>
                  固定人选
                </Radio>
              </RadioGroup>
              {assignee_type === '3' ? (
                <div>
                  <MentionAssignees
                    users={users}
                    defaultAssignees={defaultAssignees}
                    suggestions={suggestions}
                    mentionOnChange={this.mentionOnChange.bind(this)}
                  />
                  {/*<Mention*/}
                  {/*style={{ width: '100%', height: 70 }}*/}
                  {/*onChange={this.mentionOnChange.bind(this)}*/}
                  {/*defaultValue={toContentState(defaultAssignees)}*/}
                  {/*suggestions={suggestions}*/}
                  {/*/>*/}
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
          {/*流转*/}
          <div className={indexStyles.editBottItem}>
            <div className={indexStyles.editBottItem_left}>
              <span>流转</span>
              <br />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                设置流转逻辑
              </span>
            </div>
            <div className={indexStyles.editBottItem_right}>
              <RadioGroup
                onChange={this.transferModeChange.bind(this)}
                value={transfer_mode}
              >
                {/*<Radio className={indexStyles.ratio} value={'1'}>自由选择</Radio>*/}
                <Radio className={indexStyles.ratio} value={'2'}>
                  下一步
                </Radio>
              </RadioGroup>
              <Checkbox
                value="1"
                onChange={this.enableRevocationChange.bind(this)}
                checked={enable_revocation === '1'}
                className={indexStyles.checkBox}
              >
                可撤回
              </Checkbox>
              <Checkbox
                value="2"
                onChange={this.enableOpinionChange.bind(this)}
                checked={enable_opinion === '1'}
                className={indexStyles.checkBox}
              >
                须填写意见
              </Checkbox>
            </div>
          </div>
          {/*删除*/}
          {/*<div style={{textAlign: 'center'}}>*/}
          {/*<Button style={{color: 'red',margin: '0 auto'}} onClick={this.deleteProcessStep.bind(this)}>删除步骤</Button>*/}
          {/*</div>*/}
          <div style={{ height: 20 }}></div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  projectDetailProcess: {
    datas: {
      processEditDatasRecords = [],
      processEditDatas = [],
      processCurrentEditStep
    }
  },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  }
}) {
  return {
    processEditDatasRecords,
    processEditDatas,
    processCurrentEditStep,
    projectDetailInfoData
  }
}
