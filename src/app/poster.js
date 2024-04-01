
/**
 * 获取视频元数据
 * @param {string} src - 视频连接
 * @param {function} cb(err, data) - 回调
 * **/
export function getMetadata (src, cb) {
  var v = document.createElement('video')
  v.src = src
  v.style.display = 'none'

  v.addEventListener('loadedmetadata', function () {
    cb && cb({
      duration: v.duration,
      w: v.videoWidth,
      h: v.videoHeight,
      video: v
    })
  })

  v.addEventListener('error', function () {
    cb && cb(v.error)
  })

  document.body.appendChild(v)
}


  /**
   * 视频截图，由于浏览器限制，不支持跨域视频截图
   * @param {HTMLVideoElement} video - 视频标签
   * @param {number|[]} time - 指定截图视频播放位置，秒；0 表示截取当前
   * @param {number[]} size - 指定输出尺寸，默认输出原尺寸；可选
   * @param {function} cb - 回调函数，返回 [{orgSize, size, at, blob}]
   * **/
export function videoScreenshot (cut, timeupdate, video, time, size, cb) {
    time = time || 0
    cb = typeof size === 'function' ? size : cb

    if (!(video instanceof HTMLVideoElement)) {
      if (typeof cb === 'function') cb(new Error('`video` 参数必须是 HTMLVideoElement 对象'), null)
      return
    }
    var isMultiple = Object.prototype.toString.call(time) === '[object Array]'

    if(isMultiple) {
      var canvas = document.createElement('canvas')
      var ctx = canvas.getContext('2d')

    } else {
      var canvas = document.getElementById('img');

    }

    var vw = video.videoWidth
    var vh = video.videoHeight
    
    

    var orgSize = vw + 'x' + vh
    var result = []
    var index = 0
    var length = isMultiple ? time.length : 1
    var hasSize = Object.prototype.toString.call(size) === '[object Array]' && size.length >= 2
    var targetSize = hasSize ? size[0] + 'x' + size[1] : orgSize

    if (isMultiple) video.pause()

    function exec () {
      if(isMultiple) { 
        let cW = size[0]
        let cH = size[1]

        if(vw>vh) {
          // 横屏
          canvas.width = cW
          canvas.height = cW*(vh/vw)
          ctx.drawImage(video, 0, 0, cW, cW*(vh/vw))
  
        } else {
          canvas.width = cH*(vw/vh)
          canvas.height = cH
          ctx.drawImage(video, 0, 0, cH*(vw/vh), cH)
        }
      }
      
      if(!isMultiple) { 
        cut.run()
        return
      }

      let imgUrl = canvas.toDataURL("image/jpeg");
      // if(!isMultiple) {
      //   return
      // }
      // console.log("rev time", new Date().getTime(), video.currentTime)
      var currentTime = video.currentTime
      var cvas = null
      try {
        // 转换成base64形式
        result.push({ orgSize: orgSize, size: targetSize, at: currentTime, blob: imgUrl, })
        run(++index)
      } catch (err) {
        console.log(err)
        if (typeof cb === 'function') cb(err, null)
      }
      // video.removeEventListener('seeked', exec, false)
    }

    function run (i) {
      index = i
      if (i >= length) {
      video.removeEventListener('seeked', exec, false)
        
        if (typeof cb === 'function') cb(null, result)
      } else {
        if (isMultiple) {
          try {
            video.addEventListener('seeked', exec, false)
            // 未加载完成设置时间会存在报错
            video.currentTime = time[i]
            // console.log("set time", new Date().getTime(), video.currentTime)

          } catch (err) {
            console.log(err)
            video.removeEventListener('seeked', exec, false)
            if (typeof cb === 'function') cb(err, null)
          }
        } else {
          exec()

        }
      }
    }

    run(0)

    return canvas
  }

  function toSize (img, orgSize, size) {
    var canvas = document.createElement('canvas')
    canvas.width = size[0]
    canvas.height = size[1]
    var ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, orgSize[0], orgSize[1], 0, 0, size[0], size[1])

    return canvas
  }

