import request from '../../utils/requestAxios'
import { REQUEST_DOMAIN, REQUEST_DOMAIN_BOARD, REQUEST_DOMAIN_WORK_BENCH, REQUEST_DOMAIN_ARTICLE, WE_APP_ID, REQUEST_DOMAIN_FLOWS, REQUEST_DOMAIN_TEAM_SHOW, REQUEST_INTERGFACE_VERSIONN } from '../../globalset/js/constant'
import Cookies from 'js-cookie'

export async function getTaskList_new({id}) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/card`,
    method: 'GET',
    params: {
      id,
      _organization_id: localStorage.getItem('OrganizationId')
    }
  })
}

export async function getMeetingList_new({id}) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/card/meeting`,
    method: 'GET',
    params: {
      id,
      _organization_id: localStorage.getItem('OrganizationId')
    }
  })
}

export async function getProcessList_new({id}) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/node`,
    method: 'GET',
    params: {
      id,
      _organization_id: localStorage.getItem('OrganizationId')
    }
  })
}

export async function getFileList_new({id}) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/file/curr/uploading`,
    method: 'GET',
    params: {
      id,
      _organization_id: localStorage.getItem('OrganizationId')
    }
  })
}

export async function setBoxFilterCon({id, rela_ids}) {
  //id 盒子id
  //rela_ids  当前所有选中的id, 多个以逗号隔开

  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/box/set`,
    method: 'PUT',
    data: {
        id,
        rela_ids
    }
  })
}

export async function getUpdateLog() {
  return request({
    url: `${REQUEST_DOMAIN}/user/annunciate/updatelog`,
    method: 'GET'
  })
}

export async function updateUpdateLogStatus(id) {
  return request({
    url: `${REQUEST_DOMAIN}/user/annunciate/updatelog/read/${id}`,
    method: 'PUT'
  })
}

export async function associateUser(associate_param = '') {
  const params = {
    associate_param
  }
  return request({
    url: `${REQUEST_DOMAIN}/user/associate`,
    method: 'GET',
    params
  })
}

export async function createShareLink(payload = {}) {
// board_id*	string 项目ID
// rela_id*	string 当前对象ID,比如是任务就是任务ID，文件就是当前文件的ID
// rela_type*	string 当前对象type,4=任务 2=流程 3=文件
  const { board_id = '', rela_id = '', rela_type = ''} = payload
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/share_link`,
    method: 'POST',
    data: {
      board_id,
      rela_id,
      rela_type,
    }
  })
}

export async function modifOrStopShareLink(payload = {}) {
  const {expiretime = '', id = '', status = ''} = payload
  const putData = {id}
  expiretime ? putData['expiretime'] = expiretime : ''
  status ? putData['status'] = status : ''

  return request({
    url: `${REQUEST_DOMAIN_BOARD}/share_link`,
    method: 'PUT',
    data: putData
  })
}

export async function createMeeting(payload) {
  const {board_id, flag, topic, user_for = null, user_ids = null, _organization_id } = payload
  return request({
    url: `${REQUEST_DOMAIN_TEAM_SHOW}/meeting`,
    method: 'POST',
    data: {
      _organization_id,
      board_id,
      flag,
      topic,
      user_for,
      user_ids
    }
  })

  // const body = {
  //   "board_id": 0,  //null | string
  //   "flag": 0,    //会议类型 2
  //   "org_id": 0,  //不用传
  //   "password": "string", //不用传
  //   "rela_id": 0,   //如果有bord_id ,board_id | null
  //   "topic": "string", //title
  //   "user_for": "string" //','
  // }
  //flag: 2 //会议类型，全局调用时，值为：2
}

//获取当前组织的所有成员信息
export async function getCurrentOrgAllMembers(params = {}) {
  
  return request({
    url: `${REQUEST_DOMAIN}/member/userlist`,
    method: 'GET',
    params: {
      ...params,
      _organization_id: params._organization_id || localStorage.getItem('OrganizationId')
    }
  })
}

//获取项目流程模板
export async function getProgressTemplateList(params) {
  return request({
    url: `${REQUEST_DOMAIN_FLOWS}/template`,
    method: 'GET',
    params
  })
}

//删除文件
export async function deleteUploadFile(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/file/remove`,
    method: 'DELETE',
    data
  })
}

//每次点击选区project的时候， 发送 board_id (project id) 给后台， -_- ..
export async function setCurrentProjectIdToServer({payload: {id}}) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/set`,
    method: 'PUT',
    data: {
      id
    }
  })
}

//获取当前项目我的文档
export async function getcurrentOrgFileUploads() {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/file/curr/uploading`,
    method: 'GET',
    params: {
      _organization_id: localStorage.getItem('OrganizationId'),
    }
  })
}

//获取当前项目我参与的会议
export async function getCurrentMeetingList() {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/card/meeting_arrangement`,
    method: 'GET',
    params: {
      _organization_id: localStorage.getItem('OrganizationId'),
    }
  })
}

