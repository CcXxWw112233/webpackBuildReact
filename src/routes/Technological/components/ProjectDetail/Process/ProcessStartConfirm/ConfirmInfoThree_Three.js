import React from 'react'
import indexStyles from './index.less'
import { Input, Checkbox, Select, Button, DatePicker } from 'antd'
const Option = Select.Option;
const { MonthPicker, RangePicker } = DatePicker

export default class EditFormThree_One extends React.Component {

  render() {
    return (
      <div className={indexStyles.EditFormThreeOneOut}>
        <div className={indexStyles.EditFormThreeOneOut_form}>
          <div className={indexStyles.EditFormThreeOneOut_form_left}></div>
          <div className={indexStyles.EditFormThreeOneOut_form_right}>
            <div className={indexStyles.EditFormThreeOneOutItem} style={{ width: '100%'}}>
              <p>立案时间</p>
              {!true? (
                <DatePicker
                  style={{width: '100%', height: 24}}
                  size={'small'}
                  showTime
                  allowClear={false}
                  format="YYYY-MM-DD HH:mm"
                  placeholder=""
                />
              ) : (
<RangePicker
                size={'small'}
                style={{width: '100%', height: 24}}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                placeholder={[]}
              />
)}
            </div>
          </div>
        </div>
      </div>
    )
  }

}
