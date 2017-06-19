jQuery(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize varibles
  var $window = jQuery(window);
  var $closeBtn = jQuery('.close-header-btn');
  var $usernameInput = jQuery('.usernameInput'); // Input for username
  var $passwordInput = jQuery('.passwordInput'); // Input for username
  var $btnLogin = jQuery('.btnLogin');
  var $warning = jQuery('.warningMessage');
  var $domain = jQuery('.domainInput');
  var $channel = jQuery('.channelInput');
  var $msgComposer = jQuery('.msg-composer-container');
  var $messages = jQuery('.messages'); // Messages area
  var $inputMessage = jQuery('.inputMessage'); // Input message input box
  var $peopleList = jQuery('.msg-list-people-container');
  var $chatContainer = jQuery('.msg-sheet-content-container');
  var $joinRoom = jQuery('.joinRoom');
  var $btnregister = $('.btnregister');
  var messageTimeSent = jQuery(".timesent");

  var $loginPage = jQuery('.login-page'); // The login page
  var $chatPage = jQuery('.chat-page'); // The chatroom page
  
  //additional guest vars
  var guestSession = jQuery('#session_user_id').val(); 
  var $guestTextbox = jQuery('.textarea-starting');
  var $chatrep = jQuery('#chatrep_name');
  var $chatrep_image = jQuery('#chatrep_image');
  var $chatemailbox = jQuery('.chat-guest-email');
  var $btnchatemail = jQuery('.btnchatemail');
  var hasguestlog = false;
  var hasguestintro = false;
  var isguest = 1;
  var guestadded = false;


  jQuery.session.set('chatrep', $chatrep.val());
  jQuery.session.set('chatrep_image', $chatrep_image.val());
  
  // Prompt for setting a username
  var username;
  var avatar;
  var isadmin;
  var room;
  var connected = false;
  var messaging = false;
  
  var typing = false;
  var lastTypingTime;
  var channel = $channel.val();
  var interval = null;
  //var $currentInput = $usernameInput.focus();

  var socket = io.connect('http://dev.liverep.com:3001');
  
//Pad n to specified size by prepending a zeros
function zeroPad(num, size) {
	var s = num + "";
	while (s.length < size)
		s = "0" + s;
	return s;
}


function getFormattedDate(msTime) {
	var date_format = '12'; /* FORMAT CAN BE 12 hour (12) OR 24 hour (24)*/

	var d       = new Date(msTime);
	var hour    = d.getHours();  /* Returns the hour (from 0-23) */
	var minutes     = d.getMinutes();  /* Returns the minutes (from 0-59) */
	var result  = hour;
	var ext     = '';

	if(date_format == '12'){
		if(hour > 12){
			ext = 'PM';
			hour = (hour - 12);

			if(hour < 10){
				result = "0" + hour;
			}else if(hour == 12){
				hour = "00";
				ext = 'AM';
			}
		}
		else if(hour < 12){
			result = ((hour < 10) ? "0" + hour : hour);
			ext = 'AM';
		}else if(hour == 12){
			ext = 'PM';
		}
	}

	if(minutes < 10){
		minutes = "0" + minutes; 
	}

	result = result + ":" + minutes + ' ' + ext; 

	return result;
}

  // Format the time specified in ms from 1970 into local HH:MM:SS
  function timeFormat(msTime) {
  	var d = new Date(msTime);
  	return zeroPad(d.getHours(), 2) + ":" +
  	zeroPad(d.getMinutes(), 2) + ":" +
  	zeroPad(d.getSeconds(), 2) + " ";
  }


  function addParticipantsMessage (data) {
  	var message = '';
  	if (data.numUsers === 1) {
  		message += " there's 1 participant";
  	} else {
  		message += " there are " + data.numUsers + " participants";
  	}
  	log4 (message);
  }

  function setAuthenticate(){
  	jQuery('.msg-loader-img-container').show();
  	jQuery('.btnLogin').attr('disabled',true);
  	email = cleanInput($usernameInput.val().trim());
  	password = $passwordInput.val();
  	domain = jQuery('.domainInput').val();

  	if (!email){
  		$warning.show();
  		$warning.html('Invalid email');
  		jQuery('.msg-loader-img-container').hide();
  		jQuery('.btnLogin').removeAttr('disabled');
  	}else if (password == ""){
  		$warning.show();
  		$warning.html('Please enter password');
  		jQuery('.msg-loader-img-container').hide();
  		jQuery('.btnLogin').removeAttr('disabled');
  	}else {
  		$warning.html('');
  		socket.emit('authenticate', email,password,domain);
  	}

  }
  
  
  function setRegister(email,password,error){
  	$('.warningMessage_re').hide();
  	$('.warningMessage_ru').hide();
  	$('.warningMessage_rp').hide();

  	if (error !=""){
  		$('.warningMessage_re').show();
  		$('.warningMessage_re').html(error);
  	} else {
  		$('.usernameInput').val(email);
  		$('.passwordInput').val(password);
  		$('.register-page').fadeOut();
  		$('.login-page').fadeIn();
  		$( ".btnLogin" ).trigger( "click" );
  	} 

  }
  
  
  // Sets the client's username
  
  function setUsername (username,avatar,exist,isadmin2,userid) {
  	isadmin = isadmin2;
  	var hidemess = "";

  	if (exist==1) {
  		$warning.html('');
  		jQuery.session.set('username', username);	 
  		jQuery.session.set('avatar', avatar);
  		jQuery.session.set('isadmin', isadmin);
  		jQuery.session.set('userid', userid);

  		connected = true;

  		room = userid;
  		$loginPage.fadeOut();

      //if admin
      if (isadmin == 1){
      	isguest = 0;        	  
    	  //$peopleList.show();
    	  jQuery('.msg-sheet-content-container').hide();
    	  jQuery('.menu-header-btn').addClass('btnOnline');
    	  socket.emit('getrooms');
    	  
    	  interval = setInterval(function(){  socket.emit('refreshlist'); }, 5000);
    	  
    	}else {
          //if not admin after login
          isguest = 0;
          $chatPage.show();
          if(jQuery('.chat-page').is(':visible')){
          	jQuery('.msg-sheet-content').removeClass("loginBtm-0");
          }
          $msgComposer.show();
          $loginPage.off('click');
          $currentInput = $inputMessage.focus();

	      //add user to own room
	      socket.emit('add user', username,avatar,room,isadmin,domain,isguest,hidemess);
	  }

      // jQuery('.close-header-btn').addClass('btnExit');
      // jQuery('.close-header-btn').show();
      
      jQuery('.close-header-btn').removeClass('hide');
      jQuery('.msg-header-dropdown').removeClass('hide');
      jQuery('.logout-header-a').addClass('btnExit');

      jQuery('.msg-loader-img-container').hide();
      $loginPage.hide();

      setInterval(function(){
      	messageTimeSent.each(function(){
      		var each = moment(jQuery(this).data('time'));
      		jQuery(this).text(each.fromNow());
      	});

      },60000);
      

  }else {
  	$warning.show();
  	$warning.html('Account does not exist. Register <a href="javascript:void(0)" class="btnregister_a">here</a>');
  	jQuery('.msg-loader-img-container').hide();
  	jQuery('.btnLogin').removeAttr('disabled');
  }
}

function joinRoom(room,uname){
	$peopleList.fadeOut();
	jQuery('.msg-sheet-content-container').show();
	$chatPage.show();
	if(jQuery('.chat-page').is(':visible')){
		jQuery('.msg-sheet-content').removeClass("loginBtm-0");
	}
	$msgComposer.show();
      //$loginPage.off('click');
      $currentInput = $inputMessage.focus();
      messaging = true;

      //add user to own room
      socket.emit('joinRoom', room, jQuery.session.get('username'),jQuery.session.get('avatar'),uname);
  }

  function IsOnline(people,userid,domain){
  	for(socketId in people){
  		if(people[socketId].room === userid){
  			if (people[socketId].domain === domain){
  				return true;
  			}else {
  				return false;;	
  			}
  		}
  	}
  	return false;
  }
  
  function showRooms(people,rows){
  	var html = "";
  	var msg_count = 0;
  	var cntronline = 0;
  	var avatar = "";
  	var uname = "";
  	var listed = [];
  	var oclass = "wrap-item-list-link-offline";
  	if (rows.length == 0){
  		html += '<span class="meta-online-msg">No online users.</span>';
  	}else {
  		html += '<span class="meta-online-msg">List of people</span>';

  		for (var i = 0; i < rows.length; i++) {

  			if(IsOnline(people,rows[i].MemberId,rows[i].domain)){
  				listed.push(rows[i].MemberId);
  				oclass = "wrap-item-list-link-online";  
  			}else {
  				oclass = "wrap-item-list-link-offline";  
  			}

  			avatar = rows[i].profile_image;

  			if ((avatar != "") && (avatar != null)){

  			}else {
  				avatar = "https://d2qcctj8epnr7y.cloudfront.net/sheina/contrib/default_avatar.png";
  			}

  			uname = rows[i].Username;
  			if ((uname == null) || (uname == '')){
  				uname = 'user'+rows[i].room;
  			}

  			html += ' <a href="javascript:void(0)" id="room_'+rows[i].room+'" class="wrap-item-list-link '+oclass+' joinRoom" title="'+uname+'">';
  			html += '<div class="wrap-item-list-table">';
  			html += '<div class="wrap-item-list-img">';
  			html += '<div class="wrap-item-list-imgProfile">';
  			html += '<img style="width:30px;height:30px;" src="'+avatar+'" alt="" />';
  			html += '</div>';
  			html += ' </div>';
  			html += '<div class="wrap-item-name">';

  			msg_count = rows[i].total;
  			if (msg_count == 0){
  				html += ''+uname+' from '+rows[i].domain+' ';
  			}else {
  				html += ''+uname+' from '+rows[i].domain+' <span class="msg-notif-msg-user">'+msg_count+'</span>';
  			}

  			html += '</div>';
  			html += '<div class="wrap-item-user">';
  			html += '<div class="user-status-offline"></div>';
  			html += '</div>';
  			html += '</div>';
  			html += '</a>';


  		}


  		for(socketId in people){
  			if(people[socketId].isadmin === 0){
  				if(jQuery.inArray(people[socketId].room, listed) == -1){
  					html += ' <a href="javascript:void(0)" id="room_'+people[socketId].room+'" class="wrap-item-list-link wrap-item-list-link-online joinRoom" title="'+people[socketId].username+'">';
  					html += '<div class="wrap-item-list-table">';
  					html += '<div class="wrap-item-list-img">';
  					html += '<div class="wrap-item-list-imgProfile">';
  					html += '<img style="width:30px;height:30px;" src="'+people[socketId].avatar+'" alt="" />';
  					html += '</div>';
  					html += ' </div>';
  					html += '<div class="wrap-item-name">';

  					msg_count = people[socketId].msgcount;
  					if (msg_count == 0){
  						html += ''+people[socketId].username+' from '+people[socketId].domain+' ';
  					}else {
  						html += ''+people[socketId].username+' from '+people[socketId].domain+' <span class="msg-notif-msg-user">'+msg_count+'</span>';
  					}
  					html += '</div>';
  					html += '<div class="wrap-item-user">';
  					html += '<div class="user-status-offline"></div>';
  					html += '</div>';
  					html += '</div>';
  					html += '</a>';
  				}
  				cntronline++;
  			}
  		}


  	}

  	if (connected){
  		$peopleList.html(html);
  		$peopleList.fadeIn();

  		jQuery('.msg-unread-counter-active').html(cntronline);
  		jQuery('.msg-unread-counter-active').show();
  	}
  }
  
  
  function sendToSlack(channel,message,username,avatar,domain){
  	jQuery.post("https://tools.contrib.com/chat/sendtoslack",
  	{
  		channel:channel,
  		message:message,
  		username:username,
  		avatar:avatar,
  		domain:domain
  	},
  	function(data){
  		if (data.success){
  			console.log('posted to slack');
  		}else {
  			console.log('error while posting to slack');
  		}
  	});
  }
  
  // Sends a chat message
  function sendMessage () {
  	var message = $inputMessage.val();
  	var thed = jQuery('.domainInput').val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message) {
    	$inputMessage.val('');
    	if (channel != ""){
    		if (isadmin == 0){
    			sendToSlack(channel,message,jQuery.session.get('username'),jQuery.session.get('avatar'),thed);
    		}
    	}
      //log2(message);
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', {message:message, username:jQuery.session.get('username'), avatar:jQuery.session.get('avatar'), userid:jQuery.session.get('userid'),mdate:moment(),domain:domain});
  }
}

  //send gest message
  function sendGuestMessage(){
  	var gmessage = $guestTextbox.val();
  	var thed = jQuery('.domainInput').val();
  	domain = jQuery('.domainInput').val(); 
	    // Prevent markup from being injected into the message
	    gmessage = cleanInput(gmessage);
	    // if there is a non-empty message and a socket connection
	    if (gmessage) {
	    	$guestTextbox.val('');
	    	if (channel != ""){
	    		if (isadmin == 0){
	    			sendToSlack(channel,gmessage,'user'+guestSession,'https://d2qcctj8epnr7y.cloudfront.net/sheina/contrib/default_avatar.png',thed);
	    		}
	    	}


	    	if (guestadded === false){
	    		jQuery.session.set('username', 'user'+guestSession);	 
	    		jQuery.session.set('avatar', 'https://d2qcctj8epnr7y.cloudfront.net/sheina/contrib/default_avatar.png');
	    		jQuery.session.set('isadmin', 0);
	    		jQuery.session.set('userid', 0);
	    		socket.emit('add user', 'user'+guestSession,'https://d2qcctj8epnr7y.cloudfront.net/sheina/contrib/default_avatar.png',guestSession,0,domain,isguest,gmessage);
	    		guestadded = true;

	    	}else{
	    		socket.emit('new guest message', {message:gmessage, username:'user'+guestSession, avatar:'https://d2qcctj8epnr7y.cloudfront.net/sheina/contrib/default_avatar.png', userid:jQuery.session.get('userid'),mdate:moment(),domain:domain,guestsession:guestSession});
	    	}

	    }
	}


  // Log a message
  function log (message, options) {
  	var html = '';
  	html += '<div class="msg-comment msg-comment-by-user">';
  	html += '<div class="msg-comment-body-container">';
  	html += '<div class="msg-comment-body msg-embed-body">';
  	html += '<p>'+message+'</p>';
  	html += '</div>';
  	html += '<div class="msg-comment-caret"></div>';
  	html += '</div>';
  	html += '</div>';

  	var $el = jQuery('div').addClass('msg-conversation-part').html(html);
  	addMessageElement($el, options);
  }
  
  
  
  
  //Log a message2
  function log2 (message, msg_id,userid,now,options) {
  	now = moment(now);
  	if (userid == jQuery.session.get('userid')){
  		var html = '<div class="msg-conversation-part" id="msg_'+msg_id+'">';
  		html += '<div class="msg-comment msg-comment-by-user">';
  		html += '<div class="msg-comment-body-container msgmine">';
  		html += '<div class="msg-comment-body msg-embed-body">';
  		html += '<span class="msg-user-comment-name msg-user-comment-name-user text-capitalize">';
  		html += 'You';
  		html += '</span>';
  		html += '<p id="msgcontent_'+msg_id+'">'+message+'</p>';
  		html += '<input type="text" class="editText" id="msgeditcontent_'+msg_id+'" value="'+message+'" style="display:none">';
  		html += '<span class="mmanage" id="mmanage_'+msg_id+'">';
  		html += '<a href="javascript:void(0)" class="medit" id="msg_'+msg_id+'"><i class="fa fa-edit"></i></a>&nbsp;';
  		html += '<a href="javascript:void(0)" class="mdelete" id="msg_'+msg_id+'"><i class="fa fa-trash"></i></a>';
  		html += '</span>';

  		html += '</div>';
  		html += '<div class="msg-comment-caret"></div>';
  		html += '</div>';
  		html += '<div class="msg-comment-metadata-container">';
  		html += '<div class="msg-comment-metadata">';
  		html += '<span class="timesent" data-time=' + now + '>'+now.fromNow()+'</span>';
  		html += '</div>';
  		html += '</div>';
  		html += '<img class="msg-comment-avatar" src="'+ jQuery.session.get('avatar')+'" alt="" />';
  		html += '</div>';

  		jQuery('.messages').append(html);
  		messageTimeSent = jQuery(".timesent");
  		messageTimeSent.last().text(now.fromNow());
  	}
  }

  
  function logguest2 (message, msg_id,userid,now,options) {
  	now = moment(now);

  	var html = '<div class="msg-conversation-part" id="msg_'+msg_id+'">';
  	html += '<div class="msg-comment msg-comment-by-user">';
  	html += '<div class="msg-comment-body-container msgmine">';
  	html += '<div class="msg-comment-body msg-embed-body">';
  	html += '<span class="msg-user-comment-name msg-user-comment-name-user text-capitalize">';
  	html += 'You';
  	html += '</span>';
  	html += '<p id="msgcontent_'+msg_id+'">'+message+'</p>';
  	html += '<input type="text" class="editText" id="msgeditcontent_'+msg_id+'" value="'+message+'" style="display:none">';
  	html += '<span class="mmanage" id="mmanage_'+msg_id+'">';
  	html += '<a href="javascript:void(0)" class="medit" id="msg_'+msg_id+'"><i class="fa fa-edit"></i></a>&nbsp;';
  	html += '<a href="javascript:void(0)" class="mdelete" id="msg_'+msg_id+'"><i class="fa fa-trash"></i></a>';
  	html += '</span>';

  	html += '</div>';
  	html += '<div class="msg-comment-caret"></div>';
  	html += '</div>';
  	html += '<div class="msg-comment-metadata-container">';
  	html += '<div class="msg-comment-metadata">';
  	html += '<span class="timesent" data-time=' + now + '>'+now.fromNow()+'</span>';
  	html += '</div>';
  	html += '</div>';
  	html += '<img class="msg-comment-avatar" src="https://d2qcctj8epnr7y.cloudfront.net/sheina/contrib/default_avatar.png" alt="" />';
  	html += '</div>';

  	if (hasguestintro === false){

  		html +='<div class="msg-conversation-part">';
  		html +='<div class="msg-comment msg-comment-by-admin">';
  		html +='<div class="msg-comment-body-container autoresponder">';
  		html +='<div class="msg-comment-body msg-embed-body">';
  		html +="<p>You don't need to wait here to get "+jQuery.session.get('chatrep')+"'s reply.</p>";
  		html +='</div>';
  		html +='</div>';
  		html +='</div>';
  		html +='</div>';


  		html +='<div class="msg-conversation-part">';
  		html +='<div class="msg-comment msg-comment-by-admin">';
  		html +='<img src="'+jQuery.session.get("chatrep_image")+'" alt="" class="msg-comment-avatar">';
  		html +='<div class="msg-comment-body-container">';
  		html +='<div class="msg-comment-body msg-embed-body">';
  		html +='<p>Get notified by email</p>';
  		html +='<div class="msg-input-group msg-email-placeholder">';
  		html +='<input type="text" class="fc-input chat-guest-email" id="chat-guest-email" placeholder="Email Address...">';
  		html +='<span class="msg-input-group-btn">';
  		html +='<button class="msg-login-btn msg-login-btn-primary" type="button">';
  		html +='<button class="msg-login-btn msg-login-btn-primary btnchatemail" type="button"><i class="fa fa-envelope"></i> </button>';
  		html +='</span>';
  		html +='</div>';
  		html +='</div>';
  		html +='<div class="msg-comment-caret"></div>';
  		html +='</div>';
  		html +='<div class="msg-comment-metadata-container"><div class="msg-comment-metadata"><span class="timesent" data-time=' + now + '>'+now.fromNow()+'</span></div></div>';
  		html +='</div></div></div></div>';

  		hasguestintro = true;
  	}

  	jQuery('.messages').append(html);
  	messageTimeSent = jQuery(".timesent");
  	messageTimeSent.last().text(now.fromNow());

  }
  
