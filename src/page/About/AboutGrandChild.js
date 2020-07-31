import React, { Component } from 'react'
import PropTypes from 'prop-types'
import HookTest from './HookTest'
import ObjectProto from './ObjectProto'
class AboutChild extends Component {
    constructor(props) {
        super(props)
        this.state = {
            count: 0
        }
    }
    componentDidMount() {
        console.log('ssssssssss', 3)
        // setInterval(() => {
        //     this.setState({
        //         count: this.state.count + 1
        //     })
        // }, 1000)
    }
    render() {
        return (
            <div>
                孙子
            </div>
        )
    }
}
AboutChild.FpropTypes = {
    prop: PropTypes
}
export default AboutChild