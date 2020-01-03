// 验证手机号
export const validateTel = (value) => {
  return (/^[1][3-9]\d{9}$/.test(value))
}
// 验证邮箱
export const validateEmail = (value) => {
  return (/^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/.test(value))
}
// 验证符合邮箱后缀名
export const validateEmailSuffix = (value) => {
  return (/^@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/.test(value))
}
// 验证密码 正则匹配用户密码8-32位数字和字母的组合
export const validatePassword = (value) => {
  return (/^(?![0-9]+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{6,32}/.test(value))
}

//固定电话
export const validateFixedTel = (value) => {
  return (/([0-9]{3,4}-)?[0-9]{7,8}/).test(value)
}

//身份证号码
export const validateIdCard = (value) => {
  return (/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/).test(value)
}

//中文姓名2-6字
export const validateChineseName = (value) => {
  return (/^[\u4E00-\u9FA5]{2,6}$/).test(value)
}
//邮政编码
export const validatePostalCode = (value) => {
  return (/^[a-zA-Z0-9 ]{3,12}$/).test(value)
}
//验证网址
export const validateWebsite = (value) => {
  return (/^(?=^.{3,255}$)(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/\w+\.\w+)*$/).test(value)
}
//验证QQ
export const validateQQ = (value) => {
  return (/^[0-9][0-9]{4,}$/).test(value)
}
//正整数
export const validatePositiveInt = (value) => {
  return (/^[1-9]\d*$/).test(value)
}

//负数
export const validateNegative = (value) => {
  return (/^(\-{1})\d+(\.\d+)?$/).test(value) //  /^(\-?)\d+$/
}
//精确到两位小数
export const validateTwoDecimal = (value) => {
  return (/^(\-|\d+)\.\d{2}$/).test(value)
}



