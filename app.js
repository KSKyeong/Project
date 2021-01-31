/* MongoDB 버젼. 
 #메인 파일#
 (모듈파일 : 현재 총 5개
 config - 설정파일, 
 user_schema_mongo - 스키마 및 모델 관한 설정, 
 database_loader - 스키마 및 모델 객체 생성 후 메인 파일 내 app 객체에 db 속성으로 추가, 
 user_mongo - 사용자 관련 라우팅 및 처리 함수 분리,
 route_loader - 분리 해놓은 사용자 관련 함수들을 init()하여 router를 등록해준다. )
 
 12/7 virtual 함수 활용한 hashed_password 스키마 수정 및 UserSchema.js 모듈파일로 분리
 12/8 모듈 분리 할 것 -> 분리 완료.
 12/8 
 12/10 ejs 뷰템플릿 적용
 12/11 Mission08 하기 : 사용자 정보 수정 관련 함수 완성, 
 12/12 패스포트 활용하기 공부
 12/13 메모 저장 with 사진 기능 구현 -> 보수 필요(동일 사용자 중복 업로드 가능.)
 12/14 암것도 안 함
 12/15 패스포트 개념과 콜백함수의 필요성
 12/16 클로져의 이해 + 패스포트 전부다
 12/18 패스포트 -> 페이스북을 활용한 로그인 기능 구현, 페이스북 내의 사용자 정보에 따라 facebook.js의 Strategy를 조금씩 바꿔줘야 한다. 현재는 로컬 로그인, facebook 로그인 둘다 가능하게 데베 콜렉션 수정했음.
 12/19 채팅 서버 만들기
 12/22 채팅서버 완료하기 (실패), 로그아웃 기능 추가함
 12/23 채팅서버 완료하기 -> room 리스트 이슈 해결 부족, 우선 다음 단계 진행
 12/27 rpc서버 공부 및 프로젝트 진행
 2021>
 1/2 주제 선정 완료 : 번개 모임 플랫폼 
 - 로그인 기능 수정(email 유효성, 유일성 만족),
 - 게시판 만들기
 1/4
 - 댓글 삭제 기능 PostSchema에 삭제 관련 함수 잘 모르겠음. --> 댓글 삭제 기능 구현
 1/7
 - 게시글 및 댓글 추가 삭제 모두 완료
 - sign_up 시에, friend 컬렉션 자동 생성(local, facebook) -> user_id 속성값으로 _id 값을 넣어줌
 1/9
 - 프로필 보기, 친구 추가 및 삭제
 1/17
 - Ajax 관련 이슈 피드백 -> socketio로 그냥 구현 or 프론트엔드 프레임워크 사용해보자.
 1/22
 - 
 */



var express =  require('express')
	,http = require('http')
	,path = require('path');

var bodyParser = require('body-parser')
	,cookieParser = require('cookie-parser')
	,static = require('serve-static')
	,errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');

var expressSession = require('express-session');

var crypto = require('crypto');

var MongoClient = require('mongodb').MongoClient;

//var route_user = require('./routes/user_mongo');

// 설정 파일 모듈 불러오기
var config = require('./config/config');

var database_loader = require('./database/database_loader');

var route_loader = require('./routes/route_loader');

var ejs = require('ejs');

var multer = require('multer');

//=========Passport 모듈 추가========//
var passport = require('passport');
var flash = require('connect-flash');
var LocalStrategy = require('passport-local');
var configPassport = require('./config/passport');
var userPassport = require('./routes/user_passport_mongo');

// socket.io 모듈 사용
var socketio = require('socket.io')(server);
var cors = require('cors');

var sharedsession = require("express-socket.io-session");

var sessionMiddleware = expressSession({
    name: "User_cookie",
    secret: "my key",
    resave: true,
    saveUninitialized: true,
    store: new (require("connect-mongo")(expressSession))({
        url: "mongodb://localhost:27017/local"
    })
});



var app = express();

// 뷰엔진 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 성정되었습니다.');
// 뷰엔진 설정 완료

app.set('port', process.env.PORT || config.server_port);
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
/*app.use(expressSession({
	secret: 'my key',
	resave: true,
	saveUninitialized: true
}));*/
app.use(sessionMiddleware);

//===passport 사용 설정===//
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
configPassport(app, passport);
userPassport(app, passport);

var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, 'uploads')
	},
	filename: function (req, file, callback) {
		callback(null, Date.now() + file.originalname)
	}
});
var upload = multer({
	storage: storage,
	limits: {
		files: 10,
		fileSize: 1024 * 1024 * 1024
	}
});
app.set('upload', upload);

app.use(cors());


var router = express.Router()
route_loader.init(app, router);


