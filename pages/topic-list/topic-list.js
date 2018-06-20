// pages/topic-list/topic-list.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
    	cats : [],
    	currentTab : 0,
    	current_catid : 0,
    	list : []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
        var page = this;
        
        page.loadTopicCatList();
        
        page.resetHeight();
       
    },
    
    resetHeight : function(){
    	 var that = this; 
         //  高度自适应
         wx.getSystemInfo( {  
             success: function( res ) {  
            	 if(that.data.list.length == 0 )
                 {
            		 that.setData( {  
                         winHeight: 200  
                     });
                 }
            	 else{
            		 var clientHeight=res.windowHeight,
                      clientWidth=res.windowWidth,
                      rpxR=750/clientWidth;
		               var  calc=clientHeight * rpxR + 600;
		                 console.log("高度："+calc)
		                 that.setData( {  
		                     winHeight: calc  
		                 });  
            	 }
                 
             }  
         });
    },

    loadTopicCatList: function (args) {
    	app.pageOnLoad(this);
        var page = this;
        page.setData({
            is_loading: true,
        });
        app.request({
            url: api.default.topic_cat_list,
            data: {
            },
            success: function (res) {
                if (res.code == 0) {
                	var catid = 0;
                	if(res.data.list.length > 0)
                	{
                		catid = res.data.list[0].id;
                	}
                	page.setData({
                        cats: res.data.list,
                        current_catid : catid,
                        is_loading: false
                    });
                	
	               page.loadTopicList({
	                  page: 1,
	                  reload: true,
	              });
	                	
	               
                } else {
                	
                }
            },
            complete: function () {
                page.setData({
                    is_loading: false,
                });
            }
        });
    },
    
    
    loadTopicList: function (args) {
        var page = this;
        if (page.data.is_loading)
            return;
        if (args.loadmore && !page.data.is_more)
            return;
        page.setData({
            is_loading: true,
        });
        app.request({
            url: api.default.topic_list,
            data: {
                page: args.page,
                catid : page.data.current_catid,
            },
            success: function (res) {
                if (res.code == 0) {
                    if (args.reload) {
                        page.setData({
                            list: res.data.list,
                            page: args.page,
                            is_more: res.data.list.length > 0
                        });
                    }
                    if (args.loadmore) {
                        page.setData({
                            list: page.data.list.concat(res.data.list),
                            page: args.page,
                            is_more: res.data.list.length > 0
                        });
                    }
                    page.resetHeight();
                } else {
                }
            },
            complete: function () {
                page.setData({
                    is_loading: false,
                });
            }
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      let isIphoneX = app.globalData.isIphoneX;
      this.setData({
        isIphoneX: isIphoneX
      });
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var page = this;
        page.loadTopicList({
            page: 1,
            reload: true,
        });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var page = this;
        page.loadTopicList({
            page: page.data.page + 1,
            loadmore: true,
        });
    },
      
    // 滚动切换标签样式
    switchTab:function(e){
    	var page = this;
    	var current = e.detail.current;
    	var catid = page.data.cats[current].id;
        this.setData({
            currentTab:e.detail.current,
            current_catid : catid,
        });
        this.checkCor();
        
        page.loadTopicList({
            page: 1,
            reload: true,
        });
        
    },
    // 点击标题切换当前页时改变样式
    swichNav:function(e){
    	var page = this;
    	
        var cur=e.target.dataset.current;
        if(this.data.currentTaB==cur){return false;}
        else{
            this.setData({
                currentTab:cur,
                current_catid : e.target.dataset.current_catid,
            })
        }
        
        page.loadTopicList({
            page: 1,
            reload: true,
        });
    },
    //判断当前滚动超过一屏时，设置tab标题滚动条。
    checkCor:function(){
      if (this.data.currentTab>4){
        this.setData({
          scrollLeft:300
        })
      }else{
        this.setData({
          scrollLeft:0
        })
      }
    },
});