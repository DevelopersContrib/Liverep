$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize varibles
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $passwordInput = $('.passwordInput'); // Input for username
  var $btnLogin = $('.btnLogin');
  var $warning = $('.warningMessage');
  var $domain = $('.domainInput');
  var $msgComposer = $('.msg-composer-container');
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $peopleList = $('.msg-list-people-container');
  var $chatContainer = $('.msg-sheet-content-container');
  var $joinRoom = $('.joinRoom');
  var $btnregister = $('.btnregister');

  var $loginPage = $('.login-page'); // The login page
  var $chatPage = $('.chat-page'); // The chatroom page

  // Prompt for setting a username
  var username;
  var avatar;
  var isadmin;
  var room;
  var connected = false;
  
  var typing = false;
  var lastTypingTime;
  var domain = $domain.val();
  //var $currentInput = $usernameInput.focus();

  var socket = io.connect('http://dev.liverep.com:3001');

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
	  email = cleanInput($usernameInput.val().trim());
	  password = $passwordInput.val();
	  domain = $('.domainInput').val();
	  
	  if (!email){
		  $warning.show();
		  $warning.html('Invalid email');
	  }else if (password == ""){
		  $warning.show();
		  $warning.html('Please enter password');
	  }else {
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
  
  function setUsername (username,avatar,exist,isadmin,userid) {
     if (exist==1) {
      
      $.session.set('username', username);	 
      $.session.set('avatar', avatar);
      
      $.session.set('isadmin', isadmin);
      
      room = userid;
      $loginPage.fadeOut();
      
      //if admin
      if (isadmin == 1){
    	  
    	  //$peopleList.show();
    	  $('.msg-sheet-content-container').hide();
    	  $('.menu-header-btn').addClass('btnOnline');
    	  socket.emit('getrooms');
    	  
      }else {
          //if not admin after login
    	  $chatPage.show();
	      if($('.chat-page').is(':visible')){
	        $('.msg-sheet-content').removeClass("loginBtm-0");
	      }
	      $msgComposer.show();
	      $loginPage.off('click');
	      $currentInput = $inputMessage.focus();
	    
	      //add user to own room
	      socket.emit('add user', username,avatar,room,isadmin,domain);
	      
      }
    }else {
    	$warning.show();
		$warning.html('Account does not exist. Register <a href="javascript:void(0)" class="btnregister_a">here</a>');
    }
  }
  
  function joinRoom(room){
	  $peopleList.fadeOut();
	  $('.msg-sheet-content-container').show();
	  $chatPage.show();
      if($('.chat-page').is(':visible')){
        $('.msg-sheet-content').removeClass("loginBtm-0");
      }
      $msgComposer.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();
    
      //add user to own room
      socket.emit('joinRoom', room, $.session.get('username'),$.session.get('avatar'));
  }

  
  function showRooms(people){
	  var html = "";
	  var msg_count = 0;
	  if (people.length == 0){
		  html += '<span class="meta-online-msg">No online users.</span>';
	  }else {
		  html += '<span class="meta-online-msg">List of people</span>';
		  
		  
		  for(socketId in people){
			    if(people[socketId].isadmin === 0){
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
					  
					  //html += ''+people[socketId].username+' from '+people[socketId].domain+' <span class="msg-notif-msg-user">1</span>';
					  html += '</div>';
					  html += '<div class="wrap-item-user">';
					  html += '<div class="user-status-offline"></div>';
					  html += '</div>';
					  html += '</div>';
					  html += '</a>';
			    }
			  }
		  
	  }
	  
	  $peopleList.html(html);
	  $peopleList.fadeIn();
	  
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
	      
    var $el = $('div').addClass('msg-conversation-part').html(html);
    addMessageElement($el, options);
  }
  
  
   
  
  //Log a message2
  function log2 (message, options) {
	var html = '<div class="msg-conversation-part">';
	    html += '<div class="msg-comment msg-comment-by-user">';
	    html += '<div class="msg-comment-body-container">';
	    html += '<div class="msg-comment-body msg-embed-body">';
	    html += '<p>'+message+'</p>';
	    html += '</div>';
	    html += '<div class="msg-comment-caret"></div>';
	    html += '</div>';
	    html += '</div>';
	    html += '</div>';   
	      
   $('.messages').append(html);
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
	      
   $('.messages').append(html);
  }

//Log a message4 for number of participants
  function log4 (message, options) {
	  
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
		html +='<div class="msg-auto-response msg-auto-response-active" style="">';
		html +='<div class="msg-auto-response-text">';
		html +='<p>The team usually responds in a few hours at this time of day.</p>';
		html +='</div>';
		html +='</div>';
	}
	      
   $('.messages').append(html);
  }
  
  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
	
	  
	    // Don't fade the message in if there is an 'X was typing'
	    var $typingMessages = getTypingMessages(data);
	    options = options || {};
	    if ($typingMessages.length !== 0) {
	      options.fade = false;
	      $typingMessages.remove();
	    }
	
	    var html = '';
	    if (data.typing){
	    	html += '<div class="msg-conversation-part">';
	    	html += '<div class="msg-comment msg-comment-by-admin">';
	    	html += '<img class="msg-comment-avatar" alt="" src="'+data.avatar+'">';
	    	html += '<div class="msg-comment-typing-container">';
	    	html += '<b class="text-capitalize">'+data.username+'</b> is typing...';
	    	html += '</div>';
	    	html += '</div>';
	    	html += '</div>';
	    }else {
		    html += '<div class="msg-comment msg-comment-by-admin">';
		    html += '<span class="username"><img class="msg-comment-avatar" alt="" src="'+data.avatar+'"><br><small>'+data.username+'</small></span>';
		    html += '<div class="msg-comment-body-container">';
		    html += '<div class="msg-comment-body msg-embed-body">';
		    html += '<p>'+data.message+'</p>';
		    html += '</div>';
		    html += '<div class="msg-comment-caret"></div>';
		    html += '</div>';
		    html += '</div>';
	    }
	    
	    var $usernameDiv = $('<span class="username"/>')
	      .text(data.username);
	    var $messageBodyDiv = $('<span class="messageBody">')
	      .text(data.message);
	
	    var typingClass = data.typing ? 'typing' : '';
	    var $messageDiv = $('<div class="msg-conversation-part">')
	      .data('username', data.username)
	      .addClass(typingClass)
	      .html(html);
	
	    addMessageElement($messageDiv, options);
	
  }
  
  //function update user list
  function updateOnlineUsers(people){
	  var html = "";
	  var msg_count = 0;
	  
	  if (people.length == 0){
		  html += '<span class="meta-online-msg">No online users.</span>';
	  }else {
		  html += '<span class="meta-online-msg">List of people</span>';
		  
		  for(socketId in people){
			    if(people[socketId].isadmin === 0){
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
					  
					  //html += ''+people[socketId].username+' from '+people[socketId].domain+' <span class="msg-notif-msg-user">1</span>';
					  html += '</div>';
					  html += '<div class="wrap-item-user">';
					  html += '<div class="user-status-offline"></div>';
					  html += '</div>';
					  html += '</div>';
					  html += '</a>';
			    }
			  }
		  
	  }
	  
	  $peopleList.html(html);
	  $peopleList.fadeIn();
	  $('.msg-sheet-content-container').hide();
	  $chatPage.hide();
      $msgComposer.hide();
      $messages.html('');
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
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

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
    return $('<div/>').text(input).text();
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
    return $('.msg-conversation-part.typing').filter(function (i) {
      return $(this).data('username') === data.username;
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
            var sHeight = $('.msg-sheet-content')[0].scrollHeight;
            //Scrolling the element to the sHeight
            $('.msg-sheet-content').scrollTop(sHeight);
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
  
  $(document).on('click', '.btnregister_a', function(e) { 
	 $('.login-page').hide();
	 $('.register-page').show();
  });
  
  $(document).on('click', '.btnFReg', function(e) { 
		 $('.login-page').hide();
		 $('.register-page').show();
	});
  
  $(document).on('click', '.btnSubmitRegister', function(e) { 
	    $('.warningMessage_re').hide();
	    $('.warningMessage_ru').hide();
	    $('.warningMessage_rp').hide();
	    
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
  
  
  $(document).on('click', '.joinRoom', function(e) { 
	  var id = $(this).attr('id');
	  var rid = id.replace('room_','');
	  rid = parseInt(rid);
	  joinRoom(rid);
  });
  
  $(document).on('click', '.btnOnline', function(e) {
	  
	  socket.emit('refreshlist');
	  
	 
  });
  
  
 

  // Socket events

  
//Whenever the server emits 'authenticated', log user
  
  
  
  socket.on('registered', function (data) {
	  setRegister(data.email,data.password,data.error);
  });

  
  socket.on('authenticated', function (data) {
	  setUsername(data.username,data.avatar,data.exist,data.isadmin,data.userid);
  });

  
  socket.on("update", function(msg,isnew) {
	  log4 (msg,isnew);
  });
  
  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Contrib Messaging App ";
    log2(message, {
      prepend: true
    });
    //addParticipantsMessage(data);
  });

  //execute get rooms
  socket.on('listrooms', function (data) {
	       showRooms(data.people);
	  });

  
  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
	  
	   log3 ($.session.get('username'),' has joined the conversation');
	   addParticipantsMessage(data);
	  
  });
  
  
  //whenever new user is online update online user list
  socket.on('updatelist', function (data) {
	 updateOnlineUsers(data.people);
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
});
