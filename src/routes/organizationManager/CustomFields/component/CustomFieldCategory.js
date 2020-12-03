import React, { Component } from 'react'
import { connect } from 'dva'
import globalStyles from '@/globalset/css/globalClassName.less'
import indexStyles from '../index.less'
import commonStyles from '../common.less'
import { Button, Input, Select } from 'antd'
import InputExport from './InputExport'
import { currentNounPlanFilterName } from '../../../../utils/businessFunction'
import { ORGANIZATION, PROJECTS } from '../../../../globalset/js/constant'

const Option = Select.Option
@connect(
  ({
    organizationManager: {
      datas: { currentOperateFieldItem = {} }
    }
  }) => ({
    currentOperateFieldItem
  })
)
export default class CustomFieldCategory extends Component {
  constructor(props) {
    super(props)
    const { currentOperateFieldItem = {} } = props
    let value = !!(
      currentOperateFieldItem && Object.keys(currentOperateFieldItem).length
    )
      ? this.getDiffFieldValue(currentOperateFieldItem)
      : ''
    this.state = {
      inputValue:
        currentOperateFieldItem.name &&
        currentOperateFieldItem.type == 'no_group'
          ? currentOperateFieldItem.name
          : '', // 名称值
      field_type: currentOperateFieldItem.field_type
        ? currentOperateFieldItem.field_type
        : '', // 选择的字段类型
      field_value: value, // 选择的字段内容
      selected_field_group: !!(
        currentOperateFieldItem && Object.keys(currentOperateFieldItem).length
      )
        ? currentOperateFieldItem.type == 'group'
          ? currentOperateFieldItem.id
          : currentOperateFieldItem.group_id
        : '0'
    }
  }

  initState = () => {
    this.setState({
      inputValue: '', // 名称值
      field_type: '', // 选择的字段类型
      field_value: null, // 选择的字段内容
      selected_field_group: '0' // 选择的分组列表
    })
  }

  getDiffFieldValue = item => {
    const { field_type } = item
    let field_value = ''
    switch (field_type) {
      case '1':
      case '2':
        let inputList = [...item.items]
        inputList = inputList.map(item => {
          let new_item = { ...item }
          new_item = { ...item, value: item.item_value }
          return new_item
        })
        field_value = inputList
        break
      case '3':
        field_value = item.field_set && item.field_set.date_field_code
        break
      case '4':
      case '5':
      case '6':
        break
      case '8':
        field_value = {
          member_selected_type:
            item.field_set && item.field_set.member_selected_type,
          member_selected_range:
            item.field_set && item.field_set.member_selected_range
        }
        break
      default:
        break
    }
    return field_value
  }

  componentWillReceiveProps(nextProps) {
    const { currentOperateFieldItem = {} } = nextProps
    let value = !!(
      currentOperateFieldItem && Object.keys(currentOperateFieldItem).length
    )
      ? this.getDiffFieldValue(currentOperateFieldItem)
      : ''
    const { field_type } = this.state
    console.log(field_type)
    if (
      !!(currentOperateFieldItem && Object.keys(currentOperateFieldItem).length)
    ) {
      this.setState({
        inputValue:
          currentOperateFieldItem.name &&
          currentOperateFieldItem.type == 'no_group'
            ? currentOperateFieldItem.name
            : '', // 名称值
        field_type: currentOperateFieldItem.field_type
          ? currentOperateFieldItem.field_type
          : field_type, // 选择的字段类型
        field_value: value, // 选择的字段内容
        selected_field_group: !!(
          currentOperateFieldItem && Object.keys(currentOperateFieldItem).length
        )
          ? currentOperateFieldItem.type == 'group'
            ? currentOperateFieldItem.id
            : currentOperateFieldItem.group_id
          : '0'
      })
    }
  }

  componentWillUnmount() {
    this.initState()
    this.props.dispatch({
      type: 'organizationManager/updateDatas',
      payload: {
        currentOperateFieldItem: {}
      }
    })
  }

  canEditForm = () => {
    const { currentOperateFieldItem = {} } = this.props
    let flag = true
    if (
      !!(
        currentOperateFieldItem && Object.keys(currentOperateFieldItem).length
      ) &&
      currentOperateFieldItem.type == 'no_group'
    ) {
      if (currentOperateFieldItem.quote_num == 0) {
        flag = true
      } else {
        flag = false
      }
    } else {
      flag = true
    }
    return flag
  }

  // ------------- 名称事件 S --------------------

  handleChangeFieldName = e => {
    let value = e.target.value
    this.setState({
      inputValue: value
    })
  }

  handleChangeFieldNameBlur = e => {
    let value = e.target.value
    if (!value || value.trimLR() == '') {
      this.setState({
        inputValue: ''
      })
      return
    }
    this.setState({
      inputValue: value
    })
  }

