$(document).ready(function(){
	var pub = {};
	$.extend(pub,{
		logined : common.getIslogin(),
		method:['user_logout',"user_ticketal_msg",'firm_info_update_faceimgurl'],
		issystem:sessionStorage.getItem('system'),
		
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
		pub.data = common.user_data();
	};
	if(pub.issystem){
		pub.system = JSON.parse(pub.issystem)
	}
	pub.type = common.getUrlParam("type") ? common.getUrlParam("type") : 1;
	/*
	领券数据结构
	*/
	var moduleData = {
		nav:[
			{
				name:'优惠券',
				type:1,
			},{
				name:'商品券',
				type:2,
			},{
				name:'专项类目券',
				type:3,
			}
		],
		couponInfo:{/*
			name:'VIP特权红包',
			money:'80',
			time:'2018-09-07',
			money1:'899',
			form:'活动',*/
			id:1,//优惠券模板ID
			templateName:'123',//模板名称
			templateMoney:100,//模板金额
			leastOrderMoney:500,//最少订单金额
			realDays:new Date(),//有效时间
			creator:'zyh',//创建人
			createTime:'2018',//创建时间
			status:1,//状态：1启用，-1禁用，默认创建就是禁用状态
			websiteNode:3301,//站点编码
			//1：普通优惠券
			//2：商品券 （关联具体的商品ID、同时保存商品的二级类型）
			//3：类目券 （关联商品二级类型）
			type:1,//类型
			vipGrade:1,//VIP等级
			goodsType:1,//商品类型
			goodsId:10,//商品ID
			state:1,//1 --可领取  2--已经领取  3--不能领取  4 --等级不够
			websiteName:'杭州站',//所属站点名称
			goodsName:'优惠卷',//商品名称*/
		},
		/*String id;//优惠券模板ID
		String templateName;//模板名称
		String templateMoney;//模板金额
		Double leastOrderMoney;//最少订单金额
		Integer realDays;//有效时间
		Long creator;//创建人
		String createTime;//创建时间
		Integer status;//状态：1启用，-1禁用，默认创建就是禁用状态
		String websiteNode;//站点编码
		//1：普通优惠券
		//2：商品券 （关联具体的商品ID、同时保存商品的二级类型）
		//3：类目券 （关联商品二级类型）
		Integer type;//类型
		Integer vipGrade;//VIP等级
		String goodsType;//商品类型
		Long goodsId;//商品ID
		String state;//1 --可领取  2--已经领取  3--不能领取  4 --等级不够
		String websiteName;//所属站点名称
		String goodsName;//商品名称*/
		textList:['','单笔订单实付满：','单品订单实付满：','单类订单实付满：']
	};
	
	
	pub.Vue = new Vue({
		el: '#appVue',
		data: {
			vipNav:moduleData.nav,
			couponInfo:{},
			coupon:{
				type:'',
				name:'',
				list:[],
			},
			textList:moduleData.textList
		},
        beforeCreate : function(){
        	
        },
        created : function(){
        	console.log("created			//创建完成")
        },
        beforeMount : function(){
        	console.log("beforeMount		//挂载之前")
        },
        updated : function(){
        	console.log("updated			//数据被更新后")
        	
        },
        watch:{
        	coupon:function(val,oldval){
        		console.log("val"+val+",oldval"+oldval)
        		console.log(val);
        		console.log(oldval)
        	}
        },
		methods: {
			couponNav:function(item){
				if (this.coupon['type'] != item.type) {
					if(this.couponInfo[item.type]){
						console.log(this.couponInfo[item.type]);
						pub.creatDataModule.couponInfo(item.type,this.couponInfo[item.type])
					}else{
						pub.type = item.type;
						pub.ticket.vip_cou_tem_list.init();
					}
				}
			},
			btnText:function(item){
				if(item.state == 1){
					return '领取'
				}else if (item.state == 2){
					return '已经领取'
				}else if (item.state == 3){
					return '次数用完'
				}else if (item.state == 4){
					return '升级解锁'
				}
			},
			getCoupon:function(item){
				if (item.state == 1) {
					pub.vipTempId = item.id;
					pub.ticket.get_vip_cou_tem.init();
				}
			}
			
	    }
	});
	pub.creatDataModule = {
		couponInfo:function(type,arr){
			if (type && arr) {
				pub.Vue.couponInfo[type] = arr
			}
			pub.Vue.coupon = {
				type:type,
				name:pub.Vue.vipNav[type-1]['name'],
				list:arr,
			}
		}
	}
	pub.ticket = {
		init:function(){
			pub.ticket.vip_cou_tem_list.init();
		},
		api:function(){
			common.ajaxPost($.extend(pub.userBasicParam,{
				method:pub.method[1],
				firmId:pub.firmId
			}),function(data){
				if (data.statusCode == "100000") {
					
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		vip_cou_tem_list:{
			init:function(){
				common.ajaxPost($.extend(pub.userBasicParam,{
					method:"vip_cou_tem_list",
					firmId:pub.firmId,
					type:pub.type
				}),function(data){
					if (data.statusCode == "100000") {
						pub.ticket.vip_cou_tem_list.apiData(data)
					}else{
						common.prompt(data.statusStr)
					}
				})
			},
			apiData:function(v){
				var v = v.data;
				pub.creatDataModule.couponInfo(pub.type,v);
			}
		},
		get_vip_cou_tem:{
			init:function(){
				common.ajaxPost($.extend(pub.userBasicParam,{
					method:"get_vip_cou_tem",
					firmId:pub.firmId,
					vipTempId:pub.vipTempId
				}),function(data){
					if (data.statusCode == "100000") {
						pub.ticket.get_vip_cou_tem.apiData(data)
					}else{
						common.prompt(data.statusStr)
					}
				})
			},
			apiData:function(v){
				var v = v.data;
				pub.creatDataModule.couponInfo(pub.type,v);
			}
		}
	}
	pub.ticket.eventHeadle = {
		init:function(){
			//点击返回按钮
			$('.header_left').on('click',function(){
				window.history.back();
			});
			$(window).load(function(){
				common.jsadd();
			});
			common.fadeIn();
		}
	}
	
	pub.init = function(){
		pub.ticket.init();
		pub.ticket.eventHeadle.init();
	}
	pub.init();
})