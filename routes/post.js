// html-entities module is required in showpost.ejs
//var Entities = require('html-entities').AllHtmlEntities;
var Entities = require('html-entities');

var addcomments = function(req, res) {
    console.log('post 모듈 안에 있는 addcomments 호출됨.');
    
    // 댓글 내용
    var comment = req.body.comments || req.query.comments;
    // 댓글 작성자의 Obj_id
    var com_writerID = req.body.com_writerID || req.query.com_writerID;
    // 댓글 달릴 글의 Obj_id
    var content_id = req.body.content_id || req.query.content_id; 
    
    console.log('요청 파라미터 : ' + comment + ', 작성자:' + com_writerID + ', 댓글 달릴 글:' + 
               content_id);
    
    var database = req.app.get('db');
    if(database.db) {
        database.PostModel.commentsupdate(content_id, comment, com_writerID, function(err, results) {
            if (err) {
                console.error('댓글 추가 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>댓글 추가 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
            if (results) {
                console.log(results);
                console.log('댓글 등록 완료 ');
                return res.redirect('/process/showpost/' + content_id);
            }
            console.log('댓글 등록 실패?');
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h2>댓글 추가 중 무시 현상 발생</h2>');
            res.end();
            return ;
        });
    } else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
    
}

var deletecomments = function(req, res) {
    console.log('post 모듈 안에 있는 deletecomments 호출됨.');
    
    // 삭제할 댓글의 ID
    var comment_id = req.body.del_comment || req.query.del_comment;
    // 삭제할 댓글이 달린 게시글의 ID
    var post_id = req.body.del_post || req.query.del_post;
    console.log(comment_id + ': 댓글의 고유 ID, ' + post_id + ': 게시물의 고유 ID');
    
    var database = req.app.get('db');
    if(database.db) {
        // 
        database.PostModel.commentsdelete(comment_id, post_id, function(err, results) {
            if (err) {
                console.error('댓글 삭제 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>댓글 삭제 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
            if (results) {
                console.log(results);
                console.log('댓글 삭제 완료 ');
                return res.redirect('/process/showpost/' + post_id);
            }
            console.log('댓글 삭제 실패?');
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h2>댓글 추가 중 삭제 현상 발생</h2>');
            res.end();
            return ;
        });
        /*var index = -1;
        database.PostModel.load(post_id, function(err, results) {
            console.log(results);
            var array = results.comments;
            for(var i = 0; i < array.length; i++) {
                if(array[i]._id === comment_id) {
                    index = i;
                }
            }
            
        });
        
        if(index != -1) {
            database.PostModel.commentsdelete(post_id, index, function(err, result) {
                
            })
        }*/
     
    } else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
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

module.exports.listpost = listpost;
module.exports.addpost = addpost;
module.exports.deletepost = deletepost;
module.exports.showpost = showpost;
module.exports.addcomments = addcomments;
module.exports.deletecomments = deletecomments;

