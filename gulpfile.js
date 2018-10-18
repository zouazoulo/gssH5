var gulp = require ("gulp");

var htmlmini = require("gulp-minify-html");

var htmlmin = require("gulp-htmlmin");

var jsmini = require("gulp-uglify");

var cssmini =  require("gulp-minify-css");

var imgmini = require("gulp-imagemin");

var pngquant = require('imagemin-pngquant'); //png图片压缩插件

var livereload = require("gulp-livereload");

var clean = require("gulp-clean");//清除文件

var concat = require("gulp-concat");//合并文件

var rev = require("gulp-rev");//对文件名加MD5后缀

var revCollector = require("gulp-rev-collector");//路径替换

var processhtml = require('gulp-processhtml');
//文件提取
	var useref = require('gulp-useref');
    var gulpif = require('gulp-if');
    var minifyCss = require('gulp-clean-css');
//自动添加添加css前缀
var autoprefix = require('gulp-autoprefixer');

//使用插件解决命令依赖问题
var runSequence = require("gulp-sequence");



var config = {
	puth:{
		index:['./app/*.html'],
		html:['./app/html/*.html'],
	    js:['./app/js/*.js'],
	    css:['./app/css/*.css'],
	    img:['./app/img/*']
	},
	outputh:{
		index:'./list',
		html:'./list/html',
	    js:'./list/js',
	    css:'./list/css',
	    img:'./list/img'
	},
	index:{
		css:['./app/css/base.css','./app/css/rest.css','./app/css/swiper-3.3.1.min.css'],
		js:['./app/js/jquery-1.8.3.min.js','./app/js/swiper-3.3.1.min.js','./app/js/common.js','./app/js/mdData.js','./app/js/index.js','./app/js/style_pc.js']
	}
}
gulp.task("clean",function(){
	return gulp.src(["./dist","./list",])
		.pipe(clean())
})
gulp.task('html', function () {
	var options = {
        removeComments: true,  //清除HTML注释
        collapseWhitespace: false,  //压缩HTML
        collapseBooleanAttributes: true,  //省略布尔属性的值 <input checked="true"/> ==> <input checked />
        removeEmptyAttributes: true,  //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,  //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,  //删除<style>和<link>的type="text/css"
        minifyJS: true,  //压缩页面JS
        minifyCSS: true  //压缩页面CSS
    };
    return gulp.src('./app/**/*.html')
       .pipe(processhtml())
       //.pipe(htmlmin(options))
       .pipe(gulp.dest('./dist/'));
});
gulp.task("css",function(){
	return gulp.src(['./app/css/base.css', './app/css/rest.css'])
		.pipe(concat('common.css'))
        .pipe(autoprefix())
        .pipe(cssmini())
        .pipe(rev())
        .pipe(gulp.dest('./list/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest("./dist/rev"))
});
gulp.task("rev",function(){
	return gulp.src(["./dist/**/*.json","./dist/**/*.html"])
		.pipe(revCollector())
		.pipe(gulp.dest("./list"))
})
gulp.task('css1',function(){
	return gulp.src('./app/quote/*.css')
    	.pipe(autoprefix())
    	.pipe(cssmini())
    	.pipe(gulp.dest("./list/quote/"))
})
gulp.task('js',function(){
	return gulp.src('./app/js/*.js')
		.pipe(jsmini())
		.pipe(rev())
        .pipe(gulp.dest('./list/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest("./dist/rev1"))
})

gulp.task('js1',function(){
	return gulp.src('./app/quote/*.js')
		.pipe(jsmini())
		.pipe(gulp.dest('./list/quote/'))
})

gulp.task("img",function(){
	return gulp.src('./app/img/*')
		.pipe(imgmini({
            progressive: true,
            use: [pngquant()] //使用pngquant来压缩png图片
        }))
		.pipe(gulp.dest("./list/img"))
})
gulp.task('prod',function(cb){
	runSequence('clean',["html","css","css1","img","js1","js"])(cb)
})

gulp.task('prod1',function(cb){
	runSequence("img","js1","js","rev")(cb)
});

gulp.task('gss', runSequence('clean',
        ['html','css','css1','img','js1','js'],
        'rev')
);
