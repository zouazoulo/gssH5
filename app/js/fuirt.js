$(document).ready(function(){
	var pub = {};
	$.extend(pub,{
		firmId:common.user_data().firmInfoid,
		pageSize:common.pageSize,
		pageNo:common.pageNo,
		tokenId : common.tokenId(),
		source:'firmId'+common.user_data().firmInfoid,
		sign:md5('firmId'+common.user_data().firmInfoid+"key"+common.secretKey()).toUpperCase(),
		type:"1",
		data:[{id:1,name:"当月排行",code:1},{id:2,name:"当季排行",code:2},{id:3,name:"当年排行",code:3}],
		isLast:false
	});
	
	
	pub.fruit = {
		init:function(){
			pub.fruit.api();
			pub.fruit.eventHeadle.init();
			pub.fruit.screenInit(pub.data);
			if (common.isPhone()) {
				$(".order_refund").css("left",0)
			}
		},
		api:function(){
			common.ajaxPost({
				method:"firm_exp_rank",
				pageNo:pub.pageNo,
				pageSize:pub.pageSize,
				firmId:pub.firmId,
				type:pub.type,
				sign:pub.sign,
				source:pub.source,
				tokenId : pub.tokenId
			},function(data){
				if (data.statusCode == 100000) {
					$(".order_refund").hide();
					pub.isLast = data.data.page.isLast;
					pub.fruit.dataShow(data.data);
					!pub.isLast && $(".lodemore").html("点击加载更多！");
					pub.isLast && $(".lodemore").html("没有更多数据了！");
				}else{
					$(".order_refund").hide();
					common.prompt(data.statusStr);
				}
			})
		},
		screenInit:function(LAreaData){
			var area1 = new LArea2();
			area1.init({
				'trigger': '#date', //触发选择控件的文本框，同时选择完毕后name属性输出到该位置
				'valueTo': '#value_date', //选择完毕后id属性输出到该位置
				'keys': {
					id: 'id',
					name: 'name'
				}, //绑定数据源相关字段 id对应valueTo的value属性输出 name对应trigger的value属性输出
				'type': 1, //数据源类型
				'data': LAreaData, //数据源
			});
			area1.value=[0,0];//控制初始位置，注意：该方法并不会影响到input的value
		},
		dataShow:function(d){
			var s = d.page.objects,w = d.owner,html = '';
			if (d.page.pageNo == 1) {
				$(".footer-wrap.fruit .fruit_bussniess_list").find(".number").html(w.ranking).end().find(".name").html(w.firmName).end().find(".fruit").html(w.exp);
				$(".fruit_main .main_center ul").find("li").remove();
			}
			if (s.lenght != 0) {
				for (var i=0;i<s.length;i++) {
					html += '<li class="fruit_bussniess_list">'
					if (pub.pageNo == 1) {
						html += '	<div class="number '+(i>2 ? '' : 'num'+(i+1))+'">'+(i<=2 ? '': s[i].ranking)+'</div>'
					}else{
						html += '	<div class="number">'+s[i].ranking+'</div>'
					}
					html += '		<div class="name">'+s[i].firmName+'</div>'
					html += '		<div class="fruit">'+s[i].exp+'</div></li>'
				}
				$(".fruit_main .main_center ul").append(html);
			}
		},
		
	}
	pub.fruit.eventHeadle = {
		init:function(){
			common.fadeIn();
			common.callback($(".header_left"));
			$("#date").on("input propertychange" , function(){
				var str = $("#value_date").val();
				console.log(str)
				if (pub.type != str) {
					pub.pageNo = 1;
					pub.type = str;
					$(".order_refund").show().css("margin-left",$(".header-wrap").css("margin-left"));
					pub.fruit.api();
				}
			})
			$('.lodemore').on('click',function(){
				if (!pub.isLast) {
					pub.pageNo ++ ;
					pub.fruit.api();
				}
			});
			common.jsadd();
			$("#date").on("focus",function(){
				$(this).blur();
			})
		}
	}
	
	
	pub.fruit.init()
})