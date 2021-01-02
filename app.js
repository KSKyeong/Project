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


io.sockets.on('connection', function(socket) {
    console.log('connection info : '+ JSON.stringify(socket.request.connection._peername));
    
    //소켓 객체에 클라이언트 Host, Port 정보 속성으로 추가
    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;
})










