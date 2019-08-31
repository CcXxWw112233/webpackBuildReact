import React from 'react'
import indexStyles from './index.less'
import { Table, Button } from 'antd';
import FileList from './FileList'
import MoveToDirectory from './MoveToDirectory'
import BreadCrumbFileNav from './BreadCrumbFileNav'
import FileDetail from './FileDetail'
import FileDetailModal from './FileDetail/FileDetailModal'

export default class FileIndex extends React.Component {
  render() {
    const { datas: { isInOpenFile } = false } = this.props.model;
    const { marginTop = '20px' } = this.props;
    return (
      <div>
        {/*{isInOpenFile && <FileDetail {...this.props} />}*/}
        <div className={indexStyles.fileOut} style={{ marginTop: marginTop }}>
          <BreadCrumbFileNav {...this.props} />
          <FileList {...this.props} />
          <MoveToDirectory {...this.props} />
        </div>
        <FileDetailModal {...this.props} visible={isInOpenFile} />
      </div>
    )
  }
}
