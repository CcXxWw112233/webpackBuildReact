export const date_area_height = 64
export const task_item_height = 26 //进度条高度
export const task_item_height_fold = 24 //进度条高度（折叠后）
export const task_item_margin_top = 12 //任务条margin-top
export const ceil_height = task_item_height + task_item_margin_top // task_item_height + task_item_margin_top 单元格高度
export const ceil_height_fold = 24 //折叠的单元格高度
export const hours_view_total = 9 //时视图一天的工作时常 9：00 - 17：59
export const hours_view_start_work_oclock = 9 //时间视图开始上班几点
export const hours_view_due_work_oclock =
  hours_view_total + hours_view_start_work_oclock //时间视图开始上班几点

export const group_rows_fold = 4 //进度汇总折叠后行数
export const ceil_width = 34 // 默认单元格宽度 （月视图）
export const ceil_width_year = 3 //年试图下的单元格宽度
export const ceil_width_week = 12 //周视图单元格宽度
export const ceil_width_hours = 22 //年试图下的单元格宽度

export const one_group_row_total = 4 //默认分组行数
export const gantt_panel_left_diff = 20 //80 //鼠标移动和拖拽的修正位置
export const gantt_head_width_init = 280 //甘特图头部默认宽度
// export const gantt_panel_left_diff = 20 //左边遮罩误差
export const ganttIsFold = ({
  group_view_type,
  gantt_board_id,
  show_board_fold,
  gantt_view_mode
}) => {
  //gantt是否折叠

  if (
    gantt_board_id == '0' &&
    gantt_view_mode == 'year' &&
    group_view_type == '1'
  ) {
    return true
  }

  return false

  if (gantt_board_id != '0') return false
  if (gantt_view_mode == 'year' && group_view_type != '4') {
    //年视图的分组视图下
    return true
  }
  if (
    group_view_type == '1' &&
    //  && gantt_board_id == '0'
    show_board_fold
  ) {
    return true
  } else {
    return false
  }
}
//是否单个项目下分组视图
export const ganttIsSingleBoardGroupView = ({
  gantt_board_id,
  group_view_type
}) => {
  return gantt_board_id && gantt_board_id != '0' && group_view_type == '1'
}
// 甘特图是否大纲视图
export const ganttIsOutlineView = ({ group_view_type }) => {
  //gantt是否折叠
  if (group_view_type == '4') {
    return true
  }
  return false
}
// 转义时间
export const getDigitTime = timestamp => {
  if (!timestamp) {
    return 0
  }
  let new_timestamp = timestamp.toString()
  if (new_timestamp.length == 10) {
    new_timestamp = Number(new_timestamp) * 1000
  } else {
    new_timestamp = Number(new_timestamp)
  }
  return new_timestamp
}

export const test_card_item = [
  {
    id: '1232147328316608510',
    name: '测试用的',
    board_id: '1230737131983474688',
    user_id: '1192753179570343936',
    is_deleted: '0',
    // start_time: "1580400000",
    // due_time: "1580659140",
    is_realize: '0',
    is_archived: '0',
    id_list: ['1192753179570343936'],
    type: '0',
    is_privilege: '0',
    label_data: []
  },
  {
    id: '1232147328316608511',
    name: '测试用的2',
    board_id: '1230737131983474688',
    user_id: '1192753179570343936',
    is_deleted: '0',
    // start_time: "1580400000",
    // due_time: "1580659140",
    time_span: 4,
    is_realize: '0',
    is_archived: '0',
    id_list: ['1192753179570343936'],
    type: '0',
    is_privilege: '0',
    label_data: []
  }
]
export const visual_add_item = {
  id: '',
  name: '',
  tree_type: '0',
  is_expand: false,
  parent_expand: true,
  add_id: 'add_milestone', //0表示创建里程碑，其他地创建add_id归纳到父级id
  children: [],
  editing: false,
  due_time: '',
  start_time: ''
}

const list_group = [
  //大分组
  {
    lane_data: {
      //原始数据
      card_no_times: [],
      cards: [
        {
          id: '',
          is_open: false
        }
      ]
    },
    outline_tree: {}, //转化后的树
    list_data: [] //转化后的数组，用于渲染中间部分任务条
  }
]

