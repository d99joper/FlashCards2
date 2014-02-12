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

function IsPhonegap() {
    return /^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad|android|BlackBerry|IEMobile/i.test(navigator.userAgent);
}

function resetLoginFrom() {
    $("#txtName").val("");
    $("#txtEmail").val("");
    $("#txtPassword").val("");
    $("#txtPasswordConfirm").val("");
    $("#btnCreateUser").prop("disabled", true);
}

$(".showLogin").click(function (e) {
    $('#userLoginmodal').modal('show');
    $("#divCreateUser").show();
    $("#btnCreateUser").show();
    resetLoginFrom();
    if (e.target.id == "btnLogin") {
        $(".showPasswordConfirm").hide();
        $("#btnCreateUser").text("Login");
    } else {
        $(".showPasswordConfirm").show();
        $("#btnCreateUser").text("Create User");
    }
});
$("#aCreateAccount").click(function (e) {
    $('#userLoginmodal').modal('show');
    e.preventDefault();
});

$("#btnCreateUser").click(function () {
    // Create a user object using the data from the textboxes 
    GetUser($("#txtName").val(), $("#txtEmail").val(), $("#txtEmail").val(), $("#txtPassword").val(), function (user) {
        if ($("#btnCreateUser").text() == "Login")
            Login(user);
        else
            CreateUser(user.email, user.name, user.email, user.password, null, null);
    });
});

$("#btnFacebookLogin").click(function () {
    alert(FB);
    FB.getLoginStatus(updateStatusCallback);
});

function updateStatusCallback(response) {
    console.log(response);
    if (response.status === 'connected') {
        // the user is logged in and has authenticated your app, and response.authResponse supplies the user's ID, 
        // a valid access token, a signed request, and the time the access token  and signed request each expire
        var uid = response.authResponse.userID;
        var accessToken = response.authResponse.accessToken;
        // check the names of the app, and update the access token (lock down the app to only work with one ID/Name)
        // If the ID doesn't correspond, alert the user.
        facebookUserExists(uid, function (isTrue) {
            FB.api(
                '/' + uid + '?scope=email',
                function (r2) {
                    if (r2 && !r2.error) {
//                        console.log("connect with facebook user that exists: " + isTrue);
//                        console.log(r2);
//                        console.log(r2.email);
                        if (isTrue) {
                            user = new User(r2.name, r2.email, r2.id, 'facebook_user');
                            Login(user);
                        } else
                            CreateUser(r2.id, r2.name, r2.email, 'facebook_user', r2.id, null);
                    }
                },
                { access_token: accessToken }
            );
        });
        

    } else if (response.status === 'not_authorized') {
        // the user is logged in to Facebook, 
        // but has not authenticated your app
    } else {
        // the user isn't logged in to Facebook.
        // Show the 'you are not logged in to facebook
        FB.login(function (response) {
            if (response.authResponse) {
                FB.getLoginStatus(updateStatusCallback);
            } else { /*The person cancelled the login dialog */ }
        });
    }
}
