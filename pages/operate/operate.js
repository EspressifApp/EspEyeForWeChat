//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const timeOut = 5;
var timerID = "";
var timeIpId = "";
Page({
  data: {
    ip: "",
    isStart: true,
    operateStart: false,
    isDetection: false,
    isRecognition: false,
    isRecord: false,
    isSelectEntry: false,
    isEntry: true,
    isLine: false,
    hiddenModal: true,
    faceId: "",
    imgSrc: "",
    time: ""
  },
  showStart: function () {
    const self = this;
    self.setData({
      operateStart: false,
    })
    if (!util._isEmpty(timerID)) {
      clearTimeout(timerID);
    }
    timerID = setTimeout(function () {
      if (!self.data.isStart) {
        self.setData({
          operateStart: true,
        });
      }
    }, 5000);
  },
  start: function () {
    this.setData({
      isStart: false,
      operateStart: true,
    });
    this.stream();
  },
  stop: function () {
    this.setData({
      isStart: true,
      isLine: false,
      isDetection: false,
      isRecognition: false,
      imgSrc: ""
    })
    util.send("get", "http://" + this.data.ip + ":80/control", { var: util.STOP_STREAM, val: util.ON_STATUS }, null, null);
  },
  detection: function () {
    const self = this;
    var data = "",
      isRecognition = self.data.isRecognition;
    if (!self.data.isDetection) {
      data = { var: util.FACE_DERECT, val: util.ON_STATUS };
    } else {
      data = { var: util.FACE_DERECT, val: util.OFF_STATUS };
      isRecognition = false;
    }
    util.send("get", "http://" + self.data.ip + ":80/control", data, null, null);
    self.setData({
      isDetection: !self.data.isDetection,
      isRecognition: isRecognition
    });
  },
  recognition: function () {
    const self = this;
    var data = "",
      isDetection = self.data.isDetection;
    if (!self.data.isRecognition) {
      data = { var: util.FACE_RECOGNIZE, val: util.ON_STATUS };
      isDetection = true;
    } else {
      data = { var: util.FACE_RECOGNIZE, val: util.OFF_STATUS };
    }
    util.send("get", "http://" + self.data.ip + ":80/control", data, null, null);
    self.setData({
      isRecognition: !self.data.isRecognition,
      isDetection: isDetection
    });
  },
  searchFace: function () {
    const self = this;
    wx.navigateTo({
      url: '/pages/list/list?ip=' + self.data.ip
    })
  },
  entry: function () {
    const self = this;
    if (self.data.isRecognition && !self.data.isSelectEntry) {
      self.setData({
        isEntry: false,
        isSelectEntry: true
      })
    } else {
      self.setData({
        isSelectEntry: false
      })
    }
  },
  hideEntry: function () {
    this.setData({
      isEntry: true,
      isSelectEntry: false
    })
  },
  bindViewInput: function (e) {
    this.setData({ faceId: e.detail.value })
  },
  showModel: function () {
    this.setData({
      isEntry: true,
      hiddenModal: false,
      faceId: ""
    });
  },
  hideModel: function () {
    this.setData({
      isEntry: true,
      isSelectEntry: false,
      hiddenModal: true,
    });
  },
  entryFace: function () {
    const self = this;
    if (util._isEmpty(self.data.faceId)) {
      wx.showToast({
        title: "请输入人脸ID",
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    var faceList = app.globalData.faceList;
    if (util._isEmpty(faceList)) {
      faceList = [];
    }
    if (faceList.indexOf(self.data.faceId) != -1) {
      wx.showToast({
        title: "人脸ID已存在",
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    var reg = /^[A-Za-z0-9]+$/;
    if (!reg.test(self.data.faceId)) {
      wx.showToast({
        title: "人脸ID格式有误",
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    var data = { var: util.FACE_ENROll, val: self.data.faceId };
    util.send("get", "http://" + self.data.ip + ":80/control", data, null, null);
    self.setData({
      isEntry: true,
      hiddenModal: true,
      isSelectEntry: false,
    });
  },
  stream: function () {
    const self = this;
    console.log("开始调用");
    self.setData({
      isLine: true,
      imgSrc: "http://" + self.data.ip + ":81/stream"
    });
    util.send("get", "http://" + self.data.ip + ":80/status", null, self.getStatus, null);
    util.send("get", "http://" + self.data.ip + ":80/control", { var: util.GET_ID, val: util.ON_STATUS }, self.getFaceList, null);
  },
  getFaceList: function (res) {
    console.log(res);
    app.globalData.faceList = res.list;
  },
  getStatus: function (res) {
    console.log(res);
    console.log(res.face_detect);
    var isDetection = false,
      isRecognition = false,
      isRecord = false;
    if (res.face_detect == 1) {
      isDetection = true;
    }
    if (res.face_recognize == 1) {
      isRecognition = true;
    }
    if (res.face_enroll == 1) {
      isRecord = true;
    }
    this.setData({
      isDetection: isDetection,
      isRecognition: isRecognition,
      isRecord: isRecord
    });
  },
  onLoad: function (options) {
    this.setData({
      ip: options.ip
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },
})
