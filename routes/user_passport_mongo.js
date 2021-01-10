module.exports = function(router, passport) {
    console.log('user_passport 호출됨');
    
    // 홈화면
    router.route('/').get(function(req, res) {
        console.log('/ 패스 요청됨.');
        res.render('index.ejs');
    });
    
    //로그인 화면
    router.route('/login').get(function(req, res) {
        console.log('/login 패스 요청됨');
        req.logout();
        res.render('login.ejs', {message : req.flash('loginMessage')});
    });
    
    // 회원가입 화면
    router.route('/signup').get(function(req, res) {
        console.log('/signup 패스 요청됨');
        res.render('signup.ejs', {message : req.flash('signupMessage')});
    });
    
    // 프로필 화면
    router.route('/profile').get(function(req, res) {
        console.log('/profile 패스 요청됨.');

        console.log('req.user 객체의 값');
        console.dir(req.user);

        if(!req.user) {
            console.log('사용자 인증이 안 된 상태임');
            res.redirect('/');
        } else {//인증이 된 경우
            console.log('사용자 인증 된 상태임');

            if(Array.isArray(req.user)) {
                res.render('profile.ejs', {user: req.user[0]._doc});

            } else {
                res.render('profile.ejs', {user: req.user});
            }
        }

    });
    
    // 프로필 화면 조회(팝업 창으로 새로 보여준다)
//    router.route('/profile/:id').get(function(req, res) {
//        var paramId = req.body.id || req.query.id || req.params.id;
//        console.log('/profile/' + paramId + ' 패스 요청됨.');
//        
//        if(!req.user || req.isAuthenticated() != true) {
//            console.log('사용자 인증이 안 된 상태임');
//            res.redirect('/login');
//        } else {//인증이 된 경우
//            console.log('사용자 인증 된 상태임');
//            
//            var database = req.app.get('db');
//            if(database.db) {
//                
//                database.UserModel.findBy_Id(paramId, function(err, results) {
//                    if (err) {
//                        console.error('프로필 조회 중 에러 발생 : ' + err.stack);
//                        
//                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
//                        res.write('<h2>프로필 조회 중 에러 발생</h2>');
//                        res.write('<p>' + err.stack + '</p>');
//                        res.end();
//                        
//                        return;
//                    }
//                    if (results.length>0 && results != undefined) {
//                        console.log('정보 조회됨');
//                        console.dir(results[0]);
//                        
//                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
//                        
//                        var context = {};
//                        
//                        if(Array.isArray(results)) {
//                            context.profile = results[0]._doc;
//
//                        } else {
//                            context.profile = results._doc;
//                        }
//                        
//                        // 자신의 프로필 정보를 띄운다면,(내 정보들, 정보 수정 이동 링크 -> profile_user.ejs에서)
//                        if(req.user._id === paramId){ 
//                            context.title = '나의 프로필';
//                            context.mine = true;
//                            context.user = req.user._id;
//                            
//                        } else { // 다른 사람의 프로필 정보를 조회(정보들, 친구요청 버튼)
//                            context.title = results[0]._doc.name + '의 프로필';
//                            context.mine = false;
//                            
//                        }
//                        console.log('-----------------------------');
//                        console.dir(context);
//                        // html 전송
//                        req.app.render('test_profile', context, function(err, html) {
//                        if (err) {
//                            console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);
//
//                            res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
//                            res.write('<p>' + err.stack + '</p>');
//                            res.end();
//
//                            return;
//                        }
//
//                        //console.log('응답 웹문서 : ' + html);
//                            console.log('뭐야?');
//                        res.end(html);
//                    });
//                    }
//                });
//                
//                
//            } else {
//                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
//                res.write('<h2>데이터베이스 연결 실패</h2>');
//                res.end();
//            }
//            
//            /*if(Array.isArray(req.user)) {
//                res.render('profile.ejs', {user: req.user[0]._doc});
//                
//            } else {
//                res.render('profile.ejs', {user: req.user});
//            }*/
//        }
//
//    });
//    
    //로그아웃
    router.route('/logout').get(function(req, res) {
        console.log('/logout 패스 호출됨');
        req.logout();
        res.redirect('/');
    });
    
    //로그인 인증
    router.route('/login').post(passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login',
        faliureFlash : true
    }));
    
    //회원가입 인증
    router.route('/signup').post(passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/signup',
        faliureFlash : true
    }));
    
    // 페이스북 인증 라우팅
    router.route('/auth/facebook').get(passport.authenticate('facebook', {
        scope : 'email'
    }));
    
    // 페이스북 인증 콜백 라우팅
    router.route('/auth/facebook/callback').get(passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/',
        faliureFlash : true
    }));
    
    router.route('/connect/facebook').get(passport.authorize('facebook', { scope : ['email'] }));
    
};













