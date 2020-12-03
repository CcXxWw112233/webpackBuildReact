import React, { Component } from 'react'
import { filterFileFormatType } from '@/utils/util'
import globalStyles from '@/globalset/css/globalClassName.less'
import { Table } from 'antd'
import styles from './CommunicationThumbnailFiles.less'

// @connect(mapStateToProps)
// @connect()

export default class ThumbnailFilesTilingShow extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    // this.initData();
  }

  render() {
    const { thumbnailFilesList = [] } = this.props
    console.log('thumbnailFilesList', thumbnailFilesList)
    return (
      <div className={styles.ThumbnailFilesTilingShow}>
        {thumbnailFilesList &&
          thumbnailFilesList.length !== 0 &&
          thumbnailFilesList.map(item => {
            return (
              <div
                className={styles.itemBox}
                key={item.id}
                title={item.file_name}
                onClick={() => this.props.previewFile(item)}
              >
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url || ''} alt="" />
                ) : (
                  <div
                    className={`${globalStyles.authTheme} ${styles.otherFile}`}
                    dangerouslySetInnerHTML={{
                      __html: filterFileFormatType(item.file_name)
                    }}
                  ></div>
                )}
              </div>
            )
          })}
      </div>
    )
  }
}

ThumbnailFilesTilingShow.defaultProps = {
  // 这是一个项目交流中缩略图组件
}
