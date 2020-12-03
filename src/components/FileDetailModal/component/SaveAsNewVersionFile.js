import React, { Component } from 'react'
import { Modal, TreeSelect, Icon, Dropdown, message, Tooltip } from 'antd'
import headerStyles from '../HeaderContent.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import MenuSearchPartner from '@/components/MenuSearchMultiple/MenuSearchPartner.js'
import {
  getSubfixName,
  currentNounPlanFilterName
} from '@/utils/businessFunction.js'
import {
  PROJECTS,
  FILES,
  MESSAGE_DURATION_TIME
} from '@/globalset/js/constant.js'
import NameChangeInput from '@/components/NameChangeInput'
const { TreeNode } = TreeSelect

export default class SaveAsNewVersionFile extends Component {
  state = {
    fileSavePath: null, // 选择文件夹路径 folder_id
    uploading: null, //
    toNoticeList: [], // 默认通知提醒人
    visible: false, // 下拉框的显示隐藏
    is_edit_file_name: false, // 是否编辑文件名
    inputValue: '' // 文件名
  }

  // 初始化数据
  initState = () => {
    this.setState({
      fileSavePath: null,
      uploading: null,
      toNoticeList: [],
      visible: false,
      is_edit_file_name: false,
      inputValue: ''
    })
  }

  componentWillReceiveProps(nextProps) {
    this.getDefaultNoticeUser()
  }

  // 关闭弹框
  hideModal = () => {
    // if (this.state.uploading) {
    // 	return message.error('另存为中：暂不能操作');
    // }
    this.props.setSaveAsNewVersionVisible &&
      this.props.setSaveAsNewVersionVisible()
    this.initState()
  }

  // 截取文件名称点缀
  getEllipsisFileName = name => {
    let str = name
    if (!name) return
    let arr = str.split('.')
    arr.splice(-1, 1)
    arr.join('.')
    return arr
  }

  onVisibleChange = visible => {
    if (this.state.uploading) {
      message.warn('正在上传中...请勿操作')
      return false
    }
    this.setState({
      visible: visible
    })
  }

  setEditFileName = e => {
    e && e.stopPropagation()
    this.setState({
      is_edit_file_name: true
    })
  }

  onChangeVlaue = e => {
    e && e.stopPropagation()
    if (e.target.value.length > 100) {
      this.setState({
        inputValue: '',
        is_edit_file_name: false
      })
    }
  }

  titleTextAreaChangeBlur = e => {
    let val = e.target.value
    const {
      currentPreviewFileData: { file_name }
    } = this.props
    if (e.target.value.trimLR() == '') {
      this.setState({
        is_edit_file_name: false,
        inputValue: ''
      })
      return
    } else {
      if (val == this.getEllipsisFileName(file_name)) {
        this.setState({
          is_edit_file_name: false,
          inputValue: ''
        })
      } else {
        this.setState({
          inputValue: e.target.value,
          is_edit_file_name: false
        })
      }
    }
  }

  // 选择文件夹目录
  onChangeFileSavePath = value => {
    // if (this.state.uploading) {
    // 	message.warn('正在另存为中...请勿操作')
    // 	return false
    // }
    if (value == '0' || value == '') {
      message.warn('请选择一个文件目录', MESSAGE_DURATION_TIME)
      return false
    } else {
      this.setState({
        fileSavePath: value
      })
    }
  }

  //修改通知人的回调 S
  chirldrenTaskChargeChange = data => {
    if (this.state.uploading) {
      message.warn('正在上传中...请勿操作')
      return false
    }
    const { projectDetailInfoData = {} } = this.props
    // 多个任务执行人
    const membersData = projectDetailInfoData['data'] //所有的人
    // const excutorData = new_userInfo_data //所有的人
    let newNoticeUserList = []
    const { selectedKeys = [], type, key } = data
    for (let i = 0; i < selectedKeys.length; i++) {
      for (let j = 0; j < membersData.length; j++) {
        if (selectedKeys[i] === membersData[j]['user_id']) {
          newNoticeUserList.push(membersData[j])
        }
      }
    }

    this.setState({
      toNoticeList: newNoticeUserList
    })

    if (data.type === 'add') {
    } else if (data.type === 'remove') {
      //toNoticeList.add();
    }
  }
  // 添加执行人的回调 E

