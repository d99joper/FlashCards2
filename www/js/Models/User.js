function User(name, email, username, password) {
    var self = this;

    self.name = name;
    self.email = email;
    self.password = password;
    self.username = username;
    self.accessToken;
}

function GetUser(name, email, username, password, callback) {
    user = new User(name, email, username, password);
    console.log("getuser");
    console.log(user);
    if(callback)
        callback(user);
    return user;
}

function CreateUser(username, name, email, password, facebookUID, googleUID) {

    // Set the user variable
    GetUser(name, email, username, password, null);

    // Define the options for the data client
    var options = { method: 'POST',
        endpoint: 'users',
        body: { username: username, name: name, email: email, password: password, facebookUID: facebookUID, googleUID: googleUID }
    };
    // post the user data to create a new user
    //dataClient.signup(username, password, email, name, function (error, response) {
    dataClient.request(options, function (error, response) {
        if (error) {
            console.log(response);
            var attempts = 0;
            // delete the old token
            localStorage.removeItem('apigee_token');
            dataClient = new Apigee.Client(client_creds);
            if (!retry) {
                CreateUser(username, name, email, password, facebookUID, googleUID);
                retry = true;
                // Get a new token, the old one might be expired
                //                dataClient.request({
                //                    method: 'POST',
                //                    endpoint: 'token',
                //                    body: { ttl: 604800 }
                //                }, function () {
                //                    //CreateUser(username, name, email, password, facebookUID, googleUID);
                //                });
            } else
                console.log("Something went wrong when trying to create the user. " + response.error)
            // Error
        } else {
            // Success - the user has been created, now login the user.
            Login(user);
        }
    });
    settingsView.user(user);
}

function Login(user) {
    console.log("login");
    console.log(user);
    dataClient.login(user.username, user.password,
        function (err) {
            if (err) {
                //error - could not log user in
                console.log("There was an error logging in " + user.name);
            } else {
                //success - user has been logged in
                // set the token, for future use
                console.log(dataClient);
                dataClient.getLoggedInUser(function (err, data, userAppigee) {
                    if (err) {
                        //error - could not get logged in user
                    } else {
                        if (dataClient.isLoggedIn()) {
                            console.log(data);
                            console.log(userAppigee);
                            userToken = dataClient.token;
                            user.accessToken = userToken;
                            console.log(userToken);
                            // Set the local storage variables, so that the user is stored on this device
                            localStorage["userName"] = userAppigee.get('name');
                            user.name = userAppigee.get('name');
                            localStorage["userEmail"] = userAppigee.get('username');

                            settingsView.user(user);
                        }
                    }
                });

                // hide the login modal
                $('#userLoginmodal').modal('hide');
                $('#divNoUser').hide();
                $("#divUserSettings").show();
            }
        }
    );
    
}

function facebookUserExists(uid, callback) {

    var isTrue = false;
    dataClient.login(uid, 'facebook_user', function (err) {
        if (!err)
            isTrue = true;

        callback(isTrue);

    });
    // Define the options for the data client
//    var options = { method: 'GET',
//        endpoint: 'users',
//        body: { username: uid }
//    };


//    dataClient.request(options, function (error, response) {
//        console.log("facebookUserExists");
//        console.log(error);
//        console.log(response);
//        if (error) isTrue = false;
//        else isTrue = true;
//        callback(isTrue);
//    });

}

$("#txtName, #txtEmail, #txtPassword, #txtPasswordConfirm").keyup(function () {

    if ($("#btnCreateUser").text() == "Login") {
        if ($("#txtEmail").val().length > 0 && $("#txtPassword").val().length > 4)
            $("#btnCreateUser").prop("disabled", false);
        else
            $("#btnCreateUser").prop("disabled", true);
    } 
    else if ($("#txtName").val().length > 0 && $("#txtEmail").val().length > 0 && $("#txtPassword").val().length > 4 && $("#txtPasswordConfirm").val().length > 4) {
        if($("#txtPassword").val() == $("#txtPasswordConfirm").val())
            $("#btnCreateUser").prop("disabled", false);
        else
            $("#btnCreateUser").prop("disabled", true);
    } else $("#btnCreateUser").prop("disabled", true);
});