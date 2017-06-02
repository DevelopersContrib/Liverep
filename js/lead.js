$(function(){
	$('#leadform, #leadform2').submit(function(){
		//submitLead();
		return false;
	});
	
	$('#submitLead').click(function(){
		submitLead();
	});
	$('#submitLead2').click(function(){
		submitLead2();
	});
	
	$('#_about').click(function(){
		$('#l_contactus').hide();
		$('#l_partner').hide();
		$('#l_apply').hide();
		$('#r_apply').hide();
		
		$('#non_terms').show();
		$('#f_terms').hide();
		$('#f_privacy').hide();
		
		$('#l_about').show('slow');
		$('#r_about').show();
		$('#_title').html('About');
	});
	$('#_contactus').click(function(){
		$('#l_about').hide();
		$('#l_partner').hide();
		$('#l_apply').hide();
		$('#r_apply').hide();
		
		$('#non_terms').show();
		$('#f_terms').hide();
		$('#f_privacy').hide();
		
		$('#l_contactus').show('slow');
		$('#r_about').show();
		$('#_title').html('Contact');
	});
	$('#_partner').click(function(){
		$('#l_about').hide();
		$('#l_contactus').hide();
		$('#l_contactus').hide();
		$('#l_apply').hide();
		$('#r_apply').hide();
		
		$('#non_terms').show();
		$('#f_terms').hide();
		$('#f_privacy').hide();
		
		$('#l_partner').show('slow');
		$('#r_about').show();
		$('#_title').html('Partner with');
	});
	$('#_apply').click(function(){
		$('#l_about').hide();
		$('#r_about').hide();
		$('#l_contactus').hide();
		$('#l_partner').hide();
		
		$('#non_terms').show();
		$('#f_terms').hide();
		$('#f_privacy').hide();
		
		$('#l_apply').show('slow');
		$('#r_apply').show();
		$('#_title').html('Staffing for');
	});

});


function base64_encode(data) {
	  //  discuss at: http://phpjs.org/functions/base64_encode/
	  // original by: Tyler Akins (http://rumkin.com)
	  // improved by: Bayron Guevara
	  // improved by: Thunder.m
	  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // improved by: Rafał Kukawski (http://kukawski.pl)
	  // bugfixed by: Pellentesque Malesuada
	  //   example 1: base64_encode('Kevin van Zonneveld');
	  //   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
	  //   example 2: base64_encode('a');
	  //   returns 2: 'YQ=='

	  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	    ac = 0,
	    enc = '',
	    tmp_arr = [];

	  if (!data) {
	    return data;
	  }

	  do { // pack three octets into four hexets
	    o1 = data.charCodeAt(i++);
	    o2 = data.charCodeAt(i++);
	    o3 = data.charCodeAt(i++);

	    bits = o1 << 16 | o2 << 8 | o3;

	    h1 = bits >> 18 & 0x3f;
	    h2 = bits >> 12 & 0x3f;
	    h3 = bits >> 6 & 0x3f;
	    h4 = bits & 0x3f;

	    // use hexets to index into b64, and append result to encoded string
	    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	  } while (i < data.length);

	  enc = tmp_arr.join('');

	  var r = data.length % 3;

	  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
	}

