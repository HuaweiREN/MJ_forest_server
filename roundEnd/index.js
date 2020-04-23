const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const _ = db.command

exports.main = async (event, context) => {
  await db.collection('user_time').where({
    step: _.neq(59.3)
  }).update({
    data: {
      step: 59.3,
    }
  });
  console.log("回合结束");
  return {};
}