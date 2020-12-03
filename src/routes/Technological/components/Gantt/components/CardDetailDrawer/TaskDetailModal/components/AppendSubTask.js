import React, { Component } from 'react'
import { Tooltip, Button, Dropdown, DatePicker, InputNumber } from 'antd'
import MenuSearchPartner from '@/components/MenuSearchMultiple/MenuSearchPartner.js'
import globalStyles from '@/globalset/css/globalClassName.less'
import appendSubTaskStyles from './appendSubTask.less'
import defaultUserAvatar from '@/assets/invite/user_default_avatar@2x.png'
import AppendSubTaskItem from './AppendSubTaskItem'
import { timestampToTimeNormal } from '@/utils/util'
import { connect } from 'dva'
import AvatarList from '@/components/TaskDetailModal/AvatarList'
import moment from 'moment'
import { timestampToTime } from '../../../../../../../../utils/util'

@connect(
  ({
    publicTaskDetailModal: { drawContent = {} },
    projectDetail: {
      datas: { projectDetailInfoData = {} }
    }
  }) => ({
    drawContent,
    projectDetailInfoData
  })
)
export default class AppendSubTask extends Component {
  constructor(props) {
    super(props)
    for (let val in props.SubTaskLogic) {
      if (typeof props.SubTaskLogic[val] == 'function') {
        this[val] = props.SubTaskLogic[val].bind(this)
      }
    }
  }

  state = {
    is_add_sub_task: false, // 是否添加子任务, 默认为 false
    sub_executors: [], // 子任务的执行人
    saveDisabled: true, // 是否可以点击确定按钮
    inputValue: '', // 用来保存子任务的名称
    due_time: '', // 截止时间选择
    start_time: '' // 开始时间选择
  }

  initState = () => {
    this.setState({
      is_add_sub_task: false, // 是否添加子任务, 默认为 false
      sub_executors: [], // 子任务的执行人
      saveDisabled: true, // 是否可以点击确定按钮
      inputValue: '', // 用来保存子任务的名称
      due_time: '', // 截止时间选择
      start_time: '' // 开始时间选择
    })
  }

  componentWillReceiveProps(nextProps) {
    const {
      drawContent: { card_id }
    } = nextProps
    const {
      drawContent: { card_id: old_card_id }
    } = this.props
    if (card_id != old_card_id && card_id && old_card_id) {
      this.initState()
    }
  }

  // 渲染开始时间
  renderStartTime = () => {
    const { start_time } = this.state
    return (
      <>
        {this.showTimerMode() ? (
          <>
            &nbsp;
            <InputNumber
              min={0}
              onChange={this.handleStartRelativeChange}
              style={{ width: '68px' }}
            />
            &nbsp;日
          </>
        ) : (
          <>
            {this.showTimerRange() ? (
              <DatePicker
                disabledDate={this.disabledStartTime.bind(this)}
                onChange={this.startDatePickerChange.bind(this)}
                placeholder={
                  start_time
                    ? timestampToTimeNormal(start_time, '/', false)
                    : '开始时间'
                }
                format="YYYY/MM/DD"
                style={{
                  opacity: 0,
                  width: 'auto',
                  background: '#000000',
                  position: 'absolute',
                  right: 0,
                  top: '12px',
                  zIndex: 2
                }}
              />
            ) : (
              <DatePicker
                disabledDate={this.disabledStartTime.bind(this)}
                onChange={this.startDatePickerChange.bind(this)}
                placeholder={
                  start_time
                    ? timestampToTimeNormal(start_time, '/', true)
                    : '开始时间'
                }
                format="YYYY/MM/DD HH:mm"
                showTime={{
                  defaultValue: moment('00:00', 'HH:mm'),
                  format: 'HH:mm'
                }}
                style={{
                  opacity: 0,
                  width: 'auto',
                  background: '#000000',
                  position: 'absolute',
                  right: 0,
                  top: '12px',
                  zIndex: 2
                }}
              />
            )}
          </>
        )}
      </>
    )
  }

