var FacebookStrategy = require('passport-facebook').Strategy;
var config = require('../config');


// ** 페이스북 사용자 중, 이메일을 등록 하지 않았거나, 오류로 인해 불러들일 수 없을 수도 있다. --> profile.id로 고유정보를 활용하자.

module.exports = function(app, passport) {
	return new FacebookStrategy({
		clientID: config.facebook.clientID,
		clientSecret: config.facebook.clientSecret,
		callbackURL: config.facebook.callbackURL,
        profileFields: ['id', 'email', 'name']
	},
		function(accessToken, refreshToken, profile, done) {
		console.log('passport의 facebook 호출됨.');
		console.dir(profile);

		var options = {'facebook.id': profile.id};
		
		var database = app.get('db');
		database.UserModel.findOne(options, function (err, user) {
			if (err) return done(err);
            
			if (!user) {
				var user = new database.UserModel({
					id: profile.id,
					name: profile.name.familyName + profile.name.givenName + profile.name.middleName,
                    hashed_password: Math.random().toString(36).substr(2,11),
					email: profile.emails[0].value,
					provider: 'facebook',
					authToken: accessToken,
					facebook: profile._json
				});

				user.save(function (err) {
					if (err){ console.log(err);}
					var init_friends = new database.FriendModel({'user_id' : user._id});
                    init_friends.save(function(err) {
                        if(err) {throw err;}
                        console.log('친구 관련 컬렉션도 추가함');
                        return done(null, user);
                    });

				});
                
                
			} else {
                console.log('같은 유저 정보가 DB에 있다.');
				return done(err, user);
			}
		});
	});
};