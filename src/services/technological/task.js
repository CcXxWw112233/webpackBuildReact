//项目归档
import {
  REQUEST_DOMAIN_BOARD, REQUEST_INTERGFACE_VERSIONN,
  CONTENT_DATA_TYPE_CARD,
  CONTENT_DATA_TYPE_BOARD,
  CONTENT_DATA_TYPE_FLOW,
  CONTENT_DATA_TYPE_FILE,
  CONTENT_DATA_TYPE_FOLDER,
  CONTENT_DATA_TYPE_LIST
} from "../../globalset/js/constant";
import request from "../../utils/requestAxios";
import { getGlobalData } from "../../utils/businessFunction";

const createHeaderContentData = (contentType, contentId) => {
  if (contentType && contentId) {
    return {
      BaseInfo: {
        contentDataType: contentType,
        contentDataId: contentId
      }
    }
  } else {
    return {}
  }
}

const createHeaderContentDataByCardId = (cardId) => {
  if (cardId) {
    return {
      BaseInfo: {
        contentDataType: CONTENT_DATA_TYPE_CARD,
        contentDataId: cardId
      }
    }
  } else {
    return {}
  }
}

const createHeaderContentDataByBoardId = (boardId) => {
  if (boardId) {
    return {
      BaseInfo: {
        contentDataType: CONTENT_DATA_TYPE_BOARD,
        contentDataId: boardId
      }
    }
  } else {
    return {}
  }
}

const getContentTypeByLinkLocal = (linkLocalCode) => {
  //3任务 2实例流程 21实例流程节点 22模板流程节点 4文件
  let contentType;
  switch (linkLocalCode) {
    case '2':
      contentType = CONTENT_DATA_TYPE_FLOW;
      break
    case '21':
      contentType = CONTENT_DATA_TYPE_FLOW;
      break
    case '22':
      contentType = 'flowtpl';
      break
    case '3':
      contentType = CONTENT_DATA_TYPE_CARD;
      break
    case '4':
      contentType = CONTENT_DATA_TYPE_FILE;
      break
    default:
  }
  return contentType;
}

//新增任务分组
export async function addTaskGroup(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/lists`,
    method: 'POST',
    data,
  });
}
//更新任务分组
export async function updateTaskGroup(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/lists`,
    method: 'PUT',
    data,
  });
}
//删除任务分组
export async function deleteTaskGroup(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/lists/${data.id}`,
    method: 'DELETE',
    data,
  });
}
// 任务列表
export async function getTaskGroupList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}${REQUEST_INTERGFACE_VERSIONN}/card`,
    method: 'GET',
    params,
  });
}

//新增任务——工作台新增
export async function addTaskInWorkbench(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/add`,
    method: 'POST',
    data,
  })
}

// 新增任务
export async function addTask(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card`,
    method: 'POST',
    data,
  });
}

// 更新任务
export async function updateTask(data, isNotLoading) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card`,
    method: 'PUT',
    headers: createHeaderContentDataByCardId(data.card_id),
    data,
  }, { isNotLoading });
}

// 删除任务
export async function deleteTask(id) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/${id}`,
    method: 'DELETE',
    headers: createHeaderContentDataByCardId(id),
    data: {
      id
    },
  });
}

// r任务归档
export async function archivedTask(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/archived`,
    method: 'PUT',
    headers: createHeaderContentDataByCardId(data.card_id),
    data,
  });
}

// 改变任务类型
export async function changeTaskType(data, isNotLoading) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/change`,
    method: 'PUT',
    headers: createHeaderContentDataByCardId(data.card_id),
    data,
  }, { isNotLoading });
}

// 新增子任务
export async function addChirldTask(data) {
  //debugger
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/child`,
    method: 'POST',
    headers: createHeaderContentDataByCardId(data.card_id),
    data,
  });
}

// 添加任务执行人
export async function addTaskExecutor(data) {
  //debugger
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/executor`,
    method: 'POST',
    headers: createHeaderContentDataByCardId(data.card_id),
    data,
  });
}
// 移出任务执行人
export async function removeTaskExecutor(data) {
  //debugger
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/executor`,
    method: 'DELETE',
    headers: createHeaderContentDataByCardId(data.card_id),
    data,
  });
}


// 完成任务
export async function completeTask(data) {
  //debugger
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/realize`,
    method: 'PUT',
    headers: createHeaderContentDataByCardId(data.card_id),
    data,
  });
}

// 添加任务标签
export async function addTaskTag(data) {
  //debugger
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/label`,
    method: 'POST',
    headers: createHeaderContentDataByCardId(data.card_id),
    data,
  });
}

// 移除任务标签
export async function removeTaskTag(data) {
  //debugger
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/label`,
    method: 'DELETE',
    headers: createHeaderContentDataByCardId(data.card_id),
    data,
  });
}

// 移出项目成员
export async function removeProjectMenbers(data) {

  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/remove`,
    method: 'DELETE',
    data,
  });
}


// 评论列表
export async function getCardCommentList(id) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/comment/list/${id}`,
    method: 'GET',
  });
}
//


