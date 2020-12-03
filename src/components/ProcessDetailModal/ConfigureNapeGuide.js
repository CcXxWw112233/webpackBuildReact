import React, { Component } from 'react'
import indexStyles from './index.less'
import { Button } from 'antd'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'

@connect(({ publicProcessDetailModal: { not_show_create_form_guide } }) => ({
  not_show_create_form_guide
}))
export default class ConfigureNapeGuide extends Component {
  quit = () => {
    this.props.dispatch({
      type: 'publicProcessDetailModal/configurePorcessGuide',
      payload: {
        flow_template_form: '1'
      }
    })
  }

  render() {
    const { not_show_create_form_guide } = this.props
    return (
      <div>
        {not_show_create_form_guide == '1' ? (
          <div></div>
        ) : (
          <div
            onClick={e => e && e.stopPropagation()}
            className={`${indexStyles.configure_guide} ${indexStyles.guide_position_2}`}
          >
            <div className={indexStyles.top}>
              <span
                className={`${globalStyles.authTheme} ${indexStyles.smile}`}
              >
                &#xe847;
              </span>
              <span className={indexStyles.title}>
                点击此处可以配置表项的要求
              </span>
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
