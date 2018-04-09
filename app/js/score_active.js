$(document).ready(function(){
	var pub = {};
	var d = 0,a = null,b = null,n = null;//d表示元素目前上边的角度，a表示每次后台返回计算的转动角度，b 是实际需要转动的角度，最终输出为n
	$.extend(pub,{
		isPhone:common.isPhone(),
		isMobile:common.isMobile(),
		isWX:common.isWeiXin(),
		list : '',	
		turnplate :{
			index:[],
			lucky:[],//大转盘奖品名称
		 	luckyInfo:[],//奖品内容
		 	colors:[],//大转盘奖品区块对应背景颜色
		 	goodsimgArr:[],//奖品图片页面标签
		 	outsideRadius:140,//大转盘外圆的半径
		 	textRadius:100,//大转盘奖品位置距离圆心的距离
		 	insideRadius:34,//大转盘内圆的半径
		 	startAngle:0,//开始角度
		 	bRotate:false//false:停止;ture:旋转
		},
		websiteNodeDate:{
			"3301":"杭州",
			"3201":"南京",
			"3302":"宁波"
		}
	});
	if (pub.isPhone && !pub.isWX) {
		if (pub.isMobile == 1) {
			$(".header-wrap,.empty").addClass("hidden");
			try{
				var v = android.getMessage();
				v = JSON.parse(v);
				console.log(v);
				pub.tokenId = v.tokenId;
				pub.websiteNode = v.websiteNode;
				pub.firmId = v.firmId;
				pub.source = 'firmId'+v.firmId;
				pub.sign = md5('firmId'+v.firmId+"key"+v.secretKey).toUpperCase();
			}catch(e){
				pub.tokenId = common.tokenId();
				pub.websiteNode = common.websiteNode;
				pub.firmId = common.user_data().firmInfoid;
				pub.source = 'firmId'+common.user_data().firmInfoid;
				pub.sign = md5('firmId'+common.user_data().firmInfoid+"key"+common.secretKey()).toUpperCase();
				console.log("调用android方法出错")
			}
		}else if(pub.isMobile == 2){
			
			$(".header-wrap,.empty").addClass("hidden");
			try{
				//var v = window.webkit.messageHandlers.getMessage.postMessage();
				//	window.webkit.messageHandlers. Share.postMessage(null);
				var v = getMessage();
				v = JSON.parse(v);
				pub.tokenId = v.tokenId;
				pub.websiteNode = v.websiteNode;
				pub.firmId = v.firmId;
				pub.source = 'firmId'+v.firmId;
				pub.sign = md5('firmId'+v.firmId+"key"+v.secretKey).toUpperCase();
			}catch(e){
				pub.tokenId = common.tokenId();
				pub.websiteNode = common.websiteNode;
				pub.firmId = common.user_data().firmInfoid;
				pub.source = 'firmId'+common.user_data().firmInfoid;
				pub.sign = md5('firmId'+common.user_data().firmInfoid+"key"+common.secretKey()).toUpperCase();
				console.log("调用IOS方法出错")
			}	
		}
	}else{
		pub.tokenId = common.tokenId();
		pub.websiteNode = common.websiteNode;
		pub.firmId = common.user_data().firmInfoid;
		pub.source = 'firmId'+common.user_data().firmInfoid;
		pub.sign = md5('firmId'+common.user_data().firmInfoid+"key"+common.secretKey()).toUpperCase();
	}
	pub.active = {
		init:function(){
			pub.active.api();
		},
		api:function(){
			console.log("firmId"+pub.firmId+"#websiteNode"+pub.websiteNode+"#tokenId"+pub.tokenId+"#sign"+pub.sign+"#source"+pub.source)
			common.ajaxPost({
				method:'draw_prizes_activity',
				firmId:pub.firmId,
				websiteNode:pub.websiteNode,
				tokenId:pub.tokenId,
				sign:pub.sign,
				source:pub.source
			},function(data){
				console.log(JSON.stringify(data));
				if (data.statusCode == "100000") {
					if (data.data.drawPrizesActivitys[0]) {
						pub.active.dataShow(data.data.drawPrizesActivitys[0]);
					}
					pub.active.banner(data.data.scoreUseRcds);
				}
				
			})
		},
		dataShow:function(v){
			//中奖消息轮播
			//转盘
			pub.list = v.prizesList;
			$(".pointer").attr('data',v.id)
			pub.active.setList();
			pub.active.drawRouletteWheel();
			//活动规则等
			$('.score_active_rule .box').html(((v.desc).toString()).replace(/\r\n/g, "<br/>"));
		},
		banner:function(data){
			var html= '';
			var set = data[0].websiteNode;
			console.log(pub.websiteNodeDate[set])
			for (var i=0 in data){
				html += '<li class="swiper-slide swiper-no-swiping" data="'+data[i].goodsId+'" data1="'+i+'">'+data[i].account.replace(data[i].account.substring(3,7),"****")+'的'+pub.websiteNodeDate[set]+'用户获得了'+data[i].goodsName+'</li>'
			}
			$('.gonggao .swiper-wrapper').append(html);
			var mySwiper = new Swiper ('.gonggao', {
			    direction: 'vertical',
			    noSwiping : true,
			    height:50,
			    loop: true,
			    autoplay:4000,
			    spend:2000
			});
		},
		//setlist
		setList:function(){
			$.each(pub.list,function(key, val){
				pub.turnplate.lucky.push(val.prizesName);
				pub.turnplate.index.push(val.id);
				pub.turnplate.luckyInfo.push(val.prizesDesc);
				if(key %2==0){
					pub.turnplate.colors.push("#fbf080");	
				}else{
					pub.turnplate.colors.push("#1dc1ba");						
				}
			});
		},
		//对奖品图片预加载
		preloadimages:function(arr){
			var newimages =[], loadedimages =0
			var postaction =function(){}//此处增加了一个postaction函数
			var arr =(typeof arr !="object")?[arr]: arr
			function imageloadpost(){
				loadedimages++
				if(loadedimages == arr.length){
					postaction(newimages)//加载完成用我们调用postaction函数并将newimages数组做为参数传递进去
				}
			}
			for(var i =0; i < arr.length; i++){
				newimages[i]=new Image()
				newimages[i].src = arr[i]
				newimages[i].onload =function(){
					imageloadpost()
				}
				newimages[i].onerror =function(){
					imageloadpost()
				}
			}
		 	return{//此处返回一个空白对象的done方法
		 		done:function(f){
		 			postaction = f || postaction
		 		}
		 	}
		},
		//绘制转盘
		drawRouletteWheel:function (){
			var canvas = document.getElementById("wheelcanvas");
			var t = new Date();
			console.log(t)
			if(canvas.getContext){
				var v = pub.turnplate;
				console.log(JSON.stringify(v))
			 	//根据奖品个数计算圆周角度
				var arc =Math.PI /(v.lucky.length /2);
				console.log(arc)
				var ctx = canvas.getContext("2d");
				//在给定矩形内清空一个矩形
				ctx.clearRect(0,0,340,340);
				//strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式
				ctx.strokeStyle ="#FF00FF";
			 	//font 属性设置或返回画布上文本内容的当前字体属性
			 	ctx.font ='bold 18px Microsoft YaHei';
			 	for(var i =0; i < v.lucky.length; i++){
			 		//根据当前奖品索引 计算绘制的扇形开始弧度
			 		var angle = v.startAngle + i * arc;
			 		//根据奖品参数 绘制扇形填充颜色
			 		ctx.fillStyle = v.colors[i];
			 		//开始绘制扇形
			 		ctx.beginPath();
			 		//arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）
			 		//绘制大圆
			 		ctx.arc(170,170, v.outsideRadius, angle, angle + arc,false);
			 		//绘制小圆
			 		ctx.arc(170,170, v.insideRadius, angle + arc, angle,true);
			 		ctx.stroke();
			 		ctx.fill();
			 		//锁画布(为了保存之前的画布状态)
			 		ctx.save();
			 		//----绘制奖品开始----
			 		//奖品默认字体颜色
			 		ctx.fillStyle ="#fff";
			 		var text = v.lucky[i];
			 		var lukyname = v.luckyInfo[i];
			 		var line_height =17;
			 		//translate方法重新映射画布上的 (0,0) 位置
			 		ctx.translate(170+Math.cos(angle + arc/2) * v.textRadius,170+Math.sin(angle + arc /2)* v.textRadius);
			 		//rotate方法旋转当前的绘图
			 		ctx.rotate(angle + arc /2+Math.PI /2);
			 		//绘制奖品图片
			 		//var img =new Image();
			 		//img.src = v.goodsimgArr[i];
			 		//由于设计的转盘色块是交错的，所以这样可以实现相邻奖品区域字体颜色不同
			 		if(i %2==0){
			 			ctx.fillStyle ="#f7452f";
			 		}
			 		//将字体绘制在对应坐标
					ctx.fillText(text,-ctx.measureText(text).width /2,0);
					//设置字体
			 		ctx.font =' 14px Microsoft YaHei';
			 		//绘制奖品名称
			 		if(text !="优胜奖"){
			 			ctx.fillText(lukyname,-ctx.measureText(lukyname).width /2,25);
			 		}else{
			 			ctx.fillText("优麦币",-ctx.measureText("优麦币").width /2,25);
			 		}
				 	//把当前画布返回（插入）到上一个save()状态之前
				 	ctx.restore();
				 	ctx.save();
				 	//----绘制奖品结束----
				 }
			}
		},
		draw:function(id){
			common.ajaxPost({
				method:'draw_prizes',
				firmId:pub.firmId,
				drawPrizesActivityId:id,
				tokenId:pub.tokenId,
				sign:pub.sign,
				source:pub.source
			},function(data){
				var v = pub.active,m = data.data,k = pub.turnplate;
				if (data.statusCode == "100000") {
					console.log(k);
					console.log(data.data)
					var item = parseInt(v.getArrayIndex(k.index, m.id));
					//var item = parseInt(v.getArrayIndex(k.lucky, m.prizesName));
					//v.rotateFn(item + 1,"恭喜获得，"+ k.lucky[item]);
					//var item = parseInt(v.getArrayIndex(k.index, m.id));
					console.log(item)
					pub.item = item;
					pub.itemText = m.prizesName;
				}else if(data.statusCode == "100619"){
					k.bRotate =!k.bRotate;
					v.prompt(data.statusStr);
				}else{
					k.bRotate =!k.bRotate;
					$(".item").css({
						'animation-name': '',
						'-moz-animation-name': '',
						'-webkit-animation-name': '',
						'-o-animation-name': '',
					});
					common.prompt(data.statusStr)
				}
			})
		},
		getArrayIndex:function(arr,item){
			for (var i in arr) {
				if (arr[i] == item) {
					return i;
				}
			}					
		},
		//旋转转盘 item:奖品位置; txt：提示语;
		rotateFn : function(item, txt){
			var v = pub.turnplate;
			console.log(item)
		 	//根据传进来的奖品序号 计算相应的弧度
		 	//var angles = item *(360/ v.lucky.length ) - Math.floor( Math.random() * (360 / v.lucky.length ) - 14 );
		 	
		 	var angles = item *(360/ v.lucky.length ) - 360 / (v.lucky.length * 2);
		 	console.log(angles);
		 	if(angles < 270){
		 		angles = 270- angles;
		 	}else{
		 		angles = 360- angles + 270;
		 	}
		 	
		 	//强制停止转盘的转动
		 	$('#wheelcanvas').stopRotate();
		 	//调用转动方法，设置转动所需参数和回调函数
		 	$('#wheelcanvas').rotate({
			 	//起始角度
			 	angle:0,
			 	//转动角度 +1800是为了多转几圈
			 	animateTo: angles +1800,
			 	duration:8000,
			 	callback:function(){
			 		v.bRotate =!v.bRotate;
				 	//pub.active.alert(txt);
			 	}
			 });
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
		},
		/* 
	    * 解析matrix矩阵，0°-360°，返回旋转角度 
	    * 当a=b||-a=b,0<=deg<=180 
	    * 当-a+b=180,180<=deg<=270 
	    * 当a+b=180,270<=deg<=360 
	    * 
	    * 当0<=deg<=180,deg=d; 
	    * 当180<deg<=270,deg=180+c; 
	    * 当270<deg<=360,deg=360-(c||d); 
	     */  
	    getmatrix:function (a,b,c,d,e,f){  
	        var aa=Math.round(180*Math.asin(a)/ Math.PI);  
	        var bb=Math.round(180*Math.acos(b)/ Math.PI);  
	        var cc=Math.round(180*Math.asin(c)/ Math.PI);  
	        var dd=Math.round(180*Math.acos(d)/ Math.PI);  
	        var deg=0;  
	        if(aa==bb||-aa==bb){  
	            deg=dd;  
	        }else if(-aa+bb==180){  
	            deg=180+cc;  
	        }else if(aa+bb==180){  
	            deg=360-cc||360-dd;  
	        }  
	        return deg>=360?0:deg;  
	        //return (aa+','+bb+','+cc+','+dd);  
	    }  

	}
	pub.active.eventHeadle = {
		init:function(){
			$('.score_active_turntable').on('click','.pointer',function(){
				pub.item = undefined;
				var v = pub.turnplate;
				if(v.bRotate)return;
				v.bRotate =!v.bRotate;
				$(".item").addClass("animation_name");
				pub.active.draw($(this).attr('data'))
			});
			$('.header_back').on('click',function(){
				window.history.back();
			});
			$(".item").on('webkitAnimationEnd',function(){
				var deg = eval('pub.active.get'+$(this).css("transform"));//当前元素的角度
				var l = pub.turnplate.lucky.length;
				var a = pub.item *(360/ l );
				//6个奖品
				if (deg == 0) {
					if (a < 240) {
						n = d + 240 - a;
					}else{
						n = d + 240 - a + 360;
					}
				} else if (deg == 60) {
					if (a < 180) {
						n = d + 180 - a;
					}else{
						n = d + 180 - a + 360;
					}
				} else if (deg == 120) {
					if (a < 120) {
						n = d + 120 - a;
					}else{
						n = d + 120 - a + 360;
					}
				} else if (deg == 180) {
					if (a < 60) {
						n = d + 60 - a;
					}else{
						n = d + 60 - a + 360;
					}
				} else if (deg == 240) {
					if (a < 360) {
						n = d + 360 - a;
					}
				} else if (deg == 300) {
					if (a < 300) {
						n = d + 300 - a;
					}else{
						n = d + 300 - a + 360;
					}
				}
				d = n;
				pub.t = setTimeout(function(){
					$(".item").removeClass("animation_name").css({
						"webkitTransform":'rotate('+n+'deg)',
						"MozTransform":'rotate('+n+'deg)',
						"msTransform":'rotate('+n+'deg)',
						"OTransform":'rotate('+n+'deg)',
						"transform":'rotate('+n+'deg)',
					});
				},10)
			});
			$(".item").on('webkitTransitionEnd',function(e){
				clearTimeout(pub.t);
				common.stopEventBubble(e);
				var v = pub.turnplate;
				v.bRotate =!v.bRotate;
				pub.active.alert(pub.itemText);
			});
		}
	};
	pub.init = function(){
		pub.active.init();
		pub.active.eventHeadle.init();
		common.fadeIn()
	}
	pub.init();
})