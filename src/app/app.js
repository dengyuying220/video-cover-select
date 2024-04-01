import ImgClip from "./imgClip.js"
import {videoScreenshot, getMetadata} from "./poster.js"
import { throttle, initRem } from "./utils/throttle.js"
import videoUrl from "../assets/video.mp4"

let video = null // 视频播放器

var videoRange = document.getElementById('videoRange'); // 进度条
let cut
const AR_VER = 911/686
const AR_HOR = 514/686

let preImgBox = document.getElementById("preImgBox");
// let cW = preImgBox.offsetWidth;    // 获取元素宽度
// let cH = preImgBox.offsetHeight; 


export function initPage() {
  initRem(750, 750)

  if(!videoUrl) {
    showAesMessage("获取视频失败")
    return
  }
  getMetadata(videoUrl, function(e) {
    cut = new ImgClip({
      canvas : 'canvas01', // canvas id
      fileObj : 'file', // file id
      cutBtn : 'save', // cut btn id
      resultObj : 'img', // result img i
      rotateR : 'rotateR',
      cutScale :  AR_VER, // 1:1、3:4
      cutW : $("#preImgBox").width(), // '数字'或者'winW'关键字，裁切宽度，随屏幕宽或自己设置
      video: e.video
    });

    video = e.video
    let gap = e.duration / 10
    let times = []
    times.push(0.1)
    for(let i = 1; i<9; i++) {
      times.push(i*gap)
    }
    times.push(e.duration-0.3)
    screenshotMultiple(times)
    videoRange.addEventListener('input',throttle(bindTimeupdate, 50));

  })

}



/**
 * 选择图片 base64
 */
function complete() {
  let pic = cut.getResults()
  console.log(pic.split(","))
}

// 拖拽截图数据
function bindTimeupdate() {
  try {

    let pro = (this.value/100)*video.duration
    if(Math.abs(video.duration-pro)<0.31) {
      video.currentTime = video.currentTime - 0.3
    } else {
      video.currentTime = pro
    }
  } catch (error) {
    console.log(error)
    video.removeEventListener('seeked', timeupdateHandler, false)
  }
}
function timeupdateHandler() {
  videoScreenshot(cut, true, video, video.currentTime)
}
// 初始化截图数据
function screenshotMultiple (times = [1,2,3,4,5,6,7,8]) {
  // if (!videoDone) return alert('请等待视频加载完成在执行')
  
  // showLoadingGif();

  videoScreenshot(cut, false, video, times, [preImgBox.offsetWidth, preImgBox.offsetHeight],function (err, res) {
		// closeLoadingGif();
    if (err) {
      return 
    }
    if(!res.length) {
      return
    }
    var html = res.map(function (e) {
      return '<img src="' + e.blob+ '" />'

    })
    // $("#img").attr("src", res[1].blob)
    document.getElementById('imgs').innerHTML = html
    // bindTimeupdate()
    video.currentTime = 0.1
    video.addEventListener('seeked', timeupdateHandler, false)

    // timeupdateHandler()
    // setAspectRatio()
  })
}




