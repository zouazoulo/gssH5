module.exports = function (grunt) {

    var encoding = { encoding : 'utf-8' };

    grunt.initConfig({
        uglify: {
            my_target: {
                files: [{
                    expand: true,
                    cwd: 'lib',
                    src: '**/*.js',
                    dest: 'dest'
                }]
            }
        },
        cssmin : {
            css : {
                src : 'css/base.css',
                dest : 'css/base.min.css'
            }
        },
        clean : {
            js : {
                src : ['dest']
            },
            css : ['css/base.min.css']
        },
        watch:{
            js:{
                files:['lib/*.js'],
                tasks:['uglify'],
            },
            options: {  
                debounceDelay: 1000  
            },
            css : {
                files:['css/base.css'],
                tasks:['cssmin'],
            }
        },
    });
    var recive = function recive( pathname, reg, pattern ){
        return grunt.file.read( pathname, encoding ).replace( reg, pattern )
    }

    grunt.registerTask('api','adress , type',function( address ,type ){
        var pathname = ['app/js/common.js','dest/join.html','mobile/join_us_from.html','mobile/join.html'];
        //var reg = /[\'|\"](http\:\/\/.+(\/server\/api\.do)[\'|\"]\,.*)/g;
        var reg = /(http).*[\:].*(\/server\/api\.do")[\,].*/g;
        var reg2 = /("3301").*[\:].*("wx4e26ee7446c5aa37"|"wxe92e098badc60fab")[\,].*/g;
        var reg3 = /("3301").*[\:].*(html\/login\.html")[\,].*/g;
        var json = {
            dev : ['http:'+'"http://61.164.113.187:8090/gssapi/server/api.do"',' 测试'],
            loc : ['http:'+'"http://192.168.1.8:8080/grh_api/server/api.do"',' 本地'],
            pro : ['http:'+'"http://app.guoss.cn/gss_api/server/api.do"',' 正式']
        };
        var json2 = {
            dev : ['"3301":'+'"wxe92e098badc60fab"',' 测试'],
            pro : ['"3301":'+'"wx4e26ee7446c5aa37"',' 正式']
        };
        var json3 = {
            dev : ['"3301":'+'"http://testh5.guoss.cn/html/login.html"',' 测试'],
            pro : ['"3301":'+'"http://wxhz.guoss.cn/html/login.html"',' 正式']
        };
        if (!type) {
        	var commonJs = grunt.file.read( pathname[0], encoding );
	            !address ? grunt.log.write( commonJs.match( reg ) ) : grunt.file.write(
	            	pathname[0],
	            	commonJs.replace( reg, json[address][0] + '\, \/\/' + json[address][1])
	            );
	        var commonJs2 = grunt.file.read( pathname[0], encoding );
	            !address ? grunt.log.write( commonJs2.match( reg2 ) ) : grunt.file.write(
	            	pathname[0],
	            	commonJs2.replace( reg2, json2[address][0] + '\, \/\/' + json2[address][1])
	            );
	        var commonJs3 = grunt.file.read( pathname[0], encoding );
	            !address ? grunt.log.write( commonJs3.match( reg3 ) ) : grunt.file.write(
	            	pathname[0],
	            	commonJs3.replace( reg3, json3[address][0] + '\, \/\/' + json3[address][1])
	            );
	        
        }
        
         
    });
	//更新每个HTML下面的seajs保证微信下清除缓存
	/*grunt.registerTask('html','html time',function( time ){
		var pathdir = 'html/';
		var reg = /seajs-config\.js.*?\"/g
		var filebody = '';
		//首页
		filebody = grunt.file.read( 'index.html', encoding ).replace(reg,'seajs-config\.js?v='+time+'\"');
		grunt.file.write( 'index.html', filebody, encoding );
		
		grunt.file.recurse(pathdir, function(abspath){
			filebody = recive(abspath,reg,'seajs-config\.js?v='+time+'\"');
			grunt.file.write( abspath, filebody, encoding );
		})
	});*/
    /*grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');*/
}