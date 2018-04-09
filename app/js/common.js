//请求地址公用 获取tokenId公用
var common={
	http:"http://app.guoss.cn/gss_api/server/api.do",
	//http:"http://61.164.118.197:8090/gssapi/server/api.do",
	//http:"http://61.164.113.199:8081/gss_api/server/api.do",
	websiteNode:'3301',//请求的站点
	pageSize:'10',//请求商品每页的个数
	pageNo:'1',
	isalert:0,//自动登录时是否弹出异常信息
	isColl:'-1',//判断是否收藏  默认为-1
	isTrue:true,
	dtd : $.Deferred(),
	phoneNumberReg:/^(1)\d{10}$/,//判断手机号的正则表达式
	stopEventBubble:function (event){
		var e=event || window.event;
		if (e && e.stopPropagation){
			return e.stopPropagation();
		}
		else{
			return e.cancelBubble=true;
		}
	},
	appid:{
		"3301":'wx4e26ee7446c5aa37',
		"3201":'wx6a8d195d6acf1614',
		"3302":'wx8cc1a343dd5c87ac',
	},
	websitData:{
		"3201":"南京站",
		"3301":"杭州站",
		'3302':'宁波站'
	},
	httpData:{
		"3301":"http://wxhz.guoss.cn/html/login.html",
		"3201":"http://wxnj.guoss.cn/html/login.html",
		"3302":"http://wxnb.guoss.cn/html/login.html"
	},
	jumpwx:function(callbackUrl){
		window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+common.appid[common.websiteNode]+"&redirect_uri="+callbackUrl+"&response_type=code&scope=snsapi_userinfo&state=gss&connect_redirect=1#wechat_redirect"
	},
	back:function(){
		if (common.websiteNode == "3301") {
			return "http://wxhz.guoss.cn/html/login.html"
		}else if(common.websiteNode =="3201") {
			return "http://wxnj.guoss.cn/html/login.html"
		}else if(common.websiteNode == "3302") {
			return "http://wxnb.guoss.cn/html/login.html"
		}
	},
	jump:function(url){
		if ((url == "html/login.html" || url == "login.html") && common.isWeiXin() && !localStorage.getItem("openid")) {
			window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+common.appid[common.websiteNode]+"&redirect_uri="+common.httpData[common.websiteNode]+"&response_type=code&scope=snsapi_userinfo&state=gss&connect_redirect=1#wechat_redirect"
		}else{
			window.location.href = url+"?v=0.1";
		}
	},
	getUrlParam:function  ( mid ) {
        var reg = new RegExp("(^|&)" + mid + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) 
        	return decodeURIComponent(r[2]); 
        return null;
   	},
	isPc:function(){//检测运行环境 1-移动设备 2-pc设备
		var sUserAgent = navigator.userAgent.toLowerCase();
        var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
        var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
        var bIsMidp = sUserAgent.match(/midp/i) == "midp";
        var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
        var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
        var bIsAndroid = sUserAgent.match(/android/i) == "android";
        var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
        var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
        if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
            return 1;
        } else {
            return 2;
        }
	},
	// 判断是否为移动设备
	isPhone : function(){
		var 
		ua = navigator.userAgent.toLowerCase(),
        bIsIpad = ua.match(/ipad/i) == "ipad",
        bIsIphoneOs = ua.match(/iphone os/i) == "iphone os",
        bIsMidp = ua.match(/midp/i) == "midp",
        bIsUc7 = ua.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
        bIsUc = ua.match(/ucweb/i) == "ucweb",
        bIsAndroid = ua.match(/android/i) == "android",
        bIsCE = ua.match(/windows ce/i) == "windows ce",
        bIsWM = ua.match(/windows mobile/i) == "windows mobile";

	    return bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM;
	},
	isMobile:function(){//检测运行环境 android/ios
		var sUserAgent = navigator.userAgent.toLowerCase();
        var Android = sUserAgent.match(/Android/i) ? true : false;
        var Ios = sUserAgent.match(/iPhone|iPad|iPod/i) ? true : false;
        if (Android) {
            return 1;
        } else if(Ios) {
            return 2;
        }else{
        	return -1;
        }
	},
	// 判断环境是否为微信
	isWeiXin : function(){
		return navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';
	},
	height:function(){
		return 
	},
	callback:function(obj){
		if(typeof obj == "undefined"){
			window.history.go(-1);
		}else if(typeof obj == "object"){
			obj.on('click',function(){
				window.history.go(-1);
			})	
		}
	},
	tokenId:function(){
		return localStorage.getItem("tokenId");
	},
	secretKey:function(){
		return localStorage.getItem('secretKey');
	},
	user_data:function(data){
		if (localStorage.getItem('user_data')) {
			return user_data={
				cuserInfoid:JSON.parse(localStorage.getItem('user_data')).cuserInfoid,
				firmInfoid:JSON.parse(localStorage.getItem('user_data')).firmInfoid,
				firmName:JSON.parse(localStorage.getItem('user_data')).firmName,
				linkTel:JSON.parse(localStorage.getItem('user_data')).linkTel,
				score:JSON.parse(localStorage.getItem('user_data')).score,
				next:JSON.parse(localStorage.getItem('user_data')).next,
				userGrade:JSON.parse(localStorage.getItem('user_data')).userGrade,
				websiteNode:JSON.parse(localStorage.getItem('user_data')).websiteNode,
				faceImgUrl:JSON.parse(localStorage.getItem('user_data')).faceImgUrl,
				websiteNodeName:JSON.parse(localStorage.getItem('user_data')).websiteNodeName
			}
		}else{
			return 0;
		}
		
	},
	prompt:function(str){
		var ele=document.createElement('div');
		ele.className='prompt';
		document.body.appendChild(ele)
		$('.prompt').html(str);
		$('.prompt').css({'left':'50%'});
		$('.prompt').css("margin-left",-(($('.prompt').width())/2)+'px');
		setTimeout(function(){
			$('.prompt').css("margin-left",-($('.prompt').width()/2 + 20)+'px');
		},10)
		$('.prompt').show().animate({
			'bottom':'100'
		},300)
		setTimeout(function(){
			$('.prompt').remove()
		},2000)
	},
	autoLogin:function(){
		$.ajax({
			url:common.http,
	        type:"post",
	        dataType:"jsonp",
	        data:{
				method:'user_login',
				tokenId:common.tokenId
			},
			success:function(data){
				if (data.statusCode=='100000') {
					var v = data.data,m = data.data.firmInfo;
					var user_data={
						cuserInfoid:v.cuserInfo.id,
						firmInfoid:m.id,
						firmName:m.firmName,
						linkTel:m.linkTel,
						score:m.score,
						next:m.next,
						userGrade:m.userGrade,
						websiteNode:m.websiteNode,
						faceImgUrl:m.faceImgUrl,
						websiteNodeName:m.websiteNodeName
					};
					sessionStorage.setItem("isAuto","true");
					localStorage.setItem("user_data",JSON.stringify(user_data));
					localStorage.setItem("tokenId",v.tokenId);
					localStorage.setItem("secretKey",v.secretKey);
				} else{
					var openid = localStorage.getItem("openid");
					localStorage.clear();
					localStorage.setItem("openid",openid);
				}
			},
			error:function(data){
				var openid = localStorage.getItem("openid");
				localStorage.clear();
				localStorage.setItem("openid",openid);
				common.prompt(str)
			}
		})
	},
	//判断返回是否登录
	getIslogin:function(){
		if (localStorage.getItem("tokenId")) {
			return true;
		} else{
			return false;
		}
	},
	txq:function(obj,good_sta){
		obj.on("click",function(){
			//common.stopEventBubble()
			var goodsId=$(this).attr("data");
			sessionStorage.setItem("goodsId",goodsId);
			if (good_sta == 1) {
				window.location.href="html/goodsDetails.html?v=0.1"
			}else{
				window.location.href="goodsDetails.html?v=0.1";
			}
		})
	},
	/*点击选好了按钮请求成功的回调函数*/
	settlement_cart:function(goodsList,firmId,sign,source,sta){
		$.ajax({
			url:common.http,
	        dataType:"jsonp",
	        data:{
				method:'settlement_shop_cart',
				goodsList:goodsList,
				firmId:firmId,
				tokenId:common.tokenId(),
				sign:sign,
				source:source
			},
			success:function(data){
				if (data.statusCode=='100000') {
					sessionStorage.setItem('address',JSON.stringify(data.data));
					sessionStorage.setItem("sta",sta)
					window.location.href='order_settlement.html?v=0.1';
				}else if (data.statusCode=='100903' || data.statusCode=='100907') {
					var orderResult={
						statusCode:data.statusCode,
						orderCode:data.data.orderCode
					}
					sessionStorage.setItem('orderResult',JSON.stringify(orderResult));
					window.location.href='order_result.html?v=0.1'
				}else{
					$(".footer-rigth").addClass("true");
					common.prompt(data.statusStr)
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		});
	},
	/*存储系统常量*/
	//获取系统常量
	get_System:function (websiteNode){
		$.ajax({
			url:common.http,
	        dataType:"jsonp",
	        data:{
				method:'system_config_constant',
				websiteNode:websiteNode
			},
			success:function(data){
				if (data.statusCode=='100000') {
					sessionStorage.setItem("system",JSON.stringify(data.data))
					common.dtd.resolve();
				}else{
					common.prompt(data.statusStr)
				}
			},
			error:function(data){
				common.prompt(data.statusStr)
			}
		})
	},
	alert_show:function(data){
		var html='';
		html +='<div id="logistic_show">'
		html +='	<div class="logistic_show_header">'
		html +='		<h3 class="logistic_show_title">'+data.data.title+'</h3>'
		html +='		<span class="logistic_back sprite delete_b"></span>'
		html +='	</div>'
		html +='	<div class="logistic_show_main">'
		html +='		<div class="logistic_show_text">'+((data.data.desc).toString()).replace(/\r\n/g, "<br/>")+'</div>'
		html +='	</div>'
		html +='	<div class="logistic_show_footer">by:果速送平台</div>'
		html +='</div>'
		html +='<div class="my_bg show"></div>'
		$('body').append(html);
		common.mshow = $("#logistic_show");
		common.mbg = $(".my_bg");
		if (common.isMobile() > 0) {
			$("#logistic_show").css({'height':'70%','top':'15%','margin-top':'0'}).find(".logistic_show_header").css("height","10%").end().find('.logistic_show_main').css('height','80%').end().find('.logistic_show_footer').css('height','10%');
		};
		$(".my_bg,.logistic_back").on("click",function(){
			$(".my_bg,.logistic_back").off("click")
			$(".my_bg,#logistic_show").remove();
		})
	},
	jsadd:function(s){
		if (!common.isPhone()) {
			var script = document.createElement('script');
			script.type="text/javascript";
			script.src= s ||"../quote/style_pc.js";
			var body = document.getElementsByTagName("body")[0];
			body.appendChild(script);
		}
	},
	fadeIn : function( el, t, fn ){
		el = el || 'body';
		t = t || 300;
		fn = typeof fn === 'function' ? fn : undefined;
		$( el ).fadeIn( t, fn );
	},
}
// 全局设置ajax请求
$.ajaxSetup({
	url: common.http,
	type: 'POST',
	dataType: 'jsonp'
});
// 统一接口处理函数
common.ajaxPost = function(data, done, fail){
	done = typeof done !== 'function' ? function( d ){} : done;
	fail = typeof fail !== 'function' ? function( d ){common.prompt(d.statusStr);} : fail;
	$.ajax({
		data : data,
		success : done,
		error : fail
	});
};