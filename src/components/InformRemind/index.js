import React, { Component } from 'react'
import { Tooltip, Modal } from 'antd'
import { connect } from 'dva'
import globalStyles from '@/globalset/css/globalClassName.less'
import DrawInformRemindModal from './DrawInformRemindModal'
import DrawerInformContent from './DrawerInformContent'
import infoRemindStyle from './index.less'

@connect(({informRemind = {}}) => ({
    informRemind
}))
export default class index extends Component {

    state = {
        visible: '',
        title: '通知提醒',
    }

    /**
     * 通知提醒的点击事件
     * 1. 默认需要获取事件列表
     * 2. 还需要获取事件的消息列表(是否存在历史记录)
     */
    handleInformRemind() {
        const { dispatch, rela_type, rela_id } = this.props;
        // 1. 获取事件列表 需要传递是哪一个类型
        dispatch({
            type: "informRemind/getTriggerList",
            payload: {
                rela_type
            }
        })
        // 2. 获取事件的消息列表 需要传递对应的id、
        dispatch({
            type: "informRemind/getTriggerHistory",
            payload: {
                rela_id
            }
        })
        // 改变弹窗的显示隐藏
        this.setState({
            visible: true
        })
    }

    // 点击遮罩层或右上角叉或取消按钮的回调
    onCancel() {
        const { dispatch } = this.props;
        this.setState({
            visible: false,
        })
        dispatch({
            type: 'informRemind/updateDatas',
            payload: {
                is_add_remind: false,
                setInfoRemindList: [
                    {
                      rela_id: '',
                      rela_type: '',
                      remind_trigger: '',
                      remind_time_type: 'm',
                      remind_time_value: '1',
                      message_consumers: [], 
                    }
                  ], // 设置提醒的信息列表
                historyList: [], // 保存设置的历史记录提醒
                triggerList: [], // 每个对应的选项的类型列表
                is_add_remind: false, // 是否点击了添加操作 默认为false 没有点击
                remind_trigger: '', // 提醒触发器类型
                remind_time_type: 'm', // 提醒时间类型 m=分钟 h=小时 d=天 datetime=时间日期
                remind_time_value: '1', // 提醒时间值 如果是自定义时间传时间戳11位
                remind_edit_type: 1, // 可编辑的类型
            }
        })
    }

    render() {
        const { visible, title} =this.state;
        const { rela_type, rela_id, user_remind_info, workbenchExecutors = [], projectExecutors = [], processEditDatas = [], milestonePrincipals = [] } = this.props
        return (
            <React.Fragment>
                {/* 通知提醒的小图标 */}
                <Tooltip placement="top" title="通知提醒" arrowPointAtCenter>
                    <span 
                        className={`${globalStyles.authTheme} ${globalStyles.inform_remind}`}
                        onClick={ () => { this.handleInformRemind() } }
                    >
                        &#xe637;
                    </span>
                </Tooltip>
                {/* 点击时候的提醒框 */}
                <div className={infoRemindStyle.wrapperInfo}>
                    <DrawInformRemindModal
                        title={title}
                        visible={visible}
                        width={595}
                        zIndex={1007}
                        maskClosable={false}
                        destroyOnClose
                        mask={true}
                        footer={null}
                        onCancel={this.onCancel.bind(this)}
                        overInner={<DrawerInformContent milestonePrincipals={milestonePrincipals} processEditDatas={processEditDatas} projectExecutors={projectExecutors} workbenchExecutors={workbenchExecutors} rela_type={rela_type} rela_id={rela_id} user_remind_info={user_remind_info} />}
                    />
                </div>
            </React.Fragment>
        )
    }
}