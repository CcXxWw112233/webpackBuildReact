import React, { Component } from 'react'
import { connect } from 'dva'
import { message, Dropdown, Menu, Modal, Breadcrumb, Tooltip } from 'antd'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import mainContentStyles from './MainContent.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import UploadAttachment from '@/components/UploadAttachment'
import RichTextEditor from '@/components/RichTextEditor'
import MilestoneAdd from '@/components/MilestoneAdd'
import LabelDataComponent from '@/components/LabelDataComponent'
import AppendSubTask from './components/AppendSubTask'
// import FileDetailModal from '@/components/FileDetailModal'
import { timestampFormat, compareTwoTimestamp } from '@/utils/util'
import { getSubfixName } from "@/utils/businessFunction";
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, PROJECT_TEAM_CARD_COMPLETE, PROJECT_TEAM_CARD_EDIT, PROJECT_TEAM_CARD_ATTACHMENT_UPLOAD
} from "@/globalset/js/constant";
import { isApiResponseOk } from '../../utils/handleResponseData'
import { deleteTaskFile } from '../../services/technological/task'
import {
  checkIsHasPermissionInBoard, checkIsHasPermissionInVisitControl,
} from "@/utils/businessFunction";

@connect(mapStateToProps)
export default class DragDropContentComponent extends Component {

  constructor(props) {
    super(props)
    this.state = {
      previewFileModalVisibile: false,
      selectedKeys: [], // 选择字段的选项
    }
  }

  // 获取 currentDrawerContent 数据
  getCurrentDrawerContentPropsModelDatasExecutors = () => {
    const { drawContent: { properties = [] } } = this.props
    const pricipleInfo = properties.filter(item => item.code == 'EXECUTOR')[0]
    return pricipleInfo || {}
  }

  // 检测不同类型的权限控制类型的是否显示
  checkDiffCategoriesAuthoritiesIsVisible = (code) => {
    const { drawContent = {} } = this.props
    const { data } = this.getCurrentDrawerContentPropsModelDatasExecutors()

    const { privileges = [], board_id, is_privilege } = drawContent
    return {
      'visit_control_edit': function () {// 是否是有编辑权限
        return checkIsHasPermissionInVisitControl('edit', privileges, is_privilege, data ? data : [], checkIsHasPermissionInBoard(code, board_id))
      },
      'visit_control_comment': function () {
        return checkIsHasPermissionInVisitControl('comment', privileges, is_privilege, data ? data : [], checkIsHasPermissionInBoard(code, board_id))
      },
    }
  }

