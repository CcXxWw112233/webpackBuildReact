import React, { Component } from 'react'
import { connect } from 'dva'
import { Dropdown, Breadcrumb } from 'antd'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import mainContentStyles from '../MainContent.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import UploadAttachment from '@/components/UploadAttachment'
import RichTextEditor from '@/components/RichTextEditor'
import MilestoneAdd from '@/components/MilestoneAdd'
import LabelDataComponent from '@/components/LabelDataComponent'
import AppendSubTask from '../components/AppendSubTask'
import { timestampFormat } from '@/utils/util'
import { PROJECT_TEAM_CARD_EDIT } from '@/globalset/js/constant'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import {
  getCurrentDrawerContentPropsModelFieldData,
  getCurrentPropertiesData,
  judgeFileType,
  showMemberName,
  getFolderPathName
} from '../handleOperateModal'
import { currentNounPlanFilterName } from '../../../utils/businessFunction'
import { TASKS } from '../../../globalset/js/constant'
import SubTaskContainer from './SubTaskContainer'
import SetRelationContent from '../../RelyOnRelationship/SetRelationContent'

@connect(mapStateToProps)
export default class BasicFieldUIComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      previewFileModalVisibile: false,
      selectedKeys: [] // 选择字段的选项
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
      projectDetailInfoData = {},
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
      properties = [],
      deliverables = [],
      dec_files = []
    } = drawContent
    const { code, id } = currentItem
    const flag =
      this.checkDiffCategoriesAuthoritiesIsVisible &&
      this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit &&
      !this.checkDiffCategoriesAuthoritiesIsVisible(
        PROJECT_TEAM_CARD_EDIT
      ).visit_control_edit()
    const executors = getCurrentDrawerContentPropsModelFieldData({
      properties,
      code: 'EXECUTOR'
    })
    const gold_data = getCurrentPropertiesData(
      drawContent['properties'],
      'SUBTASK'
    )
    let messageValue = <div></div>
    switch (code) {
      case 'MILESTONE': // 里程碑
        messageValue = (
          <div
            key={id}
            style={{ position: 'relative' }}
            className={`${mainContentStyles.field_content} ${showDelColor &&
              currentItem.id == currentDelId &&
              mainContentStyles.showDelColor}`}
          >
            <div className={mainContentStyles.field_item}>
              <div className={mainContentStyles.field_left}>
                {!flag && (
                  <span
                    onClick={() => {
                      this.handleDelCurrentField(currentItem.id)
                    }}
                    className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}
                  >
                    &#xe7fe;
                  </span>
                )}
                <div className={mainContentStyles.field_hover}>
                  <span className={`${globalStyles.authTheme}`}>&#xe6b7;</span>
                  <span>里程碑</span>
                </div>
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
                        <span className={mainContentStyles.value_text}>
                          {currentItem.data.name}
                        </span>
                      ) : (
                        '加入里程碑'
                      )}
                    </div>
                  </MilestoneAdd>
                )}
              </div>
            </div>
          </div>
        )
        break
      case 'REMARK': // 备注
        // messageValue = (
        //   <div key={id} style={{ position: 'relative' }} className={`${mainContentStyles.field_content} ${showDelColor && currentItem.id == currentDelId && mainContentStyles.showDelColor}`}>
        //     <div className={mainContentStyles.field_item}>
        //       <div className={mainContentStyles.field_left}>
        //         {
        //           !flag && (
        //             <span onClick={() => { this.handleDelCurrentField(currentItem.id) }} className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}>&#xe7fe;</span>
        //           )
        //         }
        //         <div className={mainContentStyles.field_hover} style={{ maxWidth: 'inherit' }}>
        //           <span className={`${globalStyles.authTheme}`}>&#xe7f6;</span>
        //           <span>{`${currentNounPlanFilterName(TASKS)}`}说明</span>
        //         </div>
        //       </div>
        //       <>
        //         <div className={`${mainContentStyles.field_right}`}>
        //           <div style={{ display: 'flex' }}>
        //             {
        //               (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_EDIT).visit_control_edit() ? (
        //                 (
        //                   currentItem.data && currentItem.data == '<p></p>' ? (
        //                     <div className={`${mainContentStyles.pub_hover}`} style={{ width: '100%' }}>
        //                       <span>暂无</span>
        //                     </div>
        //                   ) : (
        //                       <div className={`${mainContentStyles.pub_hover}`} >
        //                         <div className={mainContentStyles.descriptionContent} dangerouslySetInnerHTML={{ __html: currentItem.data }}></div>
        //                       </div>
        //                     )
        //                 )
        //               ) : (
        //                   // 富文本组件
        //                   <>
        //                     <div style={{ flex: 1, marginRight: '10px' }}>
        //                       <RichTextEditor saveBrafitEdit={this.saveBrafitEdit} value={currentItem.data && currentItem.data}>
        //                         <div className={`${mainContentStyles.pub_hover}`} >
        //                           {
        //                             currentItem.data && currentItem.data != '<p></p>' ?
        //                               <div className={mainContentStyles.descriptionContent} dangerouslySetInnerHTML={{ __html: currentItem.data }}></div>
        //                               :
        //                               `添加说明`
        //                           }
        //                         </div>
        //                       </RichTextEditor>
        //                     </div>
        //                     <div onClick={(e) => e && e.stopPropagation()}>
        //                       <UploadAttachment
        //                         executors={executors.data}
        //                         boardFolderTreeData={boardFolderTreeData}
        //                         card_id={card_id}
        //                         title={`任务说明资料设置`}
        //                         listDescribe={'说明资料列表'}
        //                         isNotShowNoticeList={true}
        //                         url={'/api/projects/card/desc/attachment/upload'}
        //                         onFileListChange={this.onUploadDescFileListChange}
        //                       >
        //                         <span className={mainContentStyles.add_sub_upload}>
        //                           <span style={{ fontSize: '16px' }} className={globalStyles.authTheme}>&#xe7fa;</span>
        //                           <span>上传说明资料</span>
        //                         </span>
        //                       </UploadAttachment>
        //                     </div>
        //                   </>
        //                 )
        //             }
        //           </div>
        //           <div>
        //             {/* 交付物 */}
        //             <div className={mainContentStyles.filelist_wrapper}>
        //               {
        //                 !!(dec_files && dec_files.length) && dec_files.map(fileInfo => {
        //                   const { name: file_name, file_id } = fileInfo
        //                   const breadcrumbList = getFolderPathName(fileInfo)
        //                   return (
        //                     <div className={`${mainContentStyles.file_item_wrapper}`} key={fileInfo.id}>
        //                       <div className={`${mainContentStyles.file_item} ${mainContentStyles.pub_hover}`} onClick={(e) => this.openFileDetailModal(e, fileInfo)} >
        //                         <div>
        //                           <span className={`${mainContentStyles.file_action} ${globalStyles.authTheme}`} dangerouslySetInnerHTML={{ __html: judgeFileType(file_name) }}></span>
        //                         </div>
        //                         <div style={{ flex: 1 }}>
        //                           <div title={file_name} className={mainContentStyles.pay_file_name}>{file_name}</div>
        //                         </div>
        //                         <div className={mainContentStyles.file_info}>{showMemberName(fileInfo.create_by, data)} 上传于 {fileInfo.create_time && timestampFormat(fileInfo.create_time, "MM-dd hh:mm")}</div>
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
        //                         <Dropdown trigger={['click']} getPopupContainer={triggerNode => triggerNode.parentNode} overlay={this.getAttachmentActionMenus({ fileInfo, code: 'REMARK', card_id })}>
        //                           <span onClick={(e) => e && e.stopPropagation()} className={`${mainContentStyles.pay_more_icon} ${globalStyles.authTheme}`}>&#xe66f;</span>
        //                         </Dropdown>
        //                       </div>
        //                     </div>
        //                   )
        //                 })
        //               }
        //             </div>
        //           </div>
        //         </div>
        //       </>
        //     </div>
        //     {/* </div> */}
        //   </div>
        // )
        break
      case 'LABEL': // 标签
        messageValue = (
          <div
            key={id}
            className={`${mainContentStyles.field_content} ${showDelColor &&
              currentItem.id == currentDelId &&
              mainContentStyles.showDelColor}`}
          >
            <div className={mainContentStyles.field_item}>
              <div className={mainContentStyles.field_left}>
                {!flag && (
                  <span
                    onClick={() => {
                      this.handleDelCurrentField(currentItem.id)
                    }}
                    className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}
                  >
                    &#xe7fe;
                  </span>
                )}
                <div className={mainContentStyles.field_hover}>
                  <span className={`${globalStyles.authTheme}`}>&#xe6b8;</span>
                  <span>标签</span>
                </div>
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
                        getPopupContainer={triggerNode =>
                          triggerNode.parentNode
                        }
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
                        getPopupContainer={triggerNode =>
                          triggerNode.parentNode
                        }
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
          </div>
        )
        break
      case 'ATTACHMENT': // 上传附件
        messageValue = (
          <></>
          // <div className={mainContentStyles.moveWrapper}>
          // <>
          // <div key={id} className={`${mainContentStyles.field_content} ${showDelColor && currentItem.id == currentDelId && mainContentStyles.showDelColor}`}>
          //   <div className={mainContentStyles.field_left}>
          //     {
          //       !flag && (
          //         <span onClick={() => { this.handleDelCurrentField(currentItem.id) }} className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}>&#xe7fe;</span>
          //       )
          //     }
          //     <div className={mainContentStyles.field_hover}>
          //       <span className={`${globalStyles.authTheme}`}>&#xe6b9;</span>
          //       <span>上传</span>
          //     </div>
          //   </div>
          //   <div className={`${mainContentStyles.field_right}`}>
          //     {
          //       (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_ATTACHMENT_UPLOAD).visit_control_edit() ? (
          //         <div className={`${mainContentStyles.pub_hover}`}>
          //           <span>暂无</span>
          //         </div>
          //       ) : (
          //           <div className={`${mainContentStyles.pub_hover}`}>
          //             {
          //               card_id && (
          //                 <UploadAttachment executors={executors.data} boardFolderTreeData={boardFolderTreeData} projectDetailInfoData={projectDetailInfoData} org_id={org_id} board_id={board_id} card_id={card_id}
          //                   onFileListChange={this.onUploadFileListChange}>
          //                   <div className={mainContentStyles.upload_file_btn}>
          //                     <span className={`${globalStyles.authTheme}`} style={{ fontSize: '16px' }}>&#xe7fa;</span> 上传附件
          //                 </div>
          //                 </UploadAttachment>
          //               )}
          //           </div>
          //         )
          //     }
          //     <div className={mainContentStyles.filelist_wrapper}>
          //       {
          //         currentItem.data && currentItem.data.map((fileInfo) => {
          //           const breadcrumbList = this.getFolderPathName(currentItem.data, fileInfo)
          //           return (
          //             <div className={`${mainContentStyles.file_item_wrapper}`} key={fileInfo.id}>

          //               <Dropdown overlay={this.getAttachmentActionMenus(fileInfo, card_id)}>
          //                 <div className={mainContentStyles.file_action}>
          //                   <i className={`${globalStyles.authTheme}`} style={{ fontSize: '16px' }}>&#xe7fd;</i>
          //                 </div>
          //               </Dropdown>
          //               <div className={`${mainContentStyles.file_item} ${mainContentStyles.pub_hover}`} onClick={() => this.openFileDetailModal(fileInfo)} >
          //                 <div className={mainContentStyles.file_title}><span className={`${globalStyles.authTheme}`} style={{ fontSize: '24px', color: '#40A9FF' }}>&#xe659;</span><span>{fileInfo.name}</span></div>
          //                 <div className={mainContentStyles.file_info}>{this.showMemberName(fileInfo.create_by)} 上传于 {fileInfo.create_time && timestampFormat(fileInfo.create_time, "MM-dd hh:mm")}</div>
          //                 <div className={mainContentStyles.breadNav} style={{ position: 'relative' }}>
          //                   <Breadcrumb className={mainContentStyles.Breadcrumb} separator=">">
          //                     {breadcrumbList.map((value, key) => {
          //                       return (
          //                         <Tooltip getPopupContainer={triggerNode => triggerNode.parentNode} title={(value && value.file_name) && value.file_name} placement="top">
          //                           <Breadcrumb.Item key={key}>
          //                             <span className={key == breadcrumbList.length - 1 && mainContentStyles.breadItem}>{(value && value.file_name) && value.file_name}</span>
          //                           </Breadcrumb.Item>
          //                         </Tooltip>
          //                       )
          //                     })}
          //                   </Breadcrumb>
          //                 </div>
          //               </div>
          //             </div>
          //           );
          //         })
          //       }
          //     </div>
          //   </div>
          // </div>
          //  </>
          // </div>
        )
        break
      case 'SUBTASK':
        messageValue = (
          <div
            key={id}
            className={`${mainContentStyles.field_content} ${showDelColor &&
              currentItem.id == currentDelId &&
              mainContentStyles.showDelColor}`}
          >
            <div className={mainContentStyles.field_item}>
              <div className={mainContentStyles.field_left}>
                {!flag && !(gold_data && gold_data.length) && (
                  <span
                    onClick={() => {
                      this.handleDelCurrentField(currentItem.id)
                    }}
                    className={`${globalStyles.authTheme} ${mainContentStyles.field_delIcon}`}
                  >
                    &#xe7fe;
                  </span>
                )}
                <div
                  className={mainContentStyles.field_hover}
                  style={{ maxWidth: 'inherit' }}
                >
                  <span className={`${globalStyles.authTheme}`}>&#xe7f5;</span>
                  <span>
                    {`子${currentNounPlanFilterName(TASKS)}`} & 交付物
                  </span>
                </div>
              </div>
              <div className={`${mainContentStyles.field_right}`}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  {/* 添加子任务组件 */}
                  {
                    <SubTaskContainer
                      handleTaskDetailChange={handleTaskDetailChange}
                      handleChildTaskChange={handleChildTaskChange}
                      whetherUpdateParentTaskTime={whetherUpdateParentTaskTime}
                      updateRelyOnRationList={updateRelyOnRationList}
                      boardFolderTreeData={boardFolderTreeData}
                      handleRelyUploading={this.props.handleRelyUploading}
                      children={
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}
                        >
                          {!!!(deliverables && deliverables.length) && (
                            <div
                              className={mainContentStyles.add_sub_btn}
                              style={{ width: '100%' }}
                            >
                              <span
                                className={`${globalStyles.authTheme}`}
                                style={{ fontSize: '16px' }}
                              >
                                &#xe8fe;
                              </span>{' '}
                              新建{`子${currentNounPlanFilterName(TASKS)}`}
                            </div>
                          )}
                          <div>
                            {card_id && !(gold_data && gold_data.length) && (
                              <div onClick={e => e && e.stopPropagation()}>
                                <UploadAttachment
                                  executors={executors.data}
                                  boardFolderTreeData={boardFolderTreeData}
                                  card_id={card_id}
                                  title={'上传交付物列表设置'}
                                  listDescribe={'交付物列表'}
                                  onFileListChange={this.onUploadFileListChange}
                                >
                                  <span
                                    className={mainContentStyles.add_sub_upload}
                                  >
                                    <span
                                      style={{
                                        fontSize: '16px',
                                        marginRight: '4px',
                                        verticalAlign: 'middle'
                                      }}
                                      className={globalStyles.authTheme}
                                    >
                                      &#xe7fa;
                                    </span>
                                    <span style={{ verticalAlign: 'middle' }}>
                                      上传交付物
                                    </span>
                                  </span>
                                </UploadAttachment>
                              </div>
                            )}
                          </div>
                        </div>
                      }
                    />
                  }
                </div>
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
                              onClick={e =>
                                this.openFileDetailModal(e, fileInfo)
                              }
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
                                  className={mainContentStyles.pay_file_name}
                                >
                                  {file_name}
                                </div>
                              </div>
                              <div className={mainContentStyles.file_info}>
                                {showMemberName(fileInfo.create_by, data)}{' '}
                                上传于{' '}
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
              currentItem={currentItem}
              handleDelCurrentField={this.handleDelCurrentField}
            />
          </div>
        )
        break
      default:
        break
    }
    return messageValue
  }

  // a little function to help us with reordering the result
  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  /**
   * Moves an item from one list to another list.
   */
  move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source)
    const destClone = Array.from(destination)
    const [removed] = sourceClone.splice(droppableSource.index, 1)

    destClone.splice(droppableDestination.index, 0, removed)

    const result = {}
    result[droppableSource.droppableId] = sourceClone
    result[droppableDestination.droppableId] = destClone

    return result
  }

  onDragEnd = result => {
    const { source, destination } = result
    // dropped outside the list
    const {
      dispatch,
      drawContent = {},
      drawContent: { card_id }
    } = this.props
    let new_drawContent = { ...drawContent }
    if (!destination) {
      return
    }

    if (source.droppableId === destination.droppableId) {
      const property_item = new_drawContent['properties'].find(
        (item, index) => index == source.index
      )
      const target_property_item = new_drawContent['properties'].find(
        (item, index) => index == destination.index
      )
      for (let val in new_drawContent) {
        if (val == 'properties') {
          new_drawContent[val] = this.reorder(
            new_drawContent[val],
            source.index,
            destination.index
          )
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
  }

  getDragDropContext = () => {
    const { drawContent = {} } = this.props
    const { properties = [] } = drawContent
    let messageValue = <div></div>
    messageValue = (
      <div>
        <DragDropContext
          getPopupContainer={triggerNode => triggerNode.parentNode}
          onDragEnd={this.onDragEnd}
        >
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {properties &&
                  properties.map((item, index) => (
                    <Draggable
                      key={item.id}
                      index={index}
                      draggableId={item.id}
                    >
                      {(provided, snapshot) => (
                        <div
                          key={item.id}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {this.filterDiffPropertiesField(item)}
                        </div>
                      )}
                    </Draggable>
                  ))}
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
          {this.checkDiffCategoriesAuthoritiesIsVisible &&
          this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit &&
          !this.checkDiffCategoriesAuthoritiesIsVisible(
            PROJECT_TEAM_CARD_EDIT
          ).visit_control_edit() ? (
            <>
              {properties &&
                properties.map(item => {
                  return (
                    <div key={item.id}>
                      {this.filterDiffPropertiesField(item)}
                    </div>
                  )
                })}
            </>
          ) : (
            <div>{this.getDragDropContext()}</div>
          )}
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
    card_list_group,
    projectDetailInfoData,
    userBoardPermissions
  }
}
