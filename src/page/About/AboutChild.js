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
        // setInterval(() => {
        //     this.setState({
        //         count: this.state.count + 1
        //     })
        // }, 1000)
    }
    render() {
        return (
            <div>
                <ObjectProto />
                <HookTest count={this.state.count} />
            </div>
        )
    }
}
AboutChild.FpropTypes = {
    prop: PropTypes
}
export default AboutChild