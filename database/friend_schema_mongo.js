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
		list: function(options, callback) {
			var criteria = options.criteria || {};
			
			this.find(criteria)
				.populate('writer', 'name provider email')
				.sort({'created_at': -1})
				.limit(Number(options.perPage))
				.skip(options.perPage * options.page)
				.exec(callback);
		},
        viewupdate: function(id, callback) {
            this.updateOne({_id : id}, {$inc: {views : 1}})
                .exec(callback);
        },
        commentsupdate: function(id, comment, writer, callback) {
            this.updateOne({_id: id}, {$push: {comments : 
                { contents: comment, writer: writer }
            }})
                .exec(callback);
        },
        // 수정 필요, 인스턴스 객체로 먼저 해보자
        commentsdelete: function(comment_id, post_id, callback) {
            this.updateOne(
              { _id: post_id },
              { $pull: { 'comments': { _id: comment_id } } }
            )
                .exec(callback);
        }
        /*commentsdelete: function(post_id, index, callback) {
            var index = utils.indexOf()
        }*/
	}
	
	console.log('FriendSchema 정의함.');

	return FriendSchema;
};

// module.exports에 FriendSchema 객체 직접 할당
module.exports = SchemaObj;

