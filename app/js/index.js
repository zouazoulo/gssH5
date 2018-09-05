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
	
	pub.index = {
		init:function(){
			if (pub.logined) {
				//if (sessionStorage.getItem("isAuto") != "true" && common.tokenId()) {
					common.autoLogin();
				//};
			}
			$('.index_header_left').html(common.websitData[pub.websiteNode]);
			!pub.openid && pub.code && pub.index.get_openid();
			pub.index.ajax_index_data();
			pub.index.eventHeadle.init();
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
					if (!sessionStorage.getItem('system')) {
						common.get_System(pub.websiteNode);
					}
					if (pub.logined) {
						if (sessionStorage.getItem("new_msg") == "true") {
							var span = $("<span></span>")
							span.addClass("new_msg")
							$(".footer1 dl").eq(3).find("dt").append(span);
						}else{
							pub.index.getmessage();
						}
						$('.footer1 dl').eq(3).attr("data","html/message.html");
					}
					
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		//banner
		index_load:function(data){
			var html='',v = data.data.topList;
			
			for (var i=0 in v){
				var linkUrl = pub.index.getLinkUrl(v[i].jumpType , v[i].linkUrl , v[i].adTime);
				html += '<div class="swiper-slide"><a href="'+(!linkUrl ? "javascript:void(0)" : linkUrl)+'"><img src="'+v[i].adLogo+'" /></a></div>'
			}
			$(".banner .swiper-wrapper").append(html);
			
			var mySwiper = new Swiper ('.banner', {
			    direction: 'horizontal',
			    loop: true,
			    autoplay:5000,
			    paginationClickable:true,
			    // 如果需要分页器
			    pagination: '.swiper-pagination'
			});
			
			var v2 = data.data.centerList;
			if (v2.length != 0) {
				var linkUrl1 = pub.index.getLinkUrl(v2[0].jumpType , v2[0].linkUrl , v2[0].adTime);
				var html1 = '<a href="'+(!linkUrl1 ? "javascript:void(0)" : linkUrl1)+'"><img src="'+v2[0].adLogo+'" /></a>'
				$(".index-advertisement-wrap .index-advertisement").html(html1).css("display","block");
			}
			
		},
		//广告通知
		index_guanggao:function (data){
			var html='',htm ='<div class="my_bg" style="display: none;"></div>';
			for (var i=0 in data.data.noticeInfoList){
				html += '<li class="swiper-slide swiper-no-swiping" data="'+data.data.noticeInfoList[i].id+'" data1="'+i+'">'+data.data.noticeInfoList[i].noticeTitle+'</li>'
			}
			for (var j=0 in data.data.noticeInfoList) {
				htm +='<div id="logistic_show'+data.data.noticeInfoList[j].id+'" style="display: none;">'
				htm +='	<div class="logistic_show_header">'
				htm +='		<h3 class="logistic_show_title">'+data.data.noticeInfoList[j].noticeTitle+'</h3>'
				htm +='		<span class="logistic_back sprite delete_b"></span>'
				htm +='	</div>'
				htm +='	<div class="logistic_show_main">'
				htm +='		<div class="logistic_show_text"></div>'
				htm +='	</div>'
				htm +='	<div class="logistic_show_footer">by:果速送平台</div>'
				htm +='</div>'
				
			}
			var index_guanggao_data=sessionStorage.getItem("index_guanggao_data",JSON.stringify(data.data.noticeInfoList))
			$(".gonggao ul").append(html);
			$('body').append(htm);
			var mySwiper = new Swiper ('.gonggao', {
			    direction: 'vertical',
			    noSwiping : true,
			    height:50,
			    loop: true,
			    autoplay:4000,
			    spend:2000
			});
			$('.gonggao li').on('click',function(){
				var str='#logistic_show'+$(this).attr('data');
				var strin=data.data.noticeInfoList[$(this).attr('data1')].noticeContent;
				strin = (strin.toString())
				$(str).find('.logistic_show_text').html(strin.replace(/\r\n/g, "<br/>"))
				$(str).css({
					'width': '600px',
					'height': '690px',
					'position': 'fixed',
					'z-index': '9000',
					'background': '#FFfFFF',
					'top': '50%',
					'left': '50%',
					'margin-left': '-300px',
					'margin-top': '-345px',
					'border-radius': '10px'
				});
				$(str).show();
				$(".my_bg").show();
				kaiguan=true;
				$(str).find(".logistic_back").on("click",function(){
					if(kaiguan){
						$(str).hide();
						$(".my_bg").hide();
						kaiguan=false;
						$(str).find(".logistic_back").off('click');
						$(".my_bg").off('click');
					}
				})
				$(".my_bg").on("click",function(){
					if(kaiguan){
						$(str).hide();
						$(".my_bg").hide();
						kaiguan=false;
						$(str).find(".logistic_back").off('click');
						$(".my_bg").off('click');
					}
				})
			})
		},
		//商品
		index_goodsItem:function (data){
			var html='',v = data.data.mainActivityList,o;
			for (var i=0 , vl = v.length; i < vl; i++){
				var line = getLineNum(v[i].rowNum),
					column = getColumnNum(v[i].goodsNum),
					listData = v[i].activityDetailsList,
					l = listData.length,
					le = l > line * column ? line * column : line * column;
				html +='<div class="index-module index-module'+column+'">'
				html +='	<div class="index-module-title clearfloat">'
				html +='			<div class="float_left">'+v[i].activityTitle+'</div>'
				var linkUrl = pub.index.getLinkUrl(1, v[i].linkUrl , '');
				html +='			<div class="float_right"><a href="'+(!linkUrl ? "javascript:void(0)" : linkUrl)+'">更多</a></div>'
				html +='	</div>'
				
				html +='	<div class="index-module-goods clearfloat">'
				
				for(var j = 0; j < le; j++ ){
					oo = listData[j];
					
					if (oo) {
						o = oo.goodsInfo;
						
						html +='		<dl class="index-module-item clearfloat" data="'+o.id+'">'
						html +='			<dt><img src="'+oo.detailsLogoUrl+'"/></dt>'
						html +='			<dd>'
						if (column == 3) {
							html +='				<p class="good_name ellipsis">'+o.goodsName+'</p>'
							html +='				<div class="good_box">'
							if(common.getIslogin()){
								html +='					<p class="good_price_box"><span class="good_price_icon">¥</span><span class="good_price">'+o.gssPrice+'</span><span>&nbsp;/'+o.priceUnit+'</span></p>'
							}
							html +='				</div>'
						}else{
							html +='				<p class="good_name ellipsis">'+o.goodsName+'</p>'
							html +='				<p class="good_describe ellipsis">'+o.goodsShows+'</p>'
							html +='				<p class="good_tag">'
								if(listData[j].noteTable){
									html += '					<span>'+listData[j].noteTable+'</span>'
								}
							html += '				</p>'
							html +='				<div class="good_box clearfloat">'
							if (common.getIslogin()) {
								html +='					<div class="float_left">'
								html +='						<p class="del"><del>'+ (o.nomalPrice ? '¥'+o.nomalPrice : '' )+'</del></p>'
								html +='						<p class="good_price_box"><span class="good_price_icon">¥</span><span class="good_price">'+o.gssPrice+'</span><span>&nbsp;/'+o.priceUnit+'</span></p>'
								html +='					</div>'
								html +='					<div class="float_right">'
								html +='						<span class="button">立即购买</span>'
								html +='					</div>'
							}
							html +='				</div>'
							
						}
						html +='			</dd>'
						html +='		</dl>'
					}else{
						html +='		<dl class="index-module-item clearfloat">'
						html +='		</dl>'
					};
				}
				
				html +='	</div>'
				html +='</div>'
			};
			html += '<div class="index-bottom"><span class="index-bottom-box"><span class="index-bottom-text">已经到底了</span></span></div>'
			$(".center").html(html);
			
			if(!common.getIslogin()){
				$('.center_goodes dl .clearfloat .index_goods_pirce').hide()
			}
			var good=$(".index-module dl");
			common.txq(good,1);
			//返回创建的多少列商品
			function getColumnNum(d){
				if (d == 1 || d == 2 || d == 3) {
					return d;
				}
				return 1;
			};
			//返回创建多少行商品
			function getLineNum(d){
				if (d >= 1) {
					return parseInt(d);
				}
				return 1;
			}
		},
		getLinkUrl : function (type,code,tit){
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
			return null;
		}
	};
	pub.index.eventHeadle = {
		init:function(){
			//点及跳转搜索页面
			$(".header_right").on("click",function(){
				common.jump("html/search.html");
			});
			$('.footer1 dl').on('click',function(){
				sessionStorage.removeItem("twotype");
				sessionStorage.removeItem("goodtype");
				$(this).is('.no') && common.jump($(this).attr("data"))
			});
			$(window).load(function(){
				common.jsadd("quote/style_pc.js");
			});
			var metaEl = document.querySelector('meta[name="viewport"]'),
                metaCtt = metaEl ? metaEl.content : '',
                matchScale = metaCtt.match(/initial\-scale=([\d\.]+)/),
			    matchWidth = metaCtt.match(/width=([^,\s]+)/);
			var wid = parseInt(matchWidth[1]);
			var w = window.screen.availWidth;
			var h = window.screen.availHeight;
			var hie = parseInt((wid * h)/w);
			var height = hie - 185;
			
			common.fadeIn();
			common.open_Statistics();
		}
	}
	pub.index.init();
});

