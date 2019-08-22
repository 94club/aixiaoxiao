import multer from 'multer'
const fileBasePath = 'public/uploads/'
const folderPath = new Date().getFullYear() + "" + (new Date().getMonth()+1) + "" + new Date().getDate()
const storage = multer.diskStorage({
  destination: fileBasePath + folderPath,
  filename (req, file, cb) {
    const name = file.originalname.split('.');
    cb(null, Date.now() + Math.random() + '.' + name[name.length - 1]);
  }
});
function checkFileExt (ext, allow = true, rule = 'mp4|xls|xlsx'){
  if(!ext) return false;
  if(allow) return rule.includes(ext);
  return !rule.includes(ext);
}
const fileFilter = function fileFilter(req, file, cb){
  let ext = file.originalname.split('.');
  ext = ext[ext.length - 1];
  // 检查文件后缀是否符合规则
  if (checkFileExt(ext, true)) {
    cb(null, true);
  } else {
    // 不符合规则，拒绝文件并且直接抛出错误
    cb(null, false);
    cb(new Error('文件类型错误'));
  }
}

class Upload {

  constructor(){
  }
  
  /**
   * @name checkFileExt
   * @description 检查文件后缀是否满足要求
   * @param {Boolean} allow  // 描述规则是 allow 还是 deny
   * @param {String} rule // 规则字符串 png|jpeg|bmp|svg|jpg
   * @param {String} ext  // 文件后缀名
   */

  /**
   * @name fileFilter
   * @description 文件过滤方法
   * @param {*} req 
   * @param {*} file 
   * @param {*} cb 
   */
 
  /**
   * @name uploadMiddleware
   * @description 文件上传中间件
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  uploadMiddleware(req, res, next){
    let baseUpload = multer({storage, fileFilter});
    let upload = baseUpload.single('file');
    upload(req, res, (err) => {
      if (err) {
        // 进行错误捕获
        res.json({code:-1, msg:err.toString()});
      } else {
        console.log(req.file)
        console.log('---------------------')
        next();
      }
    });
  }
  excelUpload (req, res, next) {}
}
export default new Upload()