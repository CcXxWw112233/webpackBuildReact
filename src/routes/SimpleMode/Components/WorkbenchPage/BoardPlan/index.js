import React from 'react'
import Gantt from '../../../../Technological/components/Gantt/index'

function index(props) {
  // const workbenchBoxContentElementInfo = document.getElementById('container_workbenchBoxContent');
  // let contentHeight = workbenchBoxContentElementInfo ? workbenchBoxContentElementInfo.offsetHeight : 0;
  const { workbenchBoxContent_height } = props
  return (
    <div>
      <Gantt gantt_card_height={workbenchBoxContent_height} />
    </div>
  )
}

export default index
