﻿var mongoose = require('mongoose');
var Delivery = mongoose.model('delivery');
var Task = mongoose.model('task');

module.exports = function delivery () {
  
this.add('role:api,category:delivery,cmd:findAll', function(args,done){
    Delivery.find(function(err, courses) {
        if(!err) {
            done(null,
              generateResponse("success",courses,null));
        } else {
            console.log('ERROR: ' + err);
            done(err,
              generateResponse("error", err,null));
        }
    });
})

this.add('role:api,category:delivery,cmd:findById', function(args,done){
  Delivery.findById(args._id, function(err, delivery) {
      if(!err) {
        done(null,
          generateResponse("success",[delivery],null));
      } else {
        console.log('ERROR: ' + err);
        done(err,
          generateResponse("error", err,null));
      }
    });
})

this.add('role:api,category:delivery,cmd:add', function(args,done){
  console.log('POST');

  var obj = {
    task:    args.task,
    student:     args.student,
	score:	args.score,
	data: args.data
  };
  var delivery = new Delivery(obj);
  console.log(delivery);

  delivery.save(function(err) {
    if(!err) {
      done(null,
        generateResponse("success",[delivery],null));
      console.log('Created');
      findTaskAndRunTests(delivery);
    } else {
      console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
    }
  });
});

function findTaskAndRunTests(delivery) {

  console.log("llega", delivery);
  var taskId = delivery.task;

  Task.findById(taskId, function(err, task) {
      if (!err) {
        console.log("llego un task", task)
        console.log("ya tengo ambos ficheros", delivery.data)
        var exec = require('child_process').exec;
          cmd = "node_modules\\.bin\\intern-client",
          pathTo="data/",
          args = "config=tests/intern suites=" + pathTo + task.evaluationTest.split(".")[0] + " pathToCode=" + pathTo + delivery.data.split(".")[0];  

        function cbk(err, stdout, stderr) {

          //res.send(err + ' ' + stdout + ' ' + stderr);
          console.log(err + ' ' + stdout + ' ' + stderr);
        }
        console.log("args",args);
        exec(cmd + " " + args, cbk);

      } else {}
  })
}

this.add('role:api,category:delivery,cmd:update', function(args,done){
  Delivery.findById(args._id, function(err, delivery) {
    delivery.task = args.task;
    delivery.student = args.student;
	delivery.score = args.score;
	delivery.data = args.data;

    delivery.save(function(err) {
      if(!err) {
    done(null,
      generateResponse("success",[delivery],null));
    console.log('Updated');
      findTaskAndRunTests(delivery);
      } else {
    console.log('ERROR: ' + err);
      done(err,
        generateResponse("error", err,null));
      }
    });
  });
})

this.add('role:api,category:delivery,cmd:delete', function(args,done){
   console.log(args._id); 
  Delivery.findById(args._id, function(err, delivery) {
    if (delivery) {
      delivery.remove(function(err) {
        if(!err) {
        console.log('Removed');
        done(null,
          generateResponse("success",null,null));
        } else {
        console.log('ERROR: ' + err);
        done(err, 
          generateResponse("error", err,null));
        }
      })
    }
    else {
      done(err, 
        generateResponse("error", err, "No se ha encontrado el elemento que buscaba"));
    }
  });
})

this.add('init:delivery', init)

function init(msg, respond) {
  this.act('role:web',{use:{
    // define some routes that start with /api
    prefix: '/delivery',

    // use action patterns where role has the value 'api' and cmd has some defined value
    pin: {role:'api', category: 'delivery', cmd:'*'},

    // for each value of cmd, match some HTTP method, and use the
    // query parameters as values for the action
    map:{
      findAll: {GET:true},          // explicitly accepting GETs
      findById: {GET: true, suffix: '/:_id'},
      add: {POST: true},
      update: {PUT: true, suffix: '/:_id'},
      delete: {DELETE: true, suffix: '/:_id'}
    }
  }})

  respond();
}

function generateResponse (status, content, message) {
  return {
    "status" : status,
    "content": content,
    "message": message
  }
}

  
  return 'delivery'
}