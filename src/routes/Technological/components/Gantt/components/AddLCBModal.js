import React, { Component } from 'react';
import {
  Modal,
  Input,
  Button,
  message,
  Upload,
  Cascader,
  Tooltip,
  notification,
  DatePicker
} from 'antd';
import styles from './../../../components/Workbench/CardContent/Modal/AddTaskModal.less';
import { connect } from 'dva';
import {
  REQUEST_DOMAIN_BOARD,
  UPLOAD_FILE_SIZE
} from './../../../../../globalset/js/constant';
import { deleteUploadFile, getCurrentSelectedProjectMembersList } from './../../../../../services/technological/workbench';
import DropdownSelectWithSearch from './../../../components/Workbench/CardContent/DropdownSelectWithSearch/index';
import DropdownMultipleSelectWithSearch from './../../../components/Workbench/CardContent/DropdownMultipleSelectWithSearch/index';
import DateRangePicker from './../../../components/Workbench/CardContent/DateRangePicker/index';
import Cookies from 'js-cookie';
import {
  checkIsHasPermissionInBoard,
  setStorage
} from '../../../../../utils/businessFunction';
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_FILES_FILE_UPLOAD,
  PROJECT_FLOWS_FLOW_CREATE,
  PROJECT_TEAM_CARD_CREATE
} from '../../../../../globalset/js/constant';
import { timestampToTimeNormal, timeToTimestamp } from "../../../../../utils/util";
import globalStyles from '../../../../../globalset/css/globalClassName.less'

