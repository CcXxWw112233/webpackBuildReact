import React from 'react';
import { connect } from 'dva';
import QueueAnim from 'rc-queue-anim'
import { Row, Col} from 'antd'
import { Card } from 'antd'
import globalClassNmae from '../../globalset/css/globalClassName.less'
import Copyright from '../../components/Copyright'
import TopContentTwo from '../../components/TopContentTwo'
import CheckMain from './CheckMain'

const getEffectOrReducerByName = name => `registerSuccess/${name}`
const RegisterSuccess = (options) => {
  const { dispatch, registerSuccess: { datas = {}} } = options
  const CheckMainProps = {
    datas,
    routingJump(path) {
      dispatch({
        type: getEffectOrReducerByName('routingJump'),
        payload: {
          route: path,
        },
      })
    }
  }
  return (
    <div className={globalClassNmae.page_style_1} style={{paddingTop: 108}}>
      <QueueAnim type="top">
        <div key={'one'}>
          <div style={{ maxWidth: 472, margin: '0 auto', width: '100%', }}>
            <TopContentTwo />
            <CheckMain {...CheckMainProps}/>
          </div>
          <Copyright />
        </div>
      </QueueAnim>
    </div>
  );
};

// export default Products;
export default connect(({ registerSuccess }) => ({
  registerSuccess,
}))(RegisterSuccess);

