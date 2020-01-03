import React from 'react'
import styles from './index.less'
const DetailConfirmInfoBox = ({content}) => {
  return (
    <div className={styles.ConfirmInfoOut_1} style={{display: 'flex', justifyContent: 'center'}}>
      {/* <div className={styles.hasnotCompetedLine}></div> */}
      <div className={styles.hasnotCompetedCircle}> 1 </div>
      <div className={styles.outDiv}>
        <div className={styles.arrow}></div>
        {content}
      </div>
    </div>
  )
}

export default DetailConfirmInfoBox