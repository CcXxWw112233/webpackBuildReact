export const processEditDatasConstant = [
  {
    name: '', //节点名称
    node_type: '1', //节点类型：1代表里程碑节点
    description: '',
    deadline_type: '1', //完成期限类型 1=无期限 2=启动流程时指定 3=固定天数
    deadline_value: '1', //完成期限值
    is_workday: '0',
    assignee_type: '1', //审批人类型 1=任何人 2=启动流程时指定 3=固定人选
    assignees: '', //审批人(id) 多个逗号隔开
    transfer_mode: '2', //流转方式 1=自由选择 2= 下一步
    enable_revocation: '1', //是否可撤回 1=可撤回 0=不可撤回
    enable_opinion: '1' //是否填写意见  1=填写 0=不填写
  }
]

export const processEditDatasRecordsConstant = [
  {
    node_type: '1',
    alltypedata: [
      {
        name: '', //节点名称
        node_type: '1', //节点类型：1代表里程碑节点
        description: '',
        deadline_type: '1', //完成期限类型 1=无期限 2=启动流程时指定 3=固定天数
        deadline_value: '1', //完成期限值
        is_workday: '0',
        assignee_type: '1', //审批人类型 1=任何人 2=启动流程时指定 3=固定人选
        assignees: '', //审批人(id) 多个逗号隔开
        transfer_mode: '2', //流转方式 1=自由选择 2= 下一步
        enable_revocation: '1', //是否可撤回 1=可撤回 0=不可撤回
        enable_opinion: '1' //是否填写意见  1=填写 0=不填写
      },
      {
        name: '',
        node_type: '2', //节点类型：2代表上传节点
        description: '',
        deadline_type: '1', //完成期限类型 1=无期限 2=启动流程时指定 3=固定天数
        deadline_value: '1', //完成期限值
        is_workday: '0',
        assignee_type: '1', //审批人类型 1=任何人 2=启动流程时指定 3=固定人选
        assignees: '', //审批人(id) 多个逗号隔开
        transfer_mode: '2', //流转方式 1=自由选择 2= 下一步
        enable_revocation: '1', //是否可撤回 1=可撤回 0=不可撤回
        enable_opinion: '1', //是否填写意见  1=填写 0=不填写
        require_data: {
          limit_file_num: '10', //限制文件上传数量 0=不限制
          limit_file_type: '1,2,3,4', //限制上传类型(文件格式)1=文档 2=图像 3=音频 4=视频
          limit_file_size: '20' //限制文件大小
        }
      },
      {
        name: '',
        node_type: '3', //节点类型：3代表填写节点
        description: '',
        deadline_type: '1', //完成期限类型 1=无期限 2=启动流程时指定 3=固定天数
        deadline_value: '1', //完成期限值
        is_workday: '0',
        assignee_type: '1', //审批人类型 1=任何人 2=启动流程时指定 3=固定人选
        assignees: '', //审批人(id) 多个逗号隔开
        transfer_mode: '2', //流转方式 1=自由选择 2= 下一步
        enable_revocation: '1', //是否可撤回 1=可撤回 0=不可撤回
        enable_opinion: '1', //是否填写意见  1=填写 0=不填写
        form_data: [
          {
            field_type: '1', //字段类型 1=输入框
            property_name: '', //属性名称(标题)输入框
            default_value: '', //默认值 默认值
            verification_rule: '', //校验规则 '' =不校验格式 mobile = 手机号码，tel = 座机，ID_card = 身份证号码，chinese_name = 中文名，url = 网址,qq = QQ号，postal_code = 邮政编码，positive_integer = 正整数，negative = 负数，two_decimal_places = 精确到两位小数
            val_length: '20', //长度
            is_required: '0' //是否必须 1=必须 0=不是必须
          },
          {
            field_type: '2', //字段类型 2=日期选择
            property_name: '', //属性名称(标题)日期选择
            default_value: '', //默认值 默认值
            verification_rule: 'SINGLE_DATE_TIME', //校验规则 单个+日期+时分 = SINGLE_DATE_TIME ,单个+日期 = SINGLE_DATE,多个+日期+时分 = MULTI_DATE_TIME ,多个+日期 = MULTI_DATE
            is_required: '0' //是否必须 1=必须 0=不是必须
          },
          {
            field_type: '3', //字段类型 3=下拉框
            property_name: '', //属性名称(标题) 下拉框
            default_value: '', //默认值(预设值)默认值
            verification_rule: 'redio', //校验规则 redio = 单选， multiple = 多选 ，province = 省市区
            is_required: '0', //是否必须 1=必须 0=不是必须
            options_data: []
          }
        ]
      },
      {
        name: '',
        node_type: '4', //节点类型：4代表抄送节点
        description: '',
        deadline_type: '1', //完成期限类型 1=无期限 2=启动流程时指定 3=固定天数
        deadline_value: '1', //完成期限值
        is_workday: '0',
        assignee_type: '1', //抄送人类型 2=启动流程时指定 3=固定人选
        assignees: '', //抄送人 多个逗号隔开（传的是邮箱）
        cc_type: '1', //抄送人类型 1=启动流程时指定 2=固定人选
        recipients: '', //抄送人 多个逗号隔开（传的是邮箱）
        transfer_mode: '2', //流转方式 1=自由选择 2= 下一步
        enable_revocation: '1', //是否可撤回 1=可撤回 0=不可撤回
        enable_opinion: '1' //是否填写意见  1=填写 0=不填写
      },
      {
        name: '',
        node_type: '5', //节点类型：5代表审批节点
        description: '',
        approve_type: '1', //审批模式 1=串签 2=并签 3=汇签
        approve_value: '', //汇签值 当approve_type=3 时该字段有效
        deadline_type: '1', //完成期限类型 1=无期限 2=启动流程时指定 3=固定天数
        deadline_value: '1', //完成期限值
        is_workday: '0',
        assignee_type: '2', //审批人类型 1=任何人 2=启动流程时指定 3=固定人选
        assignees: '', //审批人(id) 多个逗号隔开
        transfer_mode: '2', //流转方式 1=自由选择 2= 下一步
        enable_revocation: '1', //是否可撤回 1=可撤回 0=不可撤回
        enable_opinion: '1' //是否填写意见  1=填写 0=不填写
      }
    ]
  }
]

