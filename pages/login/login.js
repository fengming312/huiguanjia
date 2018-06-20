var app = getApp();
Page({
	bindGetUserInfo: function(e){
		var that = this;
		//此处授权得到userInfo
		if (e.detail.userInfo) {
			wx.navigateBack({
				delta: 1
			})
		}
	},
})