//Log a message3 for join and left
function log3 (username,message, options) {
	var html = '<div class="msg-conversation-part">';
	html += '<div style="" class="msg-auto-response msg-auto-response-active">';
	html += '<div class="msg-auto-response-text">';
	html += '<p>';	
	html += '<i class="fa fa-comments-o"></i>';
	html += '<span class="msg-leave-user">'+username+'</span>'; 
	html += message;
	html += '</p>';
	html += '</div>';
	html += '</div>';
	html += '</div>';   

	jQuery('.messages').append(html);
}

//Log a message4 for number of participants
function log4 (message, options,rows,domain) {

	var html = '<div class="msg-conversation-part">';
	html += '<div style="" class="msg-auto-response msg-auto-response-active">';
	html += '<div class="msg-auto-response-text">';
	html += '<p>';
	html += '<span class="msg-participants">';
	html += '<i class="fa fa-group"></i>';
	html += message;
	html += '</span>';
	html += '</p>';
	html += '</div>';
	html += '</div>';
	html += '</div>';   
	
	
	if (options){
		html += '<div class="msg-app-profile-container ">';
		html += '<div class="msg-app-profile">';
		html += '<div class="msg-app-profile-team-and-activity">';
		html += '<div class="msg-app-profile-team">';
		html += domain.charAt(0).toUpperCase() + domain.slice(1) +' Team';
		html += '</div>';
		html += '<div class="msg-app-profile-last-active">';
		html += '<div class="msg-last-active">';
		html += '<span>';
		html += 'Active in the last 15 minutes';
		html += '</span>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html += '<div class="msg-active-admins">';
		for (var i in rows) {
			html += '<div class="msg-active-admin">';
			html += '<div class="msg-admin-avatar-active">';
			if (rows[i].profile_image==null){
				html += '<img alt="'+rows[i].Username+'" src="https://d2qcctj8epnr7y.cloudfront.net/sheina/contrib/default_avatar.png">';
			}else {
				html += '<img alt="'+rows[i].Username+'" src="'+rows[i].profile_image+'">';
			}
			html += '</div>';
			html += '<div class="msg-active-admin-name">';
			html += rows[i].Username;
			html += '</div>';
			html += '</div>';
		}
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html +='<div class="msg-auto-response msg-auto-response-active" style="">';
		html +='<div class="msg-auto-response-text">';
		html +='<p>The team usually responds in a few hours at this time of day.</p>';
		html +='</div>';
		html +='</div>';
		jQuery('.messages').prepend(html);
		
	}else {

		jQuery('.messages').append(html);
	}
}

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {

  	var now = data.mdate;
	    // Don't fade the message in if there is an 'X was typing'
	    var $typingMessages = getTypingMessages(data);
	    options = options || {};
	    if ($typingMessages.length !== 0) {
	    	options.fade = false;
	    	$typingMessages.remove();
	    }
	    
	    now = moment(now);

	    var html = '';
	    if (data.typing){
	    	html += '<div class="msg-conversation-part" id="msg_'+data.msg_id+'">';
	    	html += '<div class="msg-comment msg-comment-by-admin">';
	    	html += '<img class="msg-comment-avatar" alt="" src="'+data.avatar+'">';
	    	html += '<div class="msg-comment-typing-container">';
	    	html += '<b class="text-capitalize">'+data.username+'</b> is typing...';
	    	html += '</div>';
	    	html += '</div>';
	    	html += '</div>';
	    }else {
	    	html += '<div class="msg-comment msg-comment-by-admin">';
	    	html += '<span class="username"><img class="msg-comment-avatar" alt="" src="'+data.avatar+'"></span>';
	    	html += '<div class="msg-comment-body-container">';
	    	html += '<div class="msg-comment-body msg-embed-body">';
	    	html += '<span class="msg-user-comment-name text-capitalize">';
	    	html += data.username;
	    	html += '</span>';
	    	html += '<p>'+data.message+'</p>';
	    	html += '</div>';
	    	html += '<div class="msg-comment-caret"></div>';
	    	html += '</div>';
	    	html += '<div class="msg-comment-metadata-container">';
	    	html += '<div class="msg-comment-metadata">';
	    	html += '<span class="timesent" data-time=' + now + '>'+now.fromNow()+'</span>';
	    	html += '</div>';
	    	html += '</div>';
	    	html += '</div>';
	    }
	    
	    var $usernameDiv = jQuery('<span class="username"/>')
	    .text(data.username);
	    var $messageBodyDiv = jQuery('<span class="messageBody">')
	    .text(data.message);

	    var typingClass = data.typing ? 'typing' : '';
	    var $messageDiv = jQuery('<div class="msg-conversation-part" id="msg_'+data.msg_id+'">')
	    .data('username', data.username)
	    .addClass(typingClass)
	    .html(html);

	    addMessageElement($messageDiv, options);
	    
	    messageTimeSent = jQuery(".timesent");

	    messageTimeSent.last().text(now.fromNow());

	}


	function showhistory(rows){
		var html = '';
		var avatar = '';
		var now = '';

		for (var i in rows) {
			if ((rows[i].profile_image != "") && (rows[i].profile_image != null)){
				avatar = rows[i].profile_image;
			}else {
				avatar = "https://d2qcctj8epnr7y.cloudfront.net/sheina/contrib/default_avatar.png";
			}

			now = moment(rows[i].mtimestamp);

			if (rows[i].member_id == jQuery.session.get('userid')){
				html += '<div class="msg-conversation-part" id="msg_'+rows[i].msg_id+'" style="display: block;">';
				html += '<div class="msg-comment msg-comment-by-user">';
				html += '<div class="msg-comment-body-container msgmine">';
				html += '<div class="msg-comment-body msg-embed-body">';
				html += '<span class="msg-user-comment-name msg-user-comment-name-user text-capitalize">';
				html += 'You';
				html += '</span>';
				html += '<p id="msgcontent_'+rows[i].msg_id+'">'+rows[i].message+'</p>';
				html += '<input type="text" class="editText" id="msgeditcontent_'+rows[i].msg_id+'" value="'+rows[i].message+'" style="display:none">';
				html += '<span class="mmanage" id="mmanage_'+rows[i].msg_id+'">';
				html += '<a href="javascript:void(0)" class="medit" id="msg_'+rows[i].msg_id+'"><i class="fa fa-edit"></i></a>&nbsp;';
				html += '<a href="javascript:void(0)" class="mdelete" id="msg_'+rows[i].msg_id+'"><i class="fa fa-trash"></i></a>';
				html += '</span>';
				html += '</div>';
				html += '<div class="msg-comment-caret"></div>';
				html += '</div>';
				html += '<div class="msg-comment-metadata-container">';
				html += '<div class="msg-comment-metadata">';
				html += '<span class="timesent" data-time=' + rows[i].mtimestamp + '>'+now.fromNow()+'</span>';
				html += '</div>';
				html += '</div>';
				html += '<img class="msg-comment-avatar" src="'+ jQuery.session.get('avatar')+'" alt="" />';
				html += '</div>';
				html += '</div>';

				messageTimeSent = jQuery(".timesent");
				now = moment(rows[i].mtimestamp);
				messageTimeSent.last().text(now.fromNow());
			}else {
				html += '<div class="msg-conversation-part" id="msg_'+rows[i].msg_id+'" style="display: block;">';
				html += '<div class="msg-comment msg-comment-by-admin">';
				html += '<span class="username"><img class="msg-comment-avatar" alt="" src="'+avatar+'"></span>';
				html += '<div class="msg-comment-body-container">';
				html += '<div class="msg-comment-body msg-embed-body">';
				html += '<span class="msg-user-comment-name text-capitalize">';
				html += rows[i].Username;
				html += '</span>';
				html += '<p>'+rows[i].message+'</p>';
				html += '</div>';
				html += '<div class="msg-comment-caret"></div>';
				html += '</div>';
				html += '<div class="msg-comment-metadata-container">';
				html += '<div class="msg-comment-metadata">';
				html += '<span class="timesent" data-time=' + rows[i].mtimestamp + '>'+now.fromNow()+'</span>';
				html += '</div>';
				html += '</div>';
				html += '</div>';
				html += '</div>';


				messageTimeSent = jQuery(".timesent");

				messageTimeSent.last().text(now.fromNow());
			}
	        //console.log('Post Titles: ', rows[i].post_title);
	    }

	    jQuery('.messages').append(html);

	}

  //function update user list
  function updateOnlineUsers(people,rows){
  	var html = "";
  	var msg_count = 0;
  	var cntronline = 0;
  	var avatar = "";
  	var uname ="";
  	var oclass = "wrap-item-list-link-offline";
  	var listed = [];
  	if (rows.length == 0){
  		html += '<span class="meta-online-msg">No online users.</span>';
  	}else {
  		html += '<span class="meta-online-msg">List of people</span>';
  		for (var i = 0; i < rows.length; i++) {

  			if(IsOnline(people,rows[i].MemberId,rows[i].domain)){
  				listed.push(rows[i].MemberId);
  				oclass = "wrap-item-list-link-online";  
  			}else {
  				oclass = "wrap-item-list-link-offline";  
  			}

  			avatar = rows[i].profile_image;

  			if ((avatar != "") && (avatar != null)){

  			}else {
  				avatar = "https://d2qcctj8epnr7y.cloudfront.net/sheina/contrib/default_avatar.png";
  			}

  			uname = rows[i].Username;
  			if ((uname == null) || (uname == '')){
  				uname = 'user'+rows[i].room;
  			}
  			html += ' <a href="javascript:void(0)" id="room_'+rows[i].room+'" class="wrap-item-list-link '+oclass+' joinRoom" title="'+uname+'">';
  			html += '<div class="wrap-item-list-table">';
  			html += '<div class="wrap-item-list-img">';
  			html += '<div class="wrap-item-list-imgProfile">';
  			html += '<img style="width:30px;height:30px;" src="'+avatar+'" alt="" />';
  			html += '</div>';
  			html += ' </div>';
  			html += '<div class="wrap-item-name">';

  			msg_count = rows[i].total;
  			if (msg_count == 0){
  				html += ''+uname+' from '+rows[i].domain+' ';
  			}else {
  				html += ''+uname+' from '+rows[i].domain+' <span class="msg-notif-msg-user">'+msg_count+'</span>';
  			}

						  //html += ''+people[socketId].username+' from '+people[socketId].domain+' <span class="msg-notif-msg-user">1</span>';
						  html += '</div>';
						  html += '<div class="wrap-item-user">';
						  html += '<div class="user-status-offline"></div>';
						  html += '</div>';
						  html += '</div>';
						  html += '</a>';


						}

						for(socketId in people){
							if(people[socketId].isadmin === 0){
								if(jQuery.inArray(people[socketId].room, listed) == -1){
									html += ' <a href="javascript:void(0)" id="room_'+people[socketId].room+'" class="wrap-item-list-link wrap-item-list-link-online joinRoom" title="'+people[socketId].username+'">';
									html += '<div class="wrap-item-list-table">';
									html += '<div class="wrap-item-list-img">';
									html += '<div class="wrap-item-list-imgProfile">';
									html += '<img style="width:30px;height:30px;" src="'+people[socketId].avatar+'" alt="" />';
									html += '</div>';
									html += ' </div>';
									html += '<div class="wrap-item-name">';

									msg_count = people[socketId].msgcount;
									if (msg_count == 0){
										html += ''+people[socketId].username+' from '+people[socketId].domain+' ';
									}else {
										html += ''+people[socketId].username+' from '+people[socketId].domain+' <span class="msg-notif-msg-user">'+msg_count+'</span>';
									}
									html += '</div>';
									html += '<div class="wrap-item-user">';
									html += '<div class="user-status-offline"></div>';
									html += '</div>';
									html += '</div>';
									html += '</a>';
								}
								cntronline++;
							}
						}

					}

					$peopleList.html(html);
					if (messaging===false){
						$peopleList.fadeIn();
						jQuery('.msg-sheet-content-container').hide();
						$chatPage.hide();
						$msgComposer.hide();
						$messages.html('');
					}
					if (connected){
						jQuery('.msg-unread-counter-active').html(cntronline);
						jQuery('.msg-unread-counter-active').show();
					}
				}

  // Adds the visual chat typing message
  function addChatTyping (data) {
  	data.typing = true;
  	data.message = 'is typing';
  	addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
  	getTypingMessages(data).fadeOut(function () {
  		jQuery(this).remove();
  	});
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
  	var $el = jQuery(el);

    // Setup default options
    if (!options) {
    	options = {};
    }
    if (typeof options.fade === 'undefined') {
    	options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
    	options.prepend = false;
    }

    // Apply options
    if (options.fade) {
    	$el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
    	$messages.prepend($el);
    } else {
    	$messages.append($el);
    }

    $messages[0].scrollTop = $messages[0].scrollHeight;
}

  // Prevents input from having injected markup
  function cleanInput (input) {
  	return jQuery('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {

  	if (!typing) {
  		typing = true;
  		socket.emit('typing');
  	}
  	lastTypingTime = (new Date()).getTime();

  	setTimeout(function () {
  		var typingTimer = (new Date()).getTime();
  		var timeDiff = typingTimer - lastTypingTime;
  		if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
  			socket.emit('stop typing');
  			typing = false;
  		}
  	}, TYPING_TIMER_LENGTH);

  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
  	return jQuery('.msg-conversation-part.typing').filter(function (i) {
  		return jQuery(this).data('username') === data.username;
  	});
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
    	hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
}

  // Keyboard events
  $inputMessage.on('input', function() {
  	updateTyping();
  });

 //keypress event

 $usernameInput.keypress(function( event ) {
 	if ( event.which == 13 ) {
 		setAuthenticate();
 	}
 });

 $passwordInput.keypress(function( event ) {
 	if ( event.which == 13 ) {
 		setAuthenticate();
 	}
 });
 

 $inputMessage.keypress(function( event ) {
 	if ( event.which == 13 ) {
 		sendMessage();
 		socket.emit('stop typing');
 		typing = false;

            //added by jeiseun
            //Append the new content goes here
            //Getting the element's new height now
            var sHeight = jQuery('.msg-sheet-content')[0].scrollHeight;
            //Scrolling the element to the sHeight
            jQuery('.msg-sheet-content').scrollTop(sHeight);
        }
    });


  // Click events

  //click Login
  $btnLogin.click(function () {
  	setAuthenticate();
  });

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    //$currentInput.focus();
});

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
  	$inputMessage.focus();
  });
  

