import React from 'react';
import { connect } from 'dva/index';
import Header from './Header';
import ProjectList from './ProjectList';
import ProjectMenu from './ProjectMenu';
import ProjectItems from './ProjectItems';
import QueueAnim from 'rc-queue-anim';
import styles from './index.less';

const getEffectOrReducerByName = name => `project/${name}`;

const Project = props => {
  const { dispatch, model, modal } = props;
  const prjectListProps = {
    modal,
    model,
    showModal() {
      dispatch({ type: 'modal/showModal' });
    },
    hideModal() {
      dispatch({ type: 'modal/hideModal' });
    },
    addNewProject(data) {
      dispatch({
        type: getEffectOrReducerByName('addNewProject'),
        payload: data
      });
      dispatch({ type: 'modal/hideModal' });
    },
    collectionProject(id) {
      dispatch({
        type: getEffectOrReducerByName('collectionProject'),
        payload: {
          id
        }
      });
    },
    cancelCollection(id) {
      dispatch({
        type: getEffectOrReducerByName('cancelCollection'),
        payload: {
          id
        }
      });
    },

    quitProject(data) {
      dispatch({
        type: getEffectOrReducerByName('quitProject'),
        payload: data
      });
    },
    deleteProject(id) {
      dispatch({
        type: getEffectOrReducerByName('deleteProject'),
        payload: {
          id
        }
      });
    },
    archivedProject(data) {
      dispatch({
        type: getEffectOrReducerByName('archivedProject'),
        payload: data
      });
    },
    addMenbersInProject(data) {
      dispatch({
        type: getEffectOrReducerByName('addMenbersInProject'),
        payload: data
      });
    }
  };
  const routingJump = path => {
    dispatch({
      type: getEffectOrReducerByName('routingJump'),
      payload: {
        route: path
      }
    });
  };
  const updateDatas = data => {
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: data
    });
  };
  return (
    <div className={styles.wrapper}>
      {/*<Header/>*/}
      {/*<QueueAnim  type="top">*/}
      <ProjectMenu />
      <ProjectItems
        {...prjectListProps}
        routingJump={routingJump}
        key={'1'}
        updateDatas={updateDatas}
      />
      {/* <ProjectList {...prjectListProps} routingJump={routingJump} key={'1'} updateDatas={updateDatas}/> */}
      {/*</QueueAnim>*/}
    </div>
  );
};

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, project, loading }) {
  return { modal, model: project, loading };
}
export default connect(mapStateToProps)(Project);
