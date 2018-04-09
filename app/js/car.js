/**/
(function() {
	function addgood(id, price, name) {
	    //在界面渲染的时候已经把商品信息参数整合到自己的函数中了
	    var contact = new Object(); //单个商品的对象，暂时介质
	    var goodobj = new Object(); //商品对象
	    var memberfilter = new Array(); //商品信息
	    memberfilter[0] = "id";
	    memberfilter[1] = "name";
	    memberfilter[2] = "sum";
	    memberfilter[3] = "price";
	    if (typeof(sessionStorage.good) == "undefined") { //此时没有商品
	        contact.id = parseInt(id);
	        contact.name = name;
	        contact.sum = 1;
	        contact.price = parseInt(price);
	        var good = new Array();
	        var jsonText = JSON.stringify(contact, memberfilter);
	        good[0] = JSON.parse(jsonText);
	        sessionStorage.good = JSON.stringify(good, memberfilter);
	    } else { //有商品，要判断商品在本地是否有存储，有的话sum+1
	        //取数据
	        goodobj = JSON.parse(sessionStorage.good);
	        var con = 0;
	        for (var i in goodobj) {
	            if (goodobj[i].id == id) {
	                goodobj[i].sum = 1 + parseInt(goodobj[i].sum);
	                sessionStorage.good = JSON.stringify(goodobj, memberfilter);
	                con++;
	                break;
	            }
	
	            if (con == 0) { //没有该商品，新建一个进去
	                contact.id = parseInt(id);
	                contact.name = name;
	                contact.sum = 1;
	                contact.price = parseInt(price);
	
	                var jsonText = JSON.stringify(contact, memberfilter);
	                var goolen = goodobj.length;
	                goodobj[goolen] = JSON.parse(jsonText);
	                sessionStorage.good = JSON.stringify(goodobj, memberfilter);
	            }
	
	        }
	    }
	}
	var goodobj = new Object();
	var money = 0;
	var memberfilter = new Array();
	memberfilter[0] = "id";
	memberfilter[1] = "name";
	memberfilter[2] = "sum";
	memberfilter[3] = "price";
	function add(id) {//此方法是带商品id的
		for (var i in goodobj) {//简单的遍历，没有优化
			if (goodobj[i].id == id) {
				goodobj[i].sum = 1 + parseInt(goodobj[i].sum);
				sessionStorage.good= JSON.stringify(goodobj, memberfilter);
				money = parseInt(money) + parseInt(goodobj[i].price);//总价
				break;
			}
		}
	};
	function cut(id) {
		for (var i in goodobj) {
			if (goodobj[i].id == id) {
				goodobj[i].sum = parseInt(goodobj[i].sum) - 1;
				money = parseInt(money) - parseInt(goodobj[i].price);
				if (goodobj[i].sum == 0) {
				    goodobj = goodobj.del(i);//删除此商品
				}
				sessionStorage.good= JSON.stringify(goodobj, memberfilter);
				break;
			}
		}
	};
	goodobj.prototype.del = function (n) {
		if (n < 0) {
			return this;
		}else{
			return this.slice(0, n).concat(this.slice(n + 1, this.length));
		}
	}

})(); 