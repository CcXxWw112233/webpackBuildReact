import React from 'react';
import { connect } from 'dva';
import 'moment/locale/zh-cn';


const getEffectOrReducerByName = name => `emailRedirect/${name}`
const EmailRedirect = (options) => {
  return (
    <div></div>
  );
};




//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, emailRedirect, loading }) {
  return { modal, model: emailRedirect, loading }
}
export default connect(mapStateToProps)(EmailRedirect)