function submitLead(){	 
	var secret = $('#secret').val();
	var email = $('#email').val();
	var user_ip = $('#user_ip').val();
	var indexof = email.indexOf("@");
	var name = email.slice(0,indexof);
	var domain = $('#domain').val();
	var encode = "";
	$('#warning').remove();
			
	if(email==''){
		$('#leadcontent').append('<div class="span12 text-center" id="warning" style="color:orange;">* Email is required *</div>');
		$('#email').focus();
		return false;
	}else if(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(email)==false){
		$('#leadcontent').append('<div class="span12 text-center" id="warning" style="color:orange;">* Please enter a valid email address *</div>');
		$('#email').focus();
		return false;
	}else if(secret != '' && secret != 'undefined' && secret != null){
		console.log('naa spam uie');
			window.location.href = '/success/index/';

	}else{	
		
		encode =  base64_encode(email);
		$("#leadform").hide();	
		$('#leadcontent').append('<div class="span12" style="text-align:center;margin:20px 0 35px 0;color:white;min-height:20px;font-size:18px;" id="loading">Processing . . . Please wait . . .<br>You are now going to be redirected to another page. If you havent, please click this <a href="/success/index/'+encode+'">link</a>.</div>');
				
		$.post("http://www.api.contrib.com/forms/saveleads",{   domain:domain,email:email,user_ip:user_ip},function(res){
				console.log(res);													
				// SALESFORCE LEAD
				$.post("http://www.manage.vnoc.com/salesforce/addlead",
				{
					 'firstName':name,
					 'lastName':name,
					 'title':'',
					 'email':email,
					 'phone':'',
					 'street':'',
					 'city':'',
					 'country':'',
					 'state':'',
					 'zip':'',
					 'domain':domain,
					 'form_type':'Contrib Lead Version 2'
					 
				},function(data2){
					console.log(data2);
					//$("#loading").hide();
					if(res.success=='false'){
						$('#leadcontent').append('<div class=" text-center" id="response" style="background: none repeat scroll 0% 0% rgb(255, 255, 255); border-radius: 10px; padding: 15px 0px;">Something went wrong. Sorry for the inconvenience.</div>');
					}else if(res.success=='success'){
						window.location.href = '/success/index/';
					}else{
						window.location.href = '/success/exists';
					}
				});
		});	

		/*
					
			//VNOC CAMPAIGN RESPONSE
			 $.post("http://manage.vnoc.com/campaignresponse/addContact",
			  { domain:domain,
				contact_name:name,
				contact_email:email
			  }
			  ,function(data){ console.log(data) });
				
			//VNOC LEADS
			$.post("http://manage.vnoc.com/subscribersubmit/add",
				{
					type:'LEADS',
					domain:domain,
					name: name,
					email: email
				}
				,function(data){}
			);
			*/			
			return false;
	}		
	return false;

}

function submitLead2(){	 
	var email = $('#email2').val();
	var user_ip = $('#user_ip').val();
	var indexof = email.indexOf("@");
	var name = email.slice(0,indexof);
	var domain = $('#domain').val();
	var encode = "";
	$('#warning2').remove();
			
	if(email==''){
		$('#leadcontent2').append('<div class="span12 text-center" id="warning2" style="color:orange;">* Email is required *</div>');
		$('#email2').focus();
		return false;
	}else if(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(email)==false){
		$('#leadcontent2').append('<div class="span12 text-center" id="warning2" style="color:orange;">* Please enter a valid email address *</div>');
		$('#email2').focus();
		return false;
	}else{	
		
		encode =  base64_encode(email);
		
		$("#leadform2").hide();	
		$('#leadcontent2').append('<div class="span12" style="text-align:center;margin:20px 0 35px 0;color:black;min-height:20px;font-size:18px;" id="loading2">Processing . . . Please wait . . .<br>You are now going to be redirected to another page. If you havent, please click this <a href="/success/index/'+encode+'">link</a>.</div>');
		
				
			$.post("http://www.api.contrib.com/forms/saveleads",{   domain:domain,email:email,user_ip:user_ip},function(res){
				console.log(res);													
					
					// SALESFORCE LEAD
					$.post("http://www.manage.vnoc.com/salesforce/addlead",
					{
						 'firstName':name,
						 'lastName':name,
						 'title':'',
						 'email':email,
						 'phone':'',
						 'street':'',
						 'city':'',
						 'country':'',
						 'state':'',
						 'zip':'',
						 'domain':domain,
						 'form_type':'Contrib Lead Version 2'
						 
					},function(data2){
						console.log(data2);
						
						//$("#loading2").hide();
						if(res.success=='false'){
							$('#leadcontent2').append('<div class=" text-center" id="response2" style="background: none repeat scroll 0% 0% rgb(255, 255, 255); border-radius: 10px; padding: 15px 0px;">Something went wrong. Sorry for the inconvenience.</div>');
						}else if(res.success=='success'){
							window.location.href = '/success/index/'+res.code;
						}else{
							window.location.href = '/success/exists';
						}
					});
					
			});			
			return false;
	}		
	return false;

}