//获取当前项目我审核的流程
export async function getCurrentBackLogProcessList() {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/flow/backlog`,
    method: 'GET',
    params: {
      _organization_id: localStorage.getItem('OrganizationId'),
    }
  })
}

//获取当前项目我负责的任务
export async function getCurrentResponsibleTask() {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/card/responsible`,
    method: 'GET',
    params: {
      _organization_id: localStorage.getItem('OrganizationId'),
    }
  })
}

//获取当前选择的项目的成员列表
export async function getCurrentSelectedProjectMembersList({projectId}) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/user/${projectId}`,
    method: 'GET'
  })
}

//获取项目列表
export async function getProjectList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}${REQUEST_INTERGFACE_VERSIONN}/board/list`,
    method: 'GET',
    params: {
      contain_type: '3',
      _organization_id: params._organization_id || localStorage.getItem('OrganizationId')
    }
  });
}
//获取项目列表(只返回用户)
export async function getProjectUserList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}${REQUEST_INTERGFACE_VERSIONN}/board/list`,
    method: 'GET',
    params: {
      contain_type: '2',
      _organization_id: localStorage.getItem('OrganizationId')
    }
  });
}
export async function getUserImToken(data) {
  return request({
    url: `${REQUEST_DOMAIN}/user/im/token`,
    method: 'GET',
  });
}
export async function getImRelaId(params) {
  return request({
    url: `${REQUEST_DOMAIN}/im/data/${params['relaId']}`,
    method: 'GET',
    params
  });
}

//获取项目列表(只返回用户)
export async function getProjectStarList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/star/list`,
    method: 'GET',
  });
}

//获取组织成员列表
export async function getOrgMembers(params) {
  return request({
    url: `${REQUEST_DOMAIN}/group`,
    method: 'GET',
  });
}

//获取工作台盒子
export async function getBoxList(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/box`,
    method: 'GET',
  });
}
//获取工作台单个盒子设置过滤条件
export async function getItemBoxFilter(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/box`,
    method: 'POST',
    data
  });
}
//获取工作台单个盒子设置过滤条件
export async function updateBox(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/box`,
    method: 'PUT',
    data
  });
}
//我负责的任务
export async function getResponsibleTaskList(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/card/responsible/${params['id']}`,
    method: 'GET',
  });
}
export async function getTodoList(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/card/responsible/${params['id']}`,
    method: 'GET',
  });
}

// 完成任务
export async function completeTask(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/realize`,
    method: 'PUT',
    data,
  });
}

//获取当前组织下我上传的文档上传的文档
export async function getCurrentOrgFileUploads(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/file/uploading`,
    method: 'GET',
  });
}

//我上传的文档
export async function getUploadedFileList(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/file/uploading/${params['id']}`,
    method: 'GET',
  });
}
//待我处理的流程
export async function getBackLogProcessList(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/flow/backlog/${params['id']}`,
    method: 'GET',
  });
}
//我参与的流程
export async function getJoinedProcessList(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/flow/participation/${params['id']}`,
    method: 'GET',
  });
}
//获取会议列表
export async function getMeetingList(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/card/meeting_arrangement/${params['id']}`,
    method: 'GET',
  });
}
//获取当前用户可用盒子列表
export async function getBoxUsableList(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/box/user/usable/list`,
    method: 'GET',
  });
}
//获取当前用户可用盒子列表
export async function addBox(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/box/user/add`,
    method: 'POST',
    data
  });
}
//获取当前用户可用盒子列表
export async function deleteBox(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/box/user/${params.box_type_id}`,
    method: 'DELETE',
    params
  });
}


//获取文章列表
export async function getArticleList(params) {
  return request({
    url: `${REQUEST_DOMAIN_ARTICLE}/articles`,
    method: 'GET',
    params,
    headers: {
      appid: WE_APP_ID(params['appType']),
    }
  }, {isNotLoading: true});
}
//获取文章内容
export async function getArticleDetail(params) {
  return request({
    url: `${REQUEST_DOMAIN_ARTICLE}/article/${params.id}`,
    method: 'GET',
    params: {
      ...params,
      openid: '0',
    },
    headers: {
      appid: WE_APP_ID(params['appType']),
    }
  }, {isNotLoading: true});
}
//更新阅读量
export async function updateViewCounter(data) {
  return request({
    url: `${REQUEST_DOMAIN_ARTICLE}/viewcounter`,
    method: 'PUT',
    data: {
      ...data,
      openid: '0',
    },
    headers: {
      appid: WE_APP_ID(data['appType']),
    },
  }, {isNotLoading: true});
}







