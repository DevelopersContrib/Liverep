// Setup basic express server
//Edit mysql on line 155 to setup your server
var config = require('./config.json');
var express = require('express');
var mysql      = require('mysql');
var app = express();
var fs = require('fs');

var server = require('http').Server(app);
var port = process.env.PORT || 3001;

var io = require('socket.io')(server);

server.listen(port, function(err) {
	console.log('https server running on port ' + port);
});


var nodemailer = require('nodemailer');


var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
    	res.send(200);
    }
    else {
    	next();
    }
};

// Routing
app.use(allowCrossDomain);
app.use(express.static(__dirname + '/public'));

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var avatars = {};
var roomlist = [];
var roomusers = [];
var sockets = [];
var people = {};

function isset(object){
	return (typeof object !=='undefined');
}


function findClientsSocket(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // the default namespace is "/"

		if (ns) {
			for (var id in ns.connected) {
				if(roomId) {
					var index = ns.connected[id].rooms.indexOf(roomId) ;
					if(index !== -1) {
						res.push(ns.connected[id]);
					}
				}
				else {
					res.push(ns.connected[id]);
				}
			}
		}
		return res;
	}

	function findRooms() {
		var availableRooms = [];
		var rooms = io.sockets.adapter.rooms;
		if (rooms) {
			for (var room in rooms) {
				if (!rooms[room].hasOwnProperty(room)) {
					availableRooms.push(room);
				}
			}
		}
		return availableRooms;
	}

	function findUserByRoom(room,people){
		for(socketId in people){
			if(people[socketId].room === room){
				return socketId;
			}
		}
		return false;
	}

	function findRoomName(room,people){
		for(socketId in people){
			if(people[socketId].room === room){
				return people[socketId].username;
			}
		}
		return false;
	}

	function sendOfflineMessages(msgcount,isadmin,email,msgs,domain,username){
		var transporter = nodemailer.createTransport();
		var maillist = [
		config.email
		];

		
		if (msgcount > 0){
			if (isadmin == 0){

				var subject = "Offline Message from "+ domain;

				var mailOptions = {
					from: username+'<'+email+'>',
					to: maillist,
				    subject: subject, // Subject line
				    text: msgs, // plaintext body
				    html: msgs // html body
				};

				// send mail with defined transport object
				transporter.sendMail(mailOptions, function(error, info){
					if(error){
						return console.log(error);
					}
					console.log('Message sent: ');

				});



			}
		}
	}


	io.on('connection', function (socket) {
		sockets.push(socket);
		var addedUser = false;


  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
	  //NOTE : Add your mysql access here.
	  var connection = mysql.createConnection({
	  	host     : config.dbhost,
	  	user     : config.dbuser,
	  	password : config.dbpassword,
	  	database : config.db
	  });
	  
	  var read = 0;
	  var msg_id = 0;
	  if (people[socket.id].isjoined == 1){
	  	read = 1;
	  }
	  var post  = {member_id: data.userid, message: data.message, read:read, room:socket.room, mtimestamp:data.mdate, domain:data.domain};
	  
	  connection.query('INSERT INTO ChatMessages SET ?', post, function(err, result) {
	  	if (err) throw err;
	  	console.log(result.insertId);
	  	msg_id = result.insertId;
	  	socket.emit('owner message', {message: data.message, username: data.username, avatar: data.avatar, msg_id:msg_id, userid:data.userid, mdate:data.mdate});
	  	socket.broadcast.to(socket.room).emit('new message', {message: data.message, username: data.username, avatar: data.avatar, msg_id:msg_id,mdate:data.mdate});
	  });

	  connection.end();

	  
	  if (people[socket.id].isjoined == 0){
	  	people[socket.id].msgs += data.message+'<br>';
	  	people[socket.id].msgcount = people[socket.id].msgcount + 1;

	  }

    // we tell the client to execute 'new message'
   /* socket.broadcast.emit('new message', {
      username: socket.username,
      avatar: socket.avatar,
      message: data
  });*/
});


  // when the guest emits 'new guest message', this listens and executes
  socket.on('new guest message', function (data) {

  	var connection = mysql.createConnection({
  		host     : config.dbhost,
  		user     : config.dbuser,
  		password : config.dbpassword,
  		database : config.db
  	});

  	var read = 0;
  	var msg_id = 0;

  	var post  = {member_id: 0, message: data.message, read:read, room:socket.room, mtimestamp:data.mdate, domain:data.domain, user_session:data.guestsession};
  	connection.query('INSERT INTO ChatMessages SET ?', post, function(err, result) {
  		if (err) throw err;
  		console.log(result.insertId);
  		msg_id = result.insertId;
  		socket.emit('owner guest message', {message: data.message, username: data.username, avatar: data.avatar, msg_id:msg_id, userid:0, mdate:data.mdate,guestuser:data.guestsession,domain:data.domain});
  		socket.broadcast.to(socket.room).emit('new guest message', {message: data.message, username: data.username, avatar: data.avatar, msg_id:msg_id,mdate:data.mdate});

  	});
  	connection.end();

  	if (people[socket.id].isjoined == 0){
  		people[socket.id].msgs += data.message+'<br>';
  		people[socket.id].msgcount = people[socket.id].msgcount + 1;

  	}


  });

