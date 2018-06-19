$(document).ready(function(){
	var pub = {};
	$.extend(pub,{
		websiteNode:common.websiteNode,
		pageSize:common.pageSize,
		pageNo:common.pageNo,
		html:'',
		isLast:false,
		code:common.websiteNode+'#JFSP-DESC',
		goodsId:sessionStorage.getItem("goodsId"),
		txt:null,
		logined:common.getIslogin(),
		bussinessType:null,
		data:{
			"0":{txt:"立即兑换",cla:"color01"},
			"1":{txt:"果币不足",cla:"color02"},
			"2":{txt:"您已兑换过啦",cla:"color03"},
			"3":{txt:"您已兑换过啦",cla:"color03"},
			"4":{txt:"已兑完",cla:"color03"}
		},
	});
	if (pub.logined) {
		pub.firmId = common.user_data().firmInfoid;
		pub.source = 'firmId'+common.user_data().firmInfoid;
		pub.sign = md5('firmId'+common.user_data().firmInfoid+"key"+common.secretKey()).toUpperCase()
	};
	//公用弹出框接口
	pub.desc_data = function(code){
		common.ajaxPost({
			method:'gss_desc',
			websiteNode:pub.websiteNode,
			code:code
		},function(data){
			if (data.statusCode=='100000') {
				$(".scoreGoodDetails").html(((data.data.desc).toString()).replace(/\r\n/g, "<br/>"))
			}else{
				common.prompt(data.statusStr);
			}
		})
	};
	pub.scoreGoods = {
		init:function(){
			pub.scoreGoods.api();
			pub.scoreGoods.eventHeadle.init();
		},
		api:function(){
			common.ajaxPost({
				method:'score_goods_show',
				websiteNode:pub.websiteNode,
				pageSize:common.pageSize,
				pageNo:common.pageNo
			},function(data){
				if (data.statusCode == "100000") {
					pub.isLast = data.data.isLast;
					if (data.data.objects.length != 0) {
						pub.scoreGoods.dataShow(data.data.objects);
					}
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		getImg:function(r){
			var im = new Image();
			im.src = r ; 

			if(im.complete){
				return "<img src = "+r+" />"
			}else{
				return '';
			}
		},
		dataShow:function(v){
			var html = '';
			for (var i in v) {
				html += '<li>'
				html += '	<dl data = "'+v[i].id+'">'
				html += '		<dt>'
				html += '			<img src = '+v[i].goodsLogo+' />'
				if(v[i].packageNum <=0){
					html += '		<img class="seal" src = "../img/seal@2x.png" />'
				}
				html += '		</dt>'
				html += '		<dd>'
				html += '			<p class="name">'+v[i].goodsName+'</p>'
				html += '			<p class="describe">'+v[i].sizeDesc+'</p>'
				html += '			<p class="info">'
				html += '				<span>'+v[i].score+'</span>'
				html += '				<span class="font22">币</span>'
				html += '				<del class="original_price">￥'+v[i].gssPrice+'</del>'
				html += '			</p>'
				html += '		</dd>'
				html += '	</dl>'
				html += '</li>'
			}
			$(".score_goods_main_wrap ul").append(html);
			!pub.isLast && $(".lodemore").html("点击加载更多！");
			pub.isLast && $(".lodemore").html("没有更多数据了！");
		}
	}
	pub.scoreGoods.eventHeadle = {
		init:function(){
			//点击返回按钮
			$('.score_goods_main_wrap').on('click',"dl",function(){
				sessionStorage.setItem("goodsId",$(this).attr("data"));
				common.jump("scoreGood.html")
				/*window.location.href = 'scoreGood.html?v=0.1'*/
			});
			$('.lodemore').on('click',function(){
				if (!pub.isLast) {
					pub.pageNo ++ ;
					pub.table.api();
				}
			});
			$(window).load(function(){
				common.jsadd();
			});
			common.fadeIn();
			$(".header_left").on('click',function(){
				common.jump("../html/score.html")
				/*window.location.href = "../html/score.html?v=0.1";*/
			})
		}
	}
	
	
	pub.scoreGood = {
		init:function(){
			pub.scoreGood.api();
			pub.desc_data(pub.code);
			pub.scoreGood.eventHeadle.init();
			if (common.isPhone()) {
				$(".order_refund").css("left",0)
			}
		},
		api:function(){
			common.ajaxPost({
				method:'scoregoods_details',
				firmId:pub.firmId,
				goodsId:pub.goodsId
			},function(data){
				if (data.statusCode=='100000') {
					$(".order_refund").hide();
					pub.bussinessType = data.data.bussinessType
					pub.scoreGood.goods_show(data);
				}else{
					$(".order_refund").hide();
					common.prompt(data.statusStr)
				}
			})
		},
		getScoreGood:function(){
			common.ajaxPost({
				method:'exchange_scoregoods',
				firmId:pub.firmId,
				goodsId:pub.goodsId
			},function(data){
				$('.scoregoodsBtn').attr("class","scoregoodsBtn");
				if (data.statusCode=='100000') {
					$(".order_refund").hide();
					pub.scoreGood.alert("兑换成功");
					var s = data.data.status;
					$(".scoregoodsBtn").html(pub.data[s].txt).addClass(pub.data[s].cla);
					if (s == 0) {
						$(".scoregoodsBtn").addClass("true");
					}
				}else{
					$(".order_refund").hide();
					common.prompt(data.statusStr)
				}
			})
		},
		alert:function(text){
			layer.open({
			    content: text,
			    btn: '确定'
			});
		},
		goods_show:function(data){
			
			pub.scoreGood.good_banner_show(data);
			
			pub.scoreGood.good_info_show(data);
		},
		good_banner_show:function(data){
			//展示商品图片
			var arr1=data.data.scoreGoods.goodsPics.split('@');
			for (var i = 0; i< arr1.length -1 ; i++) {
				pub.html += '<div class="swiper-slide "><img src="'+arr1[i]+'" /></div>'
			}
			$(".goodsDetails_img_box .swiper-wrapper").append(pub.html);
			var mySwiper = new Swiper ('.goodsDetails_img_box', {
			    direction: 'horizontal',
			    loop: true,
			    autoplay:5000,
			    paginationClickable:true,
			    // 如果需要分页器
			    pagination: '.swiper-pagination'
			});
		},
		good_info_show:function(data){
			var v = data.data.scoreGoods;
			var s = data.data.status;
			$(".goodsDetails_box1_top").find("h3").html(v.goodsName).end().find("span.score_color").html(v.score).end().find(".score_rmb").html("￥"+v.gssPrice);
			$(".describe").html(v.sizeDesc);
			if (v.goodsContext) {
				$(".goodsDetails_box2_").html(v.goodsContext).find("p").attr("style","");
			}else{
				$(".goodsDetails_box2_").addClass("hidden").prev().addClass("hidden")
			}
			$(".scoregoodsBtn").html(pub.data[s].txt).addClass(pub.data[s].cla);
			if (s == 0) {
				$(".scoregoodsBtn").addClass("true");
			}
		}
	}
	
	pub.scoreGood.eventHeadle = {
		init:function(){
			common.callback($(".header_left"));
			$(".scoregoodsBtn").on("click",function(){
				if ($(this).is(".true") && $(this).is(".color01")) {
					layer.open({
					    content: '兑换后不能退换，确定兑换？',
					    btn: ['确定', '取消'],
					    yes: function(index){
					    	pub.scoreGood.getScoreGood();
					    	layer.close(index);
							$(".order_refund").show().css("margin-left",$(".header-wrap").css("margin-left"))
					    }
					});
				}
			});
			$(window).load(function(){
				common.jsadd();
			});
			common.fadeIn();
		}
	}
	
	
	pub.init = function(){
		pub.page = $("body").attr("data");
		if (pub.page == 1) {
			pub.scoreGoods.init();
		}else if(pub.page == 2){
			pub.scoreGood.init();
		}
	}
	pub.init();
});
