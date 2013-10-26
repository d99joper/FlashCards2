function DeckViewModel(deck, cards) {
    var self = this;

    self.deck = ko.observable(deck);
    //self.deck.subscribe(function (newValue) { console.log(newValue); });
    //self.cards = ko.observableArray(cards);

    //self.goToCard = function (card) { location.hash = card.deckid + '/' + card.id() };
    self.goToCard = function () { location.hash = 'deck/' + self.deck().id + '/card/' + GenerateGuid(); };
    self.saveDeck = function () { self.deck().Save(); };
    self.deleteCard = function (card) {
        if (confirm("Are you sure you want to remove the card with the following question?\n" + card.question())) {
            self.deck().cards.remove(card);
            card.Delete();
        }
    };
    self.answerText = function (card) {
        switch (card.typeId()) {
            case 1: return card.singleAnswer().text;
            case 2: return "Multiple answers";
            case 3: return card.trueFalseAnswer().isCorrect() ? "True" : "False";
            default:
                return "";
        }
    }
}

// Bind 
var element = $('#createDeck')[0];
//ko.cleanNode(element);
var deckView = new DeckViewModel(new Deck(null, null, null), null);
ko.applyBindings(deckView, element);