socket.on('deletemessage', function (msg_id) {
	var connection = mysql.createConnection({
		host     : config.dbhost,
		user     : config.dbuser,
		password : config.dbpassword,
		database : config.db
	});

	connection.query('Delete From ChatMessages WHERE ?', [{ msg_id: msg_id }])
	connection.end();
	
});


socket.on('updatemessage', function (msg_id,msg) {
	var connection = mysql.createConnection({
		host     : config.dbhost,
		user     : config.dbuser,
		password : config.dbpassword,
		database : config.db
	});

	connection.query('UPDATE ChatMessages SET ? WHERE ?', [{ message: msg }, { msg_id: msg_id }])
	connection.end();
	
});


socket.on('update user', function(firstname,lastname,username,password,profile_image,userid) {

	console.log('updating files');

	var connection = mysql.createConnection({
		host     : config.dbhost,
		user     : config.dbuser,
		password : config.dbpassword,
		database : config.db
	});

	var $query = "UPDATE Members SET FirstName = ?, LastName = ?, Username = ?, Password = ?, profile_image = ? WHERE MemberId = ?";
	connection.query($query, [{ FirstName: firstname }, { LastName: lastname }, { Username: username }, { Password: password }, { profile_image: profile_image }, { MemberId: userid }])
	connection.end();
});

