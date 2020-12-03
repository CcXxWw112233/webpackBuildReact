import React, { Component } from 'react'
import { connect } from 'dva'
import CommonArticlesList from '../../common/CommonArticlesList'
import SearchArticlesList from '../../common/SearchArticlesList'

@connect(({ xczNews = [] }) => ({
  xczNews
}))
export default class HighRise extends Component {
  render() {
    const { xczNews, location } = this.props
    const { articlesList = [], highRiseFlag, inputValue } = xczNews
    // console.log(highRiseFlag)

    if (highRiseFlag) {
      return (
        <div>
          <CommonArticlesList {...{ articlesList }} />
        </div>
      )
    } else {
      return <SearchArticlesList {...{ location }} />
    }
  }
}
