$(document).ready(function(){
	//命名空间
	var pub = {};
	//公用的属性或者方法
	$.extend(pub,{
		tokenId:common.tokenId(),
		websiteNode:common.websiteNode,
		firmId:common.user_data().firmInfoid,
		source:"firmId"+common.user_data().firmInfoid,
		sign:md5("firmId"+common.user_data().firmInfoid+"key"+common.secretKey()).toUpperCase(),
		type:1,//表示当前页面是那个
		index:0,
		method:{//1.商家信息2.更改密码3.优惠卷
			"1":['firm_info_show',"firm_info_update"],
			"2":['user_update_pwd'],
			"3":['coupon_info_show'],
			"4":['online_coupon_list','get_coupon']
		},
		data:{
			isMain:{"1":"主账号：","2":"副账号："},
			status:{"1":"启用","2":"禁用"},
			authStatus:{"0":'待认证',"-1":'未通过',"1":'已认证'},
			coupon : ['',"quan_c","quan_b","quan_a"]
		},
		code:null,
		textList:['','单笔订单实付满','单品订单实付满','单类订单实付满']
	})
	//ajax公用参数
	pub.publicParameter = {
		method:pub.method[pub.type][pub.index],
		firmId:pub.firmId,
		tokenId:pub.tokenId,
		sign:pub.sign,
		source:pub.source
	}
	pub.pageNo = common.pageNo;
	pub.pageSize =common.pageSize ;
	
	if (!common.getIslogin()) {
		common.jump("login.html");
	}
	//公用弹出框接口
	pub.desc_data = function(code){
		common.ajaxPost({
			method:'gss_desc',
			websiteNode:pub.websiteNode,
			code:code
		},function(data){
			if (data.statusCode=='100000') {
				pub.destData = data;
				common.alert_show(pub.destData)
			}else{
				common.prompt(data.statusStr);
			}
		})
	}
	//公用事件
	pub.eventHeadle = {
		init:function(){
			common.callback($(".header_left"));
			$("body").on("click",".logistic_back,.my_bg",function(){
				$("#logistic_show").remove();
				$(".my_bg").remove();
			});
			$(window).load(function(){
				common.jsadd();
			});
			common.fadeIn();
		}
	}
	/*=============================商家信息展示================================*/
	pub.Business = {
		init:function(){
			pub.Business.api();
			pub.Business.eventHeadle.init();
		},
		api:function(){
			common.ajaxPost($.extend(pub.publicParameter,{
				method:pub.method[pub.type][pub.index],
			}),function(data){
				if (data.statusCode=='100000') {
					pub.Business.business_show(data)
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		business_show:function(data){
			var v = data.data;
			$('#business_shop_name').val(v.firmName);
			$('#business_shop_id').val('NO.'+v.id);
			$('#business_shop_score').val(v.exp);
			$('#business_shop_grade').val(v.userGrade);
			$('#business_shop_address').val(v.address);
			$('#business_shop_card').val(v.saleCard);
			$('#business_shop_tel').val(v.linkTel);
			$('#business_shop_man').val(v.linkMan);
			$('#business_shop_authStatus').val(pub.data.authStatus[v.authStatus]);
			var html='';
			for (var i=0 in v.cuserInfoList) {
	        	html +='<li class="zhanghao">'
	        	html +='    <div class="main__">'
	        	html +='    	<label>'+pub.data.isMain[v.cuserInfoList[i].isMain]+'</label>'
	        	html +='		<input type="text" value="'+v.cuserInfoList[i].mobile+'" disabled="disabled"></div>'
	        	html +='    <div class="zhangtai"><input type="text" value="'+pub.data.status[v.cuserInfoList[i].status]+'" disabled="disabled"></div>'
	        	html +='</li>'
			}
			$('.business_main_wrap .content3').append(html)
		},
		save:function(userId,firmName,linkMan,saleCard,address){
			common.ajaxPost($.extend(pub.publicParameter,{
				method:'firm_info_update',
				userId:userId,
				firmName:firmName,
				linkMan:linkMan,
				saleCard:saleCard,
				address:address,
			}),function(data){
				if (data.statusCode=='100000') {
					common.prompt('修改成功')
				}else{
					common.prompt(data.statusStr);
				}
			})
		},
		
	}
	
	pub.Business.eventHeadle = {
		init:function(){
			$('.right_save').on('click',function(){
				var userId=common.user_data().cuserInfoid;
				var firmName=$('#business_shop_name').val();
				var linkMan=$('#business_shop_man').val();
				var saleCard=$('#business_shop_card').val();
				var address=$('#business_shop_address').val();
				pub.index = 1;
				pub.Business.save(userId,firmName,linkMan,saleCard,address)
			});
			$('.dengji label').on('click',function(){
				if (pub.destData) {
					$("body").append(common.mshow).append(common.mbg);
				}else{
					pub.desc_data(pub.code)
				}
			});
		}
	}
	
	
	
	
	/*=============================修改密码================================*/
	$.extend(pub,{
		linkTel:common.user_data().linkTel,
		ode_pass:null,
		new_pass:null,
		confirm_pass:null
	})
	
	pub.change_password = {
		init:function(){
			$('.zhanghao input').val(pub.linkTel);
			pub.change_password.eventHeadle.init();
		},
		api:function(){
			common.ajaxPost({
				method:'user_update_pwd',
				tokenId:pub.tokenId,
				sign:pub.sign,
				source:pub.source,
				
				oldPassword:md5(pub.ode_pass),
				newPassword:md5(pub.new_pass),
				confirmPassword:md5(pub.confirm_pass),
			},function(data){
				if (data.statusCode=='100000') {
					window.location.href='wo.html?v=0.1'
				} else{
					common.prompt(data.statusStr)
				}
			})
		}
	}
	
	pub.change_password.eventHeadle = {
		init:function(){
			$('.chang_password_save_wrap button').on('click',function(){
				pub.ode_pass=$('.old input').val();
				pub.new_pass=$('.new input').val();
				pub.confirm_pass=$('.queren input').val();
				if (pub.ode_pass=='') {
					common.prompt('请输入原始密码')
				}else if(pub.new_pass==''){
					common.prompt('请输入新密码')
				}else if(pub.confirm_pass==''){
					common.prompt('请输入确认密码')
				}else if(pub.confirm_pass != pub.new_pass){
					common.prompt('确认密码与新密码输入不一致')
				}else{
					pub.change_password.api();
				}
			});
		}
	}
	
	
	/*=============================优惠卷===============================*/
	pub.coupon = {
		init:function(){
			pub.coupon.api();
			pub.coupon.eventHeadle.init();
		},
		api:function(){
			common.ajaxPost($.extend(pub.publicParameter,{
				method:pub.method[pub.type][pub.index],
			}),function(data){
				if (data.statusCode == "100000") {
					pub.coupon.show(data)
				}
			})
		},
		show:function(data){
			var html='';
			for (var i=0 in data.data) {
				html+='<dl class="clearfloat coupon_status'+data.data[i].status+'">'
	    		html+='	<dt class="sprite_login '+pub.data.coupon[data.data[i].status]+'">'+data.data[i].couponMoney+'元</dt>'
	    		html+='	<dd>'
	    		html+='		<div class="coupon_top clearfloat">'
	    		html+='			<div class="coupon_name">'+data.data[i].couponName+'</div>'
    			html+='			<div class="coupon_state"></div>'
    			html+='		</div>'
	    		html+='		<div class="coupon_time">有效期至：'+data.data[i].endTime+'</div>'
	    		html+='		<div class="coupon_money">金额要求：'+pub.textList[data.data[i].type]+data.data[i].leastOrderMoney+'元</div>'
	    		html+='		<div class="coupon_come">来源：'+data.data[i].sendMethod+'</div>'
	    		html+='	</dd>'
	    		html+='</dl>'		    		
			}
			$('.coupon_main_').append(html)
		}
	}
	pub.coupon.eventHeadle = {
		init:function(){
			$('.coupon_header_right').on('click',function(){
				if (pub.destData) {
					$("body").append(common.mshow).append(common.mbg);
				}else{
					pub.desc_data(pub.code)
				}
			})
		}
	}
	/*=============================在线领取优惠卷===============================*/
	pub.online_coupon = {
		init:function(){
			pub.online_coupon.api();
			pub.online_coupon.eventHeadle.init();
		},
		api:function(){
			common.ajaxPost($.extend({},pub.publicParameter,{
				method:pub.method[pub.type][pub.index],
				websiteNode:pub.websiteNode,
				pageNum:pub.pageNo,
				pageSize:pub.pageSize,
			}),function(data){
				if (data.statusCode == "100000") {
					pub.online_coupon.show(data)
				}
			})
		},
		show:function(data){
			var html='',
				v = data.data.list;
				pub.isLast = data.data.lastPage;
				pub.isLast && $('.lodemore').html('没有更多数据了');
				!pub.isLast && $('.lodemore').html('点击加载更多数据');
			for (var i in v) {
				if(v[i].onOff){
					html+='<dl class="clearfloat coupon_status1" data = "'+v[i].id+'">'
					html+='	<dt class="sprite_login online_coupon quan_c">'+v[i].mouldMoney+'元</dt>'
				}else{
					html+='<dl class="clearfloat coupon_status3" data = "'+v[i].id+'">'
					html+='	<dt class="sprite_login online_coupon quan_a">'+v[i].mouldMoney+'元</dt>'
				}
	    		
	    		html+='	<dd>'
	    		html+='		<div class="coupon_top clearfloat">'
	    		html+='			<div class="coupon_name">'+v[i].mouldName+'</div>'
    			html+='		</div>'
	    		html+='		<div class="coupon_time">有效期：'+v[i].realDays+'天</div>'
	    		html+='		<div class="coupon_money">实付金额满：'+v[i].leastOrderMoney+'元</div>'
	    		html+='		<div class="coupon_come">来源：在线领取优惠券</div>'
	    		html+='	</dd>'
	    		if(v[i].onOff){
	    			html+='	<dd class="receive_state">领券</dd>'
	    		}else{
	    			html+='	<dd class="receive_state">已领取</dd>'
	    		}
	    		html+='</dl>'		    		
			}
			$('.coupon_main_').append(html)
		},
		 state :function(id){
		 	common.ajaxPost($.extend({},pub.publicParameter,{
				method:'get_coupon',
				couponId:id
			}),function(data){
				if (data.statusCode=='100000') {
					var dom = $(".coupon_main_").find("dl[data="+id+"]");
						dom.removeClass("coupon_status1").addClass("coupon_status3");
						dom.find('dt').removeClass("quan_c").addClass("quan_a");
						dom.find("dd.receive_state").html("已领取")
		
					common.prompt('领取成功')
				}else{
					common.prompt(data.statusStr);
				}
			})
		 }
	}
	pub.online_coupon.eventHeadle = {
		init:function(){
			$(".coupon_main_").on("click",".receive_state",function(){
				var id = $(this).parents("dl").attr("data")
				pub.online_coupon.state(id);
			});
			$('.lodemore').on('click',function(){
				if (!pub.isLast) {
					pub.pageNo++;
					pub.online_coupon.api()
				}
			});
		}
	}
	
	pub.init = function(){
		pub.eventHeadle.init();
		pub.type = $("body").attr("data");
		if(pub.type == 1 ){
			pub.code = common.websiteNode+'#HYDJ-DESC';
			pub.Business.init();
		}else if (pub.type == 2) {
			pub.change_password.init();
		}else if (pub.type == 3) {
			pub.code = common.websiteNode+'#YHQ-DESC';
			pub.coupon.init();
		}else{
			pub.online_coupon.init();
		}
		
	}
	pub.init();
})