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
		method:[{'1':'orders_manage2','2':'order_details_thr'},'order_cancel','order_del','gss_desc'],
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
			
				}
			}
			common.jump("../html/moreGoods.html");
			
		}
	}
	// 页面box之前切换
	pub.switchInput = function( title, node1, node2 ,fn ){
		
		fn = typeof fn === 'function' ? fn : function(){};
		$('.header_tit').html( title );
		document.title = title;
		$( node1 ).fadeOut(100,function(){
			$( node2 ).fadeIn(200);
			fn();
		});
	};
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
					/*
					 2018-8-10--14:54
					 朱高飞
					修改订单列表页面   orderStatus == 3  时对应的订单金额改为realPayMoney
					 * 
					 * */
					if (v[i].orderStatus=='1' || v[i].orderStatus=='2' ||v[i].orderStatus=='-1') {
						pub.html += '			<div class="order_list_details_money">订单金额:￥'+v[i].orderMoney+'元</div>'
					}else if (v[i].orderStatus=='4' || v[i].orderStatus=='3') {
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
			pub.couponData = ['',"quan_c","quan_b","quan_a"];
			pub.orderDetails.orderData();
			pub.orderDetails.eventHeadle.init();
			pub.arrid = pub.getIdArr();
		},
		orderData:function(){
			common.ajaxPost($.extend({},pub.userBasicParam,{
				method:pub.method[0][pub.page],
				orderCode:pub.orderCode
			}),function(data){
				if (data.statusCode=='100000'){
					pub.orderDetails.order_details_show(data);
				} else{
					common.prompt(data.statusStr)
				}
			})
		},
		post_cost_detail:function(code,e){
			common.ajaxPost({
				method:pub.method[3],
				websiteNode:pub.websiteNode,
				code:pub.code
			},function(data){
				if (data.statusCode=='100000') {
					e.data('data',data)
					common.alert_show(data)
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
			
			
			
			//备注信息
			$('#remark').val(' '+v.customRequest).attr('disabled',"disabled")
			//运费金额
			$('.order_details_distribution').removeClass("hidden");
			
			$('.order_details_make').removeClass("hidden");
			
			var orderViewData = {
				orderMoney:v.orderMoney,//订单总金额
				orderStatus:v.orderStatus,//订单状态
				shouldPayMoney:v.shouldPayMoney,//应付金额
				goodsDiscountMoney:v.goodsDiscountMoney,//其他优惠
				vipMoney:v.vipMoney,//vip优惠
				offMoney:v.offMoney,//优惠策略金额，
				couponMoney:v.couponMoney,//优惠卷金额
				realPayMoney:v.realPayMoney,
				offItem:data.data.offItem,//
				isGoToPay:v.isGoToPay,//是否点击过去支付
				useable:data.data.useable,//可选优惠卷
				unusable:data.data.unusable,
				selectData: null,
				couponInfo:data.data.couponInfo,
			}
			pub.couponListDat = orderViewData;
			pub.orderDetails.order_view.init()
			
			
			if (v.orderStatus=='1' || v.orderStatus=='2' || v.orderStatus=='3') {
				$('.logistic_price').html(v.postCost == '' ? '' : v.postCost +'元')
			}else if (v.orderStatus=='4') {
			}else if (v.orderStatus=='-1') {
			}
			
		},
		
		order_view:{
			init:function(){
				var v = pub.couponListDat;
				
				
				if (v.orderStatus == 3) {
					if (v.isGoToPay == 1) {
						if (v.couponInfo != null) {
							pub.orderDetails.order_view.couponList.init(v.couponInfo);
							v.couponMoney = v.couponInfo.couponMoney;
						}else{
							v.couponMoney = 0;
						}
						$(".conpon_item_box").off("click");
					}else{
						pub.couponListDat = $.extend({},pub.couponListDat, {
							selectData: (v.useable && v.useable.length !=0) ? v.useable[0] : false,
							couponMoney:(v.useable && v.useable.length !=0) ? v.useable[0].couponMoney : 0,
						});
						pub.orderDetails.order_view.couponList.init();
					}
				}else if (v.orderStatus == 4){
					$(".conpon_item_box").off("click");
					var c = pub.orderDetails.checkNotEmptyZero(v.couponMoney);
					if (c) {
						pub.orderDetails.order_view.couponList.init(1,c);
					}
				}else{
					$(".conpon_item_box").off("click");
				}
				
				//订单金额初始化
				pub.orderDetails.order_view.order_money();
				
				//订单底部按钮初始化
				pub.orderDetails.order_view.order_btn();
				
				//优惠相关初始化
				pub.orderDetails.order_view.coupon_box()
			},
			order_money:function(){
				var v= pub.couponListDat;
				//数据处理
				var domMoneyBox = $('.order_details_money_details dl'),
					domMoneyBox1 = $('.order_details_money');
				var h0=h1=h2=h3='',//定义四个里面的内容；
					domArr;//定义要操作的元素；
				
				h0 = '<span class="color_f27c32">'+v.orderMoney+'</span>元';
				h1 = +v.shouldPayMoney+"元";
				
				h2 = '-'+((v.goodsDiscountMoney==''?0:parseFloat(v.goodsDiscountMoney))+(v.vipMoney==''?0:parseFloat(v.vipMoney))+(v.offMoney == '' ? 0: parseFloat(v.offMoney))+(v.couponMoney == '' ? 0: parseFloat(v.couponMoney)));
				if ((v.orderStatus == 3 && v.isGoToPay == 1) || v.orderStatus=='4') {
					h3 = parseFloat(v.realPayMoney)+'元';
				}else{
					h3 = (parseFloat(v.realPayMoney)+parseFloat(h2))+'元';
				}
				h2 = h2+'元';
				if (v.orderStatus=='1') {
					domArr = $('.order_details_money');
				}else if(v.orderStatus=='2'){
					domArr = $('.order_details_money_details');
					h1 = '(按实际称重核算后计算) ？元';
					h2 = h3 = '？元';
				}else if (v.orderStatus=='3' || v.orderStatus=='4') {
					domArr = $('.order_details_money_details');
				}else if (v.orderStatus=='-1') {
				}
				//UI操作
				domArr && domArr.removeClass("hidden");
				//订单的金额初始化
				domMoneyBox1.find('dd').html(h0);
				domMoneyBox.eq(0).find('dd').html(h0).end()
					.next().find('dd').html(h1).end()
					.next().find('dd').html(h2).end()
					.next().find('dd').html(h3).end();
			},
			order_btn:function(){
				var v= pub.couponListDat;
				var domBtnCancle =  $('.order_details_cancel'),
					domBtnPs =$('.logistic_show'),
					domBtns = $('.order_details_cancel,.logistic_show'),
					domArr;
					
				if (v.orderStatus=='1') {
					domArr = domBtns;
					domBtnCancle.html('取消订单');
				}else if(v.orderStatus=='2'){
					domArr = domBtnPs;
				}else if (v.orderStatus=='3') {
					domArr = domBtns;
					domBtnCancle.html('去支付');
				}else if (v.orderStatus=='4') {
				}else if (v.orderStatus=='-1') {
					domArr = domBtnCancle;
					domBtnCancle.html('删除订单')
				}
				//UI操作
				domArr && domArr.removeClass("hidden");
			},
			coupon_box:function(){
				var v= pub.couponListDat;
				var domCoupon =  $('.order_details_coupon_box1'),//优惠卷
					domCoupon1 = $('。order_details_coupon_box11'),//优惠卷对应下方的提示
					domOff =  $('.order_details_coupon_box2'),//优惠策略
					domVip =  $('.order_details_coupon_box3'),//vip优惠
					domGoodsDiscount =  $('.order_details_coupon_box4'),//其他优惠
					classStr = '',c2,c21,c3,c4;
				
				
				
				
				
				if (v.orderStatus == 3 || v.orderStatus == 4) {
					vipMon = pub.orderDetails.checkNotEmptyZero(v.vipMoney);
					goodsDiscountMon = pub.orderDetails.checkNotEmptyZero(v.goodsDiscountMoney);
					//优惠策略
					if (v.orderStatus == 3) {
						if (classStr) {
							classStr += ',.order_details_coupon_box1,.order_details_coupon_box11'
						}else{
							classStr += '.order_details_coupon_box1,.order_details_coupon_box11'
						}
						
						if (v.offItem.id != '') {
							
							if (classStr) {
								classStr += ',.order_details_coupon_box2';
							}else{
								classStr += '.order_details_coupon_box2';
							}
							
							c2 = v.offItem.itemName;
							
						}
					}else{
						OffMon = pub.orderDetails.checkNotEmptyZero(v.offMoney);
						if (OffMon) {
							if (classStr) {
								classStr += ',.order_details_coupon_box2';
							}else{
								classStr += '.order_details_coupon_box2';
							}
							c2 = OffMon + '元';
							c21 = OffMon;
						}
						//优惠卷优惠
						couponMon = pub.orderDetails.checkNotEmptyZero(v.couponMoney);
						if (couponMon) {
							if (v.orderStatus == 4) {
								if (classStr) {
									classStr += ',.order_details_coupon_box1'
								}else{
									classStr += '.order_details_coupon_box1'
								}
							}else{
								if (classStr) {
									classStr += ',.order_details_coupon_box1,.order_details_coupon_box11'
								}else{
									classStr += '.order_details_coupon_box1,.order_details_coupon_box11'
								}
							}
							
							
						}
					}
					
					//VIP优惠
					if (vipMon) {
						
						if (classStr) {
							classStr += ',.order_details_coupon_box3';
						}else{
							classStr += '.order_details_coupon_box3';
						}
						c3 = vipMon + '元';
					}
					//其他优惠
					if (goodsDiscountMon) {
						
						if (classStr) {
							classStr += ',.order_details_coupon_box4';
						}else{
							classStr += '.order_details_coupon_box4';
						}
						c4 = goodsDiscountMon;
					}
				}
				classStr && $(classStr) && $(classStr).removeClass("hidden");
				
				
				domOff.find('dl dd').html(c2).attr('data',c21);
				domVip.find('dl dd').html(c3+"元").attr('data',c3);
				domGoodsDiscount.find('dl dd').html(c4+"元").attr('data',c4);
				
				
			},
			//优惠juan
			couponList:{
				init:function(d,c){
					if (d) {
						if (d === 1) {
	
							$('.conpon_item_box .order_details_coupon dd').html(c+"元").css({"background":"none","float":"left","color":"#333","right":'0'});
						}else{
							$('.conpon_item_box .order_details_coupon dd').html("已绑定：-"+d.couponMoney+"元").attr('dataId',d.id)
						}
					} else{
						var useable = pub.couponListDat.useable,
							unusable = pub.couponListDat.unusable;
						if (useable && useable.length !=0 ) {
							
							if (pub.couponListDat.selectData) {
								$('.conpon_item_box .order_details_coupon dd').html("已选：-"+pub.couponListDat.selectData.couponMoney+"元").attr('dataId',pub.couponListDat.selectData.id)
								$(".coupon_main_available").html(pub.orderDetails.order_view.couponList.htmlInit(useable,pub.couponListDat.selectData.id));
							}else{
								$('.conpon_item_box .order_details_coupon dd').html(useable.length+"张可用").attr('dataId',null)
								$(".coupon_main_available").html(pub.orderDetails.order_view.couponList.htmlInit(useable,'-1'));
							}
							
						}else{
							$(".coupon_main_available_box").hide();
							$('.conpon_item_box .order_details_coupon dd').html("无可用优惠卷")
						}
						if (unusable && unusable.length !=0 ) {
							$(".coupon_main_unAvailable").html(pub.orderDetails.order_view.couponList.htmlInit(unusable,'-1'))
						}else{
							$(".coupon_main_unAvailable_box").hide();
						}
					}
					
				},
				htmlInit:function(d,id){
					var l = d.length,html='';
					
					for (var i = 0; i < l; i++) {
						if (d[i].id == id) {
							html+='<dl class="clearfloat coupon_status'+d[i].status+' active">'
						}else{
							html+='<dl class="clearfloat coupon_status'+d[i].status+'">'
						}
						
			    		html+='	<dt class="sprite_login '+pub.couponData[d[i].status]+'">'+d[i].couponMoney+'元</dt>'
			    		html+='	<dd>'
			    		html+='		<div class="coupon_top clearfloat">'
			    		html+='			<div class="coupon_name">'+d[i].couponName+'</div>'
		    			html+='			<div class="coupon_state"></div>'
		    			html+='		</div>'
			    		html+='		<div class="coupon_time">有效期至：'+d[i].endTime+'</div>'
			    		html+='		<div class="coupon_money">金额要求：单个订单大于'+d[i].leastOrderMoney+'元</div>'
			    		html+='		<div class="coupon_come">来源：'+d[i].sendMethod+'</div>'
			    		html+='	</dd>'
			    		html+='</dl>'
					}
					return html;
				}
			}
		},
		checkNotEmptyZero:function(d){
			if (parseFloat(d) != 0 && d != '') {
				return d;
			}else{
				return false;
			}
		}
	}
	pub.orderDetails.eventHeadle = {
		init:function(){
			//点击返回按钮
			$(".moreDoogs_header_left").on('click',function(){
				if ($(".select_coupon").is(":hidden")) {
					common.jump("order_management.html")
				}else{
					pub.switchInput('订单详情','.select_coupon','.order_details' ,function(){
						$(".order_coupon_header_right").hide();
					});
				}
				
				/*window.location.href = "order_management.html?v=0.1";*/
			});
			//配送说明+优惠卷使用说明
			$('.logistic_show,.order_coupon_header_right').on('click',function(){
				var _this = $(this);
				var d = $(this).data('data');
				pub.code = pub.websiteNode+$(this).attr("data-type");
				if (d) {
					common.alert_show(d);
				}else{
					pub.orderDetails.post_cost_detail(pub.code,_this);
				}
			})
			$('.order_details_cancel').on('click',function(){
				if ($(this).html() == '去支付'){
					pub.couponId=$('.conpon_item_box dd').attr('dataId');
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
			$('.conpon_item_box').on("click",function(){
				pub.switchInput('选择优惠卷','.order_details','.select_coupon' ,function(){
					$(".order_coupon_header_right").show();
					$('html').scrollTop(0)
				});
			})
			$(window).load(function(){
				common.jsadd()
			});
			common.fadeIn();
			//点击不使用优惠卷
			$(".select_coupon_top").on("click",function(){
				var _this = $(this),
					isActive = _this.is(".active");
				
				if (!isActive) {
					_this.addClass("active");
					$(".coupon_main_available dl.active").removeClass("active");
				}
				pub.couponListDat = $.extend({},pub.couponListDat,{
					selectData:false,
					couponMoney:0,
				});
				pub.orderDetails.order_view.couponList.init();
				pub.orderDetails.order_view.order_money();
				pub.switchInput('订单详情','.select_coupon','.order_details' ,function(){
					$(".order_coupon_header_right").hide();
				});
			})
			//点击选择优惠卷
			$(".coupon_main_available").on("click",'dl',function(){
				var _this = $(this),
					isActive = _this.is(".active"),
					index = _this.index();
				if(!isActive){
					_this.addClass("active").siblings().removeClass("active");
					$(".select_coupon_top").removeClass("active");
				}
				pub.couponListDat = $.extend({},pub.couponListDat,{
					selectData:pub.couponListDat.useable[index],
					couponMoney:pub.couponListDat.useable[index].couponMoney,
				});
				pub.orderDetails.order_view.couponList.init();
				pub.orderDetails.order_view.order_money();
				pub.switchInput('订单详情','.select_coupon','.order_details' ,function(){
					$(".order_coupon_header_right").hide();
				});
			})
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