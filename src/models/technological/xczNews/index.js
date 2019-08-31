import { 
  getHotTabs, 
  getHotArticles, 
  getHighRiseArticles, 
  getAuthorityArticles, 
  getDataBase,
  getAreas,
  getAreasArticles,
  getAreasSearch,
  getAreasLocation,
  getHeaderSearch,
  getCommonArticlesList,
} from '@/services/technological/xczNews'

import { getSelectState } from './select'
import { isApiResponseOk } from '@/utils/handleResponseData'
import { message } from 'antd';

let path = '/technological/xczNews'

export default {
  namespace: 'xczNews',
  state: {
    articlesList: [], // 所有的公用文章列表
    hotTabs: [], // 热点的tabs列表,
    category_ids: '', // 当前点击热点的title的id 政策...
    hotspot_id: '', // 当前热点点击的id 城市设计...
    dataBase: [], // 资料库的数据
    dataBaseArticlesList: [], //资料库的文章列表
    cityList: [], // 地区的城市列表
    searchList: {}, // 全局搜索的列表
    inputValue: '', // 搜索框的内容
    contentVal: '', // 文本的value值,
    onSearchButton: false, // 判断是否点击搜索
    moreFlag: true, // 更多的开关
    hotFlag: true, // 热点的开关
    highRiseFlag: true, // 高层的开关
    authorityFlag: true, // 权威的开关
    dataBaseFlag: true, // 资料库的开关
    total: 10, // 默认文章的总数
    page_size: 10, // 默认显示10条
    page_no: 1, // 默认第一页
    defaultObj: {}, // 默认的空对象
    defaultArr: [], // 默认的空数组
    is_onscroll_do_paging: true, // 防抖 true可以滚动加载，false不能滚动加载
    provinceData: [], // 省级的数据
    cityData: {}, // 城市的数据
    provinceValue: '', // 省级选择的value
    cityValue: '', // 市级选择的value
    area_ids: '', // 地区对应的id
    defaultCityValue: 'cityTown', // 城市对应默认选择的value值
    defaultProvinceValue: 'province', // 省级对应默认选择的value值
    areaSearchValue: '', // 地区搜索的内容
    areaSearchData: [], // 地区搜索的数据
    isAreaSearch: false, // 是否正在搜索
    defaultSearchAreaVal: undefined, // 默认搜索框的value值
    searchId: '', // 搜索的id值 
    locationIp: '', // 地区定位的ip
    locationDataObj: {}, // 定位信息请求回来的数据
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
        // message.destroy()
        path = location.pathname
        dispatch({
          type: 'updateDatas',
          payload: {
            inputValue: '',
            page_no: 1,
            defaultArr: [],
            searchList: {},
            provinceData: [],
            cityData: {},
            provinceData: [],
            cityData: {},
            provinceValue: '', // 省级选择的value
            cityValue: '', // 市级选择的value
            area_ids: '', // 地区对应的id 
            defaultCityValue: 'cityTown',
            defaultProvinceValue: 'province', 
          }
        })
        if (location.pathname.indexOf('/technological/xczNews') != -1) {
          dispatch({
            type: "updateDatas",
            payload: {
              articlesList: [],
              defaultArr: [],
            }
          })
           
        }
        if (location.pathname.indexOf('/technological/xczNews/hot') != -1) {
          dispatch({
            type: "getHotTabs",
            payload: {
              
            }
          }),
          dispatch({
            type: "getHotArticles",
            payload: {
              
            }
          }),
          dispatch({
            type: "updateDatas",
            payload: {
              articlesList: [],
              defaultArr: [],
              onSearchButton: false, // 判断是否点击搜索
              hotFlag: true, // 热点的开关
              highRiseFlag: true,
              authorityFlag: true, // 权威的开关
              dataBaseFlag: true, // 资料库的开关
              page_no: 1
            }
          })
        }
        if (location.pathname.indexOf('/technological/xczNews/highRise') != -1) {
          dispatch({
            type: "getHighRiseArticles",
            payload: {
              
            }
          }),
          dispatch({
            type: "updateDatas",
            payload: {
              articlesList: [],
              defaultArr: [],
              onSearchButton: false, // 判断是否点击搜索
              hotFlag: true, // 热点的开关
              highRiseFlag: true,
              authorityFlag: true, // 权威的开关
              dataBaseFlag: true, // 资料库的开关
              page_no: 1,
            }
          })
        }
        if (location.pathname.indexOf('/technological/xczNews/authority') != -1) {
          dispatch({
            type: "getAuthorityArticles",
            payload: {
              
            }
          }),
          dispatch({
            type: "updateDatas",
            payload: {
              articlesList: [],
              defaultArr: [],
              onSearchButton: false, // 判断是否点击搜索
              hotFlag: true, // 热点的开关
              highRiseFlag: true,
              authorityFlag: true, // 权威的开关
              dataBaseFlag: true, // 资料库的开关
              page_no: 1,
            }
          })
        }
        if (location.pathname.indexOf('/technological/xczNews/dataBase') != -1) {
          dispatch({
            type: "getDataBase",
            payload: {
              
            }
          }),
          dispatch({
            type: "getDataBaseArticlesList",
            payload: {

            }
          }),
          dispatch({
            type: "getDataBaseDetail",
            payload: {

            }
          })
          dispatch({
            type: "updateDatas",
            payload: {
              articlesList: [],
              defaultArr: [],
              onSearchButton: false, // 判断是否点击搜索
              hotFlag: true, // 热点的开关
              highRiseFlag: true,
              authorityFlag: true, // 权威的开关
              dataBaseFlag: true, // 资料库的开关
              page_no: 1,
            }
          })
        }
        if (location.pathname.indexOf('/technological/xczNews/area') != -1) {
          dispatch({
            type: "getAreas",
            payload: {

            }
          }),
          dispatch({
            type: "getAreasArticles",
            payload: {

            }
          }),
          dispatch({
            type: "updateDatas",
            payload: {
              articlesList: [],
              // searchList: {},
              defaultArr: [],
              onSearchButton: false, // 判断是否点击搜索
              hotFlag: true, // 热点的开关
              highRiseFlag: true,
              authorityFlag: true, // 权威的开关
              dataBaseFlag: true, // 资料库的开关
              page_no: 1
            }
          })
        }
      })
    },
  },
  effects: { 
    // 获取热点tabs
    * getHotTabs({ payload = {} }, { select, call, put }) {
      // console.log(payload, 'payload.....')
      // console.log(2222222)
      const res = yield call(getHotTabs, {...payload})
      if(!isApiResponseOk(res)) {
        message.error(res.message)
        return
      }
      // console.log(res, 'res-----')
      yield put({
        type: 'updateDatas',
        payload: {
          hotTabs: res.data
        }
      })
    },

    // 获取热点文章
    * getHotArticles({ payload = {} }, { select, call, put }) {
      const res = yield call(getHotArticles, {...payload});
      if(!isApiResponseOk(res)) {
        message.error(res.message)
        return
      }
      // console.log(res,'======')
      yield put({
        type: 'updateDatas',
        payload: {
          articlesList: res.data
        }
      })
    },

    // 获取高层的文章
    * getHighRiseArticles({ payload = {} }, { select, call, put }) {
      const res = yield call(getHighRiseArticles, {...payload});
      if(!isApiResponseOk(res)) {
        message.error(res.message)
        return
      }
      // console.log(res)
      yield put({
        type: 'updateDatas',
        payload: {
          articlesList: res.data
        }
      })
    },

    // 获取权威的文章
    * getAuthorityArticles({ payload = {} }, { select, call, put }) {
      const res = yield call(getAuthorityArticles, {...payload});
      // console.log(res)
      yield put({
        type: 'updateDatas',
        payload: {
          articlesList: res.data
        }
      })
    },

    // 获取资料库的数据
    * getDataBase({ payload = {} }, { select, call, put }) {
      const res = yield call(getDataBase, {...payload});
      if(!isApiResponseOk(res)) {
        message.error(res.message)
        return
      }
      // console.log(res)
      yield put({
        type: 'updateDatas',
        payload: {
          dataBase: res.data
        }
      })
    },

    // 获取地区的城市列表
    * getAreas({ payload = {} }, { select, call, put }) {
      const provinceData = yield select((state) => getSelectState(state, 'provinceData'))
      const cityData = yield select((state) => getSelectState(state, 'cityData'))
      const res = yield call(getAreas, {...payload});
      if(!isApiResponseOk(res)) {
        message.error(res.message)
        return
      }
     // 地区数据结构的处理
     let newCityObj = res.data[0] && res.data[0].child
     // console.log(newCityObj)
     for (let key in newCityObj) {
         // console.log(newCityObj[key])
         // {id: "110000", name: "北京市", deep: "1", parent_id: "0", child: Array(2)}
         // 这里遍历的key是第一层数据的key 有: id, name, child
         let tempArr = []; // 临时的数组保存起来
         let provinceName = (newCityObj[key]).name // 每次遍历得到的省级名称 北京市、江苏省....
         let provinceId = (newCityObj[key]).id // 每次遍历得到省级的Id
         let tempProvince = {}; // 中间省级变量
         let tempCity = {}; // 中间城市变量
         // 将省级名称以及id连接起来
         tempProvince = {
             id: provinceId,
             name: provinceName
         }
         // 将连接起来的新结构放进数组中
         provinceData.push(tempProvince) // 把每一个省级名称都添加进去 [{}, {},....]
         let children = newCityObj[key].child // 取出第二层的市级数据
         // 想要的数据结构 -> [{ proviceName: '北京市', cityData: [{ id: 1, name: '直辖市' }] }]
         for (let index = 0; index < children.length; index++) {
            //  console.log(children[index])
             let childName = children[index].name; // 每一个市级的名称
             let childId = children[index].id // 每一个市级的id
             let parentId = children[index].parent_id // 每一个市级对应的父级id
             // 将市级名称以及id连接起来
             tempCity = {
                 id: childId,
                 name: childName,
                 parentId: parentId
             }
             tempArr.push(tempCity) // 把新连接的数据放进数组中
             cityData[(newCityObj[key]).id]=tempArr // 保存在省级名称的的级别下面 湖南省: ["长沙市", ...]
         }
         
     }
     yield put({
       type: 'updateDatas',
       payload: {
         cityList: newCityObj,
         provinceData: provinceData,
         cityData: cityData
       }
     })

    },

     // 获取点击时候地区的文章
     * getAreasArticles({ payload = {} }, { select, call, put }) {
      const searchList = yield select((state) => getSelectState(state, 'searchList'))
      const area_ids = yield select((state) => getSelectState(state, 'area_ids'))
      const page_size = yield select((state) => getSelectState(state, 'page_size'))
      const page_no = yield select((state) => getSelectState(state, 'page_no'))
      const defaultArr = yield select((state) => getSelectState(state, 'defaultArr'))
      const res = yield call(getAreasArticles, { page_size, page_no, area_ids });
      if(!isApiResponseOk(res)) {
        message.error(res.message)
        return
      }
      const aaa = [].concat(defaultArr, res.data.records)
      yield put({
        type: 'updateDatas',
        payload: {
          searchList: res.data,
          defaultArr: aaa,
        }
      })

      const delay = (ms) => new Promise(resolve => {
        setTimeout(resolve, ms)
      })
      yield call(delay, 500)
      yield put({
        type: 'updateDatas',
        payload: {
          is_onscroll_do_paging: res.data.records.length < page_size ? false: true
        }
      })

    },

    // 获取地区搜索的内容
    * getAreasSearch({ payload = {} }, { select, call, put }) {
      const keyword = yield select((state) => getSelectState(state, 'areaSearchValue'))
      const searchId = yield select((state) => getSelectState(state, 'searchId'))
      const res = yield call(getAreasSearch, { keyword });
      if(!isApiResponseOk(res)) {
        message.error(res.message)
        return
      }
      // console.log(res)
      yield put({
        type: 'updateDatas',
        payload: {
          areaSearchData: res.data,
        }
      })
    },

    // 获取地区定位的ip
    * getAreasLocation({ payload = {} }, { select, call, put }) {
      const locationDataObj = yield select((state) => getSelectState(state, 'locationDataObj'))
      if(locationDataObj && locationDataObj.length) return
      const res = yield call(getAreasLocation, {});
      if(!isApiResponseOk(res)) {
        message.error(res.message)
        return
      }
      let locationData = res.data.child;
      console.log(locationData)
      yield put({
        type: 'updateDatas',
        payload: {
          provinceValue: locationData.parent_id,
          defaultProvinceValue: locationData.parent_id,
          defaultCityValue: locationData.id,
          cityValue: locationData.id,
          area_ids: locationData.id,
          defaultArr: []
        }
      })
      const delay = (ms) => new Promise(resolve => {
        setTimeout(resolve, ms)
      })
      yield call(delay, 500)
      yield put({
        type: 'getAreasArticles',
        payload: {

        }
      })
    },


    // 顶部的全局搜索
    * getHeaderSearch({ payload = {} }, { select, call, put }) {
      const searchList = yield select((state) => getSelectState(state, 'searchList'))
      const category_ids = yield select((state) => getSelectState(state, 'category_ids'))
      const hotspot_id = yield select((state) => getSelectState(state, 'hotspot_id'))
      const keywords = yield select((state) => getSelectState(state, 'inputValue'))
      const page_size = yield select((state) => getSelectState(state, 'page_size'))
      const page_no = yield select((state) => getSelectState(state, 'page_no'))
      const defaultArr = yield select((state) => getSelectState(state, 'defaultArr'))
      
      const params = {
        category_ids, keywords, page_size, page_no
      }
      if(path.indexOf('/technological/xczNews/hot') != -1) {
        params.hotspot_id = hotspot_id
      }
      if(searchList && searchList.length) return
      const res = yield call(getHeaderSearch, {...params, ...payload})
      if(!isApiResponseOk(res)) {
        message.error(res.message)
        return
      }
      const aaa = [].concat(defaultArr, res.data.records)
      // console.log('sssss',aaa)
      // console.log(res.data.records.length)
      yield put({
        type: 'updateDatas',
        payload: {
          searchList: res.data,
          contentVal: keywords,
          defaultArr: aaa,
        }
      })

      const delay = (ms) => new Promise(resolve => {
        setTimeout(resolve, ms)
      })
      yield call(delay, 500)
      yield put({
        type: 'updateDatas',
        payload: {
          is_onscroll_do_paging: res.data.records.length < page_size ? false: true,
        }
      })

    },

    // 获取所有的文章列表
    * getCommonArticlesList({ payload = {} }, { select, call, put }) {
      const searchList = yield select((state) => getSelectState(state, 'searchList'))
      if(searchList && searchList.length) return
      const res = yield call(getCommonArticlesList)
      if(!isApiResponseOk(res)) {
        message.error(res.message)
        return
      }
      // console.log(res)
      yield put({
        type: 'updateDatas',
        payload: {
          searchList: res.data
        },
      })
    }

  },

  reducers: {
    updateDatas(state, action) {
      // console.log(state, action)
      return {
        ...state, ...action.payload
        // datas: { ...state.datas, ...action.payload },
      }
    }
  },
}
