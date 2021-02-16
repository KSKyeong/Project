/* MongoDB 버젼. 
 #메인 파일#
 (모듈파일 : 현재 총 5개
 config - 설정파일, 
 user_schema_mongo - 스키마 및 모델 관한 설정, 
 database_loader - 스키마 및 모델 객체 생성 후 메인 파일 내 app 객체에 db 속성으로 추가, 
 user_mongo - 사용자 관련 라우팅 및 처리 함수 분리,
 route_loader - 분리 해놓은 사용자 관련 함수들을 init()하여 router를 등록해준다. )
 
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

var favicon = require('serve-favicon');

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
        /*url: "mongodb://localhost:27017/local"*/
        url: "YOUR_URL"
    })
});



var app = express();

// 뷰엔진 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');
// 뷰엔진 설정 완료

app.set('port', process.env.PORT || config.server_port);
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public/favicon/', 'favicon.ico')));
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

// 세션 관련 미들웨어
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
    
    if(socket.handshake.session.passport !== undefined) { // 인증(로그인) 된 소켓이면 -> 로그인 정보 서버 배열에 저장, 자동 채팅방 로드
        var database = app.get('db');
        var user = socket.handshake.session.passport.user;
        console.log(user.email + ', ' + user.name + ', ' + user._id);
        
        // 초기 설정 (세션 있을 경우, 서버 배열에 로그인 된 유저 정보, 초기 채팅방 정보 넘겨주기까지)
        console.log('접속한 소켓의 ID(소켓 고유) : ' + socket.id);
        login_ids[user.email] = socket.id;
        socket.login_email = user.email;
        console.log(login_ids);
        
        console.log('로그인 한 전체 클라이언트의 수 : %d', Object.keys(login_ids).length);
        
        var statusObj = {message: '< ' +user.email + ' > 로그인 되었습니다.'};
        
        // 사용자의 방 리스트들을 배열로 넘겨준다.  나중에는 다른 사람들에게도 이벤트 보내는 방법 생각
        database.RoomModel.getrooms(user._id, function(err, rooms) {
            if(err) {
                sendAlert(socket, 'login', '404', '채팅방 로딩 중 에러 발생!');
                return;
            }
            statusObj.rooms = rooms;
            //응답 메시지 전송
            socket.emit('logined', statusObj);
            
        });
        
        //message 이벤트 받았을 때 처리
        socket.on('message', function(message) {
            
            console.log('message 이벤트를 받았습니다');
            console.log(user);
            
            console.log(room_ids[user._id]);
            console.log(room_ids[user._id] == undefined);
            if(!room_ids[user._id]) {
                roomRefresh(database, user._id, socket);
                sendAlert(socket, 'message', '404', '우선 채팅방에 입장하세요!');
                return;
            }
                
                
            if(message.data == "") {
                sendAlert(socket, 'message', '404', '내용을 입력하세요!');
                return;
            }

            /*message.sender = socket.handshake.session.email;*/
            
            console.dir(message);
            message.sender = user.email;
            message.sender_id = user._id;
            console.dir(message);
            var sender_id = user._id;
            var room_id = room_ids[user._id];
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
                    if(result._doc.chats[idx]._doc._id) { // 메시지가 DB에 잘 저장이 되었다면
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
                                // 메시지 전송한 클라이언트에게 자신이 보낸 메시지 알림
                                socket.emit('message', {data: chat._doc.chats[0]._doc, self: true});

                                // room 안의 클라이언트들에게 broadcast 전송
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

            return;

        });

        // 클라이언트의 방 입장, 생성, 수정, 삭제 이벤트를 받아 처리 후 클라에게 다시 현재 룸들의 정보를 room 이벤트로 emit
        // 기존 방에 새로운 클라나 기존 멤버가 들어왔을 때 알림 보여준다.
        socket.on('room', function(room) {
            
            console.log(socket.handshake.session);

            console.log('room 이벤트를 받았다.');
            console.dir(room);


            var user_email = user.email;
            var user_id = user._id;


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
                        roomRefresh(database, user._id, socket);
                        sendAlert(socket, 'room', '404', '삭제되었거나, 존재하지 않는 방 이름입니다.');
                        
                        return;
                    }
                });
            } 

            else if(room.command === 'create') {
                // 입력 값으로 공백을 넘겼다면 다시 입력 하라고 한다.
                if(room.roomName == "") {
                    sendAlert(socket, 'room', '404', '방 이름을 입력하세요');
                    console.log('방 이름이 공백');
                    return;
                }
                console.log(room.roomName.length);
                if(room.roomName.length <= 10) {
                    var room_name = myTrim(room.roomName);
                    console.log(room_name);
                    
                    // 방 이름 중복 확인
                    database.RoomModel.roomauth(room_name, function(err, result) {
                        if(err) {
                            sendError(socket, 'room', '404', '방 조회 중 오류 발생');
                            return;
                        }
                        
                        console.dir(result.length > 0);
                        if(result.length < 1) {
                            var newroom = new database.RoomModel({
                                name: room_name,
                                owner: user_id
                            });
                            
                            newroom.saveRoom(function(err, result) {
                                if (err) {
                                    sendError(socket, 'room', '404', '새로운 방 생성 중 오류 발생');
                                }
                                if(result) {
                                    var room_id = room_ids[user_id];
                                    room_ids[user_id] = result._id.toString();
                                    console.log(room_ids);
                                    socket.leave(room_id);
                                    socket.join(result._id);
                                    roomRefresh(database, user._id, socket);
                                    sendAlert(socket, 'room', '200', room_name + ' 새로 생성');
                                    return;
                                }
                                
                            });
                        } else {
                            sendAlert(socket, 'room', '404', '이미 존재하는 방의 이름입니다.');
                        }
                        return;
                    });
                } else {
                    sendAlert(socket, 'room', '404', '10자 이내의 방 이름으로 설정해주세요');
                }
                
            } 

            /*else if (room.command === 'update') {
                var curRoom = io.sockets.adapter.rooms[room.roomId];
                curRoom.id = room.roomId;
                curRoom.name = room.roomName;
                curRoom.owner = room.roomOwner;
            } */

            else if (room.command === 'out') {
                console.log('room.out 호출됨');

                // 입력 값으로 공백을 넘겼다면 다시 입력 하라고 한다.
                if(room.roomName == "") {
                    sendAlert(socket, 'room', '404', '방 이름을 입력하세요');
                    console.log('방 이름이 공백');
                    return;
                }
                // 1. 방의 유무 확인 ->  (수정) 방 이름, 
                database.RoomModel.roomauth(room.roomName, function(err, result) {
                    
                    var room_name = room.roomName;
                    if(err) {
                        sendError(socket, 'room', '404', '방 조회 중 오류 발생');
                        return;
                    }

                    if(result.length > 0) { // 일치하는 방이 있다면?
                        var outroom = result[0]._doc;
                        console.dir(result[0]._doc);
                        console.log('방장:' + outroom.owner + ' ==(?) ' + user_id);
                        console.log(outroom.owner == user_id);
                        
                        
                        // 방장일 경우 -> 방 삭제
                        // 방 전체 삭제 및 leave, 알림 발송
                        if(outroom.owner == user_id) { 
                            console.log('방장의 권한으로 방을 삭제 합니다.');
                            /*console.log(outroom._id);
                            console.log(outroom._id.toString());
                            console.log(outroom._id + '');*/
                            database.RoomModel.deleteroom(outroom._id, function(err, result) {
                                if(err) {
                                    console.log('방 삭제 중 오류 발생');
                                    sendError(socket, 'room', '404', '방 삭제 중 오류 발생');
                                    return;
                                }

                                if(result.deletedCount > 0) { // room 컬렉션을 삭제한 경우
                                    console.log('방이 삭제되었습니다.');
                                    
                                    // 삭제한 방에 있던 클라이언트들에게 event 전송
                                    var output = {command: 'deleted'}
                                    socket.to(outroom._id.toString()).emit('room', output);
                                    if(outroom._id == room_ids[user_id]) {
                                        var room_id = room_ids[user_id];
                                        delete room_ids[user_id];
                                        socket.leave(room_id);
                                        console.log('방 leave 및 room_ids 배열 내 삭제 완료');
                                        
                                        socket.emit('room', {command: 'out', roomName : room_name});
                                    }
                                    console.log(room_ids);
                                    roomRefresh(database, user._id, socket);
                                    
                                    // 방장 클라에게 이벤트 전송
                                    sendAlert(socket, 'room', '200', '요청한 방 삭제 완료');

                                    return;

                                } else {
                                    sendError(socket, 'room', '404', '다시 삭제 시도 해보세요');
                                }
                            });

                            return;

                        } 
                        
                        // 방장이 아닐 경우 -> room collection 내 참가자 배열에서 삭제.
                        else { 
                            // leave 및 각 방에 알림 발송
                            console.log('채팅방을 나갑니다. (방장 아님)');
                            if(room_ids[user_id]) {
                                var room_id = room_ids[user_id];
                                delete room_ids[user_id];
                                socket.leave(room_id);
                                console.log('방 leave 및 room_ids 배열 내 삭제 완료');
                                
                                // DB 내의 참가자 배열에서 클라이언트를 제거합니다.
                                database.RoomModel.userspull(outroom._id, user_id, function(err, result) {
                                    
                                    if(err) {
                                        console.log('방 나가기 중 오류 발생');
                                        sendError(socket, 'room', '404', '방 나가는 중 오류 발생');
                                        return;
                                    }
                                    if(result.nModified > 0) {
                                        console.log('------------------=-=-=-=-');
                                        console.dir(result);
                                        socket.emit('room', {command: 'out', roomName : room_name});
                                        return;
                                    } else {
                                        console.log('이 부분을 수정해야할듯함');
                                    }
                                });

                                return;
                            }
                            return;
                        }

                    } else {
                        if(room_ids[user_id]) {
                            console.log('삭제된 방을 leave 한다(클라이언트)');
                            var room_id = room_ids[user_id];
                            delete room_ids[user_id];
                            socket.leave(room_id);
                            console.dir(room_ids);
                            console.log('방 leave 및 room_ids 배열 내 삭제 완료');
                        }
                        sendError(socket, 'room', '404', '방이 삭제 되었거나, 찾을 수 없음');
                        return;
                    }


                });

            } 
            
            else if (room.command === 'refresh') {
                /*var data = {message: ''};*/
                console.log('refresh 이벤트 받음(서버 단)');
                roomRefresh(database, user._id, socket);
                return;
            } 

            else { // 알 수 없는 command 받았을 때.   
                sendError(socket, 'room', '404', '알 수 없는 이벤트 요청임');
            }
            
        });
        
    } else { // 로그인부터 하게끔 리다이렉팅
        var destination = '/login';
        socket.emit('redirect', destination);
        
    }
});



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

function roomRefresh(database, user_id, socket) {
    // 사용자의 방 리스트들을 배열로 넘겨준다.  나중에는 다른 사람들에게도 이벤트 보내는 방법 생각
    database.RoomModel.getrooms(user_id, function(err, rooms) {
        if(err) {
            sendAlert(socket, 'login', '404', '채팅방 로딩 중 에러 발생!');
            return;
        }
        var data = {};
        data.command = 'refresh'
        data.room_list = rooms;
        //응답 메시지 전송
        socket.emit('room', data);
        return;
    });
}

function myTrim(x) {
  return x.replace(/^\s+|\s+$/gm,'');
}










