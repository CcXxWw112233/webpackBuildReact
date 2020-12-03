export const processEditDatasItemOneConstant = {
  node_type: '1', //流程节点类型 1=资料收集 2=审批 3=抄送
  name: '', //流程节点名称
  description: '', //描述 备注
  deadline_type: '1', //期限类型 1=不限制时间 2=限制时间
  deadline_time_type: '', //完成期限类型 hour = 时 day =天 month = 月
  deadline_value: '', //完成期限值
  assignee_type: '1', //审批人类型 1=任何人 2=指定人员
  assignees: '', //审批人 多个逗号隔开
  cc_type: '', //抄送人类型 1=设置抄送人 0=不设置抄送人
  cc_locking: '0', //抄送人锁定 1=锁定抄送人 0=不锁定抄送人
  recipients: '', //抄送人
  forms: [],
  is_confirm: '0', // 是否确认
  is_edit: '0' // 是否进入编辑
}

export const processEditDatasItemTwoConstant = {
  node_type: '2', //流程节点类型 1=资料收集 2=审批 3=抄送
  name: '', //流程节点名称
  description: '', //描述 备注
  approve_type: '1', //审批类型 1=串签 2=并签 3=汇签
  approve_value: '', // 当为 汇签时需填的值
  deadline_type: '1', //期限类型 1=不限制时间 2=限制时间
  deadline_time_type: '', //完成期限类型 hour = 时 day =天 month = 月
  deadline_value: '', //完成期限值
  assignees: '', //审批人 多个逗号隔开
  cc_type: '', //抄送人类型 1=设置抄送人 0=不设置抄送人
  cc_locking: '0', //抄送人锁定 1=锁定抄送人 0=不锁定抄送人
  recipients: '', //抄送人
  is_confirm: '0',
  is_edit: '0' // 是否进入编辑
}

export const processEditDatasItemThreeConstant = {
  node_type: '3', //流程节点类型 1=资料收集 2=审批 3=抄送
  name: '', //流程节点名称
  description: '', //描述 备注
  deadline_type: '1', // 期限类型 1=不限制时间 2=限制时间
  deadline_time_type: '', //完成期限类型 hour = 时 day =天 month = 月
  deadline_value: '', //完成期限值
  cc_type: '', //抄送人类型 1=自动抄送 2=手动抄送
  cc_locking: '0',
  recipients: '', //抄送人 多个逗号隔开
  assignees: '', //抄报人 多个逗号隔开
  enable_weight: '0', // 是否开启权重
  score_node_set: {
    count_type: '1', // 计算方式
    result_condition_type: '4', // 结果分数选项
    result_value: '60', // 结果分数值
    result_case_pass: '2', // 结果分数导向
    result_case_other: '1', // 其余情况
    score_locked: '0', // 锁定评分人 1=锁定评分人 0=不锁定
    score_display: '1' // 锁定评分人 1=评分时互相可见 0=不可见
  }, // 评分相关参数
  score_items: [
    {
      key: '0',
      title: '评分项', //标题
      max_score: '100', //最大分值
      description: '', //描述
      weight_ratio: '100' //权重占比
    }
  ], // 评分项
  is_confirm: '0',
  is_edit: '0' // 是否进入编辑
}

// 假数据

export const principalList = [
  {
    user_id: '1207501040593801216',
    name: 'rabbitQi',
    avatar:
      'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2020-01-09/43f14b585cff4de2ae18d23555e72192.jpeg'
  },
  {
    user_id: '1195311878813913088',
    name: '一只加菲吖',
    avatar:
      'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-11-22/293c32e5af584288a238cc58d1c6a66f.jpg'
  },

  {
    user_id: '1158204054019641344',
    name: '加菲猫',
    avatar:
      'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2020-01-10/4e5a59a2afad4c79a11429bd1771c12c.jpg'
  }
]

// 表格数据
export const tableList = [
  {
    key: '0',
    title: '标题1',
    weight_ratio: '',
    max_score: '',
    description: ''
  },
  {
    key: '1',
    title: '标题2',
    weight_ratio: '',
    max_score: '',
    description: ''
  }
]

// 评分人列表
export const ratingsList = [
  {
    passed: '2',
    user_id: '1195311878813913088',
    name: '一只加菲吖',
    avatar:
      'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-11-22/293c32e5af584288a238cc58d1c6a66f.jpg',
    suggestion: '符合报销流程',
    create_time: '1584582196000',
    ratingDetail: [
      {
        key: '0',
        title: '评分项',
        weight_ratio: '100',
        max_score: '100',
        description: '楼下老爷爷'
      }
    ]
  }
]
