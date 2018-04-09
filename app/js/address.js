$(document).ready(function(){
	var pub = {};
	$.extend(pub,{
		websiteNode : common.websiteNode,
		logined : common.getIslogin(),
		tokenId : common.tokenId(),
		
	});
	if( pub.logined ){
		pub.userId = common.user_data().cuserInfoid;
		pub.firmId = common.user_data().firmInfoid;
		pub.source = "firmId" + pub.firmId;
		pub.sign = md5( pub.source + "key" + common.secretKey() ).toUpperCase();
		pub.isorder = sessionStorage.getItem('ISaddress') ? true : false;
	};
	pub.address = {
		init:function(){
			pub.address.api();
			pub.address.api0();
			pub.address.eventHeadle.init();
			common.jsadd();
		},
		api:function(){
			common.ajaxPost({
				method:'user_address_show',
				firmId:pub.firmId,
				tokenId:pub.tokenId,
				sign:pub.sign,
				source:pub.source
			},function(data){
				if (data.statusCode == "100000") {
					$(".address_main").find("li").remove();
					pub.address.address_show(data);
					$(".address_main_wrap").data(data.data);
				}else{
					common.prompt(data.statusStr)
				}
			})
		},
		//设置默认地址
		default_data:function (){
			common.ajaxPost({
				method:'user_address_default',
				firmId:pub.firmId,
				addressId:pub.addressId,
				tokenId:pub.tokenId,
				sign:pub.sign,
				source:pub.source
			},function(data){
				if (data.statusCode=='100000') {
					pub.address.api();
				} else{
					common.prompt(data.statusStr)
				}
			})
		},
		address_show:function(data){
			var html='',v = data.data;
			for (var i in v) {
				html+= '<li addId="'+v[i].id+'" class = "'+pub.isorder+'" data = '+(JSON.stringify(v[i]).toString()).replace(/\s/g, "")+' >'
				html+= '	<dl class="address_top clearfloat">'
				if (v[i].isDefault=='1') {
					html+= '	<dt class="sprite_login icon_chosen">'
				} else{
					html +='	<dt>'
				}
				html+= '		</dt>'
				html+= '		<dd>'
				html+= '			<div class="address_top_box clearfloat">'
				html+= '				<div class="address_top_name">'+v[i].receiverName+'</div>'
				html+= '				<div class="address_top_phone">'+v[i].receiverMobile+'</div>'
				html+= '			</div>'
				html+= '			<p>'+v[i].allAddr+'</p>'
				html+= '		</dd>'
				html+= '	</dl>'
				html+= '	<div class="address_bottom">'
				if (v[i].isDefault==1) {
					html+= '		<button class="address_bottom_left" data_id="'+v[i].id+'">默认</button>'
				} else{
					html+= '		<button class="address_bottom_left" data_id="'+v[i].id+'">设为默认</button>'
				}
				html+= '		<button class="address_bottom_right">编辑</button>'
				html+= '	</div>'
				html+= '</li>'
			}
			$('.address_main').append(html)
		},
		api0:function(){
			common.ajaxPost({
				method:'get_pcc',
				firmId:pub.firmId,
				websiteNode:pub.websiteNode,
				tokenId:pub.tokenId,
				sign:pub.sign,
				source:pub.source
			},function(data){
				if (data.statusCode == "100000") {
					pub.address.newLArea(data.data)
				}
			})
		},
		newLArea:function(LAreaData){
			var area1 = new LArea();
			area1.init({
				'trigger': '#province', //触发选择控件的文本框，同时选择完毕后name属性输出到该位置
				'valueTo': '#value1', //选择完毕后id属性输出到该位置
				'keys': {
					id: 'code',
					name: 'name'
				}, //绑定数据源相关字段 id对应valueTo的value属性输出 name对应trigger的value属性输出
				'type': 1, //数据源类型
				'data': LAreaData //数据源
			});
			area1.value=[0,0,0];//控制初始位置，注意：该方法并不会影响到input的value
		},
		Style:function(tit){
			var t = (tit == "新增地址") ? '确定' : '新增地址'; 
			$(".address_header_right").html(t)
			if (tit == "新增地址") {
				$(".address_header_right").html(t)
				$(".address_main").hide();
				$(".edit_box").fadeIn(200);
			}else if(tit == "确定"){
				$(".edit_box").hide();
				$(".address_main").fadeIn(200);
			}
			$('.address_del').show();
			if (pub.addInfo) {
				pub.addressId = pub.addInfo.id;
				$('#edit_name').val(pub.addInfo.receiverName);
				$('#edit_phone').val(pub.addInfo.receiverMobile);
				$('#edit_county').val(pub.addInfo.address);
				$("#province").val(pub.addInfo.allAddr.toString().substring(0,pub.addInfo.allAddr.toString().indexOf(pub.addInfo.address)))
				$("#value1").val(pub.addInfo.provinceId+','+pub.addInfo.cityId+','+pub.addInfo.countyId)
			}else{
				pub.addressId ='';
				$('#edit_name,#edit_phone,#edit_county,#province,#value1').val('');
				$('.address_del').css('display','none');
			}
		},
		del:function(){
			common.ajaxPost({
				method:'user_address_del',
				addressId:pub.addressId,
				tokenId:pub.tokenId,
				sign:pub.sign,
				source:pub.source
			},function(data){
				if (data.statusCode=='100000'){
					window.location.reload(true);
				} else{
					common.prompt(data.statusStr);
				}
			});
		},
		update:function(){
			common.ajaxPost({
				method:'user_address_update',
				firmId:pub.firmId,
				addressId:pub.addressId,
				receiverName:pub.receiverName,
				receiverMobile:pub.receiverMobile,
				countyId:pub.countyId,
				address:pub.addressInner,
				tokenId:pub.tokenId,
				sign:pub.sign,
				source:pub.source
			},function(data){
				if (data.statusCode=='100000'){
					window.location.reload(true);
				} else{
					common.prompt(data.statusStr)
				}
			});
		},
		switchAddress:function(node1,node2,tit){
			$(".header_right").html(tit);
			$( node1 ).fadeOut(100,function(){
				$( node2 ).fadeIn(200);
			});
		}
	}
	
	pub.address.eventHeadle = {
		init:function(){
			//点击新增地址跳转编辑页面
			$('.address_header_right').on('click',function(){
				var ishide = $('.address_edit_box').is(":hidden");
				var t = $(this).html();
				if(t == "新增地址"){
					pub.addInfo = null;
					pub.addressId = null;
					$('#edit_name').val(""),$('#edit_phone').val(""),$('#edit_county').val(''),$("#province").val(""),$("#value1").val("");
					$(".address_del").addClass("hidden");
					pub.address.switchAddress(".address_box",".address_edit_box","确定");
				}else if(t == "确定"){
					pub.countyId = $("#value1").val().split(',').pop();
					pub.receiverName = $('#edit_name').val();
					pub.receiverMobile = $('#edit_phone').val();
					pub.addressInner=$('#edit_county').val();
					if (pub.receiverName == '') {
						common.prompt('收货人姓名为空')
					} else if (pub.receiverMobile == '') {
						common.prompt('收货人号码为空')
					} else if (pub.addressInner == '') {
						common.prompt('请填写详细地址')
					} else{
						pub.address.update();
					}
				}
			});
			$('.address_del').on('click',function(){
				layer.open({
				    content: '您确定要删除地址吗？',
				    btn: ['确定', '取消'],
				    yes: function(index){
						pub.address.del();
						layer.close(index);
				    }
				});
			});
			//设为默认
			/*$(".address_main").on('click','.address_bottom_left',function(e){
				common.stopEventBubble(e)
				if($(this).text()!='默认'){
					pub.addressId=$(this).attr('data_id');
					pub.address.default_data();
				}
			})*/
			//跳转编辑页面   存储信息
			/*$(".address_main").on('click',".address_bottom_right",function(e){
				e.stopPropagation(e);
				pub.addInfo = JSON.parse($(this).parent().parent().attr('data'));
				pub.addressId = pub.addInfo.id;
				$('#edit_name').val(pub.addInfo.receiverName);
				$('#edit_phone').val(pub.addInfo.receiverMobile);
				$('#edit_county').val(pub.addInfo.address);
				$("#province").val(pub.addInfo.allAddr.toString().substring(0,pub.addInfo.allAddr.toString().indexOf(pub.addInfo.address)))
				$("#value1").val(pub.addInfo.provinceId+','+pub.addInfo.cityId+','+pub.addInfo.countyId);
				$(".address_del").removeClass("hidden");
				pub.address.switchAddress(".address_box",".address_edit_box","确定");
			});*/
			$(".header_left").on('click',function(){
				var ishide = $(".address_edit_box").is(":hidden");
				ishide && common.callback()
				!ishide && pub.address.switchAddress(".address_edit_box",".address_box","新增地址");
			})
			$("#province").on("focus",function(){
				$(this).blur();
			})
			$(".address_main").on('click','.address_bottom_left',function(e){
				common.stopEventBubble(e)
				if($(this).text()!='默认'){
					pub.addressId=$(this).attr('data_id');
					pub.address.default_data();
				}
			})
			$(".address_main").on('click',".address_bottom_right",function(e){
				e.stopPropagation(e);
				pub.addInfo = JSON.parse($(this).parent().parent().attr('data'));
				pub.addressId = pub.addInfo.id;
				$('#edit_name').val(pub.addInfo.receiverName);
				$('#edit_phone').val(pub.addInfo.receiverMobile);
				$('#edit_county').val(pub.addInfo.address);
				$("#province").val(pub.addInfo.allAddr.toString().substring(0,pub.addInfo.allAddr.toString().indexOf(pub.addInfo.address)))
				$("#value1").val(pub.addInfo.provinceId+','+pub.addInfo.cityId+','+pub.addInfo.countyId);
				$(".address_del").removeClass("hidden");
				pub.address.switchAddress(".address_box",".address_edit_box","确定");
			});
			$('.address_main').on('click',"li",function(){
				if ($(this).is(".true")) {
					var obj= {
						'address':JSON.parse($(this).attr("data")),
						'postCost':JSON.parse(sessionStorage.getItem('address')).postCost
					};
					var str=JSON.stringify(obj)
					sessionStorage.setItem('address',str);
					sessionStorage.removeItem("ISaddress");
					/*common.jump("order_settlement.html")*/
					window.location.href = "order_settlement.html?v=0.2";
				}
			});
			common.fadeIn()
		}
	}
	pub.init = function(){
		pub.address.init();
	}
	
	pub.init()
	
})