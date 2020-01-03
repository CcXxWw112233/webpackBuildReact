import React, { Component } from 'react'
import { connect } from 'dva'
import { Icon, Select } from 'antd'
import RenderContent from './Component'
import infoRemindStyle from './index.less'

@connect(({ informRemind: { historyList = [], setInfoRemindList = [], is_add_remind, triggerList } }) => ({
    historyList, setInfoRemindList, is_add_remind, triggerList
}))
class DrawerInformContent extends Component {

    state = {
        new_user_info_list: [], // 获取用户列表
    }

    // componentWillReceiveProps(nextProps) {
    //     let type = nextProps.rela_type
    //     let temp_info_list = []
    //     let new_info_list = [...nextProps.user_remind_info]
    //     let all_member = {
    //         avatar: "",
    //         id: "0",
    //         user_id: '0',
    //         name: "项目全体成员",
    //     }
    //     switch (type) {
    //         case '1': // 任务
    //             var obj = {
    //                 avatar: "",
    //                 id: "1",
    //                 user_id: '1',
    //                 name: "执行人",
    //             }
    //             temp_info_list.unshift(obj, ...new_info_list)
    //             break;
    //         case '2': // 会议
    //             var obj = {
    //                 avatar: "",
    //                 id: "1",
    //                 user_id: '1',
    //                 name: "执行人",
    //             }
    //             temp_info_list.unshift(obj, ...new_info_list)
    //             break
    //         // case '3': // 流程
    //         //     var obj = {
    //         //         avatar: "",
    //         //         id: "1",
    //         //         user_id: '2',
    //         //         name: "动作推进人",
    //         //     }
    //         //     temp_info_list.unshift(obj, ...new_info_list)
    //         //     break;
    //         case '5': // 里程碑
    //             var obj = {
    //                 avatar: "",
    //                 id: "1",
    //                 user_id: '3',
    //                 name: "负责人",
    //             }
    //             temp_info_list.unshift(obj, ...new_info_list)
    //             break;
    //         default:
    //             temp_info_list.unshift(...new_info_list)
    //             break;
    //     }
    //     temp_info_list.unshift(all_member)
    //     // console.log(temp_info_list, 'sssss')
    //     this.setState({
    //         new_user_info_list: temp_info_list
    //     })
    // }

    /**
     * 添加提醒的方法
     * 需要把关联的id以及type类型传入
     */
    addInformRemind() {
        // const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {}
        // const { avatar, email, name, id, mobile } = userInfo
        // console.log(userInfo, 'sss')
        const { dispatch, rela_id, rela_type, setInfoRemindList = [], triggerList = [] } = this.props;
        let new_setInfoRemindList = [...setInfoRemindList];
        // 默认点击添加之后, 修改仓库的关联id`rela_id`以及事件类型, 并提供默认的选中提醒的触发器
        new_setInfoRemindList = new_setInfoRemindList.map(item => {
            let new_item = item
            new_item = { ...new_item, rela_id: rela_id, rela_type: rela_type, remind_trigger: triggerList[0] && triggerList[0].type_code, remind_time_type: 'd', remind_time_value: '1' }
            return new_item
        })

        dispatch({
            type: 'informRemind/updateDatas',
            payload: {
                setInfoRemindList: new_setInfoRemindList,
                is_add_remind: true,
                message_consumers: [],
            }
        })

    }

    render() {
        const { rela_id, user_remind_info, rela_type, commonExecutors = [], processPrincipalList=[], milestonePrincipals = [] } = this.props;
        // const { new_user_info_list = [] } = this.state
        return (
            <>
                <div className={infoRemindStyle.add_header}
                    onClick={() => { this.addInformRemind() }}
                >
                    <Icon className={infoRemindStyle.icon} type="plus-circle" />
                    <span className={infoRemindStyle.text}>添加提醒</span>
                </div>
                <RenderContent commonExecutors={commonExecutors} processPrincipalList={processPrincipalList} milestonePrincipals={milestonePrincipals} rela_id={rela_id} rela_type={rela_type} user_remind_info={user_remind_info} />
            </>
        )
    }
}

export default DrawerInformContent;
