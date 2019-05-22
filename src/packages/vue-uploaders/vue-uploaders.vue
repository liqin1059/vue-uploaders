<template>
    <div id="upload">
      <ul class="upload-list" v-if="showList">
        <transition-group name="fade">
          <li class="upload-li images-box"
              :style="[listStyle]"
              v-for="(item, index) in loadingImagesData"
              :key="item.url">
              <img :src="item.url" alt="">
              <span class="delete"
                    :style="[deleStyle]"
                    @click="deleteImages(index)">×</span>
          </li>
        </transition-group>
        <li class="upload-li upload-add"
            :style="[listStyle, inputStyle]">
          <input ref="uploadImagesInput"
                @change="takePhotos"
                multiple="multiple"
                class="upload-add upload-add-input"
                :style="[inputStyle]"
                name="file"
                type="file"
                :accept="accept">
        </li>
      </ul>
      <ul class="upload-list" v-else>
        <li class="upload-li upload-add"
            :style="[listStyle, inputStyle]">
          <input ref="uploadImagesInput"
                @change="takePhotos"
                multiple="multiple"
                class="upload-add upload-add-input"
                :style="[inputStyle]"
                name="file"
                type="file"
                :accept="accept">
        </li>
      </ul>
    </div>
</template>
<script>
import axios from 'axios';
import EXIF from './exif-js.js'; // 图片信息

