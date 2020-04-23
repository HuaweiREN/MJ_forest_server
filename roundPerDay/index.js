// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const userData = db.collection('user_data');
let BATCH_SIZE = 100;
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // 玩家记录总数
  const countResult = await userData.count();
  const user_num = countResult.total;
  // 计算需分几次取
  const batchTimes = Math.ceil(user_num / BATCH_SIZE);
  // 更新玩家数据
  for (let i = 0; i < batchTimes; i++) {
    // 获取对应batch名的数据集合
    const batch = await userData.skip(i * BATCH_SIZE).limit(BATCH_SIZE).get();
    for (let j = 0; j < batch.data.length; j++) {
      await userData.skip(i * BATCH_SIZE).limit(BATCH_SIZE).where({
        taskHarvested: _.neq([1, 1, 1])
      }).update({
        data: {
          userInfo: {
            taskHarvested: [1, 1, 1],
          },
        }
      });
    }
  }
  console.log("每日更新成功");
  return {};
}