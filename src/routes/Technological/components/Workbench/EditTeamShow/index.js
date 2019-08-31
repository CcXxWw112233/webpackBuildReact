import React from 'react';
import {connect} from "dva/index";
import QueueAnim from 'rc-queue-anim'
import EditTeamShowContent from './EditTeamShowContent'
import Header from './Header'

const getEffectOrReducerByName = name => `workbenchEditTeamShow/${name}`

const EditTeamShow = (props) => {
  const { dispatch, model, modal } = props

  const routingJump = (path) => {
    dispatch({
      type: getEffectOrReducerByName('routingJump'),
      payload: {
        route: path,
      },
    })
  }
  const updateDatas = (payload) => {
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
    },
  }

  return(
    <div>
      <Header {...EditTeamShowContentProps} updateDatas={updateDatas}/>
      <EditTeamShowContent {...EditTeamShowContentProps} updateDatas={updateDatas}/>
    </div>
  )
};

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, workbenchEditTeamShow, loading }) {
  return { modal, model: workbenchEditTeamShow, loading }
}
export default connect(mapStateToProps)(EditTeamShow)


