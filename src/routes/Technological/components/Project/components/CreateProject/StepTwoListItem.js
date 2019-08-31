import { Button, Switch } from 'antd'
import React from 'react'
import {currentNounPlanFilterName} from "../../../../../../utils/businessFunction";
import CopyCheck from './CopyCheck.js'

export default class StepTwoListItem extends React.Component{
  state = {
    buttonState: false,
    switchChecked: false,
  }
  buttonClick(data) {
    this.setState({
      buttonState: !this.state.buttonState
    }, function () {
      const isAdd = this.state.buttonState
      this.props.stepTwoButtonClick({...data, isAdd})
    })
  }
  switchChange = (data, switchChecked) => {
    const { itemValue } = this.props
    const { code } = itemValue
    this.setState({
      switchChecked
    }, () => {
      const isAdd = this.state.switchChecked
      this.props.stepTwoButtonClick({...data, isAdd})
      if(!isAdd) {
        switch (code) {
          case 'Tasks':
            break
          case 'Flows':
            const obj = {
              flows: {
                is_copy_flow_template: false
              }
            }
            this.props.setCopyValue && this.props.setCopyValue(obj)
            break
          case 'Files':
            break
          default:
            break
        }
      }
    })
  }

  render() {
    const { buttonState, switchChecked } = this.state
    const { step_2_type } = this.props
    const { id, name, description, status, itemKey, code } = this.props.itemValue

    return (
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 30}}>
        <div style={{textAlign: 'left', flex: 1}}>
          <span style={{fontSize: 16, color: '#000'}}>{code && currentNounPlanFilterName(code)? currentNounPlanFilterName(code) : name}</span><br/>
          <span style={{fontSize: 12, color: '#8c8c8c', display: 'inline-block', marginTop: 2, lineHeight: '18px'}}>{description}</span>
          {code == 'Flows' && switchChecked && step_2_type == 'copy' && (
            <CopyCheck code={code} setCopyValue={this.props.setCopyValue}/>
          )}
        </div>
        <div style={{marginLeft: 10, paddingTop: 8}}>
          {/*<Button disabled={ status === '0'}*/}
                  {/*onClick={this.buttonClick.bind(this, { itemKey, id })}*/}
                  {/*type={ !buttonState? 'primary' : ''}*/}
                  {/*style={{padding: '0 16px', height: 32}}>{status === '0' ? '未开放':(buttonState? '关闭': '开启')}</Button>*/}
          <Switch checked={switchChecked} onChange={this.switchChange.bind(this, { itemKey, id })} />
        </div>
      </div>
    )
 }

}
