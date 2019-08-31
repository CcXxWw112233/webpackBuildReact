import React from 'react'
import indexStyles from './index.less'
import { Icon, Button, message } from 'antd'
import EditFormOne from './EditFormOne'
import EditFormTwo from './EditFormTwo'
import EditFormThree from './EditFormThree'
import EditFormFour from './EditFormFour'
import EditFormFive from './EditFormFive'
import SaveTemplate from './SaveTemplate'
import { processEditDatasConstant, processEditDatasRecordsConstant, processEditDatasItemOneConstant, processEditDatasRecordsItemOneConstant } from '../constant'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, PROJECT_FLOWS_FLOW_TEMPLATE, PROJECT_FLOWS_FLOW_CREATE,
  PROJECT_FILES_FILE_EDIT, FLOWS
} from "../../../../../../globalset/js/constant";
import globalStyles from '../../../../../../globalset/css/globalClassName.less'
import {checkIsHasPermissionInBoard, currentNounPlanFilterName} from "../../../../../../utils/businessFunction";


export default class EditProcess extends React.Component {
  state = {
    saveTemplateModalVisible: false
  }
  nodeTypeClick(node_type) {
    const { datas: { processEditDatasRecords = [], processEditDatas = [], processCurrentEditStep } } = this.props.model
    if(processCurrentEditStep===0 && node_type === '5') {
      message.warn(`${currentNounPlanFilterName(FLOWS)}节点第一步不能为审批类型`)
      return false
    }
    const alltypedata = processEditDatasRecords[processCurrentEditStep]['alltypedata']
    processEditDatasRecords[processCurrentEditStep] = {
      'node_type': node_type,
      'alltypedata': alltypedata
    }
    for (let val of processEditDatasRecords[processCurrentEditStep]['alltypedata']) {
      if(val['node_type'] === node_type) {
        processEditDatas[processCurrentEditStep] = val
      }
    }

    this.props.updateDatasProcess({
      processEditDatas,
      processEditDatasRecords,
      node_type,
    })
  }
  verrificationForm(processEditDatas) { //校验表单
    const currentData = processEditDatas[processEditDatas.length - 1]
    if(!currentData['name']){
      message.warn('请输入当前节点步骤名称', MESSAGE_DURATION_TIME)
      return false
    }
    if(currentData['assignee_type'] === '3'){
      if(!currentData['assignees']) {
        message.warn('推进人未选择固定人', MESSAGE_DURATION_TIME)
        return false
      }
    }
    if(currentData['node_type'] === '4' && currentData['cc_type'] === '2'){ //抄送
      if(!currentData['recipients']) {
        message.warn('未选择固定抄送人', MESSAGE_DURATION_TIME)
        return false
      }
    }
    return true
  }
  addNode(node_type) { //添加每一项默认里程碑开始，当前步数跳到最新
    const { datas: { processEditDatasRecords = [], processEditDatas = [], processCurrentEditStep = 0 } } = this.props.model
    const nodeObj = JSON.parse(JSON.stringify(processEditDatasItemOneConstant))
    const recordItemobjs = JSON.parse(JSON.stringify(processEditDatasRecordsItemOneConstant))

    if(!this.verrificationForm(processEditDatas)) {
      return false
    }
    processEditDatasRecords.push(recordItemobjs)
    processEditDatas.push(nodeObj)
    new Promise((resolve) => {
      this.props.updateDatasProcess({ //为了适应mention组件defaultValue在切换的时候不变
        node_type: '6'
      })
      resolve()
    }).then(res => {
      //正常操作
      this.props.updateDatasProcess({
        processEditDatasRecords,
        processEditDatas,
        processCurrentEditStep: processEditDatasRecords.length - 1,
        node_type: '1'
      })
    })
  }

