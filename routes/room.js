var listroom = function (req, res) {
    console.log('room 모듈 안에 있는 listroom 호출됨.');

    var paramPage = req.body.page || req.query.page;
    var paramPerPage = req.body.perPage || req.query.perPage;

    // URL 파라미터로 전달됨
    /*var paramId = req.body.id || req.query.id || req.params.id;*/

    var database = req.app.get('db');



    // 사용자 인증된 상태일 때 조회 권한
    if (req.isAuthenticated()) {
        console.log('로그인 된 상태임');
        var user_id = req.user._id; // 클라이언트의 고유 아이디
        // 데이터베이스 객체가 초기화된 경우
        if (database.db) {

            var options = {
                page: paramPage,
                perPage: paramPerPage,
                user_id: user_id
            }

            // 방 목록 불러오는 static 메소드 호출
            database.RoomModel.roomslist(options, function (err, results) {
                if (err) {
                    console.error('게시판 글 목록 조회 중 에러 발생 : ' + err.stack);

                    res.writeHead('200', {
                        'Content-Type': 'text/html;charset=utf8'
                    });
                    res.write('<h2>게시판 글 목록 조회 중 에러 발생</h2>');
                    res.write('<p>' + err.stack + '</p>');
                    res.end();

                    return;
                }

                if (results) {
                    console.dir("results.length : " + results.length);

                    database.RoomModel.countDocuments({
                        'users.users_id': user_id
                    }).exec(function (err, count) {
                        // 전체 문서 객체 수 확인
                        /*var count = results.length;*/

                        res.writeHead('200', {
                            'Content-Type': 'text/html;charset=utf8'
                        });
                        
                        console.log('count : ' + count);

                        // 뷰 템플레이트를 이용하여 렌더링한 후 전송
                        var context = {
                            title: '채팅 목록',
                            rooms: results,
                            page: parseInt(paramPage),
                            pageCount: Math.ceil(count / paramPerPage),
                            perPage: paramPerPage,
                            totalRecords: count,
                            size: paramPerPage
                        };

                        req.app.render('listroom', context, function (err, html) {
                            if (err) {
                                console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                                res.writeHead('200', {
                                    'Content-Type': 'text/html;charset=utf8'
                                });
                                res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
                                res.write('<p>' + err.stack + '</p>');
                                res.end();

                                return;
                            }

                            res.end(html);
                        });
                    });

                } else {
                    res.writeHead('200', {
                        'Content-Type': 'text/html;charset=utf8'
                    });
                    res.write('<h2>글 목록 조회  실패</h2>');
                    res.end();
                }
            });
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

module.exports.listroom = listroom;
