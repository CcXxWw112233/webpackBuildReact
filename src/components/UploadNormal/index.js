import React, { Component } from 'react'
import UploadNotification from '../UploadNotification'
import { Upload, message } from 'antd'
import { REQUEST_DOMAIN_FILE, UPLOAD_FILE_SIZE } from '../../globalset/js/constant'
import Cookies from 'js-cookie'
import { setUploadHeaderBaseInfo } from '../../utils/businessFunction'
import axios from 'axios'
// import BMF from 'browser-md5-file';
import { checkFileMD5WithBack, uploadToOssCalback } from '../../services/technological/file'
import oss from 'ali-oss';
import SparkMD5 from 'spark-md5'
import { connect } from 'dva'
const max_size = 2 * 1024 * 1024 * 1024 //2GB
@connect(mapStateToProps)
export default class UploadNormal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            uploading_file_list: [],
            swich_render_upload: true, //是否显示上传开关
        }
    }
    updateDatasUpload = (data = {}) => {
        const { dispatch } = this.props
        dispatch({
            type: 'uploadNormal/updateDatas',
            payload: {
                ...data
            }
        })
    }
    // 设置右边弹窗出现
    setUploadNotiVisible = () => {
        this.updateDatasUpload({
            swich_render_upload: false
        })
        setTimeout(() => {
            this.updateDatasUpload({
                swich_render_upload: true
            })
        }, 1000)
        this.setShowUploadNotification(false)
        this.setUploadingFileList([])
    }
    setShowUploadNotification = (bool) => {
        this.updateDatasUpload({
            show_upload_notification: bool
        })
    }
    setUploadingFileList = (list = []) => {
        if (!list.length) {
            this.updateDatasUpload({
                uploading_file_list: []
            })
            return
        }
        const { uploading_file_list = [] } = this.props
        let list_ = [...list]
        let uploading_file_list_ = [...uploading_file_list]
        const uid_arr = uploading_file_list_.map(item => item.uid) //已存在的上传列表
        const new_list = list_.filter(item => uid_arr.indexOf(item.uid) == -1)  //新上传的文件
        const old_list = list_.filter(item => uid_arr.indexOf(item.uid) != -1)  //已经上传的（进行中或已完成）
        let gold_arr = [].concat(uploading_file_list_, new_list)
        gold_arr = gold_arr.map(item => { //目标覆盖
            let new_item = { ...item }
            new_item = old_list.find(val => val.uid == new_item.uid) || new_item
            return new_item
        })
        // console.log('ssssss', gold_arr)
        this.updateDatasUpload({
            uploading_file_list: gold_arr
        })
    }
    uploadCompleted = () => {
        const { is_need_parent_notification, setShowUploadNotification, setUploadingFileList } = this.props

        this.updateDatasUpload({
            swich_render_upload: false
        })
        setTimeout(() => {
            this.updateDatasUpload({
                swich_render_upload: true
            })
        }, 1000)

        if (is_need_parent_notification) {
            setShowUploadNotification(false)
            setUploadingFileList([])
        } else {
            // this.setShowUploadNotification(false)
            this.setUploadNotiVisible()
        }
    }
    normalUploadProps = () => {
        const that = this
        const { uploading_file_list } = this.state
        const { uploadProps = {}, uploadCompleteCalback, setShowUploadNotification, is_need_parent_notification, setUploadingFileList } = this.props
        const { data: { board_id } } = uploadProps
        const propsObj = {
            name: 'file',
            withCredentials: true,
            multiple: true,
            // fileList: uploading_file_list,
            showUploadList: false,
            headers: {
                Authorization: Cookies.get('Authorization'),
                refreshToken: Cookies.get('refreshToken'),
                ...setUploadHeaderBaseInfo({ boardId: board_id }),
            },
            ...uploadProps,
            transformFile: this.transformFile,
            beforeUpload: (e) => {
                if (e.size == 0) {
                    message.error(`不能上传空文件`)
                    return false
                } else if (e.size > max_size) {
                    message.error(`上传文件不能文件超过2GB`)
                    return false
                }
                if (is_need_parent_notification) {
                    setShowUploadNotification(true)
                } else {
                    that.setShowUploadNotification(true)
                }
            },
            onChange: ({ file, fileList }) => {
                if (file.size > max_size) {
                    return false
                }
                let fileList_will = [...fileList]
                fileList_will = fileList_will.filter(item => {
                    if (item.status == 'done') {
                        if (item.response && item.response.code == '0') {

                        } else {
                            item.status = 'error'
                        }
                    }
                    if (item.size <= max_size) {
                        return item
                    }
                })
                if (is_need_parent_notification) { //由父组件渲染进度弹窗
                    setUploadingFileList(fileList_will)
                } else {
                    that.setUploadingFileList(fileList_will)
                }
                // console.log('sssss_fileList', fileList)
                const is_has_uploading = fileList_will.length && (fileList_will.findIndex(item => item.status == 'uploading') != -1)
                if (!is_has_uploading) { //没有上传状态了
                    setTimeout(function () {
                        if (typeof uploadCompleteCalback == 'function') {
                            uploadCompleteCalback()
                        }
                        that.uploadCompleted()
                    }, 1500)
                }
                // console.log('sssss', file)
                // 错误处理
                if (file.status === 'done') {
                    if (file.response && file.response.code == '0') {
                    } else {
                        message.error(file.response && file.response.message || '上传出现了点问题');
                    }
                }
            },
            onRemove: () => false,
            showRemoveIcon: false, 
            customRequest: this.customRequest
        };
        return propsObj
    }

    // 自定义上传
    customRequest = async (e) => {
        const that = this
        let {
            action,
            data,
            file,
            filename,
            headers,
            onError,
            onProgress,
            onSuccess,
            withCredentials,
        } = e
        const formData = new FormData();
        formData.append(filename, file);
        if (file.size > max_size) {
            return false
        }
        /*
        1.是大文件
        2.解码生成md5
        3.生成的md5与后端校验，如果存在相同md5格式的文件，仅需关联。否则上传到阿里云oss
        */
        if (file.size >= 100 * 1024 * 1024) {
            const md5_str = await this.handleBMF(file) //解码md5文件
            const { data: { is_live, access = {} } } = await this.checkFileMD5({ md5_str, file_name: file.name }) //检查后台是否存在相同md5的文件
            if (is_live) { //如果后端已经存在了该文件，只需调用接口将文件关联
                const relation_res = await this.checkRelationFile({ md5_str, file_name: file.name, is_live, file_size: file.size })
                if (relation_res) {
                    onProgress({ percent: 100 }, file);
                    setTimeout(() => {
                        onSuccess(relation_res, file);
                    }, 500)
                }
            } else {
                // 对象上传
                const progressCalback = ({ percent }) => {
                    onProgress({ percent }, file);
                }
                const successCalback = ({ res }) => {
                    setTimeout(() => {
                        onSuccess(res, file);
                    }, 500)
                }
                const params = { access, file, hash: md5_str, file_name: file.name }
                this.UploadToOss(params, { progressCalback, successCalback }).then(res => {
                    that.checkRelationFile({ md5_str, file_name: file.name, is_live, file_size: file.size }).then(res => {
                        successCalback({ res })
                    })
                }).catch(err => {
                    console.log('sssss_oss_fail', err)
                })
            }

            return
        }

        // 小文件上传
        if (data) {
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });
        }

        // 进行文件上传
        axios
            .post(action, formData, {
                withCredentials,
                headers,
                timeout: 0,
                onUploadProgress: ({ total, loaded }) => {
                    onProgress({ percent: Math.round(loaded / total * 100).toFixed(2) }, file);
                },
            })
            .then(({ data: response }) => {
                onSuccess(response, file);
            })
            .catch(onError);

        return {
            abort() {
            },
        };
    }
    // 检查文件md5是否保存在后台
    checkFileMD5 = ({ md5_str, file_name }) => {
        const { uploadProps = {}, source_type = '1' } = this.props
        const { data: { board_id, folder_id, upload_type, file_version_id } } = uploadProps
        const params = {
            // board_id,
            // folder_id,
            file_hash: md5_str,
            file_name,
            // upload_type, // 1 / 2新文件上传 / 版本更新
        }
        if (upload_type == '2') {
            params.file_version_id = file_version_id
        }
        const p = new Promise(async (resolve, reject) => {
            checkFileMD5WithBack(params).then(res => {
                if (res.code == '0') {
                    resolve(res)
                } else {
                    resolve({ data: {} })
                }
            }).catch(err => {
                resolve({ data: {} })
            })
        })
        return p
    }
    // 处理md5
    handleBMF = (file) => {
        // const bmf = new BMF()
        // const p = new Promise((resolve, reject) => {
        //     bmf.md5(
        //         file,
        //         (err, md5) => {
        //             if (err) {
        //                 reject(err)
        //             } else {
        //                 console.log('ssss_bmf', md5)
        //                 resolve(md5)
        //             }
        //         },
        //         progress => {
        //             // console.log('progress number:', progress);
        //         },
        //     );
        // })
        // return p
        const fileReader = new FileReader();
        const dataFile = file
        const _this = this
        const spark = new SparkMD5(); //创建md5对象（基于SparkMD5）
        return new Promise((resolve) => {
            fileReader.readAsBinaryString(dataFile);
            //文件读取完毕之后的处理
            fileReader.onload = function (e) {
                spark.appendBinary(e.target.result);
                const md5 = spark.end()
                resolve(md5)
            };
        })
    }
    // 关联文件到后端
    checkRelationFile = ({ md5_str, file_name, is_live, file_size }) => {
        const { uploadProps = {}, source_type = '1' } = this.props
        const { data: { board_id, folder_id, upload_type, file_version_id } } = uploadProps
        const params = {
            board_id,
            folder_id,
            file_hash: md5_str,
            file_name,
            upload_type, // 1 / 2新文件上传 / 版本更新
            source_type,
            file_size
        }
        if (upload_type == '2') {
            params.file_version_id = file_version_id
        }
        if (!is_live) {
            params.file_key = this.uploadPath({ hash: md5_str, file_name })
        }
        const p = new Promise((resolve, reject) => {
            uploadToOssCalback(params).then(res => {
                resolve(res)
            }).catch(err => {
                resolve('error')
            })
        })
        return p
    }

    // 新建阿里云oss客户端 --设置参数
    ossClient = (access = {}) => {
        const { access_key_id, access_key_secret, bucket, security_token, region, endpoint } = access
        // ali-oss v6.x版本的写法
        const params = {
            accessKeyId: access_key_id,
            accessKeySecret: access_key_secret,
            region: region,//'cn-beijing', //
            bucket,
            stsToken: security_token,
            endpoint: `${endpoint}`,
            secure: true
        }
        return new oss(params);
    }
    uploadPath = ({ hash, file_name }) => {
        // 上传文件的路径，使用日期命名文件目录
        const subfix = file_name.substr(file_name.lastIndexOf('.'))
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${year}-${month}-${day}/${hash}${subfix}`
    }
    UploadToOss = ({ access, file, hash, file_name }, { progressCalback, successCalback }) => {
        const url = this.uploadPath({ hash, file_name })
        return new Promise((resolve, reject) => {
            this.ossClient(access).multipartUpload(url, file, {
                progress: function (percent) {
                    progressCalback({ percent: percent * 100 })
                }
            }).then(res => {
                resolve(res);
            }).catch(error => {
                reject(error)
            })
        })
    }
    // 新建阿里云oss客户端 ---end

    render() {
        const { children, is_need_parent_notification, swich_render_upload } = this.props
        const { show_upload_notification, uploading_file_list = [], } = this.state
        // console.log('ssssss_swich_render_upload', swich_render_upload)
        return (
            <>
                {
                    swich_render_upload ?
                        (<Upload {...this.normalUploadProps()}>
                            {children}
                        </Upload>) : (
                            children
                        )
                }
                {/* {
                    !is_need_parent_notification && show_upload_notification && (
                        <UploadNotification uploading_file_list={uploading_file_list} setUploadNotiVisible={this.setUploadNotiVisible} />
                    )
                } */}
            </>
        )
    }
}

// 该组件为支持上传大文件的组件
UploadNormal.defaultProps = {
    uploadProps: { //上传文件的基本数据, 必传
        action: '',
        data: {
            board_id: '',
            folder_id: '',
            upload_type: '1', //1/2  新文件上传，版本更新  
            file_version_id: '', //upload_type == 2必传
            type: '1'
        }
    },
    source_type: '1', // 1/2/3 网盘文件/流程文件/任务附件
    is_need_parent_notification: false, //进度条弹窗是否在父组件内引用
    setUploadingFileList: function () { //设置上传文件的列表(is_need_parent_notification == true时传入)

    },
    setUploadNotiVisible: function () { //关闭弹窗（is_need_parent_notification == true时传入)

    },
    uploadCompleteCalback: function () { //上传完成的回调，（比如查询列表）

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