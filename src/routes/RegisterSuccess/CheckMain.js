import React from 'react';
import { Icon, Button, message } from 'antd'
import indexStyles from './index.less'
import {MESSAGE_DURATION_TIME} from "../../globalset/js/constant";

const CheckMain = (props) => {
  const { routingJump =function () {}} = props
  const { email = '', mobile = '', type = '', loadFlag = false, verifyResult } = props.datas
  const hash = {
    'qq.com': 'http://mail.qq.com',
    'gmail.com': 'http://mail.google.com',
    'sina.com': 'http://mail.sina.com.cn',
    '163.com': 'http://mail.163.com',
    '126.com': 'http://mail.126.com',
    'yeah.net': 'http://www.yeah.net/',
    'sohu.com': 'http://mail.sohu.com/',
    'tom.com': 'http://mail.tom.com/',
    'sogou.com': 'http://mail.sogou.com/',
    '139.com': 'http://mail.10086.cn/',
    'hotmail.com': 'http://www.hotmail.com',
    'live.com': 'http://login.live.com/',
    'live.cn': 'http://login.live.cn/',
    'live.com.cn': 'http://login.live.com.cn',
    '189.com': 'http://webmail16.189.cn/webmail/',
    'yahoo.com.cn': 'http://mail.cn.yahoo.com/',
    'yahoo.cn': 'http://mail.cn.yahoo.com/',
    'eyou.com': 'http://www.eyou.com/',
    '21cn.com': 'http://mail.21cn.com/',
    '188.com': 'http://www.188.com/',
    'foxmail.coom': 'http://www.foxmail.com'
  };
  const linkEmailLoginHash = (email) => {
    let urlEmailLogin
    const emailSufix = email.split('@')[1]
    for(let i in hash) {
      if(emailSufix === i) {
        urlEmailLogin = hash[i]
        break;
      }
    }
    if(urlEmailLogin) {
      window.open(urlEmailLogin)
    }else{
      message.warn('该邮箱无法正确定位，请手动登录。', MESSAGE_DURATION_TIME)
    }
  }
  const typeRegisterNode = (
<div>
    <div className={indexStyles.checkCircle}>
      <Icon type="check" style={{fontSize: 30, color: '#ffffff', fontWeight: 'Bold'}}/>
    </div>
    <div className={indexStyles.tip_1}>你的账户：{ email || mobile }注册成功</div>
    <div className={indexStyles.tip_2}>{email ? '激活邮件已发送到你的邮箱中，邮件有效期为24小时。请及时登录邮箱，点击邮箱中的链接激活账户。':''}</div>
    <div className={indexStyles.buttonOuter}>
      {email? (<Button type="primary" style={{height: 40, marginRight: 16}} onClick={linkEmailLoginHash.bind(null, email)}>查看邮箱</Button>):''}<Button style={{height: 40}} onClick={routingJump.bind(null, '/login')}>返回登录</Button>
    </div>
  </div>
)
  const typeVerifyNode = (
<div>
    {loadFlag ? (
      <div className={indexStyles.checkCircle} style={{backgroundColor: verifyResult? '#52C41B' : '#f5222d'}}>
        {verifyResult?(
          <Icon type="check" style={{fontSize: 30, color: '#ffffff', fontWeight: 'Bold'}}/>
        ):(
          <Icon type="close" style={{fontSize: 30, color: '#ffffff', fontWeight: 'Bold'}}/>
        )}
      </div>
    ) : (
      <div className={indexStyles.checkCircle} style={{background: 'none'}}></div>
    )}
    <div className={indexStyles.tip_1}>{verifyResult ? '验证成功' : '验证失败'}</div>
    <div className={indexStyles.buttonOuter}>
      <Button style={{height: 40}} onClick={routingJump.bind(null, '/login')}>返回登录</Button>
    </div>
  </div>
)

  return (
    <div>
      {type==='register'?(typeRegisterNode):(typeVerifyNode)}
    </div>
  );
};

CheckMain.propTypes = {
};

export default CheckMain;
