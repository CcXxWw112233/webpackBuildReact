String.prototype.trimLR = function () { //去掉首尾空格
    return this.replace(/(^\s*)|(\s*$)/g, "");
}