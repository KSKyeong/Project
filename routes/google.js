// html-entities module is required in showpost.ejs
//var Entities = require('html-entities').AllHtmlEntities;
var {google} = require('googleapis');
var service = google.youtube('v3');
const oauth2Client = require('../testApi');

const Entities = require('html-entities');

const setToken = async function(req, res) { //콜백으로 넘어오는 정보 사용
    console.log('setToken 호출');
    console.log(req.user);


    
    if(req.isAuthenticated()) {
        try {
            // 코드
            console.log(req.query);
            console.log(typeof(req.query));
            console.log(typeof(req.query.code));
            const code = req.body.code || req.query.code;
            const scope = req.body.scope || req.query.scope;
            // 범위
            // var scope = req.body.scope || req.query.scope;
    
            console.log('코드 : ' + code + ', 범위 : ' + scope );
    
            var database = req.app.get('db');
            if(database.db) {

                let user_email = req.user.email;
                const tokens = {};
                oauth2Client.oauth2Client.getToken(code)
                    .then((token) => {
                        try {

                            console.log(token.tokens);
                            // token.tokens;
                            // 토큰 자체를 넘겨서 저장 되는지
                            database.UserModel.initToken(user_email, token.tokens, (err, results) => {
                                if (err) {
                                    console.error('토큰 추가 중 에러 발생 : ' + err.stack);
                                    
                                    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                                    res.write('<h2>토큰 추가 중 에러 발생</h2>');
                                    res.write('<p>' + err.stack + '</p>');
                                    res.end();
                                    
                                    return;
                                }
                                if (results) {
                                    console.log(results);
                                    console.log('토큰 추가 완료 ');
                                    return res.redirect('/');
                                }
                                console.log('댓글 등록 실패?');
                                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                                res.write('<h2>댓글 추가 중 무시 현상 발생</h2>');
                                res.end();
                                return ;
                            });
                        } catch (err) {
                            console.error(err);
                        }
                        
                    }).catch(error => {
                        console.log(error);
                    });

                // console.log(token);
                // {tokens} = token; 
                    
                
            } else {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>데이터베이스 연결 실패</h2>');
                res.end();
            }
        }
        catch (err) {
            console.error(err);
        }
    } else {
        res.redirect('/login');
    }
      
    
}


// 구글 토큰 사용 테스트
const test = function(req, res) {
    console.log('test 호출');
    console.log(req.params.id);
    let findId = req.params.id;
    if(req.isAuthenticated()) {
        try {
            var database = req.app.get('db');
            if(database.db) {

                let user_email = req.user.email;
                console.log(user_email);
                
                try {

                    // 토큰 자체를 넘겨서 저장 되는지
                    database.UserModel.test(user_email, (err, results) => {
                        console.log(results);
                        if (err) {
                            console.error('토큰 추가 중 에러 발생 : ' + err.stack);
                            
                            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                            res.write('<h2>토큰 추가 중 에러 발생</h2>');
                            res.write('<p>' + err.stack + '</p>');
                            res.end();
                            
                            return;
                        }
                        if (results) {
                            
                            console.log(JSON.parse(results.googleToken));
                            console.log('토큰 가져오기 완료 ');
                            try {
                                // 호출 전에 무조건 토큰 리프레쉬 해보기
                                var token_ = JSON.parse(results.googleToken);
                                console.log(token_);
                                // token_.googleRefreshToken = results.googleRefreshToken
                                var client = oauth2Client.oauth2Client;
                                client.credentials = token_;
                                console.log(client);
                                req.app.set('client', client);
                                console.log("체크");

                                // 토큰 리프레쉬 하는 부분
                                oauth2Client.refreshAccessToken(client, results.googleRefreshToken)
                                .then((refreshedClient) => {
                                    console.log('잘 넘어왔나요?');
                                    console.log(refreshedClient);
                                    service.videos.list({
                                        auth: refreshedClient,
                                        part: 'snippet, statistics',
                                        fields: 'items(snippet(title, description, channelId), statistics(viewCount, likeCount))',
                                        myRating: 'like'
                                    }).then((res) => {
                                        console.log((res.data.items));
                                        // return res.data.items;
                                    }).catch ((err) => {
                                        console.log('에러 발생');
                                        console.error(err);
                                        /*
                                        oauth2Client.authUrl()
                                        .then((str) => {
                                            console.log(str);
                                            return res.redirect(str);
                                        })
                                        */
                                    });
                                });


                                /*
                                service.videos.list({
                                    auth: client,
                                    part: 'snippet, statistics',
                                    fields: 'items(snippet(title, description, channelId), statistics(viewCount, likeCount))',
                                    myRating: 'like'
                                }).then((res) => {
                                    console.log((res.data.items));
                                }).catch ((err) => {
                                    console.log('에러 발생');
                                    console.error(err);
                                    oauth2Client.authUrl()
                                    .then((str) => {
                                        console.log(str);
                                        return res.redirect(str);
                                    })
                                    
                                });
                                */
                            } catch (err) {
                                console.error(err);
                            } finally {
                                // 뷰로 렌더해주자
                                return res.redirect('/');
                                // return res.render()
                            }
                            
                            
                        }
                        console.log('댓글 등록 실패?');
                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>댓글 추가 중 무시 현상 발생</h2>');
                        res.end();
                        return ;
                    });
                } catch (err) {
                    console.error(err);
                }
                        
                    

                // console.log(token);
                // {tokens} = token; 
                    
                
            } else {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>데이터베이스 연결 실패</h2>');
                res.end();
            }
        }
        catch (err) {
            console.error(err);
        }
    } else {
        res.redirect('/login');
    }
}

