import {
  addCardRely,
  deleteCardRely,
  updateCardRely,
  getCardRelys
} from '../../../../services/technological/task'
import {
  saveGanttOutlineSort,
  getGanttGroupElseInfo,
  getBaseLineInfoData,
  getBaseLineList,
  createBaseLine,
  EditBaseLine,
  DeleteBaseLine,
  getGanttTableItem,
  setGanttTableItem
} from '../../../../services/technological/gantt'
import { isApiResponseOk } from '../../../../utils/handleResponseData'
import { getModelSelectDatasState } from '../../../utils'
import { message } from 'antd'
import OutlineTree from '@/routes/Technological/components/Gantt/components/OutlineTree'
import { getProcessTemplateList } from '../../../../services/technological/workFlow'
import {
  ganttIsOutlineView,
  gantt_head_width_init
} from '../../../../routes/Technological/components/Gantt/constants'
import {
  workbench_start_date,
  workbench_end_date,
  workbench_ceilWidth,
  workbench_date_arr_one_level
} from '../selects'
import {
  setGantTimeSpan,
  setHourViewCardTimeSpan
} from '../../../../routes/Technological/components/Gantt/ganttBusiness'
// import { delayInGenerator } from "../../../../utils/util"
import { formatItem } from './gantt_utils'
import { delayInGenerator } from '../../../../utils/util'
import { getTreeNodeValue } from './gantt_utils'
// F:\work\newdicolla-platform\src\routes\Technological\components\Gantt\components\OutlineTree\index.js
const is_schedule = (start_time, due_time) => {
  if (
    (!!start_time && !!Number(start_time)) ||
    (!!due_time && !!Number(due_time))
  ) {
    return true
  }
  return false
}
export default {
  state: {
    gantt_head_width: gantt_head_width_init,
    rely_map: [],
    proccess_templates: [],
    triggle_request_board_template: false, //大纲视图保存为项目模板后，触发为true，右边模板列表接收到变化会触发查询
    drag_outline_node: { id: '', parent_id: '', parent_ids: [] }, //大纲拖拽排序所需要的信息
    outline_node_draging: false, //大纲是否拖拽排序中
    selected_card_visible: false, //查看任务抽屉
    uploading_folder_id: '', //任务详情上传文件的文件id, 下方抽屉在上传后判断文件夹id进行更新
    notification_todos: {}, //[id:{code:'', message: ''}]，当更新任务时间后，由于任务列表的key是根据id_start_time duetime等多个属性设置，会重新didmount导致之前操作丢失，用来存放待办
    baseLine_datas: [], // 基线的版本数据
    active_baseline_data: {}, // 基线的版本详情
    show_base_line_mode: false, // 是否进入基线状态
    active_baseline: {}, // 基线版本
    miletone_detail_modal_visible: false, //显示里程碑详情弹窗
    outline_setting_msg: {} // 大纲视图设置项
  },
  effects: {
    *addCardRely({ payload = {} }, { select, call, put }) {
      const { from_id, to_id, relation } = payload
      let res = yield call(addCardRely, { from_id, to_id, relation })
      const rely_map = yield select(
        getModelSelectDatasState('gantt', 'rely_map')
      )
      const group_view_type = yield select(
        getModelSelectDatasState('gantt', 'group_view_type')
      )
      const gantt_board_id = yield select(
        getModelSelectDatasState('gantt', 'gantt_board_id')
      )
      let _rely_map = JSON.parse(JSON.stringify(rely_map))
      if (isApiResponseOk(res)) {
        message.success('已成功添加依赖')
        // 只有在分组视图和大纲视图下 才需要更新
        if (
          (group_view_type == '1' && gantt_board_id != '0') ||
          group_view_type == '4'
        ) {
          const index = _rely_map.findIndex(item => item.id == from_id)
          if (index != -1) {
            //该任务存在和其它的依赖关系则添加新的一条进next [], 反之构建一个新的item
            _rely_map[index].next.push({ id: to_id, relation })
          } else {
            _rely_map.push({ id: from_id, next: [{ id: to_id, relation }] })
          }
          yield put({
            type: 'updateDatas',
            payload: {
              rely_map: _rely_map
            }
          })
          const updateAction = ganttIsOutlineView({ group_view_type })
            ? 'updateOutLineTree'
            : 'updateListGroup'
          yield put({
            type: updateAction,
            payload: {
              datas: res.data
            }
          })
        }
      } else {
        message.error(res.message)
      }
      return res || {}
    },
    *deleteCardRely({ payload }, { select, call, put }) {
      const { move_id, line_id } = payload
      const res = yield call(deleteCardRely, {
        from_id: move_id,
        to_id: line_id
      })
      const rely_map = yield select(
        getModelSelectDatasState('gantt', 'rely_map')
      )

      if (isApiResponseOk(res)) {
        message.success('已成功删除依赖')
        let _re_rely_map = JSON.parse(JSON.stringify(rely_map))
        const move_index = rely_map.findIndex(item => item.id == move_id) //起始点索引
        if (move_index == -1) return res || {}
        const move_item = rely_map.find(item => item.id == move_id) //起始点这一项
        const move_next = move_item.next //起始点所包含的全部终点信息
        const line_index = move_next.findIndex(item => item.id == line_id)
        if (move_next.length > 1) {
          _re_rely_map[move_index].next.splice(line_index, 1)
        } else {
          _re_rely_map.splice(move_index, 1)
        }
        yield put({
          type: 'updateDatas',
          payload: {
            rely_map: _re_rely_map
          }
        })
      } else {
        message.error(res.message)
      }
      return res || {}
    },
    *updateCardRely({ payload }, { select, call, put }) {
      const rely_map = yield select(
        getModelSelectDatasState('gantt', 'rely_map')
      )
      const { from_id, to_id, ...update_prop } = payload
      let res = yield call(updateCardRely, payload)
      if (isApiResponseOk(res)) {
        let _re_rely_map = JSON.parse(JSON.stringify(rely_map))
        const move_index = rely_map.findIndex(item => item.id == from_id) //起始点索引
        const move_item = rely_map.find(item => item.id == from_id) //起始点这一项
        const move_next = move_item.next //起始点所包含的全部终点信息
        const line_index = move_next.findIndex(item => item.id == to_id)
        if (typeof update_prop == 'object') {
          for (let key in update_prop) {
            _re_rely_map[move_index].next[line_index][key] = update_prop[key] //更新赋值
          }
        }
        yield put({
          type: 'updateDatas',
          payload: {
            rely_map: _re_rely_map
          }
        })
      } else {
      }
    },
    *getCardRelys({ payload = {} }, { select, call, put }) {
      const gantt_board_id = yield select(
        getModelSelectDatasState('gantt', 'gantt_board_id')
      )
      const _organization_id = localStorage.getItem('OrganizationId')

      const res = yield call(getCardRelys, {
        board_id: gantt_board_id,
        _organization_id
      })
      if (gantt_board_id == '0') {
        yield put({
          type: 'updateDatas',
          payload: {
            rely_map: []
          }
        })
        return
      }
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            rely_map: res.data
          }
        })
      } else {
      }
    },
    // 获取分组头部的其它信息（百分比进度，人员）
    *getGanttGroupElseInfo({ payload = {} }, { select, call, put }) {
      const { list_id } = payload
      const gantt_board_id = yield select(
        getModelSelectDatasState('gantt', 'gantt_board_id')
      )
      let current_list_group_id = yield select(
        getModelSelectDatasState('gantt', 'current_list_group_id')
      )
      if (!!list_id) {
        current_list_group_id = list_id
      }
      const list_group = yield select(
        getModelSelectDatasState('gantt', 'list_group')
      )
      const index = list_group.findIndex(
        item => item.list_id == current_list_group_id
      )
      if (index == -1) return list_group
      let params = {}
      if (gantt_board_id == '0') {
        params = {
          board_id: current_list_group_id
        }
      } else {
        params = {
          board_id: gantt_board_id,
          list_id: current_list_group_id
        }
      }
      const res = yield call(getGanttGroupElseInfo, { ...params })
      if (isApiResponseOk(res)) {
        for (let key in res.data) {
          list_group[index][key] = res.data[key]
        }
      }
      return list_group
    },
    // 分组视图下跟新任务
    *updateListGroup({ payload = {} }, { select, call, put }) {
      // return
      // datas = [
      //     { id: '1266250771897389056', start_time: '1589990400', due_time: '1590768000' },
      //     { id: '1266250784136368128', start_time: '1590595200', due_time: '1590854400' }
      // ]

      const { datas = [], origin_list_group } = payload
      // 获取影响数据
      const influenceDatas = datas.scope_content ? datas.scope_content : datas
      // 获取依赖数据
      const dependencyDatas = datas.scope_dependency || {}
      if (!!(dependencyDatas && Object.keys(dependencyDatas).length)) {
        // 表示如果依赖项存在, 则 表示需要删除依赖
        const move_id = dependencyDatas.id || ''
        const line_id =
          dependencyDatas['next'] &&
          dependencyDatas['next'][0] &&
          dependencyDatas['next'][0].id
        if (!move_id || !line_id) return
        yield put({
          type: 'deleteCardRely',
          payload: {
            move_id,
            line_id
          }
        })
      }
      const list_group = yield select(
        getModelSelectDatasState('gantt', 'list_group')
      )
      let list_group_new =
        Object.prototype.toString.call(origin_list_group) == '[object Array]'
          ? origin_list_group
          : [...list_group]
      const Aa = yield put({
        type: 'getGanttGroupElseInfo'
      })
      const transform_list_group = () =>
        new Promise(resolve => {
          resolve(Aa.then())
        })
      list_group_new = yield call(transform_list_group) || list_group_new
      for (let val of influenceDatas) {
        const has_time = is_schedule(val.start_time, val.due_time) //存在时间
        for (let val2 of list_group_new) {
          const card_index = val2.lane_data.cards.findIndex(
            item => item.id == val.id
          ) //所在排期的索引
          const card_no_time_index = val2.lane_data.card_no_times.findIndex(
            item => item.id == val.id
          ) //所在未排期的索引
          let card_item = {} //存储该条数据
          if (card_index != -1) {
            //如果在已排期的列表中找到了
            card_item =
              val2.lane_data.cards.find(item => item.id == val.id) || {}
            if (has_time) {
              //如果返回的结果存在时间，则操作已排期列表
              val2.lane_data.cards[card_index] = { ...card_item, ...val }
            } else {
              //如果返回的结果不存在时间，则将该条任务从已排期挪到未排期
              val2.lane_data.cards.splice(card_index, 1)
              val2.lane_data.card_no_times.push({ ...card_item, ...val })
            }
            continue
          }
          if (card_no_time_index != -1) {
            //如果在未排期的列表中找到了
            card_item =
              val2.lane_data.card_no_times.find(item => item.id == val.id) || {}
            if (has_time) {
              //如果返回的结果存在时间，则将该条任务挪到已排期排期列表
              val2.lane_data.card_no_times.splice(card_no_time_index, 1)
              val2.lane_data.cards.push({ ...card_item, ...val })
            } else {
              //没有时间，就操作当前未排期
              val2.lane_data.card_no_times[card_no_time_index] = {
                ...card_item,
                ...val
              }
            }
            continue
          }
        }
      }
      yield put({
        type: 'gantt/handleListGroup',
        payload: {
          data: list_group_new
        }
      })
    },
    // // 分组视图下跟新任务
    // * updateListGroup({ payload = {} }, { select, call, put }) {
    //     // return
    //     // datas = [
    //     //     { id: '1266250771897389056', start_time: '1589990400', due_time: '1590768000' },
    //     //     { id: '1266250784136368128', start_time: '1590595200', due_time: '1590854400' }
    //     // ]

    //     const { datas = [], origin_list_group } = payload
    //     const list_group = yield select(getModelSelectDatasState('gantt', 'list_group'))
    //     const list_group_new = Object.prototype.toString.call(origin_list_group) == '[object Array]' ? origin_list_group : [...list_group]
    //     for (let val of datas) {
    //         for (let val2 of list_group_new) {
    //             const card_index = val2.lane_data.cards.findIndex(item => item.id == val.id)
    //             const card_item = val2.lane_data.cards.find(item => item.id == val.id)
    //             if (card_index != -1) {
    //                 val2.lane_data.cards[card_index] = { ...card_item, ...val }
    //                 // break
    //             }
    //         }
    //     }
    //     yield put({
    //         type: 'gantt/handleListGroup',
    //         payload: {
    //             data: list_group_new
    //         }
    //     })

    // },
    // 更新分组下未排期任务 (对未排期的任务进行拖拽 设置时间)
    *updateGroupListWithCardsNoTime({ payload = {} }, { select, call, put }) {
      const {
        datas = [],
        drop_group_id,
        original_group_id = '0',
        card_id,
        updateData = {},
        origin_list_group
      } = payload
      const list_group = yield select(
        getModelSelectDatasState('gantt', 'list_group')
      )
      const list_group_new =
        Object.prototype.toString.call(origin_list_group) == '[object Array]'
          ? origin_list_group
          : [...list_group]
      // 1. 找到下落的分组列表
      const group_drop_index = list_group_new.findIndex(
        item => item.lane_id == drop_group_id
      )
      // 2. 找到当前未排期任务原始所在的分组列表
      const group_original_index = list_group_new.findIndex(
        item => item.lane_id == original_group_id
      )
      // 3. 从当前原始的分组中找到当前这条未排期的任务
      const group_index_cards_index = list_group_new[
        group_original_index
      ].lane_data.card_no_times.findIndex(item => item.id == updateData.id)
      // 4. 取出这条任务 （保存一下数据）
      let group_index_cards_item =
        list_group_new[group_original_index].lane_data.card_no_times[
          group_index_cards_index
        ]
      // 5. 取出的这条任务需要进行更新
      group_index_cards_item = {
        ...group_index_cards_item,
        ...updateData
      }
      // 6. 将这条任务添加至已排期的任务中 （下落的分组中添加）
      list_group_new[group_drop_index].lane_data.cards.push(
        group_index_cards_item
      )
      // 7. 将这条任务从原始未排期中移除
      list_group_new[group_original_index].lane_data.card_no_times.splice(
        group_index_cards_index,
        1
      )
      yield put({
        type: 'updateListGroup',
        payload: {
          datas,
          origin_list_group: list_group_new
        }
      })
    },

    *updateOutLineTree({ payload = {} }, { select, call, put }) {
      const { datas = [] } = payload
      // 获取影响数据
      const influenceDatas = datas.scope_content ? datas.scope_content : datas
      // 获取依赖数据
      const dependencyDatas = datas.scope_dependency || {}
      if (!!(dependencyDatas && Object.keys(dependencyDatas).length)) {
        // 表示如果依赖项存在, 则 表示需要删除依赖
        const move_id = dependencyDatas.id || ''
        const line_id =
          dependencyDatas['next'] &&
          dependencyDatas['next'][0] &&
          dependencyDatas['next'][0].id
        if (!move_id || !line_id) return
        yield put({
          type: 'deleteCardRely',
          payload: {
            move_id,
            line_id
          }
        })
      }
      let outline_tree = yield select(
        getModelSelectDatasState('gantt', 'outline_tree')
      )
      let outline_tree_ = JSON.parse(JSON.stringify(outline_tree))
      const mapSetProto = (data, nodeValue) => {
        Object.keys(data).map(item => {
          nodeValue[item] = data[item]
        })
        // 为了避免删除开始时间后，关闭弹窗再删除截至时间，大纲树结构item的time覆盖问题
        // if (!data.start_time) nodeValue['start_time'] = ''
        // if (!data.due_time) nodeValue['due_time'] = ''
      }
      for (let val of influenceDatas) {
        const nodeValue = OutlineTree.getTreeNodeValueByName(
          outline_tree_,
          'id',
          val.id
        )
        if (nodeValue) {
          mapSetProto(val, nodeValue)
          continue
        }
      }
      yield put({
        type: 'handleOutLineTreeData',
        payload: {
          data: outline_tree_
        }
      })
    },
    *getProcessTemplateList({ payload = {} }, { select, call, put }) {
      const res = yield call(getProcessTemplateList, {
        _organization_id: localStorage.getItem('OrganizationId')
      })
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            proccess_templates: res.data
          }
        })
      } else {
      }
    },
    // 保存大纲视图的相对位置
    *saveGanttOutlineSort({ payload = {} }, { select, call, put }) {
      const { outline_tree = [] } = payload
      const gantt_board_id = yield select(
        getModelSelectDatasState('gantt', 'gantt_board_id')
      )
      const outline_tree_ = yield select(
        getModelSelectDatasState('gantt', 'outline_tree')
      )
      const data = outline_tree || outline_tree_
      let content_ids = []
      const mapGetContentId = arr => {
        for (let val of arr) {
          const { children = [], id } = val
          if (id) {
            content_ids.push(id)
          }
          if (children.length) {
            mapGetContentId(children)
          }
        }
      }
      mapGetContentId(data)
      const res = yield call(saveGanttOutlineSort, {
        content_ids,
        board_id: gantt_board_id
      })
    },
    // 获取大纲某个节点
    *getOutlineNode({ payload = {} }, { select, call, put }) {
      const { outline_tree = [], id } = payload
      const outline_tree_ = yield select(
        getModelSelectDatasState('gantt', 'outline_tree')
      )
      const data = outline_tree.length ? outline_tree : outline_tree_
      const node = getTreeNodeValue(data, id)
      // console.log('sssssssss_find', { node, outline_tree, id })
      return node
    },
    // 更新大纲视图下对应节点变化
    *updateOutLineTreeNode({ payload = {} }, { select, call, put }) {
      const { id: milestone_id, card_id } = payload
      const group_view_type = yield select(
        getModelSelectDatasState('gantt', 'group_view_type')
      )
      if (group_view_type != '4') return
      let outline_tree = yield select(
        getModelSelectDatasState('gantt', 'outline_tree')
      )
      let outline_tree_ = JSON.parse(JSON.stringify(outline_tree))
      // 1. 找到当前操作的节点
      const current_node = getTreeNodeValue(outline_tree_, card_id)
      // 2. 从当前节点找出父节点
      const from_parent_id = current_node.parent_id
      const parent_from_node = getTreeNodeValue(outline_tree_, from_parent_id)
      const parent_to_node = getTreeNodeValue(outline_tree_, milestone_id)
      if (parent_from_node) {
        //删除该条
        parent_from_node.children = parent_from_node.children.filter(
          item => item.id != card_id
        )
      } else {
        outline_tree_ = outline_tree_.filter(item => item.id != card_id)
      }
      if (!milestone_id) {
        // 表示将其添加至树末尾
        outline_tree_.push({
          ...current_node,
          parent_id: '',
          parent_milestone_id: ''
        })
      } else {
        if (parent_to_node) {
          //将该条移动到指定里程碑之下
          parent_to_node.children.push(current_node)
        }
      }
      yield put({
        type: 'handleOutLineTreeData',
        payload: {
          data: outline_tree_
        }
      })
    },
    // 针对侧边任务详情更新对应数据
    *updateCardDetailDrawer({ payload = {} }, { select, call, put }) {
      const { action, board_id, card_id, calback } = payload
      const selected_card_visible = yield select(
        getModelSelectDatasState('gantt', 'selected_card_visible')
      )
      if (!selected_card_visible) return
      const group_view_type = yield select(
        getModelSelectDatasState('gantt', 'group_view_type')
      )
      const gantt_board_id = yield select(
        getModelSelectDatasState('gantt', 'gantt_board_id')
      )
      switch (action) {
        case 'update_lcb': // 表示操作里程碑后 需要同步任务详情中里程碑的变化
          yield put({
            type: 'publicTaskDetailModal/getMilestoneList',
            payload: {
              id: board_id || gantt_board_id
            }
          })
          break
        case 'update_card_detail': // 表示更新任务详情 (暂时调用任务详情接口 不做数据的增删改)
          yield put({
            type: 'publicTaskDetailModal/getCardWithAttributesDetail',
            payload: {
              id: card_id
            }
          })
          break
        default:
          break
      }
      if (calback && typeof calback == 'function') calback()
    },
    // 获取基线数据列表
    *getBaseLineList({ payload = {} }, { select, call, put }) {
      const gantt_board_id = yield select(
        getModelSelectDatasState('gantt', 'gantt_board_id')
      )
      // console.log('加载中')
      let res = yield call(getBaseLineList, { board_id: gantt_board_id })
      yield put({
        type: 'updateDatas',
        payload: {
          baseLine_datas: res.data
        }
      })
      return res
    },
    // 添加基线数据
    *addBaseLineData({ payload = {} }, { select, call, put }) {
      let data = payload.data
      const gantt_board_id = yield select(
        getModelSelectDatasState('gantt', 'gantt_board_id')
      )
      let res = yield call(createBaseLine, {
        board_id: gantt_board_id,
        name: data.name
      })
      yield put({
        type: 'updateDatas',
        payload: {
          baseLine_datas: res.data
        }
      })
      return res
    },
    // 删除一个基线列表
    *deleteBaseLineData({ payload = {} }, { select, call, put }) {
      let id = payload.id
      let list = [
        ...(yield select(getModelSelectDatasState('gantt', 'baseLine_datas')))
      ]
      let active = yield select(
        getModelSelectDatasState('gantt', 'active_baseline')
      )
      let res = yield call(DeleteBaseLine, { id: id })
      if (id) {
        list = list.filter(item => item.id !== id)
      }
      // 如果删除的是正在查看的，则退出基线查看
      if (id === active.id) {
        yield put({
          type: 'exitBaseLineInfoView'
        })
      }
      yield put({
        type: 'updateDatas',
        payload: {
          baseLine_datas: list
        }
      })
      return res
    },
    // 修改基线名称
    *updateBaseLine({ payload = {} }, { select, call, put }) {
      let { id, name } = payload
      let list = [
        ...(yield select(getModelSelectDatasState('gantt', 'baseLine_datas')))
      ]
      let res = yield call(EditBaseLine, { id, name })
      list = list.map(item => {
        if (item.id === id) {
          item.name = name
        }
        return item
      })
      yield put({
        type: 'updateDatas',
        payload: {
          baseLine_datas: list
        }
      })
      return res
    },
    // 查询基线版本详情
    *getBaseLineInfo({ payload = {} }, { select, call, put }) {
      // 参数处理
      let id = payload.id
      if (!id) return
      const start_date = yield select(workbench_start_date)
      const end_date = yield select(workbench_end_date)
      const ceilWidth = yield select(workbench_ceilWidth)
      const date_arr_one_level = yield select(workbench_date_arr_one_level)
      const gantt_view_mode = yield select(
        getModelSelectDatasState('gantt', 'gantt_view_mode')
      )

      let res = yield call(getBaseLineInfoData, { id: id })
      let data = res.data || []
      data = data.map(item => {
        item.start_time = item.start_time + '000'
        item.due_time = item.due_time ? item.due_time + '000' : null
        if (gantt_view_mode == 'hours') {
          item.time_span = setHourViewCardTimeSpan(
            item.start_time,
            item.due_time,
            start_date.timestamp,
            end_date.timestampEnd
          )
        } else {
          item.time_span = setGantTimeSpan({
            time_span: '0',
            start_time: item.start_time,
            due_time: item.due_time,
            start_date,
            end_date
          })
        }

        return item
      })
      data = formatItem(data, {
        ceilWidth,
        date_arr_one_level,
        gantt_view_mode
      })
      let obj = {}
      data.forEach(item => {
        obj[item.id] = item
      })
      yield put({
        type: 'updateDatas',
        payload: {
          show_base_line_mode: true,
          active_baseline_data: obj,
          active_baseline: payload
        }
      })
    },
    // 退出基线查看
    *exitBaseLineInfoView({ payload = {} }, { select, call, put }) {
      yield put({
        type: 'updateDatas',
        payload: {
          show_base_line_mode: false,
          active_baseline_data: {},
          active_baseline: {}
        }
      })
    },

    // 获取大纲表头设置
    *getOutlineTableHeader({ payload = {} }, { select, call, put }) {
      const gantt_board_id = yield select(
        getModelSelectDatasState('gantt', 'gantt_board_id')
      )
      let msg = yield call(getGanttTableItem, { board_id: gantt_board_id })
      if (isApiResponseOk(msg)) {
        // yield put({
        //   type: 'updateDatas',
        //   payload: {
        //     outline_setting_msg: msg.data
        //   }
        // })
        return msg.data
      }
      return null
    },
    // 设置大纲表头
    *setOutlineTableHeader({ payload = {} }, { select, call, put }) {
      const gantt_board_id = yield select(
        getModelSelectDatasState('gantt', 'gantt_board_id')
      )
      yield call(setGanttTableItem, { ...payload, board_id: gantt_board_id })
    }
  }
}

