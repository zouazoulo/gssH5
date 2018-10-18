$(document).ready(function(){
	var pub = {};
	$.extend(pub,{
		logined : common.getIslogin(),
		method:['user_logout',"user_personal_msg",'firm_info_update_faceimgurl'],
		issystem:sessionStorage.getItem('system'),
		
	});
	if( pub.logined ){
		pub.firmId = common.user_data().firmInfoid,
		pub.source = "firmId" + pub.firmId;
		pub.sign = md5( pub.source + "key" + common.secretKey() ).toUpperCase();
		pub.tokenId = common.tokenId();
		pub.userBasicParam = {
			source : pub.source,
			sign : pub.sign,
			tokenId : pub.tokenId
		};
		pub.data = common.user_data();
	};
	if(pub.issystem){
		pub.system = JSON.parse(pub.issystem);
	}else{
		pub.system = {'feedback_method':''};
	}
	
	
	/*
	定义页面数据结构
	*/
	var dateModule  = {
		logined:false,//是否登陆
		orderList:[//订单列表数据结构
			{
				icon:'../img/icon_order1.png',
				type:1,
				name:'待发货',
				linkUrl:'order_management.html?type=0-1',
			},{
				icon:'../img/icon_order2.png',
				type:2,
				name:'已配货',
				linkUrl:'order_management.html?type=1-2',
			},{
				icon:'../img/icon_order3.png',
				type:3,
				name:'待支付',
				linkUrl:'order_management.html?type=2-3',
			},{
				icon:'../img/icon_order0.png',
				type:0,
				name:'全部订单',
				linkUrl:'order_management.html?type=3-',
			}
		],
		//其他列表数据结构
		otherList:[
			{
				icon:'../img/icon_address.png',
				type:null,
				name:'收货地址',
				linkUrl:'address.html',
			},{
				icon:'../img/icon_collection.png',
				type:null,
				name:'收藏',
				linkUrl:'often_shop.html',
			}
		],
		//底部nav数据结构
		fonterNav:{
			index:2,
			list:[{
				linkUrl:'../index.html',
				name:'首页',
				classArr:['tab_bar_home_a','tab_bar_home_b']
			},{
				linkUrl:'moreGoods.html',
				name:'更多商品',
				classArr:['tab_bar_more_a','tab_bar_more_b']
			},{
				linkUrl:'wo.html',
				name:'我的',
				classArr:['tab_bar_mine_a','tab_bar_mine_b']
			},{
				linkUrl:'login.html',
				name:'消息',
				classArr:['tab_bar_Message_a','tab_bar_Message_b']
			}]
		},
		userVipInfo:{}
	}
	
	
	
	
	
	
	
	
	
	
	
	/*
	使用VUe的双向数据绑定
	实现页面的状态管理
	 * */
	pub.Vue = new Vue({
		el: '#appVue',
		data: {
			isMask:false,//遮罩层的状态 true 表示显示
			pageNo: common.PAGE_INDEX,
			pageSize: common.PAGE_SIZE,
			isWx:false,//是否是微信环境
			
			urlParm:null,//页面URL后面拼接的参数
			
			logined:pub.logined,
			
			isNewMsg:false,
			ajaxState:'wait',
			
			system:pub.system,//系统参数
			
			orderList:dateModule.orderList,
			
			otherList:dateModule.otherList,
			
			userInfo:pub.logined ? common.user_data() : {},//用户信息
			
			fonterNav:dateModule.fonterNav,
			
			userVipInfo:dateModule.userVipInfo
		},
        beforeCreate : function(){
        	
        },
        created : function(){
        	console.log("created			//创建完成")
        	this.isWx = common.isWeiXin();
        	if(pub.issystem){
				pub.system = JSON.parse(pub.issystem);
				console.log(pub.system)
				//this.system = pub.system;
				
			}
        },
        beforeMount : function(){
        	console.log("beforeMount		//挂载之前")
        	
        },
        updated : function(){
        	console.log("updated			//数据被更新后")
        	
        },
        computed: {
		    // 计算属性width
		    getWidth: function () {
		    	if (this.userVipInfo.firmMonthExp >= this.userVipInfo.monthExp ) {
		      		return "702"
		    	}else{
		      		if (this.userVipInfo.firmMonthExp == 0) {
		      			return '0'
			      	}else{			      		
			      		var coefficient = this.userVipInfo.firmMonthExp / this.userVipInfo.monthExp
			      		return (coefficient * 702).toFixed(2); 
			      	}
		      	}
		    },
		    getMarginleft:function(){
		    	console.log($(".growInfo_pointer span").width())
		    	return  '-85px';
		    },
		    getLeft:function(){
		    	if (this.getWidth > 617) {
		    		return '557px'
		    	}else if(this.getWidth < 85){
		    		return '85px'
		    	}else{
		    		return this.getWidth+'px';		    		
		    	}
		    }
		},
        watch : {
        	PageStatus:function(val,oldVal){
        		console.log("val="+val+",oldVal="+oldVal);
        		if (val == 2 && oldVal == 1) {
        			
        		}
        	},
        },
		methods: {
			goBack:function(){
				if (pub.Vue.PageType == 2) {
					pub.maskView.maskMove();
					setTimeout(function(){
						pub.apiHandle.farm_main.init();
					},700)
				}else{
					window.location.href = "../html/my.html"
				}
			},
			goToNext:function(e){
				var jumpUrl = '';
				//e.type 等于click表示为没有传参数的情况
				if (e.type == 'click') {
					var target = e.currentTarget;
					var data = target.getAttribute("data-url");
					jumpUrl = data;
				}else{
					console.log(e.linkUrl)
					jumpUrl = e.linkUrl;
				}
				
				if (this.logined) {
					jumpUrl && common.jump(jumpUrl)
				}else{
					common.jump("login.html")
				}
			},
			goToNext1:function(index){
				var jumpUrl = '';
				if (this.fonterNav.index != index) {
					jumpUrl = this.fonterNav.list[index].linkUrl;
					common.jump(jumpUrl)
				}
			}
		}
	});
	
	
	
	pub.creatDataModule = {
		init:function(){
			pub.creatDataModule.logined();
			pub.creatDataModule.fonterNav();
			pub.creatDataModule.userInfo();
		},
		logined:function(){
			var isBool = false;
			if (pub.logined) {
				isBool = true;
			}else{
				isBool = false;
			}
			
		},
		orderList:function(){
			pub.Vue.orderList = dateModule.orderList;
		},
		otherList:function(){
			pub.Vue.otherList = dateModule.otherList;
		},
		fonterNav:function(){
			var obj = '';
			if (pub.logined) {
				dateModule.fonterNav.list[3].linkUrl = 'message.html';
				obj = dateModule.fonterNav;
			}else{
				obj = dateModule.fonterNav;
			}
			pub.Vue.fonterNav = obj;
		},
		userInfo:function(v){
			if (pub.logined) {
				pub.Vue.userInfo = common.user_data();
			}else{
				pub.Vue.userInfo = {};
			}
		},
		system:function(v){
			if (v) {
				pub.Vue.system = v;
			}else{
				pub.Vue.system = pub.system;
			}
			
		},
		isNewMsg:function(v){
			if (v) {
				sessionStorage.setItem("new_msg","true");
				pub.Vue.isNewMsg = true;
			}else{
				pub.Vue.isNewMsg = false;
			}
		},
		userVipInfo:function(v){
			if (v) {
				pub.Vue.userVipInfo = v;
			}
		}
		
	}
	
	
	
	
	
	
	pub.person = {
		init:function(){
			if (pub.logined) {
				pub.person.api();
				pub.person.firm_vip_info.init();
			}
			pub.creatDataModule.init()
		},
		api:function(){
			common.ajaxPost($.extend(pub.userBasicParam,{
				method:pub.method[1],
				firmId:pub.firmId
			}),function(data){
				if (data.statusCode == "100000") {
					var $wotop = $(".wo_top"),v = data.data;
					if (!pub.data.faceImgUrl) {
						$wotop.find('.tp').attr('src','../img/Icon@2x.png');
					} else{
						$wotop.find('.tp').attr('src','http://'+v.faceImgUrl);
					}
					$wotop.find(".jf").html("ID:"+v.id).end().find('.zh').html(v.firmName).end().find(".sz").html(v.linkTel);
					$wotop.find(".lv .lv_num").html(v.note)//v.userGrade.substring(2,3)
					$wotop.find(".xs span").eq(0).html("经验值: ").end().eq(1).html(v.score+"/"+v.next).end().eq(2).html("果币: ").end().eq(3).html(v.surplusScore);;
					
				}else{
					common.prompt(data.statusStr)
				}
				if (sessionStorage.getItem("new_msg") == "true") {
					pub.creatDataModule.isNewMsg(true)
				}else{
					pub.person.getmessage();
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
						pub.creatDataModule.isNewMsg(true)
					}else{
						pub.creatDataModule.isNewMsg(false)
						console.log("没有新消息")
					}
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		addLog:function(data){
			pub.src=data.bucket_name+".b0.upaiyun.com"+data.path;
			pub.person.heade_pic()
		},
		heade_pic:function(){
			common.ajaxPost($.extend(pub.userBasicParam,{
				method:pub.method[2],
				firmId:pub.firmId,
				faceImgUrl:pub.src
			}),function(data){
				if (data.statusCode=='100000') {
					var a =$.extend(pub.data,{
						faceImgUrl:data.data.faceImgUrl
					});
					localStorage.setItem("user_data",JSON.stringify(a));
					pub.user_data = common.user_data();
					pub.Vue.userInfo = pub.user_data;
				} else{
					common.prompt(data.statusStr);
				}
			})
		},
		firm_vip_info:{
			init:function(){
				common.ajaxPost({
					method:'firm_vip_info',
					firmId:pub.firmId
				},function(data){
					if (data.statusCode=='100000') {
						pub.person.firm_vip_info.apiData(data)
					}else{
						common.prompt(data.statusStr)
					}
				})
			},
			apiData:function(v){
				var v = v.data;
				pub.creatDataModule.userVipInfo(v)
			}
		}
	}
	pub.person.eventHeadle = {
		init:function(){
			
			$("#file").on('change',function(){
				var tar = this,
				files = tar.files,
				fNum = files.length,
				URL = window.URL || window.webkitURL;
				if(!files[0])return;
				console.log(this)
				for(var i=0;i<fNum;i++){
					if(files[i].type.search(/image/)>=0){
						var blob = URL.createObjectURL(files[i]);
						document.getElementsByClassName('user_faceImg')[0].src=blob;
					}
				};
				var ext = '.' + document.getElementById('file').files[0].name.split('.').pop();
				var config = {
					bucket: 'zhangshuoinfo',
					expiration: parseInt((new Date().getTime() + 3600000) / 1000),
					// 尽量不要使用直接传表单 API 的方式，以防泄露造成安全隐患
					form_api_secret: 'LaubRPoyoLzq9tJ82/z+RSmFUVY='
				};
				var instance = new Sand(config);
				var options = {
					'x-gmkerl-thumb': '/compress/true/rotate/auto',
					'notify_url': 'http://zhangshuoinfo.b0.upaiyun.com'
				};
				instance.setOptions(options);
				instance.upload( + parseInt((new Date().getTime() + 3600000) / 1000) + ext);
			});
			document.addEventListener('uploaded', function(e) {
				pub.person.addLog(e.detail);
			});
			$(window).load(function(){
				common.jsadd();
			});
			common.fadeIn();
		}
	}
	
	
	
	pub.init = function(){
		var $det = $.Deferred();
		if (!pub.issystem) {
			common.dtd.done(function(){
				pub.system = JSON.parse(sessionStorage.getItem("system"));
				pub.person.init();
			})
			common.get_System(common.websiteNode);
		}else{
			pub.person.init();
		}
		pub.person.eventHeadle.init();
	}
	pub.init();
})