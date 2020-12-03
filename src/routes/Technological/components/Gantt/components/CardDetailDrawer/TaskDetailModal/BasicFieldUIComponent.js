import React, { Component } from 'react'
import { connect } from 'dva'
import { Breadcrumb, Dropdown } from 'antd'
import mainContentStyles from './MainContent.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import UploadAttachment from '@/components/UploadAttachment'
import RichTextEditor from '@/components/RichTextEditor'
import MilestoneAdd from '@/components/MilestoneAdd'
import LabelDataComponent from '@/components/LabelDataComponent'
import { timestampFormat } from '@/utils/util'
import { PROJECT_TEAM_CARD_EDIT } from '@/globalset/js/constant'
import { currentNounPlanFilterName } from '../../../../../../../utils/businessFunction'
import { TASKS } from '../../../../../../../globalset/js/constant'
import {
  judgeFileType,
  showMemberName,
  getCurrentDrawerContentPropsModelFieldData,
  getFolderPathName
} from '../../../../../../../components/TaskDetailModal/handleOperateModal'
import SubTaskContainer from '../../../../../../../components/TaskDetailModal/UIWithContainerComponent/SubTaskContainer'
import AppendSubTask from './components/AppendSubTask'
import SetRelationContent from '../../../../../../../components/RelyOnRelationship/SetRelationContent'

