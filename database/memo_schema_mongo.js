var crypto = require('crypto');

var Schema = { };



// Schema 객체에 createSchema 함수를 속성으로 추가.
Schema.createSchema = function (mongoose) {
	console.log('createSchema_memo 호출됨.');
	//스키마 정의
	var MemoSchema = mongoose.Schema({
			id: {type:String, required:true, 'default':' '},
			name: {type:String, index:'hashed', 'default':' '},
            description: {type:String, required:true, 'default': ' '},
            saved_src: {type:String, required:true, unique:true, 'default':' '},
			created_at: {type:Date, index:{unique:false}, 'default':Date.now},
			updated_at: {type:Date, index:{unique:false}, 'default':Date.now}
	});
	
    // 사진과 메모 내용을 저장하기 위한 static 메소드
    MemoSchema.static('saveMemo', function(id, name, des, img_src, callback) {
        console.log('saveMemo 호출됨.');
      
        return this.updateMany({'id':id}, {$set : {name:name, age:age}}, callback);

    });

	MemoSchema.path('id').validate(function (id) {
		return id.length;
	}, 'id 칼럼의 값이 없습니다.');

	MemoSchema.path('name').validate(function (name) {
		return name.length;
	}, 'name 칼럼의 값이 없습니다.');


	// 스키마 static 메소드 정의
	MemoSchema.static('findById', function(id, callback) {
		return this.find({id:id}, callback);
	});	


	MemoSchema.static('findAll', function(callback) {
		return this.find({}, callback);
	});

	console.log('MemoSchema 정의함.');	
	return MemoSchema;
	
};

module.exports = Schema;