  // 渲染截止时间
  renderDueTime = () => {
    const { due_time } = this.state
    return (
      <>
        {this.showTimerMode() ? (
          <>
            &nbsp;
            <InputNumber
              min={0}
              onChange={this.handleDueRelativeChange}
              style={{ width: '68px' }}
            />
            &nbsp;日
          </>
        ) : (
          <>
            {' '}
            {this.showTimerRange() ? (
              <DatePicker
                disabledDate={this.disabledDueTime.bind(this)}
                onChange={this.endDatePickerChange.bind(this)}
                placeholder={
                  due_time
                    ? timestampToTimeNormal(due_time, '/', false)
                    : '截止时间'
                }
                format="YYYY/MM/DD"
                style={{
                  opacity: 0,
                  width: 'auto',
                  background: '#000000',
                  position: 'absolute',
                  right: 0,
                  top: '12px',
                  zIndex: 2
                }}
              />
            ) : (
              <DatePicker
                disabledDate={this.disabledDueTime.bind(this)}
                onChange={this.endDatePickerChange.bind(this)}
                placeholder={
                  due_time
                    ? timestampToTimeNormal(due_time, '/', true)
                    : '截止时间'
                }
                format="YYYY/MM/DD HH:mm"
                showTime={{
                  defaultValue: moment('23:59', 'HH:mm'),
                  format: 'HH:mm'
                }}
                style={{
                  opacity: 0,
                  width: 'auto',
                  background: '#000000',
                  position: 'absolute',
                  right: 0,
                  top: '12px',
                  zIndex: 2
                }}
              />
            )}
          </>
        )}
      </>
    )
  }

