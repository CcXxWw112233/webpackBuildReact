import React from 'react'
import { connect } from 'dva/index'
import QueueAnim from 'rc-queue-anim'
import indexStyles from './index.less'
import TeamInfoDetail from './TeamInfoDetail'

const getEffectOrReducerByName = name => `teamInfo/${name}`

const TeamInfo = props => {
  // console.log(props)
  const { dispatch, model, modal } = props
  const routingJump = path => {
    dispatch({
      type: getEffectOrReducerByName('routingJump'),
      payload: {
        route: path
      }
    })
  }
  const updateDatas = payload => {
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: payload
    })
  }
  const EditTeamShowContentProps = {
    modal,
    model,
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

  return (
    <div>
      <TeamInfoDetail {...EditTeamShowContentProps} />
    </div>
  )
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, teamInfo, loading }) {
  return { modal, model: teamInfo, loading }
}
export default connect(mapStateToProps)(TeamInfo)
