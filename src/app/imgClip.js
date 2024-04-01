import {doMove} from "./move.js"
/**
 * 
 * @authors dengyuying
 * @date    2024-01-04
 * @version 1.0
 */
let aspectRatio = "vertical"
const AR_VER = 911/686
const AR_HOR = 514/686
// constructor----------------------------------------
const ImgClip = function(opt){
	this.canvas = null; // canvas对象
	this.fileObj = null; // file对象
	this.cutBtn = null; // 触发剪切的按钮对象
	this.resultObj = null; // 输出图片对象
	this.video = null; // 图片 或 视频 长宽

	this.winSize = { w: 300, h: 300}; // canvas大小，正方形

	this.ctx = null;
	this.img = null;
	this.dataURL;
	this.dis = { x:0, y:0};
	this.pre = { x:0, y:0};
	this.prex = this.prey = 0;
	this.flagX = true; // 宽高标记
	this.r = 1; // 图片缩放显示比例
	this.rMax = 1; // 图片缩放显示比例max
	this.rMin = 1/4; // 图片缩放显示比例min
	this.rr = 1;
	this.rDis = 0;
	this.imageSize = {w:0,h:0};
	this.cutSize = {w:0,h:0,t:0,l:0}; // 输出图片大小
	this.cutFast = false; // 快速剪切标记
	this.tstate = 'end'; // 拖拽事件状态
	this.cutScale = 1; // 裁剪区域尺寸比例
	this.cutW = 0; // 裁剪区域宽度
	this.paddB = 0; // 底部工具条高度
	this.rot = 0; // 旋转角度
	this.isRotate = false;
	//this.drawSize = {w:0,h:0};

	opt && this.init(opt);
};

