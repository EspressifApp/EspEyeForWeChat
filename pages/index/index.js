//index.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const timeOut = 3;
var timerID = "";
var timeIpId = "";
Page({
  data: {
    deviceList: [],
    showAdd: false,
  },
  addDevice: function() {
    wx.navigateTo({
      url: '/pages/blueDevices/blueDevices'
    })
  },
  bindViewStream: function (event) {
    var self = this,
      ip = event.currentTarget.dataset.value;
    wx.navigateTo({
      url: '/pages/operate/operate?ip=' + ip
    });
  },
  //获取根节点IP
  getIP: function () {
    var self = this;
    wx.stopLocalServiceDiscovery();
    setTimeout(function () {
      wx.startLocalServiceDiscovery({
        // 当前手机所连的局域网下有一个 _http._tcp. 类型的服务
        serviceType: util.SERVICE_TYPE,
        success: function (re) {
          
          self.onTimeout(0, "未加载到设备！", true);
          var list = [];
          wx.onLocalServiceFound(function (res) {
            clearInterval(timeIpId);
            self.deduplication(res);
            app.globalData.ip = res.ip;
            app.globalData.port = res.port;
            setTimeout(function (){
              wx.hideLoading();
              wx.stopPullDownRefresh();
              self.setData({
                showAdd: true
              })
            }, 1000);
          });
          wx.onLocalServiceDiscoveryStop(function (res) {
            wx.hideLoading();
          })
        },
        fail: function (res) {
          console.log(res);
          clearInterval(timeIpId);
          self.noLoad();
        }
      })
    }, 2000)
  },
  deduplication: function(obj) {
    const self = this;
    var list = self.data.deviceList,
      ips = [];
    for (var i in list) {
      ips.push(list[i].ip);
    }
    if (ips.indexOf(obj.ip) == -1) {
      list.push(obj);
      self.setData({
        deviceList: list
      })
    }
  },
  //扫描/连接超时
  onTimeout: function (num, title, flag) {
    const self = this;
    timeIpId = setInterval(function () {
      console.log(num);
      if (num < timeOut) {
        num++;
      } else {
        clearInterval(timeIpId);
        if (flag) {
          self.noLoad();
          wx.offLocalServiceDiscoveryStop();
        }
      }
    }, 1000)
  },
  noLoad: function() {
    wx.stopPullDownRefresh();
    util.showToast('未加载到设备');
    this.setData({
      showAdd: true
    })
  },
  //分享
  onShareAppMessage: function (res) {
    return {
      title: 'ESPEye',
      path: '/pages/index/index'
    }
  },
  onLoad: function () {
    const self = this;
    util.showLoading("设备加载中...");
    self.getIP();
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
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      showAdd: false,
      deviceList: []
    })
    this.getIP();
  },
})