export const mock_gantt_data = [
  {
    is_privilege: '0',
    privileges: [],
    privileges_extend: [],
    lane_id: '1230737131983474688',
    org_id: '1192754064144863232',
    lane_name: '二百五',
    lane_data: {
      card_no_times: [],
      cards: [
        {
          id: '1232136407703752704',
          name: '1',
          board_id: '1230737131983474688',
          user_id: '1192753179570343936',
          is_deleted: '0',
          start_time: '1580227200',
          due_time: '1580399940',
          is_realize: '0',
          is_archived: '0',
          id_list: ['1192753179570343936'],
          type: '0',
          is_privilege: '0',
          label_data: [],
          executors: [
            {
              id: '1192753179570343936',
              name: '15289749459',
              avatar:
                'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-12-06/037ff1e467e64f658c4f2fbeaa40d5a4.jpg',
              mobile: '15289749459',
              user_id: '1192753179570343936',
              full_name: '15289749459'
            }
          ]
        },
        {
          id: '1232136421758865408',
          name: '2',
          board_id: '1230737131983474688',
          user_id: '1192753179570343936',
          is_deleted: '0',
          start_time: '1580313600',
          due_time: '1580572740',
          is_realize: '0',
          is_archived: '0',
          id_list: ['1192753179570343936'],
          type: '0',
          is_privilege: '0',
          label_data: [],
          executors: [
            {
              id: '1192753179570343936',
              name: '15289749459',
              avatar:
                'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-12-06/037ff1e467e64f658c4f2fbeaa40d5a4.jpg',
              mobile: '15289749459',
              user_id: '1192753179570343936',
              full_name: '15289749459'
            }
          ]
        },
        {
          id: '1232136434815733760',
          name: '3',
          board_id: '1230737131983474688',
          user_id: '1192753179570343936',
          is_deleted: '0',
          start_time: '1580400000',
          due_time: '1580572740',
          is_realize: '0',
          is_archived: '0',
          id_list: ['1192753179570343936'],
          type: '0',
          is_privilege: '0',
          label_data: [],
          executors: [
            {
              id: '1192753179570343936',
              name: '15289749459',
              avatar:
                'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-12-06/037ff1e467e64f658c4f2fbeaa40d5a4.jpg',
              mobile: '15289749459',
              user_id: '1192753179570343936',
              full_name: '15289749459'
            }
          ]
        },
        {
          id: '1232136407703752704-1',
          parent_id: '1232136407703752704',
          name: '1-1',
          board_id: '1230737131983474688',
          user_id: '1192753179570343936',
          is_deleted: '0',
          start_time: '1580227200',
          due_time: '1580399940',
          is_realize: '0',
          is_archived: '0',
          id_list: ['1192753179570343936'],
          type: '0',
          is_privilege: '0',
          label_data: [],
          executors: [
            {
              id: '1192753179570343936',
              name: '15289749459',
              avatar:
                'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-12-06/037ff1e467e64f658c4f2fbeaa40d5a4.jpg',
              mobile: '15289749459',
              user_id: '1192753179570343936',
              full_name: '15289749459'
            }
          ]
        },
        {
          id: '1232136421758865408-1',
          parent_id: '1232136421758865408',
          name: '2-1',
          board_id: '1230737131983474688',
          user_id: '1192753179570343936',
          is_deleted: '0',
          start_time: '1580313600',
          due_time: '1580572740',
          is_realize: '0',
          is_archived: '0',
          id_list: ['1192753179570343936'],
          type: '0',
          is_privilege: '0',
          label_data: [],
          executors: [
            {
              id: '1192753179570343936',
              name: '15289749459',
              avatar:
                'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-12-06/037ff1e467e64f658c4f2fbeaa40d5a4.jpg',
              mobile: '15289749459',
              user_id: '1192753179570343936',
              full_name: '15289749459'
            }
          ]
        },
        {
          id: '1232136421758865408-2',
          parent_id: '1232136421758865408',
          name: '2-2',
          board_id: '1230737131983474688',
          user_id: '1192753179570343936',
          is_deleted: '0',
          is_realize: '0',
          is_archived: '0',
          id_list: ['1192753179570343936'],
          type: '0',
          is_privilege: '0',
          label_data: [],
          executors: [
            {
              id: '1192753179570343936',
              name: '15289749459',
              avatar:
                'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-12-06/037ff1e467e64f658c4f2fbeaa40d5a4.jpg',
              mobile: '15289749459',
              user_id: '1192753179570343936',
              full_name: '15289749459'
            }
          ]
        },
        {
          id: '1232136421758865408-3',
          parent_id: '1232136421758865408',
          name: '2-3',
          time_span: 4,
          board_id: '1230737131983474688',
          user_id: '1192753179570343936',
          is_deleted: '0',
          is_realize: '0',
          is_archived: '0',
          id_list: ['1192753179570343936'],
          type: '0',
          is_privilege: '0',
          label_data: [],
          executors: [
            {
              id: '1192753179570343936',
              name: '15289749459',
              avatar:
                'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-12-06/037ff1e467e64f658c4f2fbeaa40d5a4.jpg',
              mobile: '15289749459',
              user_id: '1192753179570343936',
              full_name: '15289749459'
            }
          ]
        }
      ],
      milestones: {}
    },
    create_by: {
      id: '1192753179570343936',
      name: '15289749459',
      avatar:
        'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-12-06/037ff1e467e64f658c4f2fbeaa40d5a4.jpg',
      mobile: '15289749459',
      user_id: '1192753179570343936',
      full_name: '15289749459'
    },
    is_star: '0',
    is_create: '1',
    lane_start_time: '1575820800',
    lane_end_time: '1580572740',
    lane_status: '3',
    lane_schedule_count: '5',
    lane_overdue_count: '5'
  },
  {
    is_privilege: '0',
    privileges: [],
    privileges_extend: [],
    lane_id: '1211852835822637056',
    org_id: '1192754064144863232',
    lane_name: '9',
    lane_data: {
      card_no_times: [],
      cards: [
        {
          id: '1230475055197196288',
          name: 'wedr',
          board_id: '1211852835822637056',
          user_id: '1192753179570343936',
          is_deleted: '0',
          start_time: '1581523200',
          due_time: '1581868740',
          is_realize: '0',
          is_archived: '0',
          id_list: ['1192753179570343936'],
          type: '0',
          is_privilege: '0',
          label_data: [],
          executors: [
            {
              id: '1192753179570343936',
              name: '15289749459',
              avatar:
                'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-12-06/037ff1e467e64f658c4f2fbeaa40d5a4.jpg',
              mobile: '15289749459',
              user_id: '1192753179570343936',
              full_name: '15289749459'
            }
          ]
        }
      ],
      milestones: {}
    },
    create_by: {
      id: '1192753179570343936',
      name: '15289749459',
      avatar:
        'https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-12-06/037ff1e467e64f658c4f2fbeaa40d5a4.jpg',
      mobile: '15289749459',
      user_id: '1192753179570343936',
      full_name: '15289749459'
    },
    is_star: '0',
    is_create: '1',
    lane_start_time: '1575820800',
    lane_end_time: '1581868740',
    lane_status: '3',
    lane_schedule_count: '3',
    lane_overdue_count: '3'
  }
]

