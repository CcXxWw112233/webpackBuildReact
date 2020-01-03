export const afterCreateBoardUpdateGantt = (dispatch) => {
    dispatch({
        type: 'gantt/getGanttData',
        payload: {

        }
    })
    dispatch({
        type: 'gantt/getAboutAppsBoards',
        payload: {

        }
    })

    dispatch({
        type: 'gantt/getAboutGroupBoards',
        payload: {

        }
    })
    dispatch({
        type: 'gantt/getAboutUsersBoards',
        payload: {

        }
    })
    dispatch({
        type: 'gantt/getContentFiterBoardTree',
        payload: {

        }
    })
    dispatch({
        type: 'gantt/getContentFiterUserTree',
        payload: {

        }
    })
    // lx_utils.updateUserList()
}
export const afterChangeBoardUpdateGantt = ({ dispatch, board_id }) => {
    dispatch({
        type: 'gantt/updateDatas',
        payload: {
            gantt_board_id: board_id,
        }
    })
    afterCreateBoardUpdateGantt(dispatch)
}
export const handleChangeBoardViewScrollTop = ({ group_view_type, gantt_board_id, target_scrollTop_board_storage }) => {
    const target = document.getElementById('gantt_card_out_middle')
    if (!target) {
        return
    }
    if (gantt_board_id == '0' && group_view_type == '1') { //在查看项目的情况下
        target.scrollTop = target_scrollTop_board_storage
    } else {
        target.scrollTop = 0
    }
}
// 在删除项目后做的操作
export const deleteBoardFollow = () => {
    global.constants.lx_utils.updateUserList()
}

// 计算时间跨度
const calTimeSpan = (init_time, end_time) => {
    const start_due_time_span_time = init_time - end_time
    const start_due_time_span = start_due_time_span_time / (24 * 60 * 60 * 1000)
    const span_date = Math.floor(start_due_time_span)
    const span_hour = ((start_due_time_span - span_date) * 24).toFixed(1)
    return {
        span_date,
        span_hour
    }
}

const handleDescription = (date, hour) => {
    // console.log('sssss', 'ss', 0 != '0')
    let date_des = `${date}天`
    let hour_des = `${hour}时`
    if (date == 0) {
        date_des = ``
    }
    if (hour == '0.0') {
        hour_des = ``
    } else if (hour == '24.0') {
        hour_des = ''
        date_des = `${Number(date) + 1}天`
    }
    return {
        date_des,
        hour_des
    }
}
// 计算任务的逾期情况和时间跨度
export const filterDueTimeSpan = ({ start_time, due_time, is_has_end_time, is_has_start_time, is_realize }) => {
    let due_description = ''
    if (!!!due_time) {
        return {
            is_overdue: false,
            due_description
        }
    }
    const now = new Date().getTime()
    const new_start_time = start_time.toString().length > 10 ? Number(start_time) : Number(start_time) * 1000
    const new_due_time = due_time.toString().length > 10 ? Number(due_time) : Number(due_time) * 1000

    // 计算逾期
    const due_time_span = now - new_due_time

    //逾期
    const aready_due_date = calTimeSpan(now, new_due_time).span_date
    const aready_due_hour = calTimeSpan(now, new_due_time).span_hour

    //总长
    const { span_date, span_hour } = calTimeSpan(new_due_time, new_start_time)

    if (due_time_span < 0 || is_realize == '1') { //非逾期
        const { date_des, hour_des } = handleDescription(span_date, span_hour)
        if (is_has_end_time && is_has_start_time) {
            due_description = `共${date_des}${hour_des}`
        }
        return {
            is_overdue: false,
            due_description
        }
    } else {
        const { date_des, hour_des } = handleDescription(aready_due_date, aready_due_hour)
        return {
            is_overdue: true,
            due_description: `已逾期${date_des}${hour_des}`
        }
    }
}

