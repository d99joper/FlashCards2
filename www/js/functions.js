// The viewport
var viewport = {
    width: $(window).width(),
    height: $(window).height()
};

// Regular expression for the editing card hashtag
var pCard = new RegExp("^#deck/[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/card/\[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$", ["i"]);
var pDeck = new RegExp("^#deck/[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$", ["i"]);
var pHome = new RegExp("^#home$", ["i"]);
var pStats = new RegExp("^#stats$", ["i"]);

var pictureSource;   // picture source
var destinationType; // sets the format of returned value

var dirRoot;  // Phone root directory
var dirImg; // Image directory for the phones

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


// ****** ApiGee ********
var client_creds = {
    orgName: 'd99joper',
    appName: 'flashcards'
}
//Initializes the ApiGee SDK. Also instantiates Apigee.MonitoringClient
var apiGeeClient = new Apigee.Client(client_creds);

$(document).ready(function () {
    console.log(viewport.width);
    console.log(viewport.height);
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

    $(window).bind('resize', function () {
//        console.log('width = ' + $('.page').width());
//        console.log('height = ' + $('.page').height());
    }).trigger('resize');

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
    $(".btn").click(function () { if (isPhonegap()) navigator.notification.vibrate(vibrationTime1); });
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

	pictureSource = navigator.camera.PictureSourceType;
	destinationType = navigator.camera.DestinationType;

	// Create a directory, if it doesn't exist
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onRequestFileSystemSuccess, null);
}

function onRequestFileSystemSuccess(fileSystem) {
    dirRoot = fileSystem.root;
    alert(pictureSource.PHOTOLIBRARY + "/FlashCards");
    dirRoot.getDirectory(pictureSource.PHOTOLIBRARY + "/FlashCards", { create: true, exclusive: false }, onGetDirectorySuccess, onGetDirectoryFail);
}

function onGetDirectorySuccess(dir) {
    dirImg = dir;
    alert("Created dir " + dir.name);
}

function onGetDirectoryFail(error) {
    alert("Error creating directory " + error.code);
} 

// Handle the menu button
function onMenuKeyDown() {
    navigator.notification.vibrate(vibrationTime1);
	alert("show menu");
}

// Handle the menu button
function onBackKeyDown() {
    navigator.notification.vibrate(vibrationTime1);
    if (pCard.test(window.location.hash)) {
        editCardView.done();
    } else if (pDeck.test(window.location.hash) || pStats.test(window.location.hash)) {
        location.hash = "home";
     } else if (pHome.test(window.location.hash)) {
         navigator.app.exitApp();
     }
    else {
        history.go(-1);
        //navigator.app.backHistory();
    }
}


var Base64Binary = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    /* will return a  Uint8Array type */
    decodeArrayBuffer: function (input) {
        var bytes = (input.length / 4) * 3;
        var ab = new ArrayBuffer(bytes);
        this.decode(input, ab);

        return ab;
    },

    decode: function (input, arrayBuffer) {
        //get last chars to see if are valid
        var lkey1 = this._keyStr.indexOf(input.charAt(input.length - 1));
        var lkey2 = this._keyStr.indexOf(input.charAt(input.length - 2));

        var bytes = (input.length / 4) * 3;
        if (lkey1 == 64) bytes--; //padding chars, so skip
        if (lkey2 == 64) bytes--; //padding chars, so skip

        var uarray;
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        var j = 0;

        if (arrayBuffer)
            uarray = new Uint8Array(arrayBuffer);
        else
            uarray = new Uint8Array(bytes);

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        for (i = 0; i < bytes; i += 3) {
            //get the 3 octects in 4 ascii chars
            enc1 = this._keyStr.indexOf(input.charAt(j++));
            enc2 = this._keyStr.indexOf(input.charAt(j++));
            enc3 = this._keyStr.indexOf(input.charAt(j++));
            enc4 = this._keyStr.indexOf(input.charAt(j++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            uarray[i] = chr1;
            if (enc3 != 64) uarray[i + 1] = chr2;
            if (enc4 != 64) uarray[i + 2] = chr3;
        }

        return uarray;
    }
}



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