// method----------------------------------------
ImgClip.prototype = {
	init: function(opt) { // 初始化
		if (!opt) { return false;}
		var This = this;

		// save obj
		this.canvas = this.getObj(opt.canvas);
		this.ctx = this.canvas.getContext('2d');
		this.fileObj = this.getObj(opt.fileObj);
		this.cutBtn = this.getObj(opt.cutBtn);
		this.resultObj = this.getObj(opt.resultObj);
		this.video = this.getObj(opt.video);

		// save data
		this.cutScale = parseFloat(opt.cutScale);
		this.winSize = { w: view().w, h: view().h-this.paddB};
		opt.cutW == 'winW' ? (this.cutW = this.winSize.w) : (this.cutW = Number(opt.cutW));
		var hh = parseInt(this.cutW * this.cutScale);
		this.cutSize = {
			w: this.cutW,
			h: hh,
			t: (this.winSize.h - hh)/2,
			l: (this.winSize.w - this.cutW)/2
		};

		// set canvas
		this.setCanvas(this.canvas);
		this.clearCanvas(this.canvas);
		this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		(opt.rotateR) && (this.rotateR = this.getObj(opt.rotateR));

		// 上传图片
		// addEvent(this.fileObj, 'change', function(e){
		// 	if(!e.target.files[0]) return;
		// 	This.r = 1;
		// 	This.rot = 0;
		// 	This.isRotate = false;
		// 	This.run(e,This);
		// });
		
		
	},
	run: function(){ // 运行
		// e = e || window.event;
		let obj = this
		obj.mode = "draw"
		// clear
		obj.pre.x = obj.pre.y = obj.prex = obj.prey = 0;
		// 首次画上图片
		obj.drawImg(0,0,function(){
			obj.tstate = 'ok';
			addEvent(obj.canvas,'touchstart',function(e){
				obj.fntouchstart(e);
				
			});
			addEvent(obj.canvas,'touchmove', function(e){ obj.fntouchmove(e); });
			addEvent(obj.canvas,'touchend', function(e){ obj.fntouchend(e); });
			// addEvent(obj.canvas,'mousedown',function(e){
			// 	obj.fntouchstart(e);
			// 	addEvent(document,'mousemove', function(e){ obj.fntouchmove(e); });
			// 	addEvent(document,'mouseup', function(e){ obj.fntouchend(e); });
			// });
		});
	},
	drawImg: function (offsetX,offsetY,fn){ // 更新画布
		this.clearCanvas(this.canvas);
		this.ctx.fillStyle = '#000';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// 第一次
		if(this.mode === "draw"){
			var This = this;
				This.mode = "move"

			// this.img.onload = function() {
				This.clearCanvas(This.canvas);
				This.ctx.fillStyle = '#000';
				This.ctx.fillRect(0, 0, This.canvas.width, This.canvas.height);
				This.imageSize = {w: This.video.videoWidth, h: This.video.videoHeight};
				let height = This.video.videoHeight
				let width = This.video.videoWidth

				// 处理尺寸
				var tempW = 1, tempH = 1;
				tempH = This.cutSize.h/height;
				tempW = This.cutSize.w/width;
				if(height < This.cutSize.h || width < This.cutSize.w){ // 小
					This.rMin = This.r = tempW > tempH ? tempW : tempH;
				} 
				else if(height > This.canvas.height && width > This.canvas.width){ // 大
					This.rMin = tempW > tempH ? tempW : tempH;
					// tempH = This.canvas.height/height;
					// tempW = This.canvas.width/width;
					This.r = tempW > tempH ? tempW : tempH;
					// This.r = tempW 

				}
				//This.rMax = This.rMin*2;
				This.rMax = Math.max(This.rMin*2,1);
				document.getElementById('log2').innerHTML = 'min='+This.rMin+'--///--max='+This.rMax;

				// // 根据裁切框计算尺寸 *
				// if(width>height) {
				// 	// 短视频
				// 	This.r = This.cutSize.h/height
				// } 
				This.imageSize.w = width * This.r;
				This.imageSize.h = height * This.r;
				offsetX = This.prex = This.pre.x = This.winSize.w/2 - This.imageSize.w/2;
				offsetY = This.prey = This.pre.y = This.winSize.h/2 - This.imageSize.h/2;

				// draw
				This.ctx.save();
				This.ctx.translate(This.canvas.width/2, This.canvas.height/2);
        // ctx.drawImage(video, 0, 0, cH*(vw/vh), cH)
				This.ctx.drawImage(This.video, -This.imageSize.w/2, -This.imageSize.h/2, This.imageSize.w, This.imageSize.h);
        // video.removeEventListener('seeked', timeupdateHandler, false)
				
				This.ctx.restore();
				This.prex = This.pre.x = This.canvas.width/2 - This.imageSize.w/2;
				This.prey = This.pre.y = This.canvas.height/2 - This.imageSize.h/2;
				This.drawUI(This.ctx, This.cutSize);

			// };
			// this.img.src = this.dataURL;
		}
		// 非新打开的图像  移动/放大/坐标回弹
		else {
			this.ctx.save();

			if(this.isRotate){
				if(this.rot == 1 || this.rot == 3){ // 由正常宽高转到反的
					this.ctx.translate(offsetX+this.imageSize.h/2, offsetY+this.imageSize.w/2);
				} else { // 反->正
					this.ctx.translate(offsetX+this.imageSize.w/2, offsetY+this.imageSize.h/2);
				}
				this.ctx.rotate(this.rot*90*Math.PI/180);
				this.ctx.drawImage(video, -this.imageSize.w/2, -this.imageSize.h/2, this.imageSize.w, this.imageSize.h);
				//console.log('旋转后：x:'+this.prex+'-y:'+this.prey);
			} else {
				this.ctx.translate(offsetX+this.imageSize.w/2, offsetY+this.imageSize.h/2);
				this.ctx.drawImage(video, -this.imageSize.w/2, -this.imageSize.h/2, this.imageSize.w, this.imageSize.h);
			}

			this.ctx.restore();

			this.drawUI(this.ctx, this.cutSize);
		}
		fn && fn();
	},
	fntouchstart: function (e){ // touchstart
		var e = e || window.event;
		if(e.cancelable) {
			e.preventDefault();
		}
		this.rDis = 0;

		if(e.type == 'touchstart' && e.touches.length == 2){
			//if( e.touches.length == 2) {
			var dx = e.touches[0].clientX - e.touches[1].clientX;
			var dy = e.touches[0].clientY - e.touches[1].clientY;

			this.rDis = Math.sqrt(dx*dx + dy*dy);
			document.getElementById('log').innerHTML = 'd1='+this.rDis;
		}

		if(this.tstate!='ok'){ return;}
		this.tstate = 'start';
		this.rr = this.r;

		this.dis.x = (e.type == 'mousedown' ? e.clientX : e.touches[0].clientX) - (this.pre.x);
		this.dis.y = (e.type == 'mousedown' ? e.clientY : e.touches[0].clientY) - (this.pre.y);
		
		return false;
	},
	fntouchmove: function (e){ // touchmove
		// console.log("fntouchmove", e)

		var e = e || window.event;
		if(e.cancelable) {
			e.preventDefault();
		}
		var This = this;
		if(this.tstate!='start'){ return;}

		var x = (e.type == 'mousemove' ? e.clientX : e.touches[0].clientX) - this.dis.x;
		var y = (e.type == 'mousemove' ? e.clientY : e.touches[0].clientY) - this.dis.y;

		// 缩放
		if(e.type == 'touchmove' && e.touches.length == 2) {

			var dx = e.touches[0].clientX - e.touches[1].clientX;
			var dy = e.touches[0].clientY - e.touches[1].clientY;
			var d2 = Math.sqrt(dx * dx + dy * dy);
			var r1 = This.rr;

			var r2 = r1 * (d2 / This.rDis);

			if(r2 < This.rMin/2) { r2 = This.rMin/2;}
			if(r2 > This.rMax*1.5) { r2 = This.rMax*1.5;}

			document.getElementById('log').innerHTML = 'r1=' + This.r + '--///--r2=' + r2;

			This.imageSize.w = This.video.videoWidth * r2;
			This.imageSize.h = This.video.videoHeight * r2;
			x -= (This.imageSize.w /2) - (This.video.videoWidth * r1) /2;
			y -= (This.imageSize.h /2) - (This.video.videoHeight * r1) /2;
			//x -= cx;
			//y -= cy;
			//document.getElementById('log2').innerHTML = 'cx=' + cx + '--///--cy=' + cy;
			This.r = r2;

		}

		this.drawImg(x,y,function(){ This.prex=x; This.prey=y;});

	},
	fntouchend: function (e){ // touchend
		if(this.tstate == 'ok') return;
		this.tstate = 'ok';
		document.onmousemove = null;
		document.ontouchmove = null;
		this.pre.x = this.prex;
		this.pre.y = this.prey;

		// 尺寸矫正
		var r1 = this.r;
		var This = this;
		if(this.r < this.rMin){ // 小
			this.r = this.rMin;
			doMove(this, {
				TRx1 : this.prex,
				TRy1 : this.prey,
				r1	 : r1,
				TRx2 : this.prex,
				TRy2 : this.prey,
				r2	 : this.r
			},'easeBoth',300, function(){
				This.toMove(This);
				document.getElementById('log').innerHTML = 'r1=' + This.r;
			});
		} else if(this.r > this.rMax){ // 大
			this.r = this.rMax;
			var x1 = this.prex;
			var y1 = this.prey;

			this.pre.x = this.prex -= -(This.video.videoWidth * r1 /2) + (This.video.videoWidth * this.r) /2;
			this.pre.y = this.prey -= -(This.video.videoHeight * r1 /2) + (This.video.videoHeight * this.r) /2;

			doMove(this, {
				TRx1 : x1,
				TRy1 : y1,
				r1	 : r1,
				TRx2 : this.prex,
				TRy2 : this.prey,
				r2	 : this.r
			},'easeBoth',300, function(){
				This.toMove(This);
				document.getElementById('log').innerHTML = 'r1=' + This.r;
			});
		} else {
			document.getElementById('log').innerHTML = 'r1=' + This.r;
			this.toMove(this);
		}


	},
	toMove: function(obj, r1, r2, fn){
		// 坐标矫正
		if(obj.rot == 1 || obj.rot == 3){
			var drawW = obj.imageSize.h;
			var drawH = obj.imageSize.w;

		} else {
			var drawW = obj.imageSize.w;
			var drawH = obj.imageSize.h;
		}
		var	range = {
			left : obj.cutSize.l,
			right: obj.cutSize.l + obj.cutSize.w,
			top: obj.cutSize.t,
			bottom: obj.cutSize.t + obj.cutSize.h
		};
		var x1 = obj.prex;
		var y1 = obj.prey;

		// 若有留白，运动回去
		if( obj.prex + drawW < range.right ) {
			obj.prex = obj.pre.x = range.right - drawW;
		}
		if( obj.prex > range.left ) {
			obj.prex = obj.pre.x = range.left;
		}
		if(obj.prey + drawH < range.bottom){
			obj.prey = obj.pre.y = range.bottom - drawH;
		}
		if(obj.prey > range.top){
			obj.prey = obj.pre.y = range.top;
		}

		doMove(obj, {
			TRx1 : x1,
			TRy1 : y1,
			TRx2 : obj.prex,
			TRy2 : obj.prey
		},'easeOut',500,function(){
			fn && fn();
		});
	},
	getResults: function () { // 裁剪结果输出


		try {
			if(!document.getElementById('vData')){
				var canvas2 = document.createElement('canvas');
				canvas2.style.display = 'none';
				canvas2.id = 'vData';
				$(".copperMainBox").append(canvas2);
			} else {
				var canvas2 = document.getElementById('vData');
			}
			var ctx2 = canvas2.getContext('2d');
	
			canvas2.width = this.cutSize.w;
			canvas2.height = this.cutSize.h;
			ctx2.drawImage(this.canvas, this.cutSize.l+0.5, this.cutSize.t+0.5, this.cutSize.w-1, this.cutSize.h-1, 0, 0, canvas2.width, canvas2.height);
	
			// 导出图片
			return canvas2.toDataURL()
		} catch (error) {
			console.log(error)
		}

		
	},
	getObj: function(name){
		return 'string'==(typeof name) ? document.getElementById(name) : name;
	},
	clearCanvas: function(can){// 清除画布
		var con = can.getContext('2d');
		con.clearRect(0, 0, can.width, can.height);
	},
	setCanvas: function(can){// 设置画布大小
		can.width = this.winSize.w;
		can.height = this.winSize.h;
	},
	/*resizefn: function(obj,can){// 屏幕大小改变时
	 obj.winSize = { w: view().w, h: view().h-obj.paddB};
	 obj.cutSize = {
	 w: obj.cutW,
	 h: obj.cutW * obj.cutScale,
	 t: (obj.winSize.h - obj.cutW * obj.cutScale)/2,
	 l: (obj.winSize.w - obj.cutW)/2
	 };
	 obj.setCanvas(can);
	 obj.drawImg(obj.prex,obj.prey);
	 },*/
	drawUI: function(cxt,cut){ //画UI
		cxt.beginPath();
		cxt.rect(0, 0, cxt.canvas.width, cxt.canvas.height);
		pathRect(cxt, cut.l, cut.t, cut.w, cut.h);
		cxt.closePath();
		cxt.fillStyle = "rgba(0,0,0,0.5)";
		cxt.fill();
		cxt.lineWidth = 1;
		cxt.strokeStyle = "rgba(250,250,250,1)";
		cxt.strokeRect(cut.l+1, cut.t+1, cut.w-2, cut.h-2);

		// 裁剪区域尺寸比例
		this.setAspectRatioBtn(cut.t+cut.h)
	},
	setAspectRatioBtn: function (top) {
		let ratioClone, that = this
		if($("#aspectBtn").length) {
		  ratioClone = $("#aspectBtn")
		} else {
		  ratioClone = $(".setAspectRatio").eq(0).clone()
		  ratioClone.attr("id", "aspectBtn")
		  ratioClone.css("top", `calc(${top}px + .2rem)`)
	  
		}
		if(aspectRatio=="vertical") {
		  ratioClone.find("img.icon").attr("src", "img/horizontal.png")
		  ratioClone.find("span").text("横图选择")
		  ratioClone.attr("mode", "horizontal")
		} else {
		  ratioClone.find("img.icon").attr("src", "img/vertical.png")
		  ratioClone.find("span").text("竖图选择")
		  ratioClone.attr("mode", "vertical")
		}
		
		if(!$("#aspectBtn").length) {
		  ratioClone.unbind().click(function() {
			let mode = $(this).attr("mode")
			if(mode=="horizontal") {
			//   cut = new ImgClip({
			// 	canvas : 'canvas01', // canvas id
			// 	fileObj : 'file', // file id
			// 	cutBtn : 'save', // cut btn id
			// 	resultObj : 'img', // result img i
			// 	rotateR : 'rotateR',
			// 	cutScale :  AR_HOR, // 1:1、3:4
			// 	cutW : $("#preImgBox").width() // '数字'或者'winW'关键字，裁切宽度，随屏幕宽或自己设置
			//   });
			that.setCutScale({cutScale: AR_HOR})
			that.run()
			  $(this).find("img.icon").attr("src", "img/vertical.png")
			  $(this).find("span").text("竖图选择")
			  $(this).attr("mode", "vertical")
			  aspectRatio = "horizontal"
		
			} else {
			//   cut = new ImgClip({
			// 	canvas : 'canvas01', // canvas id
			// 	fileObj : 'file', // file id
			// 	cutBtn : 'save', // cut btn id
			// 	resultObj : 'img', // result img i
			// 	rotateR : 'rotateR',
			// 	cutScale :  AR_VER, // 1:1、3:4
			// 	cutW : $("#preImgBox").width() // '数字'或者'winW'关键字，裁切宽度，随屏幕宽或自己设置
			//   });
			that.setCutScale({cutScale: AR_VER})

			that.run()
			  $(this).find("img.icon").attr("src", "img/horizontal.png")
			  $(this).find("span").text("横图选择")
			  $(this).attr("mode", "horizontal")
			  aspectRatio = "vertical"
		
			}
		  })
		  ratioClone.show()
		  $("#preImgBox .setAspectRatio").remove()
		  $("#preImgBox").append(ratioClone)
		}
		
		
	},
	setCutScale: function(opt) {
		this.cutScale = parseFloat(opt.cutScale);
		this.winSize = { w: view().w, h: view().h-this.paddB};
		this.cutW == 'winW' ? (this.cutW = this.winSize.w) : (this.cutW = Number(this.cutW));
		var hh = parseInt(this.cutW * this.cutScale);
		this.cutSize = {
			w: this.cutW,
			h: hh,
			t: (this.winSize.h - hh)/2,
			l: (this.winSize.w - this.cutW)/2
		};
	}
};

