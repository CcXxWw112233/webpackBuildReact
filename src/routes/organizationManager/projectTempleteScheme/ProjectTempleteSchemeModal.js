import React, { Component } from 'react'
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { ORGANIZATION, PROJECTS } from '@/globalset/js/constant'
import { currentNounPlanFilterName } from '@/utils/businessFunction'
import planning from '../../../assets/organizationManager/planning.png'
import { connect } from 'dva'
import { Tooltip, Modal, Dropdown, Menu, Input } from 'antd'
import TempleteSchemeDetail from './TempleteSchemeDetail'
import CreateTempleteScheme from './CreateTempleteScheme'

@connect(mapStateToProps)
export default class ProjectTempleteSchemeModal extends Component {
  state = {
    whetherShowSchemeDetail: false, // 是否显示详情页
    projectSchemeBreadCrumbList: [], // 当前方案的面包屑路径
    current_templete_id: '', // 当前点击的方案ID
    current_templete_name: '' // 当前的方案名称
  }

  componentDidMount() {
    const { _organization_id } = this.props
    this.props.dispatch({
      type: 'organizationManager/getTemplateList',
      payload: {
        _organization_id,
        type: '2' // 私有模板
      }
    })
  }

  initeState = () => {
    this.setState({
      inputValue: '',
      local_name: ''
    })
  }

  // 更新该组件中的state
  updateStateDatas = datas => {
    this.setState({ ...datas })
  }

  updateModelDatas = ({ id, name, flag }) => {
    const { projectTemplateList = [], dispatch } = this.props
    let new_datas = [...projectTemplateList]
    new_datas = new_datas.map(item => {
      if (item.id == id) {
        let new_item = { ...item }
        new_item = { ...item, is_rename: flag }
        return new_item
      } else {
        if (item.is_rename) {
          let new_item = { ...item }
          new_item = { ...item, is_rename: false }
          return new_item
        }
        return item
      }
    })
    this.setState({
      inputValue: name,
      local_name: name
    })
    dispatch({
      type: 'organizationManager/updateDatas',
      payload: {
        projectTemplateList: new_datas
      }
    })
  }

  handleOperatorSchemeList = ({ id, name }) => {
    if (id != '0') {
      this.props.dispatch({
        type: 'organizationManager/getTemplateListContainer',
        payload: {
          template_id: id
        }
      })
      this.props.dispatch({
        type: 'publicProcessDetailModal/getProcessTemplateList',
        payload: {
          _organization_id: localStorage.getItem('OrganizationId')
        }
      })
      this.props.dispatch({
        type: 'organizationManager/updateDatas',
        payload: {
          currentTempleteId: id
        }
      })
    }

    this.setState({
      whetherShowSchemeDetail: true,
      current_templete_id: id,
      current_templete_name: name
    })
  }

  handleDeleteTemplete = (e, id) => {
    e && e.stopPropagation()
    const { _organization_id } = this.props
    const that = this
    const modal = Modal.confirm()
    modal.update({
      title: '删除模板',
      content: '确认删除该模板吗？',
      zIndex: 1110,
      okText: '确认',
      cancelText: '取消',
      getContainer: () => document.getElementById('org_managementContainer'),
      onOk: () => {
        this.props.dispatch({
          type: 'organizationManager/deleteTemplete',
          payload: {
            id: id,
            _organization_id
          }
        })
      },
      onCancel: () => {
        modal.destroy()
      }
    })
  }

  // 重命名
  handleTempRename = ({ id, name }) => {
    this.updateModelDatas({ id, name, flag: true })
  }

  handleChangeValue = e => {
    e && e.stopPropagation()
    let val = e.target.value
    this.setState({
      inputValue: val
    })
  }

  handleChangeValueBlur = (e, id, name) => {
    e && e.stopPropagation()
    let val = e.target.value
    const { inputValue, local_name } = this.state
    if (inputValue == local_name || val == '' || val.trimLR() == '') {
      this.updateModelDatas({ id, name, flag: false })
      return
    }
    this.props.dispatch({
      type: 'organizationManager/updateTemplete',
      payload: {
        id,
        name: val,
        _organization_id: localStorage.getItem('OrganizationId')
      }
    })
    this.initeState()
  }

  // 模板更多选项
  handleSelectSettings = (e, item) => {
    const { key, domEvent } = e
    domEvent && domEvent.stopPropagation()
    const { id, name } = item
    switch (key) {
      case 'rename':
        this.handleTempRename({ id, name })
        break
      case 'delete':
        this.handleDeleteTemplete(domEvent, id)
        break
      default:
        break
    }
  }

