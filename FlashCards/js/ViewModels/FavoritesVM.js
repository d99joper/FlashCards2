function FavoritesViewModel(decks) {
    var self = this;

    self.decks = ko.observableArray(decks);
    self.filter = ko.observable("");
    self.filteredDecks = ko.observableArray();

    self.decks.subscribe(function (newValue) { self.filteredDecks(self.decks()); });
    self.filter.subscribe(function (newValue) {
        console.log(newValue);
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
var element = $('#favorites')[0];
var favView = new FavoritesViewModel(null);
ko.applyBindings(favView, element);