export const mock_outline_tree = [
  {
    id: '1210106992631353344',
    name: '第一阶段里程碑',
    tree_type: '1',
    due_time: '',
    time_span: '',
    is_expand: true,
    executors: [],
    children: [
      {
        id: '1233704541829074944',
        name: 'qew',
        tree_type: '2',
        start_time: '1582214400',
        due_time: '1582473540',
        time_span: '',
        is_expand: true,
        executors: [],
        board_id: '1218406760604372992',
        children: [
          {
            id: '1218452431097171968',
            name: 'sda',
            tree_type: '3',
            start_time: '',
            due_time: '',
            time_span: '',
            executors: []
          }
        ]
      },
      {
        id: '111-1-2',
        name: '一级任务2',
        tree_type: '2',
        start_time: '',
        due_time: '',
        time_span: '',
        is_expand: true,
        executors: []
      }
    ]
  },
  {
    id: '222',
    name: '里程碑2',
    tree_type: '1',
    start_time: '1580227200',
    due_time: '1580961676',
    time_span: '',
    is_expand: true,
    executors: [],
    children: [
      {
        id: '222-1',
        name: '2一级任务',
        tree_type: '2',
        start_time: '1580227200',
        due_time: '1580399940',
        time_span: '',
        is_expand: true,
        executors: [],
        children: [
          {
            id: '222-2',
            name: '2二级任务',
            tree_type: '3',
            start_time: '1580227200',
            due_time: '1580399940',
            time_span: '',
            executors: []
          }
        ]
      }
    ]
  },
  {
    id: '333',
    name: '无归属任务',
    tree_type: '2',
    children: [],
    is_expand: true
  },
  {
    id: '222333',
    name: '里程碑3',
    tree_type: '1',
    start_time: '1580227200',
    due_time: '1580961676',
    time_span: '',
    is_expand: true,
    executors: [],
    children: []
  }
]
