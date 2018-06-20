// pages/cat/cat.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cat_list: [],
        sub_cat_list_scroll_top: 0,
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
          "高埗镇" ] 
    },
    bindPickerChange: function (e) {
      this.setData({
        areaIndex: e.detail.value
      });
      var addressdata = this.data.area[e.detail.value];
      wx.setStorageSync('user_address', addressdata);
      this.loadData();
    } ,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      var page = this;
        app.pageOnLoad(this);
        this.setData({
            store: wx.getStorageSync("store"),
        });
        var address = wx.getStorageSync('user_address');
        for (var i = 0; i < page.data.area.length; i++) {
          var addressdata = page.data.area[i];
          if (address == addressdata) {
            this.setData({
              areaIndex: i
            });
            break;
          }
        }
    },

    onShow: function () {
      let isIphoneX = app.globalData.isIphoneX;
      this.setData({
        isIphoneX: isIphoneX
      });
        this.loadData();
    },

    loadData: function (options) {
        var page = this;
        var cat_list = wx.getStorageSync("cat_list");
        if (cat_list) {
            page.setData({
                cat_list: cat_list,
                current_cat: null,
            });
        }
        app.request({
            url: api.default.cat_list,
            success: function (res) {
                if (res.code == 0) {
                    if(res.data.list.length > 0)
                    {
                    	 res.data.list[0].active = true;
                    	 page.setData({
                             current_cat: res.data.list[0],
                             cat_list: res.data.list,
                         });
                    }
                    else{
                    	 page.setData({
                             cat_list: res.data.list,
                             current_cat: null,
                         });
                    }
                    wx.setStorageSync("cat_list", res.data.list);
                }
            },
            complete: function () {
                wx.stopPullDownRefresh();
            }
        });
    },

    catItemClick: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var cat_list = page.data.cat_list;
        var scroll_top = 0;
        var add_scroll_top = true;
        var current_cat = null;
        for (var i in cat_list) {
            if (i == index) {
                cat_list[i].active = true;
                add_scroll_top = false;
                current_cat = cat_list[i];
            } else {
                cat_list[i].active = false;
                if (add_scroll_top) {
                    //scroll_top += 62;
                    //scroll_top += 45;
                    //var row_count = Math.ceil(cat_list[i].list.length / 3);
                    //scroll_top += row_count * (79 + 2);

                    //scroll_top += cat_list[i].list.length * 76;
                }
            }
        }
        console.log(current_cat);
        page.setData({
            cat_list: cat_list,
            sub_cat_list_scroll_top: scroll_top,
            current_cat: current_cat,
        });
    },

});