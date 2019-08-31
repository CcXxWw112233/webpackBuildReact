import React from 'react';
import {connect} from "dva/index";
import Header from './Header'
import FirstEntry from './FirstEntry'
import NewsList from './NewsList'
import NewsListNewDatas from './NewsListNewDatas'
import QueueAnim from 'rc-queue-anim'

const getEffectOrReducerByName = name => `newsDynamic/${name}`

const NewsDynamic = (props) => {
  const { dispatch, model, modal } = props
  const { datas: { isFirstEntry } = false } = model
  const NewsListProps = {
    modal,
    model,
    showModal() {
      dispatch({ type: 'modal/showModal' })
    },
    hideModal() {
      dispatch({ type: 'modal/hideModal' })
    },
    getNewsDynamicList(next_id) {
      dispatch({
        type: getEffectOrReducerByName('getNewsDynamicList'),
        payload: {next_id}
      })
    },
    addCardNewComment(data) {
      dispatch({
        type: getEffectOrReducerByName('addCardNewComment'),
        payload: data
      })
    }
  }
  const routingJump = (path) => {
    dispatch({
      type: getEffectOrReducerByName('routingJump'),
      payload: {
        route: path,
      },
    })
  }
  const updateDatas = (payload) => {
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: payload
    })
  }
  return(
    <div>
      <Header/>
      <QueueAnim type="top">
        {isFirstEntry ? (
          <FirstEntry key={'1'}></FirstEntry>
        ) : (
          <NewsListNewDatas key={'2'} {...NewsListProps} updateDatas={updateDatas} />
        )}
      </QueueAnim>
    </div>
  )
};

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, newsDynamic, loading }) {
  return { modal, model: newsDynamic, loading }
}
export default connect(mapStateToProps)(NewsDynamic)


