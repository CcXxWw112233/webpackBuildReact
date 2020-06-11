import React, { Component } from 'react'
import styles from './index.less'
import { connect } from 'react-redux'
import VisualList from './VisualList'
const Home = (options) => {
    const { userInfo: { name, girl_friends } } = options
    console.log('ssss', { girl_friends })
    return (
        <div className={styles.aa}>
            Home
            <div className={styles.bb}>
                {name}
            </div>
            <VisualList girl_friends={girl_friends} />
        </div>
    );
}
const mapStateToProps = ({ userInfo }) => {
    return {
        userInfo
    }
}

const mapDispatchTopProps = {}
// 使用connect 关联redux
export default connect(mapStateToProps)(Home)
