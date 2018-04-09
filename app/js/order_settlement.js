$(document).ready(function(){
	var pub = {};
	
	$.extend(pub,{
		page : $("body").attr("data"),
		userId:common.user_data().cuserInfoid,
		firmId:common.user_data().firmInfoid,
		websiteNode:common.websiteNode,
		code:common.websiteNode+'#PS-DESC',
		tokenId:common.tokenId(),
		source:"firmId"+common.user_data().firmInfoid,
		sign:md5("firmId"+common.user_data().firmInfoid+"key"+common.secretKey()).toUpperCase(),
		
	});
	if (pub.page == 2) {
		pub.address = JSON.parse(sessionStorage.address);
		pub.addressId = JSON.parse(sessionStorage.address).address.id;
		pub.postCost = JSON.parse(sessionStorage.address).postCost;
		pub.goodsList = goodlist1();
		pub.good_detail = goodlist2();
	} else if(pub.page == 1){
		pub.orderResult = JSON.parse(sessionStorage.getItem("orderResult"));
		pub.system = JSON.parse(sessionStorage.getItem('system'));
		pub.data = {
			title:{
				'100000':'订单提交成功',
				'100903':'有未支付订单',
				'100907':'您今天已经下单，请勿多次下单！'
			},
			info:{
				'100000':'',
				'100903':'有未支付订单',
				'100907':'如需重新下单，请取消之前所下订单！'
			},
			time:{
				'100000':'预计次日'+JSON.parse(sessionStorage.getItem('system')).default_dispatch_time+'送达，请保持通讯设备畅通',
				'100903':'',
				'100907':''
			}
		};
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
	/*-------------------------------------订单结算-----------------------------------------*/
	pub.settlement = {
		init:function(){
			pub.settlement.address();
			pub.settlement.goodShow();
			pub.settlement.eventHeadle.init();
		},
		address:function(){
			var $ele = $(".my_infor");
			if (!pub.address.address.receiverName){
				var div=$("<div>点击此处选择地址</div>").css({'line-height':'110px','text-align':'center','font-size':'36px'})
				$ele.find('.my_info_top').addClass("hidden").end().find("p").addClass("hidden").end().append(div);
			}else{
				var v = pub.address.address;
				$ele.attr('addId',v.id).find('.my_name').html(v.receiverName).end().find('.my_phoneNumber').html(v.receiverMobile).end().find('.my_address').html(v.allAddr);
			}
		},
		goodShow:function(){
			var v = pub.good_detail,html = '';					
			for (var i in v) {
				html +='<li>'
				html +='	<div class="order_goods_top clearfloat">'
				html +='		<b class="goods_name">'+v[i].name+'</b>'
				html +='		<span class="goods_num">X'+v[i].sum+'</span>'
				html +='	</div>'
				html +='	<div class="order_goods_bottom clearfloat">'
				html +='		<p class="goods_Price">'
				html +='			<span>'+v[i].gssPrice+'</span>元/'+v[i].priceUnit+'&nbsp;&nbsp;<span>'+v[i].price+'</span>元/'+v[i].wholePriceSize+''
				html +='		</p>'
				html +='		<span class="goods_subtotal">合计：￥'+(parseFloat(v[i].price)*parseInt(v[i].sum)).toFixed(2)+'</span>'
				html +='	</div>'
				html +='</li>'
			}
			$('.order_goods_box').append(html);
			$('.logistic .logistic_price').html(pub.address.postCost+'元');
			$('.order_footer_left span').html('￥'+getgoodsMoney());
		},
		orderSubmit:function(){
			common.ajaxPost({
				method:'order_submit',
				userId:pub.userId,
				firmId:pub.firmId,
				goodsList:pub.goodsList,
				customRequest:pub.customRequest,
				addressId:pub.addressId,
				postCost:pub.postCost,
				orderFrom:"H5",
				tokenId:pub.tokenId,
				sign:pub.sign,
				source:pub.source
			},function(data){
				if (data.statusCode=='100000' || data.statusCode=='100903' || data.statusCode=='100907') {
					if (data.statusCode=='100000') {
						localStorage.removeItem('good');
					};
					var orderResult={
						statusCode:data.statusCode,
						orderCode:data.data.orderCode
					};
					sessionStorage.setItem('orderResult',JSON.stringify(orderResult));
					common.jump("order_result.html")
				}else{
					$(".order_footer_right").addClass("true").html("提交订单");
					common.prompt(data.statusStr);
				}
			})
		},
	}
	pub.settlement.eventHeadle = {
		init:function(){
			$('.logistic_show').on('click',function(){
				if (pub.destData) {
					common.alert_show(pub.destData);
				}else{
					pub.desc_data(pub.code)
				}
			});
			$('.order_footer_right').on('click',function(){
				if ($(this).is(".true")) {
					pub.customRequest = $('#remark').val();
					if (pub.addressId) {
						$(this).html("提交中...").removeClass("true");
						pub.settlement.orderSubmit();
					}else{
						common.prompt("请选择地址")
					}
				}
				
			});
			$('.my_infor').on('click',function(){
				sessionStorage.setItem('ISaddress',pub.address.address.id)
				common.jump('address.html');
			});
			$(".header_left").on("click",function(){
				if (sessionStorage.getItem("sta") == 1) {
					common.jump("../html/goodsDetails.html")
				}else if(sessionStorage.getItem("sta") == 2) {
					common.jump("../html/moreGoods.html");
				}else if(sessionStorage.getItem("sta") == 3) {
					common.jump("../html/often_shop.html");
				}else {
					common.jump("../html/index.html");
				}
			})
			
			$(window).load(function(){
				common.jsadd()
			});
			common.fadeIn();
		}
	}
	/*------------------------------------------订单结算结果展示-----------------------------------*/
	pub.result = {
		init:function(){
			pub.result.show();
			pub.result.eventHeadle.init();
		},
		show:function(){
			$(".order_suc_num").html("订单编号："+pub.orderResult.orderCode);
			$('.order_result_title').html(pub.data.title[pub.orderResult.statusCode]);
			$(".order_suc_time").html(pub.data.time[pub.orderResult.statusCode])
		}
	}
	pub.result.eventHeadle = {
		init:function(){
			$('.order_suc_look').on('click',function(){
				sessionStorage.setItem('orderCode',pub.orderResult.orderCode);
				common.jump("../html/order_details.html")
			});
			$(".header_left").on("click",function(){
				sessionStorage.removeItem("orderResult");
				common.jump("../html/order_management.html")
			});
			$(window).load(function(){
				common.jsadd()
			});
			common.fadeIn();
		}
	}
	
	pub.init = function (){
		if ( pub.page == 1) {
			pub.result.init();
		} else if (pub.page == 2){
			pub.settlement.init();
		}
	}
	pub.init();
	
})