/*For Auto Resizing Textarea*/
jQuery('body').append('<div id="autoResizeTextareaCopy" style="box-sizing: border-box; -moz-box-sizing: border-box;  -ms-box-sizing: border-box; -webkit-box-sizing: border-box; visibility: hidden;"></div>');
var $copy = jQuery('#autoResizeTextareaCopy');

function autoSize($textarea, options) {
	// The copy must have the same padding, the same dimentions and the same police than the original.
	$copy.css({
		fontFamily:     $textarea.css('fontFamily'),
		fontSize:       $textarea.css('fontSize'),
		padding:        $textarea.css('padding'),
		paddingLeft:    $textarea.css('paddingLeft'),
		paddingRight:   $textarea.css('paddingRight'),
		paddingTop:     $textarea.css('paddingTop'), 
		paddingBottom:  $textarea.css('paddingBottom'), 
		width:          $textarea.css('width')
	});
	$textarea.css('overflow', 'hidden');
	
	// Copy textarea contents; browser will calculate correct height of copy.
	var text = $textarea.val().replace(/\n/g, '<br/>');
	$copy.html(text + '<br />');
	
	// Then, we get the height of the copy and we apply it to the textarea.
	var newHeight = $copy.css('height');
	$copy.html(''); // We do this because otherwise, a large void appears in the page if the textarea has a high height.
	if(parseInt(newHeight) != 0) {
		if((options.maxHeight != null && parseInt(newHeight) < parseInt(options.maxHeight)) || options.maxHeight == null) {
			if(options.animate.enabled) {
				$textarea.animate({ 
					height: newHeight 
				}, {
					duration: options.animate.duration,
					complete: options.animate.complete,
					step:     options.animate.step,
					queue:    false
				});
			}
			else {
				$textarea.css('height', newHeight);
			}
			
			$textarea.css('overflow-y', 'hidden');
		}
		else {
			$textarea.css('overflow-y', 'scroll');
		}
	}
}

jQuery.fn.autoResize = function(options) { 
	var $this = jQuery(this),
		defaultOptions = {
			animate: {
				enabled:   false,
				duration:  100,
				complete:  null,
				step:      null
			},
			maxHeight:     null
		};
	
	options = (options == undefined) ? {} : options;
	options = jQuery.extend(true, defaultOptions, options);

	$this.change ( function() { autoSize($this, options); } ) 
		 .keydown( function() { autoSize($this, options); } ) 
		 .keyup  ( function() { autoSize($this, options); } )
		 .focus  ( function() { autoSize($this, options); } );

	// No animations on startup
	startupOptions = options;
	startupOptions.animate.enabled = false;
	autoSize($this, startupOptions);
};

jQuery('.msg-texarea').autoResize({
	maxHeight: '85px'
});
/*End Auto Resizing Textarea*/

/*For logo click*/
var LoginArea = jQuery('.msg-messenger.msg-messenger-active');
var hoverCard = jQuery('.msg-launcher-hovercard');
jQuery('.msg-launcher-button').click(function() {
	if(jQuery(hoverCard).hasClass("active")){
		jQuery(hoverCard).removeClass('active').fadeOut();
	}else{
		jQuery(hoverCard).addClass('active').fadeIn();
	}
});



jQuery('.loginfromlaunch').click(function(){
	jQuery('.msg-launcher.msg-launcher-enable').addClass("hide").fadeOut();
	jQuery('.msg-messenger.msg-messenger-active').removeClass("hide").fadeIn();
	jQuery('.msg-composer-container').removeClass("hide");
	jQuery('.msg-conversation-sheet').removeClass("msg-conversation-sheet-hide");
	jQuery('.login-page').show();
  jQuery('.msg-list-people-container').html('');
	jQuery('.msg-list-people-container').hide();
	jQuery('.msg-composer-container').hide();
	jQuery('.chat-page').hide();
	jQuery('.messages').html('');
	jQuery('.login-page').show();
	jQuery('.usernameInput').val('');
	jQuery('.passwordInput').val('');
	jQuery('.close-header-btn').removeClass('btnExit');
	jQuery('.close-header-btn').hide();
	jQuery('.msg-unread-counter-active').hide();
	jQuery('.msg-sheet-content-container').show();
	jQuery('.btnLogin').attr('disabled',false);
	jQuery('.menu-header-btn').removeClass('btnOnline');
	if(jQuery('.login-page').is(':visible')){
		jQuery('.msg-sheet-content').addClass("loginBtm-0");
	}
});


/*For Close Button*/
jQuery('.minimize-header-btn').click(function(){
	jQuery('.msg-conversation-sheet').addClass("msg-conversation-sheet-hide");
	jQuery('.msg-launcher.msg-launcher-enable').removeClass("hide").fadeIn();
	setTimeout(function(){
		jQuery('.msg-messenger.msg-messenger-active').addClass("hide");
		jQuery('.msg-composer-container').addClass("hide");
	},1000);
});