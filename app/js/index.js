$(document).ready(function(){
	//命名空间
	var pub = {};
	pub.getAdd = function(){
		var address = window.location.href;
		var n = address.indexOf("index.html");
		var m = address.indexOf(".html");
		var state = common.getUrlParam("state");
		var _n = address.indexOf("?");
		var add = '';
		if (state) {
			add = address.substr(0,_n)+"html/";
		}else{
			if (m == '-1') {
				add = address + "html/";				
			}else{
				add = address.substr(0,n)+"html/";
			}
		}
		return add;
	};
	$.extend(pub,{
		code : common.getUrlParam("code"),
		wexinCode:sessionStorage.weixinCode,
		websiteNode:common.websiteNode,
		logined:common.getIslogin(),
		openid:localStorage.getItem("openid"),
		add : pub.getAdd()
	});
	
	if (pub.logined) {
		pub.firmId = common.user_data().firmInfoid;
		pub.source='firmId'+common.user_data().firmInfoid;
		pub.sign=md5('firmId'+common.user_data().firmInfoid+"key"+common.secretKey()).toUpperCase();
	}
	pub.index_Vue = new Vue({
		el:"#index_Vue",
		data:{
			isLogin:common.getIslogin(),
			websiteNode:common.websitData[pub.websiteNode],
			topList:[],
			centerList:[],
			noticeInfoList:[],
			index_goodsItem:[],
			footer_data:[
				{dlClass:"ok" ,dataUrl:'',dataUrl1:'', dtClass:"sprite tab_bar_home_b" ,txt:"首页"  },
				{dlClass:"no" , dataUrl:"html/moreGoods.html", dataUrl1:"html/moreGoods.html",dtClass:"sprite tab_bar_more_a", txt:"更多商品" },
				{dlClass:"no" , dataUrl:"html/wo.html", dataUrl1:"html/wo.html",dtClass:"sprite tab_bar_mine_a", txt:"我"},
				{dlClass:"no" ,dataUrl:"html/login.html",dataUrl1:"html/message.html", dtClass:"sprite tab_bar_Message_a", txt:"信息"}
			],
			notice:null,
			noticeTitle:null,
			noticeContent:null,
			
		},
		computed:{

		},
		watch:{
			noticeInfoList:function(){
				 this.$nextTick(function(){
				 	/*现在数据已经渲染完毕*/
				 	var mySwiper = new Swiper ('.banner', {
					    direction: 'horizontal',
					    loop: true,
					    autoplay:5000,
					    paginationClickable:true,
					    // 如果需要分页器
					    pagination: '.swiper-pagination'
					});
						var mySwiper = new Swiper ('.gonggao', {
						    direction: 'vertical',
						    noSwiping : true,
						    height:50,
						    loop: true,
						    autoplay:4000,
						    spend:2000
					});
        		})
			}
		
		},
		methods:{
			search:function(){
				common.jump("html/search.html");
			},
			jumpURl:function(item){
				common.txq(item,1)
			},
			getLinkUrl : function (item){
				var x ="";
			var type = item.jumpType,
				code = item.linkUrl,
				tit = item.adTime || x ;
				code = code.trim();
				if (type) {
					if (type == 1) {
						var codeArr = code.split("&");
						return pub.add + "moreGoods.html?typeCode="+codeArr[1];
					}else if (type == 2) {
						return pub.add + "goodsDetails.html?goodsId="+code;
					}else if (type == 3) {
						return pub.add + "details.html?linUrl="+code + "&title="+tit;
					}else if(type == 4){
						return pub.add + "online_coupon.html";
					}
				}
				return 'javascript:void(0)';
			},
			//返回创建的多少列商品
			 getColumnNum:function(item){
			 	var d = item.goodsNum
				if (d == 1 || d == 2 || d == 3) {
					return d;
				}
				return 1;
			},
			//返回创建多少行商品
			getLineNum:function (item){
				var d = item.rowNum
				if (d >= 1) {
					return parseInt(d);
				}
				return 1;
			},
			dlClick:function(a){
				sessionStorage.removeItem("twotype");
				sessionStorage.removeItem("goodtype");
				//原生js 判断是否有此Class  
				//element.currentTarget.classList.contains('no') && common.jump(element.currentTarget.getAttribute("data"))
				
				if(pub.logined){
					common.jump(a.dataUrl1)
				}else{
					common.jump(a.dataUrl)
				}
			},
			liClick:function(){
				this.notice = this.noticeInfoList
				var index = event.target.getAttribute("data-swiper-slide-index")
				this.noticeContent = this.noticeInfoList[index].noticeContent.replace(/\r\n/g, "<br/>")
				this.noticeTitle = this.noticeInfoList[index].noticeTitle;
			},
			close:function(){
				this.notice = null;
			},
			mask:function(){
				this.notice = null;
			},
		}	
	})
	pub.creatDataModule = {
		topList:function(obj){
			pub.index_Vue.topList = obj
		},
		centerList:function(obj){
			pub.index_Vue.centerList = obj
		},
		noticeInfoList:function(obj){
			pub.index_Vue.noticeInfoList = obj
		},
		index_goodsItem:function(obj){
			pub.index_Vue.index_goodsItem = obj
		}
	}
	pub.index = {
		init:function(){
			if (pub.logined) {
				//if (sessionStorage.getItem("isAuto") != "true" && common.tokenId()) {
					common.autoLogin();
				//};
			}
//			$('.index_header_left').html(common.websitData[pub.websiteNode]);
			!pub.openid && pub.code && pub.index.get_openid();
			pub.index.ajax_index_data();
//			pub.index.eventHeadle.init();
			sessionStorage.removeItem('sta');
		},
		get_openid:function(){
			common.ajaxPost({
				method:'get_weixin_code',
				weixinCode:pub.code,
				websiteNode:pub.websiteNode
			},function(data){
				if (data.statusCode=='100000') {
					if (data.data.fromWX == 1) {
						pub.openid = data.data.openId;
						localStorage.setItem("openid" , data.data.openId)
					}
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		getmessage:function(){
			common.ajaxPost({
				method:'msg_not_read',
				firmId:pub.firmId,
				tokenId:common.tokenId(),
				sign:pub.sign,
				source:pub.source
			},function(data){
				if (data.statusCode=='100000') {
					if (data.data == 1) {
						sessionStorage.setItem("new_msg","true");
						var span = $("<span></span>")
						span.addClass("new_msg")
						$(".footer1 dl").eq(3).find("dt").append(span);
					}else{
						console.log("没有新消息")
					}
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		ajax_index_data:function(){
			common.ajaxPost({
				//main_page_show_three main_page_show_two   main_page_show
				method:'main_page_show_three',
				websiteNode:pub.websiteNode
			},function(data){
				if (data.statusCode == 100000) {
					pub.index.index_load(data);
					pub.index.index_guanggao(data);
					pub.index.index_goodsItem(data);
				}
			})
		},
		//banner
		index_load:function(data){
			var v = data.data.topList;
			pub.creatDataModule.topList(v)
			var v2 = data.data.centerList;
			pub.creatDataModule.centerList(v2)
		},
		//广告通知
		index_guanggao:function (data){
			var v = data.data.noticeInfoList;
			pub.creatDataModule.noticeInfoList(v)
			var index_guanggao_data=sessionStorage.getItem("index_guanggao_data",JSON.stringify(data.data.noticeInfoList))
		},
		//商品
		index_goodsItem:function (data){
			var v = data.data.mainActivityList;
			pub.creatDataModule.index_goodsItem(v)
			
		},
		
	};

	pub.index.init();
});

