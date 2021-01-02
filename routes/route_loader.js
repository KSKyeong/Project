// 다양한 사용자 요청 처리 함수들을 처음에 init 해서 router 객체에 저장해준다
var route_loader = {}; 

var config = require('../config/config');

var upload = require('../database/memo_schema_mongo').upload;

route_loader.init = function(app, router) {
	console.log('router_loader.init 호출됨');
	
	initRoutes(app, router);
}

function initRoutes(app, router) {
	console.log('initRoutes 호출됨');
	
	for (var i = 0; i < config.route_info.length; i++) {
		var curItem = config.route_info[i];
		
		var curModule = require(curItem.file);
		if(curItem.type == 'get') {
			router.route(curItem.path).get(curModule[curItem.method]);
		} else if (curItem.type == 'post') {
			router.route(curItem.path).post(curModule[curItem.method]);
		} else if(curItem.type == 'post_img') {
            router.route(curItem.path).post(app.get('upload').array('image', 1), curModule[curItem.method]);
        } else{
			console.log('라우팅 함수의 타입을 알 수 없습니다. : ' + curItem.type);
		}
	}
	
	app.use('/', router);
	
}

module.exports = route_loader;