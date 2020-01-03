import React, { Component } from 'react'
import { Table, Button, Menu, Dropdown, Icon, Input, Drawer, Tooltip, Upload, Modal } from 'antd';
import { timestampToTimeNormal3 } from '@/utils/util.js'
import globalStyles from '@/globalset/css/globalClassName.less'
import indexStyles from './index.less'

export default class VersionSwitchingComponent extends Component {

  constructor(props) {
    super(props)
    this.state = {
      // selectedKeys: []
      defaultSelectedKeys: props.selectedKeys,
      is_close: null, // 是否关闭状态, 默认为 null
    }
  }



  /**
   * Dropdown版本信息的点击显示隐藏的回调
   * @param {Boolean} visible 是否显示 
   */
  handleVisibleChg(visible) {
    this.setState({
      is_close: visible,
    })
  }

  // 点击x关闭按钮的回调
  handleCloseChg() {
    const { is_close } = this.state
    this.handleVisibleChg(!is_close)
  }

  /**
   * 设置为主版本的回调
   * @param {Object} 对应需要的参数
   * @param {Object} e 对应点击的key的字段
   */
  handleVersionChg = ({ list, file_id, file_name }, e) => {
    // console.log(file_id, 'ssssss')
    this.props.getVersionItemMenuClick({ list, file_id, file_name }, e)
  }

  /**
   * 每一个menu菜单的item选项的切换的回调
   * @param {Object} e 当前的事件对象
   */
  handleVersionItem = (e) => {
    // 调用父类的点击预览的版本切换的方法
    this.props.handleVersionItem(e)
  }

  /**
   * 编辑版本信息描述的回调
   * @param {Array} list 版本信息列表的数组
   * @param {String} file_id 操作的当前file_id
   */
  handleFileDecription = (list, file_id) => {
    this.props.handleFileVersionDecription(list, file_id)
  }

  /**
   * 修改文本框的value值
   * @param {Object} e 当前操作的事件对象
   */
  handleChgEditVal(list, e) {
    this.props.handleFileVersionValue(list, e)
  }

  /**
   * 阻止编辑的时候事件冒泡
   * @param {Object} e 当前操作的事件对象 
   */
  handleStopPro(e) {
    e && e.stopPropagation()
  }

  /**
   * 在编辑内容中按下回车的回调
   * @param {Array} list 版本信息列表的数组 
   * @param {*} file_id 当前操作的file_id
   * @param {*} e 当前的事件对象
   */
  handleKeyDown(list, file_id, e) {
    if (e.keyCode == '13') {
      this.handleFileDecription(list, file_id)
    }
  }

