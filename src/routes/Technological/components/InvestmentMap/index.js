import React, { Component } from 'react';
import Cookies from 'js-cookie'
import { MAP_URL } from "@/globalset/js/constant";
import { connect } from 'dva'

@connect(({InvestmentMap = []}) => ({
    InvestmentMap, 
}))
export default class Index extends React.Component{

  constructor(props) {
    super(props)
    this.state = {
      height: document.querySelector('body').clientHeight
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.setHeight)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.setHeight)
  }
  setHeight = () => {
    const height = document.querySelector('body').clientHeight
    this.setState({
      height
    })
  }
  render() {
    const accessToken = Cookies.get('Authorization')
    const src_url = `${MAP_URL}?token=${accessToken}`
    const { height } = this.state
    return (
      <div>
          <iframe src={src_url} scrolling='no' frameborder="0" width='100%' height={height}></iframe>
      </div>
    );
  }
}
