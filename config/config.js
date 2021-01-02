module.exports = {
	server_port : 3701,
	db_url : 'mongodb://localhost:27017/local',
	db_schemas : [
		{file: './user_schema_mongo', collection: 'Users', schemaName: 'UserSchema', modelName: 'UserModel'}
	],
	route_info : [
		
	],
    facebook : {
        clientID : '430571208105375',
        clientSecret : 'e426961c3063c167f7afae4d2cd3d2fa',
        callbackURL : 'http://localhost:3701/auth/facebook/callback'
    }
}