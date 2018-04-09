$(document).ready(function(){
	var pub = {};
	var arr1 = ['订单编号:','下单时间:']
	$.extend(pub,{
		page:$("body").attr("data"),
		html:'',
		orderStatus:1,
		isLast:false,
		pageSize:common.pageSize,
		pageNo:common.pageNo,
		logined : common.getIslogin(),
		method:[{'1':'orders_manage2','2':'order_details2'},'order_cancel','order_del','gss_desc'],
		index:0,
		orderCode:null,
		order_main:$('.order_management_main .order_man_main'),
		status:['已作废','','待发货','已配货','待支付','已支付'],
		statusObj:[
			'<dl class="order_list_close">关闭交易</dl>',
			'',
			'<dl class="order_list_close clearfloat"><dt style="color: #2f83ff;">实际金额按照实际称重计算为准</dt><dd>取消订单</dd></dl>',
			'<dl class="order_list_close" style="color: #2f83ff;">实际金额按照实际称重计算为准</dl>',
			'<dl class="order_list_close clearfloat"><dt style="color: #d05351;">为避免耽误您再次下单,请尽快支付</dt><dd style="background:#f47c30;color:#FFF;border-color: #FFF;">立即支付</dd></dl>',
			'<dl class="order_list_close order_suc_">交易成功!</dl>'
		],
		websiteNode : common.websiteNode,
		couponId:'',
		data:[
			{time:"preSendTime",title:'预计配送'},
			{time:"preSendTime",title:'预计配送'},
			{time:"preSendTime",title:'预计配送'},
			{time:"readyGoodsTime",title:'配货时间'},
			{time:"readyGoodsTime",title:'配货时间'},
			{time:"readyGoodsTime",title:'配货时间'}
		],
		goodobj:{},
		good:localStorage.good == undefined ? [] : JSON.parse(localStorage.good)
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
	};
	if( pub.page == 2 ){
		pub.code = pub.websiteNode+'#PS-DESC';
		pub.orderCode = JSON.parse(sessionStorage.getItem('orderCode'));
	};
	
	//公用方法
	pub.order_del=function(){
		console.log(pub.userBasicParam)
		common.ajaxPost($.extend({},pub.userBasicParam,{
			method:pub.method[pub.index],
			orderCode:pub.orderCode
		}),function(data){
			if (data.statusCode=='100000'){
				if (pub.index == 1) {
					pub.backgoshop(data);
				}else{
					window.history.back();
				}
			} else{
				common.prompt(data.statusStr)
			}
		})
	};
	pub.getIdArr = function(){
		var arr= [];
		for (var i in pub.good) {
			arr.push(pub.good[i].id)
		}
		return arr;
	}
	pub.backgoshop = function(data){
		var v = data.data;
		if (data.data != null) {
			var i = 0;
			/*var j = 0;
			var k = 0;
			var is = null;*/
			for (i in v) {
				/*is = false;*/
				if (pub.good.length == 0) {
					pub.goodobj = {
						id:v[i].id,
						name:v[i].goodsName,
						sum:v[i].buyCount,
						price:v[i].wholeGssPrice,
						wholePriceSize:v[i].wholePriceSize,
						gssPrice:v[i].gssPrice,
						priceUnit:v[i].priceUnit,
						packageNum:v[i].packageNum,
						maxCount:v[i].maxCount
					};
					pub.good.push(pub.goodobj);
					localStorage.setItem("good",JSON.stringify(pub.good));
					
				} else{
					var l = (pub.arrid).indexOf(parseFloat(v[i].id));
					if ( l == -1) {
						pub.goodobj = {
							id:v[i].id,
							name:v[i].goodsName,
							sum:v[i].buyCount,
							price:v[i].wholeGssPrice,
							wholePriceSize:v[i].wholePriceSize,
							gssPrice:v[i].gssPrice,
							priceUnit:v[i].priceUnit,
							packageNum:v[i].packageNum,
							maxCount:v[i].maxCount
						};
						pub.good.push(pub.goodobj);
					}else{
						pub.good[l].sum = v[i].buyCount + pub.good[l].sum ;
					}
					
					localStorage.setItem("good",JSON.stringify(pub.good));
			
					/*for(j; j < pub.good.length ; j++){
						if (pub.good[j].id == v[i].id) {
							is = true;
							pub.good[j].sum = v[i].buyCount + pub.good[j].sum ;
							break;
						}
					}*/
				}
				/*if ((pub.good.length - k) == 0) {
					pub.goodobj = {
						id:v[i].id,
						name:v[i].goodsName,
						sum:v[i].buyCount,
						price:v[i].wholeGssPrice,
						wholePriceSize:v[i].wholePriceSize,
						gssPrice:v[i].gssPrice,
						priceUnit:v[i].priceUnit,
						packageNum:v[i].packageNum,
						maxCount:v[i].maxCount
					};
					pub.good.push(pub.goodobj);
					k++;
				}else{
					for(j; j < (pub.good.length)-k ; j++){
						if (pub.good[j].id == v[i].id) {
							is = true;
							pub.good[j].sum = v[i].buyCount + pub.good[j].sum ;
							break;
						}
					}
					if (!is) {
						pub.goodobj = {
							goodType:v[i].bussinessType,
							id:v[i].id,
							name:v[i].goodsName,
							packageNum:v[i].packageNum,
							sum:v[i].buyCount,
							goodscore:v[i].score,
							gssPrice:v[i].gssPrice,
							maxCount:v[i].maxCount,
							price:v[i].wholeGssPrice,
							priceUnit:v[i].priceUnit,
							wholePriceSize:v[i].wholePriceSize
						};
						pub.good.push(pub.goodobj);
						k++;
					}
				}*/
			}
			common.jump("../html/moreGoods.html");
			/*window.location.href = "../html/moreGoods.html?v=0.1"*/
		}
	}
	
	/*---------------------------------------订单管理----------------------------------*/
	pub.order = {
		init:function(){
			pub.order.orderData()
			pub.order.eventHeadle.init();
			pub.arrid = pub.getIdArr();
		},
		orderData:function(){
			common.ajaxPost($.extend({},pub.userBasicParam,{
				method:pub.method[0][pub.page],
				firmId:pub.firmId,
				orderStatus:pub.orderStatus,
				pageNo:pub.pageNo,
				pageSize:pub.pageSize,
			}),function(data){
				if (data.statusCode=='100000'){
					pub.isLast=data.data.isLast;
					pub.order.order_list_show(data)
				} else{
					common.prompt(data.statusStr)
				}
			})
		},
		order_list_show:function(data){
			pub.html = '';
			var v = data.data.objects
			if (v.length!='0') {
				for (var i in v) {
					pub.html += '<li class="order_list" data="'+v[i].orderCode+'">'
					pub.html += '	<div class="order_list_top clearfloat">'
					pub.html += '		<div class="order_list_num">订单编号：'+v[i].orderCode+'</div>'
					pub.html += '		<div class="order_list_state">'+pub.status[v[i].orderStatus +1]+'</div>'
					pub.html += '	</div>'
					pub.html += '	<div class="order_list_details">'
					pub.html += '		<div class="order_list_details_top clearfloat">'
					pub.html += '			<div class="order_list_details_num">商品数量:'+v[i].containGoodsNum+'件</div>'
					if (v[i].orderStatus=='1' || v[i].orderStatus=='2' || v[i].orderStatus=='3' ||v[i].orderStatus=='-1') {
						pub.html += '			<div class="order_list_details_money">订单金额:￥'+v[i].orderMoney+'元</div>'
					}else if (v[i].orderStatus=='4') {
						pub.html += '			<div class="order_list_details_money">订单金额:￥'+v[i].realPayMoney+'元</div>'
					}
					pub.html += '		</div>'
					pub.html += '		<div class="order_list_details_buttom clearfloat">'
					pub.html += '			<div class="order_list_details_weight">商品重量:'+v[i].containGoodsWeight+'斤</div>'
					pub.html += '			<div class="order_list_details_time">下单时间:'+v[i].createTime+'</div>'
					pub.html += '		</div>'
					pub.html += '	</div>'
					pub.html += ''+pub.statusObj[v[i].orderStatus + 1]+''
					pub.html += '</li>'
				}
			}else{
				pub.html='';
			}
			if (pub.orderStatus=='') {
				$('.order_man_main4').append(pub.html)
			}else{
				$(".order_man_main"+pub.orderStatus).html(pub.html)
			}
			
			if (pub.isLast) {
				$('.lodemore').html('没有更多数据了').css('display','block')
				if (v.length=='0') {
					$('.lodemore').html('').css('display','none')
				}
			}else{
				$('.lodemore').html('点击加载更多数据')
			}
		}
	}
	pub.order.eventHeadle = {
		init:function(){
			$(".order_management_top .order_man_item").on('click',function(){
				pub.pageNo = common.pageNo;
				pub.orderStatus = $(this).index()<3 ? $(this).index() + 1 : '';
				$(this).addClass("order_border_bottom").siblings().removeClass('order_border_bottom');
				pub.order_main.eq($(this).index()).css('display',"block").siblings().css('display','none');
				pub.order_main.eq($(this).index()).find('.order_list').remove();
				pub.order.orderData();
			});
			$('.order_man_main').on('click','.order_list',function(){
				sessionStorage.setItem('orderCode',JSON.stringify($(this).attr('data')))
				common.jump("order_details.html")
				/*window.location.href='order_details.html?v=0.1'*/
			});
			$('.order_man_main').on('click','.lodemore',function(){
				pub.pageNo++;
				pub.order.orderData();
			});
			$(".order_man_main").on("click",'.order_list_close,.order_list_close dd',function(e){
				common.stopEventBubble(e);
				console.log($(this).html())
				if($(this).html() == "关闭交易" || $(this).html() == "取消订单" ){
					if ($(this).html() == "关闭交易") {
						pub.orderCode = $(this).parent().attr('data');
						pub.index = 2;
					}else if($(this).html() == "取消订单"){
						pub.orderCode = $(this).parent().parent().attr('data');
						pub.index = 1;
					}
					layer.open({
					    content: '您确定要'+$(this).html()+'吗？',
					    btn: ['确定', '取消'],
					    yes: function(index){
					      pub.order_del();
					      layer.close(index);
					    }
					});
				}
				if ($(this).html() == "立即支付") {
					sessionStorage.setItem('orderCode',JSON.stringify($(this).parent().parent().attr('data')))
					common.jump("order_details.html")
					/*window.location.href='order_details.html?v=0.1'*/
				}
			});
			//返回按钮
			$('.moreDoogs_header_left').on('click',function(){
				sessionStorage.removeItem('orderCode');
				common.jump("wo.html")
				/*window.location.href='wo.html?v=0.1';*/
			});
			$(window).load(function(){
				common.jsadd()
			});
			common.fadeIn()
		}
	}
	
	/*---------------------------------------------订单详情--------------------------------------------*/
	
	
	pub.orderDetails = {
		init:function(){
			pub.orderDetails.orderData();
			pub.orderDetails.eventHeadle.init();
			pub.arrid = pub.getIdArr();
		},
		orderData:function(){
			common.ajaxPost($.extend({},pub.userBasicParam,{
				method:pub.method[0][pub.page],
				orderCode:pub.orderCode
			}),function(data){
				console.log(JSON.stringify(data))
				if (data.statusCode=='100000'){
					pub.orderDetails.order_details_show(data);
				} else{
					common.prompt(data.statusStr)
				}
			})
		},
		post_cost_detail:function(){
			common.ajaxPost({
				method:pub.method[3],
				websiteNode:pub.websiteNode,
				code:pub.code
			},function(data){
				if (data.statusCode=='100000') {
					pub.destData = data;
					common.alert_show(pub.destData)
				}
			})
		},
		order_pay:function(){
			common.ajaxPost($.extend({},pub.userBasicParam,{
				method:'order_to_pay2',
				orderCode:pub.orderCode,
				couponId:pub.couponId
			}),function(data){
				if (data.statusCode=='100000'){
					var order={
						orderCode:data.data.orderCode,
						realPayMoney:data.data.realPayMoney
					};
					sessionStorage.setItem('order_pay',JSON.stringify(order))
					common.jump("order_pay.html");
					/*window.location.href='order_pay.html?v=0.1';*/
				} else{
					common.prompt(data.statusStr)
				}
			})
		},
		order_details_show:function(data){
			var v = data.data.orderInfo,o = data.data.orderInfo.orderDetailsList,c = data.data.offItem;
			var $odtd = $('.order_details_top dl');
			$('.order_details_top_code dt').eq(0).html(arr1[0]);
			$('.order_details_top_code dd').eq(0).html(v.orderCode).end().eq(1).html(pub.status[v.orderStatus + 1]);
			$odtd.eq(1).find('dt').html(arr1[1]).end().find("dd").html(v.createTime);
			$odtd.eq(2).find('dt').html(pub.data[v.orderStatus +1].title).end().find('dd').html(v[pub.data[v.orderStatus +1].time]);
			
			if (v.orderStatus=='-1') {
				$odtd.eq(3).addClass("hidden");
			}else if (v.orderStatus=='1' || v.orderStatus=='2') {
				$odtd.eq(3).find('dt').html("&nbsp;").end().find("dd").html('(请保持电话通畅)');
			}else{
				$odtd.eq(3).find('dt').html('配送时间').end().find("dd").html(v.sendTime);
				$('.order_details_goods .order_details_goods_').addClass('show')
			}
			$('.order_details_name').html(v.customName)
			$('.order_details_phoneNumber').html(v.customMobile)
			$('.order_details_address').html(v.receiveAddress)
			var html='';
			for (var i in o) {
				html+='<li>'
				html+='	<dl class="clearfloat">'
				html+='		<dt class="goodName">'+o[i].goodsName+'</dt>'
				html+='		<dd><span class="color_f27c32">'+o[i].gssPrice+'</span>元/'+o[i].priceUnit+'&nbsp;&nbsp;<span class="color_f27c32">'+o[i].wholeGssPrice+'</span>元/'+o[i].wholePriceSize+'</dd>'
				html+='		<dd class="order_details_goods_right">X'+o[i].buyCount+'</dd>'
				html+='	</dl>'
				html+='	<dl class="clearfloat">'
				html+='		<dt>商品总量:</dt>'
				html+='		<dd>'+o[i].goodsWholeCount+'x'+o[i].buyCount+'='+parseFloat(o[i].buyCount)*parseFloat(o[i].goodsWholeCount)+''+o[i].priceUnit+'</dd>'
				html+='		<dd class="order_details_goods_right">总价:'+o[i].costMoney+'元</dd>'
				html+='	</dl>'
				if ((v.orderStatus=='3'||v.orderStatus=='4')) {
					html+='	<div class="order_details_goods_ clearfloat">'
					html+='		<dl class="odg_left clearfloat">'
					html+='			<dt>实际总重:</dt>'
					html+='			<dd><span>'+o[i].afterWholePriceSize+'</span>'+o[i].priceUnit+'</dd>'
					html+='		</dl>'
					html+='		<dl class="odg_right clearfloat">'
					html+='			<dt>实际总价:</dt>'
					html+='			<dd><span>'+o[i].afterCostMoney+'</span>元</dd>'
					html+='		</dl>'
					html+='	</div>'
				} else{
					html +=''
				}
				html+='</li>'
			}
			$('.order_details_goods').append(html)
			
			if (v.isGoToPay == 1) {
				if (data.data.couponInfo != null) {
					$(".order_details_coupon dd input").val(data.data.couponInfo.couponMoney+"元");
					$(".order_details_coupon_sel_box_top").html(data.data.couponInfo.couponName+"(已绑定)").attr("data",data.data.couponInfo.id).attr("couponMoney",data.data.couponInfo.couponMoney);
				}
			} else{
				var html1='';
				for (var i in data.data.couponList) {
					html1+='<p data="'+data.data.couponList[i].id+'" couponMoney="'+data.data.couponList[i].couponMoney+'">'+data.data.couponList[i].couponName+'</p>'
				}
				$('.order_details_coupon_sel_box_bottom').html(html1);
				//优惠券选择时间应该在加载数据后选择
				$('.order_details_coupon_sel_box_top').on('click',function(){
					$('.order_details_coupon_sel_box_bottom').toggle();
				});
				$('.order_details_coupon_sel_box_bottom p').on('click',function(){
					$('.order_details_coupon_sel_box_bottom').hide();
					if($(this).html() != ''){
						$('.order_details_coupon_sel_box_top').html($(this).html());
						$('.order_details_coupon_sel_box_top').attr('data',$(this).attr('data'));
						$('.order_details_coupon dd input').val($(this).attr('couponMoney')+"元")
						$odmdd.eq(2).find('dd').html('-'+((v.goodsDiscountMoney==''?0:parseFloat(v.goodsDiscountMoney))+(v.vipMoney==''?0:parseFloat(v.vipMoney))+(data.data.offItem.freeMoney==''?0:parseFloat(data.data.offItem.freeMoney))+parseFloat($('.order_details_coupon dd input').val()))+"元")
						$odmdd.eq(3).find('dd').html((parseFloat(v.shouldPayMoney)+parseFloat($odmdd.eq(2).find('dd').html())).toFixed(2) +'元')
					}
				})
			}
			if (v.orderStatus == 3) {
				//优惠策略
				if (c.id != '') {
					$('.order_details_coupon_box2').removeClass("hidden")
					$('.order_details_coupon_box2 dl dd').html(c.itemName)
				}
				//VIP优惠
				if (!(parseFloat(v.vipMoney)=='0' ||v.vipMoney=='')) {
					$('.order_details_coupon_box3').removeClass("hidden")
					$('.order_details_coupon_box3 dl dd').html(v.offMoney+'元')
				}
				//其他优惠
				if (!(parseFloat(v.goodsDiscountMoney)=='0' || v.goodsDiscountMoney=='')) {
					$('.order_details_coupon_box4').removeClass("hidden").find("dl dd").html(v.goodsDiscountMoney+'元');
				}
			}
			if (v.orderStatus == 4) {
				//优惠卷优惠
				if(parseFloat(v.couponMoney) != 0 && v.couponMoney != ''){
					$('.order_details_coupon_box1').removeClass("hidden").find("dl dd").html(v.couponMoney+'元').attr("data",v.couponMoney).end().find(".order_details_coupon_sel_box").remove()
				}
				//优惠策略
				if (parseFloat(v.offMoney) !='0' && v.offMoney != '') {
					$('.order_details_coupon_box2').removeClass("hidden").find("dl dd").html(v.offMoney+'元').attr("data",v.offMoney)
				}
				//VIP优惠
				if (parseFloat(v.vipMoney)!='0' && v.vipMoney != '') {
					$('.order_details_coupon_box3').removeClass("hidden").find("dl dd").html(v.offMoney+'元').attr("data",v.offMoney)
				}
				//其他优惠
				if (parseFloat(v.goodsDiscountMoney) !='0' && v.goodsDiscountMoney != '') {
					$('.order_details_coupon_box4').removeClass("hidden").find("dl dd").html(v.goodsDiscountMoney+'元').attr("data",v.goodsDiscountMoney)
				}
			}
			//备注信息
			$('#remark').val(' '+v.customRequest).attr('disabled',"disabled")
			//运费金额
			$('.order_details_distribution').removeClass("hidden");
			
			$('.order_details_money dl dd').html('<span class="color_f27c32">'+v.orderMoney+'</span>元');
			$('.order_details_make').removeClass("hidden")
			var $odmdd = $('.order_details_money_details dl');
			//订单的金额
			$odmdd.eq(0).find('dd').html('<span class="color_f27c32">'+v.orderMoney+'</span>元')
			$odmdd.eq(1).find('dd').html(v.shouldPayMoney+"元")
			if (v.orderStatus == 4) {
				$odmdd.eq(2).find('dd').html('-'+((v.goodsDiscountMoney==''?0:parseFloat(v.goodsDiscountMoney))+(v.vipMoney==''?0:parseFloat(v.vipMoney))+(data.data.offItem.freeMoney==''?0:parseFloat(data.data.offItem.freeMoney))+(v.offMoney == '' ? 0: parseFloat(v.offMoney)))+"元")
			}else{
				$odmdd.eq(2).find('dd').html('-'+((v.goodsDiscountMoney==''?0:parseFloat(v.goodsDiscountMoney))+(v.vipMoney==''?0:parseFloat(v.vipMoney))+(data.data.offItem.freeMoney==''?0:parseFloat(data.data.offItem.freeMoney))+(v.offMoney == '' ? 0: parseFloat(v.offMoney)))+"元")
			
			}
			$odmdd.eq(3).find('dd').html(parseFloat(v.realPayMoney)+'元')
			if (v.orderStatus=='1') {
				$('.order_details_money,.logistic_show').removeClass("hidden")
				$('.order_details_cancel').removeClass("hidden").html('取消订单');
				$('.logistic_price').html(v.postCost == '' ? '' : v.postCost +'元')
			}else if(v.orderStatus=='2'){
				$('.logistic_price').html(v.postCost == '' ? '0元' : v.postCost +'元')
				$('.order_details_money_details,.logistic_show').removeClass("hidden")
				$odmdd.eq(0).find('dd').html('<span class="color_f27c32">'+v.orderMoney+'</span>元')
				$odmdd.eq(1).find('dd').html('(按实际称重核算后计算) ？元')
				$odmdd.eq(2).find('dd').html('？元')
				$odmdd.eq(3).find('dd').html('？元')
			}else if (v.orderStatus=='3') {
				$(".order_details_goods_").show();
				$('.order_details_coupon_box1,.order_details_coupon_box11,.order_details_money_details,.order_details_coupon_box,.logistic_show').removeClass("hidden");
				$('.order_details_cancel').removeClass("hidden").html('去支付');
			}else if (v.orderStatus=='4') {
				console.log(v.orderStatus)
				$('.order_details_money_details,.order_details_goods_').removeClass("hidden");
			}else if (v.orderStatus=='-1') {
				$('.order_details_cancel').removeClass("hidden").html('删除订单')
			}
		}
	}
	pub.orderDetails.eventHeadle = {
		init:function(){
			//点击返回按钮
			$(".moreDoogs_header_left").on('click',function(){
				common.jump("order_management.html")
				/*window.location.href = "order_management.html?v=0.1";*/
			});
			$('.logistic_show').on('click',function(){
				if (pub.destData) {
					common.alert_show(pub.destData);
				}else{
					pub.orderDetails.post_cost_detail(pub.code);
				}
			})
			$('.order_details_cancel').on('click',function(){
				if ($(this).html() == '去支付'){
					pub.couponId=$('.order_details_coupon_sel_box_top').attr('data');
					pub.orderDetails.order_pay();
				}else{
					if ($(this).html() == '取消订单') {
						pub.index = 1;
					} else if ($(this).html() == '删除订单'){
						pub.index = 2;
					}
					layer.open({
					    content: '您确定要'+$(this).html()+'吗？',
					    btn: ['确定', '取消'],
					    yes: function(index){
					      pub.order_del();
					      layer.close(index);
					    }
					});
				}
			});
			$(window).load(function(){
				common.jsadd()
			});
			common.fadeIn()
		}
	}
	pub.init = function(){
		if (pub.page == 1) {
			pub.order.init();
		} else if(pub.page == 2) {
			pub.orderDetails.init();
		}
	}
	pub.init();
})