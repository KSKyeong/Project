var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
}, function(req, email, password, done) {
    //요청 파라미터 중 name 파라미터 확인
    var paramName = req.body.name || req.query.name;
    console.log('passport의 local-signup 호출됨. : ' + email + ' ,' + password + ', ' + paramName);
    
    
    process.nextTick(function () {
        var database = req.app.get('db');
        database.UserModel.findOne({'email' : email}, function(err, user) {
        if(err) {
            return done(err);
        }
        // 회원가입 시 입력 받은 email이 기존 계정과 같은 email 이면 알림을 보낸다.
        if(user) {
            console.log('기존 계정이 있음');
            return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));
        } else {
            var user = new database.UserModel({'email':email, 'password':password, 'name':paramName});
            user.save(function(err) {
                if(err) {throw err;}
                console.log('사용자 데이터 추가함');
                // 친구 관련 컬렉션을 생성해보자
                console.log(user);
                var init_friends = new database.FriendModel({'user_id' : user._id});
                init_friends.save(function(err) {
                    if(err) {throw err;}
                    console.log('친구 관련 컬렉션도 추가함');
                    return done(null, user);
                });
                
//                return done(null, user);
            });
        }
      });
    });
});