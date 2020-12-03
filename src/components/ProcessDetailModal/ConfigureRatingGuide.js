import React, { Component } from 'react'
import indexStyles from './index.less'
import { Button } from 'antd'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'

@connect(({ publicProcessDetailModal: { not_show_create_rating_guide } }) => ({
  not_show_create_rating_guide
}))
export default class ConfigureRatingGuide extends Component {
  constructor(props) {
    super(props)
    this.state = {
      local_not_show_create_rating_guide: props.not_show_create_rating_guide
    }
  }

  componentWillReceiveProps(nextProps) {
    const { not_show_create_rating_guide } = nextProps
    const {
      not_show_create_rating_guide: old_not_show_create_rating_guide
    } = this.props
    if (not_show_create_rating_guide != old_not_show_create_rating_guide) {
      this.setState({
        local_not_show_create_rating_guide: not_show_create_rating_guide
      })
    }
  }

  quit = () => {
    this.props.dispatch({
      type: 'publicProcessDetailModal/configurePorcessGuide',
      payload: {
        flow_template_score: '1'
      }
    })
  }

  render() {
    // const { not_show_create_rating_guide } = this.props
    const { local_not_show_create_rating_guide } = this.state
    return (
      <div>
        {local_not_show_create_rating_guide == '1' ? (
          <div></div>
        ) : (
          <div
            onClick={e => e && e.stopPropagation()}
            className={`${indexStyles.configure_guide} ${indexStyles.guide_position_2} ${indexStyles.guide_position_3}`}
          >
            <div className={indexStyles.top}>
              <span
                className={`${globalStyles.authTheme} ${indexStyles.smile}`}
              >
                &#xe847;
              </span>
              <span className={indexStyles.title}>点击此处可以配置评分</span>
            </div>
            <div className={indexStyles.bottom}>
              <div className={indexStyles.bottom_right}>
                <Button type={'primary'} size={'small'} onClick={this.quit}>
                  我知道了
                </Button>
              </div>
            </div>
            <div className={indexStyles.triangle}></div>
          </div>
        )}
      </div>
    )
  }
}