  // 更新drawContent中的数据以及调用父级列表更新数据
  updateDrawContentWithUpdateParentListDatas = ({ drawContent, card_id, name, value, operate_properties_code }) => {
    const { dispatch } = this.props
    dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        drawContent
      }
    })
    if (name && value) {
      this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent, card_id, name, value, operate_properties_code })
    }
  }

  // 过滤那些需要更新的字段
  filterCurrentUpdateDatasField = (code, value) => {
    const { drawContent: { properties = [] } } = this.props
    let new_properties = [...properties]
    new_properties = new_properties.map(item => {
      if (item.code == code) {
        let new_item = item
        new_item = { ...item, data: value }
        return new_item
      } else {
        let new_item = item
        return new_item
      }
    })
    return new_properties
  }

   // 里程碑选择回调 S
  onMilestoneSelectedChange = (data) => {
    const { dispatch, drawContent } = this.props;
    const { card_id, type, due_time } = drawContent
    const { key, type: actionType, info } = data;
    const id_time_arr = key.split('__')
    const id = id_time_arr[0]
    const deadline = id_time_arr[1]
    if (!compareTwoTimestamp(deadline, due_time)) {
      message.warn('关联里程碑的截止日期不能小于任务的截止日期')
      return
    }

    if (actionType === 'add') {
      const params = {
        rela_id: card_id,
        id,
        origin_type: type
      };
      dispatch({
        type: 'publicTaskDetailModal/joinMilestone',
        payload: {
          ...params
        }
      });

      // drawContent['milestone_data'] = info;
      drawContent['properties'] = this.filterCurrentUpdateDatasField('MILESTONE', info)
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: { ...drawContent }
        }
      })
    }
    if (actionType === 'remove') {
      const params = {
        rela_id: card_id,
        id,
      }
      dispatch({
        type: 'publicTaskDetailModal/shiftOutMilestone',
        payload: {
          ...params
        }
      });
      // drawContent['milestone_data'] = [];
      drawContent['properties'] = this.filterCurrentUpdateDatasField('MILESTONE', [])
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: { ...drawContent }
        }
      })
    }

    if (actionType === 'update') {
      // const { data } = drawContent['properties'].filter(item => item.code == 'MILESTONE')[0]
      const gold_data = (drawContent['properties'].find(item => item.code == 'MILESTONE') || {}).data
      const removeParams = {
        rela_id: card_id,
        id: gold_data.id,
      }

      const addParams = {
        rela_id: card_id,
        id,
        origin_type: type
      }

      dispatch({
        type: 'publicTaskDetailModal/updateMilestone',
        payload: {
          addParams,
          removeParams
        }
      });
      // drawContent['milestone_data'] = info;
      drawContent['properties'] = this.filterCurrentUpdateDatasField('MILESTONE', info)
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: { ...drawContent }
        }
      })
    }
    this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent, card_id, operate_properties_code: 'MILESTONE' })
  }
  // 里程碑选择回调 E

  // 编辑富文本事件 S
  saveBrafitEdit = (brafitEditHtml) => {
    const { drawContent = {}, dispatch } = this.props;

    let { card_id } = drawContent
    this.setState({
      isInEdit: false,
    })
    const updateObj = {
      card_id,
      description: brafitEditHtml,
    }

    drawContent['properties'] = this.filterCurrentUpdateDatasField('REMARK', brafitEditHtml)
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/updateTask',
        payload: {
          updateObj
        }
      })
    ).then(res => {
      if (!isApiResponseOk(res)) {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        return
      }
      this.updateDrawContentWithUpdateParentListDatas({ drawContent, card_id, name: 'description', value: brafitEditHtml })
    })
  }
  // 编辑富文本事件 E

  // 控制标签的显示隐藏的回调 S
  handleVisibleChange = (visible) => {
    this.setState({
      visible: visible
    })
  }
  // 控制标签的显示隐藏的回调 E

  // 标签关闭回调 S
  handleClose = (e) => {
    this.setState({
      visible: false,
    })
  }
  // // 标签关闭回调 E

  /**
   *  添加项目标签事件 S
   * @param {String} name 当前添加标签的名称
   * @param {String} color 当前添加标签的颜色
   */
  handleAddBoardTag = ({ name, color }) => {
    const { drawContent = {}, dispatch } = this.props
    const { card_id, board_id } = drawContent
    let new_drawContent = { ...drawContent }
    const glod_data = (drawContent['properties'].find(item => item.code == 'LABEL') || {}).data
    let temp = [...glod_data]
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/addBoardTag',
        payload: {
          board_id, name, color
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        temp.push(res.data)
        new_drawContent['properties'] = this.filterCurrentUpdateDatasField('LABEL', temp)
        this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id, name: 'label_data', value: temp, operate_properties_code: 'LABEL' })
        dispatch({
          type: 'publicTaskDetailModal/addTaskTag',
          payload: {
            board_id, card_id, label_id: res.data.label_id
          }
        })
      }
    })
  }
  // 添加项目标签事件 E

  /**
   * 更新项目标签的回调 S
   * @param {String} label_id 当前需要修改的标签ID
   * @param {String} name 当前修改后的标签名称
   * @param {String} color 当前修改后的标签颜色
   */
  handleUpdateBoardTag = ({ label_id, name, color }) => {
    const { drawContent = {}, dispatch } = this.props
    const { card_id, board_id } = drawContent
    const { data: label_data } = drawContent['properties'].filter(item => item.code == 'LABEL')[0]
    let new_labelData = [...label_data]
    new_labelData = new_labelData.map(item => {
      if (item.label_id == label_id) {
        let new_item = item
        new_item = { ...item, label_name: name ? name : item.label_name, label_color: color }
        return new_item
      } else {
        let new_item = item
        return new_item
      }
    })
    let new_drawContent = { ...drawContent }
    // new_drawContent['label_data'] = new_labelData
    new_drawContent['properties'] = this.filterCurrentUpdateDatasField('LABEL', new_labelData)
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/updateBoardTag',
        payload: {
          board_id, id: label_id, color, name: name && name
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id, name: 'label_data', value: new_labelData, operate_properties_code: 'LABEL' })
      }
    })
  }
  // 更新项目标签的回调 E

  /**
   * 删除项目标签的回调 S
   * @param {String} label_id 当前需要删除的标签ID
   */
  handleRemoveBoardTag = ({ label_id }) => {
    const { drawContent = {}, dispatch } = this.props
    const { card_id, board_id } = drawContent
    const { data: label_data } = drawContent['properties'].filter(item => item.code == 'LABEL')[0]
    let new_labelData = [...label_data]
    new_labelData = new_labelData.filter(item => {
      if (item.label_id != label_id) {
        let new_item = item
        return new_item
      }
    })
    let new_drawContent = { ...drawContent }
    // new_drawContent['label_data'] = new_labelData
    new_drawContent['properties'] = this.filterCurrentUpdateDatasField('LABEL', new_labelData)
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/deleteBoardTag',
        payload: {
          id: label_id,
          board_id
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id, name: 'label_data', value: new_labelData, operate_properties_code: 'LABEL' })
      }
    })
  }
  // 删除项目标签的回调 E

  // 下拉标签的回调 S
  handleChgSelectedLabel = (data) => {
    const { drawContent, boardTagList = [], dispatch } = this.props
    const { board_id, card_id, label_data = [] } = drawContent
    let newLabelData = []
    const { selectedKeys = [], type, key } = data
    // 将选中的ID在标签列表中查询, 找到后push一个新的数组中保存
    for (let i = 0; i < selectedKeys.length; i++) {
      for (let j = 0; j < boardTagList.length; j++) {
        if (selectedKeys[i] === boardTagList[j]['id']) {
          let obj = {// 这个obj是label_data需要的数据结构
            label_id: boardTagList[j]['id'],
            label_name: boardTagList[j]['name'],
            label_color: boardTagList[j]['color']
          }
          newLabelData.push(obj)
        }
      }
    }
    let new_drawContent = { ...drawContent }
    // new_drawContent['label_data'] = newLabelData
    new_drawContent['properties'] = this.filterCurrentUpdateDatasField('LABEL', newLabelData)
    if (type == 'add') {
      Promise.resolve(
        dispatch({
          type: 'publicTaskDetailModal/addTaskTag',
          payload: {
            board_id, card_id, label_id: key
          }
        })
      ).then(res => {
        if (isApiResponseOk(res)) {
          this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id, name: 'label_data', value: newLabelData, operate_properties_code: 'LABEL' })
        }
      })
    } else if (type == 'remove') {
      Promise.resolve(
        dispatch({
          type: 'publicTaskDetailModal/removeTaskTag',
          payload: {
            card_id, label_id: key
          }
        })
      ).then(res => {
        if (isApiResponseOk(res)) {
          this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id, name: 'label_data', value: newLabelData, operate_properties_code: 'LABEL' })
        }
      })
    }
  }
  // 下拉标签的回调 E

  /**
   * 删除标签 icon 回调 S
   * @param {Object} e 当前的事件对象
   * @param {String} shouldDeleteId 当前需要删除的标签ID
   */
  handleRemoveTaskTag = (e, shouldDeleteId) => {
    e && e.stopPropagation()
    const { dispatch, drawContent, drawContent: { card_id } } = this.props
    const { data: label_data } = drawContent['properties'].filter(item => item.code == 'LABEL')[0]
    let new_drawContent = { ...drawContent }
    let new_labelData = [...label_data]
    new_labelData = new_labelData.filter(item => {// 过滤掉删除的那一条item
      if (item.label_id != shouldDeleteId) {
        return item
      }
    })
    // new_drawContent['label_data'] = new_labelData
    new_drawContent['properties'] = this.filterCurrentUpdateDatasField('LABEL', new_labelData)
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/removeTaskTag',
        payload: {
          card_id, label_id: shouldDeleteId
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id, name: 'label_data', value: new_labelData, operate_properties_code: 'LABEL' })
      }
    })
  }
  // 删除标签 icon 回调 E

  // 获取上传文件时, 当前操作人 S
  showMemberName = (userId) => {
    const { projectDetailInfoData = {} } = this.props
    const { data = [] } = projectDetailInfoData;
    const users = data.filter((item) => item.user_id == userId);

    if (users.length > 0) {
      return <span>{users[0].name}</span>
    }
    return;
  }
  // 获取上传文件时, 当前操作人 E

  // 上传文件 事件 S
  onUploadFileListChange = (data) => {
    let { drawContent = {}, dispatch } = this.props;
    const { data: attachment_data } = drawContent['properties'].filter(item => item.code == 'ATTACHMENT')[0]
    if (data && data.length > 0) {
      drawContent['properties'] = this.filterCurrentUpdateDatasField('ATTACHMENT', [...attachment_data, ...data])
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: { ...drawContent }
        }
      })
    }
  }
  // 上传文件 事件 E

  /**附件预览 */
  openFileDetailModal = (fileInfo) => {
    const file_name = fileInfo.name
    const file_resource_id = fileInfo.file_resource_id
    const file_id = fileInfo.file_id;
    const board_id = fileInfo.board_id
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetail/projectDetailInfo',
      payload: {
        id: board_id
      }
    })
    dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        filePreviewCurrentFileId: file_id,
        fileType: getSubfixName(file_name),
        isInOpenFile: true,
        isInAttachmentFile: true,
        currentPreviewFileName: file_name
      }
    })

  }
  /**附件下载、删除等操作 */
  attachmentItemOpera({ type, data = {}, card_id }, e) {
    e.stopPropagation()
    if ((this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_EDIT).visit_control_edit()) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    //debugger
    const { dispatch } = this.props
    const attachment_id = data.id || (data.response && data.response.data && data.response.data.attachment_id)
    const file_resource_id = data.file_resource_id || (data.response && data.response.data.file_resource_id)
    if (!attachment_id) {
      message.warn('上传中，请稍后...')
      return
    }
    if (type == 'remove') {
      this.deleteAttachmentFile({ attachment_id, card_id })
    } else if (type == 'download') {
      dispatch({
        type: 'projectDetailFile/fileDownload',
        payload: {
          ids: file_resource_id,
          card_id
        }
      })
    }
  }
  /**附件删除 */
  deleteAttachmentFile(data) {
    if ((this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_EDIT).visit_control_edit()) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { attachment_id } = data;
    const that = this
    const { drawContent = {}, dispatch } = this.props
    const { data: attachment_data } = drawContent['properties'].filter(item => item.code == 'ATTACHMENT')[0]

    Modal.confirm({
      title: `确认要删除这个附件吗？`,
      zIndex: 1007,
      content: <div style={{ color: 'rgba(0,0,0, .8)', fontSize: 14 }}>
        <span >删除后不可恢复</span>
      </div>,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return new Promise((resolve) => {
          deleteTaskFile(data).then((value) => {

            if (value.code !== '0') {
              message.warn('删除失败，请重新删除。1')
              resolve()
            } else {
              let atta_arr = attachment_data;
              for (let i = 0; i < atta_arr.length; i++) {
                if (attachment_id == atta_arr[i]['id'] || (atta_arr[i].response && atta_arr[i].response.data && atta_arr[i].response.data.attachment_id == attachment_id)) {
                  atta_arr.splice(i, 1)
                }
              }
              that.setState({
                attachment_fileList: atta_arr
              })
              const drawContentNew = { ...drawContent }
              // drawContentNew['attachment_data'] = atta_arr
              drawContentNew['properties'] = that.filterCurrentUpdateDatasField('ATTACHMENT', atta_arr)
              dispatch({
                type: 'projectDetailTask/updateDatas',
                payload: {
                  drawContent: drawContentNew
                }
              })
              resolve()
            }
          })
          // .catch((e) => {
          //   // console.log(e);

          //   message.warn('删除出了点问题，请重新删除。')
          //   resolve()
          // })
        })

      }
    });
  }

  /* 附件点点点字段 */
  getAttachmentActionMenus = (fileInfo, card_id) => {
    return (
      <Menu>
        <Menu.Item>
          <a onClick={this.attachmentItemOpera.bind(this, { type: 'download', data: fileInfo, card_id })}>
            下载到本地
            </a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={this.attachmentItemOpera.bind(this, { type: 'remove', data: fileInfo, card_id })}>
            删除该附件
            </a>
        </Menu.Item>
      </Menu>
    );
  }
  // 递归获取附件路径 S
  getFolderPathName = (fileList, fileItem) => {
    let new_fileList = [...fileList]
    let arr = []
    const target_path = fileItem.folder_path
    // 递归添加路径
    const digui = (name, data) => {
      if (data[name]) {
        arr.push({ file_name: data.folder_name, file_id: data.id, type: '1' })
        digui(name, data[name])
      } else if (data['parent_id'] == '0') {
        arr.push({ file_name: '根目录', type: '0' })
      } else if (data['parent_id'] == '2') {// 表示临时目录
        arr.push({ file_name: data.folder_name, file_id: data.id, type: '2' })
      }
    }
    digui('parent_folder', target_path)
    const newbreadcrumbList = arr.reverse()
    // newbreadcrumbList.push({ file_name: fileItem.name, file_id: fileItem.file_id, type: '1' })
    return newbreadcrumbList
  }
  // 递归获取附件路径 E

  // 对应字段的删除 S
  handleDelCurrentField = (shouldDeleteId) => {
    if ((this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_EDIT).visit_control_edit()) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const that = this
    this.setState({
      showDelColor: true,
      currentDelId: shouldDeleteId
    })
    let flag = false
    const { dispatch, drawContent = {}, drawContent: { card_id }, selectedKeys = [] } = that.props
    // const { selectedKeys = [] } = that.state
    let new_drawContent = { ...drawContent }
    let filter_drawContent = { ...drawContent }
    let new_selectedKeys = [...selectedKeys]
    filter_drawContent['properties'].find(item => {
      if (item.id == shouldDeleteId) { // 表示找到当前item
        if (Array.isArray(item.data)) {
          flag = item.data.length
        } else if (item.data instanceof Object) {
          let arr = Object.keys(item.data);
          flag = !(arr.length == '0')
        } else if (item.data) {
          flag = true
        }
      }
    })
    new_selectedKeys = new_selectedKeys.filter(item => item != shouldDeleteId)
    new_drawContent['properties'] = new_drawContent['properties'].filter(item => item.id != shouldDeleteId)
    let gold_label = (new_drawContent['properties'].find(item => item.code == 'LABEL') || {}).data
    if (flag) {
      Modal.confirm({
        title: `确认要删除这条字段吗？`,
        zIndex: 1007,
        content: <div style={{ color: 'rgba(0,0,0, .65)', fontSize: 14 }}>
          <span >删除包括删除这条字段已填写的内容。</span>
        </div>,
        okText: '确认',
        cancelText: '取消',
        onOk() {
          Promise.resolve(
            dispatch({
              type: 'publicTaskDetailModal/removeCardAttributes',
              payload: {
                card_id, property_id: shouldDeleteId
              }
            })
          ).then(res => {
            if (isApiResponseOk(res)) {
              that.setState({
                shouldDeleteId: '',
                showDelColor: ''
              })
              that.props.updateParentPropertiesList && that.props.updateParentPropertiesList({shouldDeleteId, new_selectedKeys})
              dispatch({
                type: 'publicTaskDetailModal/updateDatas',
                payload: {
                  drawContent: new_drawContent
                }
              })
              if (!(gold_label && gold_label.length)) {
                that.props.handleTaskDetailChange && that.props.handleTaskDetailChange({card_id, drawContent: new_drawContent, operate_properties_code: 'LABEL'})
              }
            }
          })
        },
        onCancel() {
          that.setState({
            shouldDeleteId: '',
            showDelColor: ''
          })
        }
      })
    } else {
      Promise.resolve(
        dispatch({
          type: 'publicTaskDetailModal/removeCardAttributes',
          payload: {
            card_id, property_id: shouldDeleteId
          }
        })
      ).then(res => {
        if (isApiResponseOk(res)) {
          that.setState({
            shouldDeleteId: '',
            showDelColor: ''
          })
          that.props.updateParentPropertiesList && that.props.updateParentPropertiesList({shouldDeleteId, new_selectedKeys})
          dispatch({
            type: 'publicTaskDetailModal/updateDatas',
            payload: {
              drawContent: new_drawContent
            }
          })
          if (!(gold_label && gold_label.length)) {
            that.props.handleTaskDetailChange && that.props.handleTaskDetailChange({card_id, drawContent: new_drawContent, operate_properties_code: 'LABEL'})
          }
        }
      })
    }
  }
  // 对应字段的删除 E

  // 对应字段的内容渲染
  filterDiffPropertiesField = (currentItem) => {
    const { visible = false, showDelColor, currentDelId } = this.state
    const { drawContent = {}, projectDetailInfoData = {}, projectDetailInfoData: { data = [] }, boardTagList = [], handleTaskDetailChange, boardFolderTreeData = [], milestoneList = [] } = this.props
    const { org_id, card_id, board_id, board_name, due_time, start_time } = drawContent
    const { code } = currentItem
    const flag = (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_EDIT).visit_control_edit()
    let messageValue = (<div></div>)
    switch (code) {
      case 'MILESTONE': // 里程碑
        messageValue = (
          // <div className={mainContentStyles.moveWrapper}>
          <div style={{ position: 'relative' }} className={`${mainContentStyles.field_content} ${showDelColor && currentItem.id == currentDelId && mainContentStyles.showDelColor}`}>
            <div className={mainContentStyles.field_left}>
              {
                !flag && (
                  <span onClick={() => { this.handleDelCurrentField(currentItem.id) }} className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}>&#xe7fe;</span>
                )
              }
              <div className={mainContentStyles.field_hover}>
                <span className={`${globalStyles.authTheme}`}>&#xe6b7;</span>
                <span>里程碑</span>
              </div>
            </div>
            <div className={`${mainContentStyles.field_right}`}>
              {
                (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_EDIT).visit_control_edit() ? (
                  (
                    !currentItem.data && !(currentItem.data && currentItem.data.id) ? (
                      <div className={`${mainContentStyles.pub_hover}`}>
                        <span>暂无</span>
                      </div>
                    ) : (
                        <div className={`${mainContentStyles.pub_hover} ${mainContentStyles.value_text}`} >
                          {currentItem.data.name}
                        </div>
                      )
                  )
                ) : (
                    // 加入里程碑组件
                    <MilestoneAdd milestoneList={milestoneList} getMilestone={this.props.getMilestone} onChangeMilestone={this.onMilestoneSelectedChange} dataInfo={{ board_id, board_name, due_time, org_id, data, start_time }} selectedValue={currentItem.data && currentItem.data.id}>
                      <div className={`${mainContentStyles.pub_hover}`} >
                        {currentItem.data && currentItem.data.id
                          ? <span className={mainContentStyles.value_text}>{currentItem.data.name}</span>
                          :
                          '加入里程碑'
                        }
                      </div>
                    </MilestoneAdd>
                  )
              }
            </div>
          </div>
        )
        break
      case 'REMARK': // 备注
        messageValue = (
          // <div className={mainContentStyles.moveWrapper}>
          <div style={{ position: 'relative' }} className={`${mainContentStyles.field_content} ${showDelColor && currentItem.id == currentDelId && mainContentStyles.showDelColor}`}>
            <div className={mainContentStyles.field_left}>
              {
                !flag && (
                  <span onClick={() => { this.handleDelCurrentField(currentItem.id) }} className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}>&#xe7fe;</span>
                )
              }
              <div className={mainContentStyles.field_hover}>
                <span className={`${globalStyles.authTheme}`}>&#xe7f6;</span>
                <span>备注</span>
              </div>
            </div>
            <div className={`${mainContentStyles.field_right}`}>
              {
                (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_EDIT).visit_control_edit() ? (
                  (
                    currentItem.data && currentItem.data != '<p></p>' ? (
                      <div className={`${mainContentStyles.pub_hover}`}>
                        <span>暂无</span>
                      </div>
                    ) : (
                        <div className={`${mainContentStyles.pub_hover}`} >
                          <div className={mainContentStyles.descriptionContent} dangerouslySetInnerHTML={{ __html: currentItem.data }}></div>
                        </div>
                      )
                  )
                ) : (
                    // 富文本组件
                    <>
                      <RichTextEditor saveBrafitEdit={this.saveBrafitEdit} value={currentItem.data && currentItem.data}>
                        <div className={`${mainContentStyles.pub_hover}`} >
                          {
                            currentItem.data && currentItem.data != '<p></p>' ?
                              <div className={mainContentStyles.descriptionContent} dangerouslySetInnerHTML={{ __html: currentItem.data }}></div>
                              :
                              '添加备注'
                          }
                        </div>
                      </RichTextEditor>
                    </>
                  )
              }
            </div>
            {/* </div> */}
          </div>
        )
        break
      case 'LABEL': // 标签
        messageValue = (
          // <div className={mainContentStyles.moveWrapper}>
          // <>
          <div className={`${mainContentStyles.field_content} ${showDelColor && currentItem.id == currentDelId && mainContentStyles.showDelColor}`}>
            <div className={mainContentStyles.field_left}>
              {
                !flag && (
                  <span onClick={() => { this.handleDelCurrentField(currentItem.id) }} className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}>&#xe7fe;</span>
                )
              }
              <div className={mainContentStyles.field_hover}>
                <span className={`${globalStyles.authTheme}`}>&#xe6b8;</span>
                <span>标签</span>
              </div>
            </div>
            <div style={{ position: 'relative' }} className={mainContentStyles.field_right}>
              <div className={mainContentStyles.pub_hover}>
                {
                  (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_EDIT).visit_control_edit() ? (
                    (
                      currentItem.data && currentItem.data.length ? (
                        <div>
                          {
                            currentItem.data.map(item => {
                              return (
                                <span className={`${mainContentStyles.labelDelItem}`}>
                                  <span key={`${item.label_id}`} style={{ background: `rgba(${item.label_color}, 1)` }} className={`${mainContentStyles.normal_label}`}>
                                    <span>{item.label_name}</span>
                                    {/* <span onClick={(e) => { this.handleRemoveTaskTag(e, item.label_id) }} className={mainContentStyles.labelDelIcon}></span> */}
                                  </span>
                                </span>
                              )
                            })
                          }
                        </div>
                      ) : (
                          <div>暂无</div>
                        )
                    )
                  ) : (

                      currentItem.data && currentItem.data.length ? (
                        <div style={{ position: 'relative' }}>
                          <Dropdown
                            visible={visible}
                            getPopupContainer={triggerNode => triggerNode.parentNode}
                            trigger={['click']}
                            onVisibleChange={(visible) => { this.handleVisibleChange(visible) }}
                            overlayClassName={mainContentStyles.labelDataWrapper}
                            overlay={
                              <LabelDataComponent
                                board_id={board_id}
                                listData={boardTagList}
                                searchName={'name'} currentSelect={currentItem.data}
                                handleAddBoardTag={this.handleAddBoardTag}
                                handleUpdateBoardTag={this.handleUpdateBoardTag}
                                handleRemoveBoardTag={this.handleRemoveBoardTag}
                                handleChgSelectedLabel={this.handleChgSelectedLabel}
                                handleClose={this.handleClose}
                              />
                            }
                          >
                            <div>
                              {
                                currentItem.data.map(item => {
                                  return (
                                    <span className={`${mainContentStyles.labelDelItem}`}>
                                      <span key={`${item.label_id}`} style={{ background: `rgba(${item.label_color}, 1)` }} className={`${mainContentStyles.normal_label}`}>
                                        <span>{item.label_name}</span>
                                        <span onClick={(e) => { this.handleRemoveTaskTag(e, item.label_id) }} className={mainContentStyles.labelDelIcon}></span>
                                      </span>
                                    </span>
                                  )
                                })
                              }
                            </div>
                          </Dropdown>
                        </div>
                      ) : (
                          <div style={{ position: 'relative' }}>
                            <Dropdown
                              visible={visible}
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                              trigger={['click']}
                              onVisibleChange={(visible) => { this.handleVisibleChange(visible) }}
                              overlayClassName={mainContentStyles.labelDataWrapper}
                              overlay={
                                <LabelDataComponent
                                  board_id={board_id}
                                  listData={boardTagList}
                                  searchName={'name'} currentSelect={currentItem.data}
                                  handleAddBoardTag={this.handleAddBoardTag}
                                  handleUpdateBoardTag={this.handleUpdateBoardTag}
                                  handleRemoveBoardTag={this.handleRemoveBoardTag}
                                  handleChgSelectedLabel={this.handleChgSelectedLabel}
                                  handleClose={this.handleClose}
                                />
                              }
                            >
                              <div>
                                <span>添加标签</span>
                              </div>
                            </Dropdown>
                          </div>
                        )

                    )
                }

              </div>
            </div>
          </div>
          // {/* </> */}
        )
        break
      case 'ATTACHMENT': // 上传附件
        messageValue = (
          // <div className={mainContentStyles.moveWrapper}>
          // <>
          <div className={`${mainContentStyles.field_content} ${showDelColor && currentItem.id == currentDelId && mainContentStyles.showDelColor}`}>
            <div className={mainContentStyles.field_left}>
              {
                !flag && (
                  <span onClick={() => { this.handleDelCurrentField(currentItem.id) }} className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}>&#xe7fe;</span>
                )
              }
              <div className={mainContentStyles.field_hover}>
                <span className={`${globalStyles.authTheme}`}>&#xe6b9;</span>
                <span>附件</span>
              </div>
            </div>
            <div className={`${mainContentStyles.field_right}`}>
              {/* 上传附件组件 */}
              {
                (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_ATTACHMENT_UPLOAD).visit_control_edit() ? (
                  <div className={`${mainContentStyles.pub_hover}`}>
                    <span>暂无</span>
                  </div>
                ) : (
                    <div className={`${mainContentStyles.pub_hover}`}>
                      {
                        card_id && (
                          <UploadAttachment boardFolderTreeData={boardFolderTreeData} projectDetailInfoData={projectDetailInfoData} org_id={org_id} board_id={board_id} card_id={card_id}
                            onFileListChange={this.onUploadFileListChange}>
                            <div className={mainContentStyles.upload_file_btn}>
                              <span className={`${globalStyles.authTheme}`} style={{ fontSize: '16px' }}>&#xe7fa;</span> 上传附件
                          </div>
                          </UploadAttachment>
                        )}
                    </div>
                  )
              }
              <div className={mainContentStyles.filelist_wrapper}>
                {
                  currentItem.data && currentItem.data.map((fileInfo) => {
                    const breadcrumbList = this.getFolderPathName(currentItem.data, fileInfo)
                    return (
                      <div className={`${mainContentStyles.file_item_wrapper}`} key={fileInfo.id}>

                        <Dropdown overlay={this.getAttachmentActionMenus(fileInfo, card_id)}>
                          <div className={mainContentStyles.file_action}>
                            <i className={`${globalStyles.authTheme}`} style={{ fontSize: '16px' }}>&#xe7fd;</i>
                          </div>
                        </Dropdown>
                        <div className={`${mainContentStyles.file_item} ${mainContentStyles.pub_hover}`} onClick={() => this.openFileDetailModal(fileInfo)} >
                          <div className={mainContentStyles.file_title}><span className={`${globalStyles.authTheme}`} style={{ fontSize: '24px', color: '#40A9FF' }}>&#xe659;</span><span>{fileInfo.name}</span></div>
                          <div className={mainContentStyles.file_info}>{this.showMemberName(fileInfo.create_by)} 上传于 {fileInfo.create_time && timestampFormat(fileInfo.create_time, "MM-dd hh:mm")}</div>
                          <div className={mainContentStyles.breadNav} style={{position: 'relative'}}>
                            <Breadcrumb className={mainContentStyles.Breadcrumb} separator=">">
                              {breadcrumbList.map((value, key) => {
                                return (
                                  <Tooltip getPopupContainer={triggerNode => triggerNode.parentNode} title={(value && value.file_name) && value.file_name} placement="top">
                                    <Breadcrumb.Item key={key}>
                                      <span className={key == breadcrumbList.length - 1 && mainContentStyles.breadItem}>{(value && value.file_name) && value.file_name}</span>
                                    </Breadcrumb.Item>
                                  </Tooltip>
                                )
                              })}
                            </Breadcrumb>
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
          //  </>
          // </div>
        )
        break
      case 'SUBTASK':
        messageValue = (
          // <div className={mainContentStyles.moveWrapper}>
          // <>
          <div className={`${mainContentStyles.field_content} ${showDelColor && currentItem.id == currentDelId && mainContentStyles.showDelColor}`}>
            <div className={mainContentStyles.field_left}>
              {
                !flag && (
                  <span onClick={() => { this.handleDelCurrentField(currentItem.id) }} className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}>&#xe7fe;</span>
                )
              }
              <div className={mainContentStyles.field_hover}>
                <span className={`${globalStyles.authTheme}`}>&#xe7f5;</span>
                <span>子任务</span>
              </div>
            </div>
            <div className={`${mainContentStyles.field_right}`}>
              {/* 添加子任务组件 */}
              <AppendSubTask data={data} handleTaskDetailChange={handleTaskDetailChange}>
                <div className={`${mainContentStyles.pub_hover}`}>
                  <span className={mainContentStyles.add_sub_btn}>
                    <span className={`${globalStyles.authTheme}`} style={{ fontSize: '16px' }}>&#xe8fe;</span> 新建子任务
                    </span>
                </div>
              </ AppendSubTask>
            </div>
          </div>
          // </>
          // </div>
        )
        break
      default:
        break;
    }
    return messageValue
  }

  // a little function to help us with reordering the result
  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  /**
 * Moves an item from one list to another list.
 */
  move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  };

  onDragEnd = result => {
    const { source, destination } = result;
    // dropped outside the list
    const { dispatch, drawContent = {}, drawContent: { card_id } } = this.props
    let new_drawContent = { ...drawContent }
    if (!destination) {
      return;
    }
   
    if (source.droppableId === destination.droppableId) {
      const property_item = new_drawContent['properties'].find((item, index) => index == source.index)
      const target_property_item = new_drawContent['properties'].find((item, index) => index == destination.index)
      for (let val in new_drawContent) {
        if (val == 'properties') {
          new_drawContent[val] = this.reorder(new_drawContent[val], source.index, destination.index)
        }
      }
      Promise.resolve(
        dispatch({
          type: 'publicTaskDetailModal/sortCardAttribute',
          payload: {
            card_id,
            property_id: property_item.id,
            target_property_id: target_property_item.id
          }
        })
      ).then(res => {
        if (isApiResponseOk(res)) {
          dispatch({
            type: 'publicTaskDetailModal/updateDatas',
            payload: {
              drawContent: new_drawContent
            }
          })
        }
      })
    } else {

    }
  };

  getDragDropContext = () => {
    const { drawContent = {} } = this.props
    const { properties = [] } = drawContent
    let messageValue = (<div></div>)
    messageValue = (
      <div>
      <DragDropContext getPopupContainer={triggerNode => triggerNode.parentNode} onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {properties && properties.map((item, index) => (
                <Draggable key={item.id} index={index} draggableId={item.id}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}
                      {...provided.dragHandleProps}>{this.filterDiffPropertiesField(item)}</div>
                  )}
                </Draggable>
              ))}
              {/* {provided.placeholder} */}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      </div>
    )
    return messageValue
  }

  render() {
    const { drawContent = {} } = this.props
    const { properties = [] } = drawContent
    return (
      <div>
        <div>
          {
            (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_EDIT).visit_control_edit() ? (
              <>
                {
                  properties && properties.map(item => {
                    return this.filterDiffPropertiesField(item)
                  })
                }
              </>
            ) : (
                // <SortableList helperContainer={() => document.getElementsByClassName(`${mainContentStyles.field_content}`)[0]} distance={2} items={properties} onSortEnd={this.onSortEnd} />
                <div>{this.getDragDropContext()}</div>
              )
          }
        </div>
        {/*查看任务附件*/}
        {/*外部附件引入结束 */}
      </div>
    )
  }
}

// 只关联public弹窗内的数据
function mapStateToProps({
  publicTaskDetailModal: { drawContent = {}, is_edit_title, card_id, boardTagList = [] },
  projectDetail: { datas: { projectDetailInfoData = {} } }
}) {
  return { drawContent, is_edit_title, card_id, boardTagList, projectDetailInfoData  }
}
