Page({
  data: {
    key: 'filename.txt',  //待上传的文件名称，您也可以指定其存储在某个目录下。例如，将filename.txt文件上传到youfolder文件夹下，此时需填写：/youfolder/filename.txt。
    policy: '',
    xOssSecurityToken: '',
    xOssSignatureVersion: '',
    xOssCredential: '',
    xOssDate: '',
    xOssSignature: ''
  },

  //上传文件方法 
  uploadFileToOSS(filePath, callback) {
    const {
      key,
      policy,
      xOssSecurityToken,
      xOssSignatureVersion,
      xOssCredential,
      xOssDate,
      xOssSignature
    } = this.data;

    // 后端服务API接口地址，请将IP地址和端口号替换为实际服务器所在IP地址及端口号
    const apiUrl='https://oss.minip.myia.fun/generate_signature'

    // 发送请求获取签名信息 
    wx.request({
      url: apiUrl,
      success: (res) => {
        // 用接口返回的数据替换原有的上传参数
        this.data.xOssSignatureVersion = res.data.x_oss_signature_version;
        this.data.xOssCredential = res.data.x_oss_credential;
        this.data.xOssDate = res.data.x_oss_date;
        this.data.xOssSignature = res.data.signature;
        this.data.xOssSecurityToken = res.data.security_token;
        this.data.policy = res.data.policy;

        // 上传参数
        const formData = {
          key,  //上传文件名称
          policy: this.data.policy,   //表单域
          'x-oss-signature-version': this.data.xOssSignatureVersion,  //指定签名的版本和算法
          'x-oss-credential': this.data.xOssCredential,   //指明派生密钥的参数集
          'x-oss-date': this.data.xOssDate,   //请求的时间
          'x-oss-signature': this.data.xOssSignature,   //签名认证描述信息
          'x-oss-security-token': this.data.xOssSecurityToken,  //安全令牌
          success_action_status: "200"  //上传成功后响应状态码
        };
        // 打印上传formData
        console.log(formData);

        // 发送请求上传文件 
        wx.uploadFile({
          // Bucket域名 请替换为目标Bucket域名
          url: 'https://myia-user-info.oss-cn-wulanchabu.aliyuncs.com',  // 此域名仅作示例，实际Bucket域名，请替换为您的目标Bucket域名。
          filePath: filePath,
          name: 'file',   //固定值为file
          formData: formData,
          success(res) {
            console.log('上传响应:', res);
            if (res.statusCode === 200) {
              callback(null, res.data); // 上传成功
            } else {
              console.error('上传失败，状态码:', res.statusCode);
              console.error('失败响应:', res);
              callback(res); // 上传失败，返回响应
            }
          },
          fail(err) {
            console.error('上传失败:', err); // 输出错误信息
            wx.showToast({ title: '上传失败，请重试!', icon: 'none' });
            callback(err); // 调用回调处理错误
          }
        });
      },
      fail: (err) => {
        console.error('请求接口失败:', err);
        wx.showToast({ title: '获取上传参数失败，请重试!', icon: 'none' });
      }
    });
  },

 //点击上传文件按钮触发上传文件代码逻辑  
  chooseAndUploadFile() {
    wx.chooseMessageFile({
      count: 1, // 选择一个文件
      type: 'all', // 支持所有类型的文件
      success: (res) => {
        console.log('选择的文件:', res.tempFiles); // 输出选择的文件信息
        if (res.tempFiles.length > 0) {
          const tempFilePath = res.tempFiles[0].path; // 获取选择的文件路径
          console.log('选择的文件路径:', tempFilePath); // 输出文件路径
          this.uploadFileToOSS(tempFilePath, (error, data) => {
            if (error) {
              wx.showToast({ title: '上传失败!', icon: 'none' });
              console.error('上传失败:', error); // 输出具体的错误信息
            } else {
              wx.showToast({ title: '上传成功!', icon: 'success' });
              console.log('上传成功:', data); // 输出上传成功后的数据
            }
          });
        } else {
          wx.showToast({ title: '未选择文件!', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.showToast({ title: '选择文件失败!', icon: 'none' });
        console.error('选择文件失败:', err); // 输出选择文件的错误信息
      }
    });
  }
});