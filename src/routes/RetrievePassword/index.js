import React from 'react'
import { connect } from 'dva'
import QueueAnim from 'rc-queue-anim'
import { Row, Col } from 'antd'
import { Card } from 'antd'
import FormList from './FormList'
import globalClassNmae from '../../globalset/css/globalClassName.less'
import TopContent from '../../components/TopContent'
import BottomContent from '../../components/BottomContent'
import Copyright from '../../components/Copyright'
import DragMove from '../../components/DragMove'
const getEffectOrReducerByName = name => `retrievePassword/${name}`

const RetrievePassword = options => {
  const { dispatch, products } = options
  const formListProps = {
    formSubmit(data) {
      dispatch({
        type: getEffectOrReducerByName('formSubmit'),
        payload: data
      })
    }
  }
  return (
    <div className={globalClassNmae['page_style_1']}>
      <QueueAnim type="top">
        <div key={'one'}>
          <div
            style={{
              maxWidth: 472,
              margin: '0 auto',
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid rgba(217,217,217,1)',
              borderRadius: '4px'
            }}
          >
            <TopContent text={'找回密码'} hidenDescription={true} />
            <FormList {...formListProps} />
            <div
              style={{
                fontSize: 14,
                color: '#595959',
                width: 252,
                margin: '0 auto',
                marginBottom: 60
              }}
            >
              {/*如无法通过手机或邮箱找回请发送邮件至寻求帮助*/}
            </div>
          </div>
          <Copyright />
        </div>
      </QueueAnim>
    </div>
  )
}

// export default Products;
export default connect(({ retrievePassword }) => ({
  retrievePassword
}))(RetrievePassword)
