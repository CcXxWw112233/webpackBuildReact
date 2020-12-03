import React, { Component } from 'react'
import indexStyles from './index.less'
import globalStyle from '@/globalset/css/globalClassName.less'
import { Button, Checkbox, message } from 'antd'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import { connect } from 'dva'

@connect(({ technological: { datas: { userGuide = {} } } }) => ({ userGuide }))
export default class index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      alarm: true
    }
  }

  componentDidMount() {}

  quit = () => {
    const { alarm } = this.state
    let { userGuide = {}, dispatch } = this.props
    let new_userGuide = { ...userGuide }
    if (alarm) {
      //允许下次通知，就不调接口更新了
      new_userGuide.milestone_gantt = '1'
      dispatch({
        type: 'technological/updateDatas',
        payload: {
          userGuide: new_userGuide
        }
      })
      return
    }
    dispatch({
      type: 'technological/setUserGuide',
      payload: {
        milestone_gantt: '1'
      }
    })
  }
  checkChange = bool => {
    this.setState({
      alarm: !bool
    })
  }
  render() {
    const { userGuide = {} } = this.props
    const { milestone_gantt } = userGuide
    return (
      <div>
        {milestone_gantt == '0' ? (
          <div
            className={`${indexStyles.miletone_guide} ${indexStyles.position_1}`}
          >
            <div className={indexStyles.top}>
              <div className={`${globalStyle.authTheme} ${indexStyles.smile}`}>
                &#xe847;
              </div>
              <div className={indexStyles.title}>点击日期可以建立里程碑</div>
            </div>
            <div className={indexStyles.bottom}>
              <div className={indexStyles.bottom_left}>
                <Checkbox onChange={this.checkChange}>不再提醒</Checkbox>
              </div>
              <div className={indexStyles.bottom_right}>
                <Button type={'primary'} size={'small'} onClick={this.quit}>
                  我知道了
                </Button>
              </div>
            </div>
            <div className={indexStyles.triangle}></div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    )
  }
}