  // 每一个切换版本的item结构
  getVersionItemMenu = (list) => {
    const { editValue, filePreviewCurrentFileId, uploadProps, is_edit_version_description, is_show, selectedKeys } = this.props //is_show = 是否显示'上传新版本'
    const { defaultSelectedKeys = [] } = this.state
    return (
      <div style={{ position: 'relative' }} id="versionPanePosition" className={indexStyles.versionPanePosition}>
        <Menu
          key={selectedKeys} 
          selectedKeys={selectedKeys} 
          getPopupContainer={triggerNode => triggerNode.parentNode} selectable={true} style={{ width: 400, maxHeight: '314px' }}>
          <div key="versionTitle" style={{ borderBottom: '1px solid rgba(0,0,0,0.09)', height: '56px', lineHeight: '56px', padding: '0 16px' }}>
            <div className={indexStyles.title_wrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={indexStyles.version_title}>版本信息</span>
              <span onClick={() => { this.handleCloseChg() }} className={indexStyles.version_close}>x</span>
            </div>
          </div>
          <Menu  getPopupContainer={triggerNode => triggerNode.parentNode} onClick={(e) => { this.handleVersionItem(e) }} className={`${globalStyles.global_vertical_scrollbar}`} style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {list.map((value, key) => {
              const { file_name, creator, create_time, file_size, file_id, is_edit, remarks, file_resource_id } = value
              return (
                <Menu.Item style={{ height: 'auto' }} className={indexStyles.version_menuItem} key={file_id}>
                  {
                    is_edit_version_description && is_edit ? (
                      <div style={{ marginBottom: '5px' }} >
                        <Input.TextArea
                          id="edit_description"
                          style={{ resize: 'none' }}
                          autoFocus={true}
                          autosize={true}
                          onChange={(e) => { this.handleChgEditVal(list, e) }}
                          onBlur={() => { this.handleFileDecription(list, file_id) }}
                          onClick={(e) => { this.handleStopPro(e) }}
                          onKeyDown={(e) => { this.handleKeyDown(list, file_id, e) }}
                          maxLength={50}
                          value={editValue}
                        />
                      </div>
                    ) : (
                        <div style={{ position: 'relative' }} className={`${indexStyles.versionItemMenu} ${filePreviewCurrentFileId == file_id && indexStyles.current_version_color}`}>
                          <div className={`${globalStyles.authTheme} ${indexStyles.circle_icon} ${indexStyles.hover_color}`}>{filePreviewCurrentFileId == file_id ? (<span style={{ fontSize: '14px' }}>&#xe696;</span>) : (<span> &#xe697;</span>)}</div>
                          {
                            remarks && remarks != '' ? (
                              <div style={{ lineHeight: '30px' }}>
                                <span style={{ fontWeight: 400, fontSize: 14, marginRight: '5px' }} className={`${indexStyles.creator} ${indexStyles.hover_color}`} >
                                  {remarks}&nbsp;&nbsp;&nbsp;&nbsp;
                            </span>
                                {filePreviewCurrentFileId == file_id && (
                                  <span className={`${indexStyles.status}`}>主版本</span>)}
                              </div>
                            ) : (
                                <div
                                  style={{ lineHeight: '30px' }}
                                >
                                  <span style={{ fontWeight: 400, fontSize: 14 }} className={`${indexStyles.creator} ${indexStyles.hover_color}`}>{creator}&nbsp;&nbsp;</span>
                                  <span className={indexStyles.hover_color}>上传于&nbsp;&nbsp;</span>
                                  <span className={indexStyles.hover_color}>{timestampToTimeNormal3(create_time, true, '/')}&nbsp;&nbsp;</span>
                                  {filePreviewCurrentFileId == file_id && (
                                    <span className={`${indexStyles.status}`}>主版本</span>)}
                                </div>
                              )
                          }
                          <span className={`${indexStyles.file_size} ${indexStyles.initalShow}`}>{file_size}</span>
                          <div className={`${indexStyles.file_size} ${indexStyles.initalHide} ${globalStyles.authTheme} ${indexStyles.operate}`}>

                            {is_show === true ? (
                              <Dropdown getPopupContainer={() => document.getElementById("versionPanePosition")} overlay={this.ellipsisVersionItemMenu({ list, file_id, file_name })}
                                // getPopupContainer={triggerNode => triggerNode.parentNode}
                                onClick={(e) => { this.handleStopPro(e) }}
                                trigger={['click']}
                              >
                                <span>&#xe7fd;</span>
                              </Dropdown>
                            ) : ''}

                          </div>
                        </div>
                      )
                  }
                </Menu.Item>
              )
            })}
          </Menu>
          <div key="updateVersion" style={{ height: '58px', lineHeight: '28px', borderTop: '1px solid rgba(0,0,0,0.09)' }} >
            <Upload className={indexStyles.upload_file} {...uploadProps} showUploadList={false}>
              {is_show === true ? (
                <Button type="primary" style={{ color: '#fff', textAlign: 'center', width: 368, }}>
                  <Icon type="upload" theme="outlined" style={{ margin: 0, fontSize: 16 }} /> 上传新版本
                </Button>
              ) : ''}
            </Upload>
          </div>

        </Menu>
      </div>
    )
  }

  // 显示点点点的下拉菜单
  ellipsisVersionItemMenu = ({ list, file_id, file_name }) => {
    return (
      <Menu getPopupContainer={() => document.getElementById("versionPanePosition")} onClick={(e) => { this.handleVersionChg({ list, file_id, file_name }, e) }}>
        <Menu.Item key="1">设为主版本</Menu.Item>
        <Menu.Item key="3">编辑版本信息</Menu.Item>
        <Menu.Item key="2" disabled>移到回收站</Menu.Item>
      </Menu>
    )
  }

  render() {

    const { is_close } = this.state
    const { new_filePreviewCurrentVersionList = [] } = this.props //is_show = 是否显示'上传新版本'
    return (
      <div style={{ position: 'relative' }}>
        <Dropdown getPopupContainer={triggerNode => triggerNode.parentNode} visible={is_close} onVisibleChange={(visible) => { this.handleVisibleChg(visible) }} overlay={this.getVersionItemMenu(new_filePreviewCurrentVersionList)} trigger={['click']}>
          <Button className={indexStyles.version} style={{ height: 24, marginLeft: 14, display: 'flex', lineHeight: '24px' }}>
            <div className={`${globalStyles.authTheme}`}>&#xe785;</div>&nbsp;&nbsp;版本信息
                </Button>
        </Dropdown>
      </div>
    )
  }
}

VersionSwitchingComponent.defaultProps = {
  params: {
    filePreviewCurrentFileId: '', // 当前预览文件ID
    new_filePreviewCurrentVersionList: [], // 版本信息列表
    is_edit_version_description: '', // 是否正在编辑版本的信息描述
    editValue: '', // 编辑的内容
  },
  handleVersionItem: function () { }, // 每一个menu菜单的item选项的切换 即点击切换预览文件版本
  getVersionItemMenuClick: function () { }, // 点点点的下拉事件
  handleFileVersionDecription: function () { }, // 失去焦点 的版本修改描述信息
  handleFileVersionValue: function () { }, // 改变编辑描述的value onChange事件
  uploadProps: {}, // 上传版本的回调
}
