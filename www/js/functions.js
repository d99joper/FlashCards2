// Regular expression for the editing card hashtag
var pEditCard = new RegExp("^#deck/\\d+/card/\\d+$", ["i"]);

// Vibration times
var vibrationTime1 = 5;

$.fn.toggleClick = function (e) {
    var functions = arguments, iteration = 0
    return this.click(function (e) {
        functions[iteration].apply(this, arguments)
        iteration = (iteration + 1) % functions.length
    })
}

    
function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
};

function GenerateGuid() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
}

function isPhonegap() {
    return /^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad|android|BlackBerry|IEMobile/i.test(navigator.userAgent);
    //return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/);
}

$(document).ready(function () {

    $("#ddlAnswerType").change(function () {
        if ($("#ddlAnswerType").val() == 1) {
            $("#divAnswerText").show();
            $("#divAnswerMultiple").hide();
            $("#divAnswerTrueFalse").hide();
        }
        else if ($("#ddlAnswerType").val() == 2) {
            $("#divAnswerText").hide();
            $("#divAnswerMultiple").show();
            $("#divAnswerTrueFalse").hide();
        }
        else if ($("#ddlAnswerType").val() == 3) {
            $("#divAnswerText").hide();
            $("#divAnswerMultiple").hide();
            $("#divAnswerTrueFalse").show();
        }
    });

    // Menu functions
    $('#menu').click(
        function (e) {
            $('#menu').collapse('hide');
            //$('#menu').show("slide");
        });
    $('.menu-trigger').click(
        function (e) {
            e.preventDefault();
        });

    // Generate a new guid when clicking new deck
    $(".menu-deck-new").click(function () {
        $(this).attr("href", "#deck/" + GenerateGuid());
    });

    // vibrate when a button is pressed 
    $(".btn").click(function () { if(isPhonegap()) navigator.notification.vibrate(vibrationTime1); });
    $("a").click(function () { if (isPhonegap()) navigator.notification.vibrate(vibrationTime1); });

    // Initiate the PhoneGap onDeviceReady event
    if (isPhonegap())
        document.addEventListener("deviceready", onDeviceReady, false);
    else
        console.log("this is the browser"); 


});

// PhoneGap is loaded and it is now safe to make calls PhoneGap methods
function onDeviceReady() {
	// Register the event listener
	document.addEventListener("menubutton", onMenuKeyDown, false);
	document.addEventListener("backbutton", onBackKeyDown, false);
}

// Handle the menu button
function onMenuKeyDown() {
    navigator.notification.vibrate(vibrationTime1);
	alert("hello");
}

// Handle the menu button
function onBackKeyDown() {
    alert(window.location.hash);
    if (pEditCard.test(window.location.hash)) {

        var validation = ValidateCard();
        console.log(editCardView.card());
        if (validation.valid != true) {
            if (confirm("The card is not completed. Going back to the deck will delete the card. Are you sure you want to delete the card?" + validation[0].message)) {
                // delete the card
                DeleteCard(editCardView.card());
            }
            else event.preventDefault();
        }
    }
    else {
        navigator.notification.vibrate(vibrationTime1);
        history.go(-1);
        navigator.app.backHistory();
    }
}
//function hexToBase64(str) {
//    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
//}

//$("#imgUpload").change(function () {

//    var file = this.files[0];
//    name = file.name;
//    size = file.size;
//    type = file.type;
//    alert(file.fullPath);

//    if (file.name.length < 1)
//        alert("No file name specified.");
//    
//    else if (file.size > 300000) 
//        alert("File is to big");
//    
//    else if (file.type != 'image/png' && file.type != 'image/jpg' && !file.type != 'image/gif' && file.type != 'image/jpeg') 
//        alert("File doesnt match png, jpg or gif");
//    
//    else {
//        var reader = new FileReader();
//        reader.readAsDataURL(file, 'UTF-8');
//        reader.onloadend = function (evt) {
//            $("#imgDisplay").attr({ "src": evt.target.result, "width": "250px" });
//        }
//    }
//});





        //console.log("test: " + $("#home-tpl").html());
        //var template = Handlebars.compile($("#home-tpl").html());
        //$("#mypanel").trigger("updatelayout");
        //	    console.log("after");
        //	    var guid = localStorage.getItem("guid2");
        //	    console.log(guid);
        //	    if (guid === null) {
        //	        localStorage.setItem("guid2", GenerateGuid());
        //	    }
        //	    guid = localStorage.getItem("guid2");
        //	    console.log(guid);

        //getBooks();

        //// Get all books
        //function getBooks() {
        //	$("#books").empty();
        //	$.get("http://api.usergrid.com/d99joper/sandbox/books?limit=100", function(data) {
        //		//console.log(data.entities);
        //		$.each(data.entities, function(index, book) {	
        //			//console.log(book.title);
        //				$("#books").append("<li data-theme='c'><h3>"+ book.title +"</h3><p>"+ book.author +"</p></li>");
        //			});
        //		$("#books").listview("refresh");
        //	}, "json");
        //}

        //// Create a new book
        //$("#postBook").click(function() {
        //	//$.post("http://api.usergrid.com/d99joper/sandbox/books", 
        //	//	{"title": $("#title").val(), "author": $("#author").val()},
        //	//	function(data) {
        //	//		console.log(data);
        //	//		$("#books").append("<li data-theme='c'><h3>"+ data.book.title +"</h3><p>"+ book.author +"</p></li>");
        //	//	},
        //	//	"json");
        //	$.ajax({
        //		type: "POST",
        //		url: "http://api.usergrid.com/d99joper/sandbox/books/",
        //		data: JSON.stringify({"title": $("#title").val(), "author": $("#author").val()}),
        //		contentType: "application/json; charset=utf-8",
        //		dataType: "json",
        //		success: function (msg) {
        //			getBooks();
        //			history.back();
        //		},
        //		error: function (errormessage) {
        //			console.log(errormessage);
        //		}
        //	});			
        //});

        // *** Geolocation
        //navigator.geolocation.getCurrentPosition(whereAmI);

        //function whereAmI(position) {
        //	alert("hello");
        //	alert(position.coords.latitude);
        //}