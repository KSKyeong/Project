var crypto = require('crypto');

var Schema = { };

// Schema 객체에 createSchema 함수를 속성으로 추가.
Schema.createSchema = function (mongoose) {
	console.log('createSchema_user 호출됨.');
	
    //스키마 정의 -facebook 버전으로 업데이트 함
	var UserSchema = mongoose.Schema({
        email: {type:String, 'default':' ', required:true, unique : true}
        ,hashed_password : {type:String, 'default':' ', required:true}
        ,name: {type:String, index:'hashed', 'default':' ', trim:true}
        ,salt : {type : String}
        ,created_at: {type:Date, index:{unique:false}, 'default':Date.now}
        ,updated_at: {type:Date, index:{unique:false}, 'default':Date.now}
        ,provider : {type:String, 'default': ' '}
        ,authToken : {type:String, 'default': ' '}
		
		,googleToken : {type: String, 'default': null }
		,googleRefreshToken : {type: String, 'default': ' ' }
        ,facebook : { }
        ,friends : {type: mongoose.Schema.ObjectId, ref: 'users'},
	});
	
	UserSchema
		.virtual('password')
		.set(function(password) {
		this._password = password;
		this.salt = this.makeSalt();
        this.provider = 'local';
		this.hashed_password = this.encryptPassword(password);
		console.log('virtual password 호출됨 : ' + this.hashed_password);
		})
		.get(function() {return this._password});

	// method 함수를 통해 정의한 메소드는 모델 인스턴스에서 사용할 수 있음.
	// 비밀번호 암호화 메소드
	UserSchema.method('encryptPassword', function(plainText, inSalt) {
		if(inSalt) {
			return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
		} else {
			return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
		}
	});

	// salt 값 만드는 메소드
	UserSchema.method('makeSalt', function() {
		return Math.round(new Date().valueOf() * Math.random()) + '';
	});

	// 인증 메소드 - 입력된 비밀번호와 비교 (true/false 리턴해줌)
	UserSchema.method('authenticate', function(plainText, inSalt, hashed_password) {
		if(inSalt) {
			console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText, inSalt), hashed_password);
			return this.encryptPassword(plainText, inSalt) === hashed_password;
		} else {
			console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText), this.hashed_password);
			return this.encryptPassword(plainText) === this.hashed_password;
		}
	});
    
    // 사용자 정보 수정을 위해 추가해보는 static
    UserSchema.static('changeUserInfo', function(id, name, age, callback) {
        console.log('changeUserInfo 호출됨.');
       /* return this.update({id : id}, {$set: {name : name, age : Number(age)}}, {multi : true}, callback);
        */
        return this.updateMany({'id':id}, {$set : {name:name, age:age}}, callback);
//        this.update({id : id}, {$set: {age : Number(age)}});
        
//        return;
    });
    
    // 수정 시 날짜 업데이트 위해 추가
    UserSchema.static('updateDate', function(id, name, callback) {
        console.log('changeUserInfo 호출됨.');
        return this.updateMany({'id' : id, 'name' : name}, {$set : {'updated_at' : Date.now}}, callback);
    });
    
    // 사진과 메모 내용을 저장하기 위한 static 메소드
    UserSchema.static('saveMemo', function(id, name, des, img_src, callback) {
        console.log('saveMemo 호출됨.');
      
        return this.updateMany({'id':id}, {$set : {name:name, age:age}}, callback);

    })

	// 받은 토큰 저장 (초기)
    UserSchema.static('initToken', function(id, token, callback) {
        console.log('initToken 호출됨.');
		console.log(token);
		
		// 토큰 json 자체 다 문자열로 일단 저장
		// var access = (token.access_token != undefined && token.access_token != null) ? token.access_token : "";   
		// var refresh = (token.refresh_token != undefined && token.refresh_token != null) ? token.refresh_token : "";   
      
		if(token.refresh_token != undefined && token.refresh_token != null) {
			console.log("안녕");
			console.log(JSON.stringify(token), token);
			return this.updateMany({'email':id}, {$set : {googleToken: JSON.stringify(token), googleRefreshToken: token.refresh_token}}, callback);
		} else {
			console.log(" 초기 인증");
			console.log(JSON.stringify(token), token);
			return this.updateMany({'email':id}, {$set : {googleToken: JSON.stringify(token)}}, callback);
		}

		// return this.updateMany({'email':id}, {$set : {googleToken: JSON.stringify(token)}}, callback);
        

    })

	// 저장된 토큰 불러오기
	UserSchema.static('test', function(id, callback) {
        console.log('test 호출됨.');

		// findOne({user_id: user_id}, {requests:0})
		
		return this.findOne({'email':id}, {googleToken:1, googleRefreshToken:1}, callback);
		
		// return this.updateMany({'email':id}, {$set : {googleToken: JSON.stringify(token)}}, callback);
        

    })
    
    // 입력된 칼럼 값이 있는지 확인
	UserSchema.path('email').validate(function (email) {
		return email.length;
	}, 'email 칼럼의 값이 없습니다.');

	UserSchema.path('hashed_password').validate(function (hashed_password) {
		return hashed_password.length;
	}, 'hashed_password 칼럼의 값이 없습니다.');


	// 스키마 static 메소드 정의
	UserSchema.static('findByEmail', function(email, callback) {
		return this.find({email:email}, callback);
	});	
    
    UserSchema.static('findByName', function(name, callback) {
		return this.find({name:name}, callback);
	});	
    
    UserSchema.static('findBy_Id', function(id, callback) {
		return this.find({_id:id}, callback);
	});	
    
    UserSchema.static('findUser', function(id, hashed_pw ,callback) {
		return this.find({_id:id, hashed_password:hashed_pw}, callback);
	});

	/*UserSchema.statics.findByID = function(id, callback) {
		return this.find({'id': id}, callback);
	};*/

	UserSchema.static('findAll', function(callback) {
		return this.find({}, callback);
	});

	console.log('UserSchema 정의함.');	
	return UserSchema;
	
};

module.exports = Schema;