  currentEditStepClick(data) {
    const { datas: { processEditDatasRecords = [], processEditDatas = [], processCurrentEditStep = 0 } } = this.props.model
    const { value, key } = data
    const { node_type } = value

    if(!this.verrificationForm(processEditDatas)) {
      return false
    }

    new Promise((resolve) => {
      this.props.updateDatasProcess({ //为了适应mention组件defaultValue在切换的时候不变
        node_type: '6'
      })
      resolve()
    }).then(res => {
      //正常操作
      this.props.updateDatasProcess({
        processCurrentEditStep: key,
        node_type
      })
    })
    // this.props.updateDatasProcess({
    //   processCurrentEditStep: key,
    //   node_type
    // })
  }

  //当设置为启动流程时指定，过滤掉设置的值,用于保存模板和直接启动接口调用
  requestFilterProcessEditDatas() {
    const { datas: { processEditDatas = [] } } = this.props.model
    const newProcessEditDatas = JSON.parse(JSON.stringify(processEditDatas))
    for(let i = 0; i < newProcessEditDatas.length; i ++ ) {
      if(newProcessEditDatas[i]['deadline_type'] === '2'){
        newProcessEditDatas[i]['deadline_value'] = ''
      }
      if(newProcessEditDatas[i]['assignee_type'] === '2'){
        newProcessEditDatas[i]['assignees'] = ''
      }
      if(newProcessEditDatas[i]['node_type'] === '4' && newProcessEditDatas[i]['cc_type'] === '1'){ //抄送
        newProcessEditDatas[i]['recipients'] = ''
      }
    }
    return newProcessEditDatas
  }
  setSaveTemplateModalVisible() {
    if(!checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_TEMPLATE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { datas: { processEditDatas } } = this.props.model
    if(!this.verrificationForm(processEditDatas)) {
      return false
    }
    this.setState({
      saveTemplateModalVisible: !this.state.saveTemplateModalVisible
    })
  }
  directStart(){
    if(!checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_CREATE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { datas: { projectDetailInfoData = {}, processEditDatas } } = this.props.model
    if(!this.verrificationForm(processEditDatas)) {
      return false
    }
    const { board_id } = projectDetailInfoData
    this.props.directStartSaveTemplate({
      board_id,
      is_retain: '0',
      node_data: this.requestFilterProcessEditDatas(), //processEditDatas,
      type: '1',
      template_no: '',
    })
  }
  quitEdit() {
    this.props.updateDatasProcess({
      processPageFlagStep: '1',
      node_type: '1', //节点类型
      processCurrentEditStep: 0, //编辑第几步，默认 0
      processEditDatas: JSON.parse(JSON.stringify(processEditDatasConstant)), //json数组，每添加一步编辑内容往里面put进去一个obj,刚开始默认含有一个里程碑的
      processEditDatasRecords: JSON.parse(JSON.stringify(processEditDatasRecordsConstant)) //每一步的每一个类型，记录，数组的全部数据step * type
    })
  }

  //删除
  deleteProcessStep(e){
    e.stopPropagation()
    const { datas: { processEditDatasRecords = [], processEditDatas = [], processCurrentEditStep } } = this.props.model
    if(processEditDatas.length <= 1|| processEditDatasRecords.length <= 1) {
      return false
    }
    let newProcessEditDatasRecords = null
    let newProcessEditDatas = null
    if(processEditDatasRecords.length) {
      // processEditDatasRecords.splice(processCurrentEditStep, 1)
      newProcessEditDatasRecords = JSON.parse(JSON.stringify(processEditDatasRecords))
      newProcessEditDatasRecords.splice(processCurrentEditStep, 1)
    }
    if(processEditDatas.length) {
      // processEditDatas.splice(processCurrentEditStep, 1)
      newProcessEditDatas = JSON.parse(JSON.stringify(processEditDatas))
      newProcessEditDatas.splice(processCurrentEditStep, 1)
    }
    this.props.updateDatasProcess({
      processCurrentEditStep: processCurrentEditStep >= 1 ? processCurrentEditStep - 1 : 0,
    })
    this.props.updateDatasProcess({
      processEditDatasRecords: newProcessEditDatasRecords,
      processEditDatas: newProcessEditDatas,
      node_type: processEditDatas[processCurrentEditStep > 1 ? processCurrentEditStep - 1 : 0]['node_type'],
    })
  }

  render() {
    const { datas: { node_type = '1', processEditDatas = [], processCurrentEditStep = 0, } } = this.props.model

    const filterForm = (node_type) => {
      let containner = ''
      switch (node_type) {
        case '1':
          containner = (
            <EditFormOne {...this.props} />
          )
          break
        case '2':
          containner = (
            <EditFormTwo {...this.props} />
          )
          break
        case '3':
          containner = (
            <EditFormThree {...this.props} />
          )
          break
        case '4':
          containner = (
            <EditFormFour{...this.props} />
          )
          break
        case '5':
          containner = (
            <EditFormFive {...this.props} />
          )
          break
        default:
           containner = ''
          break
      }
      return containner
    }

    return (
      <div className={indexStyles.editProcessOut}>
        <div className={indexStyles.editProcessLeft}>
          <div className={indexStyles.title}>
            {currentNounPlanFilterName(FLOWS)}步骤：
          </div>
          {/*itemSelect*/}
          {processEditDatas.map((value, key) => {
            return (
              <div key={key} className={processCurrentEditStep === key? indexStyles.itemSelect :indexStyles.item} onClick={this.currentEditStepClick.bind(this, {value, key})}>
                <div className={indexStyles.itemLeft}>{key+1}</div>
                <div className={indexStyles.itemRight}>{value.name}</div>
                {processCurrentEditStep === key && key != 0 ? (
                  <div className={`${globalStyles.authTheme} ${indexStyles.itemDelete}`} onClick={this.deleteProcessStep.bind(this)}>&#xe70f;</div>
                ) : ('')}
              </div>
            )
          })}
          <div className={indexStyles.addItem} onClick={this.addNode.bind(this, node_type)}>
            <Icon type="plus-circle-o" />
          </div>
        </div>
        <div className={indexStyles.editProcessMiddle}>
          <div className={indexStyles.title}>
            <div className={indexStyles.left}>步骤类型：</div>
            <div className={indexStyles.right}>
              <div className={node_type === '1' ? indexStyles.selectType : ''} onClick={this.nodeTypeClick.bind(this, '1')}>里程碑</div>
              <div className={node_type === '2' ? indexStyles.selectType : ''} onClick={this.nodeTypeClick.bind(this, '2')}>上传</div>
              <div className={node_type === '3' ? indexStyles.selectType : ''} onClick={this.nodeTypeClick.bind(this, '3')}>填写</div>
              <div className={node_type === '4' ? indexStyles.selectType : ''} onClick={this.nodeTypeClick.bind(this, '4')}>抄送</div>
              <div className={node_type === '5' ? indexStyles.selectType : ''} onClick={this.nodeTypeClick.bind(this, '5')}>审批</div>
            </div>
          </div>
          <div className={indexStyles.editFormCard}>
            {filterForm(node_type)}
          </div>
        </div>
        <div className={indexStyles.editProcessRight}>
          <div></div>
          <Button type={'primary'}style={{marginTop: 36}} onClick={this.setSaveTemplateModalVisible.bind(this)}>保存模板</Button>
          <Button style={{marginTop: 14}} onClick={this.directStart.bind(this)}>直接启动</Button>
          <Button style={{marginTop: 14, color: 'red'}} onClick={this.quitEdit.bind(this)}>退出编辑</Button>
        </div>
        <SaveTemplate requestFilterProcessEditDatas={this.requestFilterProcessEditDatas.bind(this)} {...this.props} setSaveTemplateModalVisible={this.setSaveTemplateModalVisible.bind(this)} saveTemplateModalVisible = {this.state.saveTemplateModalVisible}/>

      </div>
    )
  }
}
