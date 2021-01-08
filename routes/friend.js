var showfriends = function(req, res) {
	console.log('friend 모듈 안에 있는 showfriends 호출됨.');
  
    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;
	
    console.log('요청 파라미터 : ' + paramId);
    
    
	var database = req.app.get('db');
    
    // 사용자 인증된 상태일 때 조회 권한
	if(req.isAuthenticated()){
    // 데이터베이스 객체가 초기화된 경우
        if (database.db) {
            
            
            // 요청 받은 paramId의 유저의 친구를 보여준다 (나 자신 or 다른 사람)
            // 나 자신의 친구 리스트를 보여준다면
            if(req.user._id === paramId) {
                console.log('자기 자신의 친구 리스트 조회');
                
                // 1. 글 리스트
                database.FriendModel.load_all(paramId, function(err, results) {
                    if (err) {
                        console.error('친구 목록 조회 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>친구 목록 조회 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }
                    /*console.dir(results);*/
                    if (results) {
                        
                        var user = req.user;
                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});

                        // 뷰 템플레이트를 이용하여 렌더링한 후 전송
                        // user_info에 사용자의 정보 함께 전송
                        var context = {
                            title: '친구 리스트',
                            friends: results,
                            user_info : user

                        };

                        req.app.render('listfriend', context, function(err, html) {
                            if (err) {
                                console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                                res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
                                res.write('<p>' + err.stack + '</p>');
                                res.end();

                                return;
                            }

        //					console.log('응답 웹문서 : ' + html);
                            res.end(html);
                        });

                    } else {
                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>친구 목록 조회 실패</h2>');
                        res.end();
                    }
                });
                
            } else { // 다른 사람의 친구 목록 조회 할 때,
                database.FriendModel.load_friends(paramId, function(err, results) {
                    if (err) {
                        console.error('친구 목록 조회 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>친구 목록 조회 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }
                    /*console.dir(results);*/

                    if (results) {
                        
                        var user = req.user;
                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});

                        // 뷰 템플레이트를 이용하여 렌더링한 후 전송
                        // user_info에 사용자의 정보 함께 전송
                        var context = {
                            title: '친구 목록 조회 ',
                            friends: results,
                            user_info : user

                        };

                        req.app.render('listfriend', context, function(err, html) {
                            if (err) {
                                console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                                res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
                                res.write('<p>' + err.stack + '</p>');
                                res.end();

                                return;
                            }

                            res.end(html);
                        });

                    } else {
                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>친구 목록 조회 실패</h2>');
                        res.end();
                    }
                });
                
            }
            
        } else {
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h2>데이터베이스 연결 실패</h2>');
            res.end();
        }
    } else {// 사용자 인증이 안 된 경우 (로그인으로 전송)
        res.redirect('/login');
    }
};

module.exports.showfriends = showfriends;











