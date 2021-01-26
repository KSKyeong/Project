var utils = require('../utils/utils');

var Schema = {};

Schema.createSchema = function (mongoose) {

    // 글 스키마 정의
    var RoomSchema = mongoose.Schema({
        name: {
            type: String,
            'default': '',
            required: true
        }, // 글 제목
        owner: {
            type: mongoose.Schema.ObjectId,
            ref: 'users',
            required: true
        }, // 글쓴 사람
        users: [{ // 참가자
            users_id: {
                type: mongoose.Schema.ObjectId,
                ref: 'users'
            },
            users_email: {
                type: String,
                'default': '',
                required: true
            },
            created_at: {
                type: Date,
                'default': Date.now
            }
	    }],
        chats: [{ // 채팅 기록
            writer: {
                type: mongoose.Schema.ObjectId,
                ref: 'users'
            },
            content: {
                type: String,
                'default': ''
            }, // 채팅 내용
            created_at: {
                type: Date,
                'default': Date.now
            }
	    }],
        created_at: {
            type: Date,
            index: {
                unique: false
            },
            'default': Date.now
        },
        updated_at: {
            type: Date,
            index: {
                unique: false
            },
            'default': Date.now
        }
    });


    // 필수 속성에 대한 'required' validation
    RoomSchema.path('name').required(true, '방 이름을 입력하셔야 합니다.');
    RoomSchema.path('owner').required(true, '방장의 이름을 입력하셔야 합니다.');

    // 스키마에 인스턴스 메소드 추가
    RoomSchema.methods = {
        savePost: function (callback) { // 글 저장
            var self = this;

            this.validate(function (err) {
                if (err) return callback(err);

                self.save(callback);
            });
        },
        addComment: function (user, comment, callback) { // 댓글 추가
            this.comment.push({
                contents: comment.contents,
                writer: user._id
            });

            this.save(callback);
        },
        removeComment: function (id, callback) { // 댓글 삭제
            var index = utils.indexOf(this.comments, {
                id: id
            });
            if (~index) {
                this.comments.splice(index, 1);
            } else {
                return callback('ID [' + id + '] 를 가진 댓글 객체를 찾을 수 없습니다.');
            }

            this.save(callback);
        }
    }

    RoomSchema.statics = {
        // ID로 글 찾기 -> 자신이 들어가있는 채팅 방만 보여줌.
        roomslist: function (options, callback) {
            var id = options.user_id;
            this.find({
                    'users.users_id': id
                })
                .populate('owner', 'name ')
                .sort({
                    'created_at': -1
                })
                .limit(Number(options.perPage))
                .skip(options.perPage * options.page)
                .exec(callback);
        },
        getrooms: function (id, callback) {
            this.find({
                    'users.users_id': id
                    }
                    ,{updated_at:0, chats:0}
                )
                .populate('owner', 'name ')
                .sort({
                    'created_at': -1
                })            
                .exec(callback);
        },
        loadroom: function (id, callback) {

            this.findOne({_id : id})
                .populate('chats.writer', 'name email')
                .populate('owner', 'name email')                
                .exec(callback);
        },
        // 사용자가 들어있는 방들의 obj 아이디 값만 리턴 -> 요청 함수에서 판단
        userauth: function (id, room_id ,callback) {
            this.findOne({
                    'users.users_id': id, _id: room_id
                }, {_id : 1})
                .exec(callback);
        },
        
        roomauth: function (roomname ,callback) {
            this.find({
                    'name': roomname
                }, {_id : 1})
                .exec(callback);
        },
        
        viewupdate: function (id, callback) {
            this.updateOne({
                    _id: id
                }, {
                    $inc: {
                        views: 1
                    }
                })
                .exec(callback);
        },
        commentsupdate: function (id, comment, writer, callback) {
            this.updateOne({
                    _id: id
                }, {
                    $push: {
                        comments: {
                            contents: comment,
                            writer: writer
                        }
                    }
                })
                .exec(callback);
        },
        // 수정 필요, 인스턴스 객체로 먼저 해보자
        commentsdelete: function (comment_id, post_id, callback) {
            this.updateOne({
                    _id: post_id
                }, {
                    $pull: {
                        'comments': {
                            _id: comment_id
                        }
                    }
                })
                .exec(callback);
        },
        // 게시글 삭제 위한 static 함수
        postdelete: function (del_post_id, callback) {
            this.deleteOne({
                    _id: del_post_id
                })
                .exec(callback);
        }
    }

    console.log('RoomSchema 정의함.');

    return RoomSchema;
};

// module.exports에 RoomSchema 객체 직접 할당
module.exports = Schema;
