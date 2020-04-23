// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const userData = db.collection('user_data');
const sysData = db.collection('system_data');

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取系统数据
  let sys_config = await sysData.doc('system_config').get();
  let sys_round = await sysData.doc('system_round').get();
  // 获取玩家数据
  const wxContext = cloud.getWXContext();
  let _user = await userData.where({
    openid: wxContext.OPENID,
  }).get();
  // 判断请求类型
  if (event.code == 12) {
    console.log("领取市场收入");
    let _foodTradeFeedback = _user.data[0].userInfo.foodTradeFeedback;
    let _goldTradeFeedback = _user.data[0].userInfo.goldTradeFeedback;
    let _foodHoldVolume = _user.data[0].userInfo.foodHoldVolume;
    let _goldHoldVolume = _user.data[0].userInfo.goldHoldVolume;
    let _tradeAwardReady = _user.data[0].userInfo.tradeAwardReady;
    if (_tradeAwardReady == 1) {
      await userData.where({
        openid: wxContext.OPENID,
      }).update({
        data: {
          userInfo: {
            foodTradeFeedback: 0,
            goldTradeFeedback: 0,
            foodHoldVolume: _foodHoldVolume + _foodTradeFeedback,
            goldHoldVolume: _goldHoldVolume + _goldTradeFeedback,
            tradeAwardReady: -1,
          }
        }
      });
      return {
        mjCode: 12,
        permitFlag: true,
        rcvID: [...event.IDList],
        rcvData: [_goldHoldVolume + _goldTradeFeedback, _foodHoldVolume + _foodTradeFeedback, 0, 0, -1],
      };
    }
    else {
      return {};
    }
  } else if (event.code == 29) {
    console.log("调整市场金币投入");
    let _goldTradeValue = _user.data[0].userInfo.goldTradeValue;
    let _goldHoldVolume = _user.data[0].userInfo.goldHoldVolume;
    let _goldDelta = event.data;
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userInfo: {
          goldTradeValue: _goldTradeValue + _goldDelta,
          goldHoldVolume: _goldHoldVolume - _goldDelta,
        }
      }
    });
    return {
      mjCode: 29,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [_goldHoldVolume - _goldDelta, _goldTradeValue + _goldDelta, _goldDelta],
    };
  } else if (event.code == 31) {
    console.log("调整市场粮食投入");
    let _foodTradeValue = _user.data[0].userInfo.foodTradeValue;
    let _foodHoldVolume = _user.data[0].userInfo.foodHoldVolume;
    let _foodDelta = event.data;
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userInfo: {
          foodTradeValue: _foodTradeValue + _foodDelta,
          foodHoldVolume: _foodHoldVolume - _foodDelta,
        }
      }
    });
    return {
      mjCode: 31,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [_foodHoldVolume - _foodDelta, _foodTradeValue + _foodDelta, _foodDelta],
    };
  } else if (event.code == 23) {
    console.log("领取福利金收入");
    let _goldWelfareValue = sys_config.data.goldWelfareValue;
    let _goldHoldVolume = _user.data[0].userInfo.goldHoldVolume;
    let _goldWelfareReady = _user.data[0].userInfo.goldWelfareReady;
    if (_goldWelfareReady == 1) {
      await userData.where({
        openid: wxContext.OPENID,
      }).update({
        data: {
          userInfo: {
            goldHoldVolume: _goldHoldVolume + _goldWelfareValue,
            goldWelfareReady: -1,
          }
        }
      });
      return {
        mjCode: 23,
        permitFlag: true,
        rcvID: [...event.IDList],
        rcvData: [_goldHoldVolume + _goldWelfareValue, _goldWelfareValue, -1],
      };
    }
    else {
      return {};
    }
  } else if (event.code == 24) {
    console.log("存储银行存款");
    let _goldDeposit = _user.data[0].userInfo.goldDeposit;
    let _goldHoldVolume = _user.data[0].userInfo.goldHoldVolume;
    let _goldDelta = event.data;
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userInfo: {
          goldHoldVolume: _goldHoldVolume - _goldDelta,
          goldDeposit: _goldDeposit + _goldDelta,
        }
      }
    });
    return {
      mjCode: 24,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [_goldHoldVolume - _goldDelta, _goldDeposit + _goldDelta, _goldDelta],
    };
  } else if (event.code == 25) {
    console.log("提取银行存款");
    let _goldDeposit = _user.data[0].userInfo.goldDeposit;
    let _goldHoldVolume = _user.data[0].userInfo.goldHoldVolume;
    let _goldDelta = event.data;
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userInfo: {
          goldHoldVolume: _goldHoldVolume + _goldDelta,
          goldDeposit: _goldDeposit - _goldDelta,
        }
      }
    });
    return {
      mjCode: 25,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [_goldHoldVolume + _goldDelta, _goldDeposit - _goldDelta, _goldDelta],
    };
  } else if (event.code == 26) {
    console.log("领取银行收入");
    let _goldInterest = _user.data[0].userInfo.goldInterest;
    let _goldHoldVolume = _user.data[0].userInfo.goldHoldVolume;
    let _goldInterestReady = _user.data[0].userInfo.goldInterestReady;
    if (_goldInterestReady == 1) {
      await userData.where({
        openid: wxContext.OPENID,
      }).update({
        data: {
          userInfo: {
            goldInterest: 0,
            goldHoldVolume: _goldHoldVolume + _goldInterest,
            goldInterestReady: -1,
          }
        }
      });
      return {
        mjCode: 26,
        permitFlag: true,
        rcvID: [...event.IDList],
        rcvData: [_goldHoldVolume + _goldInterest, _goldInterest, -1],
      };
    }
    else {
      return {};
    }
  } else if (event.code == 27) {
    console.log("领取救济粮收入");
    let _foodWelfareValue = sys_config.data.foodWelfareValue;
    let _foodHoldVolume = _user.data[0].userInfo.foodHoldVolume;
    let _foodWelfareReady = _user.data[0].userInfo.foodWelfareReady;
    if (_foodWelfareReady == 1) {
      await userData.where({
        openid: wxContext.OPENID,
      }).update({
        data: {
          userInfo: {
            foodHoldVolume: _foodHoldVolume + _foodWelfareValue,
            foodWelfareReady: -1,
          }
        }
      });
      return {
        mjCode: 27,
        permitFlag: true,
        rcvID: [...event.IDList],
        rcvData: [_foodHoldVolume + _foodWelfareValue, _foodWelfareValue, -1],
      };
    }
    else {
      return {};
    }
  } else if (event.code == 28) {
    console.log("领取丰收日收入");
    let _foodHarvestValue = sys_config.data.foodHarvestValue;
    let _foodHoldVolume = _user.data[0].userInfo.foodHoldVolume;
    let _foodHarvestReady = _user.data[0].userInfo.foodHarvestReady;
    if (_foodHarvestReady == 1) {
      await userData.where({
        openid: wxContext.OPENID,
      }).update({
        data: {
          userInfo: {
            foodHoldVolume: _foodHoldVolume + _foodHarvestValue,
            foodHarvestReady: -1,
          }
        }
      });
      return {
        mjCode: 28,
        permitFlag: true,
        rcvID: [...event.IDList],
        rcvData: [_foodHoldVolume + _foodHarvestValue, _foodHarvestValue, -1],
      };
    }
    else {
      return {};
    }
  } else if (event.code == 15) {
    console.log("使用摇一摇");
    let _petLive = event.data[0];
    let _shakeShakeReady = event.data[1];
    let _shakeNum = event.data[2];
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userInfo: {
          shakeNum: _shakeNum,
          shakeShakeReady: _shakeShakeReady,
        },
        userPetInfo: {
          petLive: _petLive,
        }
      }
    });
    return {
      mjCode: 15,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [_petLive, _shakeShakeReady, _shakeNum],
    };
  } else if (event.code == 16) {
    console.log("喂食");
    let _feedValue = event.data;
    let _foodHoldVolume = _user.data[0].userInfo.foodHoldVolume;
    let _petExpeValueNow = _user.data[0].userPetInfo.petExpeValueNow;
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userInfo: {
          foodHoldVolume: _foodHoldVolume - _feedValue,
        },
        userPetInfo: {
          petExpeValueNow: _petExpeValueNow + _feedValue,
        }
      }
    });
    return {
      mjCode: 16,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [_foodHoldVolume - _feedValue, _feedValue, _petExpeValueNow + _feedValue],
    };
  } else if (event.code == 17) {
    console.log("升级");
    let _feedMax = event.data;
    let _foodHoldVolume = _user.data[0].userInfo.foodHoldVolume - _feedMax;
    let _petLevel = _user.data[0].userPetInfo.petLevel + 1;
    let _petExpeTotNow = sys_config.data.petExpUp[_petLevel - 1];
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userInfo: {
          foodHoldVolume: _foodHoldVolume,
        },
        userPetInfo: {
          petExpeValueNow: 0,
          petLevel: _petLevel,
          petExpeTotNow: _petExpeTotNow,
        }
      }
    });
    return {
      mjCode: 17,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [_foodHoldVolume, 0, _feedMax, _petLevel, _petExpeTotNow],
    };
  } else if (event.code == 18) {
    console.log("取消当前活动");
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userPetInfo: {
          actiTypeCurrent: 0,
          actiLeftDays: 0,
        }
      }
    });
    return {
      mjCode: 18,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [0, 0],
    };
  } else if (event.code == 19) {
    console.log("安排当前活动");
    let _actiTypeCurrent = event.data[0];
    let _petLive = event.data[1];
    let _actiLeftDays = sys_config.data.actiFeedback['activityType' + _actiTypeCurrent][0];
    _petLive = _petLive - sys_config.data.actiFeedback['activityType' + _actiTypeCurrent][3];
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userPetInfo: {
          actiTypeCurrent: _actiTypeCurrent,
          actiLeftDays: _actiLeftDays,
          petLive: _petLive,
        }
      }
    });
    return {
      mjCode: 19,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [1, _actiTypeCurrent, _petLive, _actiLeftDays],
    };
  } else if (event.code == 21) {
    console.log("取消下一步活动");
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userPetInfo: {
          actiAssigned: 0,
          actiTypeNext: 0,
        }
      }
    });
    return {
      mjCode: 21,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [0, 0],
    };
  } else if (event.code == 22) {
    console.log("领取活动奖励");
    const _goldHoldVolume = event.data[0];
    const _foodHoldVolume = event.data[1];
    const _newsExtra = event.data[2];
    const _petLive = event.data[3];
    const _actiTypeCurrent = event.data[4];
    const _actiLeftDays = event.data[5];
    const _actiAssigned = event.data[6];
    const _actiTypeNext = event.data[7];
    const _actiHarvest = event.data[8];
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userInfo: {
          goldHoldVolume: _goldHoldVolume,
          foodHoldVolume: _foodHoldVolume,
          newsExtra: _newsExtra
        },
        userPetInfo: {
          petLive: _petLive,
          actiTypeCurrent: _actiTypeCurrent,
          actiLeftDays: _actiLeftDays,
          actiAssigned: _actiAssigned,
          actiTypeNext: _actiTypeNext,
          actiHarvest: -1,
        }
      }
    });
    return {
      mjCode: 22,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [_goldHoldVolume, _foodHoldVolume, _newsExtra, _petLive, _actiTypeCurrent, _actiLeftDays, _actiAssigned, _actiTypeNext, -1],
    };
  } else if (event.code == 32) {
    console.log("确定宠物类型");
    let _petSelected = event.data;
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userInfo: {
          INIT: false,
        },
        userPetInfo: {
          petType: _petSelected,
        }
      }
    });
    return {
      mjCode: 32,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [_petSelected, false],
    };
  } else if (event.code == 14) {
    console.log("领取任务奖励");
    let _taskNum = event.data;
    let _goldHoldVolume = _user.data[0].userInfo.goldHoldVolume;
    let _foodHoldVolume = _user.data[0].userInfo.foodHoldVolume;
    let _petLive = _user.data[0].userPetInfo.petLive;
    let _taskHarvest = _user.data[0].userTaskInfo.taskHarvest;
    let _taskHarvestType = _user.data[0].userTaskInfo.taskHarvestType;
    let _taskHarvested = _user.data[0].userInfo.taskHarvested;
    switch (_taskNum) {
      case 0:
        _goldHoldVolume = _goldHoldVolume + _taskHarvest[_taskNum];
        break;
      case 1:
        _foodHoldVolume = _foodHoldVolume + _taskHarvest[_taskNum];
        break;
      case 2:
        _petLive = Math.min(_petLive + _taskHarvest[_taskNum], 100);
        break;
      default:
        return {};
    };
    _taskHarvested[_taskNum] = -1;
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: {
        userInfo: {
          goldHoldVolume: _goldHoldVolume,
          foodHoldVolume: _foodHoldVolume,
          taskHarvested: _taskHarvested,
        },
        userPetInfo: {
          petLive: _petLive,
        }
      }
    });
    return {
      mjCode: 14,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [_goldHoldVolume, _foodHoldVolume, _taskHarvestType[_taskNum], _taskHarvest[_taskNum], _taskNum, _petLive, _taskHarvested[_taskNum]],
    };
  } else if (event.code == 34) {
    console.log("申请重置云存档");
    let _goldHoldVolume = _user.data[0].userInfo.goldHoldVolume;
    let _foodHoldVolume = _user.data[0].userInfo.foodHoldVolume;
    let _goldDeposit = _user.data[0].userInfo.goldDeposit;
    let _goldInterest = _user.data[0].userInfo.goldInterest;
    let current = new Date();
    let logData = {
      timeStamp: {
        absolute: current.getTime(),
        relative: _user.data[0].timeStamp.relative,
      },
      sysDate: {
        MM: current.getMonth() + 1,
        DD: current.getDate(),
        HH: current.getHours(),
        Minu: current.getMinutes(),
        Secon: current.getSeconds(),
        Milli: current.getMilliseconds(),
      },
      userInfo: {
        INIT: true,
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
    await userData.where({
      openid: wxContext.OPENID,
    }).update({
      data: logData
    });
    return {
      mjCode: 34,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [true],
    };
  } else if (event.code == 11) {
    console.log("领取登录奖励");
    let _goldHoldVolume = _user.data[0].userInfo.goldHoldVolume;
    let _foodHoldVolume = _user.data[0].userInfo.foodHoldVolume;
    let _dailyLogon = _user.data[0].userInfo.dailyLogon;
    let _dailyAwardReady = _user.data[0].userInfo.dailyAwardReady;
    let current = new Date();
    if (_dailyAwardReady >= 1) {
      await userData.where({
        openid: wxContext.OPENID,
      }).update({
        data: {
          userInfo: {
            goldHoldVolume: _goldHoldVolume + _dailyLogon[0],
            foodHoldVolume: _foodHoldVolume + _dailyLogon[1],
            dailyAwardReady: -1,
            timeLastAwardClick: sys_round.data.round,
          },
        }
      });
      return {
        mjCode: 11,
        permitFlag: true,
        rcvID: [...event.IDList],
        rcvData: [_goldHoldVolume + _dailyLogon[0], _foodHoldVolume + _dailyLogon[1], _dailyLogon[0], _dailyLogon[1], current.getTime(), -1],
      };
    }
    else {
      return {};
    }
  } else if (event.code == 35) {
    console.log("获取当前市场价格");
    let _priceMin = sys_round.data.priceMin;
    let _priceMinChange = sys_round.data.priceMinChange;
    return {
      mjCode: 35,
      permitFlag: true,
      rcvID: [...event.IDList],
      rcvData: [_priceMin, _priceMinChange],
    };
  }
}