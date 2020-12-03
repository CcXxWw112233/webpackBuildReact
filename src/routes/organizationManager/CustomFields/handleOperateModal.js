// 事件封装
export const categoryIcon = type => {
  let icon = <span></span>
  let field_name = ''
  switch (type) {
    case '1':
      icon = <span>&#xe6af;</span>
      field_name = '单选'
      break
    case '2':
      icon = <span>&#xe6b2;</span>
      field_name = '多选'
      break
    case '3':
      icon = <span>&#xe7d3;</span>
      field_name = '日期'
      break
    case '4':
      icon = <span>&#xe6b0;</span>
      field_name = '数字'
      break
    case '5':
      icon = <span>&#xe6b1;</span>
      field_name = '文本'
      break
    case '6':
      icon = <span>&#xe6b3;</span>
      field_name = '文件'
      break
    case '8':
      icon = <span>&#xe7b2;</span>
      field_name = '成员'
      break
    default:
      break
  }
  return { icon, field_name }
}

// 字段引用详情
export const fieldsQuoteDetail = code => {
  let icon = <span></span>
  switch (code) {
    case 'BOARD':
      icon = <span>&#xe684;</span>
      break
    case '':
      break
    default:
      break
  }
}

// 根据不同的类型判断是否有值

// 获取创建人
export const getCreateUser = () => {
  let create_by = ''
  const { name } = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : {}
  create_by = name
  return create_by
}