export default {
  name: 'vue-uploaders',
  props: {
    showList: {
      type: Boolean,
      default: true,
      required: false
    },
    accept: {
      type: String,
      defalut: 'image/jpg,image/jpeg,image/png,image/gif',
      required: false
    },
    actionUrl: {
      type: String,
      default: '',
      required: true
    },
    limit: {
      type: Number,
      default: 9,
      required: false
    },
    compressPercent: {
      type: Number,
      default: 0.3,
      required: false
    },
    listStyle: {
      type: Object,
      default: () => {
        return {
        }
      },
      required: false
    },
    deleStyle: {
      type: Object,
      default: () => {
        return {}
      },
      required: false
    },
    inputStyle: {
      type: Object,
      default: () => {
        return {}
      },
      required: false
    }
  },
  data() {
    return {
      loadingImagesData: []
    }
  },
  methods: {
    deleteImages(index) {
      this.$data.loadingImagesData.splice(index, 1);
      this.$emit('deleteImages', index);
    },
    post(url, data, options) {
      let _headers = {
        'Content-Type': options.contentType
      };
      let axiosOptions = {
        url,
        dataType: 'json',
        data,
        headers: _headers,
        method: 'post',
        onUploadProgress: (progressEvent) => { // 进度条读取
          if (progressEvent.lengthComputable && axiosOptions) {
            // axiosOptions.callbackFun(progressEvent);
          }
        }
      };
      axios(axiosOptions).then(res => {
        this.$emit('uploadSuccess', res);
      }).catch(err => {
        this.$emit('uploadError', err);
      })
    },
    // 多图读取
    readFile(file) {
      let self = this;
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file); // 读出 base64
        reader.onloadend = function() {
          let dataURL = reader.result;
          self.compress(file, 1, self.compressPercent).then((filePressed) => {
            let resData = {
              dataURL,
              filePressed
            };
            self.$data.loadingImagesData.push({
              url: dataURL
            });
            resolve(resData);
          });
        };
      });
    },
    async takePhotos(e) {
      let self = this;
      let files = e.target.files;
      let filesLength = files.length;
      // 不能多余9张图
      if (filesLength > this.limit) {
        alert(`最多上传${this.limit}张图`);
        return false;
      }
      const file = filesLength > 1 ? files : files[0];
      if (filesLength > 1) {
        let formData = new FormData();
        for (let i = 0; i < filesLength; i++) {
          let readRes = await this.readFile(files[i]);
          formData.append('file', readRes.filePressed, files[i].name);
        }
        self.uploadImgs(formData);
      } else {
        let reader = new FileReader();
        reader.readAsDataURL(file); // 读出 base64
        let fileData = file;
        reader.onloadend = function() {
          var dataURL = reader.result;
          self.$data.loadingImagesData.push({
            url: dataURL
          });
          let formData = new FormData();
          self.compress(file, 1, self.compressPercent).then((filePressed) => {
            formData.append('file', filePressed, fileData.name);
            self.uploadImgs(formData);
          });
        };
      }
    },
    // 上传图片接口
    async uploadImgs(data) {
      let uploadOptions = {
        contentType: 'multipart/form-data',
        callbackFun: this.uploadProgress
      };
      let resp = await this.post(this.actionUrl, data, uploadOptions);
    },
    uploadProgress(e) {
      //   // 上传图片动画
      //   this.$data.uploadProgressLoaded = e.loaded;
      //   this.$data.uploadProgressTotal = e.total;
      //   this.$data.loadingBoxShow = true;
      //   this.$data.progressValue = parseInt(100 * e.loaded / e.total);
    },
    // // 实时更新上传进度
    // updateProgress(value) {
    //   this.$data.uploadProgressLoaded = value;
    //   this.$data.progressValue = parseInt(100 * this.$data.uploadProgressLoaded / this.$data.uploadProgressTotal);
    // },
    /**
   * 图片压缩，默认同比例压缩
   * @param fileObj
   * 图片对象
   * 回调函数有一个参数，base64的字符串数据
   * @param maxSize
   * 对多大的图片进行压缩 file.size
   * @param picQuality
   * 压缩图片的质量 0~1
   * @returns {Promise}
   */
    compress(fileObj, maxSize, picQuality) {
      return new Promise((resolve, reject) => {
        let self = this;
        let orientation = 0;
        EXIF.getData(fileObj, function() {
          EXIF.getAllTags(this);
          orientation = EXIF.getTag(this, 'Orientation');
        });
        const isJPG = (fileObj.type === 'image/jpeg');
        if (fileObj.size && ((fileObj.size / 1024 / 1024) > maxSize) && isJPG) {
          try {
            const image = new Image();
            image.src = URL.createObjectURL(fileObj);
            image.onload = function() {
              const that = this;
              // 默认按比例压缩
              let w = that.width;
              let h = that.height;
              const scale = w / h;
              w = fileObj.width || w;
              h = fileObj.height || (w / scale);
              let quality = picQuality; // 默认图片质量为0.7
              // 生成canvas
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              // 创建属性节点
              const anw = document.createAttribute('width');
              anw.nodeValue = w;
              const anh = document.createAttribute('height');
              anh.nodeValue = h;
              canvas.setAttributeNode(anw);
              canvas.setAttributeNode(anh);
              ctx.drawImage(that, 0, 0, w, h);
              // 图像质量
              if (fileObj.quality && fileObj.quality <= 1 && fileObj.quality > 0) {
                quality = fileObj.quality;
              }
              console.log(orientation);
              // if (navigator.userAgent.match(/iphone/i)) {
                if(orientation != "" && orientation != 1){
                  switch(orientation){
                    case 6://需要顺时针（向左）90度旋转
                      self.rotateImg(that,'left',canvas, w, h);
                      break;
                    case 8://需要逆时针（向右）90度旋转
                      self.rotateImg(that,'right',canvas, w, h);
                      break;
                    case 3://需要180度旋转
                      self.rotateImg(that,'right',canvas, w, h);//转两次
                      self.rotateImg(that,'right',canvas, w, h);
                      break;
                  }
                }
              // quality值越小，所绘制出的图像越模糊
              const data = canvas.toDataURL('image/jpeg', quality);
              // 压缩完成执行回调
              const newFile = self.convertBase64UrlToBlob(data);
              resolve(newFile);
            };
          } catch (e) {
            toastr.warning('图片压缩失败~');
            resolve(fileObj);
          }
        } else {
          resolve(fileObj);
        }
      });
    },
    convertBase64UrlToBlob(urlData) {
      const bytes = window.atob(urlData.split(',')[1]); // 去掉url的头，并转换为byte
      // 处理异常,将ascii码小于0的转换为大于0
      const ab = new ArrayBuffer(bytes.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
      }
      return new Blob([ab], { type: 'image/png' });
    },
    rotateImg (img, direction, canvas, w, h) {
      console.log(img);
      console.log(direction);
      console.log(canvas);
      //最小与最大旋转方向，图片旋转4次后回到原方向
      const min_step = 0;
      const max_step = 3;
      if (img == null)return;
      //img的高度和宽度不能在img元素隐藏后获取，否则会出错
      // let height = img.height;
      // let width = img.width;
      let step = 2;
      if (step == null) {
          step = min_step;
      }
      if (direction == 'right') {
          step++;
          //旋转到原位置，即超过最大值
          step > max_step && (step = min_step);
      } else {
          step--;
          step < min_step && (step = max_step);
      }
      //旋转角度以弧度值为参数
      let degree = step * 90 * Math.PI / 180;
      let ctx = canvas.getContext('2d');
      switch (step) {
        case 0:
        console.log('需要顺时针（向右）90度旋转');
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0);
          break;
        case 1:
          console.log('需要顺时针（向左）90度旋转');
          canvas.width = h;
          canvas.height = w;
          ctx.rotate(degree);
          ctx.drawImage(img, 0, -h);
          break;
        case 2:
          canvas.width = w;
          canvas.height = h;
          ctx.rotate(degree);
          ctx.drawImage(img, -w, -h);
          break;
        case 3:
          canvas.width = h;
          canvas.height = w;
          ctx.rotate(degree);
          ctx.drawImage(img, -w, 0);
          break;
        }
    }
  }
}
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
.upload-add-input{
  opacity: 0!important;
}
.upload-list{
  margin-left: -5px;
  transform: all .3s;
}
.upload-li{
  display: inline-block;
  width: 100px;
  height: 100px;
  border-radius: 4px;
  margin: 5px 0 0 5px;
  position: relative;
  vertical-align: top;
  /* background-position: center center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  transform: all .3s; */
}
.upload-li img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.delete{
  position: absolute;
  right: 0;
  top: 0;
  width: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 50%;
  background: #42404087;
  cursor: pointer;
  color: #cccccc;
}
.upload-add{
  width: 100px;
  height: 100px;
  border-radius: 4px;
  border: 1px dashed #cccccc;
  background-image: url(../../assets/add.png);
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 40% 40%;
  cursor: pointer;
}
</style>
