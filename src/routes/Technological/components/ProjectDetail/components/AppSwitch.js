import { Button } from 'antd'
import React from 'react'
import {currentNounPlanFilterName} from "../../../../../utils/businessFunction";

export default class StepTwoList extends React.Component{
  state = {
    buttonState: false,
    disabled: true,
  }
  componentDidMount() {
    this.initialSet(this.props)
  }
  componentWillReceiveProps(nextProps) {
    // this.initialSet(nextProps)
  }

  initialSet(props) {
    const { app_data = [], itemValue = {} } = props
    const { id } = itemValue
    let buttonState = false
    for(let val of app_data) {
      if(id == val['app_id']) {
        buttonState= true
        break
      }
    }
    this.setState({
      buttonState,
      disabled: false
    })
  }

  buttonClick(data) {
    this.setState({
      buttonState: !this.state.buttonState
    }, function () {
      const isAdd = this.state.buttonState
      this.props.stepTwoButtonClick({...data, isAdd})
    })
  }
  render() {
    const { buttonState, disabled } = this.state
    const { id, name, description, status, itemKey, code } = this.props.itemValue
    const { app_data = []} = this.props
    return (
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 30}}>
        <div style={{textAlign: 'left', flex: 1}}>
          <span style={{fontSize: 16, color: '#000'}}>{code && currentNounPlanFilterName(code)? currentNounPlanFilterName(code) : name}</span><br/>
          <span style={{fontSize: 12, color: '#8c8c8c', display: 'inline-block', marginTop: 2, lineHeight: '18px'}}>{description}</span>
        </div>
        <div style={{marginLeft: 10, paddingTop: 8}}>
          <Button disabled={ status === '0' || disabled}
                  onClick={this.buttonClick.bind(this, { itemKey, id })}
                  type={ !buttonState? 'primary' : ''}
                  style={{padding: '0 16px', height: 32}}>{status === '0' ? '未开放':(buttonState? '关闭': '开启')}</Button>
        </div>
      </div>
    )
 }

}
