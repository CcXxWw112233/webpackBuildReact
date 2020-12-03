import React, { Component } from 'react'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'

import { Breadcrumb } from 'antd'
const BreadcrumbItem = Breadcrumb.Item

export default class FolderBread extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  renderSeparator = () => {
    return (
      <span
        className={`${globalStyles.authTheme}`}
        style={{ color: '#8c8c8c', fontSize: 10 }}
      >
        &#xe61f;
      </span>
    )
  }
  chooseBreadItem = item => {
    this.props.setBreadPaths && this.props.setBreadPaths({ path_item: item })
  }
  render() {
    const { bread_paths = [] } = this.props
    return (
      <div>
        <Breadcrumb separator={this.renderSeparator()}>
          {bread_paths.map((item, index) => {
            const { name, id, type } = item
            return (
              <BreadcrumbItem
                key={id}
                onClick={() => this.chooseBreadItem(item)}
              >
                <span className={styles.foder_name_bread}>{name}</span>
              </BreadcrumbItem>
            )
          })}
        </Breadcrumb>
      </div>
    )
  }
}
