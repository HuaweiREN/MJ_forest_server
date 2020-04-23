// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
const db = cloud.database();
const userData = db.collection('user_data');
const sysData = db.collection('system_data');
let BATCH_SIZE = 100;

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取系统数据
  let sys_round = await sysData.doc('system_round').get();
  let sys_config = await sysData.doc('system_config').get();
  let _priceMinPRE = sys_round.data.priceMin;
  // 玩家记录总数
  const countResult = await userData.count();
  const user_num = countResult.total;
  // 计算需分几次取
  const batchTimes = Math.ceil(user_num / BATCH_SIZE);
  // -计算当前价格-
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
  let goldSysAdd = sys_config.data.goldTradeAdd;
  let foodSysAdd = sys_config.data.foodTradeAdd;
  // 当前今日精确价格
  let priceNow = (food_total + foodSysAdd) / (gold_total + goldSysAdd);
  await sysData.doc('system_round').update({
    data: {
      priceMin: priceNow,
      priceMinChange: priceNow - _priceMinPRE,
    }
  });
  return {};
}