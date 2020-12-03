// （android || ios）
export const ENV_ANDROID_APP = !!window.mapAndroid //是否在安卓环境中
export const diffClientGetIdentification = () => {
  //不同客户端获取身份标识
  if (!ENV_ANDROID_APP) return
  if (typeof window.mapAndroid.getIdentification == 'function') {
    return window.mapAndroid.getIdentification()
  }
}
// 不同客户端初始化token （android || ios）
export const diffClientInitToken = token => {
  if (!ENV_ANDROID_APP) return
  if (typeof window.mapAndroid.obtainToken == 'function') {
    return window.mapAndroid.obtainToken(token)
  }
}

// 不同客户端跳转方法
export const diffClientRedirect = token => {
  if (!ENV_ANDROID_APP) return
  if (typeof window.mapAndroid.refreshRedirect == 'function') {
    return window.mapAndroid.refreshRedirect(token)
  }
}

// 区分会协宝与聆悉
export const platformNouns = ENV_ANDROID_APP ? '聆悉会协宝' : '聆悉'
