$(document).ready(function(){
	//命名空间
	var pub = {};
	$.extend(pub,{
		code : common.getUrlParam("code"),
		wexinCode:sessionStorage.weixinCode,
		websiteNode:common.websiteNode,
		logined:common.getIslogin(),
		openid:localStorage.getItem("openid")
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
				method:'main_page_show',
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
			var html='',v = data.data.adInfoList;
			var address = window.location.href;
			var n = address.indexOf("index.html");
			var m = address.indexOf(".html");
			var state = common.getUrlParam("state");
			var _n = address.indexOf("?");
			if (state) {
				var add = address.substr(0,_n)+"html/";
			}else{
				if (m == '-1') {
					var add = address + "html/";				
				}else{
					var add = address.substr(0,n)+"html/";
				}
			}
			for (var i=0 in v){
				var linkUrl = getLinkUrl(v[i].jumpType , v[i].linkUrl , v[i].adTime);
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
			
			function getLinkUrl(type,code,tit){
				if (type) {
					if (type == 1) {
						var codeArr = code.split("&");
						return add + "moreGoods.html?typeCode="+codeArr[1];
					}else if (type == 2) {
						return add + "goodsDetails.html?goodsId="+code;
					}else if (type == 3) {
						return add + "details.html?linUrl="+code + "&title="+tit;
					}
				}
				return null;
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
			for (var i=0 in v){
				html +='<div class="main'+(i+1)+'">'
				html +='<h3 class="center_tit">'+v[i].activityName+'</h3>'
				html +='<div class="center_goodes clearfloat">'
				
				for (var j in v[i].activityDetailsList) {
					o = v[i].activityDetailsList[j].goodsInfo;
					if (o) {
						html +='<dl data="'+o.id+'">'
						html +='	<dt><img src="'+o.goodsLogo+'"/></dt>'
						html +='	<dd>'+o.goodsName+'</dd>'
						html +='	<dd class="clearfloat">'
							if (parseInt(o.setupTags)!='0') {
									html +='<div class="index_goods_icon">'
								if (o.isSale) {
									html +=' <span class = "icon_cu"></span>'
								}
								if (o.isNew) {
									html +=' <span class = "icon_ji"></span>'
								}
								if (o.isRecommend) {
									html +=' <span class = "icon_jian"></span>'
								}
								if (o.isHot) {
									html +=' <span class = "icon_re"></span>'
								}
									html +='</div>'
									if (o.isSale && o.isNew && o.isRecommend && o.isHot) {
										html +='<div class="index_goods_pirce index_goods_pirce2 index_goods_pirce3"><span>'+o.gssPrice+'</span>元/'+o.priceUnit+'</div>'
									}else{
										html +='<div class="index_goods_pirce index_goods_pirce2"><span>'+o.gssPrice+'</span>元/'+o.priceUnit+'</div>'
									}
							} else{
								html +='<div class="index_goods_pirce"><span>'+o.gssPrice+'</span>元/'+o.priceUnit+'</div>'
							}
						html +='	</dd>'
						html +='	</dl>'
					}
				}
				html +='</div>'
				html +='</div>'
			}
			$(".center").append(html);
			if(!common.getIslogin()){
				$('.center_goodes dl .clearfloat .index_goods_pirce').hide()
			}
			var good=$(".center_goodes dl");
			common.txq(good,1)
		},
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
			/*$('.gonggao').on('click',"li",function(){
				var d = JSON.parse($(this).attr("data"));
				var $ele = $("#logistic_show");
				$(".my_bg,#logistic_show").removeClass("hidden")
				$ele.find(".logistic_show_title").html(d.noticeTitle);
				$ele.find(".logistic_show_text").html(((d.noticeContent).toString()).replace(/\r\n/g, "<br/>"));
				window.history.pushState({foo:"alert"},'alert', 'alert');
			});
			$("body").on("click",".logistic_back,.my_bg",function(){
				$(".my_bg,#logistic_show").addClass("hidden");
				window.history.replaceState({foo:"index"},'index', 'index.html');
			})
			window.addEventListener('popstate', function(e){
				if (history.state){
					var state = e.state;
				    if (state.foo == "index") {
				    	window.history.replaceState({foo:"index"},'index', 'index.html');
				    	$(".my_bg,#logistic_show").addClass("hidden");
				    }else if(state.foo == "alert"){
				    	window.history.replaceState({foo:"alert"},'alert', 'alert');
				    	$(".my_bg,#logistic_show").removeClass("hidden");
				    }
				}
			}, false);
			window.history.replaceState({foo:"index"},'index', 'index.html');*/
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
		}
	}
	pub.index.init();
});

