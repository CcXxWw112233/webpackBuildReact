import React from 'react'
import { Icon } from 'antd';
import indexStyles from './index.less'
import globalStyles from '../../globalset/css/globalClassName.less'
import { operateIm } from './operateDom'

//设置点击区域用于 im关闭 imclick 这个类名在本组件和圈子成员聊天组件中应用
document.onclick=function (e) {
  const className = e.target.className
  if(!className || typeof className !== 'string') {
    operateIm('2')
  }
  if(className && typeof className == 'string' && className.indexOf('imclick') == -1) {
    operateIm('2')
  }
}

export default class ImChat extends React.Component {
  state={
    imIframOutVisible: '1'
  }
  setImIframOutVisible(e) {
    operateIm('0')
    // const { imIframOutVisible } = this.state
    // this.setState({
    //   imIframOutVisible: imIframOutVisible === '2' ? '3': '2',//!this.state.imIframOutVisible
    // })
  }
  render(){
    const { datas: {imData = {}} } = this.props.model
    const { access_token, username } = imData
    const { imIframOutVisible } = this.state

    return (
      <div>
        {/*聊天*/}
        {/*${imIframOutVisible === '1'?'': (imIframOutVisible ==='2'? indexStyles.imMessageHide: indexStyles.imMessageShow)}*/}
        <div id={'imMessage'} className={`${globalStyles.authTheme} ${indexStyles.imMessage} ${'imclick'}`} onClick={this.setImIframOutVisible.bind(this)}>
          {/*<Icon type="message" />*/}
          &#xe639;
        </div>

        {/*${imIframOutVisible === '1'?'': (imIframOutVisible ==='2'? indexStyles.showIframe: indexStyles.hideIframe)}*/}
        {/*<div id={'imIframOut'} className={`${indexStyles.imIframOut} ${'imclick'}`}>*/}
          {/*<div className={`${indexStyles.ifram} ${'imclick'}`}>*/}
            {/*{access_token?(*/}
              {/*<iframe*/}
                {/*src={`http://www.new-di.com/im/#/login?username=${username}&access_token=${access_token}`}*/}
                {/*frameBorder="0"*/}
                {/*width="500"*/}
                {/*height="500"*/}
                {/*id="imIFram"*/}
              {/*></iframe>*/}
            {/*):('')}*/}
            {/*<div className={`${indexStyles.closeimMessage} ${'imclick'}`} onClick={this.setImIframOutVisible.bind(this)}>*/}
              {/*<Icon type="close"  className={`${'imclick'}`} />*/}
            {/*</div>*/}
          {/*</div>*/}
        {/*</div>*/}
      </div>
    )
  }
}