// public method----------------------------------------
// 逆向路径
function pathRect( cxt, x, y, width, height){
	cxt.moveTo(x,y);
	cxt.lineTo(x,y+height);
	cxt.lineTo(x+width,y+height);
	cxt.lineTo(x+width,y);
	cxt.lineTo(x,y);
}
function view(){
	return {
		w : $("#preImgBox").width(),
		h :	$("#preImgBox").height()
	}
}
// extend
function extend(obj1,obj2) {
	for(var attr in obj2){ obj1[attr] = obj2[attr];}
}
// addEvent
function addEvent(obj,eventType,func){
	if(obj.attachEvent){
		obj.attachEvent("on" + eventType,func);
		//if(eventType == 'click'){
			//obj.attachEvent("ontouchend",func);
		//}
	}else{
		obj.addEventListener(eventType,func,false);
		//if(eventType == 'click'){
			//obj.addEventListener("touchend",func,false);
		//}
	}
}
function removeEvent(obj,eventType,func){
	if(obj.detachEvent){
		obj.detachEvent("on" + eventType,func);
	}else{
		obj.removeEventListener(eventType,func,false);
	}
}
// 获取fileURL
var createObjectURL = function(blob){
	return window[window.URL?'URL':'webkitURL']['createObjectURL'](blob);
};
var resolveObjectURL = function(blob){
	window[window.URL?'URL':'webkitURL']['revokeObjectURL'](blob);
};

export default ImgClip