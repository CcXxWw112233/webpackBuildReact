import React from 'react'
import { Card, Input, Button, message } from 'antd'
import BraftEditor from 'braft-editor'
import ConfirmInfoOne from './ConfirmInfoOne'
import ConfirmInfoTwo from './ConfirmInfoTwo'
import ConfirmInfoThree from './ConfirmInfoThree'
import ConfirmInfoFour from './ConfirmInfoFour'
import ConfirmInfoFive from './ConfirmInfoFive'

import indexStyles from './index.less'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_FLOWS_FLOW_CREATE
} from '../../../../../../globalset/js/constant'
import { checkIsHasPermissionInBoard } from '../../../../../../utils/businessFunction'
import { connect } from 'dva'
@connect(mapStateToProps)
export default class ProcessStartConfirm extends React.Component {
  nameChange(e) {
    const value = e.target.value
    const { templateInfo = {}, dispatch } = this.props
    const new_tem = { ...templateInfo }
    new_tem['name'] = value

    dispatch({
      type: 'projectDetailProcess/updateDatas',
      payload: {
        templateInfo: new_tem
      }
    })
  }
  verrificationForm() {
    //校验启动流程时指定
    const { processEditDatas = [] } = this.props
    for (let i = 0; i < processEditDatas.length; i++) {
      const currentData = processEditDatas[i]

      //之前因为必须截止时间类型为启动流程指定，后面必须指定截止时间
      // if(currentData['deadline_type'] === '2'){
      //   if(currentData['deadline_value'].length < 10) {
      //     return false
      //   }
      // }
      // if(!currentData['deadline_value'] || currentData['deadline_value'].length < 10) {
      //   return false
      // }

      if (currentData['assignee_type'] === '2') {
        if (!currentData['assignees']) {
          return false
        }
      }
      if (currentData['node_type'] === '4' && currentData['cc_type'] === '1') {
        //抄送
        if (!currentData['recipients']) {
          return false
        }
      }
    }
    return true
  }
  startProcess() {
    if (!checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_CREATE)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { processEditDatas, templateInfo = {}, dispatch } = this.props
    const { name, description, id } = templateInfo

    dispatch({
      type: 'projectDetailProcess/createProcess',
      payload: {
        description,
        name,
        nodes: JSON.stringify(processEditDatas),
        template_id: id
      }
    })
  }
  render() {
    const that = this
    const { processEditDatas = [], templateInfo = {}, dispatch } = this.props
    const { name, description } = templateInfo
    const editorProps = {
      height: 0,
      contentFormat: 'html',
      placeholder: '输入流程描述',
      contentStyle: { minHeight: 150, height: 'auto' },
      initialContent: description,
      onChange: e => {
        const { templateInfo = {} } = this.props
        const new_tem = { ...templateInfo }
        new_tem['description'] = e.toHTML()
        dispatch({
          type: 'projectDetailProcess/updateDatas',
          payload: {
            templateInfo: new_tem
          }
        })
      },
      fontSizes: [14],
      controls: [
        'text-color',
        'bold',
        'italic',
        'underline',
        'strike-through',
        'text-align',
        'list_ul',
        'list_ol',
        'blockquote',
        'code',
        'split',
        'media'
      ]
    }

    const filterItem = (value, key) => {
      const { node_type } = value
      let containner = <div></div>
      const invitationType = '7'
      switch (node_type) {
        case '1':
          containner = (
            <ConfirmInfoOne
              itemKey={key}
              itemValue={value}
              invitationType={invitationType}
            />
          )
          break
        case '2':
          containner = (
            <ConfirmInfoTwo
              itemKey={key}
              itemValue={value}
              invitationType={invitationType}
            />
          )
          break
        case '3':
          containner = (
            <ConfirmInfoThree
              itemKey={key}
              itemValue={value}
              invitationType={invitationType}
            />
          )
          break
        case '4':
          containner = (
            <ConfirmInfoFour
              itemKey={key}
              itemValue={value}
              invitationType={invitationType}
            />
          )
          break
        case '5':
          containner = (
            <ConfirmInfoFive
              itemKey={key}
              itemValue={value}
              invitationType={invitationType}
            />
          )
          break
        default:
          containner = <div></div>
          break
      }
      return containner
    }

    return (
      <div>
        <Card className={indexStyles.confirmOutCard}>
          {/*<div className={indexStyles.toptitle}>*/}
          {/*<div></div>*/}
          {/*<div>投决立项</div>*/}
          {/*</div>*/}
          <div style={{ marginTop: 14 }}>
            <Input
              placeholder={'输入流程名称'}
              defaultValue={name}
              style={{ height: 40, fontSize: 18, color: '#262626' }}
              onChange={this.nameChange.bind(this)}
            />
          </div>
          <div className={indexStyles.editorWraper}>
            <BraftEditor {...editorProps} style={{ fontSize: 12 }} />
          </div>
          <div style={{ marginTop: 14 }}>
            {processEditDatas.map((value, key) => {
              return <div key={key}>{filterItem(value, key)}</div>
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Button
              disabled={!!!name || !this.verrificationForm()}
              style={{ height: 40, lineHeight: '40px', margin: '0 auto' }}
              type={'primary'}
              onClick={this.startProcess.bind(this)}
            >
              开始流程
            </Button>
          </div>
        </Card>
      </div>
    )
  }
}
function mapStateToProps({
  projectDetailProcess: {
    datas: { processEditDatas = [], templateInfo = {} }
  },
  technological: {
    datas: { userBoardPermissions }
  }
}) {
  return {
    processEditDatas,
    templateInfo,
    userBoardPermissions
  }
}
