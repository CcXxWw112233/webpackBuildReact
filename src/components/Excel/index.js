import React, { Component } from 'react'
import {
  Modal,
  Table,
  Button,
  Select,
  Form,
  Row,
  Col,
  Input,
  message
} from 'antd'
import XLSX from 'xlsx'
import {
  checkNameReg,
  checkNumberReg,
  checkTimerReg,
  checkTypeReg,
  compareStartDueTime
} from './getConst'
import styles from './index.less'
import { importExcelWithBoardData } from '../../services/technological'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { connect } from 'dva'
import { timeToTimestamp } from '../../utils/util'
import { split } from 'lodash'
const EditableContext = React.createContext()

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
)

const EditableFormRow = Form.create()(EditableRow)

class EditableCell extends React.Component {
  state = {
    editing: false
  }

  toggleEdit = () => {
    const editing = !this.state.editing
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus()
      }
    })
  }

  save = e => {
    const { record, handleSave } = this.props
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        console.log(error, values)
        this.setState({ editing: false })
        return
      }
      this.toggleEdit()
      handleSave({ ...record, ...values }, values)
    })
  }

  renderCell = form => {
    this.form = form
    const { children, dataIndex, record, title } = this.props
    const { editing } = this.state
    const { is_error, is_error_key = {} } = record
    let rulesText = ''
    switch (title) {
      case 'name':
        rulesText = '名称不能为空,名称不能超过100个字'
        break
      case 'number':
        rulesText = '序号格式错误'
        break

      default:
        rulesText = '该字段内容不能为空'
        break
    }
    return editing ? (
      // && is_error && is_error_key.hasOwnProperty(dataIndex)
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required:
                title == 'number' || title == 'type' || title == 'name'
                  ? true
                  : false,
              message: `${rulesText}`
            }
          ],
          initialValue: record[dataIndex]
        })(
          <Input
            ref={node => (this.input = node)}
            onPressEnter={this.save}
            onBlur={this.save}
          />
        )}
      </Form.Item>
    ) : (
      <div
        className={
          // is_error &&
          // is_error_key.hasOwnProperty(dataIndex) &&
          styles['editable-cell-value-wrap']
        }
        style={{ paddingRight: 24 }}
        onClick={
          // is_error && is_error_key.hasOwnProperty(dataIndex) &&
          this.toggleEdit
        }
      >
        {children}
      </div>
    )
  }

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      className,
      ...restProps
    } = this.props
    let flag =
      record &&
      Object.keys(record.is_error_key).indexOf(dataIndex) != -1 &&
      record.is_error
    return (
      <td
        {...restProps}
        className={`${className} ${flag && styles.error_text}`}
        title={flag && record.is_error_text[dataIndex]}
      >
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    )
  }
}
@connect()
export default class ExcelRead extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      columns: [],
      data: [],
      tableDefaultKeys: [
        { value: 'none', label: '不绑定' },
        { value: 'number', label: '序号' },
        { value: 'type', label: '类型' },
        { value: 'name', label: '名称' },
        { value: 'start_time', label: '开始时间' },
        { value: 'due_time', label: '截止时间' },
        { value: 'description', label: '备注' }
      ],
      selectedRows: [],
      selectedKey: {},
      hasSelected: false,
      select_time_format: {} // 选择的时间格式 { D:'YYYY-MM-DD' }
    }
    this.workBook = null
    this.align_type = {
      0: ['里程碑', '任务'],
      1: ['子里程碑', '任务', '子任务'],
      2: ['任务', '子任务'],
      3: ['子任务']
    }
    this.typeValid = {
      任务: {
        1: ['里程碑'],
        2: ['子里程碑'],
        name: 'card'
      },
      里程碑: {
        name: 'milestone'
      },
      子里程碑: {
        1: ['里程碑'],
        name: 'milestone'
      },
      子任务: {
        1: ['任务'],
        2: ['任务'],
        3: ['任务'],
        name: 'card'
      }
    }
  }

  addFile = () => {
    let input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls'
    input.onchange = this.readFile
    input.click()
    input = null
  }

  readFile = val => {
    let { target } = val
    let file = target.files[0]
    if (file) {
      // 创建FileReader对象，将文件内容读入内存，通过一些api接口，可以在主线程中访问本地文件
      let read = new FileReader()
      // onload事件，当读取操作成功完成时调用
      read.onload = e => {
        let result = e.target.result
        // 返回数组中元素的字节数
        var data = new Uint8Array(result)
        this.workBook = XLSX.read(data, {
          type: 'array',
          dateNF: 'yyyy/mm/dd',
          cellDates: true
        })
        // 转出来的数据
        const sheet2JSONOpts = {
          /** Default value for null/undefined values */
          defval: '', //给defval赋值为空的字符串
          header: 'A',
          raw: false
        }
        //1、XLSX.utils.json_to_sheet(data) 接收一个对象数组并返回一个基于对象关键字自动生成的“标题”的工作表，默认的列顺序由使用Object.keys的字段的第一次出现确定
        //2、将数据放入对象workBook的Sheets中等待输出
        let json = XLSX.utils.sheet_to_json(
          this.workBook.Sheets[this.workBook.SheetNames[0]],
          sheet2JSONOpts
        )
        this.transformJson(json)
      }
      // 方法用于启动读取指定的 Blob 或 File 内容。当读取操作完成时，readyState 变成 DONE（已完成），并触发 loadend 事件
      read.readAsArrayBuffer(file)
    }
  }

  // 转换表格需要用的数据
  transformJson = data => {
    if (data && data.length) {
      data = data.map((item, index) => {
        item.id = index + 1
        item.uuid = this.createUid()
        item.number = index + 1
        item.type = '任务'
        return item
      })
      let otherkey = this.state.tableDefaultKeys.map(item => item.value)
      // 1. 获取表格列
      let keys = Object.keys(data[0])

      let k = []
      // '__EMPTY'
      let notShow = ['id', 'uuid', ...otherkey]
      keys.forEach(item => {
        if (!notShow.includes(item)) {
          k.push(item)
        }
      })
      k.unshift('type')
      k.unshift('number')
      let arr = k.map((item, index) => {
        let obj = {}
        if (item == 'type' || item == 'number') {
          obj = {
            dataIndex: item,
            title: null,
            // title: item,
            key: index,
            width: 80
          }
        } else {
          obj = {
            dataIndex: item,
            title: this.tableHeader.bind(this, item),
            // title: item,
            key: index,
            width: 120
          }
        }

        return obj
      })
      data = data.map((item, index) => {
        item.is_error_key = {}
        item.is_error_text = {}
        return item
      })
      this.setState({
        columns: arr,
        data: data,
        visible: true
      })
    }
  }

  createUid = () => {
    return Math.floor(Math.random() * 10000000 + 1)
  }
  // 触发第一次验证
  dispatchTextHandle = (text, type, columns) => {
    let flag = false
    switch (type) {
      case 'number':
        this.handleChangeOrderField('', text)
        let a,
          isCheckTime = false,
          timeKey,
          select_name
        Object.keys(columns).forEach(item => {
          if (columns[item] === 'type') {
            flag = true
            a = item
          }
          if (columns[item] === 'start_time' || columns[item] === 'due_time') {
            isCheckTime = true
            timeKey = item
            select_name = columns[item]
          }
        })

        if (flag) this.handleChangeTypes(a)
        if (isCheckTime)
          setTimeout(() => {
            this.handleChangeTimer({
              format: this.state.select_time_format[timeKey],
              select_name,
              text: timeKey
            })
          }, 1)
        break
      case 'start_time':
        this.handleChangeTimer({
          format: 'YYYY/MM/DD',
          select_name: 'start_time',
          text
        })
        break
      case 'due_time':
        this.handleChangeTimer({
          format: 'YYYY/MM/DD',
          select_name: 'due_time',
          text
        })
        break
      default:
    }
  }

  handleCheckValidKeys = (keys, columns, text) => {
    let arr = [],
      key
    Object.keys(columns).forEach(item => {
      if (keys.includes(columns[item])) {
        arr.push(columns[item])
        key = item
      }
    })
    if (arr.length === 1) {
      let item = arr[0]
      if (item === 'number') {
        this.handleChangeOrderField('', key)
      }
      if (item === 'type') {
        this.handleChangeTypes(key)
      }
      if (item == 'start_time') {
        this.handleChangeTimer({
          format: this.state.select_time_format[key] || 'YYYY/MM/DD',
          select_name: 'start_time',
          text: key
        })
      }
      if (item == 'due_time') {
        this.handleChangeTimer({
          format: this.state.select_time_format[key] || 'YYYY/MM/DD',
          select_name: 'due_time',
          text: key
        })
      }
    }
  }

  /**
   * 设置选择后的数组
   * @param {String} text A B C D....
   * @param {String} e number type name...
   */
  selectText = (text, e) => {
    let obj = { ...this.state.selectedKey }
    let data = Array.from(this.state.data)
    let columns = Array.from(this.state.columns)
    if (e && e !== 'none') {
      obj[text] = e
    } else {
      delete obj[text]
    }
    this.setState(
      {
        selectedKey: obj
      },
      () => {
        this.toFilterDefaultKey()
        const arr = Object.values(obj)
        this.dispatchTextHandle(text, e, obj)
        if (arr.includes('number') || arr.includes('type')) {
          columns = columns.map(item => {
            if (item.dataIndex == 'number' || item.dataIndex == 'type') {
              let new_item = { ...item }
              new_item = {
                ...item,
                className: styles['order_display']
              }
              return new_item
            } else if (item.dataIndex == text) {
              let new_item = { ...item }
              new_item = {
                ...item,
                editable: e == 'none' ? false : true
              }
              return new_item
            } else {
              return item
            }
          })
        } else {
          columns = columns.map(item => {
            if (item.dataIndex == 'number' || item.dataIndex == 'type') {
              let new_item = { ...item }
              new_item = {
                ...item,
                className: ''
              }
              return new_item
            } else if (item.dataIndex == text) {
              let new_item = { ...item }
              new_item = {
                ...item,
                editable: e == 'none' ? false : true
              }
              return new_item
            } else {
              return item
            }
          })
        }
        this.setState({
          columns
        })
        switch (e) {
          case 'none':
            this.handleClearTableData(text)
            this.handleCheckValidKeys(
              ['number', 'type', 'start_time', 'due_time'],
              obj,
              text
            )
            break
          case 'name':
            this.handleChangName(text)
            break
          case 'description':
            break
          case 'type':
            this.handleChangeTypes(text)
            break

          default:
            break
        }
      }
    )
  }

  // 将字段绑定为none 需清除默认状态
  handleClearTableData = text => {
    let { data = [] } = this.state
    data = data.map(item => {
      let new_item = { ...item }
      let property = [
        'numberkey',
        'start_timekey',
        'due_timekey',
        'typekey',
        'namekey'
      ]
      property.forEach(k => {
        if (item[k] === text) {
          delete item[k]
        }
      })
      if (!!Object.keys(item.is_error_key).length) {
        delete new_item.is_error_key[text]
        delete new_item.is_error_text[text]
      }
      if (Object.keys(new_item.is_error_key).length) {
        new_item.is_error = true
      } else new_item.is_error = false
      return new_item
    })
    this.setState({
      data
    })
  }

  // 名称字段判断
  handleChangName = text => {
    let { data = [] } = this.state
    data = data.map(item => {
      let checkVal = item[text]
      let new_item = { ...item }
      new_item.namekey = text
      if (checkNameReg(checkVal)) {
        delete item.is_error_key[text]
        delete item.is_error_text[text]
      } else {
        new_item.is_error_key[text] = 'name'
        new_item.is_error_text[text] = '名称不能为空,名称不能超过100个字'
      }
      if (Object.keys(new_item.is_error_key || {}).length) {
        new_item.is_error = true
      } else new_item.is_error = false
      return new_item
    })
    this.setState({
      data
    })
  }

  // 校验序号与类型的组合
  validNumberOfTypes = (data, column, splitKey) => {
    let arr = []
    data.forEach((item, index) => {
      let value = item[column]
      if (index === 0) {
        // 第一条数据，必须是里程碑或者任务
        if (!this.align_type[0].includes(value)) {
          item.is_error_key[column] = 'type'
          item.is_error_text[column] = '类型格式错误'
        }
      } else {
        let prev = data[index - 1]
        let prevValue = prev[column]
        let parentKey = item.parentKey || []
        if (item.is_error_key[column] !== 'type' && parentKey.length) {
          // 如果本来就报错了，说明一直是有问题的，就不处理了
          // 检查上一级是否匹配
          // console.log(value, this.typeValid[value], prevValue)
          if (!parentKey.includes(value)) {
            item.is_error_key[column] = 'type'
            item.is_error_text[column] = '类型格式错误'
          } else {
            delete item.is_error_key[column]
            delete item.is_error_text[column]
            let volid = this.typeValid[value]
            let n = item[item.numberkey]
            if (n) {
              n = n.split(splitKey)
              // 有多少个小数点
              let l = n.length - 1
              // 拿到上一级的序号，比如 1.1.1.1 拿到1.1.1
              let parent = n
              parent.length = parent.length - 1
              // 拿到上一级序号的数据
              let obj = data.find(col => {
                return col[col.numberkey] === parent.join(splitKey)
              })
              if (obj) {
                if (volid[l] && volid[l].includes(obj[column])) {
                  delete item.is_error_key[column]
                  delete item.is_error_text[column]
                } else {
                  item.is_error_key[column] = 'type'
                  item.is_error_text[column] = '类型格式错误'
                }
              }
            }
          }
        }
      }
      if (Object.keys(item.is_error_key || {}).length) {
        item.is_error = true
      } else item.is_error = false
      arr.push(item)
    })
    return arr
  }

  // 类型格式校验
  handleChangeTypes = text => {
    let { data = [], selectedKey = {} } = this.state
    let arr = [],
      numberkey = ''
    Object.keys(selectedKey).forEach(item => {
      if (selectedKey[item] === 'number') {
        arr.push(selectedKey[item])
        numberkey = item
      }
    })
    data = data.map(item => {
      let checkVal = item[text]
      let new_item = { ...item }
      new_item.typekey = text
      if (
        checkTypeReg({
          val: checkVal,
          checkNumer: !!numberkey,
          item,
          gold_type: text,
          dictionary: 'number',
          selectedKey
        })
      ) {
        delete new_item.is_error_key[text]
        delete new_item.is_error_text[text]
      } else {
        new_item.is_error_key[text] = 'type'
        new_item.is_error_text[text] = '类型不能为空或者类型格式错误'
      }
      if (Object.keys(new_item.is_error_key || {}).length) {
        new_item.is_error = true
      } else new_item.is_error = false
      return new_item
    })
    // 如果存在序号字段则进行二次过滤
    if (numberkey) {
      data = this.validNumberOfTypes(data, text, '.')
    }
    this.setState({
      data
    })
  }

  toFilterDefaultKey = () => {
    let arr = Array.from(this.state.tableDefaultKeys)
    let vals = Object.values(this.state.selectedKey)
    arr = arr.map(item => {
      if (vals.includes(item.value)) {
        item.selected = true
      } else {
        item.selected = false
      }
      return item
    })
    this.setState({
      tableDefaultKeys: arr
    })
  }

  // 检查上一个数据和当前数据是否层级合理
  checkPrevWithNow = (prev, val, splitKey) => {
    if (!prev || !val) return false
    let prevSplitArr = prev.split(splitKey)
    let splitArr = val.split(splitKey)
    let len = prevSplitArr.length
    let length = splitArr.length
    let keys = {
      2: [1, 2, 3, 4],
      3: [2, 3, 4],
      4: [3, 4]
    }
    switch (length) {
      case 2:
        // 如果上一个数据满足定义的规则
        if (keys[length].includes(len)) {
          // 如果上一个是1.1.1.1 现在是1.2则验证通过 但是如果是1.1.1.1 - 2.1 则不通过
          if (len > 1 && splitArr[0] !== prevSplitArr[0]) {
            return false
          } else return true
        } else return false
      case 3:
      case 4:
        if (keys[length].includes(len)) {
          let flag = true
          if (len === 3 || len === 2) {
            flag = splitArr[1] === prevSplitArr[1]
          }
          if (len === 4) {
            flag =
              splitArr[1] === prevSplitArr[1] && splitArr[2] === prevSplitArr[2]
          }
          if (length === 3 && len === 4) {
            flag = splitArr[1] === prevSplitArr[1]
          }
          return flag
        }
        break
      default:
    }
  }

  // 检测序号准确性
  getFloorNumber = (data, column, splitKey) => {
    // let { data } = this.state
    let checkInteger = 0 // 正在验证的整数
    let arr = []
    data.forEach((item, index) => {
      let value = item[column]
      let number = +value
      // 保存序号属于哪个字段 ABC
      item.numberkey = column
      // 整数,整数的情况下不需要验证
      if (!isNaN(number) && number % 1 === 0) {
        // 添加合理的上级,如果是整数，等于是从它开始判断下面的子集是什么
        checkInteger = number
        // item.parentKey = this.align_type[0]
      } else if (!item.is_error_key[column] && value) {
        // 判断这条数据是不是已经是错的，如果是错的，就不处理了并且不处理第一条数据
        // 不是整数。需要验证
        if (index > 0) {
          if (value.indexOf(splitKey) !== -1) {
            let splitArr = value.split(splitKey)
            let len = splitArr.length // 截取的序号长度
            item.parentKey = this.align_type[len - 1]
            // 保存数据有几个点
            item.numberlength = len - 1
            let prev = data[index - 1] // 上一个数据 item是当前数据
            // 判断上一个数据和这个数据是否合理, 如果检验通过
            if (this.checkPrevWithNow(prev[column], value, splitKey)) {
              delete item.is_error_key[column]
              delete item.is_error_text[column]
            } else {
              // 不通过
              item.is_error_key[column] = 'number'
              item.is_error_text[column] = '序号格式错误'
            }
            if (+splitArr[0] !== checkInteger) {
              // 判断当前数据与整数数据抑制 例 1 下面不能出现 2.1
              item.is_error_key[column] = 'number'
              item.is_error_text[column] = '序号格式错误'
            }
          }
        } else if (index === 0) {
          // 是第一条数据，直接报错，因为不是整数
          item.is_error_key[column] = 'number'
          item.is_error_text[column] = '序号格式错误'
        }
      }
      item.is_error = this.dataCheckIsError(item)
      arr.push(item)
    })
    return arr
  }

  handleChangeOrderField = (value, text) => {
    let { data = [], selectedKey = {} } = this.state
    let arr = [],
      typekey = ''
    Object.keys(selectedKey).forEach(item => {
      if (selectedKey[item] === 'number' || selectedKey[item] === 'type') {
        arr.push(selectedKey[item])
        if (selectedKey[item] === 'type') typekey = item
      }
    })
    // 校验序号数据正确性
    data = data.map(item => {
      let checkVal = item[text]
      let new_item = { ...item }
      let flag = arr.length > 1 ? true : false
      if (
        checkNumberReg({
          symbol: '.',
          val: checkVal,
          checkType: false,
          item,
          gold_type: text,
          dictionary: 'type',
          selectedKey
        })
      ) {
        delete new_item.is_error_key[text]
        delete new_item.is_error_text[text]
      } else {
        new_item.is_error_key[text] = 'number'
        new_item.is_error_text[text] = '序号格式错误'
      }
      if (Object.keys(new_item.is_error_key || {}).length) {
        new_item.is_error = true
      } else new_item.is_error = false
      return new_item
    })
    // 二次过滤-验证序号是否符合要求
    data = this.getFloorNumber(data, text, '.')
    this.setState({
      data
    })
    return data
  }

  // 查找数据的parent
  getParent = (data, current, splitKey) => {
    // 必须存在数据
    if (!data) return
    // 必须存在对比数据
    if (!current) return
    // 必须存在序号字段
    if (!current.numberkey) return
    let text = current[current.numberkey]
    let splitArr = text.split(splitKey)
    if (splitArr.length === 1) {
      return undefined
    } else {
      // 拿到当前截取的序号
      let parent = splitArr
      // 拿到当前序号的父级序号
      parent.length = splitArr.length - 1
      // 查找当前序号的父级数据
      let parentKey = parent.join(splitKey)
      let obj = data.find(item => item[item.numberkey] === parentKey)
      return obj
    }
  }

  // 渲染不同字段对应下拉框
  renderDiffSelectField = (text, value) => {
    let main = <></>
    if (value.includes('number')) {
      let defaultValue = 'order_spot'
      main = (
        <Select
          size="small"
          placeholder="请选择"
          style={{ width: '100%', marginTop: '5px' }}
          onChange={value => {
            this.handleChangeOrderField(value, text)
          }}
          defaultValue={defaultValue}
        >
          <Select.Option key={'order_spot'}>1.1.1.1</Select.Option>
          {/* <Select.Option key={'order_line'}>1-1-1-1</Select.Option> */}
        </Select>
      )
    }
    return main
  }

  dataCheckIsError = val => {
    if (val) {
      if (Object.keys(val.is_error_key || {}).length) {
        return true
      } else {
        return false
      }
    }
  }

  // 校验序号
  volidTimeOfNumber = (data, select_name, column) => {
    let arr = []
    data.forEach(item => {
      let startTimekey = item.start_timekey
      let endTimekey = item.due_timekey
      let numberkey = item.numberkey
      let parent = this.getParent(data, item, '.')
      if (!item.is_error_key[startTimekey] && !item.is_error_key[numberkey]) {
        if (parent) {
          let parentSTime = parent[startTimekey]
          let parentETime = parent[endTimekey]
          let nowSTime = item[startTimekey]
          // 如果当前任务的开始时间大于父任务的开始时间并且早于父任务的结束时间，则通过验证
          if (
            compareStartDueTime(
              timeToTimestamp(nowSTime || 0),
              timeToTimestamp(parentETime || 0)
            ) &&
            compareStartDueTime(
              timeToTimestamp(parentSTime || 0),
              timeToTimestamp(nowSTime || 0)
            )
          ) {
            delete item.is_error_key[startTimekey]
            delete item.is_error_text[startTimekey]
          } else {
            item.is_error_key[startTimekey] = 'start_time'
            item.is_error_text[startTimekey] =
              '开始时间不能大于父级的开始时间或者不能早于父级的截止时间'
          }
        }
      }
      if (!item.is_error_key[endTimekey] && !item.is_error_key[numberkey]) {
        if (parent) {
          let parentSTime = parent[startTimekey]
          let parentETime = parent[endTimekey]
          let nowETime = item[endTimekey]
          if (
            compareStartDueTime(
              timeToTimestamp(parentSTime),
              timeToTimestamp(nowETime)
            ) &&
            compareStartDueTime(
              timeToTimestamp(nowETime),
              timeToTimestamp(parentETime)
            )
          ) {
            delete item.is_error_key[endTimekey]
            delete item.is_error_text[endTimekey]
          } else {
            item.is_error_key[endTimekey] = 'due_time'
            item.is_error_text[endTimekey] =
              '截止时间不能小于父级的开始时间或者不能晚于父级的截止时间'
          }
        }
      }
      item.is_error = this.dataCheckIsError(item)
      arr.push(item)
    })
    return arr
  }

  // 对比时间跨度
  volidStartAndEndTime = (data, selectedKey, select_name, text) => {
    let arr = []
    data.forEach(item => {
      let startTimekey = item.start_timekey
      let endTimekey = item.due_timekey
      if (!item.is_error_key[startTimekey] && !item.is_error_key[endTimekey]) {
        if (
          !compareStartDueTime(
            timeToTimestamp(item[startTimekey]),
            timeToTimestamp(item[endTimekey])
          )
        ) {
          item.is_error_key[text] = select_name
          item.is_error_text[text] = '开始时间不能大于截止时间'
        } else {
          delete item.is_error_key[text]
          delete item.is_error_text[text]
        }
      }
      item.is_error = this.dataCheckIsError(item)
      arr.push(item)
    })
    return arr
  }
  /**
   * 操作时间格式
   * @param {String} format 表示选择的时间格式 'YYYY-MM-DD'
   * @param {String} select_name 代表是开始时间还是截止时间
   * @param {String} text 代表是选择列的表头 A,B,C...
   */
  handleChangeTimer = ({ d, format, select_name, text }) => {
    let { data = [], selectedKey = {} } = this.state
    data = d || data
    let arr = [],
      timer_key = ''
    // 表示如果选择的是开始时间 那么需要获取截止时间 反之亦然
    let gold_time = select_name == 'start_time' ? 'due_time' : 'start_time'
    let isCheckNumber = false
    Object.keys(selectedKey).forEach(item => {
      if (selectedKey[item] === gold_time) {
        arr.push(selectedKey[item])
        timer_key = item
      }
      if (selectedKey[item] === 'number') {
        isCheckNumber = true
      }
    })
    data = data.map(item => {
      let checkVal = item[text]
      let new_item = { ...item }
      new_item[select_name + 'key'] = text
      let gold_value = item[timer_key]
      let temp
      // 表示当前操作并需要检测的元素
      let checkTimeValue = checkVal ? timeToTimestamp(checkVal) : ''
      // 表示需要比较进行判断的元素
      let goldTimeValue = gold_value ? timeToTimestamp(gold_value) : ''
      // 这里表示 如果当前操作的是截止时间 那么检测的就是截止时间, 所以要将开始和截止时间变量互换
      if (select_name == 'due_time') {
        temp = checkTimeValue
        checkTimeValue = goldTimeValue
        goldTimeValue = temp
      }
      // 校验本身的逻辑
      if (!checkTimerReg(format, checkVal)) {
        new_item.is_error_key[text] = select_name
        new_item.is_error_text[text] = '时间格式错误'
      } else {
        delete item.is_error_key[text]
        delete item.is_error_text[text]
      }
      if (Object.keys(new_item.is_error_key || {}).length) {
        new_item.is_error = true
      } else new_item.is_error = false
      return new_item
    })
    // 校验同时存在开始结束时间的逻辑
    if (timer_key) {
      data = this.volidStartAndEndTime(data, selectedKey, select_name, text)
    }

    // 需要检验序号
    if (isCheckNumber) {
      data = this.volidTimeOfNumber(data, select_name, text)
    }
    this.setState({
      data,
      select_time_format: {
        ...this.state.select_time_format,
        [text]: format
      }
    })
  }

  renderSelectTime = ({ select_name, text }) => {
    return (
      <Select
        style={{ width: '100%', marginTop: '5px' }}
        size="small"
        placeholder="请选择"
        onChange={format => {
          this.handleChangeTimer({ format, select_name, text })
        }}
        key={select_name}
        defaultValue={'YYYY/MM/DD'}
      >
        <Select.Option title="YYYY/MM/DD" key="YYYY/MM/DD">
          YYYY/MM/DD
        </Select.Option>
        <Select.Option title="YYYY/MM/DD HH:mm" key="YYYY/MM/DD HH:mm">
          YYYY/MM/DD HH:mm
        </Select.Option>
        <Select.Option title="YYYY-MM-DD" key="YYYY-MM-DD">
          YYYY-MM-DD
        </Select.Option>
        <Select.Option title="YYYY-MM-DD HH:mm" key="YYYY-MM-DD HH:mm">
          YYYY-MM-DD HH:mm
        </Select.Option>
      </Select>
    )
  }

  tableHeader = (text, data) => {
    const { selectedKey = {} } = this.state
    // let key = Object.keys(selectedKey)
    let value = Object.values(selectedKey)
    let head = (
      <>
        <Select
          size="small"
          placeholder="请选择"
          style={{ width: '100%', marginRight: '5px' }}
          onChange={this.selectText.bind(this, text)}
        >
          {this.state.tableDefaultKeys.map(item => {
            return (
              <Select.Option
                key={item.value}
                value={item.value}
                disabled={item.selected}
              >
                {item.label}
              </Select.Option>
            )
          })}
        </Select>
        {selectedKey[text] == 'number' &&
          this.renderDiffSelectField(text, value)}
        {selectedKey[text] == 'start_time' &&
          this.renderSelectTime({ select_name: 'start_time', text })}
        {selectedKey[text] == 'due_time' &&
          this.renderSelectTime({ select_name: 'due_time', text })}
      </>
    )
    return head
  }

  // 删除选择的数据
  removeSelectValue = () => {
    let arr = Array.from(this.state.selectedRows)
    let datas = Array.from(this.state.data)
    let ids = arr.map(item => item.uuid)
    let data = datas.filter(item => !ids.includes(item.uuid))
    data = data.map((item, index) => {
      let new_item = { ...item }
      new_item = { ...item, id: index + 1, number: index + 1 }
      return new_item
    })
    this.setState({ data, selectedRows: [], hasSelected: false }, () => {
      let { selectedKey } = this.state
      Object.keys(selectedKey).forEach(item => {
        if (selectedKey[item] === 'number') {
          this.handleChangeOrderField('', item)
        }
        if (selectedKey[item] === 'type') {
          this.handleChangeTypes(item)
        }
      })
    })
  }

  // 选择行的回调
  onSelectRow = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows: selectedRows,
      hasSelected: !!selectedRows.length
    })
  }

  closeAll = () => {
    let tableDefaultKeys = Array.from(this.state.tableDefaultKeys)
    tableDefaultKeys = tableDefaultKeys.map(item => {
      item.selected = false
      return item
    })
    this.setState({
      tableDefaultKeys,
      selectedRows: [],
      selectedKey: {},
      visible: false
    })
  }

  handleSave = (row, operateObj) => {
    let newData = [...this.state.data]
    const { selectedKey = {}, select_time_format = {} } = this.state
    const index = newData.findIndex(item => row.uuid === item.uuid)
    const item = newData[index]
    let checkVal = Object.values(operateObj)[0]
    let checkKey = Object.keys(operateObj)[0]
    let switchType = selectedKey[checkKey]
    let obj = { ...row }
    switch (switchType) {
      case 'number':
        obj[checkKey] = checkVal
        newData = newData.map(item => {
          if (item.uuid === obj.uuid) {
            item = obj
          }
          return item
        })
        this.setState(
          {
            data: newData
          },
          () => {
            this.handleChangeOrderField('', checkKey)
          }
        )
        return
      case 'name':
        obj[checkKey] = checkVal
        newData = newData.map(item => {
          if (item.uuid === obj.uuid) {
            item = obj
          }
          return item
        })
        this.setState(
          {
            data: newData
          },
          () => {
            this.handleChangName(checkKey)
          }
        )
        return
        break
      case 'start_time':
        obj[checkKey] = checkVal
        newData = newData.map(item => {
          if (item.uuid === obj.uuid) {
            item = obj
          }
          return item
        })
        this.setState(
          {
            data: newData
          },
          () => {
            this.handleChangeTimer({
              format: this.state.select_time_format[checkKey] || 'YYYY/MM/DD',
              select_name: 'start_time',
              text: checkKey
            })
          }
        )
        return
        break
      case 'due_time':
        obj[checkKey] = checkVal
        newData = newData.map(item => {
          if (item.uuid === obj.uuid) {
            item = obj
          }
          return item
        })
        this.setState(
          {
            data: newData
          },
          () => {
            this.handleChangeTimer({
              format: this.state.select_time_format[checkKey] || 'YYYY/MM/DD',
              select_name: 'due_time',
              text: checkKey
            })
          }
        )
        return
        // let time_format = select_time_format[checkKey]
        // if (checkTimerReg(time_format, checkVal)) {
        //   delete item.is_error_key[checkKey]
        //   newData.splice(index, 1, {
        //     ...item,
        //     ...row
        //   })
        // } else {
        //   newData.splice(index, 1, {
        //     ...item,
        //     ...row
        //   })
        // }
        break
      case 'description':
        obj[checkKey] = checkVal
        newData = newData.map(item => {
          if (item.uuid === obj.uuid) {
            item = obj
          }
          return item
        })
        break
      case 'type':
        obj[checkKey] = checkVal
        newData = newData.map(item => {
          if (item.uuid === obj.uuid) {
            item = obj
          }
          return item
        })
        this.setState(
          {
            data: newData
          },
          () => {
            this.handleChangeTypes(checkKey)
          }
        )
        return
        break
      default:
        break
    }
    this.setState({ data: newData })
  }

  // 设置接口数据结构
  setDataList = () => {
    const { data = [], selectedKey = {} } = this.state
    let arr = Object.keys(selectedKey) || []
    let field_value = Object.values(selectedKey)
    let data_list = []
    data.forEach(item => {
      let new_item = {
        uuid: '',
        name: '',
        type: '',
        start_time: '',
        due_time: '',
        description: '',
        parent_id: '0'
      }
      for (let k in new_item) {
        arr.forEach(d => {
          if (
            selectedKey[d] === 'start_time' ||
            selectedKey[d] === 'due_time'
          ) {
            new_item[selectedKey[d]] = timeToTimestamp(item[d])
          } else {
            new_item[selectedKey[d]] = item[d]
          }
        })
      }

      new_item.uuid = item.uuid
      new_item.type = item.typekey
        ? this.typeValid[item[item.typekey]]?.name
        : 'card'
      delete new_item.number
      let parent = this.getParent(data, item, '.')
      if (parent) {
        new_item.parent_id = parent.uuid
      }
      data_list.push(new_item)
    })
    return data_list
  }

  // 确定
  setExportExcelData = () => {
    const { data = [], selectedKey = {} } = this.state
    let selected_value = Object.values(selectedKey)
    const { board_id } = this.props

    if (!selected_value.includes('name')) {
      message.error('操作失败，必须指定名称')
      return
    }
    if (selected_value.includes('number')) {
      //表示如果存在序号
      if (!selected_value.includes('type')) {
        message.error('操作失败，必须指定类型')
        return
      }
    }
    if (selected_value.includes('type')) {
      //表示如果存在序号
      if (!selected_value.includes('number')) {
        message.error('操作失败，必须指定序号')
        return
      }
    }
    if (data.find(item => item.is_error)) {
      message.error('选择的字段中,格式存在错误')
      return
    }
    let data_list = this.setDataList()
    importExcelWithBoardData({
      board_id,
      data_list
    }).then(res => {
      if (isApiResponseOk(res)) {
        this.closeAll()
        this.props.dispatch({
          type: 'gantt/getGanttData',
          payload: {}
        })
      } else {
        message.warn(res.message)
      }
    })
  }

  render() {
    let {
      visible,
      columns = [],
      data = [],
      hasSelected,
      selectedKey = {},
      selectedRows = []
    } = this.state
    const maxHeight = document.body.clientHeight / 2
    columns = columns.map((col, index) => ({
      ...col,
      onCell: record => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: selectedKey[col.dataIndex],
        handleSave: this.handleSave
      })
    }))
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell
      }
    }
    return (
      <div>
        <Button onClick={this.addFile} style={{ marginTop: '8px' }} block>
          导入表格
        </Button>
        <Modal
          width="80%"
          visible={visible}
          title="导入数据"
          onCancel={() => this.closeAll()}
          onOk={() => this.setExportExcelData()}
          okText="确定"
          cancelText="取消"
          maskClosable={false}
          keyboard={false}
          destroyOnClose={true}
        >
          <Row style={{ margin: '10px 0' }}>
            <Col>
              <Button
                disabled={!hasSelected}
                type="danger"
                onClick={this.removeSelectValue}
                style={
                  !hasSelected
                    ? null
                    : {
                        color: '#fff',
                        backgroundColor: '#ff4d4f',
                        borderColor: '#ff4d4f'
                      }
                }
              >
                删除
              </Button>
            </Col>
          </Row>
          {/* <EditableTable /> */}
          <Table
            components={components}
            style={{ overflow: 'auto', maxHeight: maxHeight + 'px' }}
            bordered
            rowKey="uuid"
            rowSelection={{
              hideSelectAll: true,
              columnTitle: ' ',
              onChange: this.onSelectRow,
              selectedRows: selectedRows
            }}
            rowClassName={() => styles['editable-row']}
            columns={columns}
            dataSource={data}
            pagination={false}
          />
        </Modal>
      </div>
    )
  }
}

ExcelRead.defaultProps = {
  board_id: '' // 项目ID
}