// button to show the registration form
$(document).on('click', '.btnregister_a', function(e) { 
	$('.login-page').hide();
	$('.register-page').show();
});

 // button to show the registration form
 $(document).on('click', '.btnFReg', function(e) { 
 	$('.login-page').hide();
 	$('.register-page').show();
 });

 // back button from register
 $(document).on('click', '.btnBack', function(e) {
 	$('.login-page').show();
 	$('.register-page').hide();
 });

  // back on the main setting
  $(document).on('click', '.btnCancel', function(e) {
  	$('.msg-conversation-parts-container').removeClass('hide');
  	$('.msg-composer-container').removeClass('hide');
  	$('.msg-account-setting-container').addClass('hide');
  });

  // account setting shows
  $(document).on('click', '.account-settings-msg', function(e){
  	$('.msg-conversation-parts-container').addClass('hide');
  	$('.msg-composer-container').addClass('hide');
  	$('.msg-account-setting-container').removeClass('hide');
  	jQuery('.settings').trigger('click');
  	getdetails(jQuery.session.get('userid'));
  });

  $(document).on('click', '.btnSaveUpdate', function(e){
  	
  	var userid = jQuery.session.get('userid');
  	var firstname = $('.txtFirstname').val();
  	var lastname = $('.txtLastname').val();
  	var username = $('.txtUsername').val();
  	var password = $('.txtPassword').val();
  	var imageurl = $('.txtImageurl').val();
  	var imageRegex = /^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png)$/;
  	//var imageRegex2 = (http(s?):)|([/|.|\w|\s])*\.(?:jpg|gif|png);

  	var counter = 0;

  	if (firstname == '') {
  		$('.txtClassError').html('FirstName is Empty').removeClass('hide');
  		counter++;
  	} else if(lastname == '') {
		console.log('lastname is empty');
		$('.txtClassError').html('Last Name is Empty').removeClass('hide');
		counter++;
  	} else if(username == '') {
		$('.txtClassError').html('User Name is Empty').removeClass('hide');
		counter++;
  	} else if(password == '') {
		$('.txtClassError').html('Password is Empty').removeClass('hide');
		counter++;
  	} else if(password.length < 6) {
		$('.txtClassError').html('Password is too Short').removeClass('hide');
		counter++;
  	} else if(imageurl == '') {
		$('.txtClassError').html('Image Url is Empty').removeClass('hide');
		counter++;
  	} else if(!imageRegex.test(imageurl)) {
		$('.txtClassError').html('Image Url is Invalid').removeClass('hide');
		counter++;
  	} else {

			$(this).prop('disabled', true);
			$('.txtClassError').html('Image Url is Invalid').addClass('hide');

	  		var data = {
	  			userid:userid,
	  			firstname:firstname,
	  			lastname:lastname,
	  			username:username,
	  			password:password,
	  			imageurl:imageurl,
	  		};

	  		console.log(data);
	  		 //socket.emit('updateaccount', data);
	  		 // objecttostring(data);
  		 }
  	});

	//socket.on('getdetails', userid:userid );

  function getdetails(userid) {
	var asd = socket.emit('get user details', userid);
	console.log(userid);
	console.log(asd);
  }

  socket.on('get member details', function(data) {
	  	console.log(data);
  });

  $(document).on('click', '.btnSubmitRegister', function(e) { 
  	$('.warningMessage_re').hide();
  	$('.warningMessage_ru').hide();
  	$('.warningMessage_rp').hide();
  	$(this).prop('disabled', true);

  	var reg_email = $('.regEmailInput').val();
  	var reg_username = $('.regUsernameInput').val();
  	var reg_password = $('.regPasswordInput').val();
  	var emailfilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

  	if (reg_email == ""){
  		$('.warningMessage_re').show();
  		$('.warningMessage_re').html('Please enter email');
  	}	else if(!emailfilter.test(reg_email)){
  		$('.warningMessage_re').show();
  		$('.warningMessage_re').html('Invalid Email Address');
  	}	else if (reg_username == ''){
  		$('.warningMessage_ru').show();
  		$('.warningMessage_ru').html('Please enter username');
  	}	else if (reg_password == ''){
  		$('.warningMessage_rp').show();
  		$('.warningMessage_rp').html('Please enter password');
  	}else {
  		socket.emit('register', reg_email,reg_username,reg_password);
  	}

  });

