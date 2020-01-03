import React, { Component } from 'react'
import { Upload, notification } from 'antd'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
{/* 该组件用于上传文件时，从右侧弹出提醒框，带上传进度条 */ }
@connect(mapStateToProps)
export default class UploadNotification extends Component {
    constructor(props) {
        super(props)
        this.state = {
            minify: false,
        }
        this.scroll_ref = React.createRef()
    }
    componentDidMount() {

    }
    componentWillReceiveProps() {
        this.setScrollTop()
    }
    setScrollTop = () => {
        const ele = this.scroll_ref.current
        // if (ele)
        //     ele.scrollTop = ele.scrollHeight
    }
    renderUploadDec = () => {
        const { uploading_file_list = [] } = this.props
        const upload_props = {
            fileList: uploading_file_list,
            listType: 'picture',
            showUploadList: { showPreviewIcon: false, showRemoveIcon: false, showDownloadIcon: false },
            onRemove: () => false,
            onDownload: () => false,
            onPreview: () => false
        }
        return (
            <Upload {...upload_props}>
            </Upload>
        )
    }
    renderUploadState = () => {
        const { uploading_file_list = [] } = this.props
        const is_has_uploading = uploading_file_list.length && (uploading_file_list.findIndex(item => item.status == 'uploading') != -1)
        const icon_loading = (
            <i className={globalStyles.authTheme} style={{ color: '#52C41A' }}>&#xe7fa;</i>
        )
        const icon_upload = (
            <i className={globalStyles.authTheme} style={{ color: '#1890FF' }}>&#xe77d;</i>
        )
        let message = ''
        let icon = ''
        if (is_has_uploading) {
            icon = icon_loading
            message = '正在上传...'
        } else {
            icon = icon_upload
            message = '上传完成'
        }
        const data = {
            icon,
            message
        }
        return data
    }
    close = () => {
        const { setUploadNotiVisible } = this.props
        setUploadNotiVisible()
    }
    setMinify = () => {
        const { minify } = this.state
        this.setState({
            minify: !minify
        })
    }
    renderFilePercent = () => {
        const { uploading_file_list = [] } = this.props
        const total = uploading_file_list.length
        let count = 0
        for (let val of uploading_file_list) {
            if (val.status == 'uploading') {
                count++
            }
        }
        return `(${count}/${total})`
    }
    render() {
        const { show_upload_notification } = this.props
        const { minify } = this.state
        return (
            show_upload_notification ? (
                <div className={`${globalStyles.global_card} ${styles.notice_out} ${minify ? styles.notice_out_mini : styles.notice_out_normal}`} >
                    {
                        minify ? (
                            <>
                                <div className={styles.top}>
                                    <div className={`${globalStyles.authTheme} ${styles.info_icon}`}>
                                        {this.renderUploadState().icon}
                                    </div>
                                    <div className={styles.message}>{this.renderFilePercent()}</div>
                                    <div className={`${globalStyles.authTheme} ${styles.close}`} onClick={this.setMinify}>&#xe7f3;</div>
                                </div>
                            </>
                        ) : (
                                <>
                                    <div className={styles.top}>
                                        <div className={`${globalStyles.authTheme} ${styles.info_icon}`}>
                                            {/* &#xe847; */}
                                            {this.renderUploadState().icon}
                                        </div>
                                        <div className={styles.message}> {this.renderUploadState().message}</div>
                                        <div className={`${globalStyles.authTheme} ${styles.close}`} onClick={this.setMinify}>&#xe7f7;</div>
                                    </div>
                                    <div className={`${styles.picture_list} ${globalStyles.global_vertical_scrollbar}`} ref={this.scroll_ref}>
                                        {this.renderUploadDec()}
                                    </div>
                                </>
                            )
                    }
                </div>
            ) : (
                    <i />
                )
        )
    }
}
function mapStateToProps({ uploadNormal: {
    uploading_file_list,
    swich_render_upload, //是否显示上传开关
    show_upload_notification,
}
}) {
    return {
        uploading_file_list,
        swich_render_upload, //是否显示上传开关
        show_upload_notification,
    }
}