import React from 'react';
import indexStyles from './index.less'
import globalStyles from '../../globalset/css/globalClassName.less'
import { NODE_ENV } from '../../globalset/js/constant'
import { Icon, Tooltip } from 'antd'

//第三方登录授权
const BottomContent = (props) => {
  const { type, routingJump = function () {

  } } = props
  return (
    <div className={indexStyles.bottomWhole}>
      <div className={indexStyles.bottomWholeLeft} style={{marginTop: -8}}>
        {/* <Tooltip placement="top" title={'即将上线'}>
           <i className={globalStyles.authTheme} style={{fontStyle: 'normal', fontSize: 24, color: '#bfbfbf', cursor: 'pointer', }}>&#xe6be;</i>
        </Tooltip>
        <Tooltip placement="top" title={'即将上线'}>
          <i className={globalStyles.authTheme} style={{fontStyle: 'normal', fontSize: 24, color: '#bfbfbf', cursor: 'pointer', marginLeft: 6, marginTop: -6 }}>&#xe6c2;</i>
        </Tooltip>
        <Tooltip placement="top" title={'即将上线'}>
          <i className={globalStyles.authTheme} style={{fontStyle: 'normal', fontSize: 24, color: '#bfbfbf', cursor: 'pointer', marginLeft: 6, marginTop: -6 }}>&#xe6c1;</i>
        </Tooltip> */}

        {/*<Icon type="wechat"  style={{ fontSize: 20, color: '#BFBFBF',cursor: 'pointer' }} />*/}
        {/*<Icon type="qq"   style={{ fontSize: 20, color: '#BFBFBF', marginLeft: 8 ,cursor: 'pointer'}}/>*/}
        {/*<Icon type="qq"  style={{ fontSize: 20, color: '#BFBFBF', marginLeft: 8,cursor: 'pointer' }}/>*/}
      </div>
      <div className={indexStyles.bottomWholeRight}>
        {type === 'login'? ( <p><span onClick={routingJump.bind(null, '/retrievePassword')}>忘记密码？</span><span>|</span><span onClick={routingJump.bind(null, '/register')}>注册账户</span></p>) : (<span onClick={routingJump.bind(null, '/login')}>已有账户，直接登录</span>)}
      </div>
    </div>
  );
};

BottomContent.propTypes = {
};

export default BottomContent;