// function to call in account setting
socket.on('get user details', function (userid) {

	var connection = mysql.createConnection({
		host     : config.dbhost,
		user     : config.dbuser,
		password : config.dbpassword,
		database : config.db
	});

	var exist = 0;
	var sql = "SELECT * FROM Members WHERE Members.`MemberId` = '"+userid+"'";
	var error = false;
	connection.query(sql, function(err, rows, fields){
		console.log(rows.length);

		if (rows.length > 0) {
			exist = 1;
		};

		if (!err) {

			for (var i = 0; i < rows.length; i++) {
				
				var username = rows[i].Username;
				var avatar = rows[i].profile_image;
				var lastname = rows[i].LastName;
				var firstname = rows[i].FirstName;
				var password = rows[i].Password;
				var email = rows[i].EmailAddress;
			};

		} else {
			error = true;
		}

		socket.emit('get member details', { 
			username:username,
			avatar:avatar,
			lastname:lastname,
			firstname:firstname,
			email:email,
			password:password,
			error:error
		}); 

	}); // end of conection query

	connection.end();
});

  // when the client emits 'authenticate', this listens and executes
  socket.on('authenticate', function (email,password,domain) {

  	var connection = mysql.createConnection({
  		host     : config.dbhost,
  		user     : config.dbuser,
  		password : config.dbpassword,
  		database : config.db
  	});

  	var username = "";
  	var avatar = "https://d2qcctj8epnr7y.cloudfront.net/sheina/contrib/default_avatar.png";
  	var exist = 0;
  	var isadmin = 0;
  	var userid = 0;

  	var sql = "SELECT * FROM Members WHERE Members.`EmailAddress` = '"+email+"' AND `Password` = '"+password+"'";

  	connection.query(sql, function(err, rows, fields) {
	 // console.log(sql);
	 console.log(rows.length);

	 if (rows.length > 0){
	 	exist = 1;
	 }

	 if (!err){
	 	for (var i = 0; i < rows.length; i++) {
	 		username = rows[i].Username;
	 		avatar = rows[i].profile_image;
	 		isadmin = rows[i].IsAdmin;
	 		if (isadmin == null){
	 			isadmin = 0;
	 		}
	 		userid = rows[i].MemberId;

	 		if ((avatar != "") && (avatar != null)){

	 		}else {

	 			avatar = "https://d2qcctj8epnr7y.cloudfront.net/sheina/contrib/default_avatar.png";
	 		}
				  //console.log(rows[i].name);
				  people[socket.id] = {"username" : username, "avatar" : avatar, "room": userid, "isadmin": isadmin, "domain":domain, "msgcount":0, "isjoined":0,"msgs":"","email":email};
				};
			} else{
				console.log('Error while performing Query.');
			}

			socket.emit('authenticated', {
				username: username,
				avatar:avatar,
				exist:exist,
				isadmin:isadmin,
				userid:userid
			});
		});

  	connection.end();

  });

  //register user
  socket.on('register', function (email,username,password) {

  	var connection = mysql.createConnection({
  		host     : config.dbhost,
  		user     : config.dbuser,
  		password : config.dbpassword,
  		database : config.db
  	});

  	var error = "";

  	var sql = "SELECT * FROM Members WHERE Members.`EmailAddress` = '"+email+"'";
  	connection.query(sql, function(err, rows, fields) {
  		if (rows.length > 0){
  			error += "Email already exists<br>";
  		}
  	});

  	var sql2 = "SELECT * FROM Members WHERE Members.`Username` = '"+username+"'";
  	connection.query(sql2, function(err, rows, fields) {
  		if (rows.length > 0){
  			error += "Username already exists<br>";
  		}
  	});

  	if (error == ""){

  		var sql3 = "INSERT INTO Members (EmailAddress, Username, `Password`,FirstName,LastName) VALUES ('"+email+"', '"+username+"','"+password+"','"+username+"','')";
  		connection.query(sql3, function (err, result) {
  			if (err) throw err;
  			console.log("1 record inserted");
  		});
  	}

  	socket.emit('registered', {
  		email: email,
  		password:password,
  		error:error
  	});

  	connection.end();

  });

  //send guest message to admin
  socket.on('send guest message', function (email,room) {
  	var message = "";
  	var domain = "";
  	var username="user"+room;

  	var connection = mysql.createConnection({
  		host     : config.dbhost,
  		user     : config.dbuser,
  		password : config.dbpassword,
  		database : config.db
  	});

  	var sql = "SELECT `ChatMessages`.*, Members.`Username`, `profile_image` FROM `ChatMessages` LEFT JOIN Members ON (Members.`MemberId` = `ChatMessages`.`member_id`)  WHERE room = "+room+" ORDER BY msg_id LIMIT 1";

  	connection.query(sql, function(err, rows, fields) {

  		if (err) throw err;
  		for (var i in rows) {

  			message = rows[i].message;
  			domain = rows[i].domain;
  			console.log('Message '+ message + 'Domain '+domain);
  			var transporter = nodemailer.createTransport();
  			var maillist = [
  			config.email,
  			];


  			var subject = "Offline Guest Message from "+ domain;

  			var mailOptions = {
  				from: username+'<'+email+'>',
  				to: maillist,
			    subject: subject, // Subject line
			    text: message, // plaintext body
			    html: message // html body
			};

			// send mail with defined transport object
			transporter.sendMail(mailOptions, function(error, info){
				if(error){
					return console.log(error);
				}
				console.log('Message sent: from room '+ room);
			});
			
			
			//send to user
			maillist = [email];

			subject = domain+" Liverep Notification";
			
			message = "Thank you for your sending us your inquiry and message <br>";
			message += "Please wait for one of our representative's reply.<br>";
			message += "Thank you and have a nice day! <br><br>";

			mailOptions = {
				from: 'VNOC Admin <admin@vnoc.com>',
				to: maillist,
				    subject: subject, // Subject line
				    text: message, // plaintext body
				    html: message // html body
				};

				// send mail with defined transport object
				transporter.sendMail(mailOptions, function(error, info){
					if(error){
						return console.log(error);
					}
					console.log('Message sent to guest user');

				});
			}
		}); 

connection.end();

});


  // when the client emits 'add user' to room, this listens and executes
  socket.on('add user', function (username,avatar,room,isadmin,domain,guest,message) {

	// we store the username in the socket session for this client
	socket.username = username;
    // we store the avatar in the socket session for this client
    socket.avatar = avatar;
    
    socket.room = room;
    
    socket.join(socket.room);

    var isnew = true;

	//get admin
	
	if (guest == 0){
		
		var connection = mysql.createConnection({
			host     : config.dbhost,
			user     : config.dbuser,
			password : config.dbpassword,
			database : config.db
		});

		var sql = "SELECT Members.`FirstName`,Members.`Username`, `profile_image` FROM Members WHERE IsAdmin =1 ORDER BY RAND() LIMIT 3";

		connection.query(sql, function(err, rows, fields) {
			if (err) throw err;
			socket.emit("update", "Welcome to "+domain+" chat support",isnew,rows,domain);
		}); 
		connection.end();
		
	}	
	
	//get room messages
	var connection = mysql.createConnection({
		host     : config.dbhost,
		user     : config.dbuser,
		password : config.dbpassword,
		database : config.db
	});


	if (guest == 0){
		var sql = "SELECT `ChatMessages`.*, Members.`FirstName`,Members.`Username`, `profile_image` FROM `ChatMessages` INNER JOIN Members ON (Members.`MemberId` = `ChatMessages`.`member_id`) WHERE room = "+room+" ORDER BY msg_id";
	}else {
		var sql = "SELECT `ChatMessages`.*, Members.`FirstName`,Members.`Username`, `profile_image` FROM `ChatMessages` LEFT JOIN Members ON (Members.`MemberId` = `ChatMessages`.`member_id`) WHERE room = "+room+" ORDER BY msg_id";	
	}

	connection.query(sql, function(err, rows, fields) {
		if (err) throw err;
		socket.emit("history", room,rows);
	}); 
	
	connection.end();
	
	if (guest == 1){
		socket.emit("new guest message", username,avatar,room,isadmin,domain,guest,message);
		people[socket.id] = {"username" : username, "avatar" : avatar, "room": room, "isadmin": 0, "domain":domain, "msgcount":0, "isjoined":0,"msgs":"","email":""};

	}
	
	
});

