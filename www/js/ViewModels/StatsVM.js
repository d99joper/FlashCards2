function StatsViewModel(decks, quizzes) {
    var self = this;

    self.quizzes = ko.observableArray(quizzes);

    //self.statsArray = []

    self.stats = ko.computed(function () {
        var oStats = { cardCount: 0, correctCount: 0, percentage: 0 };
        for (i = 0; i < self.quizzes().length; i++) {
            oStats.cardCount += self.quizzes()[i].numberOfCards;
            oStats.correctCount += self.quizzes()[i].correctAnswers;
        }
        oStats.percentage = (100 * oStats.correctCount/oStats.cardCount).toFixed(0);
        return oStats;
    });
}

// Bind 
var element = $('#stats')[0];
var statsView = new StatsViewModel(null, null);
ko.applyBindings(statsView, element);