var addpost = function(req, res) {
	console.log('post 모듈 안에 있는 addpost 호출됨.');
    if (req.isAuthenticated()) {
        var paramTitle = req.body.title || req.query.title;
        var paramContents = req.body.contents || req.query.contents;
        var paramWriter = req.user.email;

        console.log('요청 파라미터 : ' + paramTitle + ', ' + paramContents + ', ' + 
                   paramWriter);

        var database = req.app.get('db');

        // 데이터베이스 객체가 초기화된 경우
        if (database.db) {

            // 1. 아이디를 이용해 사용자 검색
            database.UserModel.findByEmail(paramWriter, function(err, results) {
                if (err) {
                    console.error('게시판 글 추가 중 에러 발생 : ' + err.stack);

                    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>게시판 글 추가 중 에러 발생</h2>');
                    res.write('<p>' + err.stack + '</p>');
                    res.end();

                    return;
                }

                if (results == undefined || results.length < 1) {
                    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>사용자 [' + paramWriter + ']를 찾을 수 없습니다.</h2>');
                    res.end();

                    return;
                }

                var userObjectId = results[0]._doc._id;
                console.log('사용자 ObjectId : ' + paramWriter +' -> ' + userObjectId);

                // save()로 저장
                // PostModel 인스턴스 생성
                var post = new database.PostModel({
                    title: paramTitle,
                    contents: paramContents,
                    writer: userObjectId
                });

                post.savePost(function(err, result) {
                    if (err) {
                        if (err) {
                            console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                            res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
                            res.write('<p>' + err.stack + '</p>');
                            res.end();

                            return;
                        }
                    }

                    console.log("글 데이터 추가함.");
                    console.log('글 작성', '포스팅 글을 생성했습니다. : ' + post._id);

                    return res.redirect('/process/showpost/' + post._id); 
                });

            });

        } else {
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h2>데이터베이스 연결 실패</h2>');
            res.end();
        }
    } else {// 사용자 인증이 되지 않은 경우
        res.redirect('/login');
    }
};

var deletepost = function(req, res) {
    console.log('deletepost 함수 호출됨');
    if (req.isAuthenticated()) {
        console.log(req.user);
        
        var database = req.app.get('db');
        
        // 삭제할 게시물 도큐먼트의 _id 값을 del_post에 할당
        var del_post = req.body.del_post || req.query.del_post;
        
        // showpost.ejs에서 요청받을 때 함께 넘어온 게시글 작성자의 _id 값
        var post_writer = req.body.post_writer || req.query.post_writer;
        
        if (post_writer === req.user._id) {
            console.log(post_writer + ' == ' + req.user._id + ' 일치합니다!');
            if (database.db) {
                database.PostModel.postdelete(del_post, function(err, result) {
                    if(err) {
                        console.error('게시글 삭제 중 에러 발생 : ' + err.stack);
                
                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>게시글 삭제 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }
                    console.dir(result.deletedCount != 0);
                    if(result) {
                        console.log('게시글 삭제 완료 ');
                        return res.redirect('/process/listpost?page=0&perPage=2');
                    }
                    console.log('게시글 삭제 실패?');
                    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>게시글 삭제 안된 건가?</h2>');
                    res.end();
                    return ;
                });
            } else { // 데이터 베이스가 초기화 되어있지 않은 경우
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>데이터베이스 연결 실패</h2>');
                res.end();
            }
        } else { // 잘못된 요청 - 다른 사용자가 임의로 삭제 요청 보냈을 가능성
            res.redirect('/login');
        }
        
    }
}