var errorHandler = expressErrorHandler({
	static: {
		'404': './public/404.html'
	}
});
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);


//===== 시작된 서버 객체 반환받는다. =======//
var server = http.createServer(app).listen(app.get('port'), function() {
	console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
	// 데이터 베이스 연결
	database_loader.init(app, config);
	
	// database의 초기화가 다 된 후에 app 객체에 db 속성으로 database 객체를 넣어준다. ->  ./routes/user_mongo.js 모듈 파일에서 database 객체를 참조하기 위해. (순서 주의)

});


// socket.io 서버를 시작
var io = socketio.listen(server);
console.log('socket.io 요청을 받을 준비가 됨');

let login_ids = {};
let room_ids = {};

// 세션 관린 미들웨어
io.use(sharedsession(sessionMiddleware, {autoSave:true}));
/*io.use(function(socket, next){
        // Wrap the express middleware
        sessionMiddleware(socket.request, {}, next);
    });*/


// 클라이언트가 연결했을 때 이벤트 처리 - sockets 객체는 클라가 접속하거나 데이터를 전송했을 때, 이벤트 발생
io.sockets.on('connection', function(socket) {
    console.log('connection info : '+ JSON.stringify(socket.request.connection._peername));
    
    //소켓 객체에 클라이언트 Host, Port 정보 속성으로 추가
    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;
    
    console.log(socket.handshake.session);
    
    
    
    
    
    // 로그인 이벤트를 어떻게 처리할 것인가
    socket.on('login', function(login) {
        console.log('login 이벤트를 받았습니다.');
        console.dir(login); // id와 비밀번호의 정보가 담겨있다.
        var database = app.get('db');
        database.UserModel.findByEmail(login.email, function(err, user) {
            if(err) {
                sendAlert(socket, 'login', '404', '사용자 인증 과정 중 에러 발생!');
            }

            if(!user || user.length < 1) {
                console.log('입력된 email 과 일치하는 사용자 정보가 없다.');
                sendAlert(socket, 'login', '404', '입력된 email 과 일치하는 사용자 정보가 없다.');
                return;
            }
            console.dir('--------------=-==============-=-=-==');
            console.log(user[0]._doc._id);

            var authenticated = user[0].authenticate(login.password, user[0]._doc.salt, user[0]._doc.hashed_password);

            if (!authenticated) { // 비밀번호 틀렸을 경우
                console.log('비밀번호 일치하지 않음');
                sendAlert(socket, 'login', '404', '로그인 실패');
            } else {
                // 정상인 경우 -> 인증 성공인 경우 (login list => [서버 실행 중 간이 DB] 에 정보 저장 ).
                console.log('chating 서버에서 로그인 성공');

                // 로그인 된 아이디들을 배열에 저장.
                console.log('접속한 소켓의 ID(소켓 고유) : ' + socket.id);
                login_ids[login.email] = socket.id;
                socket.login_email = login.email;
                console.log(login_ids);
                socket.handshake.session.email = login.email;
                socket.handshake.session._id = user[0]._doc._id;
                socket.handshake.session.save();

                console.log('로그인 한 전체 클라이언트의 수 : %d', Object.keys(login_ids).length);
                
                var statusObj = {message: '< ' +login.email + ' > 로그인 되었습니다.'};
                // 사용자의 방 리스트들을 배열로 넘겨준다.
                database.RoomModel.getrooms(user[0]._doc._id, function(err, rooms) {
                    if(err) {
                        sendAlert(socket, 'login', '404', '채팅방 로딩 중 에러 발생!');
                    }
                    statusObj.rooms = rooms;
                    //응답 메시지 전송
                    socket.emit('logined', statusObj);
                    return;
                });
                
                return;
                
                
            }
            
            
        });
        
        
    });
    
    //message 이벤트 받았을 때 처리
    socket.on('message', function(message) {
        
        // 인증 후
        if(socket.handshake.session.email && socket.handshake.session._id) {
            
            console.log('message 이벤트를 받았습니다');
            console.log(socket.handshake.session);
            if(message.data == "") {
                sendAlert(socket, 'message', '404', '내용을 입력하세요!');
                return;
            }
            
            /*message.sender = socket.handshake.session.email;*/
            var database = app.get('db');
            console.dir(message);
            message.sender = socket.handshake.session.email;
            message.sender_id = socket.handshake.session._id;
            console.dir(message);
            var sender_id = socket.handshake.session._id;
            var room_id = room_ids[sender_id];
            /*console.log(room_id);*/
            
            // 1. 받은 메시지 내용을 DB에 저장
            database.RoomModel.findOneAndUpdate({_id:room_id},
                {'$push': 
                    {chats: {
                            writer_id: sender_id,
                            content: message.data
                        }
                    }
                },
                {'new':true, 'upsert':true}, function(err, result) {
                if (err) {
                    console.error('메시지 DB 추가 중 에러 발생 : ' + err.stack);
                    sendError(socket, 'message', '404', '메시지 저장 중 오류 발생');
                    return;
                }
                console.log('-----------');
                if(result._doc.chats){

                    var idx = result._doc.chats.length - 1;
                    console.dir(idx);
                    if(result._doc.chats[idx]._doc._id) {
                        var newChatId = result._doc.chats[idx]._doc._id;
                        console.log(newChatId);
                        // 2. 방 내의 클라이언트들에게 이벤트 발생
                        // 새로 추가 된 메시지 정보 받기
                        database.RoomModel.newchat(room_id, newChatId, function(err, chat) {
                            if (err) {
                                console.error('새 메시지 불러오는 중 에러 발생 : ' + err.stack);
                                sendError(socket, 'message', '404', '메시지 저장 중 오류 발생');
                                return;
                            }
                            
                            if(chat._doc.chats[0]._doc) {
                                
                                socket.emit('message', {data: chat._doc.chats[0]._doc, self: true});
                                socket.to(room_id).emit('message', {data: chat._doc.chats[0]._doc, self: false});
                            }
                            return;
                        });
                        return;

                    } else {
                        console.error('새 메시지 불러오는 중 에러 발생 : ' + err.stack);
                        sendError(socket, 'message', '404', '메시지 저장 실패');
                        return;
                    }


                } else {
                    console.error('새 메시지 불러오는 중 에러 발생 : ' + err.stack);
                    sendError(socket, 'message', '404', '메시지 저장 실패');
                    return;
                }  
            });
            
            /*database.RoomModel.addchats(room_id, message.data, sender_id, function(err, result) {
                if(err) {
                    sendError(socket, 'message', '404', '메시지 저장 중 오류 발생');
                    return;
                }
                console.log('-----------');
                console.dir(result);
                
                if(result.nModified == 1) {
                    // 2. 방 내의 클라이언트들에게 이벤트 발생
                    message.self = false;
                    socket.to(room_id).emit('message', message);
                    message.self = true;
                    socket.emit('message', message);
                    return;
                } else {
                    sendError(socket, 'room', '404', '방 정보 업데이트 중 오류 발생');
                    return;
                }
                    
            });*/
            return;
            
        } else {
            sendAlert(socket, 'room', '404', '우선 로그인 해주세요!');
        }
        
         
        
    });
    
    
    
    
    socket.on('logout', function(logout) {
        console.log('로그아웃을 진행합니다');
        console.log(socket.handshake.session.email);
        var logout_idx = socket.handshake.session.email;
        delete login_ids[logout_idx];
        console.log(login_ids);
        if (socket.handshake.session.email || socket.handshake.session._id) {
            delete socket.handshake.session.email;
            delete socket.handshake.session._id;
            socket.handshake.session.save();
        }
        var statusObj = {message:'로그아웃되었습니다.'};
        socket.emit('logouted', statusObj);
           
    });
    
    
    
    // 클라이언트의 방 입장, 생성, 수정, 삭제 이벤트를 받아 처리 후 클라에게 다시 현재 룸들의 정보를 room 이벤트로 emit
    // 기존 방에 새로운 클라나 기존 멤버가 들어왔을 때 알림 보여준다.
    socket.on('room', function(room) {
        
        if(socket.handshake.session.email && socket.handshake.session._id) { // 우선 클라이언트의 인증 (세션 유무)
            console.log(socket.handshake.session);
            
            console.log('room 이벤트를 받았다.');
            console.dir(room);
            
            var database = app.get('db');
            var user_email = socket.handshake.session.email;
            var user_id = socket.handshake.session._id;
            
            
            if (room.command === 'in') { // 방 입장 이벤트이다
                
                // 입력 값으로 공백을 넘겼다면 다시 입력 하라고 한다.
                if(room.roomName == "") {
                    sendAlert(socket, 'room', '404', '방 이름을 입력하세요');
                    console.log('방 이름이 공백');
                    return;
                }
                
                // 방의 유무를 먼저 따진다
                database.RoomModel.roomauth(room.roomName, function(err, result) {
                    if(err) {
                        sendError(socket, 'room', '404', '방 조회 중 오류 발생');
                        return;
                    }
                    console.log('-----------');
                    
                    
                    if(result.length > 0) { // 이름 일치하는 방이 있다.
                        // 일치하는 방이 있으면? -> 방의 _id를 통해 join 하고, 방의 정보를 불러온다
                        console.log('일치하는 방을 찾음');
                        var room_id = result[0]._doc._id.toString(); //ObjectID -> String
                        // 
                        room_ids[user_id] = room_id;
                        console.log(room_ids);
                        socket.join(room_id); // join
                        console.log('user_id : ' + user_id  + ' joined --> room_id : ' + room_id );
                        
                        // 새로운 참가자는 room 컬렉션에 id 넣어주고, 원래 있던 사람은 무시?
                        // addToSet 함수를 사용할 때, 갱신되는 문제점 발생 -> 배열 내에 값이 중복되면 무시하는 방법 생각해야함 upsert 다시 확인
                        database.RoomModel.userspull(room_id, user_id, function(err, result_pull) {
                            
                            database.RoomModel.userspush(room_id, user_id, function(err, result) {
                                if(err) {
                                    sendError(socket, 'room', '404', '유저 정보 업데이트 중 오류 발생');
                                    console.log(err);
                                    return;
                                }
                                if(!result) {
                                    sendError(socket, 'room', '404', '새로운 방에 입장 합니다?');

                                }
                                console.log('확인 해보기');
                                console.dir(result);

                                // 수정이 되면, 방의 채팅 내용, 방장, 사용자 정보 함께 반환.
                                if(result.nModified == 1) {
                                    console.log('조회 및 채팅 내용 반환 할 차례');
                                    
                                    // 데이터 넘겨주는 과정 및, 이벤트(init, in) 전달 방법 고민
                                    database.RoomModel.loadroom(room_id, function(err, room_init) {
                                       if(err || !room_init) {
                                            sendError(socket, 'room', '404', '방 정보 불러오는 중 오류 발생');
                                            return;
                                        }
                                        /*console.dir(room_init._doc);*/
                                        if(room_init) {
                                            var output1 = {command : 'init', room_init : room_init, user_id : user_id };
                                            console.log('클라이언트로 보낼 데이터 : ');
                                            console.dir(JSON.stringify(output1));
                                            // 같은 방 소켓 객체들에게 room 이벤트 전달.
                                            /*socket.to(login_ids[user_email]).emit('room', output1);*/
                                            socket.emit('room', output1);
                                            
                                            // 접속해있는 다른 사용자에게 알림 준다?
                                            var output2 = {command : 'in', message : user_email + ' 님 접속!'};
                                            io.sockets.in(room_id).emit('room', output2);
                                            return;
                                        }

                                    });

                                    return;
                                } else { // room 컬렉션 내에 참가자 정보 업데이트 안되었을 때
                                    sendError(socket, 'room', '404', '방 정보 업데이트 중 오류 발생');
                                    return;
                                }
                            });
                            return;
                        });
                        
                        sendResponse(socket, 'room', '200', room.roomName + ' 입장 되었습니다.');
                        return;
                        
                    } else {
                        sendAlert(socket, 'room', '404', '존재하지 않는 방 이름입니다.');
                        return;
                    }
                });
            } 
            
            else if(room.command === 'create') {
                //io.sockets는 전체 연결된 객체의 정보 담고있음
                if(io.sockets.adapter.rooms[room.roomId]) {
                    console.log('방이 이미 만들어져 있습니다.');

                } else {
                    console.log('방을 새로 만듭니다.');

                    socket.join(room.roomId);
                    console.log(io.sockets.sockets[room.roomId]);
                    console.log(io.sockets.allSockets());
                    //console.log(io.sockets.in(room.roomId));

                    /*var curRoom = io.sockets.adapter.rooms[room.roomId];
                    console.log(curRoom);

                    curRoom.id = room.roomId;
                    curRoom.name = room.roomName;
                    curRoom.owner = room.roomOwner;*/
                } 



            } 
            
            else if (room.command === 'update') {
                var curRoom = io.sockets.adapter.rooms[room.roomId];
                curRoom.id = room.roomId;
                curRoom.name = room.roomName;
                curRoom.owner = room.roomOwner;
            } 
            
            else if (room.command === 'delete') {
                socket.leave(room.roomId);

                if(io.sockets.adapter.rooms[room.roomId]) {
                    delete io.sockets.adapter.rooms[room.roomId];
                } else {
                    console.log('방이 만들어져 있지 않습니다');
                }
            }
            
            
        } else {
            // 세션 값이 없을 때 -> 로그인 안내
            sendAlert(socket, 'room', '404', '우선 로그인 해주세요!');
        }
        
    })
    
})



function sendResponse(socket, command, code, message) {
    var statusObj = {command:command, code:code, message:message};
    socket.emit('response', statusObj);
}
function sendError(socket, command, code, message) {
    var statusObj = {command:command, code:code, message:message};
    socket.emit('error', statusObj);
}
function sendAlert(socket, command, code, message) {
    var statusObj = {command:command, code:code, message:message};
    socket.emit('alert', statusObj);
}