  renderTempSettings = item => {
    return (
      <div>
        <Menu
          onClick={e => {
            this.handleSelectSettings(e, item)
          }}
          getPopupContainer={triggerNode => triggerNode.parentNode}
        >
          <Menu.Item key="rename">重命名</Menu.Item>
          <Menu.Item style={{ color: '#F5222D' }} key="delete">
            删除
          </Menu.Item>
        </Menu>
      </div>
    )
  }

  // 渲染初始列表状态
  renderInitTempleteList = () => {
    const { projectTemplateList = [] } = this.props
    const { inputValue } = this.state
    return (
      <div
        className={`${indexStyles.plan_list_wrapper} ${globalStyles.global_vertical_scrollbar}`}
      >
        {/* <div className={`${indexStyles.add_plan} ${indexStyles.margin_right}`} onClick={() => { this.handleOperatorSchemeList({ id:'0', name:'全部方案' }) }}>
          <span className={`${globalStyles.authTheme} ${indexStyles._add_plan_name}`}>&#xe8fe; 新建方案</span>
        </div> */}
        {!(projectTemplateList && projectTemplateList.length) ? (
          <div
            style={{
              width: '100%',
              textAlign: 'center',
              color: 'rgba(0,0,0,0.45)'
            }}
          >
            暂无数据
          </div>
        ) : (
          projectTemplateList.map(item => {
            let { template_type, id, name, is_rename } = item
            return template_type == '1' ? (
              <div
                key={item.id}
                style={{ position: 'relative', marginRight: '16px' }}
                className={indexStyles.margin_right}
                onClick={() => {
                  this.handleOperatorSchemeList({ id, name })
                }}
              >
                <img src={planning} width={'140px'} height={'100px'} />
                <span
                  title={item.name}
                  className={indexStyles.plan_default_name}
                >
                  {item.name}
                </span>
              </div>
            ) : (
              <div
                key={item.id}
                style={{ position: 'relative' }}
                className={`${indexStyles.margin_right} ${indexStyles.others_list}`}
                onClick={() => {
                  this.handleOperatorSchemeList({ id, name })
                }}
              >
                {is_rename ? (
                  <Input
                    maxLength={50}
                    autoFocus={true}
                    value={inputValue}
                    onClick={e => e.stopPropagation()}
                    onChange={this.handleChangeValue}
                    onPressEnter={e => {
                      this.handleChangeValueBlur(e, item.id, name)
                    }}
                    onBlur={e => {
                      this.handleChangeValueBlur(e, item.id, name)
                    }}
                    style={{
                      width: '124px',
                      height: '32px',
                      padding: '5px 4px',
                      position: 'absolute',
                      top: '50%',
                      right: 0,
                      left: 0,
                      bottom: 0,
                      transform: 'translateY(-25%)',
                      margin: '0 auto'
                    }}
                  />
                ) : (
                  <span title={item.name} className={indexStyles.plan_name}>
                    {item.name}
                  </span>
                )}
                <Dropdown
                  overlayClassName={indexStyles.tempSettings}
                  overlay={this.renderTempSettings(item)}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  trigger={['click']}
                >
                  <span
                    onClick={e => e.stopPropagation()}
                    className={`${globalStyles.authTheme} ${indexStyles.temp_settings}`}
                  >
                    &#xe78e;
                  </span>
                </Dropdown>
              </div>
            )
          })
        )}
      </div>
    )
  }

  // 渲染每一个列表详情
  renderEverySchemeItem = () => {
    let {
      projectSchemeBreadCrumbList,
      current_templete_id,
      current_templete_name
    } = this.state
    const { _organization_id } = this.props
    return current_templete_id == '0' ? (
      <CreateTempleteScheme
        updateStateDatas={this.updateStateDatas}
        _organization_id={_organization_id}
      />
    ) : (
      <TempleteSchemeDetail
        current_templete_id={current_templete_id}
        current_templete_name={current_templete_name}
        updateStateDatas={this.updateStateDatas}
      />
    )
  }

  render() {
    const { whetherShowSchemeDetail } = this.state
    return (
      <div>
        {/* title 标题 */}
        <div className={indexStyles.title}>
          <div
            className={`${globalStyles.authTheme} ${indexStyles.title_icon}`}
          >
            &#xe684;
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 900,
              color: 'rgba(0,0,0,0.65)',
              letterSpacing: '4px'
            }}
          >
            {/* {`${currentNounPlanFilterName(PROJECTS)}模板`} */}
            自有模板
          </div>
        </div>
        {whetherShowSchemeDetail
          ? this.renderEverySchemeItem()
          : this.renderInitTempleteList()}
      </div>
    )
  }
}

function mapStateToProps({
  organizationManager: {
    datas: {
      // whetherShowSchemeDetail,
      projectTemplateList = []
    }
  }
}) {
  return {
    // whetherShowSchemeDetail,
    projectTemplateList
  }
}
