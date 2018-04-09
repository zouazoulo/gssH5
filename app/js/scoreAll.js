$(document).ready(function(){
	/*----------------------------果币模块-----------------------------------*/
	var pub = {};
	$.extend(pub,{
		type : $("body").attr("data"),
		getType:common.getUrlParam("type"),
		data:[{
			tit:"果币明细",
			port:"score_details",
			subtitle:["途径","果币","操作时间"]
		},{
			tit:"兑换记录",
			port:"score_use_rcd",
			subtitle:["兑换物品","消费果币","兑换时间"]
		}],
		method:'coupon_kind',
		method1:'exchange_coupon',
		websiteNode:common.websiteNode,
		html:'',
		isLast:false,
		firmId:common.user_data().firmInfoid,
		pageSize:common.pageSize,
		pageNo:common.pageNo,
		source:'firmId'+common.user_data().firmInfoid,
		sign:md5('firmId'+common.user_data().firmInfoid+"key"+common.secretKey()).toUpperCase(),
		couponDate:["立即兑换","果币不足","已兑换","已兑换","已兑完"],
		couponcenter:['','coupon_center2','coupon_center1','coupon_center1','coupon_center3'],
		time:"",
		incDnc:''
	});
	pub.publicParameter = {
		tokenId:common.tokenId(),
		sign:pub.sign,
		source:pub.source
	}
	//1.果币商城
	pub.score = {
		init:function(){
			pub.score.api();
			pub.score.eventHeadle.init();
		},
		api:function(){
			common.ajaxPost($.extend(pub.publicParameter,{
				method:'firm_score_info',
				firmId:pub.firmId
			}),function(data){
				console.log(JSON.stringify(data))
				if (data.statusCode == "100000") {
					pub.score.dataShow(data.data);
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		dataShow:function(data){
			sessionStorage.setItem("score",data.surplusScore);
			$('.now_score').html(data.surplusScore);
			$('.score_msg span').eq(0).html( data.totalScore );
			if (data.websiteNode == '3301') {
				$('.score_msg span').eq(1).html("杭州站"+data.percent)
			}else if(data.websiteNode == '3201'){
				$('.score_msg span').eq(1).html("南京站"+data.percent)
			}
		}
	}
	pub.score.eventHeadle = {
		init:function(){
			$('.main_center_top li').on('click',function(){
				var url = 'score_table.html?type='+$(this).attr('data');
				window.location.href = url
			});
			$(".main_center_bottom dl").on('click',function(){
				var url = $(this).attr('data');
				if($(this).index() != '3' ){
					window.location.href = url
				}else{
					common.prompt("暂未开放!")
				}
			});
			$(".header_left").on("click",function(){
				window.location.href = "../html/wo.html?v=0.1"
			})
		}
	}
	
	/*---------------------------果币记录展示------------------------------------------*/
	pub.table = {
		init:function(){
			$("title").html(pub.data[common.getUrlParam("type")].tit);
			$(".header_tit").html(pub.data[common.getUrlParam("type")].tit);
			pub.table.api();
			pub.table.eventHeadle.init();
			pub.LAreaData = pub.table.getDate();
			console.log(pub.LAreaData)
			pub.table.datainit(pub.LAreaData);
			if (common.isPhone()) {
				$(".order_refund").css("left",0)
			}
		},
		api:function(){
			common.ajaxPost($.extend(pub.publicParameter,{
				method:pub.data[common.getUrlParam("type")].port,
				pageSize:pub.pageSize,
				pageNo:pub.pageNo,
				firmId:pub.firmId,
				scoreUseRcdTime:pub.time,
				scoreDetailsTime:pub.time,
				incDnc:pub.incDnc
			}),function(data){
				if (data.statusCode=='100000') {
					$(".order_refund").hide();
					pub.isLast = data.data.isLast;
					if (data.data.pageNo == 1) {
						$(".main.score_table .score_table_box").find(".score_table_list:not(.score_table_tit)").remove();
					}
					if (data.data.objects.length != 0) {
						pub.table.listShow(data.data.objects)
					}
					!pub.isLast && $(".lodemore").html("点击加载更多！");
					pub.isLast && $(".lodemore").html("没有更多数据了！");
				} else{
					$(".order_refund").hide();
					common.prompt(data.statusStr);
				}
			})
		},
		listShow:function(data){
			pub.html = '';
			for (var i in data) {
				pub.html +='<ul class="score_table_list">'
				pub.html +='<li>'+ ((data[i].goodsName == undefined) ? data[i].scoreFrom : data[i].goodsName) +'</li>'
				pub.html +='<li>'+ ((data[i].incDnc == undefined) ? data[i].score : (data[i].incDnc == 1 ? '+'+data[i].score : '-'+data[i].score)) +'</li>'
				pub.html +='<li>'+ ((data[i].createTime == undefined) ? data[i].useTime : data[i].createTime) +'</li></ul>'
			};
			$(".main.score_table .score_table_box").append(pub.html);
			console.log(pub.isLast)
			
		},
		datainit:function(LAreaData){
			if (pub.getType == 0) {
				var area1 = new LArea1();
			}else{
				var area1 = new LArea2();
			}
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
		getDate:function(){
			var n = new Date(),y = n.getFullYear(),m = n.getMonth() + 1;
			var arr=[],arr1=[];
			arr.push({id:'0',name:"全部",code:'0'});
			for(var i = y; i >= 2015; i--){
				for (var j = ( i==y ? m : 12) ; j > 0; j--) {
					var o = {};
					var n = i +"-"+ (j>9 ? j.toString() : "0"+j);
					o.id = n,o.name = n,o.code = n;
					arr.push(o)
				}
			};
			console.log(pub.type)
			if (pub.getType == 0) {
				arr1 = [{
					id:0,
					code:0,
					name:"全部",
					roadList:arr
				},{
					id:1,
					code:1,
					name:"加",
					roadList:arr
				},{
					id:2,
					code:2,
					name:"减",
					roadList:arr
				}]
				return arr1;
			}else{
				return arr;
			}
		}
	};
	pub.table.eventHeadle={
		init:function(){
			$(".score_table_tit .score_table_tit_item").each(function(i){
				$(this).html(pub.data[common.getUrlParam("type")].subtitle[i])
			});
			$('.lodemore').on('click',function(){
				if (!pub.isLast) {
					pub.pageNo ++ ;
					pub.table.api();
				}
			});
			$("#date").on("input propertychange" , function(){
				var str = pub.incDnc + pub.time;
				var arr = $(this).val().split(",");
				var arr1 = $("#value_date").val().split(",");
				if (arr.length == 1)  {
					if (pub.time != arr1[0]) {
						pub.pageNo = 1;
						pub.time = arr[0] == "全部" ? "" : arr1[0];
						$(".order_refund").show().css("margin-left",$(".header-wrap").css("margin-left"));
						pub.table.api();
					}
				}else if (arr.length == 2) {
					console.log(pub)
					if (pub.time != arr1[0] && pub.incDnc != arr1[1]) {
						pub.pageNo = 1;
						pub.incDnc = arr[0] == "全部" ? "" : arr1[0];
						pub.time = arr[1] == "全部" ? "" : arr1[1];
						$(".order_refund").show().css("margin-left",$(".header-wrap").css("margin-left"));
						pub.table.api();
					}
				}
			});
			$("#date").on("focus",function(){
				$(this).blur();
			})
			common.callback($(".header_left"))
		}
	}
	
	/*-------------------------------果币兑换优惠卷-----------------------------*/
	
	pub.coupon = {
		init:function(){
			pub.coupon.api();
			pub.coupon.eventHeadle.init();
			if (common.isPhone()) {
				$(".order_refund").css("left",0)
			}
		},
		api:function(){
			common.ajaxPost($.extend(pub.publicParameter,{
				method:pub.method,
				pageSize:pub.pageSize,
				websiteNode:pub.websiteNode,
				pageNo:pub.pageNo,
				firmId:pub.firmId
			}),function(data){
				if (data.statusCode=='100000') {
					$(".order_refund").hide();
					pub.isLast = data.data.isLast;
					!pub.isLast && $(".lodemore").html("点击加载更多！");
					pub.isLast && $(".lodemore").html("没有更多数据了！");
					if (data.data.objects.length != 0) {
						pub.coupon.listShow(data.data.objects)
					}
				} else{
					$(".order_refund").hide();
					common.prompt(data.statusStr);
				}
			})
		},
		exchangeapi:function(id){
			common.ajaxPost($.extend(pub.publicParameter,{
				method:pub.method1,
				firmId:pub.firmId,
				couponKindId:id,
			}),function(data){
				if (data.statusCode=='100000') {
					$(".order_refund").hide();
					pub.coupon.alert("兑换成功")
				} else if(data.statusCode=='100619'){
					$(".order_refund").hide();
					pub.coupon.prompt(data.statusStr);
				}else{
					$(".order_refund").hide();
					common.prompt(data.statusStr)
				}
			})
		},
		listShow:function(data){
			pub.html = '';
			for (var i in data) {
				pub.html +='<div class="coupon_list_item '+ (data[i].flag == 0 ? '' : "bg") +'">'
				pub.html +='<div class="coupon_left sprite_login '+ (data[i].flag == 0 ? 'quan_c' : "quan_a") +'">'+data[i].couponMoney+'元</div>'
				pub.html +='<div class="coupon_center ">'
				pub.html +='<div class="coupon_name">'+data[i].kindName+'</div>'
				pub.html +='<p>有效期：'+data[i].realDays+'天</p>'
				pub.html +='<p>金额要求：实付满'+data[i].leastOrderMoney+'元</p>'
				pub.html +='</div>'
				pub.html +='<div class="coupon_right">'
				pub.html +='<div class="coupon_score">'+data[i].needScore+'<span>币</sapn></div>'
				pub.html +='<div class="coupon_button coupon_btn'+ data[i].flag +'" data="'+data[i].id+'">'+pub.couponDate[data[i].flag]+'</div>'
				pub.html +='</div>'
				pub.html +='</div>'
			};
			$(".main.score_coupon .score_coupon_box").append(pub.html);
			
		},
		alert:function(text){
			layer.open({
			    content: text,
			    btn: '确定'
			});
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
		}
	}
	pub.coupon.eventHeadle={
		init:function(){
			$(".score_coupon_box").on('click','.coupon_button.coupon_btn0',function(){
				var id = $(this).attr("data");
				layer.open({
				    content: '是否兑换优惠卷？',
				    btn: ['确定', '取消'],
				    yes: function(index){
				      pub.coupon.exchangeapi(id);
				      layer.close(index);
				      //console.log(-parseInt($(".header-wrap").css("margin-left")))
				      $(".order_refund").show().css("margin-left",$(".header-wrap").css("margin-left"))
				    }
				});
				
			});
			$('.lodemore').on('click',function(){
				if (!pub.isLast) {
					pub.pageNo ++ ;
					pub.coupon.api();
				}
			})
			$(".header_left").on("click",function(){
				window.location.href = "../html/score.html?v=0.1"
			})
		}
	}
	
	pub.init = function(){
		
		if (pub.type == 1) {
			pub.score.init();
		}else if(pub.type == 2){
			pub.table.init();
		}else if(pub.type == 3){
			pub.coupon.init();
		}
		
		$(window).load(function(){
			common.jsadd();
		});
		common.fadeIn();
	}
	pub.init();
})