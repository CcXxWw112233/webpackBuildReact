/* eslint-disable import/first,react/react-in-jsx-scope */
import React from 'react'
import { Input, Mention, InputNumber, Radio, Checkbox, } from 'antd';
import indexStyles from './index.less'
import { FLOWS, UPLOAD_PROCESS_FILE_SIZE } from '../../../../../../globalset/js/constant'
import MentionAssignees from './MentionAssignees'
import { validatePositiveInt } from '../../../../../../utils/verify'
import { currentNounPlanFilterName } from "../../../../../../utils/businessFunction";
import { connect } from 'dva';

const TextArea = Input.TextArea
const RadioGroup = Radio.Group
const { toString, toContentState } = Mention;
@connect(mapStateToProps)
export default class EditFormTwo extends React.Component {
  //更新
  updateEdit(data, key) { //更新单个数组单个属性
    const { value } = data
    const { processEditDatasRecords = [], processEditDatas = [], processCurrentEditStep, dispatch } = this.props

    const new_processEditDatas = [...processEditDatas]
    const new_processEditDatasRecords_ = [...processEditDatasRecords]
    //更新processEditDatasRecords操作解构赋值避免操作污染
    const alltypedata = processEditDatasRecords[processCurrentEditStep]['alltypedata']
    let newAlltypedata = [...alltypedata]
    let obj = {}
    for (let i = 0; i < newAlltypedata.length; i++) {
      if (newAlltypedata[i]['node_type'] === '2') {
        obj = { ...newAlltypedata[i] }
        obj[key] = value
        newAlltypedata[i] = obj
      }
    }
    new_processEditDatas[processCurrentEditStep][key] = value
    new_processEditDatasRecords_[processCurrentEditStep] = {
      node_type: '2',
      alltypedata: newAlltypedata
    }
    ///更新processEditDatasRecords操作解构赋值避免操作污染
    // console.log(2, processEditDatasRecords[processCurrentEditStep+1])

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
    const newStr = str.length > 2 ? str.replace(/\s/, '').replace('@', '').replace(/@/gim, ',').replace(/\s,/gim, ',') : str
    this.updateEdit({ value: newStr }, 'assignees')
  }
  //流转类型
  transferModeChange(e) {
    this.updateEdit({ value: e.target.value }, 'transfer_mode')
  }
  //可撤回
  enableRevocationChange(e) {
    this.updateEdit({ value: e.target.checked ? '1' : '0' }, 'enable_revocation')
  }
  //是否填写意见
  enableOpinionChange(e) {
    this.updateEdit({ value: e.target.checked ? '1' : '0' }, 'enable_opinion')
  }
  //删除
  deleteProcessStep() {
    const { processEditDatasRecords = [], processEditDatas = [], processCurrentEditStep, dispatch } = this.props
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
        processCurrentEditStep: processCurrentEditStep > 1 ? processCurrentEditStep - 1 : 0
      }
    })
  }
  limitFileNumChange(value) {
    if (!validatePositiveInt(value)) {
      return false
    }
    const { processEditDatas = [], processCurrentEditStep = 0 } = this.props
    const { require_data } = processEditDatas[processCurrentEditStep]
    const { limit_file_num, limit_file_type, limit_file_size } = require_data
    let obj = {
      limit_file_num: value.toString(),
      limit_file_type,
      limit_file_size,
    }
    this.updateEdit({ value: obj }, 'require_data')

  }
  limitFileSizeChange(value) {
    if (!validatePositiveInt(value)) {
      return false
    }
    const { processEditDatas = [], processCurrentEditStep = 0 } = this.props
    const { require_data } = processEditDatas[processCurrentEditStep]
    const { limit_file_num, limit_file_type, limit_file_size } = require_data
    console.log(limit_file_num)
    let obj = {
      limit_file_num,
      limit_file_type,
      limit_file_size: value.toString(),
    }
    this.updateEdit({ value: obj }, 'require_data')
  }
  limitFileTypeChange(values) {
    const { processEditDatas = [], processCurrentEditStep = 0 } = this.props
    const { require_data } = processEditDatas[processCurrentEditStep]
    const { limit_file_num, limit_file_type, limit_file_size } = require_data
    let obj = {
      limit_file_num,
      limit_file_type: values.join(','),
      limit_file_size,
    }
    this.updateEdit({ value: obj }, 'require_data')
  }

  render() {
    const { processEditDatas = [], processCurrentEditStep = 0, projectDetailInfoData = {} } = this.props
    const { name, description, deadline_type, deadline_value, is_workday, assignee_type, assignees, transfer_mode, enable_revocation, enable_opinion, require_data = {} } = processEditDatas[processCurrentEditStep]
    const { limit_file_num, limit_file_type, limit_file_size } = require_data

    const limit_file_type_default = limit_file_type ? limit_file_type.split(',') : []
    //推进人一项
    const users = projectDetailInfoData.data
    let suggestions = []
    for (let i = 0; i < users.length; i++) {
      suggestions.push(users[i].full_name || users[i].email || users[i].mobile)
    }
    let defaultAssignees = assignees ? `@${assignees.replace(/,/gim, ' @')}` : ''
    // defaultAssignees = defaultAssignees || `@${suggestions[0]}`

    return (
      <div className={indexStyles.editFormOut}>
        <div className={indexStyles.editTop}>
          <div className={indexStyles.editTop_left}></div>
          <div className={indexStyles.editTop_right}>
            <div>上传</div>
            <div>
              通过上传文件来触发的步骤称之为上传，适用于引导用户在{currentNounPlanFilterName(FLOWS)}中按要求提交需收集的文件。
            </div>
          </div>
        </div>
        <div className={indexStyles.editBott}>
          {/*名称*/}
          <div className={indexStyles.editBottItem}>
            <div className={indexStyles.editBottItem_left}>
              <span style={{ fontSize: 14 }}>名称</span><br />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>给步骤起个名称</span>
            </div>
            <div className={indexStyles.editBottItem_right}>
              <Input value={name} placeholder="输入步骤名称" style={{ height: 40 }} onChange={this.nameChange.bind(this)} />
            </div>
          </div>
          {/*描述*/}
          <div className={indexStyles.editBottItem}>
            <div className={indexStyles.editBottItem_left}>
              <span style={{ fontSize: 14 }}>描述</span><br />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>指引如何完成与<br />明确标准</span>
            </div>
            <div className={indexStyles.editBottItem_right}>
              <TextArea value={description} style={{ height: 72, resize: 'none' }} onChange={this.descriptionChange.bind(this)} placeholder="输入描述" />
            </div>
          </div>
          {/*要求*/}
          <div className={indexStyles.editBottItem}>
            <div className={indexStyles.editBottItem_left}>
              <span>要求</span><br />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>上传数量、格式<br />及大小</span>
            </div>
            <div className={indexStyles.editBottItem_right}>
              <div style={{ color: '#262626' }}>
                限制上传数量为&nbsp;&nbsp;<InputNumber value={Number(limit_file_num)} onChange={this.limitFileNumChange.bind(this)} style={{ width: 70 }} min={1} max={100} />&nbsp;&nbsp;个文件<span style={{ color: '#8c8c8c' }}></span>
              </div>
              <div style={{ color: '#262626' }}>
                限制文件格式为&nbsp;&nbsp;
                <Checkbox.Group defaultValue={limit_file_type_default} onChange={this.limitFileTypeChange.bind(this)} style={{ color: '#262626', marginTop: 14 }}>
                  <Checkbox value="1" style={{ color: '#262626' }}>文档</Checkbox>
                  <Checkbox value="2" style={{ color: '#262626' }}>图像</Checkbox>
                  <Checkbox value="3" style={{ color: '#262626' }}>音频</Checkbox>
                  <Checkbox value="4" style={{ color: '#262626' }}>视频</Checkbox>
                </Checkbox.Group>
              </div>
              <div style={{ color: '#262626', marginTop: 14 }}>
                限制文件大小为&nbsp;&nbsp;<InputNumber value={Number(limit_file_size)} onChange={this.limitFileSizeChange.bind(this)} style={{ width: 70 }} defaultValue={0} min={0} max={UPLOAD_PROCESS_FILE_SIZE} />&nbsp;&nbsp;MB<span style={{ color: '#8c8c8c' }}>（最大为{UPLOAD_PROCESS_FILE_SIZE}MB）</span>
              </div>
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
              <span>推进人</span><br />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>由谁来推进{currentNounPlanFilterName(FLOWS)}</span>
            </div>
            <div className={indexStyles.editBottItem_right}>
              <RadioGroup onChange={this.assigneeTypeChange.bind(this)} value={assignee_type} >
                <Radio className={indexStyles.ratio} value={'1'}>任何人</Radio>
                <Radio className={indexStyles.ratio} value={'2'}>启动{currentNounPlanFilterName(FLOWS)}时指定</Radio>
                <Radio className={indexStyles.ratio} value={'3'}>固定人选</Radio>
              </RadioGroup>

              {assignee_type === '3' ? (
                <div>
                  <MentionAssignees users={users} defaultAssignees={defaultAssignees} suggestions={suggestions} mentionOnChange={this.mentionOnChange.bind(this)} />

                  {/*<Mention*/}
                  {/*style={{ width: '100%', height: 70 }}*/}
                  {/*onChange={this.mentionOnChange.bind(this)}*/}
                  {/*defaultValue={toContentState(defaultAssignees)}*/}
                  {/*suggestions={suggestions}*/}
                  {/*/>*/}
                </div>
              ) : ('')}

            </div>
          </div>
          {/*流转*/}
          <div className={indexStyles.editBottItem}>
            <div className={indexStyles.editBottItem_left}>
              <span>流转</span><br />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>设置流转逻辑</span>
            </div>
            <div className={indexStyles.editBottItem_right}>
              <RadioGroup onChange={this.transferModeChange.bind(this)} value={transfer_mode}>
                {/*<Radio className={indexStyles.ratio} value={'1'}>自由选择</Radio>*/}
                <Radio className={indexStyles.ratio} value={'2'}>下一步</Radio>
              </RadioGroup>
              <Checkbox value="1" onChange={this.enableRevocationChange.bind(this)} checked={enable_revocation === '1'} className={indexStyles.checkBox}>可撤回</Checkbox>
              <Checkbox value="2" onChange={this.enableOpinionChange.bind(this)} checked={enable_opinion === '1'} className={indexStyles.checkBox}>须填写意见</Checkbox>
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
      processCurrentEditStep,
    }
  },
  projectDetail: {
    datas: {
      projectDetailInfoData = {}
    }
  }
}) {
  return {
    processEditDatasRecords,
    processEditDatas,
    processCurrentEditStep,
    projectDetailInfoData
  }
}