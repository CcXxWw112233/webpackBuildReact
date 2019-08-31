import React from 'react';
import {connect} from "dva/index";
import AccountSetMenu from './AccountSetMenu.js'
import indexStyle from './index.less'

const getEffectOrReducerByName = name => `accountSet/${name}`

const AccountSet = (options) => {
  const { model, dispatch } =options
  const menuFormProps = {
    model,
    dispatch,
    updateUserInfo(data) {
      dispatch({
        type: getEffectOrReducerByName('updateUserInfo'),
        payload: {
          data
        }
      })
    },
    changePassWord(data) {
      dispatch({
        type: getEffectOrReducerByName('changePassWord'),
        payload: {
          data
        }
      })
    },
    updateDatas(data) {
      dispatch({
        type: 'updateDatas',
        payload: data
      })
    },
    getVerificationcode(data, calback) {
      dispatch({
        type: getEffectOrReducerByName('getVerificationcode'),
        payload: {
          data,
          calback
        }
      })
    },
    checkMobileIsRegisted(data) {
      dispatch({
        type: getEffectOrReducerByName('checkMobileIsRegisted'),
        payload: { data }
      })
    },
    checkEmailIsRegisted(data) {
      dispatch({
        type: getEffectOrReducerByName('checkEmailIsRegisted'),
        payload: { data }
      })
    },
    getUserInfo(data) {
      dispatch({
        type: getEffectOrReducerByName('getUserInfo'),
        payload: data
      })
    }
  }
  const updateDatas = (payload) => {
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: payload
    })
  }
    return(
      <div>
        <div style={{height: 48, width: 1152, margin: '0 auto'}}></div>
        <div style={{width: 1152, margin: '0 auto'}} className={indexStyle.page_card_2}>
          <AccountSetMenu {...menuFormProps} updateDatas={updateDatas}></AccountSetMenu>
        </div>
      </div>
    )
};

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, accountSet, loading }) {
  return { modal, model: accountSet, loading }
}
export default connect(mapStateToProps)(AccountSet)
