﻿
var mongoose = require('mongoose');
var user = mongoose.model('user');

//GET - Devuvelve todos los users en la DB
exports.findAllUsers = function(req, res) {
    user.find(function(err, users) {
        if(!err) {
            res.send(users);
        } else {
            console.log('ERROR: ' + err);
        }
    });
};

  //GET - Devuelve un user con un ID específico.
  exports.findUserById = function(req, res) {
  user.findById(req.params.id, function(err, user) {
    if(!err) {
      res.send({
        user: user, //Mirar. Antes: show: TVShow
      });
    } else {
      console.log('ERROR: ' + err);
    }
  });
};

//Insertar un nuevo usuario en db
exports.addUser = function(req, res) {
  console.log('POST');
  console.log(req.body);

  var user = new user({
    firstName:    req.body.firstName,
    surname:     req.body.surname,
    email:  req.body.email,
    password:   req.body.password
  });

  user.save(function(err) {
    if(!err) {
      res.send(user);
      console.log('Created');
    } else {
      console.log('ERROR: ' + err);
    }
  });

};

exports.updateUser = function(req, res) {
  user.findById(req.params.id, function(err, user) {
    user.firstName = req.body.firstName;
    user.surname = req.body.surname;
    user.email = req.body.email;
    user.password = req.body.password;

    user.save(function(err) {
      if(!err) {
      console.log('Updated');
      } else {
      console.log('ERROR: ' + err);
      }

      res.send(user);
    });
  });
};

exports.deleteUser = function(req, res) {
  user.findById(req.params.id, function(err1, user) {
    if (user) {
      user.remove(function(err2) {
        if(!err2) {
        console.log('Removed');
        res.send("Eliminado");
        } else {
        console.log('ERROR: ' + err2);
        }
      })
    }
    else
      console.log(err1);
  });
}