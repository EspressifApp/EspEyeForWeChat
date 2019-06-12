// pages/list/list.js
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ip: "",
    faceList: [],
    selectFaces: [],
    isEdit: false,
  },
  getFaceList: function (res) {
    console.log(res);
    wx.hideLoading();
    var list = res.list;
    if (util._isEmpty(list)) {
      list = [];
    }
    this.setData({
      faceList: list 
    })
    app.globalData.faceList = list;
  },
  getFaceSend: function() {
    util.send("get", "http://" + this.data.ip + ":80/control", { var: util.GET_ID, val: util.ON_STATUS }, this.getFaceList, null);
  },
  checkboxChange: function(e) {
    this.setData({
      selectFaces: e.detail.value
    })
  },
  edit: function() {
    this.setData({
      isEdit: true
    })
  },
  cancelEdit: function() {
    this.setData({
      isEdit: false
    })
  },
  deleteAll: function() {
    const self = this;
    var selectFaces = self.data.faceList;
    if (selectFaces.length > 0) {
      wx.showModal({
        title: '清空提示',
        content: '确定要清空所有的人脸ID吗？',
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              title: '清空中...',
            })
            util.send("get", "http://" + self.data.ip + ":80/control", { var: util.DELETE_ALL, val: util.ON_STATUS }, null, null);
            setTimeout(function () {
              self.getFaceSend();
              self.setData({
                isEdit: false,
              })
            }, 1000);
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })

    }
  },
  deleteFaces: function() {
    const self = this;
    var selectFaces = this.data.selectFaces;
    if (selectFaces.length > 0) {
      wx.showModal({
        title: '删除提示',
        content: '确定要删除选中的人脸ID吗？',
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              title: '删除中...',
            })
            util.send("get", "http://" + self.data.ip + ":80/control", { var: util.FACE_DELETE, val: selectFaces}, null, null);
            setTimeout(function() {
              self.getFaceSend();
              self.setData({
                isEdit: false,
                selectFaces: [],
              })
            }, 1000);
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      ip: options.ip
    })
    wx.showLoading({
      title: '加载中...',
    })
    this.getFaceSend();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})