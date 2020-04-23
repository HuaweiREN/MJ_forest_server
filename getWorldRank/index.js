// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();
const userRank = db.collection('user_rank');
let MAX_RANK = 20;  // 不超过100

// 云函数入口函数
exports.main = async (event, context) => {
  let _rankObj = {
    level: {
      rank: new Array(),
      openid: new Array(),
      name: new Array(),
      level: new Array(),
      gold: new Array(),
      food: new Array(),
      type: new Array(),
      avatar: new Array(),
    },
    gold: {
      rank: new Array(),
      openid: new Array(),
      name: new Array(),
      level: new Array(),
      gold: new Array(),
      food: new Array(),
      type: new Array(),
      avatar: new Array(),
    },
    food: {
      rank: new Array(),
      openid: new Array(),
      name: new Array(),
      level: new Array(),
      gold: new Array(),
      food: new Array(),
      type: new Array(),
      avatar: new Array(),
    },
  };
  // 等级
  let _rankData = await userRank.limit(MAX_RANK).orderBy('rank_level', 'asc').get();
  for (let i = 0; i < _rankData.data.length; i++) {
    _rankObj.level.rank.push(_rankData.data[i].rank_level);
    _rankObj.level.openid.push(_rankData.data[i].openid);
    _rankObj.level.name.push(_rankData.data[i].name);
    _rankObj.level.level.push(_rankData.data[i].level);
    _rankObj.level.gold.push(_rankData.data[i].gold);
    _rankObj.level.food.push(_rankData.data[i].food);
    _rankObj.level.type.push(_rankData.data[i].type);
    _rankObj.level.avatar.push(_rankData.data[i].avatar);
  }
  // 金币
  _rankData = await userRank.limit(MAX_RANK).orderBy('rank_gold', 'asc').get();
  for (let i = 0; i < _rankData.data.length; i++) {
    _rankObj.gold.rank.push(_rankData.data[i].rank_gold);
    _rankObj.gold.openid.push(_rankData.data[i].openid);
    _rankObj.gold.name.push(_rankData.data[i].name);
    _rankObj.gold.level.push(_rankData.data[i].level);
    _rankObj.gold.gold.push(_rankData.data[i].gold);
    _rankObj.gold.food.push(_rankData.data[i].food);
    _rankObj.gold.type.push(_rankData.data[i].type);
    _rankObj.gold.avatar.push(_rankData.data[i].avatar);
  }
  // 粮食
  _rankData = await userRank.limit(MAX_RANK).orderBy('rank_food', 'asc').get();
  for (let i = 0; i < _rankData.data.length; i++) {
    _rankObj.food.rank.push(_rankData.data[i].rank_food);
    _rankObj.food.openid.push(_rankData.data[i].openid);
    _rankObj.food.name.push(_rankData.data[i].name);
    _rankObj.food.level.push(_rankData.data[i].level);
    _rankObj.food.gold.push(_rankData.data[i].gold);
    _rankObj.food.food.push(_rankData.data[i].food);
    _rankObj.food.type.push(_rankData.data[i].type);
    _rankObj.food.avatar.push(_rankData.data[i].avatar);
  }
  // 找到玩家的排名
  let _isHas = await userRank.where({
    openid: event.openid
  }).get();
  if (_isHas.data.length === 0) {
    return {}
  } else {
    _rankObj.level.rank.push(_isHas.data[0].rank_level);
    _rankObj.level.openid.push(_isHas.data[0].openid);
    _rankObj.level.name.push(_isHas.data[0].name);
    _rankObj.level.level.push(_isHas.data[0].level);
    _rankObj.level.gold.push(_isHas.data[0].gold);
    _rankObj.level.food.push(_isHas.data[0].food);
    _rankObj.level.type.push(_isHas.data[0].type);
    _rankObj.level.avatar.push(_isHas.data[0].avatar);
    _rankObj.gold.rank.push(_isHas.data[0].rank_gold);
    _rankObj.gold.openid.push(_isHas.data[0].openid);
    _rankObj.gold.name.push(_isHas.data[0].name);
    _rankObj.gold.level.push(_isHas.data[0].level);
    _rankObj.gold.gold.push(_isHas.data[0].gold);
    _rankObj.gold.food.push(_isHas.data[0].food);
    _rankObj.gold.type.push(_isHas.data[0].type);
    _rankObj.gold.avatar.push(_isHas.data[0].avatar);
    _rankObj.food.rank.push(_isHas.data[0].rank_food);
    _rankObj.food.openid.push(_isHas.data[0].openid);
    _rankObj.food.name.push(_isHas.data[0].name);
    _rankObj.food.level.push(_isHas.data[0].level);
    _rankObj.food.gold.push(_isHas.data[0].gold);
    _rankObj.food.food.push(_isHas.data[0].food);
    _rankObj.food.type.push(_isHas.data[0].type);
    _rankObj.food.avatar.push(_isHas.data[0].avatar);
    return _rankObj;
  }
};