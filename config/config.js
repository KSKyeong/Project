module.exports = {
	server_port : 3701,
	db_url : 'mongodb://localhost:27017/local',
	db_schemas : [
		{file: './user_schema_mongo', collection: 'users', schemaName: 'UserSchema', modelName: 'UserModel'}
        ,{file: './post_schema_mongo', collection: 'post', schemaName: 'PostSchema', modelName: 'PostModel'}
        ,{file: './friend_schema_mongo', collection: 'friend', schemaName: 'FriendSchema', modelName: 'FriendModel'}
        ,{file: './room_schema_mongo', collection: 'rooms', schemaName: 'RoomSchema', modelName: 'RoomModel'}
	],
	route_info : [
        {file : './post', path : '/process/addpost', method : 'addpost', type : 'post'}
        ,{file : './post', path : '/process/deletepost', method : 'deletepost', type : 'post'}
        ,{file : './post', path : '/process/showpost/:id', method : 'showpost', type : 'get'}
        ,{file : './post', path : '/process/listpost', method : 'listpost', type : 'post'}
        ,{file : './post', path : '/process/listpost', method : 'listpost', type : 'get'}
        ,{file : './post', path : '/process/addcomments', method : 'addcomments', type : 'post'}
        ,{file : './post', path : '/process/deletecomments', method : 'deletecomments', type : 'post'}
        ,{file : './friend', path : '/process/showfriends/:id', method : 'showfriends', type : 'get'}
        ,{file : './friend', path : '/process/showfriends/:id', method : 'showfriends', type : 'post'}
        ,{file : './friend', path : '/process/profile/:id', method : 'showprofile', type : 'get'}
        ,{file : './friend', path : '/process/profile/:id', method : 'showprofile', type : 'post'}
        ,{file : './friend', path : '/process/req_friend/:name', method : 'req_friend', type : 'get'}
        ,{file : './friend', path : '/process/friendrequest', method : 'friendrequest', type : 'post'}
        ,{file : './friend', path : '/process/deletefriend', method : 'deletefriend', type : 'post'}
        ,{file : './room', path : '/process/listroom', method : 'listroom', type : 'post'}
        ,{file : './room', path : '/process/listroom', method : 'listroom', type : 'get'}
        ,{file : './room', path : '/process/showchats/:id', method : 'showchats', type : 'get'}
        
        
		
	],
    facebook : {
        clientID : '430571208105375',
        clientSecret : 'e426961c3063c167f7afae4d2cd3d2fa',
        callbackURL : 'http://localhost:3701/auth/facebook/callback'
    }
}