var connect = require('connect');
var login = require('./login');

var app = connect();

app.use(connect.json()); // Parse JSON request body into `request.body`
app.use(connect.urlencoded()); // Parse form in request body into `request.body`
app.use(connect.cookieParser()); // Parse cookies in the request headers into `request.cookies`
app.use(connect.query()); // Parse query string into `request.query`

app.use('/', main);

function main(request, response, next) {
	switch (request.method) {
		case 'GET': get(request, response); break;
		case 'POST': post(request, response); break;
		case 'DELETE': del(request, response); break;
		case 'PUT': put(request, response); break;
	}
};

function get(request, response) {
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		console.log("sid = " + sid);
		if ( login.isLoggedIn(sid) ) {
			response.setHeader('Set-Cookie', 'session_id=' + sid);
			response.end(login.hello(sid));	
		} else {
			response.end("Invalid session_id! Please login again\n");
		}
	} else {
		response.end("Please login via HTTP POST\n");
	}
};

function post(request, response) {
	var name = request.body.name;
	var email = request.body.email;
	console.log("name from url : " + name);
	console.log("email from url : " + email);
	
	
	var newSessionId = login.login(name,email);
	
	console.log("session_id generated : " + newSessionId);
        response.writeHead(200, {
        'Set-Cookie': 'session_id='+newSessionId,
        'Content-Type': 'text/html' });

	response.end(login.hello(newSessionId));
	// TODO: read 'name and email from the request.body'
	// var newSessionId = login.login('xxx', 'xxx@gmail.com');
	// TODO: set new session id to the 'session_id' cookie in the response
	// replace "Logged In" response with response.end(login.hello(newSessionId));

	//response.end("Logged In\n");
};

function del(request, response) {
	console.log("DELETE:: Logout from the server");
	var current_cookie  = request.cookies.session_id;
	console.log("session id from request : " + current_cookie);
	if(login.isLoggedIn(current_cookie)!=null)
	{
	login.logout(current_cookie);
	response.end('Logged out from the server\n');
	}
	else
	{
	response.end("Invalid Session ID.. Please try again");
	}
	// TODO: remove session id via login.logout(xxx)
 	// No need to set session id in the response cookies since you just logged out!
};

function put(request, response) {
	console.log("PUT:: Re-generate new seesion_id for the same user");
	// TODO: refresh session id; similar to the post() function
	if(login.isLoggedIn(request.cookies.session_id)!=null)
	{
	var newSessionId = login.refresh(request.cookies.session_id);
	console.log("New SessionId :" + newSessionId);
	response.end("Re-freshed session id.. New SessionId : "+ newSessionId);
	
	}
	else
	{
	response.end("Invalid SessionId.. Please try again\n");
	}
};

app.listen(8000);

console.log("Node.JS server running at 8000...");
