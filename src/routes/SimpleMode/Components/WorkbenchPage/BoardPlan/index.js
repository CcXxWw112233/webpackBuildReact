import React, { Component } from 'react'
import Gantt from '../../../../Technological/components/Gantt/index'

export default class index extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const workbenchBoxContentElementInfo = document.getElementById('container_workbenchBoxContent');
        let contentHeight = workbenchBoxContentElementInfo ? workbenchBoxContentElementInfo.offsetHeight : 0;
        console.log(contentHeight);
        return (
            <div>
                <Gantt gantt_card_height={contentHeight} />
            </div>
        )
    }
}
