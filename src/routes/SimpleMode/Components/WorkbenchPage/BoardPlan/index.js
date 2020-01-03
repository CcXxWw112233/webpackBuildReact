import React from 'react'
import Gantt from '../../../../Technological/components/Gantt/index'

function index() {
    const workbenchBoxContentElementInfo = document.getElementById('container_workbenchBoxContent');
    let contentHeight = workbenchBoxContentElementInfo ? workbenchBoxContentElementInfo.offsetHeight : 0;
    return (
        <div>
            <Gantt gantt_card_height={contentHeight} />
        </div>
    )
}

export default index

