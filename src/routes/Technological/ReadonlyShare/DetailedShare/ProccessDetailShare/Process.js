import React from 'react'
import indexStyles from './index.less'
import ProcessDefault from './ProcessDefault'
import EditProcess from './EditProcess'
import ProcessStartConfirm from './ProcessStartConfirm'
import { connect } from 'dva'

const ProcessIndex = ({ processPageFlagStep }) => {
  const filterPage = () => {
    let containner = <div></div>
    switch (processPageFlagStep) {
      case '1':
        containner = <ProcessDefault />
        break
      case '2':
        containner = <EditProcess />
        break
      case '3':
        containner = <ProcessStartConfirm />
        break
      case '4':
        containner = <ProcessDefault />
        break
      default:
        containner = <ProcessDefault />
        break
    }
    return containner
  }
  return <div className={indexStyles.processOut}>{filterPage()}</div>
}
export default connect(mapStateToProps)(ProcessIndex)
function mapStateToProps({
  projectDetailProcess: {
    datas: { processPageFlagStep }
  }
}) {
  return { processPageFlagStep }
}
