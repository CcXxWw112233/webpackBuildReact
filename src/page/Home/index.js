import React, { Component } from 'react'
import styles from './index.less'
import { connect } from 'react-redux'
import VisualList from './VisualList'
import { INCREMENT, REDUCE } from '../../main/store/userInfo/action'
const Home = (options) => {
  console.log('ssss', options)

  const { girl_friends, money, addMoney, reduceMoney, name } = options
  return (
    <div className={styles.aa}>
      Home
      <div style={{ margin: 20 }}>
        Money: {money}
        <button style={{ marginLeft: 20 }} onClick={() => addMoney(1)}>
          加
        </button>
        <button style={{ marginLeft: 20 }} onClick={() => reduceMoney(1)}>
          减
        </button>
      </div>
      <div style={{ margin: 20 }}>{name}</div>
      <VisualList girl_friends={girl_friends} />
    </div>
  )
}
const mapStateToProps = ({
  girlFriends: { girl_friends },
  calculate: { money, name },
}) => {
  return {
    girl_friends,
    money,
    name,
  }
}

const mapDispatchTopProps = (dispatch) => {
  return {
    addMoney: (count) => dispatch({ type: INCREMENT, payload: { count } }),
    reduceMoney: (count) => dispatch({ type: REDUCE, payload: { count } }),
  }
}
// 使用connect 关联redux
export default connect(mapStateToProps, mapDispatchTopProps)(Home)
