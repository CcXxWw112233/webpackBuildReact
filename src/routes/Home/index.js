import React, { Component } from 'react'
import styles from './index.less'
import { connect } from 'react-redux'
const Home = (options) => {
    const { userInfo: { name } } = options
    console.log('ssss', {options})
    return (
        <div className={styles.aa}>
            Home
            <div className={styles.bb}>
                {name}
            </div>
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
