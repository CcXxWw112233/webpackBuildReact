import React from 'react';
import { connect } from "dva/index";
import { Icon, Tabs, message } from 'antd'
import indexStyles from './index.less'
import { color_4 } from '../../globalset/js/styles'
import ProjectRole from './ProjectRole'
import OrgnizationRole from './OrgnizationRole'
import BaseInfo from './BaseInfo'
import { getUrlQueryString } from '../../utils/util'
import NounDefinition from "./NounDefinition";
import { ORGANIZATION, PROJECTS } from "../../globalset/js/constant";
import { currentNounPlanFilterName } from "../../utils/businessFunction";
import FnManagement from './FnManagement';


const TabPane = Tabs.TabPane

const getEffectOrReducerByName = name => `organizationManager/${name}`

const Organization = (options) => {
  const { dispatch, model = {}, showBackBtn = true } = options
  const { datas: { tabSelectKey } } = model
  const updateDatas = (payload) => {
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: payload
    })
  }

  const routingJump = (path) => {
    dispatch({
      type: getEffectOrReducerByName('routingJump'),
      payload: {
        route: path,
      }
    })
  }
  const historyGoBack = () => {
    // window.history.go(-1)
    const nextPath = getUrlQueryString(window.location.href, 'nextpath')
    // console.log(nextPath)
    routingJump(nextPath)
  }

  const asyncProprs = {
    model,
    getFnManagementList(data) {
      dispatch({
        type: getEffectOrReducerByName('getFnManagementList'),
        payload: data
      })
    },
    setFnManagement(data) {
      dispatch({
        type: getEffectOrReducerByName('setFnManagement'),
        payload: data
      })
    },
    updateOrganization(data) {
      dispatch({
        type: getEffectOrReducerByName('updateOrganization'),
        payload: data
      })
    },
    uploadOrganizationLogo(data) {
      dispatch({
        type: getEffectOrReducerByName('uploadOrganizationLogo'),
        payload: data
      })
    },
    getRolePermissions(data) {
      dispatch({
        type: getEffectOrReducerByName('getRolePermissions'),
        payload: data
      })
    },
    saveRolePermission(data) {
      dispatch({
        type: getEffectOrReducerByName('saveRolePermission'),
        payload: data
      })
    },
    createRole(data) {
      dispatch({
        type: getEffectOrReducerByName('createRole'),
        payload: data
      })
    },
    updateRole(data) {
      dispatch({
        type: getEffectOrReducerByName('updateRole'),
        payload: data
      })
    },
    deleteRole(data) {
      dispatch({
        type: getEffectOrReducerByName('deleteRole'),
        payload: data
      })
    },
    copyRole(data) {
      dispatch({
        type: getEffectOrReducerByName('copyRole'),
        payload: data
      })
    },
    setDefaultRole(data) {
      dispatch({
        type: getEffectOrReducerByName('setDefaultRole'),
        payload: data
      })
    },
    savePermission(data) {
      dispatch({
        type: getEffectOrReducerByName('savePermission'),
        payload: data
      })
    },
    getPermissions(data) {
      dispatch({
        type: getEffectOrReducerByName('getPermissions'),
        payload: data
      })
    },
    getNounList(data) {
      dispatch({
        type: getEffectOrReducerByName('getNounList'),
        payload: data
      })
    },
    saveNounList(data) {
      dispatch({
        type: getEffectOrReducerByName('saveNounList'),
        payload: data
      })
    },
  }

  const onTabClick = (key) => {
    updateDatas({
      tabSelectKey: key
    })
  }



  return (
    <div className={indexStyles.organizationOut}>
      <div className={indexStyles.main}>
        {
          showBackBtn && (
<div className={indexStyles.back} onClick={historyGoBack}>
            <Icon type="left" theme="outlined" />返回
          </div>
)}

        <div className={indexStyles.topTitle}>
          <Icon type="home" theme="outlined" style={{ color: color_4, fontSize: 32 }} />
          <div className={indexStyles.titleName}>{currentNounPlanFilterName(ORGANIZATION)}管理后台</div>
          {/*tabs 页*/}
          <div className={indexStyles.tabsOut}>
            <Tabs defaultActiveKey="1" size='small' tabBarGutter={60} activeKey={tabSelectKey} onTabClick={onTabClick}>
              <TabPane tab="基本信息" key="1">
                <BaseInfo {...asyncProprs} updateDatas={updateDatas} />
              </TabPane>
              <TabPane tab={`${currentNounPlanFilterName(ORGANIZATION)}角色`} key="2">
                <OrgnizationRole {...asyncProprs} updateDatas={updateDatas} />
                {/*<RoleTabPaneContent {...asyncProprs} updateDatas={updateDatas}/>*/}
              </TabPane>
              <TabPane tab={`${currentNounPlanFilterName(PROJECTS)}角色`} key="3">
                <ProjectRole {...asyncProprs} updateDatas={updateDatas} />
                {/*<AuthTabPaneContent {...asyncProprs} updateDatas={updateDatas}/>*/}
              </TabPane>
              <TabPane tab="名词定义" key="4">
                <NounDefinition {...asyncProprs} updateDatas={updateDatas} />
              </TabPane>
              <TabPane tab="功能管理" key="5">
                <FnManagement {...asyncProprs} updateDatas={updateDatas}></FnManagement>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
};

function mapStateToProps({ modal, organizationManager, loading }) {
  return { modal, model: organizationManager, loading }
}
export default connect(mapStateToProps)(Organization)
