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

var login_ids = {};

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
        database.UserModel.findOne({'email' : login.email}, function(err, user) {
            if(err) {
                sendAlert(socket, 'login', '404', '사용자 인증 과정 중 에러 발생!');
            }

            if(!user || user.length < 1) {
                console.log('입력된 email 과 일치하는 사용자 정보가 없다.');
                sendAlert(socket, 'login', '404', '입력된 email 과 일치하는 사용자 정보가 없다.');
                return;
            }
            console.dir(user._doc);

            var authenticated = user.authenticate(login.password, user._doc.salt, user._doc.hashed_password);

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
                socket.handshake.session.save();

                console.log('로그인 한 전체 클라이언트의 수 : %d', Object.keys(login_ids).length);
                
                var statusObj = {message: '< ' +login.email + ' > 로그인 되었습니다.'};
                // 사용자의 방 리스트들을 배열로 넘겨준다.
                database.RoomModel.getrooms(user._doc._id, function(err, rooms) {
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
        console.log('message 이벤트를 받았습니다');
        console.log(socket.handshake.session);
        console.dir(message);
        message.sender = socket.handshake.session.email;
        console.log('전송한 클라이언트 정보 추가 with session?');
        console.dir(message);
        
        if(message.recipient == 'ALL') {
            //나를 포함한 모든 클라에게 메시지 전달
            console.log('나를 포함한 모든 클라에게 message 이벤트를 전송합니다.');
            
            io.sockets.emit('message', message);
        } else {
            if(login_ids[message.recipient]) {
                     
                // io.sockets[login_ids[message.recipient]].emit('message', message); 
//                -> socket.io 버전 문제로 수정
                socket.to(login_ids[message.recipient]).emit('message', message);
                //응답 메시지 전송
                sendResponse(socket, 'message', '200', '메시지를 전송했습니다.');
            } else {
                //보내고자 하는 클라가 로그인 하지 않았을 때.
                sendResponse(socket, 'login', '404', '상대방의 로그인 ID를 찾을 수가 없습니다.');
            }
       } 
        
    });
    
    
    
    
    socket.on('logout', function(logout) {
        console.log('로그아웃을 진행합니다');
        console.log(socket.handshake.session.email);
        var logout_idx = socket.handshake.session.email;
        delete login_ids[logout_idx];
        console.log(login_ids);
        if (socket.handshake.session.email) {
            delete socket.handshake.session.email;
            socket.handshake.session.save();
        }
        var statusObj = {message:'로그아웃되었습니다.'};
        socket.emit('logouted', statusObj);
           
    });
    
    // 클라이언트의 방 생성, 수정, 삭제 이벤트를 받아 처리 후 클라에게 다시 현재 룸들의 정보를 room 이벤트로 emit
    socket.on('room', function(room) {
        
        console.log('room 이벤트를 받았다.');
        console.dir(room);
        
        
//        console.dir(socket.rooms[login_ids[room.roomId]]);
        
        if(room.command === 'create') {
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
        
        
        
        } else if (room.command === 'update') {
            var curRoom = io.sockets.adapter.rooms[room.roomId];
            curRoom.id = room.roomId;
            curRoom.name = room.roomName;
            curRoom.owner = room.roomOwner;
        } else if (room.command === 'delete') {
            socket.leave(room.roomId);
            
            if(io.sockets.adapter.rooms[room.roomId]) {
                delete io.sockets.adapter.rooms[room.roomId];
            } else {
                console.log('방이 만들어져 있지 않습니다');
            }
        }
        
        // room 이벤트를 처리하고 난 후 현재 방 리스트를 클라에게 보내준다.
        var roomList = getRoomList();
        
        var output = {command : 'list', rooms : roomList};
        console.log('클라이언트로 보낼 데이터 : ' + JSON.stringify(output));
        
        // 모든 연결 소켓 객체들에게 room 이벤트 전달.
        io.sockets.emit('room', output);
    })
    
})

// 사용자가 추가한 room 정보만 리스트를 만들어 반환 해주는 함수
function getRoomList() {
    console.log('getRoomList 호출됨');
    /*console.log(io.sockets);
    console.log(io.sockets.sockets);
    console.dir(io.sockets.adapter.rooms);*/
//    console.log(io.sockets.in());
    console.dir(Object.keys(io.sockets.adapter.rooms)); 
    
    var roomList = [ ];
    
    Object.keys(io.sockets.adapter.rooms).forEach(function(roomId) {
        console.log('current room id : ' + roomId);
        var outRoom = io.sockets.adapter.rooms[roomId];
        
        var foundDefault = false;
        var index = 0;
        Object.keys(outRoom.sockets).forEach(function(key) {
            console.log('#' + index + ' : ' + key + ', ' + outRoom.sockets[key]);
            
            
            if(roomId == key) { // default room
                foundDefault = true;
                console.log('this is dafault room.');
            }
            index++;
        });
        
        if(!foundDefault) {
            roomList.push(outRoom);
        }
    });
    
    console.log('[Room List]');
    console.dir(roomList);
    
    return roomList;
}


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









