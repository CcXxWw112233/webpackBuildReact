import React, { Component } from 'react'
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
import CreateProject from './../Project/components/CreateProject/index';
import { Input, message } from 'antd'
import { addTaskGroup } from '../../../../services/technological/task';
import { isApiResponseOk } from '../../../../utils/handleResponseData';
import { afterCreateBoardUpdateGantt } from './ganttBusiness';

@connect(mapStateToProps)
export default class GroupListHeadElse extends Component {
  state = {
    add_new_board_group: false,
    add_new_board_group_value: '', //分组名
  }
  setAddProjectModalVisible = (data) => {
    const { addProjectModalVisible } = this.state
    this.setState({
      addProjectModalVisible: !addProjectModalVisible
    })
  }

  handleSubmitNewProject = data => {
    const { dispatch } = this.props;
    Promise.resolve(
      dispatch({
        type: 'project/addNewProject',
        payload: data
      })
    )
      .then(() => {
        dispatch({
          type: 'workbench/getProjectList',
          payload: {}
        });
      })
      .then(() => {
        afterCreateBoardUpdateGantt(dispatch)
      });
  };
  getElseHeight = () => {
    let rows = 7
    const { gantt_card_height, dataAreaRealHeight, ceiHeight } = this.props
    const difference_height = gantt_card_height - dataAreaRealHeight
    const mult = Math.ceil(difference_height / ceiHeight)
    if (dataAreaRealHeight < 0) {
      rows = 7
    } else {
      if (mult < 7) {
        rows = 7
      } else {
        rows = mult
      }
    }
    return rows * ceiHeight
  }

  // 新增分组
  addNew = () => {
    const { gantt_board_id } = this.props
    if (gantt_board_id == '0') {
      this.setAddProjectModalVisible()
    } else {
      this.setAddNewBoardGroup(true)
    }
  }

  setAddNewBoardGroup = (bool) => {
    this.setState({
      add_new_board_group: bool,
      add_new_board_group_value: '',
    })
  }
  // 更改名称
  inputOnPressEnter = (e) => {
    this.requestAddNewGroup()
    this.setAddNewBoardGroup(false)
  }
  inputOnBlur = (e) => {
    this.setAddNewBoardGroup(false)
  }
  inputOnchange = (e) => {
    const { value } = e.target
    this.setState({
      add_new_board_group_value: value
    })
  }
  requestAddNewGroup = async () => {
    const { add_new_board_group_value } = this.state
    const { gantt_board_id, dispatch } = this.props
    if (!!!add_new_board_group_value) {
      return
    }
    const params = {
      board_id: gantt_board_id,
      name: add_new_board_group_value,
    }
    const res = await addTaskGroup(params)
    if (isApiResponseOk(res)) {
      message.success('添加成功')
      setTimeout(() => {
        dispatch({
          type: 'gantt/getGanttData',
          payload: {}
        })
        dispatch({
          type: 'gantt/getAboutGroupBoards',
          payload: {}
        })
      }, 1000)
    } else {
      message.error(res.message)
    }
  }
  render() {
    const { addProjectModalVisible, add_new_board_group, add_new_board_group_value } = this.state
    const { gantt_board_id, group_view_type } = this.props

    return (
      <div style={{ height: this.getElseHeight() }} className={`${indexStyles.listHeadItem}`}>
        {
          group_view_type == '1' && !add_new_board_group && gantt_board_id != '0' && (
            <div onClick={this.addNew} className={globalStyles.link_mouse} style={{ marginTop: 20 }}>
              <i className={globalStyles.authTheme}>&#xe8fe;</i>
              新增分组
            </div>
          )
        }
        {
          add_new_board_group && (
            <Input
              style={{ marginTop: 10 }}
              autoFocus
              value={add_new_board_group_value}
              onChange={this.inputOnchange}
              onPressEnter={this.inputOnPressEnter}
              onBlur={this.inputOnBlur}
            />
          )
        }
        {addProjectModalVisible && (
          <CreateProject
            setAddProjectModalVisible={this.setAddProjectModalVisible}
            addProjectModalVisible={addProjectModalVisible}
            addNewProject={this.handleSubmitNewProject}
          />
        )}
      </div>
    )
  }
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ gantt: { datas: { gold_date_arr = [], ceiHeight, gantt_board_id, group_view_type } } }) {
  return { gold_date_arr, ceiHeight, group_view_type, gantt_board_id }
}