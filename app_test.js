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
 12/23 채팅서버 완료하기 
 
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
app.use(expressSession({
	secret: 'my key',
	resave: true,
	saveUninitialized: true
}));

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
var io = socketio.attach(server);
console.log('socket.io 요청을 받을 준비가 됨');


var login_ids = {};

// 클라이언트가 연결했을 때 이벤트 처리 - sockets 객체는 클라가 접속하거나 데이터를 전송했을 때, 이벤트 발생
io.sockets.on('connection', function(socket) {
	console.log('connection info :', socket.request.connection._peername);

    // 소켓 객체에 클라이언트 Host, Port 정보 속성으로 추가
    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;
    

    // 'login' 이벤트를 받았을 때의 처리
    socket.on('login', function(login) {
    	console.log('login 이벤트를 받았습니다.');
    	console.dir(login);

        // 기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
        console.log('접속한 소켓의 ID : ' + socket.id);
        login_ids[login.id] = socket.id;
        socket.login_id = login.id;

        console.log('접속한 클라이언트 ID 갯수 : %d', Object.keys(login_ids).length);

        // 응답 메시지 전송
        sendResponse(socket, 'login', '200', '로그인되었습니다.');
    });

    
    // 'message' 이벤트를 받았을 때의 처리
    socket.on('message', function(message) {
    	console.log('message 이벤트를 받았습니다.');
    	console.dir(message);
    	
        if (message.recepient =='ALL') {
            // 나를 포함한 모든 클라이언트에게 메시지 전달
        	console.dir('나를 포함한 모든 클라이언트에게 message 이벤트를 전송합니다.')
            io.sockets.emit('message', message);
        } else {
        	// command 속성으로 일대일 채팅과 그룹채팅 구분
        	if (message.command == 'chat') {
	        	// 일대일 채팅 대상에게 메시지 전달
	        	if (login_ids[message.recepient]) {
	        		io.sockets.connected[login_ids[message.recepient]].emit('message', message);
	        		
	        		// 응답 메시지 전송
	                sendResponse(socket, 'message', '200', '메시지를 전송했습니다.');
	        	} else {
	        		// 응답 메시지 전송
	                sendResponse(socket, 'login', '404', '상대방의 로그인 ID를 찾을 수 없습니다.');
	        	}
        	} else if (message.command == 'groupchat') {
	        	// 방에 들어있는 모든 사용자에게 메시지 전달
	        	io.sockets.in(message.recepient).emit('message', message);
	        		
	        	// 응답 메시지 전송
	            sendResponse(socket, 'message', '200', '방 [' + message.recepient + ']의 모든 사용자들에게 메시지를 전송했습니다.');
        	}
        	
        }
    });
    

    // 'room' 이벤트를 받았을 때의 처리
    socket.on('room', function(room) {
    	console.log('room 이벤트를 받았습니다.');
    	console.dir(room);
    	
        if (room.command === 'create') {

        	if (io.sockets.adapter.rooms[room.roomId]) { // 방이 이미 만들어져 있는 경우
        		console.log('방이 이미 만들어져 있습니다.');
        		
        	} else {
        		console.log('방을 새로 만듭니다.');
        		
        		socket.join(room.roomId);
        		
	            var curRoom = io.sockets.adapter.rooms[room.roomId];
	            curRoom.id = room.roomId;
	            curRoom.name = room.roomName;
	            curRoom.owner = room.roomOwner;
        	}

        } else if (room.command === 'update') {
        	
            var curRoom = io.sockets.adapter.rooms[room.roomId];
            curRoom.id = room.roomId;
            curRoom.name = room.roomName;
            curRoom.owner = room.roomOwner;
             
        } else if (room.command === 'delete') {

            socket.leave(room.roomId);
 
            if (io.sockets.adapter.rooms[room.roomId]) { // 방이  만들어져 있는 경우
            	delete io.sockets.adapter.rooms[room.roomId];
            } else {  // 방이  만들어져 있지 않은 경우
            	console.log('방이 만들어져 있지 않습니다.');
            	
            }
        } else if (room.command === 'join') {  // 방에 입장하기 요청

            socket.join(room.roomId);
         
            // 응답 메시지 전송
            sendResponse(socket, 'room', '200', '방에 입장했습니다.');
        } else if (room.command === 'leave') {  // 방 나가기 요청

            socket.leave(room.roomId);
         
            // 응답 메시지 전송
            sendResponse(socket, 'room', '200', '방에서 나갔습니다.');
        }

        var roomList = getRoomList();
        
        var output = {command:'list', rooms:roomList};
        console.log('클라이언트로 보낼 데이터 : ' + JSON.stringify(output));
        
        io.sockets.emit('room', output);
    });
    
    
    
});

function getRoomList() {
	console.dir(io.sockets.adapter.rooms);
	
    var roomList = [];
    
    Object.keys(io.sockets.adapter.rooms).forEach(function(roomId) { // for each room
    	console.log('current room id : ' + roomId);
    	var outRoom = io.sockets.adapter.rooms[roomId];
    	
    	// find default room using all attributes
    	var foundDefault = false;
    	var index = 0;
        Object.keys(outRoom.sockets).forEach(function(key) {
        	console.log('#' + index + ' : ' + key + ', ' + outRoom.sockets[key]);
        	
        	if (roomId == key) {  // default room
        		foundDefault = true;
        		console.log('this is default room.');
        	}
        	index++;
        });
        
        if (!foundDefault) {
        	roomList.push(outRoom);
        }
    });
    
    console.log('[ROOM LIST]');
    console.dir(roomList);
    
    return roomList;
}

// 응답 메시지 전송 메소드
function sendResponse(socket, command, code, message) {
	var statusObj = {command: command, code: code, message: message};
	socket.emit('response', statusObj);
}



