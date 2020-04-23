// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const userData = db.collection('user_data');
const sysData = db.collection('system_data');
let BATCH_SIZE = 100;

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取系统数据
  let _sys = await sysData.where({
    id: 'system'
  }).get();
  let priceTrendPRE = _sys.data[0].priceTrend;
  let roundPRE = _sys.data[0].round;
  const _welfareRate = _sys.data[0].welfareRate;
  const newsListLen = _sys.data[0].newsList.newsList.length;
  const newsExListLen = _sys.data[0].newsList.newsExList.length;
  const newsExExListLen = _sys.data[0].newsList.newsExExList.length;
  let current = new Date();
  // 玩家记录总数
  const countResult = await userData.count();
  const user_num = countResult.total;
  // 计算需分几次取
  const batchTimes = Math.ceil(user_num / BATCH_SIZE);

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
  // 添加调控
  let goldSysAdd = _sys.data[0].goldAdd;
  let foodSysAdd = _sys.data[0].foodAdd;
  // 计算今日精确价格
  let priceNow = (food_total + foodSysAdd) / (gold_total + goldSysAdd);
  // 保留价格至两位小数
  // let priceAppro = Math.round(priceNow * 100) / 100;
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
  let batch_id = Math.floor(user_num * _welfareRate / BATCH_SIZE);
  let user_id = Math.floor(user_num * _welfareRate) % BATCH_SIZE;
  // 找到福利金临界值
  const batch_gold = await userData.skip(batch_id * BATCH_SIZE).limit(BATCH_SIZE).orderBy('userInfo.goldHoldVolume', 'asc').get()
  let goldWelfareNow = batch_gold.data[user_id].userInfo.goldHoldVolume;

  // -更新救济粮-
  // 找到福利粮临界值
  const batch_food = await userData.skip(batch_id * BATCH_SIZE).limit(BATCH_SIZE).orderBy('userInfo.foodHoldVolume', 'asc').get()
  let foodWelfareNow = batch_food.data[user_id].userInfo.foodHoldVolume;

  // -更新丰收状态-
  let harvest_count = _sys.data[0].foodHarvestCount;
  const harvest_period = _sys.data[0].foodHarvestPeriod;
  harvest_count = (harvest_count + 23) % harvest_period;

  // -更新世界新闻-
  let newsIndex = Math.floor(Math.random() * newsListLen);
  let newsExIndex = Math.floor(Math.random() * newsExListLen);
  let newsExExIndex = Math.floor(Math.random() * newsExExListLen);
  
  // -更新系统数据-
  let sysNow = {
    foodHarvestCount: harvest_count,
    foodWelfareThresold: foodWelfareNow,
    goldWelfareThresold: goldWelfareNow,
    newsNow: {
      newsNow: newsIndex,
      newsExNow: newsExIndex,
      newsExExNow: newsExExIndex,
    },
    priceAvg: avgPricePRO,
    price: priceNow,
    priceMin: priceNow,
    priceTrend: priceTrendPRO,
    round: roundPRE + 1,
    timeNow: current.getTime(),
    userNum: user_num,
  }
  await sysData.where({
    id: 'system'
  }).update({
    data: sysNow
  });
  return {};
}