import React from 'react'
import { Avatar } from 'antd'
import indexStyles from '../index.less'

export default class InitialChat extends React.Component {

  render(){
    const avatar = 'http://dian-lingxi-public.oss-cn-beijing.aliyuncs.com/2018-11-13/172f2c924443a267cea532150e76d344.jpg'
    const { collapsed } = this.props
    return(
      <div className={indexStyles.contain_3_item2} >
        <Avatar size={32} src={avatar}>u</Avatar>
        <div className={indexStyles.badge}></div>
      </div>
    )
  }

}
