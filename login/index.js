// 云函数入口文件
const cloud = require('wx-server-sdk');

// 初始化 cloud
cloud.init();

// 登录和回合开始时，获取玩家数据
// 获取云数据库的引用
const db = cloud.database();
const userData = db.collection('user_data');
const sysData = db.collection('system_data');
const userRank = db.collection('user_rank');

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  const countResult = await userData.count();
  const user_num = countResult.total;
  let sys_config = await sysData.doc('system_config').get();
  let sys_round = await sysData.doc('system_round').get();
  // 查询是否已注册
  let _isHas = await userData.where({
    openid: wxContext.OPENID
  }).get();
  let current = new Date();
  let logData = {};
// 如果没有注册
  if (_isHas.data.length === 0){
    logData = {
      openid: wxContext.OPENID,
      round: sys_round.data.round,
      timeStamp: {
        absolute: current.getTime(),
        relative: current.getTime(),
      },
      sysDate: {
        MM: current.getMonth() + 1,
        DD: current.getDate(),
        HH: current.getHours(),
        Minu: current.getMinutes(),
        Secon: current.getSeconds(),
        Milli: current.getMilliseconds(),
      },
      userTaskInfo: {
        taskContent: ["内测玩家\n每日可领", "内测玩家\n每日可领", "内测玩家\n每日可领"],
        taskHarvest: [5, 50, 100],
        taskHarvestType: ["gold", "food", "live"],
      },
      userInfo: {
        name: event.userinfo.nickName,
        avatar: event.userinfo.avatarUrl,
        INIT: true,
        existDay: 0,
        timeLastAwardClick: sys_round.data.round,
        ID: wxContext.OPENID,
        dailyLogon: [1, 10],
        goldHoldVolume: sys_config.data.goldInit,
        foodHoldVolume: sys_config.data.foodInit,
        goldIncome: 0,
        goldConsume: 0,
        foodIncome: 0,
        goldInterest: 1,
        goldDeposit: 10,
        goldTotal: sys_config.data.goldInit + 10,
        goldTradeValue: 0,
        foodTradeValue: 0,
        goldTradeFeedback: 0,
        foodTradeFeedback: 0,
        shakeShakeReady: 1,
        tradeAwardReady: -1,
        dailyAwardReady: -1,
        goldInterestReady: 1,
        goldWelfareReady: 1,
        foodWelfareReady: 1,
        foodHarvestReady: 0,
        taskHarvested: [1, 1, 1],
        newsExtra: null,
        shakeNum: 0,
      },
      userPetInfo: {
        petType: "huanhuan",
        petLive: 100,
        actiLeftDays: 0,
        actiTypeCurrent: 0,
        actiHarvest: -1,              
        actiAssigned: 0,
        actiTypeNext: 0,
        petExpeValueNow: 0,
        petExpeTotNow: sys_config.data.petExpUp[0],
        petLevel: 1,
        petLevelMax: 50,
      },
    };
    await userData.add({
      data: logData
    });
    let _isRank = await userRank.where({
      openid: wxContext.OPENID
    }).get();
    let _defaultRank = {
      rank_level: user_num + 1,
      rank_gold: user_num + 1,
      rank_food: user_num + 1,
      level: 1,
      exp: 0,
      food: 100,
      gold: 10,
      type: "huanhuan",
      name: event.userinfo.nickName,
      avatar: event.userinfo.avatarUrl,
      openid: wxContext.OPENID,
      due: current.getTime(),
      round: sys_round.data.round,
    };
    if (_isRank.data.length === 0) {
      await userRank.add({
        data: _defaultRank
    });
    } else {
      await userRank.where({
        openid: wxContext.OPENID
      }).update({
        data: _defaultRank
      });
    }
  }
  else {
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        timeStamp: {
          absolute: current.getTime(),
        },
        sysDate: {
          MM: current.getMonth() + 1,
          DD: current.getDate(),
          HH: current.getHours(),
          Minu: current.getMinutes(),
          Secon: current.getSeconds(),
          Milli: current.getMilliseconds(),
        },
      },
    });
    logData = _isHas.data[0];
  };
  logData.sysNewsData = {
    newsNow: sys_round.data.newsData.news,
    newsExtra: sys_round.data.newsData.newsEx,
    newsExtraExtra: sys_round.data.newsData.newsExEx,
  };
  logData.sysResInfo = {
    goldWelfare: sys_config.data.goldWelfareValue,
    foodHarvest: sys_config.data.foodHarvestValue,
    foodHarvestCount: sys_round.data.foodHarvestCount,
    foodWelfare: sys_config.data.foodWelfareValue,
    priceGoldYesterday: 1,
    priceFoodYesterday: sys_round.data.priceTrend[3],
    priceTrend: sys_round.data.priceTrend,
    priceGoldAvg: 1,
    priceFoodAvg: sys_round.data.priceAvg,
    goldInterestRate: sys_config.data.goldInterestRate,
    goldWelfareThresold: sys_round.data.goldWelfareThreshold,
    foodWelfareThresold: sys_round.data.foodWelfareThreshold,
    shakeMax: sys_config.data.shakeMax,
  };
  logData.sysActivityFeedback = sys_config.data.actiFeedback;
  logData.sysPetTalent = {
    sysPetTalent_DayuTalent: sys_config.data.petTalent.dayu,
    sysPetTalent_DuoduoTalent: sys_config.data.petTalent.duoduo,
    sysPetTalent_HuanhuanTalent: sys_config.data.petTalent.huanhuan,
    sysPetTalent_MaiqiTalent: sys_config.data.petTalent.maiqi,
  };
  let _rankData = await cloud.callFunction({
    name: 'getWorldRank',
    data: {
      openid: wxContext.OPENID,
    }
  });
  logData.userRankInfo = _rankData.result;
  return logData;
};
