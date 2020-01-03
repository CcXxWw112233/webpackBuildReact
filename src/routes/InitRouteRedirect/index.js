

import React from 'react';
import { connect } from 'dva';


const InitRouteRedirect = (options) => {
  return (
   <div></div>
  );
};



//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, initRouteRedirect, loading }) {
  return { modal, model: initRouteRedirect, loading }
}
export default connect(mapStateToProps)(InitRouteRedirect)
