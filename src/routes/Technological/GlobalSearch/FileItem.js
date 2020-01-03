import React from 'react'
import { Modal, Form, Button, Input, message, Select, Icon, Avatar, Tooltip } from 'antd'
import {min_page_width} from "./../../../globalset/js/styles";
import indexstyles from './index.less'
import globalStyles from './../../../globalset/css/globalClassName.less'
import {checkIsHasPermission, checkIsHasPermissionInBoard, setBoardIdStorage, getOrgNameWithOrgIdFilter} from "../../../utils/businessFunction";
import { timestampToTimeNormal } from '../../../utils/util'
import {
  MESSAGE_DURATION_TIME, PROJECT_FILES_FILE_INTERVIEW, NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_CARD_COMPLETE, ORG_TEAM_BOARD_QUERY, APP_KEY
} from "../../../globalset/js/constant";
import Cookies from "js-cookie";
import {connect} from "dva/index";
const FormItem = Form.Item
const TextArea = Input.TextArea

const InputGroup = Input.Group;
const Option = Select.Option;

//此弹窗应用于各个业务弹窗，和右边圈子适配
@connect(mapStateToProps)
export default class AnotherItem extends React.Component {
  state = {

  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {

  }

  itemClick(data, e) {
    const { id, board_id, file_name } = data;
    setBoardIdStorage( board_id)
    // if(!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW)){
    //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
    //   return false
    // }
    const { dispatch } = this.props
    const { model = {} } = this.props
    const projectDetailBoardId = model['board_id']
    Cookies.remove('appsSelectKeyIsAreadyClickArray', { path: '' })
    dispatch({
      type: 'globalSearch/updateDatas',
      payload: {
        globalSearchModalVisible: false
      }
    })
    dispatch({
      type: 'globalSearch/routingJump',
      payload: {
        route: `/technological/projectDetail?board_id=${board_id}&appsSelectKey=${APP_KEY.FILE}&file_id=${id}&file_name=${file_name}`
      }
    })
  }
  itemOneClick(e) {
    e.stopPropagation();
  }
  render() {
    const { itemValue = {}, currentUserOrganizes = [], is_show_org_name, is_all_org } = this.props
    const { is_realize, id, board_id, file_name, file_id, create_time, org_id, board_name } = itemValue

    return(
      <div>
        <div className={indexstyles.taskItem}>
          <div className={globalStyles.authTheme}>&#xe60b;</div>
          <div className={indexstyles.itemName}>
            <div style={{textDecoration: is_realize === "1" ? "line-through" : "none"}} onClick={this.itemClick.bind(this, { id, board_id, file_name })}>
              {file_name}
              {/* <div style={{color: "#8c8c8c", display: 'flex', justifyContent: 'center', alignItems: 'center'}}> */}
                <span style={{marginLeft: 5, marginRight: 2, color: '#8C8C8C'}}>#</span>
                {
                  is_show_org_name && is_all_org && (
                    <span className={indexstyles.org_name}>
                      {getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)}
                    </span>
                  )
                }
                {
                  is_show_org_name && is_all_org && (
                    <span>
                      <Icon type="caret-right" style={{fontSize: 8, color: '#8C8C8C'}}/>
                    </span>
                  )
                }
                <span className={indexstyles.board_name} style={{color: '#8C8C8C'}}>{board_name}</span>
              {/* </div> */}
            </div>
          </div>
          <div className={indexstyles.time}>{timestampToTimeNormal(create_time)}</div>
          {/*<div className={indexstyles.avatar}>*/}
            {/*<Avatar size={16} style={{padding: 0}}/>*/}
          {/*</div>*/}
        </div>
      </div>
    )
  }
}
function mapStateToProps(
  { 
    projectDetail: { datas: { board_id } },
    technological: { datas: { currentUserOrganizes = [], is_show_org_name, is_all_org } },
  }
) {
  return {
    model: { board_id },
    currentUserOrganizes, is_show_org_name, is_all_org,
  }
}