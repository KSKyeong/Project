var showfriends = function (req, res) {
    console.log('friend 모듈 안에 있는 showfriends 호출됨.');

    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;
    var paramName = req.body.name || req.query.name || req.params.name;

    console.log('요청 파라미터 : ' + paramId);


    var database = req.app.get('db');

    // 사용자 인증된 상태일 때 조회 권한
    if (req.isAuthenticated()) {
        // 데이터베이스 객체가 초기화된 경우
        if (database.db) {


            // 요청 받은 paramId의 유저의 친구를 보여준다 (나 자신 or 다른 사람)
            // 나 자신의 친구 리스트를 보여준다면
            console.log('_id : ' + req.user._id);
            if (req.user._id === paramId) {
                console.log('자기 자신의 친구 리스트 조회');

                // 1. 글 리스트
                database.FriendModel.load_all(paramId, function (err, results) {
                    if (err) {
                        console.error('친구 목록 조회 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {
                            'Content-Type': 'text/html;charset=utf8'
                        });
                        res.write('<h2>친구 목록 조회 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }
                    /*console.dir(results);*/
                    if (results) {

                        var user = req.user;
                        res.writeHead('200', {
                            'Content-Type': 'text/html;charset=utf8'
                        });

                        // 뷰 템플레이트를 이용하여 렌더링한 후 전송
                        // user_info에 사용자의 정보 함께 전송
                        var context = {
                            title: '친구 리스트',
                            friends: results,
                            user_info: user

                        };

                        req.app.render('listfriend', context, function (err, html) {
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
                        res.writeHead('200', {
                            'Content-Type': 'text/html;charset=utf8'
                        });
                        res.write('<h2>친구 목록 조회 실패</h2>');
                        res.end();
                    }
                });

            } else { // 다른 사람의 친구 목록 조회 할 때,
                database.FriendModel.load_friends(paramId, function (err, results) {
                    if (err) {
                        console.error('친구 목록 조회 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {
                            'Content-Type': 'text/html;charset=utf8'
                        });
                        res.write('<h2>친구 목록 조회 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }
                    /*console.dir(results);*/

                    if (results) {

                        var user = req.user;
                        res.writeHead('200', {
                            'Content-Type': 'text/html;charset=utf8'
                        });

                        // 뷰 템플레이트를 이용하여 렌더링한 후 전송
                        // user_info에 사용자의 정보 함께 전송
                        var context = {
                            title: '친구 목록 조회 ',
                            friends: results,
                            user_info: user

                        };

                        req.app.render('listfriend', context, function (err, html) {
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
                        res.writeHead('200', {
                            'Content-Type': 'text/html;charset=utf8'
                        });
                        res.write('<h2>친구 목록 조회 실패</h2>');
                        res.end();
                    }
                });

            }

        } else {
            res.writeHead('200', {
                'Content-Type': 'text/html;charset=utf8'
            });
            res.write('<h2>데이터베이스 연결 실패</h2>');
            res.end();
        }
    } else { // 사용자 인증이 안 된 경우 (로그인으로 전송)
        res.redirect('/login');
    }
};

var showprofile = function (req, res) {
    var paramId = req.body.id || req.query.id || req.params.id;
    console.log('/profile/' + paramId + ' 패스 요청됨.');

    if (!req.user || req.isAuthenticated() != true) {
        console.log('사용자 인증이 안 된 상태임');
        res.redirect('/login');
    } else { //인증이 된 경우
        console.log('사용자 인증 된 상태임');

        var database = req.app.get('db');
        if (database.db) {

            database.UserModel.findBy_Id(paramId, function (err, results) {
                if (err) {
                    console.error('프로필 조회 중 에러 발생 : ' + err.stack);

                    res.writeHead('200', {
                        'Content-Type': 'text/html;charset=utf8'
                    });
                    res.write('<h2>프로필 조회 중 에러 발생</h2>');
                    res.write('<p>' + err.stack + '</p>');
                    res.end();

                    return;
                }
                if (results.length > 0 && results != undefined) {
                    console.log('정보 조회됨');
                    /*console.dir(results[0]);*/

                    res.writeHead('200', {
                        'Content-Type': 'text/html;charset=utf8'
                    });

                    var context = {};

                    if (Array.isArray(results)) {
                        context.profile = results[0]._doc;

                    } else {
                        context.profile = results._doc;
                    }

                    // 자신의 프로필 정보를 띄운다면,(내 정보들, 정보 수정 이동 링크 -> profile_user.ejs에서)
                    if (req.user._id === paramId) {
                        context.title = '나의 프로필';
                        context.mine = true;
                        context.user = req.user._id;

                    } else { // 다른 사람의 프로필 정보를 조회(정보들, 친구요청 버튼)
                        context.title = results[0]._doc.name + '의 프로필';
                        context.mine = false;

                    }
                    /*console.log('-----------------------------');
                    console.dir(context);*/
                    // html 전송
                    req.app.render('show_profile', context, function (err, html) {
                        if (err) {
                            console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                            res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
                            res.write('<p>' + err.stack + '</p>');
                            res.end();

                            return;
                        }

                        //console.log('응답 웹문서 : ' + html);
                        console.log('뭐야?');
                        res.end(html);
                    });
                }
            });


        } else {
            res.writeHead('200', {
                'Content-Type': 'text/html;charset=utf8'
            });
            res.write('<h2>데이터베이스 연결 실패</h2>');
            res.end();
        }

        /*if(Array.isArray(req.user)) {
            res.render('profile.ejs', {user: req.user[0]._doc});
            
        } else {
            res.render('profile.ejs', {user: req.user});
        }*/
    }

};

// req_friend/:name 으로 받아서
var req_friend = function (req, res) {
    var paramName = req.body.name || req.query.name || req.params.name;

    console.log('/req_friend/' + paramName + ' 패스 요청됨.');

    if (!req.user || req.isAuthenticated() != true) {
        console.log('사용자 인증이 안 된 상태임');
        res.redirect('/login');
    } else {

        var database = req.app.get('db');
        if (database.db) {

            database.UserModel.findByName(paramName, function (err, results) {
                if (err) {
                    console.error('프로필 조회 중 에러 발생 : ' + err.stack);

                    res.writeHead('200', {
                        'Content-Type': 'text/html;charset=utf8'
                    });
                    res.write('<h2>프로필 조회 중 에러 발생</h2>');
                    res.write('<p>' + err.stack + '</p>');
                    res.end();

                    return;
                }
                if (results.length > 0 && results != undefined) {
                    console.log('정보 조회됨');
                    /*console.dir(results[0]._doc._id); */

                    var req_to_id = results[0]._doc._id;
                    var user_id = req.user._id;

                    database.FriendModel.request_friend(req_to_id, user_id, function (err, results) {
                        if (err) {
                            console.error('친구 요청 추가 중 에러 발생 : ' + err.stack);

                            res.writeHead('200', {
                                'Content-Type': 'text/html;charset=utf8'
                            });
                            res.write('<h2>친구 요청 추가 중 에러 발생</h2>');
                            res.write('<p>' + err.stack + '</p>');
                            res.end();

                            return;
                        }
                        if (results.nModified > 0) {
                            console.log(results);
                            console.log('친구 요청 완료');
                            return res.redirect('/process/showfriends/' + user_id);
                        }
                        console.log('친구 요청 실패?');
                        res.writeHead('200', {
                            'Content-Type': 'text/html;charset=utf8'
                        });
                        res.write('<h2>친구 요청 중 무시 현상 발생</h2>');
                        res.end();
                        return;
                    });
                }
            });


        } else {
            res.writeHead('200', {
                'Content-Type': 'text/html;charset=utf8'
            });
            res.write('<h2>데이터베이스 연결 실패</h2>');
            res.end();
        }
    }
}

// friendrequest post 방식
var friendrequest = function (req, res) {
    console.log('friendrequest 함수 호출됨');
    // 요청한 친구의 고유 아이디 값 Obj_id
    var request_id = req.body.request_id || req.query.request_id || req.params.request_id;
    // 요청을 수락하냐? 거절하냐?
    var accept = req.body.accept || req.query.accept || req.params.accept;
    var user_id = req.user._id;
    console.log('friendrequest 요청 받음 : ' + request_id + ' , ' + accept);


    if (!req.user || req.isAuthenticated() != true) {
        console.log('사용자 인증이 안 된 상태임');
        res.redirect('/login');
    } else { //인증이 된 경우
        console.log('사용자 인증 된 상태임');

        var database = req.app.get('db');
        if (database.db) {

            // 수락 거절 둘다 요청 목록에서 삭제 먼저
            database.FriendModel.request_accept_del(user_id, request_id, function (err, results) {
                if (err || results == undefined) {
                    console.error('친구 요청 처리중 에러 발생 : ' + err.stack);

                    res.writeHead('200', {
                        'Content-Type': 'text/html;charset=utf8'
                    });
                    res.write('<h2>친구 요청 처리중 에러 발생</h2>');
                    res.write('<p>' + err.stack + '</p>');
                    res.end();

                    return;
                }
                if (results.nModified == 0) {
                    console.log('친구 요청 처리 오류 발생 !! (중복 고려)');
                    console.log(results);
                    return res.redirect('/process/showfriends/' + user_id);
                }
                if (results.nModified > 0) {
                    console.log(results);
                    console.log('요청 목록에서 삭제 성공');
                    if (accept == 'true') { // 요청 수락 시 friends 배열에 추가
                        console.log(accept == 'true');
                        database.FriendModel.request_accept_add(user_id, request_id, function (err, result) {
                            if (err || result == undefined) {
                                console.error('친구 요청 처리중 에러 발생 : ' + err.stack);

                                res.writeHead('200', {
                                    'Content-Type': 'text/html;charset=utf8'
                                });
                                res.write('<h2>친구 요청 처리중 에러 발생</h2>');
                                res.write('<p>' + err.stack + '</p>');
                                res.end();

                                return;
                            }
                            if (result) {
                                database.FriendModel.request_accept_add(request_id, user_id, function (err, result) {
                                    if (err) {
                                        console.error('친구 요청 처리중 에러 발생 : ' + err.stack);

                                        res.writeHead('200', {
                                            'Content-Type': 'text/html;charset=utf8'
                                        });
                                        res.write('<h2>친구 요청 처리중 에러 발생</h2>');
                                        res.write('<p>' + err.stack + '</p>');
                                        res.end();

                                        return;
                                    }
                                    if (result) {
                                        console.log('친구 요청 수락 성공');
                                        console.dir(result);
                                        return res.redirect('/process/showfriends/' + user_id);
                                    }
                                });
                            }
                        });
                    } else if (accept == 'false') {
                        console.log('친구 요청 거절 완료');
                        console.dir(results);
                        return res.redirect('/process/showfriends/' + user_id);
                    }


                }
            });


        } else {
            res.writeHead('200', {
                'Content-Type': 'text/html;charset=utf8'
            });
            res.write('<h2>데이터베이스 연결 실패</h2>');
            res.end();
        }
    }

}

module.exports.showfriends = showfriends;
module.exports.showprofile = showprofile;
module.exports.req_friend = req_friend;
module.exports.friendrequest = friendrequest;
