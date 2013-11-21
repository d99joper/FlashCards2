function User() {

}

function GetUser(email, name, password, callback) {
    var user = {
        name: name
        , password: password
        , email: email 
    };
    callback(user);
}