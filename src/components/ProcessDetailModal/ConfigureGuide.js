import React, { Component } from 'react'
import indexStyles from './index.less'
import { Button } from 'antd'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'

@connect(({ publicProcessDetailModal: { not_show_create_node_guide } }) => ({
  not_show_create_node_guide
}))
export default class ConfigureGuide extends Component {
  quit = () => {
    this.props.dispatch({
      type: 'publicProcessDetailModal/configurePorcessGuide',
      payload: {
        flow_template_node: '1'
      }
    })
  }

  render() {
    const { not_show_create_node_guide } = this.props
    return (
      <div>
        {not_show_create_node_guide == '1' ? (
          <div></div>
        ) : (
          <div
            onClick={e => e && e.stopPropagation()}
            className={`${indexStyles.configure_guide} ${indexStyles.guide_position_1}`}
          >
            <div className={indexStyles.top}>
              <span
                className={`${globalStyles.authTheme} ${indexStyles.smile}`}
              >
                &#xe847;
              </span>
              <span className={indexStyles.title}>
                点击此处可以新建流程步骤～
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