socket.on('refreshlist', function () {

	var connection = mysql.createConnection({
		host     : config.dbhost,
		user     : config.dbuser,
		password : config.dbpassword,
		database : config.db
	});

	var sql = "SELECT Members.`MemberId`,Members.`FirstName`,Members.`Username`, Members.`LastName`,Members.`IsAdmin`, `profile_image`, ChatMessages.*,(SELECT COUNT(*) FROM ChatMessages WHERE member_id=Members.`MemberId` AND `read`=0) AS `total` FROM ChatMessages INNER JOIN Members ON (Members.`MemberId` = `ChatMessages`.`member_id`) WHERE IsAdmin IS NULL  AND `date_sent` > DATE_SUB(NOW(), INTERVAL 5 DAY)GROUP BY ChatMessages.`member_id`,domain ORDER BY msg_id DESC";

	connection.query(sql, function(err, rows, fields) {
		if (err) throw err;
		socket.emit('updatelist', {
			people:people,
			rows:rows
		});
	}); 
	
	connection.end();

});  


//when the client emits 'add user' to room, this listens and executes
socket.on('joinRoom', function (room,username,avatar,uname) {
	var receiverSocketId = findUserByRoom(room,people);
	 // var roomname = findRoomName(room,people);
	 console.log(room);
	 console.log(receiverSocketId);
	 if(receiverSocketId){
	 	var receiver = people[receiverSocketId];
	 	var receiver_username = receiver.username;
	 	people[receiverSocketId].msgcount = 0;
	 	people[receiverSocketId].isjoined = 1;
	 }else {
	 	var receiver_username  = uname;
	 }

	 socket.username = username;
	 socket.avatar = avatar;
	 socket.room = room;
	 socket.join(socket.room);
	        //join the anonymous user
	        socket.join(socket.room);
	        //join the registered user 
	        //sockets[receiverSocketId].join(room);

	        //notify the client of this
	        user = people[socket.id];
	        
	        socket.broadcast.to(socket.room).emit("update", username + " has joined.",false);
	        
	        socket.emit("update", "Welcome to "+receiver_username+" room.",false);


			//get room messages
			var connection = mysql.createConnection({
				host     : config.dbhost,
				user     : config.dbuser,
				password : config.dbpassword,
				database : config.db
			});

			var sql = "SELECT `ChatMessages`.*, Members.`FirstName`,Members.`Username`, `profile_image` FROM `ChatMessages` INNER JOIN Members ON (Members.`MemberId` = `ChatMessages`.`member_id`) WHERE room = "+room+" ORDER BY msg_id";

			connection.query(sql, function(err, rows, fields) {
				if (err) throw err;
				socket.emit("history", room,rows);

			}); 
			
			connection.query('UPDATE ChatMessages SET ? WHERE ?', [{ read: 1 }, { room: room }])
			connection.end();
			
		});

  // when the client emits 'getrooms', we broadcast it to others
  socket.on('getrooms', function () {

  	var connection = mysql.createConnection({
  		host     : config.dbhost,
  		user     : config.dbuser,
  		password : config.dbpassword,
  		database : config.db
  	});

  	var sql = "SELECT Members.`MemberId`,Members.`FirstName`,Members.`Username`, Members.`LastName`,Members.`IsAdmin`, `profile_image`, ChatMessages.*,(SELECT COUNT(*) FROM ChatMessages WHERE member_id=Members.`MemberId` AND `read`=0) AS `total` FROM ChatMessages INNER JOIN Members ON (Members.`MemberId` = `ChatMessages`.`member_id`) WHERE IsAdmin IS NULL  AND `date_sent` > DATE_SUB(NOW(), INTERVAL 5 DAY)GROUP BY ChatMessages.`member_id`,domain ORDER BY msg_id DESC";

  	connection.query(sql, function(err, rows, fields) {
  		if (err) throw err;
  		socket.emit('listrooms', {
  			people: people,
  			rows:rows
  		});

  	}); 

  	connection.end();

  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {

  	socket.broadcast.to(socket.room).emit('typing', {
  		username: socket.username,
  		avatar:socket.avatar
  	});

  /*  socket.broadcast.emit('typing', {
      username: socket.username,
      avatar:socket.avatar
  });*/
});

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
  	io.sockets.in(socket.room).emit('stop typing', {
  		username: socket.username,
  		avatar:socket.avatar
  	});


	 /* socket.broadcast.emit('stop typing', {
	      username: socket.username,
	      avatar:socket.avatar
	  });*/

    /*socket.broadcast.emit('stop typing', {
      username: socket.username,
      avatar:socket.avatar
  });*/

});
  
   // when the user disconnects.. perform this
   socket.on('logout', function () {
   	console.log('logout');
   	if (people[socket.id]){
   		sendOfflineMessages(people[socket.id].msgcount,people[socket.id].isadmin,people[socket.id].email,people[socket.id].msgs,people[socket.id].domain,people[socket.id].username);
   	}

   	socket.broadcast.to(socket.room).emit('user left', {
   		boolean: true,
   		room: socket.room,
   		username: socket.username,
   		avatar: socket.avatar,
   		numUsers: 0
   	});


	 	// leave the room
	 	socket.leave(socket.room);
	 	delete people[socket.id];
	 	sockets.splice(sockets.indexOf(socket), 1);

    // remove the username from global usernames list
    if (addedUser) {
    	delete usernames[socket.username];
    	delete avatars[socket.username];
      //--numUsers;

      // echo globally that this client has left
       /* socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
    });*/
}
});

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
  	if (people[socket.id]){
  		sendOfflineMessages(people[socket.id].msgcount,people[socket.id].isadmin,people[socket.id].email,people[socket.id].msgs,people[socket.id].domain,people[socket.id].username);
  	}

  	socket.broadcast.to(socket.room).emit('user left', {
  		boolean: true,
  		room: socket.room,
  		username: socket.username,
  		avatar: socket.avatar,
  		numUsers: 0
  	});


	 	// leave the room
	 	socket.leave(socket.room);
	 	delete people[socket.id];
	 	sockets.splice(sockets.indexOf(socket), 1);

    // remove the username from global usernames list
    if (addedUser) {
    	delete usernames[socket.username];
    	delete avatars[socket.username];
      //--numUsers;

      // echo globally that this client has left
     /* socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
    });*/
}
});


});

