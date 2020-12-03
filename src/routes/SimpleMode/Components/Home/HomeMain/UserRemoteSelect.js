import React, { Component } from 'react'
import { Select, Spin } from 'antd'
import debounce from 'lodash/debounce'
import axios from 'axios'
import { setUploadHeaderBaseInfo } from '../../../../../utils/businessFunction'
import Cookies from 'js-cookie'
import { connect } from 'dva'
import { isObjectValueEqual } from '../../../../../utils/util'
// import { getPinyin } from '../../../../../utils/pinyin';

const { Option } = Select

@connect(mapStateToProps)
export default class UserRemoteSelect extends React.Component {
  constructor(props) {
    super(props)
    this.lastFetchId = 0
    this.fetchUser = debounce(this.fetchUser, 800)
  }

  state = {
    data: [],
    fetching: false
  }

  componentWillReceiveProps(nextProps) {
    if (
      !isObjectValueEqual(
        nextProps.simplemodeCurrentProject,
        this.props.simplemodeCurrentProject
      )
    ) {
      this.props.updateState && this.props.updateState({ value: [] })
      return
    }
  }

  fetchUser = (value = '') => {
    // console.log('fetching user', value);
    const { simplemodeCurrentProject = {} } = this.props
    const { board_id, org_id } = simplemodeCurrentProject
    let params_orgId = org_id
      ? org_id
      : localStorage.getItem('OrganizationId') || '0'
    let params_boardId = board_id || '0'
    this.lastFetchId += 1
    const fetchId = this.lastFetchId
    this.setState({ data: [], fetching: true })
    axios({
      url: `/api/projects/milestone/fuzzy`,
      method: 'get',
      headers: {
        Authorization: Cookies.get('Authorization'),
        refreshToken: Cookies.get('refreshToken'),

        ...setUploadHeaderBaseInfo({})
      },
      params: {
        _organization_id: params_orgId,
        board_ids: params_boardId,
        query_name: value.trimLR()
      },
      timeout: 0
    }).then(res => {
      // console.log(res.data);
      if (fetchId !== this.lastFetchId) {
        // for fetch callback order
        return
      }
      const data = res.data.data.map(user => ({
        text: `${user}`,
        value: user
      }))
      this.setState({ data, fetching: false })
    })
    // fetch('/api/projects/milestone/fuzzy', {
    //   headers: {
    //     Authorization: Cookies.get('Authorization'),
    //     refreshToken: Cookies.get('refreshToken'),

    //     ...setUploadHeaderBaseInfo({}),
    //   },
    //   method: 'GET',
    //   params: {
    //     _organization_id: params_orgId,
    //     board_ids: params_boardId,
    //     query_name: value
    //   }
    // })
    //   .then(response => response.json())
    //   .then(body => {
    //     console.log(body);
    //     if (fetchId !== this.lastFetchId) {
    //       // for fetch callback order
    //       return;
    //     }
    //     const data = body.data.map(user => ({
    //       text: `${user}`,
    //       value: user,
    //     }));
    //     this.setState({ data, fetching: false });
    //   });
  }

  handleChange = value => {
    this.setState({
      // value,
      data: [],
      fetching: false
    })
    this.props.updateState && this.props.updateState({ value: value })
    this.props.handleVagueMatching && this.props.handleVagueMatching(value)
  }

  render() {
    const { fetching, data } = this.state
    const { value } = this.props
    return (
      <div>
        <Select
          mode="multiple"
          // labelInValue
          value={value}
          placeholder="里程碑"
          notFoundContent={fetching ? <Spin size="small" /> : null}
          filterOption={false}
          onSearch={this.fetchUser}
          onChange={this.handleChange}
          onFocus={this.fetchUser}
          style={{ width: 'calc(100% - 16px)', minHeight: '32px' }}
          getPopupContainer={triggerNode => triggerNode.parentNode}
        >
          {!!(data && data.length) &&
            data.map(d => (
              <Option title={d.value} key={d.value}>
                {d.text}
              </Option>
            ))}
        </Select>
      </div>
    )
  }
}

function mapStateToProps({ simplemode: { simplemodeCurrentProject = {} } }) {
  return {
    simplemodeCurrentProject
  }
}

UserRemoteSelect.defaultProps = {
  value: '', // 当前搜索的value值
  updateState: function() {}, // 更新外部state
  handleVagueMatching: function() {} // 设置模糊匹配
}
