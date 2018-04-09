$(document).ready(function(){
	var pub = {};
	$.extend(pub,{
		logined : common.getIslogin(),
		method:['user_logout',"user_personal_msg",'firm_info_update_faceimgurl'],
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
	pub.person = {
		init:function(){
			pub.person.loginStyle();
			if (pub.logined) {
				pub.person.api();
			}
		},
		api:function(){
			common.ajaxPost($.extend(pub.userBasicParam,{
				method:pub.method[1],
				firmId:pub.firmId
			}),function(data){
				if (data.statusCode == "100000") {
					var $wotop = $(".wo_top"),v = data.data;
					if (!pub.data.faceImgUrl) {
						$wotop.find('.tp').attr('src','../img/Icon@2x.png');
					} else{
						$wotop.find('.tp').attr('src','http://'+v.faceImgUrl);
					}
					$wotop.find(".jf").html("ID:"+v.id).end().find('.zh').html(v.firmName).end().find(".sz").html(v.linkTel);
					$wotop.find(".lv .lv_num").html(v.note)//v.userGrade.substring(2,3)
					$wotop.find(".xs span").eq(0).html("经验值: ").end().eq(1).html(v.score+"/"+v.next).end().eq(2).html("果币: ").end().eq(3).html(v.surplusScore);;
					
				}else{
					common.prompt(data.statusStr)
				}
				if (sessionStorage.getItem("new_msg") == "true") {
					var span = $("<span></span>")
					span.addClass("new_msg")
					$(".footer1 dl").eq(3).find("dt").append(span);
				}else{
					pub.person.getmessage();
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
		out:function(){
			common.ajaxPost($.extend(pub.userBasicParam,{
				method:pub.method[0]
			}),function(data){
				if (data.statusCode=='100000') {
					pub.openid = localStorage.getItem("openid");
					localStorage.clear();
					localStorage.setItem("openid",pub.openid);
					pub.logined = false;
					pub.person.loginStyle();
				} else{
					common.prompt(data.statusStr);
				}
			})
		},
		addLog:function(data){
			pub.src=data.bucket_name+".b0.upaiyun.com"+data.path;
			pub.person.heade_pic()
		},
		heade_pic:function(){
			common.ajaxPost($.extend(pub.userBasicParam,{
				method:pub.method[2],
				firmId:pub.firmId,
				faceImgUrl:pub.src
			}),function(data){
				if (data.statusCode=='100000') {
					var a =$.extend(pub.data,{
						faceImgUrl:data.data.faceImgUrl
					});
					localStorage.setItem("user_data",JSON.stringify(a));
				} else{
					common.prompt(data.statusStr);
				}
			})
		},
		loginStyle:function(){
			if (pub.logined) {
				$('.login_type1').removeClass("hidden");
				$("#file").css("display","inline-block");
				if (sessionStorage.getItem("newmsg") == 'true') {
					var span = $("<span></span>")
					span.addClass("new_msg")
					$(".footer1 dl").eq(3).find("dt").append(span);
				}
			} else{
				$("#file").css("display","none");
				$('.login_type2').addClass("show");
				$('.login_type1').addClass("hidden");
				$('.cont1 dl').attr('data',"login.html");
				$('.footer1 dl').eq(3).attr('data',"login.html")
			}
			//if (pub.issystem) {
				$('.conm .bd').html('&nbsp;&nbsp;&nbsp;'+pub.system.feedback_method);
				$('.conm .cont_conm_phone').attr('href','tel:'+pub.system.feedback_method)
			//}
			
		}
	}
	pub.person.eventHeadle = {
		init:function(){
			//点击返回按钮
			$('.header_back').on('click',function(){
				common.jump("../index.html")
				/*window.location.href='../index.html?v=0.1'*/
			});
			$("#file").on('change',function(){
				var tar = this,
				files = tar.files,
				fNum = files.length,
				URL = window.URL || window.webkitURL;
				if(!files[0])return;
				console.log(this)
				for(var i=0;i<fNum;i++){
					if(files[i].type.search(/image/)>=0){
						var blob = URL.createObjectURL(files[i]);
						document.getElementsByClassName('tp')[0].src=blob;
					}
				};
				var ext = '.' + document.getElementById('file').files[0].name.split('.').pop();
				var config = {
					bucket: 'zhangshuoinfo',
					expiration: parseInt((new Date().getTime() + 3600000) / 1000),
					// 尽量不要使用直接传表单 API 的方式，以防泄露造成安全隐患
					form_api_secret: 'LaubRPoyoLzq9tJ82/z+RSmFUVY='
				};
				var instance = new Sand(config);
				var options = {
					'notify_url': 'http://zhangshuoinfo.b0.upaiyun.com'
				};
				instance.setOptions(options);
				instance.upload( + parseInt((new Date().getTime() + 3600000) / 1000) + ext);
			});
			document.addEventListener('uploaded', function(e) {
				pub.person.addLog(e.detail);
			});
			$('.tt').on('click',function(){
				pub.person.out();
			});
			$('.jr').on('click',function(){
				common.jump("login.html")
			});
			/*$(".lv").on("click",function(){
				common.jump("fruit_ranking.html")
			})*/
			$('.cont1').on('click','dl',function(){
				common.jump($(this).attr("data"))
			});
			$('.footer1 dl').on('click',function(){
				$(this).is('.no') && common.jump($(this).attr("data"))
			})
			$(".header_write").on("click",function(){
				common.jump("Business_Infor.html")
				/*window.location.href='Business_Infor.html?v=0.1';*/
			});
			$(window).load(function(){
				common.jsadd();
			});
			common.fadeIn();
		}
	}
	
	pub.init = function(){
		var $det = $.Deferred();
		if (!pub.issystem) {
			common.dtd.done(function(){
				pub.system = JSON.parse(sessionStorage.getItem("system"));
				pub.person.init();
			})
			common.get_System(common.websiteNode);
			/*$.when(common.get_System(common.websiteNode)).done(function(){
				pub.system = JSON.parse(sessionStorage.getItem("system"));
				console.log(pub.system)
			}).done(function(){
				pub.person.init();
			})*/
		}else{
			pub.person.init();
		}
		pub.person.eventHeadle.init();
	}
	pub.init();
})