// 新增评论
export async function addCardNewComment(data) {
  //debugger
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/comment`,
    method: 'POST',
    headers: createHeaderContentDataByCardId(data.card_id),
    data
  });
}
// s删除评论
export async function deleteCardNewComment(data) {
  //debugger
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/comment/${data.id}`,
    method: 'DELETE',
    headers: createHeaderContentDataByCardId(data.card_id),
    data
  });
}

//获取项目分组列表
export async function getProjectGoupList() {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}${REQUEST_INTERGFACE_VERSIONN}/board/list`,
    method: 'GET',
    params: {
      contain_type: '1',
      _organization_id: localStorage.getItem('OrganizationId')
    }
  });
}

//删除任务文件
export async function deleteTaskFile(data) {
  //debugger
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/attachment/${data.attachment_id}`,
    method: 'DELETE',
    headers: createHeaderContentDataByCardId(data.card_id),
    data
  });
}


//标签----------------------------
//获取项目标签列表
export async function getBoardTagList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/label`,
    method: 'GET',
    params
  });
}
// 新增项目标签
export async function addBoardTag(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/label`,
    method: 'POST',
    data
  })
}

//更新项目标签
export async function updateBoardTag(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/label`,
    method: 'PUT',
    data
  });
}

//置顶项目标签
export async function toTopBoardTag(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/label/top`,
    method: 'PUT',
    data
  });
}

//删除项目标签
export async function deleteBoardTag(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/label/${data.id}`,
    method: 'DELETE',
    data
  });
}

//查询任务详情
export async function getCardDetail(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/detail/${params.id}`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FOLDER, params.id),
    params
  });
}

// 获取新的携带属性的任务详情
export async function getCardWithAttributesDetail(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}${REQUEST_INTERGFACE_VERSIONN}/card/detail`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FOLDER, params.id),
    params
  })
}

// 获取任务详情中属性字段默认列表
export async function getCardAttributesList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/properties`,
    method: 'GET',
    params
  })
}

// 任务详细添加属性字段
export async function setCardAttributes(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/property`,
    method: 'POST',
    data
  })
}

// 删除任务动态属性
export async function removeCardAttributes(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/property`,
    method: 'DELETE',
    params
  })
}

// 移动任务属性排序
export async function sortCardAttribute(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/property/move`,
    method: 'POST',
    data
  })
}

//获取任务详情 ---- 解决分享出去之后的任务详情没有权限 ----暂时使用(10月14日)
export async function getShareCardDetail(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/detail/share/${params.id}`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_CARD, params.id),
    params
  });
}

//取消关联
export async function deleteRelation(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/content_link/${params.id}`,
    method: 'DELETE',
    headers: createHeaderContentData(getContentTypeByLinkLocal(params.link_local), params.link_id)
  })
}

//查看关联者下面关联的内容
export async function getRelations(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/content_link`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FOLDER, params.link_id),
    params
  });
}
//加入关联
export async function JoinRelation(data) {
  //debugger
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/content_link`,
    method: 'POST',
    headers: createHeaderContentData(getContentTypeByLinkLocal(data.link_local), data.link_id),
    data
  });
}
//输入连接获取连接相关列表
export async function getLinkList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/content_link/url_load`,
    method: 'GET',
    params
  }, { isNotLoading: true });
}
//取消关联
export async function cancelRelation(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/content_link/${data.id}`,
    method: 'DELETE',
    data
  });
}
//加载关联内容（前）
export async function getRelationsSelectionPre(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/content_link/prefix`,
    method: 'GET',
    params: {
      _organization_id: localStorage.getItem('OrganizationId') == '0' ? getGlobalData('aboutBoardOrganizationId') : localStorage.getItem('OrganizationId'),
      ...params,
    }
  }, { isNotLoading: true });
}
//加载关联内容（后）
export async function getRelationsSelectionSub(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/content_link/subfix`,
    method: 'GET',
    params
  }, { isNotLoading: true });
}

// 所有动态
export async function getCardCommentListAll(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/comment`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FOLDER, params.id),
    params
  })
}

//任务, 日程， 节点数据关联里程碑
export async function boardAppRelaMiletones(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/milestone/rela`,
    method: 'POST',
    data
  })
}
//任务, 日程， 节点数据取消关联里程碑
export async function boardAppCancelRelaMiletones(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/milestone/rela`,
    method: 'DELETE',
    data
  })
}
//获取里程碑详情
export async function getMilestoneDetail(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/milestone/detail/${params.id}`,
    method: 'GET',
    params
  })
}
//获取里程碑详情
export async function requestDeleteMiletone(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/milestone/${data.id}`,
    method: 'DELETE',
    data,
  })
}
//更新里程碑详情
export async function updateMilestone(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/milestone`,
    method: 'PUT',
    data
  })
}

//添加里程碑负责人
export async function addMilestoneExcutos(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/milestone/user/add`,
    method: 'POST',
    data
  })
}
//移除里程碑负责人
export async function removeMilestoneExcutos(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/milestone/user/remove`,
    method: 'POST',
    data
  })
}
