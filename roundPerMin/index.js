const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const _ = db.command

exports.main = async (event, context) => {
  let current = new Date();
  let min_order = current.getMinutes();
  await db.collection('user_time').where({
    step: _.neq(min_order)
  }).update({
    data: {
      step: min_order,
    }
  });
  // 计算当前市场价格
  await cloud.callFunction({
    name: 'computePrice',
  });
  console.log("计算当前市场价格成功");
  // await cloud.callFunction({
  //   name: 'roundUpdate',
  // });
  // console.log("回合更新成功");
  return {};
}