  render() {
    const {
      children,
      drawContent = {},
      dispatch,
      handleTaskDetailChange,
      handleChildTaskChange,
      whetherUpdateParentTaskTime,
      updateRelyOnRationList,
      boardFolderTreeData,
      handleRelyUploading,
      projectDetailInfoData: { data: dataInfo = [] }
    } = this.props
    const { card_id, board_id } = drawContent
    const { data: child_data = [] } = drawContent['properties'].filter(
      item => item.code == 'SUBTASK'
    )[0]
    const {
      is_add_sub_task,
      sub_executors = [],
      saveDisabled,
      due_time,
      start_time
    } = this.state
    let executor = [
      {
        //任务执行人信息
        user_id: '',
        full_name: '',
        avatar: ''
      }
    ]

    return (
      <div>
        <div style={{ marginBottom: '12px' }}>
          {!is_add_sub_task ? (
            <span
              onClick={e => {
                this.addSubTask(e)
              }}
            >
              {children}
            </span>
          ) : (
            <>
              <div
                style={{
                  padding: '9px 12px',
                  borderRadius: '4px',
                  marginLeft: '10px',
                  marginBottom: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* 文本框部分 */}
                  <span style={{ flex: '1', marginRight: '16px' }}>
                    <input
                      autosize={true}
                      onBlur={this.setchildTaskNameBlur}
                      onChange={this.setchildTaskNameChange}
                      autoFocus={true}
                      // goldName={card_name}
                      maxLength={100}
                      nodeName={'input'}
                      style={{
                        width: '100%',
                        display: 'block',
                        fontSize: 14,
                        color: '#262626',
                        resize: 'none',
                        height: '38px',
                        background: 'rgba(255,255,255,1)',
                        boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)',
                        borderRadius: '4px',
                        border: 'none',
                        outline: 'none',
                        paddingLeft: '12px'
                      }}
                    />
                  </span>
                  {/* 执行人部分 */}
                  <span
                    style={{ position: 'relative' }}
                    className={appendSubTaskStyles.user_pr}
                  >
                    <Dropdown
                      overlayClassName={
                        appendSubTaskStyles.overlay_sub_pricipal
                      }
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      overlay={
                        <MenuSearchPartner
                          handleSelectedAllBtn={this.handleSelectedAllBtn}
                          isInvitation={true}
                          listData={dataInfo}
                          keyCode={'user_id'}
                          searchName={'name'}
                          currentSelect={
                            sub_executors.length ? sub_executors : executor
                          }
                          chirldrenTaskChargeChange={
                            this.chirldrenTaskChargeChange
                          }
                          board_id={board_id}
                        />
                      }
                    >
                      {sub_executors && sub_executors.length ? (
                        <div>
                          <AvatarList
                            size="mini"
                            maxLength={3}
                            excessItemsStyle={{
                              color: '#f56a00',
                              backgroundColor: '#fde3cf'
                            }}
                          >
                            {sub_executors && sub_executors.length ? (
                              sub_executors.map(({ name, avatar }, index) => (
                                <AvatarList.Item
                                  key={index}
                                  tips={name}
                                  src={
                                    this.isValidAvatar(avatar)
                                      ? avatar
                                      : defaultUserAvatar
                                  }
                                />
                              ))
                            ) : (
                              <Tooltip title="执行人">
                                <span
                                  className={`${globalStyles.authTheme} ${appendSubTaskStyles.sub_executor}`}
                                >
                                  &#xe7b2;
                                </span>
                              </Tooltip>
                            )}
                          </AvatarList>
                        </div>
                      ) : (
                        <Tooltip title="执行人">
                          <span
                            className={`${globalStyles.authTheme} ${appendSubTaskStyles.sub_executor}`}
                          >
                            &#xe7b2;
                          </span>
                        </Tooltip>
                      )}
                    </Dropdown>
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', flex: 1 }}>
                    {/* 开始时间 */}
                    <span>
                      <div className={appendSubTaskStyles.due_time}>
                        <div>
                          <span
                            style={{
                              position: 'relative',
                              zIndex: 0,
                              minWidth: '80px',
                              lineHeight: '38px',
                              padding: '0 12px',
                              display: 'inline-block',
                              textAlign: 'center',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {this.showTimerMode() ? (
                              'T +'
                            ) : (
                              <>
                                {start_time
                                  ? timestampToTime(
                                      start_time,
                                      this.showTimerRange() ? true : false
                                    )
                                  : '开始时间'}
                              </>
                            )}
                            {this.renderStartTime()}
                          </span>
                          {!this.showTimerMode() && (
                            <span
                              onClick={this.handleDelStartTime}
                              className={`${start_time &&
                                appendSubTaskStyles.timeDeleBtn}`}
                            ></span>
                          )}
                        </div>
                      </div>
                    </span>
                    &nbsp;
                    <span style={{ color: '#bfbfbf' }}> ~ </span>
                    &nbsp;
                    {/* 截止时间 */}
                    <span>
                      <div className={appendSubTaskStyles.due_time}>
                        <div>
                          <span
                            style={{
                              position: 'relative',
                              zIndex: 0,
                              minWidth: '80px',
                              lineHeight: '38px',
                              padding: '0 12px',
                              display: 'inline-block',
                              textAlign: 'center',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {this.showTimerMode() ? (
                              'T +'
                            ) : (
                              <>
                                {due_time
                                  ? timestampToTime(
                                      due_time,
                                      this.showTimerRange() ? true : false
                                    )
                                  : '截止时间'}
                              </>
                            )}
                            {this.renderDueTime()}
                          </span>
                          {!this.showTimerMode() && (
                            <span
                              onClick={this.handleDelDueTime}
                              className={`${due_time &&
                                appendSubTaskStyles.timeDeleBtn}`}
                            ></span>
                          )}
                        </div>
                      </div>
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      onClick={e => {
                        this.handleCancel(e)
                      }}
                      className={appendSubTaskStyles.cancel}
                    >
                      取消
                    </span>
                    <Button
                      onClick={e => {
                        this.handleSave(e)
                      }}
                      disabled={saveDisabled}
                      type="primary"
                      style={{
                        marginLeft: '16px',
                        width: '60px',
                        height: '34px'
                      }}
                    >
                      确定
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 显示子任务列表 */}
        <div>
          {child_data.map((value, key) => {
            const {
              card_id,
              card_name,
              start_time,
              due_time,
              executors = [],
              deliverables = []
            } = value
            const { user_id } = executors[0] || {}
            return (
              <AppendSubTaskItem
                SubTaskItemLogic={this.props.SubTaskItemLogic}
                boardFolderTreeData={boardFolderTreeData}
                whetherUpdateParentTaskTime={whetherUpdateParentTaskTime}
                handleChildTaskChange={handleChildTaskChange}
                handleTaskDetailChange={handleTaskDetailChange}
                childTaskItemValue={value}
                key={`${card_id}-${card_name}-${user_id}-${due_time}-${start_time}-${deliverables}`}
                childDataIndex={key}
                updateRelyOnRationList={updateRelyOnRationList}
                handleRelyUploading={handleRelyUploading}
                updatePrivateVariablesWithOpenFile={
                  this.props.updatePrivateVariablesWithOpenFile
                }
              />
            )
          })}
        </div>
      </div>
    )
  }
}