export const processEditDatasItemOneConstant = {
  name: '', //节点名称
  node_type: '1', //节点类型：1代表里程碑节点
  description: '',
  deadline_type: '1', //完成期限类型 1=无期限 2=启动流程时指定 3=固定天数
  deadline_value: '1', //完成期限值
  is_workday: '0',
  assignee_type: '1', //审批人类型 1=任何人 2=启动流程时指定 3=固定人选
  assignees: '', //审批人(id) 多个逗号隔开
  transfer_mode: '2', //流转方式 1=自由选择 2= 下一步
  enable_revocation: '1', //是否可撤回 1=可撤回 0=不可撤回
  enable_opinion: '1' //是否填写意见  1=填写 0=不填写
}

export const processEditDatasRecordsItemOneConstant = {
  node_type: '1',
  alltypedata: [
    {
      name: '', //节点名称
      node_type: '1', //节点类型：1代表里程碑节点
      description: '',
      deadline_type: '1', //完成期限类型 1=无期限 2=启动流程时指定 3=固定天数
      deadline_value: '1', //完成期限值
      is_workday: '0',
      assignee_type: '1', //审批人类型 1=任何人 2=启动流程时指定 3=固定人选
      assignees: '', //审批人(id) 多个逗号隔开
      transfer_mode: '2', //流转方式 1=自由选择 2= 下一步
      enable_revocation: '1', //是否可撤回 1=可撤回 0=不可撤回
      enable_opinion: '1' //是否填写意见  1=填写 0=不填写
    },
    {
      name: '',
      node_type: '2', //节点类型：2代表上传节点
      description: '',
      deadline_type: '1', //完成期限类型 1=无期限 2=启动流程时指定 3=固定天数
      deadline_value: '1', //完成期限值
      is_workday: '0',
      assignee_type: '1', //审批人类型 1=任何人 2=启动流程时指定 3=固定人选
      assignees: '', //审批人(id) 多个逗号隔开
      transfer_mode: '2', //流转方式 1=自由选择 2= 下一步
      enable_revocation: '1', //是否可撤回 1=可撤回 0=不可撤回
      enable_opinion: '1', //是否填写意见  1=填写 0=不填写
      require_data: {
        limit_file_num: '10', //限制文件上传数量 0=不限制
        limit_file_type: '1,2,3,4', //限制上传类型(文件格式)1=文档 2=图像 3=音频 4=视频
        limit_file_size: '20' //限制文件大小
      }
    },
    {
      name: '',
      node_type: '3', //节点类型：3代表填写节点
      description: '',
      deadline_type: '1', //完成期限类型 1=无期限 2=启动流程时指定 3=固定天数
      deadline_value: '1', //完成期限值
      is_workday: '0',
      assignee_type: '1', //审批人类型 1=任何人 2=启动流程时指定 3=固定人选
      assignees: '', //审批人(id) 多个逗号隔开
      transfer_mode: '2', //流转方式 1=自由选择 2= 下一步
      enable_revocation: '1', //是否可撤回 1=可撤回 0=不可撤回
      enable_opinion: '0', //是否填写意见  1=填写 0=不填写
      form_data: [
        {
          field_type: '1', //字段类型 1=输入框
          property_name: '', //属性名称(标题)输入框
          default_value: '', //默认值 默认值
          verification_rule: '', //校验规则 '' =不校验格式 mobile = 手机号码，tel = 座机，ID_card = 身份证号码，chinese_name = 中文名，url = 网址,qq = QQ号，postal_code = 邮政编码，positive_integer = 正整数，negative = 负数，two_decimal_places = 精确到两位小数
          val_length: '20', //长度
          is_required: '0' //是否必须 1=必须 0=不是必须
        },
        {
          field_type: '2', //字段类型 2=日期选择
          property_name: '', //属性名称(标题)日期选择
          default_value: '', //默认值 默认值
          verification_rule: 'SINGLE_DATE_TIME', //校验规则 单个+日期+时分 = SINGLE_DATE_TIME ,单个+日期 = SINGLE_DATE,多个+日期+时分 = MULTI_DATE_TIME ,多个+日期 = MULTI_DATE
          is_required: '1' //是否必须 1=必须 0=不是必须
        },
        {
          field_type: '3', //字段类型 3=下拉框
          property_name: '', //属性名称(标题) 下拉框
          default_value: '', //默认值(预设值)默认值
          verification_rule: 'redio', //校验规则 redio = 单选， multiple = 多选 ，province = 省市区
          is_required: '0', //是否必须 1=必须 0=不是必须
          options_data: []
        }
      ]
    },
    {
      name: '',
      node_type: '4', //节点类型：4代表抄送节点
      description: '',
      deadline_type: '1', //完成期限类型 1=无期限 2=启动流程时指定 3=固定天数
      deadline_value: '1', //完成期限值
      is_workday: '0',
      assignee_type: '1', //抄送人类型 2=启动流程时指定 3=固定人选
      assignees: '', //抄送人 多个逗号隔开（传的是邮箱）
      cc_type: '1', //抄送人类型 1=启动流程时指定 2=固定人选
      recipients: '', //抄送人 多个逗号隔开（传的是邮箱）
      transfer_mode: '2', //流转方式 1=自由选择 2= 下一步
      enable_revocation: '1', //是否可撤回 1=可撤回 0=不可撤回
      enable_opinion: '1' //是否填写意见  1=填写 0=不填写
    },
    {
      name: '',
      node_type: '5', //节点类型：5代表审批节点
      description: '',
      approve_type: '1', //审批模式 1=串签 2=并签 3=汇签
      approve_value: '', //汇签值 当approve_type=3 时该字段有效
      deadline_type: '1', //完成期限类型 1=无期限 2=启动流程时指定 3=固定天数
      deadline_value: '1', //完成期限值
      is_workday: '0',
      assignee_type: '2', //审批人类型 1=任何人 2=启动流程时指定 3=固定人选
      assignees: '', //审批人(id) 多个逗号隔开
      transfer_mode: '2', //流转方式 1=自由选择 2= 下一步
      enable_revocation: '1', //是否可撤回 1=可撤回 0=不可撤回
      enable_opinion: '1' //是否填写意见  1=填写 0=不填写
    }
  ]
}