  // 移除执行人的回调 S
  handleRemoveExecutors = (e, shouldDeleteItem) => {
    e && e.stopPropagation()
    if (this.state.uploading) {
      message.warn('正在上传中...请勿操作')
      return false
    }
    const { toNoticeList = [] } = this.state
    let new_toNoticeList = [...toNoticeList]
    new_toNoticeList.map((item, index) => {
      if (item.user_id == shouldDeleteItem) {
        new_toNoticeList.splice(index, 1)
      }
    })
    this.setState({
      toNoticeList: new_toNoticeList
    })
  }
  // 移除执行人的回调 E

  // 获取默认通知文件上传者
  getDefaultNoticeUser = () => {
    const {
      projectDetailInfoData: { data = [] },
      currentPreviewFileData: { user_id }
    } = this.props
    let new_data = [...data]
    new_data = new_data.filter(item => item.user_id == user_id)
    // console.log(new_data,'sssssssssssssssssssss_data')
    this.setState({
      toNoticeList: new_data
    })
  }

  // 确认的点击事件
  onOk = () => {
    const { titleKey } = this.props
    const {
      projectDetailInfoData: { data = [] },
      currentPreviewFileData: { id, user_id, folder_id, file_name }
    } = this.props
    const { toNoticeList = [], fileSavePath, inputValue } = this.state
    let temp_user_ids = []
    toNoticeList &&
      toNoticeList.map(item => {
        temp_user_ids.push(item.user_id)
      })
    let notify_user_ids = temp_user_ids.join(',')
    if (titleKey == '2') {
      this.props.handleSaveAsNewVersionButton &&
        this.props.handleSaveAsNewVersionButton({
          id,
          notify_user_ids,
          folder_id,
          calback: this.hideModal()
        })
    } else if (titleKey == '3') {
      this.props.handleSaveAsOthersNewVersionButton &&
        this.props.handleSaveAsOthersNewVersionButton({
          file_ids: id,
          folder_id: fileSavePath,
          notify_user_ids,
          file_name: inputValue != '' ? inputValue : file_name,
          calback: this.hideModal()
        })
      // 更新项目档案中的列表
      setTimeout(() => {
        this.props.shouldUpdateAllFolderListData &&
          this.props.whetherUpdateFolderListData &&
          this.props.whetherUpdateFolderListData({ folder_id })
      }, 500)
    }
  }

