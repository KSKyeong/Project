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













