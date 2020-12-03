import React, { Component } from 'react'
import { connect } from 'dva'
import CommonArticlesList from '../../common/CommonArticlesList'
import SearchArticlesList from '../../common/SearchArticlesList'

@connect(({ xczNews = [] }) => ({
  xczNews
}))
export default class Authority extends Component {
  render() {
    const { xczNews, location } = this.props
    const { articlesList = [], inputValue, authorityFlag } = xczNews

    if (authorityFlag) {
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