  // ------------- 名称事件 E --------------------

  // 字段类型选择
  onFieldsChange = (value, e) => {
    console.log(value)
    if (value == '1' || value == '2') {
      this.setState({
        field_type: value,
        field_value: [{ value: '' }]
      })
    } else {
      this.setState({
        field_type: value,
        field_value: null
      })
    }
  }

  // 追加一条Input
  handleAddOneTips = () => {
    const { field_value: inputList = [] } = this.state
    let new_inputList = [...inputList]
    new_inputList = new_inputList.concat([{ value: '' }])
    this.setState({
      field_value: new_inputList
    })
  }

  // 删除一条Input
  handleDeleteInput = index => {
    const { field_value: inputList = [] } = this.state
    let new_inputList = [...inputList]
    new_inputList = new_inputList.filter((item, i) => i != index)
    this.setState({
      field_value: new_inputList
    })
  }

  // 对每一个选项input设置value值
  handleChangeInputValue = data => {
    const { value, index } = data
    const { field_value: inputList = [] } = this.state
    let new_inputList = [...inputList]
    new_inputList = new_inputList.map((item, i) => {
      let new_item = item
      if (index == i) {
        new_item = { ...new_item, value: value }
      }
      return new_item
    })
    this.setState({
      field_value: new_inputList
    })
  }

  // ----------------------- 日期事件 S -----------------------

  handleDateChange = value => {
    this.setState({
      field_value: value
    })
  }

  // ----------------------- 日期事件 E -----------------------

  // ----------------------- 成员事件 S -----------------------
  handleMemberSelectedType = value => {
    const { field_value = {} } = this.state
    let obj = { ...field_value }
    this.setState({
      field_value: {
        member_selected_type: value,
        member_selected_range: obj.member_selected_range
      }
    })
  }
  handleMemberSelectedRange = value => {
    const { field_value = {} } = this.state
    let obj = { ...field_value }
    this.setState({
      field_value: {
        member_selected_range: value,
        member_selected_type: obj.member_selected_type
      }
    })
  }
  // ----------------------- 成员事件 E -----------------------

  // 字段分组选择
  handleSelectedFieldGroup = value => {
    this.setState({
      selected_field_group: value
    })
  }

  // 获取对应参数字段
  getParams = () => {
    let params = {}
    const {
      field_type,
      inputValue,
      selected_field_group,
      field_value
    } = this.state
    const { currentOperateFieldItem = {} } = this.props
    switch (field_type) {
      case '1':
      case '2':
        let items = []
        let arr = [...field_value]
        arr = arr.map(item => {
          if (item.value != '') {
            items.push(item.value)
          }
        })
        params.items = items
        break
      case '3':
        params.date_field_code = field_value
        break
      case '4':
      case '5':
      case '6':
        break
      case '8':
        params.member_selected_type = field_value.member_selected_type
        params.member_selected_range = field_value.member_selected_range
        break
      default:
        break
    }
    params = {
      ...params,
      field_type: field_type,
      name: inputValue,
      group_id: selected_field_group ? selected_field_group : null,
      id:
        currentOperateFieldItem.type &&
        currentOperateFieldItem.type == 'no_group'
          ? currentOperateFieldItem.id
          : null
    }
    return params
  }

  // 添加字段
  handleCreateCustomField = e => {
    e && e.stopPropagation()
    let params = this.getParams()
    delete params.id
    this.props.dispatch({
      type: 'organizationManager/createCustomField',
      payload: {
        ...params
      }
    })
    this.props.onCancel && this.props.onCancel()
  }

  // 更新字段
  handleUpdateCustomField = e => {
    let params = this.getParams()
    this.props.dispatch({
      type: 'organizationManager/updateCustomField',
      payload: {
        ...params
      }
    })
    this.props.onCancel && this.props.onCancel()
  }

  renderDiffButtonTooltipsText = () => {
    let confirmButtonDisabled = false // 默认false true表示可以确定
    let { field_type, field_value } = this.state
    switch (field_type) {
      case '1': // 表示单选
        // 只要找到一个值不为空就行
        confirmButtonDisabled =
          field_value && field_value.find(i => i.value != '') ? true : false
        break
      case '2':
        confirmButtonDisabled =
          field_value && field_value.find(i => i.value != '') ? true : false
        break
      case '3': // 表示日期
        confirmButtonDisabled = !!field_value
        break
      case '4': // 表示数字
      case '5': // 表示文本
      case '6': // 表示文件
        confirmButtonDisabled = true
        break
      case '8': // 表示成员
        field_value = { ...field_value }
        const { member_selected_range, member_selected_type } = field_value
        confirmButtonDisabled =
          !!member_selected_range && !!member_selected_type
        break
      default:
        break
    }
    return confirmButtonDisabled
  }

