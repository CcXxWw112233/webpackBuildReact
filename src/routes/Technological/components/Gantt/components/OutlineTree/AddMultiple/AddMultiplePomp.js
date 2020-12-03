import React, { Component } from 'react'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { Input, Button, message } from 'antd'
import { connect } from 'dva'
import {
  addMultipleCard,
  addMultipleMilestone
} from '../../../../../../../services/technological/task'
import { isApiResponseOk } from '../../../../../../../utils/handleResponseData'

const { TextArea } = Input
@connect(mapStateToProps)
export default class AddMultiplePomp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text_value: '',
      create_total: 0,
      create_names: []
    }
  }
  close = () => {
    const { setAddMultipleVisible } = this.props
    setAddMultipleVisible(false)
    this.setState({
      text_value: '',
      create_total: 0,
      create_names: []
    })
  }
  onChange = ({ target: { value } }) => {
    const text_rows = value.split(/\n/) || []
    const names = text_rows.filter(item => item.replace(/\s/gim, ''))
    console.log('sssatext_rows_1', text_rows)
    console.log('sssatext_rows_2', names)

    this.setState({
      text_value: value,
      create_total: names.length,
      create_names: names
    })
    console.log('ssadad', value, text_rows)
  }
  onOk = () => {
    const { input_add_type, gantt_board_id } = this.props
    const { create_names } = this.state
    const func = {
      '1': addMultipleMilestone,
      '2': addMultipleCard
    }
    func[input_add_type]({ board_id: gantt_board_id, names: create_names })
      .then(res => {
        if (isApiResponseOk(res)) {
          message.success('创建成功')
          const data = res.data
          const { outline_tree = [], dispatch } = this.props
          dispatch({
            type: 'gantt/handleOutLineTreeData',
            payload: {
              data: [].concat(outline_tree, data)
            }
          })
          this.close()
        } else {
          message.error(res.message)
        }
      })
      .catch(err => {
        message.error('创建失败，请重新创建')
      })
  }
  render() {
    const { create_total, text_value } = this.state
    const { input_add_type } = this.props
    const input_add_type_dec = {
      '1': '里程碑',
      '2': '任务'
    }
    return (
      <div
        className={`${styles.add_wrapper} ${globalStyles.global_card}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.add_header}>
          <div></div>
          <div className={styles.decscription}>
            创建多条{input_add_type_dec[input_add_type]}
          </div>
          <div
            className={`${globalStyles.authTheme} ${styles.close}`}
            onClick={this.close}
          >
            &#xe7fe;
          </div>
        </div>
        <div className={styles.add_body}>
          <TextArea
            value={text_value}
            autoSize={false}
            onChange={this.onChange}
            placeholder={'回车换行增加一条'}
          ></TextArea>
        </div>
        <div className={styles.add_footer}>
          <Button type={'primary'} disabled={!create_total} onClick={this.onOk}>
            创建{!!create_total ? `${create_total}条` : ''}
          </Button>
        </div>
      </div>
    )
  }
}
function mapStateToProps({
  gantt: {
    datas: { gantt_board_id, outline_tree }
  }
}) {
  return {
    gantt_board_id,
    outline_tree
  }
}
