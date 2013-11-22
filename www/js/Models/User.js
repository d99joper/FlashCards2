function User(name, email, password) {
    var self = this;

    self.name = name;
    self.email = email;
    self.password = password;
}

function GetUser(name, email, password, callback) {
    var user = new User(name, email, password);
    console.log(user);
    callback(user);
}