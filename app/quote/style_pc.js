$(document).ready(function(){
	/*var obj=((typeof $('.main').width())==Number?$('.main'):(typeof $('.moreDoogs_main_box').width())==Number?$('.moreDoogs_main_box'):)
	console.log($('.main').width())*/
	var obj;
	//console.log((typeof $('.main').width())=='number')
	if ((typeof $('.main').width())=='number') {
		obj=$('.main')
	} else if((typeof $('.moreDoogs_main_box').width())=='number'){
		obj=$('.moreDoogs_main_box')
	} else if((typeof $('.address_main').width())=='number'){
		obj=$('.address_main')
	} else if((typeof $('.edit_main').width())=='number'){
		obj=$('.edit_main')
	} else if((typeof $('.main-wrap').width())=='number'){
		obj=$('.main-wrap')
	}
	//console.log(obj.width())
	$('.header-wrap').css('left','50%')
	$('.header-wrap').css('margin-left',-(obj.width()/2))
	$('.footer-wrap').css('left','50%')
	$('.footer-wrap').css('margin-left',-(obj.width()/2));
	if ($('.moreDoogs_main_wrap')) {
		$('.moreDoogs_main_wrap').css('left','50%')
		$('.moreDoogs_main_wrap ').css('margin-left',-(obj.width()/2));
		/*$('.moreDoogs_main_box ').css('left','50%')
		$('.moreDoogs_main_box ').css('margin-left',-(obj.width()/2));
		$('.moreDoogs_main_top').css('left','50%')
		$('.moreDoogs_main_top').css('margin-left',-(obj.width()/2));*/
		
	}
})