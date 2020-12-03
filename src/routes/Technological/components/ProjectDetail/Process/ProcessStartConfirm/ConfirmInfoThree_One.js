import React from 'react'
import { Input } from 'antd'
import indexStyles from './index.less'

export default class ConfirmInfoThreeOne extends React.Component {
  render() {
    return (
      <div className={indexStyles.EditFormThreeOneOut}>
        <div className={indexStyles.EditFormThreeOneOut_form}>
          <div className={indexStyles.EditFormThreeOneOut_form_left}></div>
          <div className={indexStyles.EditFormThreeOneOut_form_right}>
            <div
              className={indexStyles.EditFormThreeOneOutItem}
              style={{ width: '100%' }}
            >
              <p>联系方式 [手机号码] (必填)</p>
              <Input style={{ height: 24, width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
