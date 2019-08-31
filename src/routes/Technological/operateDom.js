import indexStyles from './index.less'

// used in ImChat、MyCircleItem  (component)
export const operateIm = (opetateBy) => { //0 || 1, 当前组件操作， 1其他组件操作
  const dom1 = document.getElementById('imMessage')
  const dom2 = document.getElementById('imIframOut')
  if(!dom1 || !dom2) {
    return false
  }
  if(opetateBy === '0') {
    if(window.getComputedStyle(dom1, null).right === '20px') {
      dom1.classList.remove(indexStyles.imMessageShow);//移除类
      dom1.classList.add(indexStyles.imMessageHide);//添加类
    } else {
      dom1.classList.remove(indexStyles.imMessageHide);//移除类
      dom1.classList.add(indexStyles.imMessageShow);//添加类
    }
    if(window.getComputedStyle(dom2, null).height === '0px') {
      dom2.classList.remove(indexStyles.hideIframe);//移除类
      dom2.classList.add(indexStyles.showIframe);//添加类
    } else {
      dom2.classList.remove(indexStyles.showIframe);//移除类
      dom2.classList.add(indexStyles.hideIframe);//添加类
    }
  } else if(opetateBy === '1') {
    dom1.classList.remove(indexStyles.imMessageShow);//移除类
    dom1.classList.add(indexStyles.imMessageHide);//添加类
    dom2.classList.remove(indexStyles.hideIframe);//移除类
    dom2.classList.add(indexStyles.showIframe);//添加类
  } else if(opetateBy === '2') {
    if(window.getComputedStyle(dom1, null).right !== '20px') {
      dom1.classList.remove(indexStyles.imMessageHide);//移除类
      dom1.classList.add(indexStyles.imMessageShow);//添加类
    }
    if(window.getComputedStyle(dom2, null).height !== '0px') {
      dom2.classList.remove(indexStyles.showIframe);//移除类
      dom2.classList.add(indexStyles.hideIframe);//添加类
    }
  }

}

