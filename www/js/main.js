// ****** ApiGee ********
var dataClient;
var userToken = null;
var client_creds = {
    orgName: 'd99joper',
    appName: 'flashcards',
    ttl: '604800'
}
var retry = false;

// ****** User object ******
var user = null;

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

$(document).ready(function () {

    // Facebook init
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/all.js', function () {
        FB.init({
            appId: '493515217435430',
            status: true,
            xfbml: true
        });
    });

    //Initializes the ApiGee SDK. Also instantiates Apigee.MonitoringClient
    dataClient = new Apigee.Client(client_creds);
    console.log(dataClient);
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
    $(".btn").click(function () { if (IsPhonegap()) navigator.notification.vibrate(vibrationTime1); });
    $("a").click(function () { if (IsPhonegap()) navigator.notification.vibrate(vibrationTime1); });

    // Initiate the PhoneGap onDeviceReady event
    if (IsPhonegap())
        document.addEventListener("deviceready", onDeviceReady, false);

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
    dirRoot.getDirectory("FlashCards/images", { create: true, exclusive: false }, onGetDirectorySuccess, onGetDirectoryFail);
}

function onGetDirectorySuccess(dir) {
    dirImg = dir;
    console.log("Created dir " + dir.name);
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


//var Base64Binary = {
//    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

//    /* will return a  Uint8Array type */
//    decodeArrayBuffer: function (input) {
//        var bytes = (input.length / 4) * 3;
//        var ab = new ArrayBuffer(bytes);
//        this.decode(input, ab);

//        return ab;
//    },

//    decode: function (input, arrayBuffer) {
//        //get last chars to see if are valid
//        var lkey1 = this._keyStr.indexOf(input.charAt(input.length - 1));
//        var lkey2 = this._keyStr.indexOf(input.charAt(input.length - 2));

//        var bytes = (input.length / 4) * 3;
//        if (lkey1 == 64) bytes--; //padding chars, so skip
//        if (lkey2 == 64) bytes--; //padding chars, so skip

//        var uarray;
//        var chr1, chr2, chr3;
//        var enc1, enc2, enc3, enc4;
//        var i = 0;
//        var j = 0;

//        if (arrayBuffer)
//            uarray = new Uint8Array(arrayBuffer);
//        else
//            uarray = new Uint8Array(bytes);

//        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

//        for (i = 0; i < bytes; i += 3) {
//            //get the 3 octects in 4 ascii chars
//            enc1 = this._keyStr.indexOf(input.charAt(j++));
//            enc2 = this._keyStr.indexOf(input.charAt(j++));
//            enc3 = this._keyStr.indexOf(input.charAt(j++));
//            enc4 = this._keyStr.indexOf(input.charAt(j++));

//            chr1 = (enc1 << 2) | (enc2 >> 4);
//            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
//            chr3 = ((enc3 & 3) << 6) | enc4;

//            uarray[i] = chr1;
//            if (enc3 != 64) uarray[i + 1] = chr2;
//            if (enc4 != 64) uarray[i + 2] = chr3;
//        }

//        return uarray;
//    }
//}



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







/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
*/

//var deviceInfo = function() {
//    document.getElementById("platform").innerHTML = device.platform;
//    document.getElementById("version").innerHTML = device.version;
//    document.getElementById("uuid").innerHTML = device.uuid;
//    document.getElementById("name").innerHTML = device.name;
//    document.getElementById("width").innerHTML = screen.width;
//    document.getElementById("height").innerHTML = screen.height;
//    document.getElementById("colorDepth").innerHTML = screen.colorDepth;
//};

//var getLocation = function() {
//    var suc = function(p) {
//        alert(p.coords.latitude + " " + p.coords.longitude);
//    };
//    var locFail = function() {
//    };
//    navigator.geolocation.getCurrentPosition(suc, locFail);
//};

//var beep = function() {
//    navigator.notification.beep(2);
//};

//var vibrate = function() {
//    navigator.notification.vibrate(0);
//};

//function roundNumber(num) {
//    var dec = 3;
//    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
//    return result;
//}

//var accelerationWatch = null;

//function updateAcceleration(a) {
//    document.getElementById('x').innerHTML = roundNumber(a.x);
//    document.getElementById('y').innerHTML = roundNumber(a.y);
//    document.getElementById('z').innerHTML = roundNumber(a.z);
//}

//var toggleAccel = function() {
//    if (accelerationWatch !== null) {
//        navigator.accelerometer.clearWatch(accelerationWatch);
//        updateAcceleration({
//            x : "",
//            y : "",
//            z : ""
//        });
//        accelerationWatch = null;
//    } else {
//        var options = {};
//        options.frequency = 1000;
//        accelerationWatch = navigator.accelerometer.watchAcceleration(
//                updateAcceleration, function(ex) {
//                    alert("accel fail (" + ex.name + ": " + ex.message + ")");
//                }, options);
//    }
//};

//var preventBehavior = function(e) {
//    e.preventDefault();
//};

//function dump_pic(data) {
//    var viewport = document.getElementById('viewport');
//    console.log(data);
//    viewport.style.display = "";
//    viewport.style.position = "absolute";
//    viewport.style.top = "10px";
//    viewport.style.left = "10px";
//    document.getElementById("test_img").src = data;
//}

//function fail(msg) {
//    alert(msg);
//}

//function show_pic() {
//    navigator.camera.getPicture(dump_pic, fail, {
//        quality : 50
//    });
//}

//function close() {
//    var viewport = document.getElementById('viewport');
//    viewport.style.position = "relative";
//    viewport.style.display = "none";
//}

//function contacts_success(contacts) {
//    alert(contacts.length
//            + ' contacts returned.'
//            + (contacts[2] && contacts[2].name ? (' Third contact is ' + contacts[2].name.formatted)
//                    : ''));
//}

//function get_contacts() {
//    var obj = new ContactFindOptions();
//    obj.filter = "";
//    obj.multiple = true;
//    navigator.contacts.find(
//            [ "displayName", "name" ], contacts_success,
//            fail, obj);
//}

//function check_network() {
//    var networkState = navigator.network.connection.type;

//    var states = {};
//    states[Connection.UNKNOWN]  = 'Unknown connection';
//    states[Connection.ETHERNET] = 'Ethernet connection';
//    states[Connection.WIFI]     = 'WiFi connection';
//    states[Connection.CELL_2G]  = 'Cell 2G connection';
//    states[Connection.CELL_3G]  = 'Cell 3G connection';
//    states[Connection.CELL_4G]  = 'Cell 4G connection';
//    states[Connection.NONE]     = 'No network connection';

//    confirm('Connection type:\n ' + states[networkState]);
//}

//var watchID = null;

//function updateHeading(h) {
//    document.getElementById('h').innerHTML = h.magneticHeading;
//}

//function toggleCompass() {
//    if (watchID !== null) {
//        navigator.compass.clearWatch(watchID);
//        watchID = null;
//        updateHeading({ magneticHeading : "Off"});
//    } else {        
//        var options = { frequency: 1000 };
//        watchID = navigator.compass.watchHeading(updateHeading, function(e) {
//            alert('Compass Error: ' + e.code);
//        }, options);
//    }
//}

//function init() {
//    // the next line makes it impossible to see Contacts on the HTC Evo since it
//    // doesn't have a scroll button
//    // document.addEventListener("touchmove", preventBehavior, false);
//    document.addEventListener("deviceready", deviceInfo, true);
//}

// Prevent the backspace key from navigating back.
//$(document).unbind('keydown').bind('keydown', function (event) {
//    var doValidationCheck = false;
//    if (event.keyCode === 8) {
//        var d = event.srcElement || event.target;
//        if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE'))
//             || d.tagName.toUpperCase() === 'TEXTAREA') {
//            doValidationCheck = d.readOnly || d.disabled;
//        }
//        else {
//            doValidationCheck = true;
//        }
//    }

//    if (doValidationCheck) {
//        // check if we are editing a new card
//        if (pEditCard.test(window.location.hash)) {

//            var validation = ValidateCard();
//            console.log(editCardView.card());
//            if (validation.valid != true) {
//                if (confirm("The card is not completed. Going back to the deck will delete the card. Are you sure you want to delete the card?" + validation[0].message)) {
//                    // delete the card
//                    DeleteCard(editCardView.card());
//                }
//                else event.preventDefault();
//            }
//        }
//    }
//});


//var a = document.getElementById('menu-deck-new');
//console.log(a);
//a.setAttribute("href", "#deck/" + GenerateGuid());
////    a.href = "#deck/" + GenerateGuid();
//console.log(a.href);


//var jPM = $.jPanelMenu({
//    menu: '#menu'
//    , trigger: '.menu-trigger'
//    , duration: 300
//    , closeOnContentClick: true
//    , close: '.menu-close'
//});

//jPM.on();