// function As() {
//     const filnaly_outline_tree = new_outline_tree.map(item => {
//       let new_item = { ...item, parent_expand: true }
//       const { tree_type, children = [], is_expand } = item
//       let new_item_children = [...children].filter(item => item.id || (item.add_id && item.editing)) //一般项和正在编辑的输入框占位
//       let child_expand_length = 0 //第一级父节点下所有子孙元素展开的总长
//       const added = new_item_children.find(item => item.tree_type == '0') //表示是否已经添加过虚拟节点
//       if ((tree_type == '1' || tree_type == '2') && !added) { //是里程碑或者一级任务,并且没有添加过
//         // new_item_children.push({ ...visual_add_item, add_id: item.id }) //添加虚拟节点
//       }

//       // 时间跨度设置
//       const due_time = getDigit(item['due_time'])
//       const start_time = getDigit(item['start_time']) || due_time //如果没有开始时间，那就取截止时间当天
//       // new_item.is_has_start_time = !!getDigit(item['start_time'])
//       let is_has_start_time = false
//       if (!!getDigit(item['start_time']) && (due_time != start_time)) { //具有开始时间并且开始时间不等于截止时间,因为有可能 开始时间是截止时间赋值的
//         is_has_start_time = true
//       }
//       new_item.is_has_start_time = is_has_start_time
//       new_item.is_has_end_time = !!getDigit(item['due_time'])
//       let time_span = item['time_span'] || item['plan_time_span']
//       new_item.due_time = due_time
//       new_item.start_time = start_time
//       if (tree_type == '1') { //里程碑的周期（时间跨度）,根据一级任务计算
//         const child_time_arr_start = children.map(item => transformTimestamp(item.start_time) || 0).filter(item => item)
//         const child_time_arr_due = children.map(item => transformTimestamp(item.due_time) || 0).filter(item => item)
//         const child_time_arr = [].concat(child_time_arr_due, child_time_arr_start) ////全部时间的集合， [0]防止math.max 。minw
//         time_span = setGantTimeSpan({
//           time_span: '0',
//           start_time: transformTimestamp(Math.min.apply(null, child_time_arr)) == Infinity ? '' : transformTimestamp(Math.min.apply(null, child_time_arr)),
//           due_time: transformTimestamp(due_time) || (transformTimestamp(Math.max.apply(null, child_time_arr)) == -Infinity ? '' : transformTimestamp(Math.max.apply(null, child_time_arr))),
//           start_date,
//           end_date
//         })
//         // console.log('filnaly_outline_tree_1', Math.min.apply(null, child_time_arr), Math.max.apply(null, child_time_arr), time_span)
//       } else { //其它类型就根据开始截至时间计算
//         time_span = setGantTimeSpan({ time_span, start_time, due_time, start_date, end_date })
//       }
//       new_item.time_span = time_span
//       new_item.parent_ids = []
//       new_item.parent_id = ''
//       new_item.parent_milestone_id = ''
//       new_item.parent_card_id = ''

