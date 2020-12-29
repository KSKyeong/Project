/*var pool;

var init = function(pool) {
	console.log('init 호출됨');
	pool = pool;
	console.log(pool);
}*/

var login = function(req, res) {
	console.log('process/login 호출됨');
	
	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;
	
	console.log('요청 파라미터 : '+ paramId + ', ' + paramPassword);


	/*req.session.user = {
		id: paramId,
		password: paramPassword,
		authorized: true
	};*/
	////////===========
	var pool = req.app.get('pool');
//	console.dir(pool);
	///////============

	if(pool) {
		authUser(paramId, paramPassword, pool, function(err, rows) {
		if(err) {
			console.log('사용자 로그인 중 에러 발생' + err.stack);
			res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
			res.write('<h1> 사용자 로그인 중 오류 발생 </h1>');
			res.write('<p>' + err.stack + '</p>');
			res.end();
			return;
		}
		if(rows) {
			console.dir(rows);

			// 로그인 성공 시 저절로 세션 만들기 - 입력 받은 정보들로.
			var username = rows[0].name;
			var userAge = rows[0].age;
			req.session.user = {
				id: paramId,
				password: paramPassword,
				name: username,
				age: userAge,
				authorized: true
			};
			res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
			res.write('<h1> 로그인 성공!! </h1>');
			res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
			res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
			res.write("<form method='get' action='/process/logout'>");
			res.write('<input type="submit" value="로그아웃" name=""></form>');
			res.write("<form method='get' action='/process/change'>");
			res.write('<input type="submit" value="회원정보 수정" name=""></form>');
			res.write("<form method='get' action='/process/cancle'>");
			res.write('<input type="submit" value="회원탈퇴" name=""></form>');
			res.write("<form method='get' action='/process/gomemo'>");
			res.write('<input type="submit" value="메모 작성" name=""></form>');
			res.end();

		} else {
			// 로그인 실패 시
			res.redirect('/public/login_fail.html');

			/*
			req.session.destroy(function(err) {
				if(err) {throw err};

				console.log('로그인 시도 실패.');
				res.redirect('/public/login_fail.html');
			});*/
		}

		});
	} else {
		res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
		res.write('<h1> DB 연결 실패 ㅜㅜ </h1>');
	}

		
};

var adduser = function(req, res) {
	console.log('/process/adduser 호출됨');
	
	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;
	var paramName = req.body.name || req.query.name;
	var paramAge = req.body.age || req.query.age;
	
	console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName + ', ' + paramAge);
	
	var pool = req.app.get('pool');
	console.dir(pool);
	
	if(pool) {
		addUser(paramId, paramName, paramAge,  paramPassword, pool, function(err, addedUser) {
			// 동일한 id로 추가할 때 오류는 발생한다. --> 클라이언트에게 오류 전송
			if(err) {
				console.error('사용자 추가 중 오류 발생\n' + err.stack);
				res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
				res.write('<h1> 사용자 추가 중 오류 발생 </h1>');
				res.write('<p>' + err.stack + '</p>');
				res.end();
				return;
			}
			// 결과 객체 있으면 (추가가 되었다면) 성공 응답 전송
			if(addedUser) {
				console.dir(addedUser);
				
				console.log('inserted ' + addedUser.affectedRows + ' rows');
				
				var insertId = addedUser.insertId;
				console.log('추가한 레코드의 아이디 : ' + insertId);
				
				res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
				res.write('<h1> 사용자 추가 성공!! </h1>');
				res.write("<br><br><a href='/public/login2.html'> 로그인 페이지로 이동 </a>");
				res.end();
				console.log('--------------------------------------------------------');
			}else {
				res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
				res.write('<h1> 사용자 추가 실패. </h1>');
				res.end();
			}
		});
	} else { //데이터 베이스 객체가 초기화 되지 않은 경우
		res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
		res.write('<h2> 데이터 베이스 연결 실패 </h2>');
		res.end();
	} 	
}

