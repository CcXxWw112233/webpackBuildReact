import React from 'react';
import { connect } from 'dva';
import QueueAnim from 'rc-queue-anim'
import { Row, Col} from 'antd'
import { Card } from 'antd'
import FormList from './FormList'
import globalClassNmae from '../../globalset/css/globalClassName.less'
import TopContent from '../../components/TopContent'
import BottomContent from '../../components/BottomContent'
import Copyright from '../../components/Copyright'
const getEffectOrReducerByName = name => `resetPassword/${name}`

const ResetPassword = (options) => {
  const { dispatch } = options
  const { datas = {} } = options.resetPassword
  // console.log(datas)
  //传给表单
  const formListProps = {
    datas,
    formSubmit(data) {
      dispatch({
        type: getEffectOrReducerByName('formSubmit'),
        payload: data
      })
    },
    setPropsValue(payload) {
      dispatch({
        type: getEffectOrReducerByName('updateDatas'),
        payload: payload
      })
    },
    getVerificationcode(data, calback) {
      dispatch({
        type: getEffectOrReducerByName('getVerificationcode'),
        payload: {
          data,
          calback
        }
      })
    }
  }
  return (
    <div className={globalClassNmae['page_style_1']} >
      <QueueAnim type="top">
        <div key={'one'}>
          <div style={{ maxWidth: 472, margin: '0 auto', width: '100%', background: '#FFFFFF',
            border: '1px solid rgba(217,217,217,1)',
            borderRadius: '4px'}}>
            <TopContent text={'重置密码'} hidenDescription={true}/>
            <FormList {...formListProps}/>
            <div style={{height: 40}}></div>
            {/*<BottomContent type={'register'}/>*/}
          </div>
          <Copyright />
        </div>
      </QueueAnim>
    </div>
  );
};

// export default Products;
export default connect(({ resetPassword }) => ({
  resetPassword,
}))(ResetPassword);

