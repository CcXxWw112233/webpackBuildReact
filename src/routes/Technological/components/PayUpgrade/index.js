import React, { Component } from 'react'
import { connect } from 'dva'
import indexStyles from './index.less';
import globalStyles from '@/globalset/css/globalClassName.less'
import { Modal, Button, Progress, Tooltip, Divider} from 'antd';

class PayUpgrade extends Component {

    componentDidMount() {
        const { dispatch } = this.props;
        const OrganizationId = localStorage.getItem('OrganizationId');
        if (OrganizationId !== '0') {
            dispatch({
                type: 'organizationManager/getPayingStatus',
                payload: {
                    orgId: OrganizationId
                }
            });
        }
    }
    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = e => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    toPay = () => {
        const OrganizationId = localStorage.getItem('OrganizationId');
        window.open(`/pay/organization/${OrganizationId}/orders/new`, '_blank')
    }

    handleCancel = e => {
        const { setPayUpgradeModalVisible } = this.props;
        setPayUpgradeModalVisible(false);
    };

    itemList = [
        { icon: '&#xe6bd;', name: '行业模板' },
        { icon: '&#xe664;', name: 'PDF图评' },
        { icon: '&#xe675;', name: '视频会议' },
        { icon: '&#xe66d;', name: '甘特图' },
        { icon: '&#xe6b3;', name: '存储空间' },
        { icon: '&#xe6c0;', name: '优秀案例' },
        { icon: '&#xe6bc;', name: '政策法规' },
        { icon: '&#xe6bf;', name: '投资地图' },
        { icon: '&#xe6bb;', name: '风采展示' },
    ]
    render() {
        const { datas = {} } = this.props.organizationManager;
        const { paymentInfo = {} } = datas;
        const infoData = {
            person: {
                currentNum: paymentInfo.member_number,
                limit: paymentInfo.member_number_limit,
            },
            project: {
                currentNum: paymentInfo.board_number,
                limit: paymentInfo.board_number_limit,
            }
        }
        return (
            <Modal
                title={<div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>用量与付费功能</div>}
                visible={true}
                footer={null}
                width={903}
                getContainer={() => document.getElementById('org_managementContainer') || document.body}
                onCancel={this.handleCancel}
            >
                <div className={indexStyles.infoTitle}>协作人数与项目数统计{paymentInfo.is_free_trial && paymentInfo.is_free_trial=='0' && <span style={{color: '#1890FF'}}>(已付费组织)</span>}</div>
                <div className={indexStyles.infoBox}>

                    <div className={indexStyles.organizationInfoWrapper}>
                        <div className={indexStyles.organizationInfo}>
                            <div className={indexStyles.organizationInfoRow}>
                                <div className={indexStyles.leftInfo}>
                                    协作人数
                                </div>
                                <div className={indexStyles.centerInfo}>
                                    <Progress
                                        strokeWidth={16}
                                        strokeColor={'#FFC069'}
                                        percent={(infoData.person.currentNum / infoData.person.limit) * 100}
                                        showInfo={false}
                                    />
                                </div>
                                <div className={indexStyles.rightInfo}>
                                    {infoData.person.currentNum}/ {infoData.person.limit}
                                </div>
                            </div>
                            <div className={indexStyles.organizationInfoRow}>
                                <div className={indexStyles.leftInfo}>
                                    项目数
                                </div>
                                <div className={indexStyles.centerInfo}>
                                    <Progress
                                        strokeWidth={16}
                                        strokeColor={'#69C0FF'}
                                        percent={(infoData.project.currentNum / infoData.project.limit) * 100}
                                        showInfo={false}
                                    />
                                </div>
                                <div className={indexStyles.rightInfo}>
                                    {infoData.project.currentNum}/ {paymentInfo.is_free_trial == 0 && infoData.project.limit == 99999 ? '不限' : infoData.project.limit}
                                </div>
                            </div>

                        </div>

                        <div className={indexStyles.upgradeBtnWrapper}>
                            {
                                paymentInfo.is_free_trial == 0 && (
                                    <div>
                                        <Tooltip title="续费功能即将开通">
                                            <Button type="primary" size={'default'} onClick={() => this.toPay()} disabled={true} >续费</Button>
                                        </Tooltip>
                                        <Divider type="vertical" />
                                        <Tooltip title="成员扩容功能即将开通"> 
                                            <Button type="primary" size={'default'} onClick={() => this.toPay()} disabled={true}>成员扩容</Button>
                                        </Tooltip>
                                    </div>
)}
                            {
                                paymentInfo.is_free_trial == 1 &&
                                <Button type="primary" size={'default'} onClick={() => this.toPay()} > 付费升级</Button>
                            }
                             
                        </div>
                    </div>
                </div>
                <div className={indexStyles.infoTitle}>付费功能</div>
                <div className={indexStyles.infoBox}>
                    <div className={indexStyles.featureList}>
                        {
                            this.itemList.map((item, index) => {
                                return (
                                    <div key={index} className={indexStyles.item}>
                                        <div className={indexStyles.iconWrapper}>
                                        <i dangerouslySetInnerHTML={{ __html: item.icon }} className={`${globalStyles.authTheme}`} ></i><br />
                                        </div>
                                        <div className={indexStyles.itemTitle}>
                                            {item.name}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </Modal >
        )
    }
}
function mapStateToProps({ organizationManager }) {
    return { organizationManager }
}
export default connect(mapStateToProps)(PayUpgrade)
