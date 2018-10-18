$(document).ready(function(){
	var pub = {};
	/*if (common.isApp()) {
		common.prompt('app')
	}else{
		common.prompt('no_app')
	}*/
	//common.prompt(common.isPhone())
	
	var dateModule = {
		system:pub.system,
		vipGradeList:[],
		vipPrivilege:[],
		userVipInfo:{},
	}
	/*
	使用VUe的双向数据绑定
	实现页面的状态管理
	 * */
	pub.creatVue = function(){
		pub.Vue = new Vue({
			el: '#appVue',
			data: {
				isWx:false,//是否是微信环境
				
				urlParm:null,//页面URL后面拼接的参数
				
				logined:pub.logined,
				
				isNewMsg:false,
				
				isApp:common.isApp(),
				
				ajaxState:'wait',
				
				system:pub.system,//系统参数
				
				vipGradeList:dateModule.vipGradeList,//vip等级列表
				
				vipPrivilege:dateModule.vipPrivilege,//vip特权列表
				
				userInfo:pub.logined ? pub.data : {},//用户信息
				
				userVipInfo:dateModule.userVipInfo,
				
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
			      		return "690"
			    	}else{
			      		if (this.userVipInfo.firmMonthExp == 0) {
			      			return '0'
				      	}else{			      		
				      		var coefficient = this.userVipInfo.firmMonthExp / this.userVipInfo.monthExp
				      		return (coefficient * 690).toFixed(2); 
				      	}
			      	}
			    },
			    isActive:function(){
			    	var isTrue = true;
			    	if (this.vipPrivilege) {
			    		for (var i = 0; i < this.vipPrivilege.length ; i++ ) {
			    			if (this.vipPrivilege[i].state == 1) {
			    				isTrue = false;
			    				break;
			    			}
			    		}	
			    	}
			    	return isTrue;
			    },
			},
	        watch : {
	        	
	        },
			methods: {
				goToNext:function(item){
					var jumpUrl = '';
					if (item.state == 1) {
						if (this.isApp) {
							var jsonObj ={};
							if (item.type == 1 || item.type == 2 || item.type == 3) {
								jsonObj = {
									type:2,
									methodName:'goToReceiveCouponVCWithType',
									methodParamters:{
										type:item.type,
										linkUrl:item.linkUrl
									}
								};
							}else if (item.type == 4){
								jsonObj = {
									type:2,
									methodName:'goToMoreGoods',
									methodParamters:{
										type:item.type,
										linkUrl:item.linkUrl
									}
								};
							}
							appInteractivity(jsonObj)
						}else{
							if (item.type == 1 || item.type == 2 || item.type == 3) {
								common.jump("vip_ticket_center.html?type="+item.type);
							}else if (item.type == 4){
								var code = '';
								if (item.linkUrl && item.linkUrl.split("&")[1] && item.linkUrl.split("&")[1].length == 4 ) {
									code = item.linkUrl.split("&")[1];
									common.jump("moreGoods.html?typeCode="+code)
								}else{
									common.jump("moreGoods.html")
								}
							}
						}
					}else{
						if (item.state == 2) {
							common.prompt("不是VIP！")
						}
						if (item.state == 3) {
							common.prompt("没有活动！")							
						}
					}
				},
				
			}
		});
		
	}
	pub.creatDataModule = {
		init:function(){
			pub.creatDataModule.logined();
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
		//vip等级列表
		vipGradeList:function(v){
			if(v){
				pub.Vue.vipGradeList = v;
			}
		},
		//vip特权列表
		vipPrivilege:function(v){
			if (v) {
				pub.Vue.vipPrivilege = v;
			}
		},
		userVipInfo:function(v){
			if (v) {
				pub.Vue.userVipInfo = v;
			}
		}
	}
	pub.vip = {
		init:function(){
			pub.creatVue();
			pub.vip.vip_privilege_list.init();
			pub.vip.vip_grade_show.init();
			pub.vip.firm_vip_info.init();
		},
		api:function(){
			common.ajaxPost($.extend(pub.userBasicParam,{
				method:pub.method[1],
				firmId:pub.firmId
			}),function(data){
				if (data.statusCode == "100000") {
					
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		vip_privilege_list:{
			init:function(){
				common.ajaxPost($.extend(pub.userBasicParam,{
					method:'vip_privilege_list',
					firmId:pub.firmId
				}),function(data){
					if (data.statusCode == "100000") {
						pub.vip.vip_privilege_list.apiData(data);
					}else{
						common.prompt(data.statusStr)
					}
				})
			},
			apiData:function(d){
				var v = d.data;
				pub.creatDataModule.vipPrivilege(v);
			}
		},
		vip_grade_show:{
			init:function(){
				common.ajaxPost($.extend(pub.userBasicParam,{
					method:'vip_grade_show'
				}),function(data){
					if (data.statusCode == "100000") {
						pub.vip.vip_grade_show.apiData(data);
					}else{
						common.prompt(data.statusStr)
					}
				})
			},
			apiData:function(d){
				var v = d.data;
				pub.creatDataModule.vipGradeList(v);
			}
		},
		firm_vip_info:{
			init:function(){
				common.ajaxPost({
					method:'firm_vip_info',
					firmId:pub.firmId
				},function(data){
					if (data.statusCode=='100000') {
						pub.vip.firm_vip_info.apiData(data)
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
	pub.vip.eventHeadle = {
		init:function(){
			//点击返回按钮
			$('.header_left').on('click',function(){
				window.history.back();
				/*var obj = {
					type:1,
					methodName:'test4',
					methodParamters:'{}'
				}
				var obj = {
					type:2,
					methodName:'goToReceiveCouponVCWithType',
					methodParamters:{
						type:'1',
						linkUrl:''
					}
				}
				
				appInteractivity(obj)*/
			});
			$(window).load(function(){
				common.jsadd();
			});
			common.fadeIn();
		}
	}
	
	pub.init = function(){
		
		if (common.isApp()) {
			//common.prompt("app");
			
			var obj = {
				type:1,
				methodName:'test4',
				methodParamters:{}
			}
			appInteractivity(obj)
			$(".header-wrap,.empty").addClass("hidden");
			pub.vip.eventHeadle.init();
			
		}else{
			$.extend(pub,{
				logined : common.getIslogin(),
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
				pub.system = JSON.parse(pub.issystem)
			}
			if(!pub.issystem){
				common.dtd.done(function(){
					pub.system = JSON.parse(sessionStorage.getItem("system"));
					pub.creatDataModule.system(pub.system)
					pub.vip.init();
				})
				common.get_System(common.websiteNode);
			}else{
				pub.vip.init();
			}
			pub.vip.eventHeadle.init();
		}
		
	}
	pub.init();
	
	pub.appInit = function(obj){
		
		pub.logined = true;
		
		pub.firmId = obj.firmInfo.id;
		pub.source = "firmId" + pub.firmId;
		pub.sign = md5( pub.source + "key" + obj.secretKey ).toUpperCase();
		pub.tokenId = obj.tokenId;
		pub.userBasicParam = {
			source : pub.source,
			sign : pub.sign,
			tokenId : pub.tokenId
		};
		
		pub.data = {
			cuserInfoid:obj.cuserInfo.id,
			firmInfoid:obj.firmInfo.id,
			firmName:obj.firmInfo.firmName,
			linkTel:obj.cuserInfo.mobile,
			score:obj.firmInfo.score,
			next:obj.firmInfo.next,
			userGrade:obj.firmInfo.userGrade,
			websiteNode:obj.firmInfo.websiteNode,
			faceImgUrl:obj.firmInfo.faceImgUrl,
			websiteNodeName:obj.firmInfo.websiteNodeName
		};
		pub.system = obj.system;
		
		pub.vip.init();
	}
	
	window.pub = pub;
	
	
	function appInteractivity (o){
		var obj = o;
		
		if (common.isAndroid()) {
			try{
				android.getMethod(JSON.stringify(obj));
			}catch(e){
				common.prompt('error/android')
				//TODO handle the exception
			}
		}else{
			try{
				window.webkit.messageHandlers.getMethod.postMessage(obj)
			}catch(e){
				common.prompt('error/ios')
				//TODO handle the exception
			}
			
		}
	}
	//app端交互回调
	function test3 (str){
		common.prompt("strstr")
		if (str) {
			/*common.createPopup({
		        flag: 4,
		        icon: 'none',
		        msg: str,
		        okText: '确定',
		        cancelText: '取消',
		        onConfirm: function() {
		        	
		        }
		    });*/
		  
		}
	}
	
})

function test4(o){
	
   var obj = {
    	tokenId:JSON.parse(o.cuserInfo).data.tokenId,
    	secretKey:JSON.parse(o.cuserInfo).data.secretKey,
    	cuserInfo:JSON.parse(o.cuserInfo).data.cuserInfo,
    	firmInfo:JSON.parse(o.cuserInfo).data.firmInfo,
    	system:JSON.parse(o.system).data,
    }
	pub.appInit(obj)
}
