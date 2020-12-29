var mongoose = require('mongoose');

var database = {} ;


database.init = function(app, config) {
//	console.log(app, config);
	
	connect(app, config);
}

function connect(app, config) {
	console.log('connect 호출됨');
	
	// 데이터베이스 연결 (몽구스 모듈을 활용한 데베 연결임)
	mongoose.Promise = global.Promise;
	mongoose.connect(config.db_url);
	database.db = mongoose.connection;
	
	database.db.on('open', function() {
		console.log('데이터베이스에 연결되었습니다. : ' + config.db_url);
		
		// 연결이 되었다면 정의해둔 스키마 속성에 따라 객체를 만든다.
		createSchema(app, config);
		
	}); 
	// 연결 끊어지면 5초후 재연결
	database.db.on('disconected', function() {
		console.log('연결이 끊어졌습니다. 5초후 재연결 함');
		setInterval(connectDB, 5000);
	});
	
	database.db.on('error', function() {
		console.error('mongoose 연결 에러.');
	});
}

function createSchema(app, config) {
	console.log('설정의 DB 스키마 수 : ' + config.db_schemas.length); 
	var schemaLen = config.db_schemas.length;
	
	for (var i = 0; i < schemaLen; i++) {
		var curItem = config.db_schemas[i];
		
		/*(config.js 모듈의 파일패스 배열객체 통해서) ./memo_schema_mongo.js 모듈을 불러들인 후에
		스키마 생성해서 그 객체를 curSchema에 반환받는다*/
		var curSchema = require(curItem.file).createSchema(mongoose);
		console.log('%s 모듈을 불러들인 후 스키마 정의함.', curItem.file);
		
		// 위에서 몽구스 모델 불러온 뒤 모델 정의
		var curModel = mongoose.model(curItem.collection, curSchema);
		console.log('%s 컬렉션을 위해 모델 정의함', curItem.collection);
		
		
		database[curItem.schemaName] = curSchema;
		database[curItem.modelName] = curModel;
		console.log('스키마 이름 [%s], 모델 이름 [%s]이 database 객체의 속성으로 추가됨', curItem.schemaName, curItem.modelName);
		
	}
	
	
	app.set('db', database);

}

module.exports = database; 
















