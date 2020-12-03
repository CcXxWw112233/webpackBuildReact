import React, { Component } from 'react'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'

@connect(() => {})
export default class RedirectComp extends Component {
  componentDidMount() {
    const { dispatch } = this.props
    dispatch(routerRedux.push('/technological/simplemode/home'))
  }

  render() {
    return <div></div>
  }
}
