$(document).ready(function(){
	//命名空间
	var pub = {};
	
	
	$.extend(pub,{
		websiteNode:common.websiteNode,
		method:"goods_show_name",
	});
	pub.search = {
		init:function(){
			pub.search.get_hot();
		},
		get_hot:function(){
			common.ajaxPost({
				method:'goods_show_hot'
			},function(data){
				if (data.statusCode=='100000') {
					pub.search.show_hot(data)
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		search_result:function(goodsName){
			common.ajaxPost({
				method:pub.method,
				websiteNode:pub.websiteNode,
				goodsName:goodsName
			},function(data){
				if (data.statusCode=='100000') {
					pub.search.ajax_search_data(data);
				}else{
					common.prompt(data.statusStr)
				}
			})
			
		},
		show_hot:function(data){
			var html='',v = data.data;
			for (var i in v) {
				html +='<li>'+v[i].keyword+'</li>'
			}
			$(".search_item").append(html);
			$(".search_star").removeClass("hidden");
		},
		ajax_search_data:function(data){
			$(".search_goods").find("dl").remove();
			var v = data.data;
			if (v=='') {
				$(".search_none").removeClass("hidden").siblings().addClass("hidden");
			} else{
				$(".search_resurt").removeClass("hidden").siblings().addClass("hidden");
			}
			var html='';
			for (var i in v) {
				html +='<dl class="clearfloat" data="'+v[i].id+'">'
				html +='	<dt>'
				html +='		<img src="'+v[i].goodsLogo+'"/>'
				if (v[i].vipGrade > 0) {
	            	html += '	<span class = "icon_vip'+v[i].vipGrade+'"></span>'
	            }
				html +='	</dt>'
				html +='<dd>'
				html +='<h3 class="moreGoods_goods_name ellipsis">'+v[i].goodsName+'</h3>'
				/*if (v[i].vipGrade > 0) {
					if (v[i].maxCount) {
						html +='<p class="moreGoods_goods_text">限购'+v[i].maxCount+'件</p>'
					}else{
						html +='<p class="moreGoods_goods_text"> </p>'
					}
	            }else{
	            	html +='<p class="moreGoods_goods_text">'+v[i].goodsShows+'</p>'
	            }*/
				html +='<p class="moreGoods_goods_text">'+v[i].goodsShows+'</p>'
				html +='<p class="moreGoods_goods_price">'
				if (common.getIslogin()) {
					if (v[i].vipGrade > 0) {
						html +='<span class="fontColor">'+v[i].wholeGssPrice+'</span>元/'+v[i].wholePriceSize+' &nbsp; &nbsp;<del>'+v[i].nomalPrice+'元/'+v[i].wholePriceSize+'</del>'
		            }else{
		            	html +='<span class="fontColor">'+v[i].gssPrice+'</span>元/'+v[i].priceUnit+' &nbsp; &nbsp;<span>'+v[i].priceDesc+'</span>'
		            }
				}else{
					
				}
				html +='</p>'
				/*if(v[i].vipGrade > 0){
				}else{
					html +='<div class="moreGoods_goods_icon">'
					if (v[i].isSale) {
						html +=' <span class = "icon_cu"></span>'
					}
					if (v[i].isNew) {
						html +=' <span class = "icon_ji"></span>'
					}
					if (v[i].isRecommend) {
						html +=' <span class = "icon_jian"></span>'
					}
					if (v[i].isHot) {
						html +=' <span class = "icon_re"></span>'
					}
					html +='</div>'
				}*/
				html +='<div class="moreGoods_goods_icon">'
				if (v[i].isSale) {
					html +=' <span class = "icon_cu"></span>'
				}
				if (v[i].isNew) {
					html +=' <span class = "icon_ji"></span>'
				}
				if (v[i].isRecommend) {
					html +=' <span class = "icon_jian"></span>'
				}
				if (v[i].isHot) {
					html +=' <span class = "icon_re"></span>'
				}
				html +='</div>'
				html +='</dd>'
				html +='</dl>'
			}
			$(".search_goods").append(html);
			/*if (!common.getIslogin()) {
				$('.moreGoods_goods_price').html('<span class="fontColor">15</span>单');
			}*/
			var goods=$(".search_goods dl");
			common.txq(goods,4)
		}
	}
	
	pub.search.eventHeadle = {
		init:function(){
			$('#search').on('input propertychange', function(){
				var search_inner=$('#search').val();
				var search_place=$(".search input").attr("placeholder")
				if (search_place=="请输入商品名称") {
					$(".search_star").removeClass("hidden").siblings().addClass("hidden")
				} else{
					var goodsName=search_place;
					pub.search.search_result(goodsName)
				}
				if(search_inner==''){
					$(".search input").attr("placeholder","请输入商品名称")
					$(".search_star").removeClass("hidden").siblings().addClass("hidden")
				}else{
					var goodsName=search_inner;
					pub.search.search_result(goodsName)
				}
	        });
	        common.callback($(".searchCallback"));
	        //搜索框叉号点击
	        $(".delete").on("click",function(){
	        	var $ele = $('#search');
				$ele.val('').attr("placeholder","请输入商品名称").focus();
				$(".search_star").removeClass("hidden").siblings().addClass("hidden")
			});
			$(".search_item").on("click","li",function(){
				var goodsName= $(this).html();
				$(".search input").attr("placeholder",goodsName);
				pub.method='goods_show_name2';
				pub.search.search_result(goodsName)
			});
			$(window).load(function(){
				common.jsadd();
			});
			common.fadeIn()
		}	
	}
	
	pub.init = function(){
		pub.search.init();
		pub.search.eventHeadle.init();
	}
	pub.init();
})