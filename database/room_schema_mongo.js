var utils = require('../utils/utils');

var Schema = {};

Schema.createSchema = function (mongoose) {

    // 글 스키마 정의
    var RoomSchema = mongoose.Schema({
        name: {
            type: String,
            trim: true,
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
            created_at: {
                type: Date,
                'default': Date.now
            }
	    }],
        chats: [{ // 채팅 기록
            writer_id: {
                type: mongoose.Schema.ObjectId,
                ref: 'users'
            },
            content: {
                trim: true,
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
    RoomSchema.path('name').validate(function (name) {
        return name && name.length <= 10;
    }, '방 이름은 10자 이내로 설정해주세요');

    // 스키마에 인스턴스 메소드 추가
    RoomSchema.methods = {
        saveRoom: function (callback) { // 글 저장
            var self = this;

            this.validate(function (err) {
                if (err) return callback(err);

                self.save(callback);
            });
        },
        addChats: function (user_id, content, callback) { // 댓글 추가
            this.chats.push({
                'chats.writer_id': user_id,
                'chats.content': content
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
                    $or: [{
                        'users.users_id': id
                }, {
                        owner: id
                    }]
                }, {
                    updated_at: 0,
                    chats: 0
                })
                .populate('owner', 'name')
                .sort({
                    'created_at': -1
                })
                .exec(callback);
        },
        loadroom: function (id, callback) {

            this.findOne({
                    _id: id
                }, {
                    'users._id': 0,
                    'users.created_at': 0
                })
                .populate('chats.writer_id', 'name _id email')
                .populate('owner', 'name email')
                .exec(callback);
        },

        deleteroom: function (id, callback) {

            this.deleteOne({
                    _id: id
                })
                .exec(callback);
        },

        // 사용자가 들어있는 방들의 obj 아이디 값만 리턴 -> 요청 함수에서 판단
        userauth: function (id, room_id, callback) {
            this.findOne({
                    'users.users_id': id,
                    _id: room_id
                }, {
                    _id: 1
                })
                .exec(callback);
        },

        roomauth: function (roomname, callback) {
            this.find({
                    'name': roomname
                }, {
                    _id: 1,
                    owner: 1
                })
                .exec(callback);
        },

        // 방의 구성원 정보를 삭제 해준다. -> 삭제 후 추가 (새로운 값 갱신)
        userspull: function (room_id, user_id, callback) {
            this.updateMany({
                        _id: room_id
                    }, {
                        $pull: {
                            users: {
                                users_id: user_id
                            }
                        }
                    }
                    /*,
                                    { upsert: true }*/
                )
                .exec(callback);
        },

        // 방의 구성원 정보를 추가 해준다.
        userspush: function (room_id, user_id, callback) {
            this.updateOne({
                        _id: room_id
                    }, {
                        $push: {
                            users: {
                                users_id: user_id
                            }
                        }
                    }
                    /*,
                                    { upsert: true }*/
                )
                .exec(callback);
        },

        addchats: function (room_id, data, writer_id, callback) { // 댓글 추가
            this.updateOne({
                    _id: room_id
                }, {
                    $push: {
                        chats: {
                            writer_id: writer_id,
                            content: data
                        }
                    }
                })
                .exec(callback);
        },

        newchat: function (room_id, chat_id, callback) { // 댓글 추가
            this.findOne({
                    _id: room_id,
                    'chats._id': chat_id
                }, {
                    chats: {
                        $elemMatch: {
                            _id: chat_id
                        }
                    }
                })
                .populate('chats.writer_id', 'name _id email')
                .exec(callback);
        }



    }

    console.log('RoomSchema 정의함.');

    return RoomSchema;
};

// module.exports에 RoomSchema 객체 직접 할당
module.exports = Schema;