//       new_item_children = new_item_children.map(item2 => {
//         let new_item2 = { ...item2, parent_expand: is_expand, parent_type: tree_type, parent_id: item.id }
//         const tree_type2 = item2.tree_type
//         const children2 = (item2.children || []).filter(item => item.id || (item.add_id && item.editing))
//         let new_item_children2 = [...children2]
//         const is_expand2 = item2.is_expand

//         // 时间跨度设置
//         const due_time2 = getDigit(item2['due_time'])
//         const start_time2 = getDigit(item2['start_time']) || due_time2 //如果没有开始时间，那就取截止时间当天
//         // new_item2.is_has_start_time = !!getDigit(item2['start_time'])
//         let is_has_start_time2 = false
//         if (!!getDigit(item2['start_time']) && (due_time2 != start_time2)) { //具有开始时间并且开始时间不等于截止时间,因为有可能 开始时间是截止时间赋值的
//           is_has_start_time2 = true
//         }
//         new_item2.is_has_start_time = is_has_start_time2
//         new_item2.is_has_end_time = !!getDigit(item2['due_time'])
//         let time_span2 = item2['time_span'] || item2['plan_time_span']
//         new_item2.due_time = due_time2
//         new_item2.start_time = start_time2
//         time_span2 = setGantTimeSpan({ time_span: time_span2, start_time: start_time2, due_time: due_time2, start_date, end_date })
//         new_item2.time_span = time_span2
//         new_item2.parent_ids = [item.id]

