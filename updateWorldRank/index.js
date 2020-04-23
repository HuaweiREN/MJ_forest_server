// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();
const userData = db.collection('user_data');
const userRank = db.collection('user_rank');
const sysData = db.collection('system_data');
let BATCH_SIZE = 100;

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取系统数据
  let sys_round = await sysData.doc('system_round').get();
  let _date = new Date();
  const batch_level = await userData.limit(BATCH_SIZE).orderBy('userPetInfo.petLevel', 'desc').orderBy('userPetInfo.petExpeValueNow', 'desc').orderBy('userInfo.foodHoldVolume', 'desc').orderBy('userInfo.goldTotal', 'desc').get();
  const batch_gold = await userData.limit(BATCH_SIZE).orderBy('userInfo.goldTotal', 'desc').orderBy('userPetInfo.petLevel', 'desc').orderBy('userPetInfo.petExpeValueNow', 'desc').orderBy('userInfo.foodHoldVolume', 'desc').get();
  const batch_food = await userData.limit(BATCH_SIZE).orderBy('userInfo.foodHoldVolume', 'desc').orderBy('userPetInfo.petLevel', 'desc').orderBy('userPetInfo.petExpeValueNow', 'desc').orderBy('userInfo.goldTotal', 'desc').get();
  for (let j = 0; j < batch_level.data.length; j++) {
    _openid = batch_level.data[j].openid;
    _rank_level = j + 1;
    for (let i = 0; i < batch_gold.data.length; i++) {
      if (batch_gold.data[i].openid == _openid) {
        _rank_gold = i + 1;
        break;
      }
    }
    for (let i = 0; i < batch_food.data.length; i++) {
      if (batch_food.data[i].openid == _openid) {
        _rank_food = i + 1;
        break;
      }
    }
    // 构造此人的排行榜数据
    let _isAdd = {
      rank_level: _rank_level,
      rank_gold: _rank_gold,
      rank_food: _rank_food,
      level: batch_level.data[j].userPetInfo.petLevel,
      exp: batch_level.data[j].userPetInfo.petExpeValueNow,
      food: batch_level.data[j].userInfo.foodHoldVolume,
      gold: batch_level.data[j].userInfo.goldTotal,
      type: batch_level.data[j].userPetInfo.petType,
      name: batch_level.data[j].userInfo.name,
      avatar: batch_level.data[j].userInfo.avatar,
      openid: _openid,
      due: _date.getTime(),
      round: sys_round.data.round,
    };
    await userRank.where({
      openid: _openid
    }).update({
      data: _isAdd
    });
  }
  console.log("世界排行榜更新成功");
  return {};
};