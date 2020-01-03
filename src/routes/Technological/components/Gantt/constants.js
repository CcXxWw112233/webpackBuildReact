export const date_area_height = 64
export const task_item_height = 40 //进度条高度
export const task_item_height_fold = 24 //进度条高度（折叠后）
export const task_item_margin_top = 20
export const ceil_height = 60 // task_item_height + task_item_margin_top 单元格高度
export const ceil_height_fold = 24 //折叠的单元格高度
export const group_rows_fold = 4

export const ganttIsFold = ({ group_view_type, gantt_board_id, show_board_fold }) => { //gantt是否折叠
    if (group_view_type == '1' && gantt_board_id == '0' && show_board_fold) {
        return true
    } else {
        return false
    }
}
// 转义时间
export const getDigitTime = (timestamp) => {
    if (!timestamp) {
        return 0
    }
    let new_timestamp = timestamp.toString()
    if (new_timestamp.length == 10) {
        new_timestamp = Number(new_timestamp) * 1000
    } else {
        new_timestamp = Number(new_timestamp)
    }
    return new_timestamp
}