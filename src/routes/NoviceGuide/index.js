import React from 'react'
import { connect } from 'dva'
import GuideDetail from './GuideDetail.js'
import Boundary from './Boundary'
import indexStyles from './index.less'

const getEffectOrReducerByName = name => `noviceGuide/${name}`
const NoviceGuide = options => {
  const { dispatch, model } = options
  const GuideDetailProps = {
    model,
    createOrganization(data) {
      dispatch({
        type: getEffectOrReducerByName('createOrganization'),
        payload: data
      })
    },
    applyJoinOrganization(data) {
      dispatch({
        type: getEffectOrReducerByName('applyJoinOrganization'),
        payload: data
      })
    },
    routingJump(path) {
      dispatch({
        type: getEffectOrReducerByName('routingJump'),
        payload: {
          route: path
        }
      })
    },
    updateDatas(payload) {
      dispatch({
        type: getEffectOrReducerByName('updateDatas'),
        payload: payload
      })
    }
  }
  return (
    <div>
      {/* <GuideDetail {...GuideDetailProps} /> */}
      <Boundary dispatch={dispatch} />
    </div>
  )
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, noviceGuide, loading }) {
  return { modal, model: noviceGuide, loading }
}
export default connect(mapStateToProps)(NoviceGuide)