var cancleuser = function(req, res) {
	console.log('process/cancle 호출됨');
	
//	var userID = req.session.user.id;
	
	// 로그인 상태를 먼저 점검한다.
	if (req.session.user) {
		console.dir(req.session.user);
		
		// 함수를 통해 세션 삭제 및 로그아웃, 탈퇴가 가능하게
		var userID = req.session.user.id;
		var userPW = req.session.user.password;
		
		var pool = req.app.get('pool');
		
		if(pool) {
			// 수정한다.
			cancleUser(userID, userPW, pool, function(err, rows) {
				if(err) {
				console.log('회원 탈퇴중 오류 발생' + err.stack);
				res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
				res.write('<h1> 탈퇴중 오류 발생 </h1>');
				res.write('<p>' + err.stack + '</p>');
				res.end();
				return;
				}
				
				if(rows) {
					res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
					res.write('<h1> 회원 탈퇴 성공!! </h1>');
					res.write("<br><br><a href='/public/login2.html'> 다시 로그인하기 </a>");

					res.end();
					console.log('--------------------------------------------------------');
				} else {
					res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
					res.write('<h1> 뭔가 이상함 </h1>');
					res.write("<br><br><a href='/public/login2.html'> 다시 로그인하기 </a>");
					res.end();
				}
			});
		} else { //데이터 베이스 객체가 초기화 되지 않은 경우
			res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
			res.write('<h2> 데이터 베이스 연결 실패 </h2>');
			res.end();
		}
		
	}
	else {
		//로그인이 안된 상태
		console.log(' 아직 로그인이 되지 않았는데요?');
		res.redirect('/public/login2.html');
	}
}

var logout = function(req, res) {
	console.log('/process/logout 호출됨.')
	if (req.session.user) {
		console.log('로그아웃 및 세션 삭제 합니다');
		
		req.session.destroy(function(err) {
			if(err) {throw err};
			
			console.log('세션 삭제 및 로그아웃 완료.');
			res.redirect('/public/login2.html');
		});
	}
	else {
		//로그인이 안된 상태
		console.log(' 아직 로그인이 되지 않았는데요?');
		res.redirect('/public/login2.html');
	}
}


//==========아래는 핵심 함수=============//

// 사용자 인증을 위한 함수 (authUser)
var authUser = function(id, password, pool, callback) {
	console.log('authUser 호출됨');
	
	pool.getConnection(function(err, conn) {
		if(err) {
			if(conn) {
				conn.release();
			}
			callback(err, null);
			return;
		}
		console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
		
		var colums = ['id', 'name', 'age'];
		var tablename = 'users';
		
		//SQL문 실행
		var exec = conn.query("select ?? from ?? where id = ? and password = ?", [colums, tablename, id, password], function(err, rows) {
			conn.release();
			console.log('실행 대상  SQL : ' + exec.sql);
			
			if(rows.length > 0) {
				console.log('아이디 [%s], 패스워드 [%s], 가 일치하는 사용자 찾음', id, password);
				callback(null, rows);
			} else {
				console.log('일치하는 사용자를 찾지 못함.');
				callback(null, null);
			}
		});
	});
}

// 사용자 추가를 위한 함수 정의 (addUser)
var addUser = function(id, name, age, password, pool, callback) {
	console.log('adduser 호출됨.');
	
	//커넥션 풀에서 연결객체 가져온다.
	pool.getConnection(function(err, conn) {
		if(err) {
			console.log('에러 발생');
			if(conn) {
				console.log('conn은 있음?');
				conn.release(); // 반드시 해제해야 한다?
			}
			
			callback(err, null);
			return;
		}
		
		console.log('데이터 베이스 연결 스레드 아이디 : ' + conn.threadId);
		
		// 데이터를 객체로 만든다. --> SQL문에서 ? 연산자를 활용하기 위해.
		var data = {id:id, name:name, age:age, password:password};
		
		//SQL문 실행
		var exec = conn.query('insert into users set ?', data, function(err, result) {
			conn.release();
			console.log('실행 대상 SQL : ' + exec.sql);
			
			if(err) {
				console.log('SQL 실행 시 오류 발생함. ');
				console.dir(err);
				
				callback(err, null);
				return;
			}
			
			callback(null, result);
		});
	});
}

// 회원 탈퇴를 위한 함수 정의(cancleUser)
var cancleUser = function(id, pw, pool, callback) {
	pool.getConnection(function(err, conn) {
		if(err) {
			if(conn) {
				conn.release();
			}
			callback(err, null);
			return;
		}
		console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
		
		var sql = 'DELETE FROM ?? WHERE id = ? AND password = ?';
		var tablename = 'users';
		
		var exec = conn.query(sql, [tablename, id, pw], function(err, rows) {
			conn.release();
			console.log('실행 대상  SQL : ' + exec.sql);
			if(err) {callback(err, null);}
			console.log(rows);
			if(rows.affectedRows > 0) {
				console.log('사용자 회원 탈퇴 완료!');
				callback(null, rows);
			} else {
				console.log('제대로 탈퇴 되지 않음;');
				callback(null, null);
			}
		});
	});
}



module.exports.login = login;
module.exports.logout = logout;
module.exports.adduser = adduser;
module.exports.cancleuser = cancleuser;