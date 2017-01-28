var multer = require('multer');
var unzip = require('unzip');
var fs = require('fs');
var uuid = require('uuid/v4');
var childProcess = require('child_process');

module.exports = function upload (options) {

  var app = options.app;

  function fileManagement(res,file,fileTarget) {

   var filename = file.filename,
      path = file.destination,
      fileMimeType = file.mimetype;

    if (fileTarget === "attached") {
      moveFile(path, filename, "attachments");
    }
    else if(fileTarget === "tests") {
      moveFile(path, filename, "tests");
    } else if (fileTarget === "deliveries") {
      if (fileMimeType === 'application/x-zip-compressed') {
        var filenameWithoutExtension = filename.split('.')[0];
        uncompressFile(path, filename, filenameWithoutExtension)
        res.json({error_code:0,err_desc:null,filename:filenameWithoutExtension});
      }
      return;
    }
    res.json({error_code:0,err_desc:null,filename:filename});
  }

  function moveFile(path, filename, fileToDestination){
    var exec = childProcess.exec;
        cmd = "mv",
        args = path + filename + " " + path + fileToDestination + "/";

      exec(cmd + " " + args, childProcessCbk);
  }

  function childProcessCbk(err, stdout, stderr) {

    console.log("err:", err, " stdout:", stdout, " stderr:", stderr);
  }

function uncompressFile(path, filename, filenameWithoutExtension) {
  var outputPath = path + "/deliveries/" + filenameWithoutExtension;
  fs.createReadStream(path + filename)
    .pipe(unzip.Extract({
      path: outputPath
    }))
    .on('finish', function () {
        var exec = childProcess.exec;
          cmd = "rm",
          args =  path + "/" + filename;

        exec(cmd + " " + args, childProcessCbk);
    });
  }

  this.add('init:upload', init)

  function init(msg, respond) {

    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
        
            cb(null, './data/');
        },
        filename: function (req, file, cb) {
            var fileName = uuid();
            cb(null, fileName + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
        }
    });

    var upload = multer({ //multer settings
      storage: storage
    }).single('file');

    app.post('/upload', function(req, res) {
      upload(req,res,function(err){
        var file = req.file,
          body = req.body,
          fileTarget = body.fileTarget;
          if(err){
               res.json({error_code:1,err_desc:err});
               return;
          }
        fileManagement(res,file,fileTarget);
      });
    });

    respond();
  }

  return 'upload';
}