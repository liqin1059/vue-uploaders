# vue-uploaders

[![NPM version](https://img.shields.io/npm/v/vue-uploaders.svg)](https://www.npmjs.com/package/vue-uploaders)

> vue uploaders tools💁🙅 vue上传组件

#  支持

*  图片数量限制
*  多图上传
*  样式自定义
*  图片压缩
*  ios拍照兼容（旋转问题）
*  上传回调
*  pc，移动兼容

## npm install

```
npm install vue-uploaders --save
```
# 使用

在main.js中引入

```js
import VueUpload from 'vue-uploaders'
Vue.use(VueUpload)
```

``` html
<vue-uploaders
  :limit="9"
  :listStyle="listStyle"
  :deleStyle="deleStyle"
  :compressPercent="0.3"
  :actionUrl="actionUrl"
  @uploadSuccess="uploadSuccess"
  @uploadError="uploadError"
  @deleteImages="deleteImages">
</vue-uploaders>
```

| 参数 | 类型 | 备注 |
|  ------ | ------ | ------ |
| actionUrl | sting | 上传地址 |
| limit | Number | 上传图片限制数量 |
| listStyle | Object | 图片列表样式(驼峰命名：backgroundColor) |
| deleStyle | Object | 删除图片样式(驼峰命名：backgroundColor) |
| compressPercent | Number|图片压缩比例 |
| deleteImages | event | 删除图片事件回调（参数：图片index）|
| uploadSuccess | event | 上传成功事件回调 |
| uploadError | event | 上传失败事件回调 |

# 展示

![avatar](/static/demo.png)

# 源码地址

[https://github.com/liqin1059/vue-uploaders](https://github.com/liqin1059/vue-uploaders)