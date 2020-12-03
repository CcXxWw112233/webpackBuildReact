import React from 'react'
// import MenuSearchStyles from './MenuSearch.less'
import { Icon, Input, Button, DatePicker, Menu } from 'antd'
import {
  checkIsHasPermissionInBoard,
  currentNounPlanFilterName
} from '../../../../../utils/businessFunction'
import {
  FLOWS,
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_FLOWS_FLOW_CREATE
} from '../../../../../globalset/js/constant'
import { connect } from 'dva/index'

@connect(mapStateToProps)
export default class MenuSearchTemplate extends React.Component {
  state = {
    resultArr: [],
    keyWord: ''
  }
  state = {
    resultArr: [],
    keyWord: ''
  }
  componentWillMount() {
    const { keyWord } = this.state
    const {
      datas: { processTemplateList = [] }
    } = this.props.model
    this.setState({
      resultArr: this.fuzzyQuery(processTemplateList, keyWord)
    })
  }
  componentWillReceiveProps(nextProps) {
    const { keyWord } = this.state
    const {
      datas: { processTemplateList = [] }
    } = nextProps.model
    this.setState({
      resultArr: this.fuzzyQuery(processTemplateList, keyWord)
    })
  }
  //模糊查询
  //模糊查询
  handleMenuReallyClick = e => {
    const { key } = e
    if (!key) {
      return false
    }
    const {
      datas: { processTemplateList = [] }
    } = this.props.model
    const { template_name, template_id, template_no } = processTemplateList[
      Number(key)
    ]
    //此处为启动流程界面查询逻辑(查询模板信息)
    this.props.getTemplateInfo && this.props.getTemplateInfo(template_id)
  }
  fuzzyQuery = (list, keyWord) => {
    var arr = []
    for (var i = 0; i < list.length; i++) {
      if (list[i].template_name.indexOf(keyWord) !== -1) {
        arr.push(list[i])
      }
    }
    return arr
  }
  onChange = e => {
    const {
      datas: { processTemplateList = [] }
    } = this.props.model
    const keyWord = e.target.value
    const resultArr = this.fuzzyQuery(processTemplateList, keyWord)
    this.setState({
      keyWord,
      resultArr
    })
  }
  render() {
    const { keyWord, resultArr } = this.state
    const resultArrPermission = checkIsHasPermissionInBoard(
      PROJECT_FLOWS_FLOW_CREATE
    )
      ? resultArr
      : []
    return (
      <Menu
        style={{ padding: 8 }}
        onClick={this.handleMenuReallyClick.bind(this)}
      >
        <Input
          placeholder={`搜索${currentNounPlanFilterName(FLOWS)}模板`}
          value={keyWord}
          onChange={this.onChange.bind(this)}
          style={{ marginBottom: 10 }}
        />
        {resultArrPermission.map((value, key) => {
          const { template_name, template_id, template_no } = value
          return (
            <Menu.Item style={{ height: 32, lineHeight: '32px' }} key={key}>
              {template_name}
            </Menu.Item>
          )
        })}
      </Menu>
    )
  }
}

function mapStateToProps({
  technological: {
    datas: { userBoardPermissions }
  }
}) {
  return {
    userBoardPermissions
  }
}