// 甘特图消息未读
// 当前某一项任务是否拥有未读, type: card/file,  relaDataId: 所检测的对象id
export const cardItemIsHasUnRead = ({ relaDataId, im_all_latest_unread_messages = [] }) => {
    const flag = im_all_latest_unread_messages.findIndex(item => (item.relaDataId == relaDataId || item.cardId == relaDataId)) != -1
    if (flag) {
        return true
    }
    return false
}
// 解构消息的实例
const handleNewsItem = (val) => {
    const { content_data } = val
    const contentJson = JSON.parse(content_data) || {}
    const { data = {} } = contentJson
    const { d = "{}" } = data
    const gold_data = JSON.parse(d) || {}
    // console.log('sssss_gold_data', gold_data)
    return gold_data
}
// 文件模块是否存在未读数
export const fileModuleIsHasUnRead = ({ board_id, im_all_latest_unread_messages = [], wil_handle_types = [] }) => {
    let count = 0
    for (let val of im_all_latest_unread_messages) {
        if (val.action == 'board.file.upload' || val.action == 'board.file.version.upload') {
            count++
        }
    }
    return count
}
// 当前某一项文件item是否拥有未读, 
export const fileItemIsHasUnRead = ({ relaDataId, im_all_latest_unread_messages = [] }) => {
    // 递归查询父级id最终push到一个数组，然后在数组下检索传递进来的relaDataId，如果存在就是存在未读
    const arr = []
    const folderPathRecursion = ({ parent_folder }) => {
        const { id, parent_id, } = parent_folder
        if (!id) {
            return
        }
        const parent_folder_ = parent_folder['parent_folder'] || {}
        if (parent_id != '0') {
            arr.push(id)
            folderPathRecursion({ parent_folder: parent_folder_ })
        }
    }
    const current_item = im_all_latest_unread_messages.find(item => relaDataId == item.relaDataId)
    if (!current_item) {
        return false
    }
    const { folder_path = {} } = handleNewsItem(current_item)
    const { parent_folder = {} } = folder_path
    folderPathRecursion({ parent_folder })
    if (arr.indexOf(relaDataId) != -1) {
        return true
    }
    return false
}
// 某一项文件夹拥有未读数, relaDataId: 当前文件夹id
export const folderItemHasUnReadNo = ({ type, relaDataId, im_all_latest_unread_messages = [], wil_handle_types = [] }) => {
    // 递归查询父级id最终push到一个数组，然后在数组下检索传递进来的relaDataId，如果存在就是存在未读
    if (!im_all_latest_unread_messages.length) {
        return 0
    }

    if (type == '2') { //1文件2文件夹
        const file_has_unread = !!im_all_latest_unread_messages.find(item => relaDataId == item.relaDataId)
        if (file_has_unread) {
            return 1
        }
    }
    const current_item = im_all_latest_unread_messages.find(item => {
        const gold_item = handleNewsItem(item)
        const { action } = item
        if (action == 'board.file.upload' || action == 'board.file.version.upload') {
            const { content: { folder_path = {} } } = gold_item
            const { id } = folder_path
            if (id == relaDataId) {
                return item
            }
        }
    })
    if (!current_item) {
        return false
    }

    // 这里arr已经更新
    let count = 0
    for (let val of im_all_latest_unread_messages) {
        if ((val.action == 'board.file.upload' || val.action == 'board.file.version.upload')) {
            const { content: { folder_path = {} } } = handleNewsItem(val)
            const { parent_folder = {}, id } = folder_path
            let arr = [id]
            const folderPathRecursion = ({ parent_folder }) => {
                const { id, parent_id, } = parent_folder
                if (!id) {
                    return arr
                }
                const parent_folder_ = parent_folder['parent_folder'] || {}
                if (parent_id != '0') {
                    arr.push(id)
                    folderPathRecursion({ parent_folder: parent_folder_, })
                }
            }
            folderPathRecursion({ parent_folder })
            if (arr.indexOf(relaDataId) != -1) {
                count++
            }
        }
    }
    return count
}
// 当前文件夹判断最新推送消息属于board.file.upload   (场景： 点击多级文件夹后, 如果有文件上传，推送过来的所属文件夹id，和当前查阅文件夹id匹配)
export const currentFolderJudegeFileUpload = ({ folder_id, im_all_latest_unread_messages = [] }) => {
    const length = im_all_latest_unread_messages.length
    const latest_item = im_all_latest_unread_messages[length - 1]
    if (!latest_item) {
        return false
    }
    const { action, content: { folder_path = {} } } = handleNewsItem(latest_item)

    if (action == 'board.file.upload') {
        const { id } = folder_path
        if (id == folder_id) {
            return true
        }
    }
    return false
}