  renderPopoverTitle = () => {
    const { currentOperateFieldItem = {} } = this.props
    let title =
      !!(
        currentOperateFieldItem && Object.keys(currentOperateFieldItem).length
      ) && currentOperateFieldItem.type == 'no_group'
        ? '编辑字段'
        : '添加字段'
    return <div className={indexStyles.title__wrapper}>{title}</div>
  }

  // 渲染popover组件中的底部 确定按钮
  renderPopoverContentAddMemberBtn = () => {
    const { inputValue, field_type, selected_field_group } = this.state
    let disabled =
      !!inputValue &&
      field_type &&
      this.renderDiffButtonTooltipsText() &&
      !!selected_field_group
    const { currentOperateFieldItem = {} } = this.props
    let type = currentOperateFieldItem.type
    return (
      <div className={indexStyles.content__addMemberBtn_wrapper}>
        <Button
          type="primary"
          block
          disabled={!disabled}
          onClick={
            !type || type == 'group'
              ? this.handleCreateCustomField
              : type == 'no_group'
              ? this.handleUpdateCustomField
              : ''
          }
        >
          确定
        </Button>
      </div>
    )
  }

  // 渲染不同类型选项对应不同内容
  renderPopoverContentWithDiffCategoryDetail = type => {
    const { field_value } = this.state
    let mainContent = <div></div>
    let disabled = false
    disabled = this.canEditForm()
    switch (type) {
      case '1': // 表示单选
        mainContent = (
          <div className={commonStyles.field_item}>
            <label className={commonStyles.label_name}>选项：</label>
            {field_value &&
              field_value.map((item, index) => {
                return (
                  <InputExport
                    disabled={disabled}
                    maxLength={100}
                    inputList={field_value}
                    itemKey={index}
                    itemValue={item}
                    handleAddOneTips={this.handleAddOneTips}
                    handleDeleteInput={this.handleDeleteInput}
                    handleChangeInputValue={this.handleChangeInputValue}
                  />
                )
              })}
          </div>
        )
        break
      case '2': // 表示多选
        mainContent = (
          <div className={commonStyles.field_item}>
            <label className={commonStyles.label_name}>选项：</label>
            {field_value &&
              field_value.map((item, index) => {
                return (
                  <InputExport
                    disabled={disabled}
                    maxLength={100}
                    inputList={field_value}
                    itemKey={index}
                    itemValue={item}
                    handleAddOneTips={this.handleAddOneTips}
                    handleDeleteInput={this.handleDeleteInput}
                    handleChangeInputValue={this.handleChangeInputValue}
                  />
                )
              })}
          </div>
        )
        break
      case '3': // 表示日期
        mainContent = (
          <div className={commonStyles.field_item}>
            <label className={commonStyles.label_name}>精确度：</label>
            <Select
              disabled={!disabled}
              value={field_value}
              optionLabelProp={'label'}
              style={{ width: '100%' }}
              onChange={this.handleDateChange}
            >
              <Option value={'YM'} label={'年/月'}>
                年/月
              </Option>
              <Option value={'YMD'} label={'年/月/日'}>
                年/月/日
              </Option>
              <Option value={'YMDH'} label={'年/月/日 时'}>
                年/月/日 时
              </Option>
              <Option value={'YMDHM'} label={'年/月/日 时:分'}>
                年/月/日 时:分
              </Option>
              <Option value={'YMDHMS'} label={'年/月/日 时:分:秒'}>
                年/月/日 时:分:秒
              </Option>
            </Select>
          </div>
        )
        break
      case '4': // 表示数字
        mainContent = null
        break
      case '5': // 表示文本
        mainContent = null
        break
      case '6': // 表示文件
        mainContent = null
        break
      case '8': // 表示成员
        mainContent = (
          <>
            <div className={commonStyles.field_item}>
              <label className={commonStyles.label_name}>选择限制：</label>
              <Select
                disabled={!disabled}
                value={field_value && field_value.member_selected_type}
                optionLabelProp={'label'}
                style={{ width: '100%' }}
                onChange={this.handleMemberSelectedType}
              >
                <Option value={'1'} label={'单人'}>
                  单人
                </Option>
                <Option value={'2'} label={'多人'}>
                  多人
                </Option>
              </Select>
            </div>
            <div className={commonStyles.field_item}>
              <label className={commonStyles.label_name}>范围限制：</label>
              <Select
                disabled={!disabled}
                value={field_value && field_value.member_selected_range}
                optionLabelProp={'label'}
                style={{ width: '100%' }}
                onChange={this.handleMemberSelectedRange}
              >
                <Option value={'1'} label={'当前组织'}>
                  当前{`${currentNounPlanFilterName(ORGANIZATION)}`}
                </Option>
                <Option
                  value={'2'}
                  label={`${currentNounPlanFilterName(PROJECTS)}`}
                >
                  {`${currentNounPlanFilterName(PROJECTS)}`}内
                </Option>
              </Select>
            </div>
          </>
        )
        break
      default:
        break
    }
    return mainContent
  }

