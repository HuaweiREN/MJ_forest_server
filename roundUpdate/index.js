const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const userData = db.collection('user_data');
const sysData = db.collection('system_data');
const userRank = db.collection('user_rank');
const BATCH_SIZE = 100;

// 云函数入口函数
exports.main = async (event, context) => {
  console.log("更新回合数据");

  // ----更新系统数据----
  let time1 = new Date().getTime();
  // 系统初始数据
  let _actiFeedback = {
    activityType0: [1, 0, null, 5],
    activityType1: [3, 3, "gold", 60],
    activityType2: [2, 20, "food", 40],
    activityType3: [1, "额外新闻", "news", 10],
    activityType4: [5, 100, "live", 0],
  };
  let _foodTradeAdd = 20;
  let _foodHarvestValue = 100;
  let _foodHarvestPeriod = 24;
  let _foodLogon = 10;
  let _foodWelfareRate = 0.3;
  let _goldTradeAdd = 2;
  let _goldInterestRate = 0.1;
  let _goldLogon = 1;
  let _goldWelfareRate = 0.3;
  let _liveRate = 1;
  let _logMax = 5;
  let _shakeMax = 10;
  let _petTalent = {
    dayu: [3, 3, 3, 3, 3, 5, 5, 5, 5, 5, 10, 10, 10, 10, 10, 15, 15, 15, 15, 15, 20, 20, 20, 20, 20, 25, 25, 25, 25, 25, 30, 30, 30, 30, 30, 35, 35, 35, 35, 35, 40, 40, 40, 40, 40, 45, 45, 45, 45, 45, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
    duoduo: [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    huanhuan: [0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.4, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.6, 0.6, 0.7, 0.7, 0.7, 0.7, 0.7, 0.8, 0.8, 0.8, 0.8, 0.8, 0.9, 0.9, 0.9, 0.9, 0.9, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
    maiqi: [10, 10, 10, 10, 10, 20, 20, 20, 20, 20, 30, 30, 30, 30, 30, 40, 40, 40, 40, 40, 50, 50, 50, 50, 50, 60, 60, 60, 60, 60, 70, 70, 70, 70, 70, 80, 80, 80, 80, 80, 90, 90, 90, 90, 90, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
  };
  let _petExpUp = [100, 100, 100, 130, 160, 190, 230, 290, 320, 350, 390, 410, 420, 450, 450, 450, 470, 500, 530, 550, 570, 600, 620, 620, 620, 650, 680, 700, 720, 720, 720, 750, 770, 800, 820, 850, 880, 900, 1000, 1100, 1200, 1400, 1500, 1700, 1700, 1800, 2000, 2200, 2500, 2700, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000];
  // 获取系统数据
  let sys_config = await sysData.doc('system_config').get();
  let sys_round = await sysData.doc('system_round').get();
  let priceTrendPRE = sys_round.data.priceTrend;
  let _roundPRE = sys_round.data.round;
  let _newsList = sys_config.data.newsList;
  let current = new Date();
  // 玩家记录总数
  const countResult = await userData.count();
  const user_num = countResult.total;
  // 计算需分几次取
  const batchTimes = Math.ceil(user_num / BATCH_SIZE);

  // -更新世界新闻-
  const newsListLen = sys_config.data.newsList.news.length;
  const newsExListLen = sys_config.data.newsList.newsEx.length;
  const _newsIndexPRE = sys_round.data.newsIndex.news;
  const _newsExIndexPRE = sys_round.data.newsIndex.newsEx;
  let _newsValuePRE = sys_round.data.newsValuePRE;
  let _newsIndex = Math.floor(Math.random() * newsListLen);
  let _newsExIndex = Math.floor(Math.random() * newsExListLen);
  // 配置系统参数
  let _newsValue = "";
  if (_newsExIndexPRE == 0) {
    _goldLogon = _newsValuePRE;  // 3~5
    _foodLogon = _newsValuePRE * 10;
  } else if (_newsExIndexPRE == 1) {
    _shakeMax = _newsValuePRE;  // 15~20
  } else if (_newsExIndexPRE == 2) {
    _shakeMax = _newsValuePRE;  // 5~8
  } else if (_newsExIndexPRE == 3) {
    _liveRate = _newsValuePRE;  // 0.5~0.75
  } else if (_newsExIndexPRE == 4) {
    _liveRate = _newsValuePRE;  // 1.25~1.5
  } else if (_newsExIndexPRE == 5) {
    _foodTradeAdd = _newsValuePRE;  // 30~50
  } else if (_newsExIndexPRE == 6) {
    _foodTradeAdd = _newsValuePRE;  // 5~15
  } else if (_newsExIndexPRE == 7) {
    _goldTradeAdd = _newsValuePRE;  // 30~50
  } else if (_newsExIndexPRE == 8) {
    _goldTradeAdd = _newsValuePRE;  // 5~15
  } else if (_newsExIndexPRE == 9) {
    _foodWelfareRate = _newsValuePRE;  // 0.4~0.5
  } else if (_newsExIndexPRE == 10) {
    _foodWelfareRate = _newsValuePRE;  // 0.1~0.2
  } else if (_newsExIndexPRE == 11) {
    _goldWelfareRate = _newsValuePRE;  // 0.4~0.5
  } else if (_newsExIndexPRE == 12) {
    _goldWelfareRate = _newsValuePRE;  // 0.1~0.2
  } else if (_newsExIndexPRE == 13) {
    _goldInterestRate = _newsValuePRE;  // 0.05~0.08
  } else if (_newsExIndexPRE == 14) {
    _goldInterestRate = _newsValuePRE;  // 0.15~0.20
  }
  if (_newsExIndex == 0) {
    _newsValuePRE = 2 + Math.floor(Math.random() * 1);  // 2~3
    _newsValue = "至:" + _newsValuePRE + "和" + _newsValuePRE * 10;
  } else if (_newsExIndex == 1) {
    _newsValuePRE = 15 + Math.floor(Math.random() * 5);  // 15~20
    _newsValue = "至:" + _newsValuePRE;
  } else if (_newsExIndex == 2) {
    _newsValuePRE = 5 + Math.floor(Math.random() * 3);  // 5~8
    _newsValue = "至:" + _newsValuePRE;
  } else if (_newsExIndex == 3) {
    _newsValuePRE = 0.5 + Math.random() * 0.25;  // 0.5~0.75
    _newsValue = "至:" + _newsValuePRE * 100 + "%";
  } else if (_newsExIndex == 4) {
    _newsValuePRE = 1.25 + Math.random() * 0.25;  // 1.25~1.5
    _newsValue = "至:" + _newsValuePRE * 100 + "%";
  } else if (_newsExIndex == 5) {
    _newsValuePRE = 30 + Math.floor(Math.random() * 20);  // 30~50
    _newsValue = "至:" + _newsValuePRE;
  } else if (_newsExIndex == 6) {
    _newsValuePRE = 5 + Math.floor(Math.random() * 10);  // 5~15
    _newsValue = "至:" + _newsValuePRE;
  } else if (_newsExIndex == 7) {
    _newsValuePRE = 3 + Math.floor(Math.random() * 100) / 100;  // 3~4
    _newsValue = "至:" + _newsValuePRE;
  } else if (_newsExIndex == 8) {
    _newsValuePRE = 1 + Math.floor(Math.random() * 50) / 100;  // 1~1.5
    _newsValue = "至:" + _newsValuePRE;
  } else if (_newsExIndex == 9) {
    _newsValuePRE = 0.4 + Math.floor(Math.random() * 10) / 100;  // 0.4~0.5
    _newsValue = "至:" + _newsValuePRE * 100 + "%";
  } else if (_newsExIndex == 10) {
    _newsValuePRE = 0.1 + Math.floor(Math.random() * 10) / 100;  // 0.1~0.2
    _newsValue = "至:" + _newsValuePRE * 100 + "%";
  } else if (_newsExIndex == 11) {
    _newsValuePRE = 0.4 + Math.floor(Math.random() * 10) / 100;  // 0.4~0.5
    _newsValue = "至:" + _newsValuePRE * 100 + "%";
  } else if (_newsExIndex == 12) {
    _newsValuePRE = 0.1 + Math.floor(Math.random() * 10) / 100;  // 0.1~0.2
    _newsValue = "至:" + _newsValuePRE * 100 + "%";
  } else if (_newsExIndex == 13) {
    _newsValuePRE = 0.05 + Math.floor(Math.random() * 3) / 100;  // 0.05~0.08
    _newsValue = "至:" + _newsValuePRE * 100 + "%";
  } else if (_newsExIndex == 14) {
    _newsValuePRE = 0.15 + Math.floor(Math.random() * 5) / 100;  // 0.15~0.20
    _newsValue = "至:" + _newsValuePRE * 100 + "%";
  }
  // -更新世界市场-
  let food_total = 0;
  let gold_total = 0;
  for (let i = 0; i < batchTimes; i++) {
    // 获取对应batch名的数据集合
    const batch = await userData.skip(i * BATCH_SIZE).limit(BATCH_SIZE).get();
    for (let j = 0; j < batch.data.length; j++) {
      // 累计粮食和金币交易量
      food_total += batch.data[j].userInfo.foodTradeValue;
      gold_total += batch.data[j].userInfo.goldTradeValue;
    }
  }
  // 计算今日精确价格
  let priceNow = (food_total + _foodTradeAdd) / (gold_total + _goldTradeAdd);
  // 更改价格趋势及平均价格
  let priceTrendPRO = [...priceTrendPRE];
  priceTrendPRO.shift();
  priceTrendPRO.push(priceNow);
  let avgPricePRO = 0;
  for (let i = 0; i < priceTrendPRO.length; i++) {
    avgPricePRO += priceTrendPRO[i]
  }
  avgPricePRO = avgPricePRO / priceTrendPRO.length;

  // -更新福利金-
  // 计算临界点所在位置
  let batch_id = Math.floor(user_num * _goldWelfareRate / BATCH_SIZE);
  let user_id = Math.floor(user_num * _goldWelfareRate) % BATCH_SIZE;
  // 找到福利金临界值
  let batch_welfare = await userData.skip(batch_id * BATCH_SIZE).limit(BATCH_SIZE).orderBy('userInfo.goldHoldVolume', 'asc').get();
  let _goldWelfareThreshold = batch_welfare.data[user_id].userInfo.goldHoldVolume;

  // -更新救济粮-
  // 找到福利粮临界值
  batch_welfare = await userData.skip(batch_id * BATCH_SIZE).limit(BATCH_SIZE).orderBy('userInfo.foodHoldVolume', 'asc').get();
  let _foodWelfareThreshold = batch_welfare.data[user_id].userInfo.foodHoldVolume;

  // -更新丰收状态-
  let _foodHarvestCount = sys_round.data.foodHarvestCount;
  _foodHarvestCount = (_foodHarvestCount + 23) % _foodHarvestPeriod;

  // -更新系统数据-
  await sysData.doc('system_config').update({
    data: {
      actiFeedback: _actiFeedback,
      foodTradeAdd: _foodTradeAdd,
      foodHarvestValue: _foodHarvestValue,
      foodHarvestPeriod: _foodHarvestPeriod,
      foodLogon: _foodLogon,
      foodWelfareRate: _foodWelfareRate,
      goldTradeAdd: _goldTradeAdd,
      goldInterestRate: _goldInterestRate,
      goldLogon: _goldLogon,
      goldWelfareRate: _goldWelfareRate,
      liveRate: _liveRate,
      logMax: _logMax,
      shakeMax: _shakeMax,
      petTalent: _petTalent,
      petExpUp: _petExpUp,
    }
  });
  await sysData.doc('system_round').update({
    data: {
      foodHarvestCount: _foodHarvestCount,
      foodWelfareThreshold: _foodWelfareThreshold,
      goldWelfareThreshold: _goldWelfareThreshold,
      newsIndex: {
        news: _newsIndex,
        newsEx: _newsExIndex,
        newsExPRE: _newsExIndexPRE,
      },
      newsData: {
        news: _newsList.news[_newsIndex],
        newsEx: _newsList.newsEx[_newsExIndex],
        newsExEx: _newsList.newsEx[_newsExIndex] + _newsValue,
      },
      newsValuePRE: _newsValuePRE,
      priceAvg: avgPricePRO,
      price: priceNow,
      priceMin: priceNow,
      priceTrend: priceTrendPRO,
      round: _roundPRE + 1,
      due: current.getTime(),
      userNum: user_num,
    }
  });
  let time2 = new Date().getTime();
  console.log("系统数据更新成功", time2 - time1);
  
  // ----更新玩家数据----

  // 获取系统数据
  sys_config = await sysData.doc('system_config').get();
  sys_round = await sysData.doc('system_round').get();
  current = new Date();
  let cur_time = current.getTime();
  // 变量声明
  let _openid = '0';
  let _foodHoldVolume = 0;
  let _goldHoldVolume = 0;
  let _foodTradeFeedback = 0;
  let _goldTradeFeedback = 0;
  let _dailyLogon = new Array(0, 0);
  let _goldInterest = 0;
  let _goldDeposit = 0;
  let _goldTotal = 0;
  let _shakeShakeReady = 0;
  let _tradeAwardReady = 0;
  let _dailyAwardReady = 0;
  let _goldInterestReady = 0;
  let _goldWelfareReady = 0;
  let _foodWelfareReady = 0;
  let _foodHarvestReady = 0;
  let _timeLastAwardClick = 0;
  let _logGap = 0;
  let _actiTypeCurrent = 0;
  let _actiLeftDays = 0;
  let _actiAssigned = 0;
  let _actiTypeNext = 0;
  let _actiHarvest = 0;
  let _shakeNum = 0;
  let _existDay = 0;
  // 更新玩家数据
  for (let i = 0; i < batchTimes; i++) {
    // 获取对应batch名的数据集合
    const batch = await userData.skip(i * BATCH_SIZE).limit(BATCH_SIZE).get();
    for (let j = 0; j < batch.data.length; j++) {
      // 变量赋值
      _openid = batch.data[j].openid;
      _foodHoldVolume = batch.data[j].userInfo.foodHoldVolume;
      _goldHoldVolume = batch.data[j].userInfo.goldHoldVolume;
      _foodTradeFeedback = batch.data[j].userInfo.foodTradeFeedback;
      _goldTradeFeedback = batch.data[j].userInfo.goldTradeFeedback;
      _dailyLogon = batch.data[j].userInfo.dailyLogon;
      _goldInterest = batch.data[j].userInfo.goldInterest;
      _goldDeposit = batch.data[j].userInfo.goldDeposit;
      _shakeNum = batch.data[j].userInfo.shakeNum;
      _shakeShakeReady = batch.data[j].userInfo.shakeShakeReady;
      _tradeAwardReady = batch.data[j].userInfo.tradeAwardRead;
      _dailyAwardReady = batch.data[j].userInfo.dailyAwardReady;
      _goldInterestReady = batch.data[j].userInfo.goldInterestReady;
      _goldWelfareReady = batch.data[j].userInfo.goldWelfareReady;
      _foodWelfareReady = batch.data[j].userInfo.foodWelfareReady;
      _foodHarvestReady = batch.data[j].userInfo.foodHarvestReady;
      _timeLastAwardClick = batch.data[j].userInfo.timeLastAwardClick;
      _existDay = batch.data[j].userInfo.existDay;
      _actiTypeCurrent = batch.data[j].userPetInfo.actiTypeCurrent;
      _actiLeftDays = batch.data[j].userPetInfo.actiLeftDays;
      _actiAssigned = batch.data[j].userPetInfo.actiAssigned;
      _actiTypeNext = batch.data[j].userPetInfo.actiTypeNext;
      _actiHarvest = batch.data[j].userPetInfo.actiHarvest;
      _petLive = batch.data[j].userPetInfo.petLive;
      // -更新市场状态-
      if (batch.data[j].userInfo.goldTradeValue != 0 || batch.data[j].userInfo.foodTradeValue != 0) {
        _tradeAwardReady = 1;
        _foodTradeFeedback += Math.ceil(sys_round.data.price * batch.data[j].userInfo.goldTradeValue);
        _goldTradeFeedback += Math.ceil(batch.data[j].userInfo.foodTradeValue / sys_round.data.price);
      } else {
        _tradeAwardReady = -1;
      }
      // -更新利息状态-
      _goldInterest = Math.floor(sys_config.data.goldInterestRate * _goldDeposit)
      if (_goldInterest != 0) {
        _goldInterestReady = 1;
      }
      // -更新丰收日状态-
      if (sys_round.data.foodHarvestCount == 0) {
        _foodHarvestReady = 1;
      }
      // -更新福利金状态-
      if (_goldHoldVolume <= sys_round.data.goldWelfareThreshold) {
        _goldWelfareReady = 1;
      } else if (_goldHoldVolume > sys_round.data.goldWelfareThreshold && _goldWelfareReady == -1) {
        _goldWelfareReady = 0;
      }
      // -更新救济粮状态-
      if (_foodHoldVolume <= sys_round.data.foodWelfareThreshold) {
        _foodWelfareReady = 1;
      } else if (_foodHoldVolume > sys_round.data.foodWelfareThreshold && _foodWelfareReady == -1) {
        _foodWelfareReady = 0;
      }
      // -更新玩家活动状态-
      if (_actiTypeCurrent == 0) {
        _petLive = Math.max(0, _petLive - sys_config.data.actiFeedback.activityType0[3]);
      } else {
        _actiLeftDays = _actiLeftDays - 1;
        if (_actiLeftDays == 0) {
          _actiHarvest = _actiTypeCurrent;
          _actiTypeCurrent = 0;
        }
      }
      // -更新玩家每日登陆奖励-
      _logGap = sys_round.data.round - _timeLastAwardClick;
      if (_logGap == 1) {
        _dailyLogon[0] = sys_config.data.goldLogon;
        _dailyLogon[1] = sys_config.data.foodLogon;
        _dailyAwardReady = 1;
      } else if (_logGap < sys_config.data.logMax) {
        _dailyLogon[0] = 1 * _logGap;
        _dailyLogon[1] = 10 * _logGap;
        _dailyAwardReady = 1;
      } else if (_logGap >= sys_config.data.logMax) {
        _dailyLogon[0] = 1 * sys_config.data.logMax;
        _dailyLogon[1] = 10 * sys_config.data.logMax;
        _dailyAwardReady = 2;
      } else {
        _dailyAwardReady = -1;
      }
      // -更新玩家活力铃铛状态-
      _shakeShakeReady = 1;
      _shakeNum = 0;
      // -更新该玩家数据-
      await userData.skip(i * BATCH_SIZE).limit(BATCH_SIZE).where({
        openid: _openid
      }).update({
        data: {
          round: sys_round.data.round,
          timeStamp: {
            absolute: cur_time,
          },
          userInfo: {
            foodTradeFeedback: _foodTradeFeedback,
            goldTradeFeedback: _goldTradeFeedback,
            foodTradeValue: 0,
            goldTradeValue: 0,
            dailyLogon: _dailyLogon,
            goldInterest: _goldInterest,
            goldTotal: _goldHoldVolume + _goldDeposit,
            shakeNum: _shakeNum,
            shakeShakeReady: _shakeShakeReady,
            tradeAwardReady: _tradeAwardReady,
            dailyAwardReady: _dailyAwardReady,
            goldInterestReady: _goldInterestReady,
            goldWelfareReady: _goldWelfareReady,
            foodWelfareReady: _foodWelfareReady,
            foodHarvestReady: _foodHarvestReady,
            timeLastAwardClick: _timeLastAwardClick,
            newsExtra: null,
            exsitDay: _existDay + 1,
          },
          userPetInfo: {
            actiTypeCurrent: _actiTypeCurrent,
            actiLeftDays: _actiLeftDays,
            actiAssigned: _actiAssigned,
            actiTypeNext: _actiTypeNext,
            actiHarvest: _actiHarvest,
            petLive: _petLive,
          },
        }
      });
    }
  }
  let time3 = new Date().getTime();
  console.log("玩家数据更新成功", time3 - time2);

  //----更新世界排行榜----
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
  let time4 = new Date().getTime();
  console.log("世界排行榜更新成功", time4 - time3);
  return {};
}