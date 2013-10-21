function StatsViewModel(decks, quizzes) {
    var self = this;

    self.quizzes = ko.observableArray(quizzes);

}

// Bind 
var element = $('#stats')[0];
var statsView = new StatsViewModel(null, null);
ko.applyBindings(statsView, element);