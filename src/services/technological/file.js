//项目归档
import {
  REQUEST_DOMAIN_FILE,
  CONTENT_DATA_TYPE_FILE,
  CONTENT_DATA_TYPE_FOLDER,
  CONTENT_DATA_TYPE_CARD,
  REQUEST_INTERGFACE_VERSIONN
} from '../../globalset/js/constant'
import request from '../../utils/requestAxios'
import { getGlobalData } from '../../utils/businessFunction'

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

const createHeaderContentDataByFileId = cardId => {
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

//文件列表包括文件夹
export async function getFileList(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}${REQUEST_INTERGFACE_VERSIONN}/file`,
    method: 'GET',
    headers: params.folder_id
      ? createHeaderContentData(CONTENT_DATA_TYPE_FILE, params.folder_id)
      : {},
    params
  })
}

//文件列表包括文件夹
export async function getBoardFileList(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/list`,
    method: 'GET',
    headers: params.folder_id
      ? createHeaderContentData(CONTENT_DATA_TYPE_FILE, params.folder_id)
      : {},
    params
  })
}

// 复制文件到某一个文件夹
export async function fileCopy(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/copy`,
    method: 'PUT',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FILE, data.file_ids),
    data
  })
}

//文件下载
export async function fileDownload(params) {
  // debugger
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/download`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FILE, params.ids),
    params: {
      ...params,
      _organization_id:
        params._organization_id || getGlobalData('aboutBoardOrganizationId')
    }
  })
}

// 保存为新版本
export async function saveAsNewVersion(data) {
  // debugger
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/save_as/new_version`,
    method: 'POST',
    // headers: createHeaderContentData(CONTENT_DATA_TYPE_FILE, data.id),
    data
  })
}

//文件预览
export async function filePreview(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/preview/${params.id}`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FILE, params.id),
    params
  })
}

// 设为当前版本文件
export async function setCurrentVersionFile(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file`,
    method: 'PUT',
    // headers: createHeaderContentData(CONTENT_DATA_TYPE_FILE, params.fileIds),
    data
  })
}

// 更新文件版本描述
export async function updateVersionFileDescription(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file`,
    method: 'PUT',
    // headers: createHeaderContentData(CONTENT_DATA_TYPE_FILE, params.fileIds),
    data
  })
}

// 把文件文件夹 放入回收站
export async function fileRemove(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/remove`,
    method: 'POST',
    data
  })
}

// 单个文件删除
export async function fileDelete(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/remove`,
    method: 'DELETE',
    data
  })
}

// 把文件文件夹 移入到某一个文件夹
export async function fileMove(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/remove`,
    method: 'PUT',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FILE, data.file_ids),
    data
  })
}

// 文件上传
export async function fileUpload(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/upload`,
    method: 'PUT',
    data
  })
}

//文件版本列表
export async function fileVersionist(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/version_list`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FILE, params.version_id),
    params
  })
}

//回收站列表
export async function recycleBinList(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/recycle_bin`,
    method: 'GET',
    params
  })
}

//删除文件/文件夹
export async function deleteFile(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/recycle_bin`,
    method: 'POST',
    data
  })
}
//还原文件/文件夹
export async function restoreFile(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/recycle_bin/restore`,
    method: 'POST',
    data
  })
}

//文件夹树形列表
export async function getFolderList(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/folder`,
    method: 'GET',
    params
  })
}
//新建文件夹
export async function addNewFolder(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/folder`,
    method: 'POST',
    data
  })
}
//更新文件夹
export async function updateFolder(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/folder`,
    method: 'PUT',
    data
  })
}

//获取评论列表
export async function getPreviewFileCommits(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/comment/list`,
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FILE, params.id),
    method: 'GET',
    params
  })
}

//新增文件评论
export async function addFileCommit(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/comment`,
    method: 'POST',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FILE, data.file_id),
    data
  })
}

//删除评论
export async function deleteCommit(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/comment/${params.id}`,
    method: 'DELETE',
    params
  })
}

//获取图评点的列表
export async function getFileCommitPoints(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/comment/point`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FOLDER, params.id),
    params
  })
}

//文件预览-通过file_id, 从分享url里面获取
export async function filePreviewByUrl(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/preview/${params.id}`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FOLDER, params.id),
    params
  })
}
//文件信息-通过file_id, 从分享url里面获取, 查询文件信息，包括预览信息、版本列表
export async function fileInfoByUrl(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/info/${params.id}`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FOLDER, params.id),
    params
  })
}
//文件信息-通过file_id, 从分享url里面获取, 查询文件信息，包括预览信息、版本列表和路径(fileId)(废弃)
// export async function fileInfoByUrl_2(params) {
//   return request({
//     url: `${REQUEST_DOMAIN_FILE}/file/info`,
//     method: 'GET',
//     params,
//   });
// }

//获取pdf信息
export async function getFilePDFInfo(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/pdf/getAnnotationEditUrl`,
    method: 'GET',
    params: {
      ...params,
      _organization_id: getGlobalData('aboutBoardOrganizationId')
    }
  })
}

//获取文件详情的动态
export async function getFileDetailIssue(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/comment`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FOLDER, params.id),
    params
  })
}

// 所有动态
export async function getCardCommentListAll(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/comment`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FOLDER, params.id),
    params
  })
}

export async function fileConvertPdfAlsoUpdateVersion(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/pdf/convert`,
    method: 'GET',
    headers: createHeaderContentData(CONTENT_DATA_TYPE_FILE, params.id),
    params
  })
}

// 检查大文件是否在后台存在，需要通过md5
export async function checkFileMD5WithBack(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/upload/check`,
    method: 'POST',
    data
  })
}

// 上传大文件到oss，或者检验后端已经存在该文件，则需要调用该接口进行关联
export async function uploadToOssCalback(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/upload/callback`,
    method: 'POST',
    data
  })
}

// 根目录下所有文件，所有文件夹包括子文件夹（文件夹不包含文件）(项目归档保存)
export async function getFolderTreeWithArchives(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/archived/file/tree`,
    method: 'GET',
    params
  })
}

//获取已归档项目的文件（文件夹）列表
export async function getArchiveBoardFileList(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/archived/file`,
    method: 'GET',
    headers: params.folder_id
      ? createHeaderContentData(CONTENT_DATA_TYPE_FILE, params.folder_id)
      : {},
    params
  })
}

//搜索归档的列表
export async function searchArchives(data) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/archived/search`,
    method: 'POST',
    data
  })
}
