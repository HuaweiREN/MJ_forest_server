// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();
const _pic = db.collection('share_pic');
const _txt = db.collection('share_txt');

// 云函数入口函数
exports.main = async (event, context) => {
  
  let promise_pic = await _pic.get();
  let promise_txt = await _txt.get();

  return {
    txt: promise_txt.data[Math.floor(Math.random() * promise_txt.data.length)],
    pic: promise_pic.data[Math.floor(Math.random() * promise_pic.data.length)],
    errMsg: promise_txt.errMsg
  }
};