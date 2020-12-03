// 针对坐标轴换行处理
export const newline = (option, number, axis) => {
  let labelItem
  /* 此处注意json是数组还是对象 */
  if (option[axis] instanceof Array) {
    labelItem = option[axis][0]
  } else {
    labelItem = option[axis]
  }
  labelItem['axisLabel'] = {
    interval: 0,
    formatter: function(params) {
      var newParamsName = ''
      var paramsNameNumber = params.length
      var provideNumber = number
      var rowNumber = Math.ceil(paramsNameNumber / provideNumber)
      if (paramsNameNumber > provideNumber) {
        for (var p = 0; p < rowNumber; p++) {
          var tempStr = ''
          var start = p * provideNumber
          var end = start + provideNumber
          if (p == rowNumber - 1) {
            tempStr = params.substring(start, paramsNameNumber)
          } else {
            tempStr = params.substring(start, end) + '\n'
          }
          newParamsName += tempStr
        }
      } else {
        newParamsName = params
      }
      return newParamsName
    }
  }
  return option
}

export const arrayNonRepeatfy = arr => {
  let temp_arr = []
  let temp_id = []
  for (let i = 0; i < arr.length; i++) {
    if (!temp_id.includes(arr[i])) {
      //includes 检测数组是否有某个值
      temp_arr.push(arr[i])
      temp_id.push(arr[i])
    }
  }
  return temp_arr
}

// formatter: function (params) {
//   let tip1 = "";
//   let tip = "";
//   let le = params.length  //图例文本的长度
//   if (le > 9) {   //几个字换行大于几就可以了
//     let l = Math.ceil(le / 9)  //有些不能整除，会有余数，向上取整
//     for (let i = 1; i <= l; i++) { //循环
//       if (i < l) { //最后一段字符不能有\n
//         tip1 += params.slice(i * 9 - 9, i * 9) + '\n'; //字符串拼接
//       } else if (i === l) {  //最后一段字符不一定够9个
//         tip = tip1 + params.slice((l - 1) * 9, le) //最后的拼接在最后
//       }
//     }
//     return tip;
//   } else {
//     tip = params  //前面定义了tip为空，这里要重新赋值，不然会替换为空
//     return tip;
//   }
// }