const taskTypeToName = {
  RESPONSIBLE_TASK: 'Tasks',
  EXAMINE_PROGRESS: 'Flows',
  MEETIMG_ARRANGEMENT: 'Tasks',
  MY_DOCUMENT: 'Files'
};
/* eslint-disable */
@connect(({ workbench }) => ({ workbench }))
class AddTaskModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      add_name: '',
      current_selected_board: this.props.current_selected_board || {},
      current_selected_users: [],
      due_time: '',
    };
  }
  componentWillReceiveProps(nextProps) {
    const { create_lcb_time, board_id, about_user_boards = [], current_selected_board } = nextProps

    const { due_time } = this.state
    if (create_lcb_time && due_time != create_lcb_time) {
      this.setState({
        due_time: create_lcb_time
      })
    }
    // 初始化设置已选项目
    const init_selected_board = about_user_boards.find(item => item.board_id == board_id) || {}
    this.setState({
      current_selected_board: current_selected_board || init_selected_board
    })
  }
  handleSelectedItemChange = list => {
    this.setState({
      current_selected_users: list
    });
  };

  datePickerChange(date, dateString) {
    const newDateString = dateString.replace(/-/gim, '/')
    if (!dateString) {
      return false
    }
    this.setState({
      due_time: timeToTimestamp(newDateString)
    })
  }

  handleAddTaskModalCancel = () => {
    this.setState({
      current_selected_board: {},
      due_time: '',
      add_name: ''
    });

    this.props.setAddLCBModalVisibile && this.props.setAddLCBModalVisibile()
  };

  isShouldNotDisableSubmitBtn = () => {
    const { current_selected_board = {} } = this.state
    const { board_id } = current_selected_board
    // console.log('sssssssssss', {current_selected_board})
    const {
      add_name,
      due_time,
    } = this.state;
    const isHasChooseBoard = () => !!!board_id
    const isHasTaskTitle = () => !!!add_name
    const isHasDueTime = () => !!!due_time
    return isHasTaskTitle() || isHasDueTime() || isHasChooseBoard()
  }

  handleAddTaskModalTaskTitleChange = e => {
    this.setState({
      add_name: e.target.value
    });
  };

  handleClickedSubmitBtn = () => {
    const { current_selected_board = {}, add_name, due_time, current_selected_users } = this.state
    const { board_id } = current_selected_board
    let users = []
    for (let val of current_selected_users) {
      users.push(val['id'] || val['user_id'])
    }
    const param = {
      currentSelectedProject: board_id, add_name, due_time, users
    }

    this.props.submitCreatMilestone && this.props.submitCreatMilestone(param)
    this.handleAddTaskModalCancel()
  }

  // -----------------
  getBoardName = (board_id) => {
    const { about_user_boards = [] } = this.props
    const board_name = (about_user_boards.find(item => item.board_id == board_id) || {}).board_name
    return board_name || '项目名称'
  }
  handleSelectedBoard = (item) => {
    this.setCurrentSelectedBoard(item)
  }
  setCurrentSelectedBoard = (data) => {
    this.setState({
      current_selected_board: data
    })
  }
  render() {
    const {
      add_name,
      current_selected_board = {},
      current_selected_users,
      due_time,
    } = this.state;
    const {
      add_lcb_modal_visible,
      create_lcb_time,
      board_id,
      about_user_boards,
      zIndex
    } = this.props;

    // console.log('sssss_0', {
    //   current_selected_board,
    //   current_selected_users
    // } )

    return (
      <Modal
        visible={add_lcb_modal_visible}
        maskClosable={false}
        title={<div style={{ textAlign: 'center' }}>{'新建里程碑'}</div>}
        onOk={this.handleAddTaskModalOk}
        onCancel={this.handleAddTaskModalCancel}
        footer={null}
        destroyOnClose={true}
        zIndex={zIndex || 1000}
      >
        <div className={styles.addTaskModalContent}>
          <div className={styles.addTaskModalSelectProject}>
            <div className={styles.addTaskModalSelectProject_and_groupList}>
              {/*在甘特图中传递了项目id的情况下，会固定不允许选择项目*/}
              {current_selected_board.board_id && board_id != '0' ? (
                <div className={styles.groupList__wrapper} style={{ marginLeft: 0 }}>
                  <span className={globalStyles.authTheme} style={{ marginRight: 2, fontSize: 18 }}>&#xe60a;</span>
                  {current_selected_board.board_name}
                </div>
              ) : (
                  <DropdownSelectWithSearch
                    list={about_user_boards}
                    _organization_id={current_selected_board.org_id}
                    initSearchTitle="选择项目"
                    selectedItem={current_selected_board}
                    handleSelectedItem={this.handleSelectedBoard}
                    isShouldDisableDropdown={false}
                  />
                )}
            </div>

            {/*时间选择*/}
            <div>
              {create_lcb_time ? timestampToTimeNormal(create_lcb_time, '/', true) : (
                <div style={{ position: 'relative' }}>
                  {timestampToTimeNormal(due_time, '/', true) || '设置截止时间'}
                  <DatePicker onChange={this.datePickerChange.bind(this)}
                    placeholder={'选择截止时间'}
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    style={{ opacity: 0, height: 16, minWidth: 0, maxWidth: '100px', background: '#000000', position: 'absolute', right: 0, zIndex: 2, cursor: 'pointer' }} />
                </div>
              )}
            </div>

          </div>
          <div className={styles.addTaskModalTaskTitle}>
            <Input
              value={add_name}
              onChange={this.handleAddTaskModalTaskTitleChange}
            />
          </div>
          {/*参与人*/}
          <div className={styles.addTaskModalFooter}>
            <div className={styles.addTaskModalOperator}>
              <DropdownMultipleSelectWithSearch
                itemTitle={'参与人'}
                board_id={current_selected_board.board_id}
                list={current_selected_board.users || []}
                handleSelectedItemChange={this.handleSelectedItemChange}
                current_selected_users={current_selected_users}
              />
            </div>
            <div className={styles.confirmBtn}>
              <Button
                type="primary"
                disabled={this.isShouldNotDisableSubmitBtn()}
                onClick={this.handleClickedSubmitBtn}>
                完成
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default AddTaskModal;
