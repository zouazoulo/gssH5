$(document).ready(function(){
			
	/*命名空间*/
	var pub = {}
	
	$.extend(pub,{
		phone:null,
		passWord:null,
		verify_code:null,
		websiteNode:common.websiteNode,
		index:0,
		method:['user_dynamic_login','user_login'],
		msgArr:["请输入验证码！","请输入密码！","请输入手机号码！","请输入正确的手机号！"],
		i:59,
		code:null,
		
		firmName:null,
		linkTel:null,
		linkMan:null,
		address:null,
		province:null,
		city:null,
		county:null,
		street:null,
		road:null,
		
		recommend_id:null,
		recommend_name:null,
		
		description:null,
		
		msg:["请输入店铺名称","请输入店铺地址","联系电话不能为空","请输入联系人","电话的格式不正确"],
		streetData:{},//街道的数据
		getcode : common.getUrlParam("code"),
		wexinCode:sessionStorage.weixinCode,
		openid:localStorage.getItem("openid"),
	});
	
	//公用弹出框接口
	pub.desc_data = function(){
		common.ajaxPost({
			method:'gss_desc',
			websiteNode:pub.websiteNode,
			code:common.websiteNode+pub.code
		},function(data){
			if (data.statusCode=='100000') {
				if (pub.code == "#TJR-DESC") {
					pub.destData1 = data;
					common.alert_show(pub.destData1)
				}else if(pub.code == "#HZ-DESC"){
					pub.destData = data;
					common.alert_show(pub.destData)
				}
			}else{
				common.prompt(data.statusStr);
			}
		})
	}
	
	pub.eventHeadle = {
		init:function(){
			common.callback($(".header_left"));
			$(window).load(function(){
				common.jsadd();
			});
			common.fadeIn();
		}
	}
	
	/*--------------------------------登录模块------------------------------------------*/
	
	pub.login = {
		init:function(){
//			pub.login.eventHeadle.init();
			pub.getcode && pub.login.get_openid();
		},
		login:function(){
			common.ajaxPost($.extend({
				method:pub.method[pub.index],
				websiteNode:pub.websiteNode,
				mobile:pub.phone,
			},pub.parameter),function(data){
				if (data.statusCode=='100000') {
					pub.login.loginOk(data)
				} else{
					common.prompt(data.statusStr)
				}
			})
		},
		getCode:function(){
			common.ajaxPost({
				method:'gss_sms',
				mobile:pub.phone	
			},function(data){
				if (data.statusCode == '100000') {
					pub.login_Vue.isHidden = true;
					pub.login_Vue.isTime = false
					pub.login.countDown()
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		countDown:function(){
			var id=setInterval(function(){
				if (pub.i==0) {
					pub.login_Vue.isTime = true;
					pub.login_Vue.isHidden = false;
					clearInterval(id)
				}else{
					$("#time").html("("+pub.i+"s后可重试)");
				}
				pub.i--; 
			},1000)
		},
		loginOk:function (data) {
			console.log(data.data.firmInfo.next)
			var user_data={
				cuserInfoid:data.data.cuserInfo.id,
				firmInfoid:data.data.firmInfo.id,
				firmName:data.data.firmInfo.firmName,
				linkTel:data.data.cuserInfo.mobile,
				score:data.data.firmInfo.score,
				next:data.data.firmInfo.next,
				userGrade:data.data.firmInfo.userGrade,
				websiteNode:data.data.firmInfo.websiteNode,
				faceImgUrl:data.data.firmInfo.faceImgUrl,
				websiteNodeName:data.data.firmInfo.websiteNodeName
			}
			localStorage.setItem("user_data",JSON.stringify(user_data));
			localStorage.setItem("tokenId",data.data.tokenId);
			localStorage.setItem("secretKey",data.data.secretKey);
			setTimeout(function(){
				common.jump("wo.html")
				/*window.location.href="wo.html?v=0.1"*/
			},500)
		},
		get_openid:function(){
			common.ajaxPost({
				method:'get_weixin_code',
				weixinCode:pub.getcode,
				websiteNode:pub.websiteNode
			},function(data){
				if (data.statusCode=='100000') {
					if (data.data.fromWX == 1) {
						localStorage.setItem("openid",data.data.openId);
					}
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
	}
	pub.login_Vue = new Vue({
		el:"#login_register_Vue",
		data:{
			login : 0,
			tipsMsg:null,
			message:null,
			account:null,
			passWord:null,
			code:null,
			shopPhone:null,
			phoneMsg:null,
			city:null,
			streetMsg:null,
			isActive:false,
			isHidden:false,
			isTime:true,
			bottomIsHidden:false,
			mainHidden:false,
			Hotline:JSON.parse(sessionStorage.getItem('system')).feedback_method,
			
		},
		watch:{
				login:function(val,oldval){
					if(val == 0){
						if(this.message != null && this.code != null){
							 if( this.message.length == 11 && this.code.length == 6){
							 	this.isActive = true;
				            	if(!common.phoneNumberReg.test(this.message)){
				            			this.tipsMsg = "请输入正确的手机号！"
		            			}else{
		            				this.tipsMsg  = null;
		            			}
		            		}
		            	}else{
		            		this.tipsMsg  = null;
							this.isActive = false;
		            	}
					}else{
							if(this.account != null && this.passWord !=null){
								 if(this.account.length == 11 && this.passWord.length >= 6){
								 	this.isActive = true;
					             	if(!common.phoneNumberReg.test(this.account)){
					            			this.tipsMsg = "请输入正确的手机号！"
					            	}else{
			            				this.tipsMsg  = null;
			            			}
			            		}
			            	}else{
			            		this.tipsMsg  = null;
								this.isActive = false;
			            	}
					}
				
				},
				message: function(val) {
					var n = val.replace(/\D/g,"");
		        	if (n == 0) {
		            	this.message='';
		            }else{
		            	this.message=n;
		            }
		           if( this.message.length == 11){
		            	if(!common.phoneNumberReg.test(this.message)){
		            			this.tipsMsg = "请输入正确的手机号！"
            			}else{
            				this.tipsMsg  = null;
            			}
            		}else{
            			this.tipsMsg  = null;
            		}
				},
				account:function(val){
					var n = val.replace(/\D/g,"");
		        	if (n == 0) {
		            	this.account='';
		            }else{
		            	this.account=n;
		           }
	             	if( this.account.length == 11){
		             	if(!common.phoneNumberReg.test(this.account)){
		            			this.tipsMsg = "请输入正确的手机号！"
		            	}else{
            				this.tipsMsg  = null;
            			}
            		}else{
            			this.tipsMsg  = null;
            		}
					
				},
				passWord:function(){
					if(this.account.length == 11 && this.passWord.length >= 6 ){
						this.isActive = true;
					}else{
						this.isActive = false
					}
				},
				code:function(val){
					var n = val.replace(/\D/g,"");
		            this.code = n;
					if( this.message.length == 11 && this.code.length == 6 ){
						this.isActive = true;
					}else{
						this.isActive = false
					}
				},
				shopPhone:function(val){
					var n = val.replace(/\D/g,"");
		        	if (n == 0) {
		            	this.shopPhone='';
		            }else{
		            	this.shopPhone=n;
		            }
	             	if( this.shopPhone.length == 11){
		            	if(!common.phoneNumberReg.test(n)){
	            			this.phoneMsg = "请输入正确的手机号！"
	        			}else{
	        				
	        				this.phoneMsg  = null;
	        			}
            		}else{
            			this.phoneMsg  = null;
            		}
				}
				
		},
		methods:{
			apply_service:function(){
				window.location.href = "../html/apply_service.html"
			},
			login_btn:function(e){
				var $sel = $(".login_main_content ul:visible") ;
				pub.index = $sel.index();
				pub.phone = $sel.find(".icon_phone input").val();
				pub.passWord = $sel.find(".icon_password input").val();
				pub.verify_code = $sel.find(".icon_key input").val();
				if(pub.index == 0){
					pub.parameter = {smsCode:pub.verify_code}
				}else{
					pub.parameter = {password:md5(pub.passWord)}
				}
				var target = event.target;
		   		var isActive = $(target).is('.active');
		   		 if (isActive) {
		   				pub.login.login();
		   		}
				
			},
			get_verify_code:function(){
				pub.phone = $("#login_phoneNumber1").val();
				if (pub.phone == '') {
					common.prompt(pub.msgArr[2])
				} else if (!common.phoneNumberReg.test(pub.phone)) {
					common.prompt(pub.msgArr[3])
				}else{
					pub.i = 59;
					pub.login.getCode();
				}
			},
			submit_btn:function(){
				/*店铺名称*/
					pub.firmName = $("#shopName").val();
					/*联系电话*/
					pub.linkTel = $("#shopPhone").val();
					/*联系人*/
					pub.linkMan = $("#shopPeople").val();
					/*店铺地址*/
					pub.address = $("#shopAddress").val();
					//特别说明
					pub.description = $("#shopText").val();
					
					var arr1 = $("#value1").val().split(",");
					pub.province = arr1[0];
					pub.city = arr1[1];
					pub.county = arr1[2];
					var arr2 = $("#value2").val().split(",");
					pub.street = arr2[0];
					pub.road = arr2[1];
					
					pub.recommend_id = $("#recommend_id").val();
					pub.recommend_name = $("#recommend_name").val();
					
					if(pub.firmName == ''){
						common.prompt(pub.msg[0]);
					} else if (pub.address == '') {
						common.prompt(pub.msg[1]);
					} else if (pub.linkTel == '') {
						common.prompt(pub.msg[2]);
					} else if (pub.linkMan == '') {
						common.prompt(pub.msg[3]);
					} else if(!common.phoneNumberReg.test(pub.linkTel)){
						common.prompt(pub.msg[4]);
					}else{
						pub.register.applyService()
					}
				},
			province:function(){
				var code = $("#value1").val().split(",").pop();
				console.log(code)
					if (code != "") {
						pub.register.get_street(code);
					}
			},
			img:function(){
				if (pub.destData1) {
						common.alert_show(pub.destData1)
					}else{
						pub.code = "#TJR-DESC";
						pub.desc_data();
					}
			},
			street:function(){
					console.log(this.city)
					if(this.city){
						this.streetMsg=null
						 document.getElementsByClassName("my_bg")[0].style.visibility="visible";
					}else{
						this.streetMsg ="请先选择省市！！"
						
					}
			},
			tips:function(){
				if (pub.destData) {
					common.alert_show(pub.destData);
				}else{
					pub.code = "#HZ-DESC";
					pub.desc_data()
				}
			},
			focus:function(){
				this.bottomIsHidden = true;
			},
			blur:function(){
				this.bottomIsHidden = false;
			},
			gearArea:function(){
				 document.getElementsByClassName("my_bg")[0].style.visibility="visible";
			}
		}
	})
	/*------------------------------------注册模块--------------------------------------------*/
	pub.register = {
		init:function(){
			$("#sel_websit").val(common.websitData[pub.websiteNode]);
			pub.register.api0();
//			pub.register.eventHeadle.init();
			pub.area2 = new LArea1();
			pub.register.streetInit();
			console.log(common.isPc() == 2)
			//if (common.isPc() == 2) {
//				$('.login_bottom').css("position","relative");
			//}
		},
		api0:function(){
			common.ajaxPost({
				method:'get_pcc',
				firmId:pub.firmId,
				websiteNode:pub.websiteNode,
				tokenId:pub.tokenId,
				sign:pub.sign,
				source:pub.source
			},function(data){
				if (data.statusCode == "100000") {
					pub.register.newLArea(data.data)
				}
			})
		},
		newLArea:function(LAreaData){
			var area1 = new LArea();
			area1.init({
				'trigger': '#province', //触发选择控件的文本框，同时选择完毕后name属性输出到该位置
				'valueTo': '#value1', //选择完毕后id属性输出到该位置
				'keys': {
					id: 'code',
					name: 'name'
				}, //绑定数据源相关字段 id对应valueTo的value属性输出 name对应trigger的value属性输出
				'type': 1, //数据源类型
				'data': LAreaData, //数据源
			});
			area1.value=[0,0,0];//控制初始位置，注意：该方法并不会影响到input的value
		},
		applyService:function(){
			common.ajaxPost({
				method:'firm_register',
				firmName:pub.firmName,
				address:pub.address,
				linkTel:pub.linkTel,
				linkMan:pub.linkMan,
				description:pub.description,
				websiteNode:pub.websiteNode,
				province:pub.province,
				city:pub.city,
				county:pub.county,
				street:pub.street,
				road:pub.road,
				referrerId:pub.recommend_id,
				referrer:pub.recommend_name
			},function(data){
				if (data.statusCode=='100000') {
					pub.register.apply_suc()
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		//街道和路的数据请求
		get_street:function (code){
			common.ajaxPost({
				method:'get_street',
				code:code
			},function(data){
				console.log(JSON.stringify(data))
				if (data.statusCode=='100000') {
					//if (data.data != '') {
						pub.streetData = data.data;
					//}
					pub.area2.getData(pub.streetData)
				}else{
					common.prompt(data.statusStr)
				}
			});
		},
		apply_suc:function(){
			pub.login_Vue.mainHidden = true;
			pub.login_Vue.bottomIsHidden = true;
		},
		streetInit:function(){
			pub.area2.init({
				'trigger': '#street', //触发选择控件的文本框，同时选择完毕后name属性输出到该位置
				'valueTo': '#value2', //选择完毕后id属性输出到该位置
				'keys': {
					id: 'code',
					name: 'name'
				}, //绑定数据源相关字段 id对应valueTo的value属性输出 name对应trigger的value属性输出
				'type': 1, //数据源类型
				'data': pub.streetData //数据源
			});
			pub.area2.value=[0,0,0];//控制初始位置，注意：该方法并不会影响到input的value
		}
	}
	pub.init = function(){
		pub.eventHeadle.init();
		if ($('body').attr('data') == 1) {
			pub.login.init();
		}else if ($('body').attr('data') == 2){
			pub.register.init();
		}
	}
	
	pub.init();
});