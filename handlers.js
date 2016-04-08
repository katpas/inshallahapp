var Firebase = require('firebase');
var FirebaseTokenGenerator = require('firebase-token-generator');
var tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASESECRET);

module.exports = {

  login : function(req, reply) {
    var userDetails = JSON.parse(req.payload);
    var token = tokenGenerator.createToken({uid: userDetails.uid});
    var user = new Firebase('https://blazing-torch-7074.firebaseio.com/users/' + userDetails.uid);
    console.log('our token', token);
    user.authWithCustomToken(token, function(error, authData) {
      if (error) {
        console.log('error');
      } else {
        console.log('authData');
      }
    });

    user.once("value", function(snapshot) {
      if (snapshot.exists() && snapshot.val().phone) {
        reply({userSetupComplete: true});
      } else {
        if (!snapshot.exists()) {
          createUser(userDetails, function(){
            reply({userSetupComplete: false});
          });

        } else {
          reply({userSetupComplete: false});
        }
      }
    });
  },
};

function createUser(user, callback) {
  var users = new Firebase('https://blazing-torch-7074.firebaseio.com/users/');
  var newUser = {};
  newUser[user.uid] = {first_name: user.facebook.cachedUserProfile.first_name};
  users.update(newUser);
  callback();
}