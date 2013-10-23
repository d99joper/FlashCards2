function HomeViewModel(decks, quizzes) {
    var self = this;

    self.decks = ko.observableArray(decks);
    self.filter = ko.observable("");
    self.filteredDecks = ko.observableArray();

    self.decks.subscribe(function (newValue) { self.filteredDecks(self.decks()); });
    self.filter.subscribe(function (newValue) {
        self.filteredDecks(filterArrayByProperty(self.decks, "name", newValue, "contains"));

    });

    self.deleteDeck = function (deck) {
        if (confirm("Are you sure you want to remove the deck?\n" + deck.name())) {
            self.decks.remove(deck);
            DeleteDeck(deck.id);
        }
    };
}

// Bind 
var element = $('#home')[0];
var homeView = new HomeViewModel(null, null);
ko.applyBindings(homeView, element);

