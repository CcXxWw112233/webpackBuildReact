
export const selectProjectDetailInfoData = state => state[(`projectDetail`)].datas.projectDetailInfoData //项目详情
export const selectProjectDetailBoardId = state => state[(`projectDetail`)].datas.board_id //项目详情

export const selectAppsSelectKey = state => state[(`projectDetail`)].datas.appsSelectKey //应用key
export const selectAppsSelectKeyIsAreadyClickArray = state => state[(`projectDetail`)].datas.appsSelectKeyIsAreadyClickArray ////点击过的appsSelectKey push进数组，用来记录无需重新查询数据

export const selectTaskGroupList = state => state[(`projectDetailTask`)].datas.taskGroupList //任务列表
export const selectTaskGroupListIndex = state => state[(`projectDetailTask`)].datas.taskGroupListIndex //当前选中任务分组index
export const selectTaskGroupListIndexIndex = state => state[(`projectDetailTask`)].datas.taskGroupListIndex_index //当前选中任务分组里的任务index
export const selectDrawContent = state => state[(`projectDetailTask`)].datas.drawContent //任务右方抽屉
export const selectDrawerVisible = state => state[(`projectDetailTask`)].datas.drawerVisible //任务右方抽屉
export const selectGetTaskGroupListArrangeType = state => state[(`projectDetailTask`)].datas.getTaskGroupListArrangeType
export const selectCardId = state => state[(`projectDetailTask`)].datas.card_id


//流程
export const selectCurrentProcessInstanceId = state => state[(`projectDetailProcess`)].datas.currentProcessInstanceId //当前查看的流程实例id
export const selectCurrentProcessTemplateList = state => state[(`projectDetailProcess`)].datas.processTemplateList
export const selectCurrentProcessList = state => state[(`projectDetailProcess`)].datas.processList
export const selectProcessDoingList = state => state[(`projectDetailProcess`)].datas.processDoingList
export const selectProcessStopedList = state => state[(`projectDetailProcess`)].datas.processStopedList
export const selectProcessComepletedList = state => state[(`projectDetailProcess`)].datas.processComepletedList
export const selectProcessTotalId = state => state[(`projectDetail`)].datas.totalId
export const selectCurr_node_sort = state => state[(`projectDetailProcess`)].datas.processInfo.curr_node_sort
export const selectNode_amount = state => state[(`projectDetailProcess`)].datas.processInfo.node_amount
export const selectProcessPageFlagStep = state => state[(`projectDetailProcess`)].datas.processPageFlagStep
export const selectProcessInfo = state => state[(`projectDetailProcess`)].datas.processInfo
export const selectCurrentProcessCompletedStep = state => state[(`projectDetailProcess`)].datas.processCurrentCompleteStep
export const selectProjectDetailProcessCommentList = state => state[(`projectDetailProcess`)].datas.workFlowComments
export const selectProkectDetailProcessId = state => state[(`projectDetailProcess`)].datas.id
//文档
export const selectCurrentParrentDirectoryId = state => state[(`projectDetailFile`)].datas.currentParrentDirectoryId //当前文件夹id
export const selectBreadcrumbList= state => state[(`projectDetailFile`)].datas.breadcrumbList //
export const selectFilePreviewCommitPointNumber= state => state[(`projectDetailFile`)].datas.filePreviewCommitPointNumber
export const selectFileList= state => state[(`projectDetailFile`)].datas.fileList
export const selectFilePreviewCurrentFileId= state => state[(`projectDetailFile`)].datas.filePreviewCurrentFileId//当前所预览的file_id
export const selectFilePreviewCommits= state => state[(`projectDetailFile`)].datas.filePreviewCommits
export const selectFilePreviewPointNumCommits = state => state[(`projectDetailFile`)].datas.filePreviewPointNumCommits
export const selectFilePreviewCommitPoints = state => state[(`projectDetailFile`)].datas.filePreviewCommitPoints
//新消息
export const selectNewMessageItem= state => state[(`technological`)].datas.newMessageItem //

//动态列表
export const selectNewsDynamicList = state => state[(`newsDynamic`)].datas.newsDynamicList //
export const selectNewsDynamicListOriginal = state => state[(`newsDynamic`)].datas.newsDynamicListOriginal //

//获取团队数据
export const selectGroupList = state => state[(`organizationMember`)].datas.groupList //


//组织
export const selectCurrentUserOrganizes = state => state[(`organizationMember`)].datas.currentUserOrganizes //
export const selectCurrentSelectOrganize = state => state[(`organizationMember`)].datas.currentSelectOrganize //

//工作台
export const selectKnowCityArticles = state => state[(`workbench`)].datas.knowCityArticles //
export const selectKnowPolicyArticles = state => state[(`workbench`)].datas.knowPolicyArticles //
export const selectBoxList = state => state[(`workbench`)].datas.boxList
export const selectBoxUsableList = state => state[(`workbench`)].datas.boxUsableList
export const selectBackLogProcessList = state => state[(`workbench`)].datas.backLogProcessList
export const selectProcessCommentList = state => state[(`workbenchDetailProcess`)].datas.workFlowComments
export const selectCurrentProcessCompletedStepWorkbench = state => state[(`workbenchDetailProcess`)].datas.processCurrentCompleteStep
export const selectProjectProcessCommentList = state => state[(`projectDetailProcess`)].datas.workFlowComments
export const selectProcessInfoWorkbench = state => state[(`workbenchDetailProcess`)].datas.processInfo
//im
export const selectImData = state => state[(`technological`)].datas.imData
