// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 获取数据库的引用
const db = cloud.database();
const userData = db.collection('user_data');

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let _addData = event.userData;
  let _openid = wxContext.OPENID;
  // 判断是否为机器人数据
  if (_addData.hasOwnProperty("openid")){
    _openid = _addData.openid;
  }
  // 查询用户是否已经保存过数据
  let _isHas = await userData.where({
    openid: _openid
  }).get();

  _addData.due = Date.now();
  // 如果没有数据，则生成
  if (_isHas.data.length === 0) {
    return await userData.add({
      data: _addData
    });
  }
  // 如果有数据，则更新
  else {
    return await userData.where({
      openid: _openid,
    }).update({
      data: _addData
    })
  }
}