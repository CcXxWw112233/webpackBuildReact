import React from 'react'
import styles from './index.less'
import { Tooltip } from 'antd'
import { platformNouns } from '../../globalset/clientCustorm'

//备案
const Copyright = () => {
  return (
    <div className={styles.CopyrightOuter}>
      {/* <Tooltip placement="top" title={'即将上线'}>
        <span style={{color: '#bfbfbf', cursor: 'pointer'}}>产品</span>
      </Tooltip>
      &nbsp;&nbsp;
      <Tooltip placement="top" title={'即将上线'}>
        <span style={{color: '#bfbfbf', cursor: 'pointer'}}>资源</span>
      </Tooltip>
        &nbsp;&nbsp;
      <Tooltip placement="top" title={'即将上线'}>
        <span style={{color: '#bfbfbf', cursor: 'pointer'}}>价格</span>
      </Tooltip> */}
      {/* &nbsp;&nbsp;| */}
      &nbsp;&nbsp;©&nbsp;&nbsp;2018&nbsp;&nbsp;{platformNouns}
      &nbsp;&nbsp;粤ICP备17146321号
    </div>
  )
}

Copyright.propTypes = {}

export default Copyright