  // 保存为新版本
  renderKeepNewVersion = () => {
    const { projectDetailInfoData = {}, titleKey } = this.props
    const {
      data: projectMemberData,
      board_id,
      board_name,
      org_id
    } = projectDetailInfoData
    const { toNoticeList = [], inputValue } = this.state
    const { name } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    const {
      currentPreviewFileData: { file_name },
      boardFolderTreeData = []
    } = this.props
    const text = titleKey == '2' ? '更新了' : titleKey == '3' ? '上传了' : ''
    return (
      <div>
        {/* 通知的人员 */}
        <div>
          <span className={globalStyles.authTheme}>&#xe6e3;</span> 提醒谁查看：
          <div
            className={headerStyles.noticeUsersWrapper}
            style={{ marginTop: '6px' }}
          >
            <span style={{ flex: '1' }}>
              {!toNoticeList.length ? (
                <div style={{ flex: '1', position: 'relative' }}>
                  <Dropdown
                    visible={this.state.visible}
                    trigger={['click']}
                    overlayClassName={headerStyles.overlay_pricipal}
                    onVisibleChange={this.onVisibleChange}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    overlayStyle={{ maxWidth: '200px' }}
                    overlay={
                      <MenuSearchPartner
                        listData={projectMemberData}
                        keyCode={'user_id'}
                        searchName={'name'}
                        currentSelect={toNoticeList}
                        board_id={board_id}
                        invitationType="1"
                        invitationId={board_id}
                        invitationOrg={org_id}
                        chirldrenTaskChargeChange={
                          this.chirldrenTaskChargeChange
                        }
                      />
                    }
                  >
                    {/* 添加通知人按钮 */}

                    <div className={headerStyles.addNoticePerson}>
                      <Icon
                        type="plus-circle"
                        style={{ fontSize: '40px', color: '#40A9FF' }}
                      />
                    </div>
                  </Dropdown>
                </div>
              ) : (
                <div style={{ flex: '1', position: 'relative' }}>
                  <Dropdown
                    visible={this.state.visible}
                    trigger={['click']}
                    overlayClassName={headerStyles.overlay_pricipal}
                    onVisibleChange={this.onVisibleChange}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    overlayStyle={{ maxWidth: '200px' }}
                    overlay={
                      <MenuSearchPartner
                        invitationType="1"
                        invitationId={board_id}
                        invitationOrg={org_id}
                        listData={projectMemberData}
                        keyCode={'user_id'}
                        searchName={'name'}
                        currentSelect={toNoticeList}
                        chirldrenTaskChargeChange={
                          this.chirldrenTaskChargeChange
                        }
                        board_id={board_id}
                      />
                    }
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {/* 添加通知人按钮 */}
                      <div className={headerStyles.addNoticePerson}>
                        <Icon
                          type="plus-circle"
                          style={{ fontSize: '40px', color: '#40A9FF' }}
                        />
                      </div>

                      {toNoticeList.map(value => {
                        const { avatar, name, user_name, user_id } = value
                        return (
                          <div
                            style={{ display: 'flex', flexWrap: 'wrap' }}
                            key={user_id}
                          >
                            <div
                              className={`${headerStyles.user_item}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative',
                                margin: '2px 0',
                                textAlign: 'center'
                              }}
                              key={user_id}
                            >
                              {avatar ? (
                                <img
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 20,
                                    margin: '0 2px'
                                  }}
                                  src={avatar}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 20,
                                    backgroundColor: '#f5f5f5',
                                    margin: '0 2px'
                                  }}
                                >
                                  <Icon
                                    type={'user'}
                                    style={{ fontSize: 12, color: '#8c8c8c' }}
                                  />
                                </div>
                              )}
                              <div style={{ marginRight: 8, fontSize: '14px' }}>
                                {name || user_name || '佚名'}
                              </div>
                              <span
                                onClick={e => {
                                  this.handleRemoveExecutors(e, user_id)
                                }}
                                className={`${headerStyles.userItemDeleBtn}`}
                              ></span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Dropdown>
                </div>
              )}
            </span>
          </div>
        </div>
        {/* 通知内容 */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '40px',
            background: 'rgba(245,245,245,1)',
            borderRadius: '4px',
            boxSizing: 'border-box',
            padding: '10px 0 10px 10px',
            marginTop: '10px'
          }}
        >
          通知内容:{' '}
          <span>
            {name} 在 <span style={{ fontWeight: 900 }}>{board_name}</span>
            {currentNounPlanFilterName(PROJECTS)} 中 {text}{' '}
            <Tooltip
              title={inputValue != '' ? inputValue : file_name}
              placement="top"
              getPopupContainer={triggerNode => triggerNode.parentNode}
            >
              <span
                style={{
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'noWrap',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  fontWeight: 900,
                  marginTop: '-3px'
                }}
              >
                {inputValue != ''
                  ? inputValue
                  : this.getEllipsisFileName(file_name) || ''}
              </span>{' '}
            </Tooltip>
            <span
              style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                fontWeight: 900,
                marginTop: '-3px'
              }}
            >
              {getSubfixName(file_name)}
            </span>{' '}
            {currentNounPlanFilterName(FILES)}
          </span>
        </div>
      </div>
    )
  }

  renderFolderTreeNodes = data => {
    return data.map(item => {
      if (item.child_data && item.child_data.length > 0) {
        return (
          <TreeNode
            title={item.folder_name}
            key={item.folder_id}
            value={item.folder_id}
            dataRef={item}
          >
            {this.renderFolderTreeNodes(item.child_data)}
          </TreeNode>
        )
      } else {
        return (
          <TreeNode
            disabled={item.disabled && item.disabled}
            title={item.folder_name}
            key={item.folder_id}
            value={item.folder_id}
            dataRef={item}
          />
        )
      }
    })
  }

  renderSelectBoardFileTreeList = () => {
    const { is_file_tree_loading, boardFolderTreeData = [] } = this.props
    // const { boardFolderTreeData } = this.state;
    if (is_file_tree_loading) {
      return (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            textAlign: 'center',
            height: '50px',
            lineHeight: '48px',
            overflow: 'hidden',
            color: 'rgba(0, 0, 0, 0.25)'
          }}
          className={`${headerStyles.page_card_Normal} ${headerStyles.directoryTreeWapper}`}
        >
          数据加载中
        </div>
      )
    }

    return this.renderFolderTreeNodes([boardFolderTreeData])
  }

  // 另存文件为新版本
  renderSaveNewVersion = () => {
    const {
      currentPreviewFileData: { file_name },
      boardFolderTreeData = []
    } = this.props
    const { fileSavePath, is_edit_file_name, inputValue } = this.state
    const FILENAME =
      inputValue != '' ? inputValue : this.getEllipsisFileName(file_name)
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <div>{currentNounPlanFilterName(FILES)}名：</div>
          {!is_edit_file_name ? (
            <div
              onClick={this.setEditFileName}
              style={{
                width: '100%',
                height: '40px',
                background: 'rgba(255,255,255,1)',
                borderRadius: '4px',
                boxSizing: 'border-box',
                padding: '10px 0 10px 10px',
                marginTop: '8px',
                marginBottom: '10px',
                border: '1px solid rgba(0,0,0,0.15)'
              }}
            >
              <span
                style={{
                  maxWidth: '300px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'noWrap',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  marginTop: '-3px'
                }}
              >
                {FILENAME}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  marginTop: '-3px'
                }}
              >
                {inputValue == '' && getSubfixName(file_name)}
              </span>
            </div>
          ) : (
            <NameChangeInput
              autosize
              onBlur={this.titleTextAreaChangeBlur}
              onClick={this.setEditFileName}
              onChange={this.onChangeVlaue}
              setIsEdit={this.titleTextAreaChangeBlur}
              autoFocus={true}
              goldName={
                inputValue != ''
                  ? inputValue
                  : this.getEllipsisFileName(file_name)
              }
              maxLength={101}
              nodeName={'textarea'}
              style={{
                display: 'block',
                fontSize: 14,
                color: '#262626',
                resize: 'none',
                height: '40px',
                background: 'rgba(255,255,255,1)',
                boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)',
                borderRadius: '4px',
                border: 'none'
              }}
            />
          )}
        </div>

        <div>
          <div>存放位置：</div>
          <div style={{ marginTop: '8px' }}>
            <TreeSelect
              defaultValue={fileSavePath}
              disabled={
                boardFolderTreeData && boardFolderTreeData.length == '0'
              }
              value={fileSavePath}
              className={headerStyles.treenode_wrapper}
              showSearch={false}
              style={{ width: '100%', height: '40px' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择"
              allowClear={true}
              treeDefaultExpandAll={true}
              onChange={this.onChangeFileSavePath}
            >
              {this.renderSelectBoardFileTreeList()}
            </TreeSelect>
          </div>
          {boardFolderTreeData && boardFolderTreeData.length == '0' && (
            <span
              style={{
                display: 'block',
                marginTop: '15px',
                marginBottom: '5px',
                marginLeft: '4px',
                color: '#FAAD14'
              }}
            >
              暂无访问文件权限
            </span>
          )}
        </div>
        <div style={{ marginTop: '10px' }}>{this.renderKeepNewVersion()}</div>
      </div>
    )
  }

  render() {
    const { visible, title, titleKey, boardFolderTreeData = [] } = this.props
    const { uploading, fileSavePath } = this.state
    // 另存为的确认按钮是佛禁用条件
    const okButtonPropsFromSaveOthersFile =
      (boardFolderTreeData && boardFolderTreeData.length == '0') ||
      !fileSavePath
    return (
      <div>
        <Modal
          zIndex={1007}
          visible={visible}
          title={<div style={{ textAlign: 'center' }}>{title}</div>}
          onOk={this.onOk}
          onCancel={this.hideModal}
          cancelText="取消"
          destroyOnClose={true}
          maskClosable={false}
          style={{ width: '520px' }}
          okButtonProps={{
            loading: uploading,
            disabled: titleKey == '3' ? okButtonPropsFromSaveOthersFile : false
          }}
          cancelButtonProps={uploading ? { disabled: true } : {}}
          okText={uploading ? '另存为中……' : '确定'}
          // bodyStyle={{maxHeight: '1000px',overflowY:'auto'}}
        >
          {titleKey == '2' ? (
            this.renderKeepNewVersion()
          ) : titleKey == '3' ? (
            this.renderSaveNewVersion()
          ) : (
            <div></div>
          )}
        </Modal>
      </div>
    )
  }
}
