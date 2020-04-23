// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let current = new Date();
  let server_time = {
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
  };
  return server_time;
} 