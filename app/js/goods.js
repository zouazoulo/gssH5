$(document).ready(function(){
// 命名空间
	pub = {};
	
	//检测goodsId的合法性
	function isGoodsId (d) {
		if (d) {
			return !isNaN(+common.getUrlParam("goodsId")) ?  common.getUrlParam('goodsId') : null
		}else{
			return null
		}
	}
	
	$.extend(pub,{
		html:'',
		twoTypecode:(sessionStorage.getItem("twotype") == undefined ? '' : sessionStorage.getItem("twotype")),
		threeTypecode:(sessionStorage.getItem("threetype") == undefined ? '' : sessionStorage.getItem("threetype")),
		goodsTypecode:(sessionStorage.getItem("goodtype") == undefined ? '' : sessionStorage.getItem("goodtype")),
		websiteNode:common.websiteNode,
		isLast:false,
		pageSize:common.pageSize,
		pageNo:common.pageNo,
		logined : common.getIslogin(),
		method:['goods_first_type',"goods_second_type",'goods_info_show_fou','goods_collection_del','goods_collection_add'],
		issystem:sessionStorage.getItem("system"),
		goodsId: isGoodsId(common.getUrlParam("goodsId")) || sessionStorage.getItem("goodsId"),
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
			$('#gw_car').removeClass("hidden").find('.gw_car_num').html(goodnum > 99 ? '99+' : goodnum)
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
			
			//添加点击弹出输入框事件
			$(".car_main ul").on("click",".car_number",function(){
				var a = $(this).text();
				var d = $(this).parent().parent();
				var id=d.attr('data'),packagenum=d.attr('packagenum'),maxCount=d.attr('maxCount');
				$(".input_mask p").text("")
				$(".input_mask").show()
				$(".number").val(a).attr({"val":a,"data":id,"packagenum":packagenum,"maxCount":maxCount}).focus();
				$(".footer-wrap").addClass("hidden")
			})
			
			$(".mask_left").on("click",function(){
				$(".input_mask").hide();
				$(".footer-wrap").removeClass("hidden")
			})
			$(".mask_right").on("click",function(){
				$(".input_mask").hide()
				var domNumber = $(this).parents().siblings(".number");
				var a = domNumber.attr("data");
				var c = domNumber.attr("val");
				var goodobj = JSON.parse(localStorage.good);
				$(".footer-wrap").removeClass("hidden")
				if(goodobj.length != 1){
					if(c == 0){
						$('span[dataID='+a+']').addClass("hidden").prev().addClass("hidden")
						$('li[data = '+ a +']').remove();
						$("#gw_car").animate({
							bottom:($('.footer_car').height()+97)+"px"
						},300)
						for (var i in goodobj) {
					       	if (goodobj[i].id == a) {
				       			goodobj.splice(i,1)
				            	localStorage.good = JSON.stringify(goodobj, memberfilter);
				            	break;
				       		}
			    		}
					}else{
						$('span[dataID='+a+']').html(c)
						pub.eventHeadle.change_num(a,c)
					}
				}else{
					if(c == 0){
						var id=$(this).parents().find("li[data]").attr('data');
						$('span[dataID]').html(0)
						$('.footer_car').addClass("hidden").find(".car_main ul li").remove();
						$(".my_bg").addClass("hidden");
						localStorage.removeItem('good');
						$('#gw_car').addClass("hidden").css('bottom','26px')
						$('.footer-left').addClass("sprite icon_shoppingcar").html("购物车是空的").animate({
							'text-indent':0
						},300)
					}else{
						$('span[dataID='+a+']').html(c)
						pub.eventHeadle.change_num(a,c)
					}
			 	}
				pub.style_change()
				
			})
			//验证是否是数字
			$(".number").on("input propertychange",function(){ //input propertychange 即时监听事件
        		$(this).val($(this).val().replace(/\D/g,"")) //将非数字替换成空字符串
        		var d = $(this);
        		
        		var id=d.attr('data'),
        			packagenum=d.attr('packagenum'),
        			maxCount=d.attr('maxCount')
        			oldVal = parseInt(d.attr("val"));
        			val = parseInt($(this).val() == '' ? 0 : $(this).val()) ;
        		if (val == 0) {
        			d.attr("val",0);
        			return;
        		}
        		if (val < parseInt(packagenum)) {
        			d.attr("val",d.val());
        			$(".input_mask p").text("")
					if(maxCount >0){
						if(val > maxCount){
							$(".input_mask p").text("该商品限购"+maxCount+"件")
							d.attr("val",maxCount);
						}
					}
				} else{
					if (oldVal) {
						if(maxCount >0){
							if(val > maxCount){
								$(".input_mask p").text("该商品限购"+maxCount+"件")
								d.attr("val",maxCount);
							}
						}else{
							d.attr("val",packagenum);
							$(".input_mask p").text("*库存不足*")
						}
	        		}else{
	        			d.attr("val",packagenum);
	        			$(".input_mask p").text("*库存不足*")
	        		}
				}
       	 	})
		},
		change_num :function(a,b){
			var goodobj = JSON.parse(localStorage.good);
			for (var i in goodobj) {
		       	if (goodobj[i].id == a) {
	       			goodobj[i].sum = b ;
	            	localStorage.good = JSON.stringify(goodobj, memberfilter);
	            	break;
	       		}
    		}
		}
	}
/*-------------------------更多商品------------------------------*/
	pub.moregoods = {
		init:function(){
			pub.moregoods.UrlCode = common.getUrlParam('typeCode') ? isNaN(+common.getUrlParam("typeCode")) ? null : common.getUrlParam("typeCode").length ==4 ? common.getUrlParam("typeCode") : '' : null ;
//			console.log(pub.moregoods.UrlCode);
			pub.moregoods.firstapi();
			pub.moregoods.eventHeadle.init();
			pub.style_change();
			sessionStorage.removeItem("sta");
		},
		firstapi:function(){
			common.ajaxPost({
				method:pub.method[0],
				firmId:pub.firmId,
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
				firmId:pub.firmId,
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
				firmId:pub.firmId,
				websiteNode:pub.websiteNode,
				typeCode:pub.goodsTypecode,
				pageNo:pub.pageNo,
				pageSize:pub.pageSize,
				eyeId:pub.threeTypecode
			},function(data){
				if (data.statusCode == 100000) {
					if (pub.pageNo == 1) {
						obj.data(data);
						pub.moregoods.goods_show(data);
					}else{
						pub.moregoods.goods_show(data);
					}
				}
				
			})
		},
		first_list:function(data){
//			console.log(pub.moregoods.UrlCode);
			var html='',v = data.data,n=0;
			for (var i in v) {
				if (pub.moregoods.UrlCode &&  pub.moregoods.UrlCode.substr(0,2) == v[i].typeCode) {
					n = i;
				}
				html +='<li first_list_data'+i+'="'+v[i].typeCode+'">'+v[i].typeName+'</li>'
			};
			$(".moreDoogs_main_top_list").append(html).css('width',(v.length*164)+'px');
			
			var $ele=$(".moreDoogs_main_top_list li").eq(n);
			$ele.addClass("true");
			pub.twoTypecode = $ele.attr("first_list_data"+n);
			if ($ele.get(0).offsetLeft > 200) {
				$('.moreDoogs_main_top').scrollLeft($ele.get(0).offsetLeft-200)
			}else{
				$('.moreDoogs_main_top').scrollLeft(0)
			}
			pub.moregoods.twoapi($ele);
			
			var hei=document.documentElement.clientHeight-$('.footer-wrap').height()-$('.header-wrap').height()-$('.moreDoogs_main_top').height();
				$('.moreDoogs_main_box_left_wrap').height(hei);
				$('.moreDoogs_main_box_right').height(hei);
				$('.moreDoogs_main_box_right_box').height(hei);
		},
		two_list:function(data){
			var html='',v = data.data,n=0;
			
			$(".moreDoogs_main_box_left").find("li").remove();
			for (var i in v) {
				if (pub.moregoods.UrlCode == v[i].typeCode) {
					n = i;
				}
				html +='<li two_list_data'+i+'="'+v[i].typeCode+'">'+v[i].typeName+'</li>'
			}
			$(".moreDoogs_main_box_left").append(html).height($('.moreDoogs_main_box_left').height());
			var $ele=$(".moreDoogs_main_box_left li").eq(n);
			pub.goodsTypecode=$ele.attr("two_list_data"+n);
			$ele.addClass("true");
			if ($ele.get(0).offsetTop>200) {
				$('.moreDoogs_main_box_left_wrap').scrollTop($ele.get(0).offsetTop-200)
			}else{
				$('.moreDoogs_main_box_left_wrap').scrollTop(0)
			}
			pub.moregoods.goodsapi($ele);
		},
		goods_show:function(data){
			pub.isLast=data.data.page.isLast;
			if (pub.pageNo=='1') {
				$('.moreGoods_box_list').find('li').remove();
			}
			pub.isLast && $('.lodemore').html('没有更多数据了');
			!pub.isLast && $('.lodemore').html('点击加载更多数据');
			/*
			 * 三级菜单
			 */
			var html='',v1 = data.data.gtes,n=0;
				if(v1.length){
					$(".moreGoods_box_list_class").show();
					for (var i in v1) {
						if (pub.moregoods.UrlCode == v1[i].id) {
							n = i;
						}
						html +='<li three_list_data'+i+'="'+v1[i].id+'">'+v1[i].name+'</li>'
					}
					if(!pub.threeTypecode){
						$(".moreGoods_box_list_class")[0].innerHTML = html
						let $ele=$(".moreGoods_box_list_class li").eq(n);
						pub.threeTypecode=$ele.attr("three_list_data"+n);
						$ele.addClass("active")
					}
				}else{
					$(".moreGoods_box_list_class").hide();
				}
				
			/*
			 * 商品展示
			 */
			var html2='',v = data.data.page.objects,goodnum;
			moregood_data=sessionStorage.setItem('moregood_data',JSON.stringify(data));
			for (var i in v) {
				html2 +='<li><dl class="moreGoods_goods_detaile clearfloat" data="'+v[i].id+'" dataName="'+v[i].goodsName+'" dataPir="'+v[i].wholeGssPrice+'" wholePriceSize="'+v[i].wholePriceSize+'" gssPrice="'+v[i].gssPrice+'" priceUnit="'+v[i].priceUnit+'" packageNum="'+(parseInt(v[i].initNum) - parseInt(v[i].saleNum))+'" maxCount="'+v[i].maxCount+'" bussinessType="'+v[i].bussinessType+'" score="'+v[i].score+'" >'
				html2 +='<dt>'
				html2 +='	<img src="'+v[i].goodsLogo+'"/>'
				if (v[i].vipGrade > 0) {
	            	html2 += '<span class = "icon_vip'+v[i].vipGrade+'"></span>'
	            }
				html2 +='</dt>'
				html2 +='<dd>'		
				html2 +='<h3 class="moreGoods_goods_name">'+v[i].goodsName+'</h3>'
				/*if (v[i].vipGrade > 0) {
					if (v[i].maxCount) {
						html2 +='<p class="moreGoods_goods_text">限购'+v[i].maxCount+'件</p>'
					}else{
						html2 +='<p class="moreGoods_goods_text"> </p>'
					}
	            }else{
	            	html2 +='<p class="moreGoods_goods_text">'+v[i].goodsShows+'</p>'
	            }*/
				html2 +='<p class="moreGoods_goods_text">'+v[i].goodsShows+'</p>'
				if (pub.logined) {
					html2 +='<p class="moreGoods_goods_price">'
					if (v[i].vipGrade > 0) {
						html2 +='<span class="fontColor">'+v[i].wholeGssPrice+'</span>元/'+v[i].wholePriceSize+'  <del>'+v[i].nomalPrice+'元/'+v[i].wholePriceSize+'</del>'
		            }else{
		            	html2 +='<span class="fontColor">'+v[i].gssPrice+'</span>元/'+v[i].priceUnit+'&nbsp; &nbsp;<span>'+v[i].priceDesc+'</span>'
		            }
					
					html2 +='</p>'
					html2 +='<div class="moreGoods_goods_num">'
					/*if (v[i].vipGrade > 0) {
						
		            }else{
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
		            }*/
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
					
					if (v[i].vipGrade > 0) {
						if (v[i].state == 1) {
							if ((parseInt(v[i].initNum) - parseInt(v[i].saleNum)) <= 0) {
								html2+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block;font-size: 24px;">已售罄</b>'
							}else{
								goodnum=callbackgoodsnumber(v[i].id);
								if (goodnum!='0') {
									html2 +='<span class="goodsNumber_min"><img src="../img/btn_m@2x.png"/></span>'
									html2 +='<span class="goodsNumber fontColor" dataID="'+v[i].id+'">'+goodnum+'</span>'
								} else{
									html2 +='<span class="goodsNumber_min hidden"><img src="../img/btn_m@2x.png"/></span>'
									html2 +='<span class="goodsNumber fontColor hidden" dataID="'+v[i].id+'"></span>'
								}
								html2 +='<span class="goodsNumber_max"><img src="../img/btn_a@2x.png"/></span>'
							}
						} else{
							if (v[i].state == 2) {
								html2+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block;font-size: 24px;">不是VIP</b>'
							}
							if (v[i].state == 3) {
								html2+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block;font-size: 24px;">等级不足</b>'
							}
						}
		            }else{
		            	if ((parseInt(v[i].initNum) - parseInt(v[i].saleNum)) <= 0) {
							html2+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block;font-size: 24px;">已售罄</b>'
						}else{
							goodnum=callbackgoodsnumber(v[i].id);
							if (goodnum!='0') {
								html2 +='<span class="goodsNumber_min"><img src="../img/btn_m@2x.png"/></span>'
								html2 +='<span class="goodsNumber fontColor" dataID="'+v[i].id+'">'+goodnum+'</span>'
							} else{
								html2 +='<span class="goodsNumber_min hidden"><img src="../img/btn_m@2x.png"/></span>'
								html2 +='<span class="goodsNumber fontColor hidden" dataID="'+v[i].id+'"></span>'
							}
							html2 +='<span class="goodsNumber_max"><img src="../img/btn_a@2x.png"/></span>'
						}
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
		
	};
	
	pub.moregoods.eventHeadle = {
		init:function(){
			$(".moreDoogs_main_top").on("click",".moreDoogs_main_top_list li",function(){
				var $ele = $(this);
				pub.threeTypecode = "";
				if (!$ele.is(".true")) {
					pub.pageNo = 1;
					$(this).addClass('true').siblings().removeClass("true");
					pub.twoTypecode = $(this).attr("first_list_data"+$(this).index());
					sessionStorage.setItem("twotype",pub.twoTypecode);
					console.log($.isEmptyObject($(this).data()))
					
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
				pub.threeTypecode = "";
				if (!$(this).is(".true")) {
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
					$('.moreDoogs_main_box_right').scrollTop(0)
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
			//三级菜单点击事件
			$(".moreGoods_box_list_class").on("click","li",function(){
				var $ele = $(this);
				if(!$ele.is('.active')){
//					pub.pageNo = 1;
					$(this).addClass('active').siblings().removeClass("active")
					pub.threeTypecode = $(this).attr("three_list_data"+$(this).index());
					sessionStorage.setItem("threeTypecode",pub.threeTypecode);
					if ($.isEmptyObject($(this).data())) {
							pub.moregoods.goodsapi($ele);
						}else{
							pub.moregoods.goods_show($(this).data());
						}
						
				}	
				
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
				//goods_get_by_id_two  goods_get_by_id
				method:"goods_get_by_id_two",
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
			//var isVideo = (arr1[0].indexOf(".mp4") != -1)
			var isVideo = (arr1[0].indexOf(".mp4") != -1);
			if (isVideo) {
				pub.html += '<div id="video" class="swiper-slide" style="width: 750px; height: 600px;">'
				pub.html += '	<img class="video_payImg" src="'+arr1[1]+'" />'
				pub.html += '	<div class="video_pay"></div>'
				pub.html += '	<div id="mainVideoDiv" class="mod_video_main">'
				pub.html += '		<video id="mainVideo" preload="none" webkit-playsinline="true" x5-playsinline="true" playsinline="true" controls="controls" width="100%" height="100%" style="max-height: 480px;"  fristplay="no">'
				//style="object-fit:fill"
				pub.html += '			<source src="'+arr1[0]+'?v=01" type="video/mp4">'
				//pub.html += '			<source src="https://1251412368.vod2.myqcloud.com/vodtransgzp1251412368/7447398156007696008/v.f20.mp4?dockingId=f84735d2-21c2-4a5a-83a1-d56dcab9a5a0&storageSource=1" type="video/mp4">'
				pub.html += '			暂时不支持播放该视频'
				pub.html += '		</video>'
				pub.html += '	</div>'
				//pub.html += '	<div id="mainVideoClose" class="video_close" style="margin-top: 10px; display: inline-block;">退出播放</div>'
				pub.html += '	<div id="mainVideoClose" class="video_close" style="margin-top: 10px; display: none;">退出播放</div>'
				pub.html += '</div>'
				
				if (arr1.length > 2) {
					for (var i = 1; i< arr1.length -1 ; i++) {
						pub.html += '<div class="swiper-slide"><img src="'+arr1[i]+'" /></div>'
					}
				}else{
					pub.html += '<div class="swiper-slide"><img src="'+arr1[1]+'" /></div>'
				}
			}else{
				for (var i = 0; i< arr1.length -1 ; i++) {
					pub.html += '<div class="swiper-slide"><img src="'+arr1[i]+'" /></div>'
				}
			}
			
			$(".goodsDetails_img_box .swiper-wrapper").append(pub.html);
			
			if (isVideo) {
				var myVideoDiv = $("#mainVideoDiv"),
					video = $("#mainVideo"),
					myVideo = $("#video"),
					pay = $(".video_payImg,.video_pay,.header-wrap,.swiper-pagination"),
					close = $("#mainVideoClose");
				var marTop = (600 - myVideo.height())/2;
					myVideoDiv.css("margin-top",'-1440px');
				
				
				$(".video_payImg,.video_pay").on("click",function(){
					
					sessionStorage.getItem("isVideoPay") ? change(true) : (function(){
						try{
							common.createPopup({
			                    flag: 4,
			                    icon: 'none',
			                    msg: true ? '播放本视频将消耗您的流量，建议在WiFi环境下播放' : '商品介绍视频将帮助您更清晰了解商品，但也将耗费较多流量，建议在WiFi环境下查看。',
			                    okText: '立即播放',
			                    cancelText: '下次再看',
			                    onConfirm: function() {
			                    	sessionStorage.setItem("isVideoPay",true);
			                    	change(true)
			                    }
			                });
						}catch(e){
							alert(e)
						}
					})()
					
					
				});
				$("#mainVideoClose").on("click",function(){
					change(false);
				});
				
				video[0].addEventListener("pause",function(){
					//change(false);
					//exitFullscreen();
					//myVideoDiv.css("margin-top",'-9999px');
				});
				video[0].addEventListener("play",function(){
					//change(false);
					//exitFullscreen();
					setTimeout(function(){
						var h = $("#mainVideo").height();
						if (h >= 530) {
							myVideoDiv.css("margin-top",'0px');
						}else{
							marTop = (600 - h)/2;
							myVideoDiv.animate({"margin-top":marTop+'px'});
						}
					},500)
					
				})
				video[0].addEventListener("ended",function(){
					change(false);
					exitFullscreen();
				})
				video[0].addEventListener("timeupdate",function(){
					console.log("timeupdate");
					
				})
				video[0].addEventListener("suspend",function(){
					//console.log("视频被阻塞了")
				})
				video[0].addEventListener("x5videoexitfullscreen", function(){
				    //alert("exit fullscreen")
				})
				video[0].addEventListener("x5videoenterfullscreen", function(){
				    //alert("enter fullscreen")
				})
			}
			
			var mySwiper = new Swiper ('.goodsDetails_img_box', {
			    direction: 'horizontal',
			    /*loop: true,
			    autoplay:5000,
			    paginationClickable:true,*/
			    // 如果需要分页器
			    pagination: '.swiper-pagination',
			    onSlideChangeEnd:function(swiper){
			   		if (swiper.previousIndex == '0') {
			   			isVideo && change(false);
			   		}
			    }
			});
			function change(d){
				if (d) {
					myVideo.addClass("video");
					pay.hide();
					//close.css({"margin-top":'10px',"display":'inline-block'});
					myVideoDiv.css("margin-top",'0px');
					video.get(0).play();
					
				}else{
					myVideo.removeClass("video");
					pay.show();
					//close.css({"margin-top":'10px',"display":'none'});
					video.get(0).pause();
					myVideoDiv.css("margin-top",'-9999px');
					
				}
			}
			//进入全屏
			function FullScreen() {
			    var ele = document.documentElement;
			    if (ele .requestFullscreen) {
			        ele .requestFullscreen();
			    } else if (ele .mozRequestFullScreen) {
			        ele .mozRequestFullScreen();
			    } else if (ele .webkitRequestFullScreen) {
			        ele .webkitRequestFullScreen();
			    }
			}
			//退出全屏
			function exitFullscreen() {
			    var de = document;
			    if (de.exitFullscreen) {
			        de.exitFullscreen();
			    } else if (de.mozCancelFullScreen) {
			        de.mozCancelFullScreen();
			    } else if (de.webkitCancelFullScreen) {
			        de.webkitCancelFullScreen();
			    }
			}
			
		},
		good_info_show:function(data){
			var v = data.data;
			//展示商品信息1111111111111
			pub.html = ''
			if (v.vipGrade > 0) {
				pub.html +='<h3 class="goodsDetails_box1_title vip vip'+v.vipGrade+'">'+v.goodsName+'</h3>'
			}else{
				pub.html +='<h3 class="goodsDetails_box1_title">'+v.goodsName+'</h3>'
			}
			
			pub.html +='<div class="goodsDetails_box1_ionc">'
				
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
				if (v.vipGrade > 0) {
					if (v.state == 1) {
						if((parseInt(v.initNum) - parseInt(v.saleNum))<=0){
							pub.html+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block">已售罄</b>'
						}else{
							pub.html+='	<span class="goodsNumber_min"><img src="../img/btn_m@2x.png"/></span>'
							pub.html+='	<span class="goodsNumber fontColor" dataID="'+data.data.id+'">'+pub.goodnum+'</span>'
							pub.html+='	<span class="goodsNumber_max"><img src="../img/btn_a@2x.png"/></span>'
						}
					}else if (v.state == 2){
						pub.html+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block">不是VIP</b>'
					}else if (v.state == 3){
						pub.html+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block">等级不足</b>'
					}
				}else{
					if((parseInt(v.initNum) - parseInt(v.saleNum))<=0){
						pub.html+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block">已售罄</b>'
					}else{
						pub.html+='	<span class="goodsNumber_min"><img src="../img/btn_m@2x.png"/></span>'
						pub.html+='	<span class="goodsNumber fontColor" dataID="'+data.data.id+'">'+pub.goodnum+'</span>'
						pub.html+='	<span class="goodsNumber_max"><img src="../img/btn_a@2x.png"/></span>'
					}
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
				if (v.vipGrade > 0) {
					$(".goodsDetails_Unit_Price").html("单价：<span class='color_f27c32'>"+v.gssPrice+"</span>元/"+v.priceUnit + "<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<del>"+v.nomalPrice+"元/"+v.priceUnit + "</del>");
					$(".goodsDetails_Total_Price").html("总价："+v.wholeGssPrice+"元/"+v.wholePriceSize+ "<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<del>"+v.wholeNomalPrice+"元/"+v.wholePriceSize + "</del>");		
				}else{
					$(".goodsDetails_Unit_Price").html("单价：<span class='color_f27c32'>"+v.gssPrice+"</span>元/"+v.priceUnit );
					$(".goodsDetails_Total_Price").html("总价："+v.wholeGssPrice+"元/"+v.wholePriceSize);	
				}
						
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
				sessionStorage.removeItem("goodsId");
				if (sessionStorage.getItem("sta")) {
					window.location.href = "../index.html"
				}else{
					window.history.back();
				}
				
			})
			//var st = '.goodsDetails_box1_title.vip1' || '.goodsDetails_box1_title.vip2' || '.goodsDetails_box1_title.vip3'  || '.goodsDetails_box1_title.vip4';
			$(".goodsDetails_box1_top").on("click",'.goodsDetails_box1_title.vip',function(e){
				
				if (pub.logined) {
					common.jump("vip.html")
				}else{
					common.jump('login.html');
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
	            if (o.vipGrade > 0) {
	            	html += '<span class = "icon_vip'+o.vipGrade+'"></span>'
	            }
	            html +='            </dt>'
	            html +='            <dd class="line-normal-info-wrapper">'
	            html +='               <div class="often_shop_goods_top clearfloat">'
				html +='					<p class="often_shop_goods_tit">'+o.goodsName+'</p>'
				html +='					<p class="often_shop_goods_icon">'
				/*if (o.vipGrade > 0) {
	            	
	            }else{
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
				/*if (o.vipGrade > 0) {
	            	if (o.maxCount) {
						html +='			<p class="often_shop_show">限购'+o.maxCount+'件</p>'
					}else{
						html +='<p class="often_shop_show"> </p>'
					}
	            }else{
	            	html +='               <p class="often_shop_show">'+o.goodsShows+'</p>'
	            }*/
				html +='               <p class="often_shop_show">'+o.goodsShows+'</p>'	
	            
				html +='				<div class="often_shop_NumPir" data="'+d[i].goodsInfoId+'" dataName="'+o.goodsName+'" dataPir="'+o.wholeGssPrice+'" wholePriceSize="'+o.wholePriceSize+'" gssPrice="'+o.gssPrice+'" priceUnit="'+o.priceUnit+'" packageNum="'+o.packageNum+'" maxCount="'+o.maxCount+'" goodType="'+o.bussinessType+'" score="'+o.score+'">'
				html +='					<div class="os_pir">'
				if (o.vipGrade > 0) {
	            	html +='						<span class="often_shop_color">'+o.wholeGssPrice+'</span>元/'+o.wholePriceSize+'&nbsp;&nbsp;<del>'+o.nomalPrice+'元/'+o.wholePriceSize+'</del>'
	            }else{
	            	html +='						<span class="often_shop_color">'+o.gssPrice+'</span>元/'+o.priceUnit+'&nbsp;&nbsp;<span>'+o.priceDesc+'</span>'
	            }
				
				html +='					</div>'
				html +='					<div class="os_Num">'
				if (o.vipGrade > 0) {
					if (o.state == 1) {
						if ((parseInt(o.initNum) - parseInt(o.saleNum)) <= 0) {
							html2+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block;font-size: 24px;">已售罄</b>'
						}else{
							
						goodnum=callbackgoodsnumber(o.id);
						if (goodnum!='0') {
							html +='					<button class="goodsNumber_min">'
							html +='						<img src="../img/btn_m@2x.png"/>'
							html +='					</button>'
							html +='					<span class="goodsNumber fontColor" dataID="'+o.id+'">'+goodnum+'</span>'
						} else{
							html +='					<button class="goodsNumber_min" style="display: none;">'
							html +='						<img src="../img/btn_m@2x.png"/>'
							html +='					</button>'
							html +='					<span class="goodsNumber fontColor" dataID="'+o.id+'" style="display: none;"></span>'
						}
						html +='						<button class="goods_Number_max">'
						html +='						    <img src="../img/btn_a@2x.png"/>'
						html +='					    </button>'
						}
					} else{
						if (o.state == 2) {
							html+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block;font-size: 24px;">不是VIP</b>'
						}
						if (o.state == 3) {
							html+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block;font-size: 24px;">等级不足</b>'
						}
					}
	            }else{
	            	if ((parseInt(o.initNum) - parseInt(o.saleNum)) <= 0) {
						html+= '<b style="color:red;text-align:center;width:100px;height:64px;line-height:64px;display:inline-block;font-size: 24px;">已售罄</b>'
					}else{
						
						goodnum=callbackgoodsnumber(o.id);
						if (goodnum!='0') {
							html +='					<button class="goodsNumber_min">'
							html +='						<img src="../img/btn_m@2x.png"/>'
							html +='					</button>'
							html +='					<span class="goodsNumber fontColor" dataID="'+o.id+'">'+goodnum+'</span>'
						} else{
							html +='					<button class="goodsNumber_min" style="display: none;">'
							html +='						<img src="../img/btn_m@2x.png"/>'
							html +='					</button>'
							html +='					<span class="goodsNumber fontColor" dataID="'+o.id+'" style="display: none;"></span>'
						}
						html +='						<button class="goods_Number_max">'
						html +='						    <img src="../img/btn_a@2x.png"/>'
						html +='					    </button>'
					}
	            }
	            
				
				
				
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