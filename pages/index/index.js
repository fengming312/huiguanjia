var api = require('../../api.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var app = getApp();
var share_count = 0;
var width = 260;
var int = 1;
var qqmapsdk;


Page({
  data: {
		isLogin:app.globalData.isLogin,
    x: wx.getSystemInfoSync().windowWidth,
    y: wx.getSystemInfoSync().windowHeight,
    left: 0,
    show_notice: false,
    animationData: {},
    areaIndex: 0,
    area: [
      "东莞全城",
      "东城街道",
      "南城街道",
      "万江街道",
      "莞城街道",
      "石碣镇",
      "石龙镇",
      "茶山镇",
      "石排镇",
      "企石镇",
      "横沥镇",
      "桥头镇",
      "谢岗镇",
      "东坑镇",
      "常平镇",
      "寮步镇",
      "樟木头镇",
      "大朗镇",
      "黄江镇",
      "清溪镇",
      "塘厦镇",
      "凤岗镇",
      "大岭山镇",
      "长安镇",
      "虎门镇",
      "厚街镇",
      "沙田镇",
      "道滘镇",
      "洪梅镇",
      "麻涌镇",
      "望牛墩镇",
      "中堂镇",
      "高埗镇"]
  },
  bindPickerChange: function (e) {
    var page = this;
    this.setData({
      areaIndex: e.detail.value
    });
    var addressdata = this.data.area[e.detail.value];
    wx.setStorageSync('user_address', addressdata);
    app.request({
      url: api.default.index,
      data: {
        address: addressdata
      },
      success: function (res) {
        if (res.code == 0) {
          page.setData(res.data);
          wx.setStorageSync('pages_index_index', res.data);
        }
      },
      complete: function () {
        wx.stopPullDownRefresh();
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		app.pageOnLoad(this);
    this.loadData(options);
    var page = this;
    var parent_id = 0;
    var user_id = options.user_id;
    var scene = decodeURIComponent(options.scene);
    if (user_id != undefined) {
      parent_id = user_id;
    }
    else if (scene != undefined) {
      parent_id = scene;
    }
    app.loginBindParent({parent_id: parent_id});

  },

  location: function () {
    var page = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude;// "23.070888";
        let longitude = res.longitude;// "113.871918"
        let op = latitude + ',' + longitude;


        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          coord_type: 1,
          fail: function (res) {
            console.log(res);
          },
          complete: function (res) {
            console.log(res);
          },
          success: function (res) {
            console.log("位置：" + res.result.address_reference.town.title);
            wx.setStorageSync('address', res.result.address_reference.town.title);
            wx.setStorageSync('user_address', res.result.address_reference.town.title);


            var address = wx.getStorageSync('user_address');
            for (var i = 0; i < page.data.area.length; i++) {
              var addressdata = page.data.area[i];
              if (address == addressdata) {
                page.setData({
                  areaIndex: i
                });
                break;
              }
            }
            app.request({
              url: api.default.index,
              data: {
                address: res.result.address_reference.town.title
              },
              success: function (res) {
                if (res.code == 0) {
                  page.setData(res.data);
                  wx.setStorageSync('pages_index_index', res.data);
                }
              },
              complete: function () {
                wx.stopPullDownRefresh();
              }
            });

          }
        });
      }
    });
  },

  /**
   * 加载页面数据
   */
  loadData: function (options) {
    var page = this;
    var pages_index_index = wx.getStorageSync('pages_index_index');
    var address = wx.getStorageSync('user_address');

    //iphonex适配，jeffdoo，qq82639441，2018/5/22
    let isIphoneX = app.globalData.isIphoneX;
    this.setData({
      isIphoneX: isIphoneX
    });
    if (pages_index_index) {
      page.setData(pages_index_index);
    }
    if (!address) {
      address = "";
    }
    app.request({
      url: api.default.index,
      data: {
        address: address
      },
      success: function (res) {
        if (res.code == 0) {
          page.setData(res.data);
          wx.setStorageSync('pages_index_index', res.data);
          wx.setStorageSync('store', res.data.store);
          console.log("sdk=" + res.data.store.sdk_key);
          qqmapsdk = new QQMapWX({
            key: res.data.store.sdk_key
          });

          page.location();

          page.miaoshaTimer();
        }
      },
      complete: function () {
        wx.stopPullDownRefresh();
      }
    });

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    share_count = 0;
    var store = wx.getStorageSync("store");
    if (store && store.name) {
      wx.setNavigationBarTitle({
        title: store.name,
      });
    }
    clearInterval(int);
    this.notice();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    var page = this;
    var user_info = wx.getStorageSync("user_info");
    return {
      path: "/pages/index/index?user_id=" + user_info.id,
      success: function (e) {
        share_count++;
        if (share_count == 1)
          app.shareSendCoupon(page);
      }
    };
  },
  receive: function (e) {
    var page = this;
    var id = e.currentTarget.dataset.index;
    wx.showLoading({
      title: '领取中',
      mask: true,
    })
    if (!page.hideGetCoupon) {
      page.hideGetCoupon = function (e) {
        var url = e.currentTarget.dataset.url || false;
        page.setData({
          get_coupon_list: null,
        });
        if (url) {
          wx.navigateTo({
            url: url,
          });
        }
      };
    }
    app.request({
      url: api.coupon.receive,
      data: {id: id},
      success: function (res) {
        wx.hideLoading();
        if (res.code == 0) {
          page.setData({
            get_coupon_list: res.data.list,
            coupon_list: res.data.coupon_list
          });
        } else {
          wx.showToast({
            title: res.msg,
            duration: 2000
          })
          page.setData({
            coupon_list: res.data.coupon_list
          });
        }
      },
      // complete: function () {
      //   wx.hideLoading();
      // }
    });
  },

  navigatorClick: function (e) {
    var page = this;
    var open_type = e.currentTarget.dataset.open_type;
    var url = e.currentTarget.dataset.url;
    if (open_type != 'wxapp')
      return true;
    //console.log(url);
    url = parseQueryString(url);
    url.path = url.path ? decodeURIComponent(url.path) : "";
    console.log("Open New App");
    wx.navigateToMiniProgram({
      appId: url.appId,
      path: url.path,
      complete: function (e) {
        console.log(e);
      }
    });
    return false;

    function parseQueryString(url) {
      var reg_url = /^[^\?]+\?([\w\W]+)$/,
        reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
        arr_url = reg_url.exec(url),
        ret = {};
      if (arr_url && arr_url[1]) {
        var str_para = arr_url[1], result;
        while ((result = reg_para.exec(str_para)) != null) {
          ret[result[1]] = result[2];
        }
      }
      return ret;
    }
  },
  closeCouponBox: function (e) {
    this.setData({
      get_coupon_list: ""
    });
  },

  notice: function () {
    var page = this;
    var notice = page.data.notice;
    if (notice == undefined) {
      return;
    }
    var length = notice.length * 14;
    return;
    var left = 0;
    var right = 260;
    var new_width = width * (page.data.x) / 375;
    console.log(length)
    if (length < new_width) {
      return;
    }
    int = setInterval(function () {
      // if (left + new_width >= length) {
      //     left = 0;
      // } else {
      //     left += 10;
      // }
      // page.setData({
      //     left: -left
      // });

      left += 2;
      if (left + new_width >= length) {
        var l = left + new_width;
        right -= 2;
        page.setData({
          show_second: true,
        });
        if (right <= 0) {
          left = 0;
          right = 260;
          page.setData({
            show_second: false,
          });
        }
      }
      page.setData({
        left: -left,
        right: right
      });
    }, 250);
  },
  miaoshaTimer: function () {
    var page = this;
    if (!page.data.miaosha || !page.data.miaosha.rest_time)
      return;
    var timer = setInterval(function () {
      if (page.data.miaosha.rest_time > 0) {
        page.data.miaosha.rest_time = page.data.miaosha.rest_time - 1;
      } else {
        clearInterval(timer);
        return;
      }
      page.data.miaosha.times = page.getTimesBySecond(page.data.miaosha.rest_time);
      page.setData({
        miaosha: page.data.miaosha,
      });
    }, 1000);

  },

  onHide: function () {
    app.pageOnHide(this);
    clearInterval(int);
  },
  onUnload: function () {
    app.pageOnUnload(this);
    clearInterval(int);
  },
  showNotice: function () {
    this.setData({
      show_notice: true
    });
  },
  closeNotice: function () {
    this.setData({
      show_notice: false
    });
  },

  getTimesBySecond: function (s) {
    s = parseInt(s);
    if (isNaN(s))
      return {
        h: '00',
        m: '00',
        s: '00',
      };
    var _h = parseInt(s / 3600);
    var _m = parseInt((s % 3600) / 60);
    var _s = s % 60;
    return {
      h: _h < 10 ? ('0' + _h) : ('' + _h),
      m: _m < 10 ? ('0' + _m) : ('' + _m),
      s: _s < 10 ? ('0' + _s) : ('' + _s),
    };

  },

});
