// app.js 에서 이 모듈 파일을 참조한다.

var fs = require('fs');

var gomemo = function(req, res) {
    console.log('/process/gomemo 실행됨');
    if(req.session.user) {
        var userid = req.session.user.id;
        var username = req.session.user.name;
        var context = {userid:userid, username:username};
        
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf8'});
        
        req.app.render('memo', context, function(err, html) {
            if(err) {
                console.log('메모 페이지로 이동 중 오류 발생');
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>메모 페이지로 이동 중 오류 발생</h2>');
                res.write('<p>'+err.stack +'<p>');
                res.end();

                return;
            }
            console.log(html);
            res.end(html);
        });
    } else {
        console.log('로그인이 되지 않았습니다.');
        res.redirect('/public/login_responsive.html');
    }
}

var domemo = function (req, res) {
	
    console.log('/process/domemo 호출됨');

    // 메모 정보 받음.
    var paramDes = req.body.description || req.query.description;
    console.log(paramDes);

    // 작성자의 아이디와 이름 정보를 받는다.--> 데베에 저장할 용도
    var userID = req.session.user.id;
    var userName = req.session.user.name;
    var database = req.app.get('db');

    console.log(userID);
    console.log(userName);
    try {
        var files = req.files;

        console.dir('#=======업로드 된 첫번째 파일 정보 ======#');
        console.dir(req.files[0]);
        console.dir('#------#');

        // 현재의 파일 정보를 저장할 변수 선언
        var originalname = '',
            filename = '',
            mimetype = '',
            size = 0;

        if (Array.isArray(files)) {
            console.log("배열에 들어있는 파일 갯수 : %d", files.length);

            for (var index = 0; index < files.length; index++) {
                originalname = files[index].originalname;

                filename = files[index].filename;


                mimetype = files[index].mimetype;
                size = files[index].size;
            }
        } 
        else {
            console.log(' 파일 갯수 : 1!');

            originalname = files[index].originalname;
            filename =  files[index].filename;
            mimetype = files[index].mimetype;
            size = files[index].size;
        }

        console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', ' + mimetype + ', ' + size);
        console.log('저장된 파일 이름' + filename);
        var savedFilename = 'C:/Users/kyung/brackets-nodejs/ViewExample/uploads/' + filename;

        // 저장 됐는지 서버에 업로드 되었는지 확인.
        var infile = fs.readFile(savedFilename, function (err, data) {
                if(err) throw err;
                if(data) {

                    // 데이터베이스에 INSERT()
                    doMemo(database, userID, userName, paramDes, savedFilename, function(err, memo) {
                        if(err) {
                            console.error('메모 관련 DB 저장중 오류 발생' + err.stack);
                            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                            res.write('<h1> 오류 발생 </h1>');
                            res.write('<p>' + err.stack + '</p>');
                            res.end();
                            return;
                        }
                        if(memo) {
                            console.dir(memo);
                            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                            var context = {'id' : userID, 'name' : userName, 'description' : paramDes, 'saved_src' : savedFilename};
                            req.app.render('memo_success', context, function (err, html) {
                                if(err) {
                                    console.log('memo_success 뷰 렌더링 중 오류 발생 : ' + err.stack);
                                    res.writeHead(200, {'Content-Type': 'text/html;charset=utf8'});
                                    res.write('<h2>memo_success 뷰 렌더링 중 오류 발생</h2>');
                                    res.write('<p>'+err.stack +'<p>');
                                    res.end();

                                    return;
                                }
                                console.log('rendered : ' + html);
                                res.end(html);      

                            });
                        }
                    });
                } else {
                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                    res.write('<h1> 메모 추가 실패. </h1>');
                    res.end();
                }

            });
        }
        catch (err) {
            console.dir(err.stack);
        }
}


//=======처리 함수===========//

var doMemo = function(database, userID, userName, paramDes, savedFilename, CB) {
    console.log('doMemo 호출됨');
    var memo = new database.MemoModel({"id":userID, "name":userName, "description":paramDes,
                                          "saved_src" : savedFilename});
    memo.save(function(err) {
		if(err) {
			CB(err, null);
			return;
		}
		console.log('사용자 데이터 추가함');
		CB(null, memo);
/*
		return;
*/
	});
    
    
}

module.exports.gomemo = gomemo;
module.exports.domemo = domemo;