var listpost = function(req, res) {
	console.log('post 모듈 안에 있는 listpost 호출됨.');
  
    var paramPage = req.body.page || req.query.page;
    var paramPerPage = req.body.perPage || req.query.perPage;
	
    console.log('요청 파라미터 : ' + paramPage + ', ' + paramPerPage);
    
	var database = req.app.get('db');
	
    // 데이터베이스 객체가 초기화된 경우
	if (database.db) {
		// 1. 글 리스트
		var options = {
			page: paramPage,
			perPage: paramPerPage
		}
		
		database.PostModel.list(options, function(err, results) {
			if (err) {
                console.error('게시판 글 목록 조회 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>게시판 글 목록 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			
			if (results) {
				console.log(results.length);
 
				// 전체 문서 객체 수 확인
				database.PostModel.countDocuments().exec(function(err, count) {
                    
                    console.dir(count);
					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					
					// 뷰 템플레이트를 이용하여 렌더링한 후 전송
					var context = {
						title: '글 목록',
						posts: results,
						page: parseInt(paramPage),
						pageCount: Math.ceil(count / paramPerPage),
						perPage: paramPerPage, 
						totalRecords: count,
						size: paramPerPage
					};
					
					req.app.render('listpost', context, function(err, html) {
                        if (err) {
                            console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                            res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
                            res.write('<p>' + err.stack + '</p>');
                            res.end();

                            return;
                        }
                        
						res.end(html);
					});
					
				});
				
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>글 목록 조회  실패</h2>');
				res.end();
			}
		});
	} else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
};

var showpost = function(req, res) {
	console.log('post 모듈 안에 있는 showpost 호출됨.');
  
    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;
	
    console.log('요청 파라미터 : ' + paramId);
    
    
	var database = req.app.get('db');
    
    // 사용자 인증된 상태일 때 조회 권한
	if(req.isAuthenticated()){
    // 데이터베이스 객체가 초기화된 경우
        if (database.db) {
            // 조회수 업데이트
            database.PostModel.viewupdate(paramId, function(err, goal) {
                console.log('조회수 증가 함수 호출' + goal);
                if(err) {throw err;}

                if(goal) {
                    console.log('게시물 ' + paramId + '--> 조회수 1만큼 증가');
                    return
                }
                console.log('아무런 변화 없음');
                return
            });
            // 1. 글 리스트
            database.PostModel.load(paramId, function(err, results) {
                if (err) {
                    console.error('게시판 글 조회 중 에러 발생 : ' + err.stack);

                    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>게시판 글 조회 중 에러 발생</h2>');
                    res.write('<p>' + err.stack + '</p>');
                    res.end();

                    return;
                }

                if (results) {
    //				console.dir(results.views);

                    /*results.updateOne({_id : paramId}, {$inc: {views : parseInt(1)}});
                    results.save();*/

                    // 댓글을 작성한다면 현재 사용자의 정보를 함께 넣어준다.(세션 활용)
                    // req.user._id 없다면, req.user.email이나 name을 활용, addcomments 함수 내에 user._id 추출하는 과정 필요
//                    console.log(req.user);
                    var user = req.user;
                    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});

                    // 뷰 템플레이트를 이용하여 렌더링한 후 전송
                    // user_info에 사용자의 정보 함께 전송
                    var context = {
                        title: '글 조회 ',
                        posts: results,
                        Entities: Entities,
                        user_info : user
                    };

                    req.app.render('showpost', context, function(err, html) {
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
                    res.write('<h2>글 조회 실패</h2>');
                    res.write('<a type="button" href="../listpost" >돌아가기</a>');
                    res.end();
                }
            });
        } else {
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h2>데이터베이스 연결 실패</h2>');
            res.end();
        }
    } else {// 사용자 인증이 안 된 경우 (로그인으로 전송)
        res.redirect('/login');
    }
};

// module.exports.listpost = listpost;
// module.exports.addpost = addpost;
// module.exports.deletepost = deletepost;
// module.exports.showpost = showpost;
// module.exports.addcomments = addcomments;
// module.exports.deletecomments = deletecomments;


module.exports.setToken = setToken;
module.exports.test = test;


