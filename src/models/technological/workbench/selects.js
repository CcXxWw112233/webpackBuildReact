export const workbench_selectBoardId = state => state[(`workbenchPublicDatas`)].datas.board_id

//工作台
export const workbench_selectProjectList = state => state[(`workbench`)].datas.projectList
export const workbench_selectKnowCityArticles = state => state[(`workbench`)].datas.knowCityArticles //
export const workbench_selectKnowPolicyArticles = state => state[(`workbench`)].datas.knowPolicyArticles //
export const workbench_selectBoxList = state => state[(`workbench`)].datas.boxList
export const workbench_selectBoxUsableList = state => state[(`workbench`)].datas.boxUsableList
export const workbench_selectrResponsibleTaskList = state => state[(`workbench`)].datas.responsibleTaskList
export const workbench_selectrMeetingLsit = state => state[(`workbench`)].datas.meetingLsit
export const workbench_selectrBackLogProcessList = state => state[(`workbench`)].datas.backLogProcessList
export const workbench_selectrUploadedFileList = state => state[(`workbench`)].datas.uploadedFileList

// meetingLsit backLogProcessList uploadedFileList
//文档
export const workbench_selectCurrentParrentDirectoryId = state => state[(`workbenchFileDetail`)].datas.currentParrentDirectoryId //当前文件夹id
export const workbench_selectBreadcrumbList= state => state[(`workbenchFileDetail`)].datas.breadcrumbList //
export const workbench_selectFilePreviewCommitPointNumber= state => state[(`workbenchFileDetail`)].datas.filePreviewCommitPointNumber
export const workbench_selectFileList= state => state[(`workbenchFileDetail`)].datas.fileList
export const workbench_selectFilePreviewCurrentFileId= state => state[(`workbenchFileDetail`)].datas.filePreviewCurrentFileId//当前所预览的file_id
export const workbench_selectFilePreviewCommits= state => state[(`workbenchFileDetail`)].datas.filePreviewCommits
export const workbench_selectFilePreviewPointNumCommits = state => state[(`workbenchFileDetail`)].datas.filePreviewPointNumCommits
export const workbench_selectFilePreviewCommitPoints = state => state[(`workbenchFileDetail`)].datas.filePreviewCommitPoints

//工作台任务
export const workbench_selectDrawContent = state => state[(`workbenchTaskDetail`)].datas.drawContent
export const workbench_selectCard_id = state => state[(`workbenchTaskDetail`)].datas.card_id

export const workbench_currentProcessInstanceId = state => state[(`workbenchDetailProcess`)].datas.currentProcessInstanceId


export const workbench_projectTabCurrentSelectedProject = state => state[(`workbench`)].datas.projectTabCurrentSelectedProject
export const workbench_start_date = state => state[(`gantt`)].datas.start_date
export const workbench_end_date = state => state[(`gantt`)].datas.end_date
export const workbench_list_group = state => state[(`gantt`)].datas.list_group
export const workbench_group_rows = state => state[(`gantt`)].datas.group_rows
export const workbench_ceiHeight = state => state[(`gantt`)].datas.ceiHeight
export const workbench_ceilWidth = state => state[(`gantt`)].datas.ceilWidth
export const workbench_date_arr_one_level = state => state[(`gantt`)].datas.date_arr_one_level


