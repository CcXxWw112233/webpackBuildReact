export const beforeChangeCommunicationUpdateFileList = ({ dispatch, board_id }) => {
    dispatch({
        type: 'gantt/updateDatas',
        payload: {
            gantt_board_id: board_id,
        }
    })
    dispatch({
        type: 'gantt/getGanttBoardsFiles',
        payload: {
          board_id: board_id == '0' ? '': board_id,
          query_board_ids: [],
        }
      })
}


// 公用处理-通过传入当前节点的ID，查询出所有的父级节点
export function getParent(data2, nodeId2) {
  // debugger;
  var arrRes = [];
  if (data2.length == 0) {
      if (!!nodeId2) {
          arrRes.unshift(data2)
      }
      return arrRes;
  }
  let rev = (data, nodeId) => {
      for (var i = 0, length = data.length; i < length; i++) {
          let node = data[i];
          if (node.folder_id == nodeId) {
              arrRes.unshift(node)
              rev(data2, node.parent_id);
              break;
          }
          else {
              if (!!node.child_data) {
                  rev(node.child_data, nodeId);
              }
          }
      }
      return arrRes;
  };
  arrRes = rev(data2, nodeId2);
  return arrRes;
}

// 公用处理-通过传入当前节点的ID，查询出所有的子级节点
export function getChildIds(data){
	var ids = [];
	var rev = (data)=> {
		for(var i=0; i<data.length; i++){
			ids.push( data[i].folder_id );
			if(data[i].child_data){
				rev(data[i].child_data);
			}
		}
	}
	rev(data);
	return ids;
}