//         if (is_expand) {
//           child_expand_length += 1
//         }
//         const added2 = new_item_children2.find(item => item.tree_type == '0') //表示是否已经添加过虚拟节点
//         if ((tree_type2 == '1' || tree_type2 == '2') && !added2) { //是里程碑或者一级任务
//           // new_item_children2.push({ ...visual_add_item, add_id: item2.id }) //添加虚拟节点
//         }
//         if (tree_type == '1') { //父元素是里程碑类型
//           new_item2.parent_milestone_id = item.id
//         }
//         if (tree_type == '1') { //如果第一级是里程碑才有第三级
//           new_item_children2 = new_item_children2.map(item3 => {
//             let new_item3 = { ...item3, parent_expand: new_item2.parent_expand && new_item2.is_expand, parent_type: tree_type2, parent_id: item2.id }
//             if (is_expand && is_expand2) {
//               child_expand_length += 1
//             }
//             // 时间跨度设置
//             const due_time3 = getDigit(item3['due_time'])
//             const start_time3 = getDigit(item3['start_time']) || due_time3 //如果没有开始时间，那就取截止时间当天
//             // new_item3.is_has_start_time = !!getDigit(item3['start_time'])
//             let is_has_start_time3 = false
//             if (!!getDigit(item3['start_time']) && (due_time3 != start_time3)) { //具有开始时间并且开始时间不等于截止时间,因为有可能 开始时间是截止时间赋值的
//               is_has_start_time3 = true
//             }
//             new_item3.is_has_start_time = is_has_start_time3
//             new_item3.is_has_end_time = !!getDigit(item3['due_time'])

//             let time_span3 = item3['time_span'] || item3['plan_time_span']
//             new_item3.due_time = due_time3
//             new_item3.start_time = start_time3
//             time_span3 = setGantTimeSpan({ time_span: time_span3, start_time: start_time3, due_time: due_time3, start_date, end_date })
//             new_item3.time_span = time_span3
//             new_item3.parent_ids = [item.id, item2.id]

//             if (tree_type2 == '2') {
//               new_item3.parent_card_id = item2.id
//             }
//             return new_item3
//           })
//         } else {
//           new_item2.parent_card_id = item.id
//           new_item_children2 = undefined
//         }
//         new_item2.children = new_item_children2
//         return new_item2
//       })
//       new_item.expand_length = child_expand_length + 1 //子孙节点展开的长度加上自身
//       new_item.children = new_item_children
//       return new_item
//     })
//   }
