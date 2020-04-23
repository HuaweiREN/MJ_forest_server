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
  const sys_data = _sys.data[0];
  let current = new Date();
  let cur_time = current.getTime();
  // 玩家记录总数
  const countResult = await userData.count();
  const user_num = countResult.total;
  // 计算需分几次取
  const batchTimes = Math.ceil(user_num / BATCH_SIZE);
  // 变量声明
  let _openid = '0';
  let _foodHoldVolume = 0;
  let _goldHoldVolume = 0;
  let _foodTradeFeedback = 0;
  let _goldTradeFeedback = 0;
  let _dailyLogon = new Array(0, 0);
  let _goldInterest = 0;
  let _goldDeposit = 0;
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
      _actiTypeCurrent = batch.data[j].userPetInfo.actiTypeCurrent;
      _actiLeftDays = batch.data[j].userPetInfo.actiLeftDays;
      _actiAssigned = batch.data[j].userPetInfo.actiAssigned;
      _actiTypeNext = batch.data[j].userPetInfo.actiTypeNext;
      _actiHarvest = batch.data[j].userPetInfo.actiHarvest;
      _petLive = batch.data[j].userPetInfo.petLive;
      // -更新市场状态-
      if (batch.data[j].userInfo.goldTradeValue != 0 || batch.data[j].userInfo.foodTradeValue != 0) {
        _tradeAwardReady = 1;
        _foodTradeFeedback += Math.ceil(sys_data.price * batch.data[j].userInfo.goldTradeValue);
        _goldTradeFeedback += Math.ceil(batch.data[j].userInfo.foodTradeValue / sys_data.price);
      } else {
        _tradeAwardReady = -1;
      }
      // -更新利息状态-
      _goldInterest = Math.floor(sys_data.goldInterestRate * _goldDeposit)
      if (_goldInterest != 0) {
        _goldInterestReady = 1;
      }
      // -更新丰收日状态-
      if (sys_data.foodHarvestCount == 0) {
        _foodHarvestReady = 1;
      }
      // -更新福利金状态-
      if (_goldHoldVolume <= sys_data.goldWelfareThresold) {
        _goldWelfareReady = 1;
      } else if (_goldHoldVolume > sys_data.goldWelfareThresold && _goldWelfareReady == -1) {
        _goldWelfareReady = 0;
      }
      // -更新救济粮状态-
      if (_foodHoldVolume <= sys_data.foodWelfareThresold) {
        _foodWelfareReady = 1;
      } else if (_foodHoldVolume > sys_data.foodWelfareThresold && _foodWelfareReady == -1) {
        _foodWelfareReady = 0;
      }
      // -更新玩家活动状态-
      if (_actiTypeCurrent == 0) {
        _petLive = Math.max(0, _petLive - sys_data.actiFeedback[0].live);
      } else {
        _actiLeftDays = _actiLeftDays - 1;
        if (_actiLeftDays == 0) {
          _actiHarvest = _actiTypeCurrent;
          _actiTypeCurrent = 0;
        }
      }
      // -更新玩家每日登陆奖励-
      logGap = Math.floor((cur_time - _timeLastAwardClick) / (3600 * 1000));
      if (logGap < sys_data.logMax) {
        _dailyLogon[0] = sys_data.goldLogon * (logGap + 1);
        _dailyLogon[1] = sys_data.foodLogon * (logGap + 1);
        _dailyAwardReady = 1;
      } else {
        _dailyLogon[0] = sys_data.goldLogon * sys_data.logMax;
        _dailyLogon[1] = sys_data.foodLogon * sys_data.logMax;
        _dailyAwardReady = 2;
      }
      // -更新玩家活力铃铛状态-
      _shakeShakeReady = 1;
      _shakeNum = 0;
      // -更新该玩家数据-
      await userData.skip(i * BATCH_SIZE).limit(BATCH_SIZE).where({
        openid: _openid
      }).update({
        data: {
          round: sys_data.round,
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
  return {};
}