$(document).on('keypress', '.regPasswordInput', function(e) {
	if ( e.which == 13 ) {
		$('.warningMessage_re').hide();
		$('.warningMessage_ru').hide();
		$('.warningMessage_rp').hide();
		$(this).prop('disabled', true);

		var reg_email = $('.regEmailInput').val();
		var reg_username = $('.regUsernameInput').val();
		var reg_password = $('.regPasswordInput').val();
		var emailfilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

		if (reg_email == ""){
			$('.warningMessage_re').show();
			$('.warningMessage_re').html('Please enter email');
		}	else if(!emailfilter.test(reg_email)){
			$('.warningMessage_re').show();
			$('.warningMessage_re').html('Invalid Email Address');
		}	else if (reg_username == ''){
			$('.warningMessage_ru').show();
			$('.warningMessage_ru').html('Please enter username');
		}	else if (reg_password == ''){
			$('.warningMessage_rp').show();
			$('.warningMessage_rp').html('Please enter password');
		}else {
			socket.emit('register', reg_email,reg_username,reg_password);
		}
	}
});

  //for guest messages
  $guestTextbox.keypress(function( event ) {
  	if ( event.which == 13 ) {
  		domain = jQuery('.domainInput').val(); 
  		if (hasguestlog === false){

  			if(jQuery(LoginArea).hasClass("hide")){
  				jQuery('.msg-launcher.msg-launcher-enable').addClass("hide").fadeOut();
  				jQuery('.msg-messenger.msg-messenger-active').removeClass("hide").fadeIn();
  				jQuery('.msg-conversation-sheet').removeClass('msg-conversation-sheet-hide');
  				jQuery('.login-page').hide();
  			}

  			hasguestlog = true;
			  //if not admin after login
			  $chatPage.show();
			  if(jQuery('.chat-page').is(':visible')){
			  	jQuery('.msg-sheet-content').removeClass("loginBtm-0");
			  }
			  $msgComposer.show();
			  $loginPage.off('click');
			  $currentInput = $inputMessage.focus();
		      //add user to own room
		  }

		  if (hasguestlog === true){
		  	sendGuestMessage();
		  }

		}
	});
  
  //guest entered email
  jQuery(document).on('keypress', '#chat-guest-email', function(event) { 
  	var emailfilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  	if ( event.which == 13 ) {
  		var chat_email = jQuery(this).val();
  		if(!emailfilter.test(chat_email)){
  			alert('Invalid Email');
  		}else {
  			jQuery('.msg-email-placeholder').html('on '+chat_email); 
  			socket.emit('send guest message', chat_email,guestSession);
  		}
  	}
  });
  
  
  jQuery(document).on('click', '.btnchatemail', function(e) { 
  	var emailfilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  	var chat_email = jQuery('#chat-guest-email').val();
  	if(!emailfilter.test(chat_email)){
  		alert('Invalid Email');
  	}else {
  		jQuery('.msg-email-placeholder').html('on '+chat_email); 
  		socket.emit('send guest message', chat_email,guestSession);
  	}
  });
  
  jQuery(document).on('click', '.joinRoom', function(e) { 
  	var id = jQuery(this).attr('id');
  	var uname = jQuery(this).attr('title');
  	var rid = id.replace('room_','');
  	rid = parseInt(rid);
  	joinRoom(rid,uname);
  });
  
  jQuery(document).on('click', '.mdelete', function(e) { 
  	var id = jQuery(this).attr('id');
  	var msg_id = id.replace('msg_','');
  	var div = jQuery(this).parents('.msg-conversation-part');
  	div.fadeOut();
  	socket.emit('deletemessage', msg_id);
  });
  
  
  jQuery(document).on('click', '.medit', function(e) { 
  	jQuery('.editText').hide();
  	var id = jQuery(this).attr('id');
  	var msg_id = id.replace('msg_','');
  	jQuery('#msgcontent_'+msg_id).hide();
  	jQuery('#msgeditcontent_'+msg_id).fadeIn();
  	jQuery(this).closest('.mmanage').hide();
  });
  
  jQuery(document).on('keypress', '.editText', function(event) { 
  	if ( event.which == 13 ) {
  		var id = jQuery(this).attr('id');
  		var msg_id = id.replace('msgeditcontent_','');
  		var newmessage = jQuery(this).val();
  		if (newmessage != ""){
  			jQuery('#msgcontent_'+msg_id).fadeIn();
  			jQuery('#msgeditcontent_'+msg_id).hide();
  			jQuery('#mmanage_'+msg_id).css('display','');
  			jQuery('#msgcontent_'+msg_id).html(newmessage);
  			socket.emit('updatemessage', msg_id,newmessage);
  		}
  	}
  });
  
  jQuery(document).on('click', '.btnExit' , function(e) { 

  	socket.emit('logout');
	  //socket.emit('disconnect');
	  //socket.disconnect(true); 
	  connected = false;
	  messaging = "";
	  clearInterval(interval); 
	  jQuery.session.clear();
	  jQuery('.msg-list-people-container').html('');
	  jQuery('.msg-list-people-container').hide();
	  jQuery('.msg-composer-container').hide();
	  jQuery('.chat-page').hide();
	  jQuery('.messages').html('');
	  jQuery('.login-page').show();
	  jQuery('.usernameInput').val('');
	  jQuery('.passwordInput').val('');
	  jQuery('.close-header-btn').removeClass('btnExit');
	  jQuery('.close-header-btn').addClass('hide');
	  jQuery('.msg-unread-counter-active').hide();
	  jQuery('.msg-sheet-content-container').show();
	  jQuery('.btnLogin').attr('disabled',false);	
	  jQuery('.logout-header-a').removeClass('btnExit');
	  jQuery('.settings').trigger('click');
	  $loginPage.show();
	  jQuery('.menu-header-btn').removeClass('btnOnline');

	});


  jQuery(document).on('click', '.btnOnline', function(e) {
  	messaging = false;
  	socket.emit('refreshlist');
  });


