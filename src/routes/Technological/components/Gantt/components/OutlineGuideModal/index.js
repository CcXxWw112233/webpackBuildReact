import React, { useState } from 'react'
import { Modal, Button, Checkbox } from 'antd'
import styles from './index.less'
import outline_guide_img_url from '@/assets/gantt/outline_guide.gif'
import { connect } from 'dva'

function Index(props) {
  const { userGuide = {}, dispatch } = props
  const { board_gantt_outline } = userGuide
  const [no_confirm, setNoConfirm] = useState(false)
  const checkQuit = () => {
    if (no_confirm) {
      dispatch({
        type: 'technological/setUserGuide',
        payload: {
          board_gantt_outline: '1'
        }
      })
    } else {
      dispatch({
        type: 'technological/updateDatas',
        payload: {
          userGuide: { ...userGuide, board_gantt_outline: '1' }
        }
      })
    }
    props.handleClose && props.handleClose()
  }
  const onChange = e => {
    setNoConfirm(e.target.checked)
  }
  return (
    <Modal
      width={694}
      title={null}
      visible={board_gantt_outline == '0'}
      footer={null}
      centered
      // onOk={this.handleOk}
      onCancel={checkQuit}
      // onCancel={props.handleClose}
    >
      <div className={styles.headerTitle}>操作指引</div>
      <div className={styles.guideGifWrapper}>
        <img src={outline_guide_img_url} />
      </div>
      <div className={styles.guideButtons}>
        <div>
          <Checkbox checked={no_confirm} onChange={onChange}>
            不再提示
          </Checkbox>
        </div>
        <div>
          <Button type="primary" onClick={checkQuit}>
            我知道了
          </Button>
        </div>
      </div>
    </Modal>
  )
}
export default connect(({ technological: { datas: { userGuide = {} } } }) => ({
  userGuide
}))(Index)
