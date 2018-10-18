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
		pub.system = JSON.parse(pub.issystem)
	}
	pub.set = {
		init:function(){
			pub.set.eventHeadle.init();
		},
		out:function(){
			common.ajaxPost($.extend(pub.userBasicParam,{
				method:'user_logout'
			}),function(data){
				if (data.statusCode=='100000') {
					pub.openid = localStorage.getItem("openid");
					localStorage.clear();
					localStorage.setItem("openid",pub.openid);
					pub.logined = false;
					window.location.href='wo.html?v=0.1'
				} else{
					common.prompt(data.statusStr);
				}
			})
		},
	}
	pub.set.eventHeadle = {
		init:function(){
			//点击返回按钮
			$('.header_left').on('click',function(){
				window.history.back();
			});
			$(".signOut").on("click",function(){
				pub.set.out()
			});
			
			$(".set_box").on("click",".set_item",function(){
				var jumpUrl = $(this).attr("data-url");
				common.jump(jumpUrl)
			})
			$(window).load(function(){
				common.jsadd();
			});
			common.fadeIn();
		}
	}
	
	pub.init = function(){
		var $det = $.Deferred();
		pub.set.init();
		
		$(window).load(function(){
			common.jsadd();
		});
		common.fadeIn();
	}
	pub.init();
})