@connect(mapStateToProps)
export default class BasicFieldUIComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      previewFileModalVisibile: false
    }
    for (let val in props.LogicWithMainContent) {
      if (typeof props.LogicWithMainContent[val] == 'function') {
        this[val] = props.LogicWithMainContent[val].bind(this)
      }
    }
  }

  // 对应字段的内容渲染
  filterDiffPropertiesField = currentItem => {
    const { visible = false, showDelColor, currentDelId } = this.state
    const {
      drawContent = {},
      projectDetailInfoData: { data = [] },
      boardTagList = [],
      handleTaskDetailChange,
      boardFolderTreeData = [],
      milestoneList = [],
      handleChildTaskChange,
      whetherUpdateParentTaskTime,
      updateRelyOnRationList
    } = this.props
    const {
      org_id,
      card_id,
      board_id,
      board_name,
      due_time,
      start_time,
      deliverables = [],
      dec_files = [],
      properties = []
    } = drawContent
    const { code, id } = currentItem
    const flag =
      this.checkDiffCategoriesAuthoritiesIsVisible &&
      this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit &&
      !this.checkDiffCategoriesAuthoritiesIsVisible(
        PROJECT_TEAM_CARD_EDIT
      ).visit_control_edit()
    let { data: executors = [] } = getCurrentDrawerContentPropsModelFieldData({
      properties,
      code: 'EXECUTOR'
    })
    const gold_data = (
      drawContent['properties'].find(item => item.code == 'SUBTASK') || {}
    ).data
    let messageValue = <div></div>
    switch (code) {
      case 'MILESTONE': // 里程碑
        messageValue = (
          // <div className={mainContentStyles.moveWrapper}>
          <div
            key={id}
            style={{ position: 'relative' }}
            className={`${mainContentStyles.field_content} ${showDelColor &&
              currentItem.id == currentDelId &&
              mainContentStyles.showDelColor}`}
          >
            <div className={mainContentStyles.field_left}>
              <div className={mainContentStyles.field_hover}>
                <span>里程碑</span>
              </div>
              {!flag && (
                <span
                  onClick={() => {
                    this.handleDelCurrentField(currentItem.id, 'MILESTONE')
                  }}
                  className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}
                >
                  &#xe7fe;
                </span>
              )}
            </div>
            <div className={`${mainContentStyles.field_right}`}>
              {this.checkDiffCategoriesAuthoritiesIsVisible &&
              this.checkDiffCategoriesAuthoritiesIsVisible()
                .visit_control_edit &&
              !this.checkDiffCategoriesAuthoritiesIsVisible(
                PROJECT_TEAM_CARD_EDIT
              ).visit_control_edit() ? (
                !currentItem.data &&
                !(currentItem.data && currentItem.data.id) ? (
                  <div className={`${mainContentStyles.pub_hover}`}>
                    <span>暂无</span>
                  </div>
                ) : (
                  <div
                    className={`${mainContentStyles.pub_hover} ${mainContentStyles.value_text}`}
                  >
                    <span className={mainContentStyles.lcb_circle}></span>{' '}
                    {currentItem.data.name}
                  </div>
                )
              ) : (
                // 加入里程碑组件
                <MilestoneAdd
                  milestoneList={milestoneList}
                  getMilestone={this.getMilestone}
                  onChangeMilestone={this.onMilestoneSelectedChange}
                  dataInfo={{
                    board_id,
                    board_name,
                    due_time,
                    org_id,
                    data,
                    start_time
                  }}
                  selectedValue={currentItem.data && currentItem.data.id}
                >
                  <div className={`${mainContentStyles.pub_hover}`}>
                    {currentItem.data && currentItem.data.id ? (
                      <>
                        <span className={mainContentStyles.lcb_circle}></span>
                        <span className={mainContentStyles.value_text}>
                          {currentItem.data.name}
                        </span>
                      </>
                    ) : (
                      '加入里程碑'
                    )}
                  </div>
                </MilestoneAdd>
              )}
            </div>
          </div>
        )
        break
      // case 'REMARK': // 备注
      //   messageValue = (
      //     <div key={id} style={{ position: 'relative' }} className={`${mainContentStyles.field_content} ${showDelColor && currentItem.id == currentDelId && mainContentStyles.showDelColor}`}>
      //       <div className={mainContentStyles.field_left}>
      //         <div className={mainContentStyles.field_hover}>
      //           <span>任务说明</span>
      //         </div>
      //         {
      //           !flag && (
      //             <span onClick={() => { this.handleDelCurrentField(currentItem.id) }} className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}>&#xe7fe;</span>
      //           )
      //         }
      //       </div>
      //       <div className={`${mainContentStyles.field_right}`}>
      //         <div>
      //           {
      //             (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_EDIT).visit_control_edit() ? (
      //               (
      //                 currentItem.data && currentItem.data == '<p></p>' ?
      //                   (
      //                     <div className={`${mainContentStyles.pub_hover}`}>
      //                       <span>暂无</span>
      //                     </div>
      //                   )
      //                   : (
      //                     <>
      //                       <div className={`${mainContentStyles.pub_hover}`} >
      //                         <div className={mainContentStyles.descriptionContent} dangerouslySetInnerHTML={{ __html: currentItem.data }}></div>
      //                       </div>
      //                     </>
      //                   )
      //               )
      //             ) : (
      //                 // 富文本组件
      //                 <>
      //                   <div>
      //                     <RichTextEditor saveBrafitEdit={this.saveBrafitEdit} value={currentItem.data && currentItem.data}>
      //                       <div>
      //                         <div style={{ paddingLeft: '12px' }} onClick={(e) => e && e.stopPropagation()}>
      //                           <UploadAttachment
      //                             executors={executors.data}
      //                             boardFolderTreeData={boardFolderTreeData}
      //                             card_id={card_id}
      //                             title={`任务说明资料设置`}
      //                             listDescribe={'说明资料列表'}
      //                             isNotShowNoticeList={true}
      //                             url={'/api/projects/card/desc/attachment/upload'}
      //                             onFileListChange={this.onUploadDescFileListChange}
      //                           >
      //                             <span className={mainContentStyles.add_sub_upload}>
      //                               <span style={{ fontSize: '16px' }} className={globalStyles.authTheme}>&#xe7fa;</span>
      //                               <span>上传说明资料</span>
      //                             </span>
      //                           </UploadAttachment>
      //                         </div>
      //                         <div style={{ padding: '0px 2px', paddingLeft: '12px' }} className={`${mainContentStyles.pub_hover}`} >
      //                           {
      //                             currentItem.data && currentItem.data != '<p></p>' ?
      //                               <div className={mainContentStyles.descriptionContent} dangerouslySetInnerHTML={{ __html: currentItem.data }}></div>
      //                               :
      //                               '添加说明'
      //                           }
      //                         </div>
      //                       </div>
      //                     </RichTextEditor>
      //                   </div>
      //                 </>
      //               )
      //           }
      //         </div>
      //         <div>
      //           {/* 交付物 */}
      //           <div className={mainContentStyles.filelist_wrapper}>
      //             {
      //               !!(dec_files && dec_files.length) && dec_files.map(fileInfo => {
      //                 const { name: file_name, file_id } = fileInfo
      //                 const breadcrumbList = getFolderPathName(fileInfo)
      //                 return (
      //                   <div className={`${mainContentStyles.file_item_wrapper}`} key={fileInfo.id}>
      //                     <div className={`${mainContentStyles.file_item} ${mainContentStyles.pub_hover}`} onClick={(e) => this.openFileDetailModal(e, fileInfo)} >
      //                       <div>
      //                         <span className={`${mainContentStyles.file_action} ${globalStyles.authTheme}`} dangerouslySetInnerHTML={{ __html: judgeFileType(file_name) }}></span>
      //                       </div>
      //                       <div style={{ flex: 1 }}>
      //                         <div title={file_name} className={mainContentStyles.file_name}>{file_name}</div>
      //                         <div className={mainContentStyles.file_info}>{showMemberName(fileInfo.create_by)} 上传于 {fileInfo.create_time && timestampFormat(fileInfo.create_time, "MM-dd hh:mm")}</div>
      //                         <div className={mainContentStyles.breadNav} style={{ position: 'relative' }}>
      //                           <Breadcrumb className={mainContentStyles.Breadcrumb} separator=">">
      //                             {breadcrumbList.map((value, key) => {
      //                               return (
      //                                 <Breadcrumb.Item key={key}>
      //                                   <span title={(value && value.file_name) && value.file_name} className={key == breadcrumbList.length - 1 && mainContentStyles.breadItem}>{(value && value.file_name) && value.file_name}</span>
      //                                 </Breadcrumb.Item>
      //                               )
      //                             })}
      //                           </Breadcrumb>
      //                         </div>
      //                       </div>
      //                       <Dropdown trigger={['click']} getPopupContainer={triggerNode => triggerNode.parentNode} overlay={this.getAttachmentActionMenus({ fileInfo, code: 'REMARK', card_id })}>
      //                         <span onClick={(e) => e && e.stopPropagation()} className={`${mainContentStyles.pay_more_icon} ${globalStyles.authTheme}`}>&#xe66f;</span>
      //                       </Dropdown>
      //                     </div>
      //                   </div>
      //                 )
      //               })
      //             }
      //           </div>
      //         </div>
      //       </div>
      //     </div>
      //   )
      //   break
      case 'LABEL': // 标签
        messageValue = (
          <div
            key={id}
            className={`${mainContentStyles.field_content} ${showDelColor &&
              currentItem.id == currentDelId &&
              mainContentStyles.showDelColor}`}
          >
            <div className={mainContentStyles.field_left}>
              <div className={mainContentStyles.field_hover}>
                <span>标签</span>
              </div>
              {!flag && (
                <span
                  onClick={() => {
                    this.handleDelCurrentField(currentItem.id, 'LABEL')
                  }}
                  className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}
                >
                  &#xe7fe;
                </span>
              )}
            </div>
            <div
              style={{ position: 'relative' }}
              className={mainContentStyles.field_right}
            >
              <div className={mainContentStyles.pub_hover}>
                {this.checkDiffCategoriesAuthoritiesIsVisible &&
                this.checkDiffCategoriesAuthoritiesIsVisible()
                  .visit_control_edit &&
                !this.checkDiffCategoriesAuthoritiesIsVisible(
                  PROJECT_TEAM_CARD_EDIT
                ).visit_control_edit() ? (
                  currentItem.data && currentItem.data.length ? (
                    <div>
                      {currentItem.data.map(item => {
                        return (
                          <span className={`${mainContentStyles.labelDelItem}`}>
                            <span
                              key={`${item.label_id}`}
                              style={{
                                background: `rgba(${item.label_color}, 1)`
                              }}
                              className={`${mainContentStyles.normal_label}`}
                            >
                              <span>{item.label_name}</span>
                            </span>
                          </span>
                        )
                      })}
                    </div>
                  ) : (
                    <div>暂无</div>
                  )
                ) : currentItem.data && currentItem.data.length ? (
                  <div style={{ position: 'relative' }}>
                    <Dropdown
                      visible={visible}
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      trigger={['click']}
                      onVisibleChange={visible => {
                        this.handleVisibleChange(visible)
                      }}
                      overlayClassName={mainContentStyles.labelDataWrapper}
                      overlay={
                        <LabelDataComponent
                          board_id={board_id}
                          listData={boardTagList}
                          searchName={'name'}
                          currentSelect={currentItem.data}
                          handleAddBoardTag={this.handleAddBoardTag}
                          handleUpdateBoardTag={this.handleUpdateBoardTag}
                          handleRemoveBoardTag={this.handleRemoveBoardTag}
                          handleChgSelectedLabel={this.handleChgSelectedLabel}
                          handleClose={this.handleClose}
                        />
                      }
                    >
                      <div>
                        {currentItem.data.map(item => {
                          return (
                            <span
                              className={`${mainContentStyles.labelDelItem}`}
                            >
                              <span
                                key={`${item.label_id}`}
                                style={{
                                  background: `rgba(${item.label_color}, 1)`
                                }}
                                className={`${mainContentStyles.normal_label}`}
                              >
                                <span>{item.label_name}</span>
                                <span
                                  onClick={e => {
                                    this.handleRemoveTaskTag(e, item.label_id)
                                  }}
                                  className={mainContentStyles.labelDelIcon}
                                ></span>
                              </span>
                            </span>
                          )
                        })}
                      </div>
                    </Dropdown>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <Dropdown
                      visible={visible}
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      trigger={['click']}
                      onVisibleChange={visible => {
                        this.handleVisibleChange(visible)
                      }}
                      overlayClassName={mainContentStyles.labelDataWrapper}
                      overlay={
                        <LabelDataComponent
                          board_id={board_id}
                          listData={boardTagList}
                          searchName={'name'}
                          currentSelect={currentItem.data}
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
                )}
              </div>
            </div>
          </div>
          // {/* </> */}
        )
        break
      case 'ATTACHMENT': // 上传附件
        break
      case 'SUBTASK':
        messageValue = (
          <div
            key={id}
            className={`${mainContentStyles.field_content} ${showDelColor &&
              currentItem.id == currentDelId &&
              mainContentStyles.showDelColor}`}
            style={{ paddingBottom: 0 }}
          >
            <div className={mainContentStyles.field_left}>
              <div className={mainContentStyles.field_hover}>
                <span>子{currentNounPlanFilterName(TASKS)}&交付物</span>
              </div>
              {!flag && (
                <span
                  onClick={() => {
                    this.handleDelCurrentField(currentItem.id, 'SUBTASK')
                  }}
                  className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}
                >
                  &#xe7fe;
                </span>
              )}
            </div>
            <div className={`${mainContentStyles.field_right}`}>
              {/* 添加子任务组件 */}
              {
                <SubTaskContainer
                  SubTaskUIComponent={AppendSubTask}
                  handleTaskDetailChange={handleTaskDetailChange}
                  handleChildTaskChange={handleChildTaskChange}
                  whetherUpdateParentTaskTime={whetherUpdateParentTaskTime}
                  updateRelyOnRationList={updateRelyOnRationList}
                  boardFolderTreeData={boardFolderTreeData}
                  handleRelyUploading={this.props.handleRelyUploading}
                  updatePrivateVariablesWithOpenFile={
                    this.props.updatePrivateVariablesWithOpenFile
                  }
                  children={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingLeft: '12px'
                      }}
                    >
                      {!!!(deliverables && deliverables.length) && (
                        <div className={mainContentStyles.add_sub_btn}>
                          <span
                            className={`${globalStyles.authTheme}`}
                            style={{ fontSize: '16px' }}
                          >
                            &#xe8fe;
                          </span>{' '}
                          新建{`子${currentNounPlanFilterName(TASKS)}`}
                        </div>
                      )}
                      <div onClick={e => e.stopPropagation()}>
                        {card_id && !(gold_data && gold_data.length) && (
                          <div onClick={e => e && e.stopPropagation()}>
                            <UploadAttachment
                              executors={executors.data}
                              boardFolderTreeData={boardFolderTreeData}
                              card_id={card_id}
                              onFileListChange={this.onUploadFileListChange}
                            >
                              <span
                                className={mainContentStyles.add_sub_upload}
                              >
                                <span
                                  style={{ fontSize: '16px' }}
                                  className={globalStyles.authTheme}
                                >
                                  &#xe7fa;
                                </span>
                                <span>上传交付物</span>
                              </span>
                            </UploadAttachment>
                          </div>
                        )}
                      </div>
                    </div>
                  }
                />
              }
              <div>
                {/* 交付物 */}
                <div className={mainContentStyles.filelist_wrapper}>
                  {!!(deliverables && deliverables.length) &&
                    deliverables.map(fileInfo => {
                      const { name: file_name, file_id } = fileInfo
                      const breadcrumbList = getFolderPathName(fileInfo)
                      return (
                        <div
                          className={`${mainContentStyles.file_item_wrapper}`}
                          key={fileInfo.id}
                        >
                          <div
                            className={`${mainContentStyles.file_item} ${mainContentStyles.pub_hover}`}
                            onClick={e => this.openFileDetailModal(e, fileInfo)}
                          >
                            <div>
                              <span
                                className={`${mainContentStyles.file_action} ${globalStyles.authTheme}`}
                                dangerouslySetInnerHTML={{
                                  __html: judgeFileType(file_name)
                                }}
                              ></span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div
                                title={file_name}
                                className={mainContentStyles.file_name}
                              >
                                {file_name}
                              </div>
                              <div className={mainContentStyles.file_info}>
                                {showMemberName(fileInfo.create_by)} 上传于{' '}
                                {fileInfo.create_time &&
                                  timestampFormat(
                                    fileInfo.create_time,
                                    'MM-dd hh:mm'
                                  )}
                              </div>
                              <div
                                className={mainContentStyles.breadNav}
                                style={{ position: 'relative' }}
                              >
                                <Breadcrumb
                                  className={mainContentStyles.Breadcrumb}
                                  separator=">"
                                >
                                  {breadcrumbList.map((value, key) => {
                                    return (
                                      <Breadcrumb.Item key={key}>
                                        <span
                                          title={
                                            value &&
                                            value.file_name &&
                                            value.file_name
                                          }
                                          className={
                                            key == breadcrumbList.length - 1 &&
                                            mainContentStyles.breadItem
                                          }
                                        >
                                          {value &&
                                            value.file_name &&
                                            value.file_name}
                                        </span>
                                      </Breadcrumb.Item>
                                    )
                                  })}
                                </Breadcrumb>
                              </div>
                            </div>
                            <Dropdown
                              trigger={['click']}
                              getPopupContainer={triggerNode =>
                                triggerNode.parentNode
                              }
                              overlay={this.getAttachmentActionMenus({
                                fileInfo,
                                code: 'SUBTASK_DELIVERABLES',
                                card_id
                              })}
                            >
                              <span
                                onClick={e => e && e.stopPropagation()}
                                className={`${mainContentStyles.pay_more_icon} ${globalStyles.authTheme}`}
                              >
                                &#xe66f;
                              </span>
                            </Dropdown>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        )
        break
      case 'DEPENDENCY':
        messageValue = (
          <div
            key={id}
            style={{ position: 'relative' }}
            className={`${mainContentStyles.field_content} ${showDelColor &&
              currentItem.id == currentDelId &&
              mainContentStyles.showDelColor}`}
          >
            <SetRelationContent
              card_id={card_id}
              board_id={board_id}
              handleDelCurrentField={this.handleDelCurrentField}
              onlyShowPopoverContent={true}
              currentItem={currentItem}
            />
          </div>
        )
        break
      default:
        break
    }
    return messageValue
  }

  render() {
    const { drawContent = {} } = this.props
    const { properties = [] } = drawContent
    return (
      <div>
        <div>
          {properties &&
            properties.map(item => {
              return (
                <div key={item.id}>{this.filterDiffPropertiesField(item)}</div>
              )
            })}
        </div>
      </div>
    )
  }
}

// 只关联public弹窗内的数据
function mapStateToProps({
  publicTaskDetailModal: {
    drawContent = {},
    card_id,
    boardTagList = [],
    attributesList = [],
    propertiesList = [],
    card_list_group = []
  },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  },
  technological: {
    datas: { userBoardPermissions }
  }
}) {
  return {
    drawContent,
    card_id,
    boardTagList,
    attributesList,
    propertiesList,
    projectDetailInfoData,
    userBoardPermissions,
    card_list_group
  }
}
