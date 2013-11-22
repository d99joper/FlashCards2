function SettingsViewModel() {
    
    var self = this;

    self.user = ko.observable(new User(null, null, null, null));

}

// Bind 
var element = $('#settings')[0];
var settingsView = new SettingsViewModel();
ko.applyBindings(settingsView, element);