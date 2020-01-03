import React, { Component } from "react";
import { connect } from "dva/index"
import indexStyles from './index.less'
import SimpleHeader from '../SimpleHeader/index'
import MyWorkbenchBoxs from '../MyWorkbenchBoxs/index'
import WallpaperSelect from '../WallpaperSelect/index'
import WorkbenchBoxSelect from '../WorkbenchBoxSelect/index'


const getEffectOrReducerByName = name => `technological/${name}`

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      simpleHeaderVisiable: true,
      myWorkbenchBoxsVisiable: true,
      wallpaperSelectVisiable: true,
      workbenchBoxSelectVisiable: false,
      createNewBoardVisiable: false,
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // dispatch({
    //   type: 'simplemode/getMyBoxs',
    //   payload: {}
    // });
    // dispatch({
    //   type: 'simplemode/getAllBoxs',
    //   payload: {}
    // });
    dispatch({
      type: 'simplemode/updateDatas',
      payload: {
        chatImVisiable: false,
        leftMainNavIconVisible: true
      }
    });
    window.addEventListener('keydown', this.handleEscKeypress.bind(this))

  }


  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleEscKeypress.bind(this))
  }

  handleEscKeypress = (e) => {
    // console.log('esc',e.which);
    
    if (e.which == 27) {
      const { workbenchBoxSelectVisiable } = this.state;
      if (workbenchBoxSelectVisiable) {
        this.setHomeVisible({
          simpleHeaderVisiable: true,
          myWorkbenchBoxsVisiable: true,
          wallpaperSelectVisiable: true,
          workbenchBoxSelectVisiable: false,
          createProjectVisiable: false,
        });
      }
    }
  }


  setHomeVisible = (data) => {
    this.setState(data)
  }

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const {
      myWorkbenchBoxsVisiable,
      wallpaperSelectVisiable,
      workbenchBoxSelectVisiable,
    } = this.state;

    return (
      <div>
        {myWorkbenchBoxsVisiable && <MyWorkbenchBoxs {...this.state} setHomeVisible={this.setHomeVisible} />}

        {wallpaperSelectVisiable && <WallpaperSelect {...this.state} setHomeVisible={this.setHomeVisible} />}

        {workbenchBoxSelectVisiable && <WorkbenchBoxSelect {...this.state} setHomeVisible={this.setHomeVisible} />}
      </div>
    )
  }
};

export default connect(({ simplemode: {
  leftMainNavIconVisible
} }) => ({
  leftMainNavIconVisible
}))(Home)