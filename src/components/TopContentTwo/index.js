import React from 'react'
import indexStyles from './index.less'
import logoImg from '../../assets/library/lingxi_logo.png'
import { platformNouns } from '../../globalset/clientCustorm'

//页面顶部样式，参见注册成功后
const TopContentTwo = props => {
  const { text, productName } = props
  return (
    <div>
      <div className={indexStyles.circleDec}>
        <div className={indexStyles.circle}>
          <img src={logoImg} />
        </div>
        <div className={indexStyles.productName}>{platformNouns}</div>
      </div>
      <div className={indexStyles.description}>连接共生，协同共享</div>
    </div>
  )
}

TopContentTwo.propTypes = {}

export default TopContentTwo