$('.settings').click(function() {
  	var clicks = $(this).data('clicks');
  	if (clicks) {
      // odd clicks
      $(this).parents('.msg-header-dropdown').find('.msg-dropdown-ul').hide();
  } else {
      // even clicks
      $(this).parents('.msg-header-dropdown').find('.msg-dropdown-ul').show();
  }
  $(this).data("clicks", !clicks);
});
  
  
  /*jQuery(document).on('mouseenter', '.msgmine', function() {
	  jQuery(this).find('.mmanage').show();
	});
  jQuery(document).on('mouseleave', '.msgmine', function() {
		  jQuery(this).find('.mmanage').hide();
		});*/

  // Socket events
  
socket.on('registered', function (data) {
	$('.btnSubmitRegister').prop('disabled', false);
	$('.warningMessage_re').hide();
	if (data.error == ""){
		$('.register-page').fadeOut();
		$('.login-page').fadeIn();
		$('.usernameInput').val(data.email);
		$('.passwordInput').val(data.password);
		$('.btnLogin').trigger( "click" );
	}else {
		$('.warningMessage_re').show();
		$('.warningMessage_re').html(data.error);
	}
});

socket.on('viewuserdetails', function(data){

	if (data.error === "") {
  
	} else {
		var firstname = $('.txtFirstname').val(data.firstname);
	  	var lastname = $('.txtLastname').val(data.lastname);
	  	var username = $('.txtUsername').val(data.username);
	  	var password = $('.txtPassword').val(data.password);
	  	var imageurl = $('.txtImageurl').val(data.avatar);
	  	var imageurl = $('.txtEmail').val(data.avatar);
	}

});
	  
