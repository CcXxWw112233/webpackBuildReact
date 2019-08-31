import React, { Component } from 'react'
import CustormModal from '../../../../../components/CustormModal'
import globalStyles from '@/globalset/css/globalClassName.less'
import { joinBoardQRCode } from '../../../../../services/technological/project';
import { isApiResponseOk } from '../../../../../utils/handleResponseData';
import { message } from 'antd';
// import { joinBoardQRCode } from '../../.'
export default class WechatInviteToboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            qr_code_src: ''
        }
    }
    onCancel = () => {
        this.props.setModalVisibile && this.props.setModalVisibile()
    }
    componentWillReceiveProps(nextProps) {
        const { modalVisible } = nextProps
        if(modalVisible) {
            this.getQRCode()
        }
    }
    getQRCode = () => {
        const { board_id } = this.props
        joinBoardQRCode({ board_id, id: board_id }).then(res => {
            if(isApiResponseOk(res)) {
                this.setState({
                    qr_code_src: res.message
                })
            } else {
                message.error(res.message)
            }
        })
    }
    renderOverInner = () => {
        const { qr_code_src } = this.state
        return (
            <div>
                <div style={{ color: '#595959', fontSize: '20px', color: '#595959', fontWeight: 'bold' }}>
                    微信连接邀请参与人
                </div>
                <div style={{ margin: '0 auto', marginTop: 28, height: 196, width: 196, background: 'rgba(216,216,216,1)' }}>
                    <img src={qr_code_src} style={{height: 196, width: 196,}} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 14 }}>
                    <div style={{ width: 48, height: 1, background: 'rgba(0,0,0,0.09)' }}></div>
                    <div style={{ margin: '0 10px', color: 'rgba(0,0,0,0.65)', cursor: 'pointer' }} >
                        <i className={globalStyles.authTheme} style={{ color: '#46A318', marginRight: 4 }}>&#xe634;</i>
                        使用微信扫一扫
                    </div>
                    <div style={{ width: 48, height: 1, background: 'rgba(0,0,0,0.09)' }}></div>
                </div>

            </div>
        )
    }
    render() {
        const { modalVisible } = this.props
        return (
            <div>
                <CustormModal
                    visible={modalVisible} //modalVisible
                    width={472}
                    zIndex={1006}
                    maskClosable={false}
                    footer={null}
                    destroyOnClose
                    style={{ textAlign: 'center' }}
                    onCancel={this.onCancel}
                    overInner={this.renderOverInner()}
                ></CustormModal>
            </div>
        )
    }
}
WechatInviteToboard.defaultProps = {
    modalVisible: false,
    setModalVisibile: function () {

    }
}