  // 渲染类型选项
  renderPopoverContentSelectedDiffCategory = () => {
    const { field_type } = this.state
    let disabled = this.canEditForm()
    return (
      <Select
        disabled={!disabled}
        optionLabelProp={'label'}
        value={[field_type]}
        onSelect={this.onFieldsChange}
        style={{ width: '100%' }}
        getPopupContainer={triggerNode => triggerNode.parentNode}
      >
        <Option value="1" label={'单选'}>
          <span
            className={`${globalStyles.authTheme}`}
            style={{ fontSize: '20px', marginRight: '8px' }}
          >
            &#xe6af;
          </span>
          <span>单选</span>
        </Option>
        <Option value="2" label={'多选'}>
          <span
            className={`${globalStyles.authTheme}`}
            style={{ fontSize: '20px', marginRight: '8px' }}
          >
            &#xe6b2;
          </span>
          <span>多选</span>
        </Option>
        <Option value="3" label={'日期'}>
          <span
            className={`${globalStyles.authTheme}`}
            style={{ fontSize: '20px', marginRight: '8px' }}
          >
            &#xe7d3;
          </span>
          <span>日期</span>
        </Option>
        <Option value="4" label={'数字'}>
          <span
            className={`${globalStyles.authTheme}`}
            style={{ fontSize: '20px', marginRight: '8px' }}
          >
            &#xe6b0;
          </span>
          <span>数字</span>
        </Option>
        <Option value="5" label={'文本'}>
          <span
            className={`${globalStyles.authTheme}`}
            style={{ fontSize: '20px', marginRight: '8px' }}
          >
            &#xe6b1;
          </span>
          <span>文本</span>
        </Option>
        <Option value="6" label={'文件'}>
          <span
            className={`${globalStyles.authTheme}`}
            style={{ fontSize: '20px', marginRight: '8px' }}
          >
            &#xe6b3;
          </span>
          <span>文件</span>
        </Option>
        <Option value="8" label={'成员'}>
          <span
            className={`${globalStyles.authTheme}`}
            style={{ fontSize: '20px', marginRight: '8px' }}
          >
            &#xe7b2;
          </span>
          <span>成员</span>
        </Option>
      </Select>
    )
  }

  // 渲染内容
  renderPopoverContentCategory = () => {
    const { inputValue, field_type, selected_field_group } = this.state
    const {
      customFieldsList: { groups = [] },
      currentOperateFieldItem = {}
    } = this.props
    // let defaultValue = !!(currentOperateFieldItem && Object.keys(currentOperateFieldItem).length) ? currentOperateFieldItem.id : selected_field_group
    return (
      <div>
        <div className={commonStyles.field_item}>
          <label className={commonStyles.label_name}>名称：</label>
          <Input
            maxLength={100}
            value={inputValue}
            onChange={this.handleChangeFieldName}
            onBlur={this.handleChangeFieldNameBlur}
          />
        </div>
        <div className={commonStyles.field_item}>
          <label className={commonStyles.label_name}>类型：</label>
          {this.renderPopoverContentSelectedDiffCategory()}
        </div>
        {this.renderPopoverContentWithDiffCategoryDetail(field_type)}
        <div className={commonStyles.field_item}>
          <label className={commonStyles.label_name}>字段分组：</label>
          <Select
            value={selected_field_group}
            allowClear
            onChange={this.handleSelectedFieldGroup}
            optionLabelProp={'label'}
            style={{ width: '100%' }}
          >
            <Option value={'0'} label={'根目录'}>
              根目录
            </Option>
            {groups &&
              groups.length &&
              groups.map(item => {
                return (
                  <Option value={item.id} label={item.name}>
                    {item.name}
                  </Option>
                )
              })}
          </Select>
        </div>
      </div>
    )
  }

  renderPopoverContent = () => {
    return (
      <div className={indexStyles.content__wrapper}>
        <div className={indexStyles.content_category}>
          {this.renderPopoverContentCategory()}
        </div>
        <div>{this.renderPopoverContentAddMemberBtn()}</div>
      </div>
    )
  }

  render() {
    return (
      <div>
        <div>{this.renderPopoverTitle()}</div>
        <div>{this.renderPopoverContent()}</div>
      </div>
    )
  }
}