//Whenever the server emits 'authenticated', log user
socket.on('authenticated', function (data) {
	setUsername(data.username,data.avatar,data.exist,data.isadmin,data.userid);
});

socket.on("update", function(msg,isnew,rows,domain) {
	log4 (msg,isnew,rows,domain);
});

socket.on("history", function(room,rows) {
	showhistory(rows);
});

  //post login user message
  socket.on("owner message", function(data) {
  	log2 (data.message, data.msg_id,data.userid,data.mdate);
  });
  
  //post guest message
  //post login user message
  socket.on("owner guest message", function(data) {
  	logguest2(data.message, data.msg_id,data.userid,data.mdate);
  });
  
  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
  	connected = true;
    // Display the welcome message
    var message = "Welcome to Contrib Messaging App ";
    log2 (message, 0,jQuery.session.get('username'),new Date().getTime(),{
    	prepend: true
    });
    
    //addParticipantsMessage(data);
});

  //execute get rooms
  socket.on('listrooms', function (data) {
  	showRooms(data.people,data.rows);
  });

  
  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
  	addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
  	log3 (jQuery.session.get('username'),' has joined the conversation');
  	addParticipantsMessage(data);
  });
  
  
  //whenever new user is online update online user list
  socket.on('updatelist', function (data) {
  	updateOnlineUsers(data.people,data.rows);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
  	log3 (data.username,' has left the conversation');
  	removeChatTyping(data);

  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
  	addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
  	removeChatTyping(data);
  });
  
  socket.on('new guest message', function (username,avatar,room,isadmin,domain,guest,message) {
  	domain = jQuery('.domainInput').val(); 
  	socket.emit('new guest message', {message:message, username:'user'+guestSession, avatar:'https://d2qcctj8epnr7y.cloudfront.net/sheina/contrib/default_avatar.png', userid:jQuery.session.get('userid'),mdate:moment(),domain:domain,guestsession:guestSession});
  });
  
});
