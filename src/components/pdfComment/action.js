import {
  SaveDataForPage,
  getDataForPage,
  putDataForPage,
  removeDataForPage,
  fetchVersion,
  fetchVersions,
  saveVersion,
  removeVersion,
  editVersion,
  fetchHistory
} from '../../services/pdfComment'
function action() {
  this.saveObject = async data => {
    return await SaveDataForPage(data)
  }
  this.getObjects = async data => {
    return await getDataForPage(data)
  }
  this.editObject = async data => {
    return await putDataForPage(data)
  }
  this.removeObject = async data => {
    return await removeDataForPage(data)
  }
  this.getVersion = async data => {
    return await fetchVersion(data)
  }
  this.getVersionList = async data => {
    return await fetchVersions(data)
  }
  this.saveVersion = async (data = {}) => {
    return await saveVersion(data)
  }
  this.removeVersion = async data => {
    return await removeVersion(data)
  }
  this.editVersion = async data => {
    return await editVersion(data)
  }
  this.fetchHistory = async data => {
    return await fetchHistory(data)
  }
}
export default new action()
