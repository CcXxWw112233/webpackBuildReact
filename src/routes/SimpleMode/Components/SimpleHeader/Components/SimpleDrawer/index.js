import React, { Component } from 'react'

import { Drawer } from 'antd'
import { connect } from 'dva'


export default class SimpleDrawer extends Component {
    state = {
        visible: true
    }

    onClose = (e) => {
        this.props.closeDrawer();
    }

    render() {
        const drawerHeight = document.body.scrollHeight;
        const { simpleDrawerContent = null, drawerTitle = '', style } = this.props;
        return (
            <Drawer
                title={drawerTitle}
                placement="right"
                closable={true}
                zIndex={1010}
                maskStyle={{
                    opacity: 1,
                }}
                width={'80%'}
                onClose={this.onClose}
                visible={true}
                keyboard={true}
                style={{ background: 'rgb(245, 245, 245)', height: (drawerHeight - 55) + 'px' }}

            >

                {simpleDrawerContent}
            </Drawer>
        )
    }
}

