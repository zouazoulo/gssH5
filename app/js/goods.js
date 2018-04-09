$(document).ready(function(){
// 命名空间
	pub = {};
	$.extend(pub,{
		html:'',
		twoTypecode:(sessionStorage.getItem("twotype") == undefined ? '' : sessionStorage.getItem("twotype")),
		goodsTypecode:(sessionStorage.getItem("goodtype") == undefined ? '' : sessionStorage.getItem("goodtype")),
		websiteNode:common.websiteNode,
		isLast:false,
		pageSize:common.pageSize,
		pageNo:common.pageNo,
		logined : common.getIslogin(),
		method:['goods_first_type',"goods_second_type",'goods_info_show2','goods_collection_del','goods_collection_add'],
		issystem:sessionStorage.getItem("system"),
		goodsId:sessionStorage.getItem("goodsId"),
		isColl:null,
		goodnum:null,
		collImg:['icon_collect_b','icon_collect_a'],
	});
	if( pub.logined ){
		pub.userId = common.user_data().cuserInfoid;
		pub.firmId = common.user_data().firmInfoid,
		pub.source = "firmId" + pub.firmId;
		pub.sign = md5( pub.source + "key" + common.secretKey() ).toUpperCase();
		pub.tokenId = common.tokenId();
	};
	//公用方法
	pub.style_change = function (){
		var money = parseInt(getgoodsMoney());
		var how_money = parseFloat(pub.system.how_much_money_dispatch);
		var goodnum = getgoodsNum();
		if (goodnum=='0') {
			$('#gw_car').addClass("hidden")
			$('.footer-left').addClass("sprite icon_shoppingcar").html("购物车是空的")
			$('.footer-rigth').html('还差￥'+( how_money - money )).css({'background':'#494848','color':'#FFF'})
		} else{
			$('#gw_car').removeClass("hidden").find('.gw_car_num').html(goodnum)
			$('.footer-left').removeClass("sprite icon_shoppingcar").html("共"+money+"元")
			if (money >= how_money) {
				$('.footer-rigth').html('选好了').css({'background':'#f37c30','color':'#FFF'})
			} else{
				$('.footer-rigth').html('还差￥'+(( how_money - money ).toFixed(2))).css({'background':'#494848','color':'#FFF'})
			}
		}
	};
	pub.sport = function (obj){
		var $ele = $(".gw_car_num");
		var xEnd=$ele.offset().left+$ele.width()/4;
		var yEnd=$ele.offset().top;
		var xStar=obj.offset().left+obj.width()/4;
		var yStar=obj.offset().top;
		var main_obj=$('<div></div>');
		var new_obj=$("<span></span>");
		$('body').append(main_obj)
		main_obj.append(new_obj);
		new_obj.css({
			'width': '20px',
			'height': '20px',
			'position': 'absolute',
			'background': '#f56d15',
			"border-radius":"50%",
			'z-index':'600',
			"top":yStar,
			"left":xStar
		}).animate({
			left:xEnd,
			top:yEnd
		},800,function(){
			main_obj.remove();
		})
	};
	//显示购物车中的商品
	pub.car_goods = function (){
		var arr=goodlist2();
		var html='';
		for (var i in arr) {
			html += '<li class="clearfloat" data="'+arr[i].id+'" packageNum="'+arr[i].packageNum+'" maxCount="'+arr[i].maxCount+'" score = "'+arr[i].goodscore+'">'
			html += '	<div class="car_left">'+arr[i].name+'</div>'
			html += '	<div class="car_right car_good clearfloat">'
			html += '		<span class="car_min sprite btn_m"></span>'
			html += '		<span class="car_number fontColor" dataID="'+arr[i].id+'">'+arr[i].sum+'</span>'
			html += '		<span class="car_max sprite btn_a"></span>'
			html += '	</div>'
			html += '</li>'
		}
		$('.footer_car .car_main ul').append(html);
	}
	//公共事件
	pub.eventHeadle = {
		init:function(){
			
			//弹出购物车一些事件
			$("#gw_car").on('click',function(){
				common.stopEventBubble()
				if ($('.footer_car').is(".hidden")) {
					//写入car
					pub.car_goods();
					$('.my_bg,.footer_car').removeClass("hidden");
					if($('.car_main ul').height()<300){
						$('.car_main ul').css('height',"auto")
					}else{
						$('.car_main ul').css({'max-height':"300px","overflow-y":"auto"})
					}
					$('.car_main').on('touchmove',function(){
						common.stopEventBubble()
					})
					$("#gw_car").animate({
						bottom:($('.footer_car').height()+97)+"px"
					},300)
					$('.footer-left').animate({
						'text-indent':-150
					},300)
				} else{
					$('.footer_car').addClass("hidden").find(".car_main ul li").remove();
					$(".my_bg").addClass("hidden");
					$("#gw_car").animate({
						bottom:26+"px"
					},300)
					$('.footer-left').animate({
						'text-indent':0
					},300)
				}
				event.stopPropagation()
			});
			//添加点击增加事件
			$(".car_main").on('click','.car_max',function(){
				var d = $(this).parent().parent();
				var id=d.attr('data'),packagenum=d.attr('packagenum'),maxCount=d.attr('maxCount');
				//console.log(packagenum)
				//var goodType = d.attr('goodType');
				//var goodscore = d.attr('score');
				//console.log(parseInt($(this).siblings().eq(1).text()) +"&&"+ packagenum)
				if (parseInt($(this).siblings().eq(1).text()) < parseInt(packagenum)) {
					if(maxCount >0){
						if(parseInt($(this).siblings().eq(1).text())<maxCount){
							var num=addgoods(id)
							$('span[dataID='+id+']').html(num)
							pub.style_change();
						}else{
							common.prompt("该商品限购"+maxCount+"件")
						}
					}else{
						var num=addgoods(id)
						$('span[dataID='+id+']').html(num)
						pub.style_change();
					}
				} else{
					common.prompt("库存不足")
				}
			})
			//添加减少事件
			$(".car_main").on('click','.car_min',function(){
				var d = $(this).parent().parent();
				var id=d.attr('data');
				var goodType = d.attr('goodType')
				var goodscore = d.attr('score');
				//num当前商品数目 numb商品总数
				var numb=getgoodsNum();
				var num=cutgoods(id);
				
				if (num=='0') {
					if (numb=='1') {
						$('span[dataID='+id+']').html(num);
						$('#gw_car').addClass("hidden").css('bottom','26px')
						$(".my_bg").addClass("hidden");
						$(this).parent().parent().parent().find('li').remove();
						$('.footer_car').addClass("hidden");
						$('.footer-left').css('text-indent',0)
					} else{
						$('span[dataID='+id+']').html(num);
						$(this).parent().parent().remove();
						$('#gw_car').animate({
							bottom:($('.footer_car').height()+97)+"px"
						},300)
					}
				} else{
					$('span[dataID='+id+']').html(num)
				}
				pub.style_change();
			})
			$(".footer_car .car_clear").on('click',function(){
				var id=$(this).parents().find("li[data]").attr('data');
				$('span[dataID]').html(0)
				$('.footer_car').addClass("hidden").find(".car_main ul li").remove();
				$(".my_bg").addClass("hidden");
				localStorage.removeItem('good');
				$('#gw_car').addClass("hidden").css('bottom','26px')
				$('.footer-left').addClass("sprite icon_shoppingcar").html("购物车是空的").animate({
					'text-indent':0
				},300)
				pub.style_change()
			});
			$('.my_bg').on('click',function(){
				$('.footer_car').addClass("hidden").find(".car_main ul li").remove();
				$(".my_bg").addClass("hidden");
				$('#gw_car').animate({
					bottom:26+"px"
				},500)
				$('.footer-left').animate({
					'text-indent':0
				},500)
			});
			//点击提交本地购物车商品列表结算购物车
			$('.footer-rigth').on('click',function(){
				var goodsList=goodlist1();
				//if ($(this).is(".true")) {
					//$(this).removeClass("true");
					common.settlement_cart(goodsList,pub.firmId,pub.sign,pub.source,pub.page)
				//}
			});
			$(window).load(function(){
				common.jsadd();
			});
			common.fadeIn()
		}
	}
/*-------------------------更多商品------------------------------*/
	pub.moregoods = {
		init:function(){
			pub.moregoods.firstapi();
			pub.moregoods.eventHeadle.init();
			pub.style_change();
			sessionStorage.removeItem("sta");
		},
		firstapi:function(){
			common.ajaxPost({
				method:pub.method[0],
				websiteNode:pub.websiteNode
			},function(data){
				if (data.statusCode == 100000) {
					pub.moregoods.first_list(data)
				}
			})
		},
		twoapi:function(obj){
			common.ajaxPost({
				method:pub.method[1],
				websiteNode:pub.websiteNode,
				typeCode:pub.twoTypecode
			},function(data){
				if (data.statusCode == 100000) {
					obj.data(data)
					pub.moregoods.two_list(data)
				}
			})
		},
		goodsapi:function(obj){
			common.ajaxPost({
				method:pub.method[2],
				websiteNode:pub.websiteNode,
				typeCode:pub.goodsTypecode,
				pageNo:pub.pageNo,
				pageSize:pub.pageSize
			},function(data){
				if (data.statusCode == 100000) {
					if (pub.pageNo == 1) {
						obj.data(data);
						pub.moregoods.goods_show(data);
					}else{
						pub.moregoods.goods_show(data);
					}
				}
				var hei=document.documentElement.clientHeight-$('.footer-wrap').height()-$('.header-wrap').height()-$('.moreDoogs_main_top').height();
				$('.moreDoogs_main_box_left_wrap').height(hei);
				$('.moreDoogs_main_box_right').height(hei);
				$('.moreDoogs_main_box_right_box').height(hei);
			})
		},
		first_list:function(data){
			var html='',v = data.data;
			for (var i in v) {
				html +='<li first_list_data'+i+'="'+v[i].typeCode+'">'+v[i].typeName+'</li>'
			};
			$(".moreDoogs_main_top_list").append(html).css('width',(v.length*164)+'px');
			//if (pub.twoTypecode == '') {
				/*var m = (pub.twoTypecode == '' ? 0 : pub.twoTypecode)
				console.log(m)*/
			var $ele=$(".moreDoogs_main_top_list li").eq(0);
			$ele.addClass("true");
			pub.twoTypecode = $ele.attr("first_list_data0");
			pub.moregoods.twoapi($ele);
		
			
		},
		two_list:function(data){
			var html='',v = data.data;
			$(".moreDoogs_main_box_left").find("li").remove();
			for (var i in v) {
				html +='<li two_list_data'+i+'="'+v[i].typeCode+'">'+v[i].typeName+'</li>'
			}
			$(".moreDoogs_main_box_left").append(html).height($('.moreDoogs_main_box_left').height());
			var $ele=$(".moreDoogs_main_box_left li").eq(0);
			pub.goodsTypecode=$ele.attr("two_list_data0");
			$ele.addClass("true");
			pub.moregoods.goodsapi($ele);
		},
		goods_show:function(data){
			pub.isLast=data.data.isLast;
			if (pub.pageNo=='1') {
				$('.moreGoods_box_list').find('li').remove();
			}
			pub.isLast && $('.lodemore').html('没有更多数据了');
			!pub.isLast && $('.lodemore').html('点击加载更多数据');
			var html2='',v = data.data.objects,goodnum;
			moregood_data=sessionStorage.setItem('moregood_data',JSON.stringify(data));
			for (var i in v) {
				html2 +='<li><dl class="moreGoods_goods_detaile clearfloat" data="'+v[i].id+'" dataName="'+v[i].goodsName+'" dataPir="'+v[i].wholeGssPrice+'" wholePriceSize="'+v[i].wholePriceSize+'" gssPrice="'+v[i].gssPrice+'" priceUnit="'+v[i].priceUnit+'" packageNum="'+(parseInt(v[i].initNum) - parseInt(v[i].saleNum))+'" maxCount="'+v[i].maxCount+'" bussinessType="'+v[i].bussinessType+'" score="'+v[i].score+'" >'
				html2 +='<dt><img src="'+v[i].goodsLogo+'"/></dt>'
				html2 +='<dd>'		
				html2 +='<h3 class="moreGoods_goods_name">'+v[i].goodsName+'</h3>'
				html2 +='<p class="moreGoods_goods_text">'+v[i].goodsShows+'</p>'
				if (pub.logined) {
					html2 +='<p class="moreGoods_goods_price">'
					html2 +='<span class="fontColor">'+v[i].gssPrice+'</span>元/'+v[i].priceUnit+'&nbsp; &nbsp;<span>'+v[i].priceDesc+'</span>'
					html2 +='</p>'
					html2 +='<div class="moreGoods_goods_num">'
					html2 +='<div class="moreGoods_goods_icon">'
						if (v[i].isSale) {
							html2 +=' <span class = "icon_cu"></span>'
						}
						if (v[i].isNew) {
							html2 +=' <span class = "icon_ji"></span>'
						}
						if (v[i].isRecommend) {
							html2 +=' <span class = "icon_jian"></span>'
						}
						if (v[i].isHot) {
							html2 +=' <span class = "icon_re"></span>'
						}
					html2 +='</div>'
					html2 +='<div class="moreGoods_goods_number clearfloat">'
					
					if ((parseInt(v[i].initNum) - parseInt(v[i].saleNum)) <= 0) {
						html2+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block;font-size: 24px;">已售罄</b>'
					}else{
						goodnum=callbackgoodsnumber(v[i].id);
						/*if ( goodnum != '0' ) {
							html2 +='<button class="goodsNumber_min sprite btn_m"></button>'
							if ($.browser.safari) {
								pub.html+='	<span class="goodsNumber fontColor" dataID="'+v[i].id+'">'+goodnum+'</span>'
							}else{
								pub.html+='	<span class="goodsNumber fontColor" dataID="'+v[i].id+'" style="position: relative;">'+goodnum+'</span>'
							}
						} else {
							html2 +='<button class="goodsNumber_min sprite btn_m hidden"></button>'
							if ($.browser.safari) {
								pub.html+='	<span class="goodsNumber fontColor" dataID="'+v[i].id+'">'+goodnum+'</span>'
							}else{
								pub.html+='	<span class="goodsNumber fontColor" dataID="'+v[i].id+'" style="position: relative;">'+goodnum+'</span>'
							}
						}
						html2 +='<button class="goodsNumber_max sprite btn_a"></button>'
						*/
						if (goodnum!='0') {
							html2 +='<span class="goodsNumber_min"><img src="../img/btn_m@2x.png"/></span>'
							html2 +='<span class="goodsNumber fontColor" dataID="'+v[i].id+'">'+goodnum+'</span>'
						} else{
							html2 +='<span class="goodsNumber_min hidden"><img src="../img/btn_m@2x.png"/></span>'
							html2 +='<span class="goodsNumber fontColor hidden" dataID="'+v[i].id+'"></span>'
						}
						html2 +='<span class="goodsNumber_max"><img src="../img/btn_a@2x.png"/></span>'
					}
					html2 +='</div>'
					html2 +='</div>'
				} else{
					html2 +='';
				}
				html2 +='</dd>'
				html2 +='</dl>'
				html2 +='</li>'
			}
			$(".moreGoods_box_list").append(html2);
			
		}
		
	}
	
	pub.moregoods.eventHeadle = {
		init:function(){
			$(".moreDoogs_main_top").on("click",".moreDoogs_main_top_list li",function(){
				var $ele = $(this);
				if (!$(this).is("true")) {
					pub.pageNo = 1;
					$(this).addClass('true').siblings().removeClass("true");
					pub.twoTypecode = $(this).attr("first_list_data"+$(this).index());
					sessionStorage.setItem("twotype",pub.twoTypecode);
					if ($.isEmptyObject($(this).data())) {
						pub.moregoods.twoapi($ele);
					}else{
						pub.moregoods.two_list($(this).data());
					}
					if ($(this).get(0).offsetLeft > 200) {
						$('.moreDoogs_main_top').scrollLeft($(this).get(0).offsetLeft-200)
					}else{
						$('.moreDoogs_main_top').scrollLeft(0)
					}
				}
			});
			$(".moreDoogs_main_box_left").on("click","li",function(){
				var $ele = $(this);
				if (!$(this).is("true")) {
					pub.pageNo = 1;
					$(this).addClass('true').siblings().removeClass("true");
					pub.goodsTypecode = $(this).attr("two_list_data"+$(this).index());
					sessionStorage.setItem("goodtype",pub.goodsTypecode);
					if ($.isEmptyObject($(this).data())) {
						pub.moregoods.goodsapi($ele);
					}else{
						pub.moregoods.goods_show($(this).data());
					}
					if ($(this).get(0).offsetTop>200) {
						$('.moreDoogs_main_box_left_wrap').scrollTop($(this).get(0).offsetTop-200)
					}else{
						$('.moreDoogs_main_box_left_wrap').scrollTop(0)
					}
				}
			});
			$(".moreGoods_box_list").on("click",".moreGoods_goods_detaile",function(){
				var goodsId=$(this).attr("data");
				sessionStorage.setItem("goodsId",goodsId);
				sessionStorage.setItem('good_sta',2);
				common.jump("goodsDetails.html");
			});
			//点击商品增加
			$('.moreGoods_box_list').on('click','.goodsNumber_max',function(e){
				var ele = $(this).parents().find('dl[data]');
				console.log(ele.attr('data'))
				var id=ele.attr('data'),name=ele.attr('dataName'),price=ele.attr('dataPir'),
				wholePriceSize=ele.attr('wholePriceSize'),
				gssPrice=ele.attr('gssPrice'),
				priceUnit=ele.attr('priceUnit'),
				packageNum=ele.attr('packageNum'),
				maxCount=ele.attr('maxCount'),
				goodType = ele.attr('goodType'),
				goodscore = ele.attr('score'),
				goodnum=callbackgoodsnumber(id);
				//先判断库存和限购  在执行加操作
				if (goodnum < packageNum) {
					if(maxCount > 0){
						if(goodnum < maxCount){
							var num1=addgoods(id,name,price,wholePriceSize,gssPrice,priceUnit,packageNum,maxCount,goodType,goodscore)
							$(this).siblings().eq(1).html(num1)
							pub.sport($(this))
						}else{
							common.prompt("该商品限购"+maxCount+"件")
						}
					}else{
						var num1=addgoods(id,name,price,wholePriceSize,gssPrice,priceUnit,packageNum,maxCount,goodType,goodscore)
						$(this).siblings().eq(1).html(num1)
						pub.sport($(this))
					}
				} else{
					common.prompt("库存不足")
				}
				common.stopEventBubble(e)
			})
			//点击减少商品
			$('.moreGoods_box_list').on('click','.goodsNumber_min',function(e){
				var ele = $(this).parents().find('dl[data]');
				var id=ele.attr('data');
				
				var num1=cutgoods(id);
				
				$(this).siblings().eq(0).html(num1)
				common.stopEventBubble(e)
			});
			//对商品数目的事件监听
			$('.moreGoods_box_list').on('DOMNodeInserted','.goodsNumber',function(){
				if ($(this).html()==0) {
					$(this).addClass("hidden").siblings().eq(0).addClass("hidden");
				} else{
					$(this).removeClass("hidden").siblings().removeClass("hidden");
				}
				pub.style_change();
			});
			$('.lodemore').on('click',function(){
				if (!pub.isLast) {
					pub.pageNo++;
					pub.moregoods.goodsapi()
				}
			});
			$(".header_left").on("click",function(){
				common.jump("../index.html")
			})
		}
	}
	
	/*----------------------------商品详情--------------------------------------*/
	pub.good = {
		init:function(){
			pub.good.api();
			pub.good.eventHeadle.init();
		},
		api:function(){
			common.ajaxPost({
				method:"goods_get_by_id",
				goodsId:pub.goodsId,
				userId:pub.userId
			},function(data){
				if (data.statusCode=='100000') {
					data.data.isColl > 0 ? true : false ;
					pub.isColl =( data.data.isColl  > 0 ? true : false );
					if (pub.isColl) {
						$(".header_right").removeClass(pub.collImg[0]).addClass(pub.collImg[1]);
					}
					pub.goodnum = callbackgoodsnumber(data.data.id);
					
					pub.good.good_banner_show(data);
					pub.good.good_info_show(data);
					
					pub.style_change();
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		collectionApi:function(){
			common.ajaxPost({
				method:pub.method[pub.index],
				firmId:pub.firmId,
				userId:pub.userId,
				goodsId:pub.goodsId
			},function(data){
				if (data.statusCode=='100000') {
					pub.good.collection();
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		collection:function(){
			if (pub.isColl) {
				pub.good.prompt("取消收藏")
				$(".header_right").removeClass(pub.collImg[1]).addClass(pub.collImg[0]);
			}else{
				pub.good.prompt("收藏成功")
				$(".header_right").removeClass(pub.collImg[0]).addClass(pub.collImg[1]);
			}
			pub.isColl = !pub.isColl
		},
		prompt:function(text){
			layer.open({
				className:'alert_pop',
			    content: text,
			   	type:1,
			    time: 2 ,
			    anim:false,
			    shade: false
			});
		},
		good_banner_show:function(data){
			//展示商品图片
			var arr1=data.data.goodsPics.split('@');
			for (var i = 0; i< arr1.length -1 ; i++) {
				pub.html += '<div class="swiper-slide"><img src="'+arr1[i]+'" /></div>'
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
			var v = data.data;
			//展示商品信息1111111111111
			pub.html = ''
			pub.html +='<h3 class="goodsDetails_box1_title">'+v.goodsName+'</h3>'
			pub.html +='<div class="goodsDetails_box1_ionc">'
				
				/*if (v.isSale) {
					pub.html +='	<span class="icon_cu"></span>'
				}
				if (v.isHot) {
					pub.html +='	<span class="icon_ji"></span>'
				}
				if (v.isRecommend) {
					pub.html +='	<span class="icon_jian"></span>'
				}
				if (v.isHot) {
					pub.html +='	<span class="icon_re"></span>'
				}*/
				if (v.isSale) {
					pub.html +=' <span class = "icon_cu"></span>'
				}
				if (v.isNew) {
					pub.html +=' <span class = "icon_ji"></span>'
				}
				if (v.isRecommend) {
					pub.html +=' <span class = "icon_jian"></span>'
				}
				if (v.isHot) {
					pub.html +=' <span class = "icon_re"></span>'
				}
			pub.html +='</div>'
			$(".goodsDetails_box1_top").append(pub.html);
			pub.html = ''
			//商品信息展示222222222222222222222222222222222222222
			pub.html+='<div class="goodsDetails_text">'+v.goodsShows+'</div>'
			pub.html+='<div class="moreGoods_goods_number clearfloat">'
			console.log($.browser)
					if((parseInt(v.initNum) - parseInt(v.saleNum))<=0){
						pub.html+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block">已售罄</b>'
					}else{
						pub.html+='	<span class="goodsNumber_min"><img src="../img/btn_m@2x.png"/></span>'
						pub.html+='	<span class="goodsNumber fontColor" dataID="'+data.data.id+'">'+pub.goodnum+'</span>'
						pub.html+='	<span class="goodsNumber_max"><img src="../img/btn_a@2x.png"/></span>'
						/*pub.html+='	<span><div class="goodsNumber_min sprite btn_m"></div></span>'
						if ($.browser.safari) {
							pub.html+='	<span class="goodsNumber fontColor" dataID="'+v.id+'">'+pub.goodnum+'</span>'
						}else{
							pub.html+='	<span class="goodsNumber fontColor" dataID="'+v.id+'" style="position: relative;">'+pub.goodnum+'</span>'
						}
						pub.html+='	<span><div class="goodsNumber_max sprite btn_a"></div></span>'*/
					}
			pub.html+='</div>'
			$('.goodsDetails_box1_center_li1').append(pub.html);
			//商品信息展示333333333333333333333333333333333333333333333333
			if (!pub.logined) {
				$('.moreGoods_goods_number').addClass("hidden")
				$(".goodsDetails_Unit_Price").html('单价：');
				$(".goodsDetails_Total_Price").html('总价：');
			} else{
				$('.moreGoods_goods_number').data('data',v)
				if (pub.goodnum==0) {
					$(".goodsNumber_min,.goodsNumber").addClass("hidden");
				} else{
					$(".goodsNumber_min,.goodsNumber").removeClass("hidden");
				}
				$(".goodsDetails_Unit_Price").html("单价：<span class='color_f27c32'>"+v.gssPrice+"</span>元/"+v.priceUnit);
				$(".goodsDetails_Total_Price").html("总价："+v.wholeGssPrice+"元/"+v.wholePriceSize);				
			}
			$('.goodsDetails_kucun').addClass("hidden");
			$(".goodsDetails_Place").html("产地："+v.sourceCityName);
			$(".goodsDetails_Standrd").html("规格："+v.sizeDesc);
			$(".goodsDetails_box2_").html(v.goodsContext).find("p").attr('style','');
			$('.goods_detaile_wrap').height($('.goods_detaile_wrap').height()+$('.footer-wrap').height()+100)
		}
	}
	pub.good.eventHeadle = {
		init:function(){
			$('.goodsDetails_box1_center').on('click',".goodsNumber_max",function(){
				if (!pub.logined) {
					common.jump("login.html")
					return;
				}
				var d = $(this).parent().data('data');
				var id=d.id,name=d.goodsName;
				/*件价和件价的单位*/
				var price=d.wholeGssPrice,wholePriceSize=d.wholePriceSize;
				/*单价和单价的单位*/
				var gssPrice=d.gssPrice,priceUnit=d.priceUnit;
				/*限购和库存*/
				var packageNum=(parseInt(d.initNum) - parseInt(d.saleNum)),maxCount=d.maxCount;
				
				var goodType = d.bussinessType;
				var goodscore = d.score;
				
				pub.goodnum = callbackgoodsnumber(id)
				//先判断库存和限购  在执行加操作
				if (pub.goodnum<packageNum) {
					if(maxCount >0){
						if(pub.goodnum<maxCount){
							var num1=addgoods(id,name,price,wholePriceSize,gssPrice,priceUnit,packageNum,maxCount,goodType,goodscore)
							if (num1==1) {
								$(this).siblings().removeClass("hidden").eq(1).html(num1);
							}else{
								$(this).siblings().eq(1).html(num1)
							}
							pub.style_change()
							pub.sport($(this))
							
						}else{
							common.prompt("该商品限购"+maxCount+"件")
						}
					}else{
						var num1=addgoods(id,name,price,wholePriceSize,gssPrice,priceUnit,packageNum,maxCount,goodType,goodscore)
						if (num1==1) {
							$(this).siblings().removeClass("hidden");
						}
						$(this).siblings().eq(1).html(num1)
						pub.style_change()
						pub.sport($(this));
					}
				}else{
					common.prompt("库存不足")
				}
			})
			$(".goodsDetails_box1_center").on('click',".goodsNumber_min",function(){
				var d = $(this).parent().data('data');
				var id=d.id;
				var num1=cutgoods(id);
				if (num1<'1') {
					$(this).addClass("hidden").siblings().eq(0).addClass("hidden");
				} else{
					$(this).siblings().eq(0).html(num1)
				}
				pub.style_change();
			});
			//对商品数目的事件监听
			$('.goodsDetails_box1_center_li1').on('DOMNodeInserted','.goodsNumber',function(){
				if ($(this).html()==0) {
					$(this).addClass("hidden").siblings().eq(0).addClass("hidden");
				} else{
					$(this).removeClass("hidden").siblings().removeClass("hidden");
				}
				pub.style_change();
			})
			//点击收藏按钮
			$(".header_collect").on("click",function(){
				if (pub.logined) {
					if(pub.isColl){
						pub.index = 3;
					}else{
						pub.index = 4;
					}
					pub.good.collectionApi()
				}else{
					common.jump('login.html');
				}
			});
			//点击返回按钮事件
			$(".header_left").on("click",function(){
				if (sessionStorage.getItem("sta")) {
					window.location.href = "../index.html"
				}else{
					window.history.back();
				}
				
			})
		}
	}
	
	pub.oftenShop = {
		init:function(){
			pub.oftenShop.api();
			pub.oftenShop.eventHeadle.init();
		},
		init1:function(){
			 // 设定每一行的宽度=屏幕宽度+按钮宽度
	        $(".line-scroll-wrapper").width($(".line-wrapper").width() + $(".line-btn-delete").width());
	        // 设定常规信息区域宽度=屏幕宽度
	        $(".line-normal-wrapper").width($(".line-wrapper").width());
	        // 设定文字部分宽度（为了实现文字过长时在末尾显示...）
	        //$(".line-normal-msg").width($(".line-normal-wrapper").width() - 280);
	        // 获取所有行，对每一行设置监听
	        var lines = $(".line-normal-wrapper");
	        var len = lines.length;
	        var lastX, lastXForMobile;
	        // 用于记录被按下的对象
	        var pressedObj; // 当前左滑的对象
	        var lastLeftObj; // 上一个左滑的对象
	        // 用于记录按下的点
	        var start;
	        // 网页在移动端运行时的监听
	        for(var i = 0; i < len; ++i) {
	            lines[i].addEventListener('touchstart', function(e) {
	                lastXForMobile = e.changedTouches[0].pageX;
	                pressedObj = this; // 记录被按下的对象 
	
	                // 记录开始按下时的点
	                var touches = event.touches[0];
	                start = {
	                    x: touches.pageX, // 横坐标
	                    y: touches.pageY // 纵坐标
	                };
	            });
	            lines[i].addEventListener('touchmove', function(e) {
	                // 计算划动过程中x和y的变化量
	                var touches = event.touches[0];
	                delta = {
	                    x: touches.pageX - start.x,
	                    y: touches.pageY - start.y
	                };
	
	                // 横向位移大于纵向位移，阻止纵向滚动
	                if(Math.abs(delta.x) > Math.abs(delta.y)) {
	                    event.preventDefault();
	                }
	            });
	            lines[i].addEventListener('touchend', function(e) {
	                if(lastLeftObj && pressedObj != lastLeftObj) { // 点击除当前左滑对象之外的任意其他位置
	                    $(lastLeftObj).animate({
	                        marginLeft: "0"
	                    }, 500); // 右滑
	                    lastLeftObj = null; // 清空上一个左滑的对象
	                }
	                var diffX = e.changedTouches[0].pageX - lastXForMobile;
	                if(diffX < -150) {
	                    $(pressedObj).animate({
	                        marginLeft: "-200px"
	                    }, 500); // 左滑
	                    lastLeftObj && lastLeftObj != pressedObj &&
	                        $(lastLeftObj).animate({
	                            marginLeft: "0"
	                        }, 500); // 已经左滑状态的按钮右滑
	                    lastLeftObj = pressedObj; // 记录上一个左滑的对象
	                } else if(diffX > 150) {
	                    if(pressedObj == lastLeftObj) {
	                        $(pressedObj).animate({
	                            marginLeft: "0"
	                        }, 500); // 右滑
	                        lastLeftObj = null; // 清空上一个左滑的对象
	                    }
	                }
	            });
	        }
		},
		api:function(){
			common.ajaxPost({
				method:'goods_collection',
				userId:pub.userId,
				pageNo:pub.pageNo,
				pageSize:pub.pageSize
			},function(data){
				if (data.statusCode=='100000') {
					pub.isLast = data.data.isLast;
					if (data.data.objects.lenght != '') {
						pub.oftenShop.oftenShop_show(data.data.objects);
					}
					
					if (pub.isLast) {
						$(".lodemore").html("没有更多数据了！");
					}else{
						$(".lodemore").html("点击加载更多！");
					}
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		oftenShop_show:function(d){
			html='';
			for (var i in d) {
				var o = d[i].goodsInfo;
				html +='<li class="line-wrapper" dataID="'+d[i].goodsInfoId+'">'
		        html +='    <div class="line-scroll-wrapper clearfloat">'
		        html +='        <dl class="line-normal-wrapper clearfloat">'
	            html +='            <dt class="line-normal-avatar-wrapper">'
	            html +='            	<img src="'+o.goodsLogo+'"/>'
	            html +='            </dt>'
	            html +='            <dd class="line-normal-info-wrapper">'
	            html +='               <div class="often_shop_goods_top clearfloat">'
				html +='					<p class="often_shop_goods_tit">'+o.goodsName+'</p>'
				html +='					<p class="often_shop_goods_icon">'
				/*if (o.isSale) {
					html +='	<img class="icon_cu" src="../img/tag_cu@2x.png"/>'
				}
				if (o.isHot) {
					html +='	<img class="icon_ji" src="../img/tag_ji@2x.png"/>'
				}
				if (o.isRecommend) {
					html +='	<img class="icon_jian" src="../img/tag_jian@2x.png"/>'
				}
				if (o.isHot) {
					html +='	<img class="icon_re" src="../img/tag_re@2x.png"/>'
				}*/
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
				html +='					</p>'
				html +='				</div>'
	            html +='               <p class="often_shop_show">'+o.goodsShows+'</p>'
				html +='				<div class="often_shop_NumPir" data="'+d[i].goodsInfoId+'" dataName="'+o.goodsName+'" dataPir="'+o.wholeGssPrice+'" wholePriceSize="'+o.wholePriceSize+'" gssPrice="'+o.gssPrice+'" priceUnit="'+o.priceUnit+'" packageNum="'+o.packageNum+'" maxCount="'+o.maxCount+'" goodType="'+o.bussinessType+'" score="'+o.score+'">'
				html +='					<div class="os_pir">'
				html +='						<span class="often_shop_color">'+o.gssPrice+'</span>元/'+o.priceUnit+'&nbsp;&nbsp;<span>'+o.priceDesc+'</span>'
				html +='					</div>'
				html +='					<div class="os_Num">'
				goodnum=callbackgoodsnumber(d[i].goodsInfoId);
				if (goodnum!='0') {
					html +='					<button class="goodsNumber_min">'
					html +='						<img src="../img/btn_m@2x.png"/>'
					html +='					</button>'
					html +='					<span class="goodsNumber fontColor" dataID="'+d[i].goodsInfoId+'">'+goodnum+'</span>'
				} else{
					html +='					<button class="goodsNumber_min" style="display: none;">'
					html +='						<img src="../img/btn_m@2x.png"/>'
					html +='					</button>'
					html +='					<span class="goodsNumber fontColor" dataID="'+d[i].goodsInfoId+'" style="display: none;"></span>'
				}
				html +='						<button class="goods_Number_max">'
				html +='						    <img src="../img/btn_a@2x.png"/>'
				html +='					    </button>'
				html +='					</div>'
				html +='				</div>'
	            html +='            </dd>'
		        html +='       </dl>'
		        html +='        <div class="line-btn-delete"><button>删除</button></div>'
		        html +='   </div>'
		        html +='</li>'
			}
			$(".often_shop_main_wrap .main ul").append(html)
			//样式初始化；
			pub.style_change();
			$('.main').height($('.main ul').height()+$('.footer-wrap').height()+$('.main .lodemore').height())
			pub.oftenShop.init1();
		},
		del_data:function (obj){
			common.ajaxPost({
				method:'goods_collection_del',
				userId:pub.userId,
				goodsId:pub.goodsId
			},function(d){
				if (d.statusCode='100000') {
					obj.parent().parent().remove()
				}else{
					common.prompt(d.statusStr)
				}
			})
		}
	}
	
	pub.oftenShop.eventHeadle = {
		init:function(){
			$('.lodemore').on('click',function(){
				if (!pub.isLast) {
					pub.pageNo ++ ;
					pub.oftenShop.api();
				}
			});
			//添加删除事件
			$('.main').on('click','.line-btn-delete',function(e){
				var obj=$(this)
				pub.goodsId=$(this).parent().parent().attr('dataID');
				pub.oftenShop.del_data(obj)
				common.stopEventBubble(e)
			})
			//添加跳转详情事件
			$('.main').on('click','.line-wrapper',function(){
				pub.goodsId=$(this).attr("dataID");
				sessionStorage.setItem("goodsId",pub.goodsId);
				sessionStorage.setItem('good_sta',3);
				common.jump("goodsDetails.html");
			})
			//点击商品增加
			$('.main').on('click','.goods_Number_max',function(e){
				common.stopEventBubble(e)
				id=$(this).parent().parent().attr('data');
				name=$(this).parent().parent().attr('dataName');
				price=$(this).parent().parent().attr('dataPir');
				wholePriceSize=$(this).parent().parent().attr('wholePriceSize');
				gssPrice=$(this).parent().parent().attr('gssPrice');
				priceUnit=$(this).parent().parent().attr('priceUnit');
				packageNum=$(this).parent().parent().attr('packageNum');
				maxCount=$(this).parent().parent().attr('maxCount');
				
				
				//获取本地购物车中该商品数据
				goodnum=callbackgoodsnumber(id);
				
				//先判断库存和限购  在执行加操作
				if (goodnum < packageNum) {
					if(maxCount > 0){
						if(goodnum < maxCount){
							var num1=addgoods(id,name,price,wholePriceSize,gssPrice,priceUnit,packageNum,maxCount)
							$(this).siblings().eq(1).html(num1)
							pub.sport($(this))
						}else{
							var str="该商品限购"+maxCount+"件"
							common.prompt(str)
						}
					}else{
						var num1=addgoods(id,name,price,wholePriceSize,gssPrice,priceUnit,packageNum,maxCount)
						$(this).siblings().eq(1).html(num1)
						pub.sport($(this))
					}
					
				} else{
					var str="库存不足"
					common.prompt(str)
				}	
			})
			//点击减少商品
			$('.main').on('click','.goodsNumber_min',function(e){
				id=$(this).parent().parent().attr('data');
				name=$(this).parent().parent().attr('dataName');
				price=$(this).parent().parent().attr('dataPir');
				var num1=cutgoods(id, name, price)
				$(this).siblings().eq(0).html(num1)
				common.stopEventBubble(e)
			})
			//对商品数目的事件监听
			$('.main').on('DOMNodeInserted','.goodsNumber',function(e){
				common.stopEventBubble(e)
				if ($(this).html()==0) {
					$(this).siblings().eq(0).css('display','none');
					$(this).css('display',"none")
				} else{
					$(this).siblings().css('display','inline-block');
					$(this).css('display',"inline-block")
				}
				pub.style_change();
			})
			//点击返回按钮事件
			common.callback($(".header_left"));
		}
	}
	
	
	
	pub.init = function(){
		pub.page = $("body").attr("data");
		if (pub.page == 1) {
			pub.good.init();
		}else if (pub.page == 2){
			pub.moregoods.init();
		}else if (pub.page == 3){
			pub.oftenShop.init();
		}
		pub.eventHeadle.init();
	};
	//pub.init();
	if (!pub.issystem) {
		common.dtd.done(function(){
			pub.system = JSON.parse(sessionStorage.getItem("system"));
			pub.init();
		});
		common.get_System(common.websiteNode);
	}else{
		pub.system = JSON.parse(sessionStorage.getItem("system"));
		pub.init();
	}
})