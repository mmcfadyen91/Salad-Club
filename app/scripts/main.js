// @author Matt McFadyen
'use strict';

$(function (){


	//client side array of inputted data / already brought items
	var arr = [];

	//Get DB from Firebase
	var myDataRef = new Firebase('https://boiling-fire-202.firebaseio.com/');
	
	//for popup reminding user to login-
	var loggedIn = false;

	//authentication through github login
	var auth = new FirebaseSimpleLogin(myDataRef, function(error, user) {
		if (error) {
			// error occurred while attempting login
			console.log(error);
			logInError(error);
		//	alert('Error while attempting to login');
		} else if (user) {
			//user authenticated with Firebase
			if (!loggedIn){
				logInSuccess(user.displayName);
			}
			loggedIn = true;
		} else {
			//user is logged out
		}
	});

	//initiate login through github
	auth.login('github', {
  		rememberMe: true,
  		scope: 'user,gist'
	});	

	//pull in data
	myDataRef.on('child_added', function(snapshot) {
		var newItem = snapshot.val();
		//input entry in client side array
		arr.push({
			name: newItem.person,
			item: newItem.item
		});
		//append each item to the list
		$('ul').append('<li>' +'<span class=\"name\">'+ newItem.person+ '</span> : ' + newItem.item + '</li>');
	});



	//Clicking "Add!" button to add Name and Item
	$('form button').on('click', function(e) {
		
		//ensure user is logged in
		if(loggedIn === false){
			console.log("error: cannot push to db not logged in");
			loggedInPopup();
		}
		else {
			e.preventDefault();
			//if both inputs not empty
			if($('input.name').val() !== '' && $('input.item').val() !== '') {
				
				//get input values
				var name = $('input.name').val();
				var item = $('input.item').val();
				var alreadyBrought = false;
				//iterate through array of brought items
				for(var i = 0; i < arr.length; i++) {
					//test if item already is being brought
					if(arr[i].item.toLowerCase() === item.toLowerCase()){
						//Someone is already bringing the item! 
						itemOverlap(arr[i].name,arr[i].item);
						alreadyBrought = true;
					} 
				}

				if (alreadyBrought !== true){
					//push to db
					myDataRef.push({person: name, item: item});
					//push to local array
					arr.push({
						name: name,
						item: item
					});
					//clear input field
					$('input').val('');
				}//someone is bringing that item
				else { 
					//clear item input, suggesting they bring something else
					$('input.item').val('');
				}
			}//if name and input fields not empty
		}//else logged in
	});//form submit
	
	//ERROR NOT LOGGED IN!
	function loggedInPopup() {		
		//pop up
		$("#dialog-box-error").dialog({
		    modal: false,
		    draggable: true,
		    resizable: false,
		    position: ['center', 'center'],
		    width: 400,
		    dialogClass: 'ui-dialog-osx',
		    buttons: {
		        "I've read and understand this": function() {
		            $(this).dialog("close");
		        }
		    }
		});//dialog
		//append html to dialog
		$("#dialog-box-error-text").html("<h3>Not logged in through Github!</h3><p>You need to login through the Github popup to input data. </p><p>Make sure to disable Adblockers if you cannot see it.</p>");
	}//loggedInPoppp

	//Confirmation that you logged in successfully.
	function logInSuccess(name) {
		//popup
		$("#dialog-box-success").dialog({
		    modal: false,
		    draggable: true,
		    resizable: false,
		    position: ['center', 'center'],
		    width: 400,
		    dialogClass: 'ui-dialog-osx',
		    buttons: {
		        "Okay!": function() {
		            $(this).dialog("close");
		        }
		    }
		});//dialog
		//append html to dialog
		$("#dialog-box-success-text").html("<h3>Welcome: " + name + "!</h3><p>Please input your Name and what Item you're bringing to HackerYou's Salad Club.</p>");
	}

	//log in unsuccessful
	function logInError(error) {
		//pop up
		$("#dialog-box-loginError").dialog({
		 	modal: false,
		    draggable: true,
		    resizable: false,
		    position: ['center', 'center'],
		    width: 400,
		    dialogClass: 'ui-dialog-osx',
		    buttons: {
		        "Okay!": function() {
		            $(this).dialog("close");
		        }
		    }
		});//dialog
		//append html to dialog
		$("#dialog-box-loginError-text").html("<h3>An error occurred while logging in</h3><p>"+error+ "</p><p>Please login through the Github pop up. Disable Adblockers if you cannot see it");
	}

	//already brought same item
	function itemOverlap(name, item) {
		//append html to dialog
		$("#dialog-box-overlapItem-text").html("<h3>How original...</h3><p>" + name + " is already bringing " + item + "<p><p>Why don't you bring something else?</p>");
		//popup
		$("#dialog-box-overlapItem").dialog({
		 	modal: false,
		    draggable: true,
		    resizable: false,
		    position: ['center', 'center'],
		    width: 400,
		    dialogClass: 'ui-dialog-osx',
		    buttons: {
		        "Okay fine!": function() {
		            $(this).dialog("close");
		        }
		    }
		});//dialog
		
	}

});//
