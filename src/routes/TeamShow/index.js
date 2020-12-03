import React from 'react'
import { connect } from 'dva'
import QueueAnim from 'rc-queue-anim'
import globalClassNmae from '../../globalset/css/globalClassName.less'
import { Route, Router, Switch, Link } from 'dva/router'
import dynamic from 'dva/dynamic'
import dva from 'dva/index'
import { LocaleProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import 'moment/locale/zh-cn'
import HeaderNav from './Component/HeaderNav'

const getEffectOrReducerByName = name => `teamShow/${name}`
const TeamShow = options => {
  const { dispatch, model } = options
  const app = dva()
  //导航栏props-------------
  const HeaderNavProps = {
    model,
    routingJump(path) {
      dispatch({
        type: getEffectOrReducerByName('routingJump'),
        payload: {
          route: path
        }
      })
    },

    getTeamShowList(data) {
      dispatch({
        type: getEffectOrReducerByName('getTeamShowList'),
        payload: data
      })
    },
    addTeamShow(data) {
      dispatch({
        type: getEffectOrReducerByName('addTeamShow'),
        payload: data
      })
    },
    getTeamShowTypeList(data) {
      dispatch({
        type: getEffectOrReducerByName('getTeamShowTypeList'),
        payload: data
      })
    },
    getTeamShowDetail(data) {
      dispatch({
        type: getEffectOrReducerByName('getTeamShowDetail'),
        payload: data
      })
    },
    deleteTeamShow(data) {
      dispatch({
        type: getEffectOrReducerByName('deleteTeamShow'),
        payload: data
      })
    },
    getCurrentOrgTeamShowList(data) {
      dispatch({
        type: getEffectOrReducerByName('getCurrentOrgTeamShowList'),
        payload: data
      })
    }
  }
  const updateDatas = payload => {
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: payload
    })
  }

  //-----------------

  const routes = [
    {
      path: '/technological/teamShow/editTeamShow',
      component: () => import('./Component/EditTeamShow')
    },
    {
      path: '/technological/teamShow/teamList',
      component: () => import('./Component/TeamList')
    },
    {
      path: '/technological/teamShow/teamInfo',
      component: () => import('./Component/TeamInfo')
    }
  ]
  return (
    <LocaleProvider locale={zh_CN}>
      {/*className={globalClassNmae.page_style_3}*/}
      <div style={{ minWidth: 1440, position: 'relative' }}>
        {/*<HeaderNav {...HeaderNavProps} updateDatas={updateDatas} />*/}
        {routes.map(({ path, ...dynamics }, key) => {
          return (
            <Route
              key={key}
              exact
              path={path}
              component={dynamic({
                app,
                ...dynamics
              })}
            />
          )
        })}
      </div>
    </LocaleProvider>
  )
}
// export default Products;
// export default connect(({ technological }) => {
//   return({
//     technological,
//   })
//
// })(Technological);

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, teamShow, loading }) {
  return { modal, model: teamShow, loading }
}
export default connect(mapStateToProps)(TeamShow)
