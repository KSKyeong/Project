// 친구
var SchemaObj = {};

SchemaObj.createSchema = function(mongoose) {
	
	// 글 스키마 정의
	var FriendSchema = mongoose.Schema({
        user_id : {type: mongoose.Schema.ObjectId, ref: 'users', required: true}, // 클라이언트의 Obj_id
        friends : [{
            friends_id : {type: mongoose.Schema.ObjectId, ref: 'users'}, // 친구들의 Obj_id
            created_at: {type: Date, index: {unique: false}, 'default': Date.now},
        }],		        // 
        requests : [{
            requests_id : {type: mongoose.Schema.ObjectId, ref: 'users'}, // 친구 요청한 사용자들의 Obj_id
            created_at: {type: Date, index: {unique: false}, 'default': Date.now},
        }]
	});
	
    
	/*// 필수 속성에 대한 'required' validation
	PostSchema.path('title').required(true, '글 제목을 입력하셔야 합니다.');
	PostSchema.path('contents').required(true, '글 내용을 입력하셔야 합니다.');*/
	
	// 스키마에 인스턴스 메소드 추가
	FriendSchema.methods = {
		initFriend: function(callback) {		// 사용자 가입 시, 친구 관련 틀? 을 만들어준다.
			var self = this;
			
			this.validate(function(err) {
				if (err) return callback(err);
				
				self.save(callback);
			});
		},
		addComment: function(user, comment, callback) {		// 댓글 추가
			this.comment.push({
				contents: comment.contents,
				writer: user._id
			});
			
			this.save(callback);
		},
		removeComment: function(id, callback) {		// 댓글 삭제
			var index = utils.indexOf(this.comments, {id: id});
			if (~index) {
				this.comments.splice(index, 1);
			} else {
				return callback('ID [' + id + '] 를 가진 댓글 객체를 찾을 수 없습니다.');
			}
			
			this.save(callback);
		}
	}
	
	FriendSchema.statics = {
		// 친구 목록 조회 시 사용할 함수(모두 권한 O)
		load_all: function(user_id, callback) {
			this.findOne({user_id: user_id})
				.populate('friends.friends_id')
				.populate('requests.requests_id')
                .populate('user_id', 'name')
				.exec(callback);
		},
        // 친구 리스트만 불러온다(요청 관련은 권한 없음)
        load_friends: function(user_id, callback) {
			this.findOne({user_id: user_id}, {requests:0})
				.populate('friends.friends_id')
                .populate('user_id', 'name')
				.exec(callback);
		},
        // 친구 요청을 보낸다.
		request_friend: function(req_to_id, user_id, callback) {
			this.updateOne({user_id: req_to_id}, {$push: {requests : 
                {requests_id: user_id}
            }})
                .exec(callback);
		},
        // 친구 요청 수락 -> requests 배열에서 삭제 , friends 배열에 추가
        // 친구 요청 거절 -> requests 배열에서 삭제
        request_accept_del: function(user_id, request_id ,callback) {
            this.updateMany(
              { user_id: user_id },
              { $pull: 
               { 'requests': { requests_id: request_id } } }
            )
                .exec(callback);
        },
        request_accept_add: function(user_id, request_id ,callback) {
            this.updateOne(
              { user_id: user_id },
              { $push: 
               { 'friends': { friends_id: request_id } } }
            )
                .exec(callback);
        },
        delete_friend: function(user_id, delete_id ,callback) {
            this.updateMany(
              { user_id: user_id },
              { $pull: 
               { 'friends': { friends_id: delete_id } } }
            )
                .exec(callback);
        }
	}
	
	console.log('FriendSchema 정의함.');

	return FriendSchema;
};

// module.exports에 FriendSchema 객체 직접 할당
module.exports = SchemaObj;

