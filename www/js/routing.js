// Client-side routes    
(function ($) {

    var app = $.sammy('#content', function () {

        this.get('#/', function (context) {
            context.redirect('#home');
        });
        this.get('#home', function (context) {
            GetAllDecks(function (decks) {
                homeView.decks(decks);
            });
            showPage("home", " My Decks");
        });

        this.get('#favorites', function (context) {
            GetAllDecks(function (decks) {
                favView.decks(decks);
            });
            showPage("favorites", " Favorites");
        });

        this.get('#search', function (context) {
            showPage("search", " Find New Decks");
        });

        this.get('#deck/:id', function (context) {

            var self = this;
            var subHeader = ": Edit Deck";
            var deckId = this.params.id;

            GetDeck(deckId, function (deck) {
                subHeader = ": " + deck.name();
                deckView.deck(deck);
                showPage("createDeck", subHeader);
            });

        });

        this.get('#deck/:deckid/card/:cardid', function (context) {

            var deckId = this.params.deckid;
            var cardId = this.params.cardid;

            GetCard(cardId, deckId, function (card, deckName) {
                editCardView.card().id(cardId);
                subHeader = ": " + deckName + " : Card ";
                editCardView.card(card);
                showPage("createCard", subHeader);
            });
        });

        this.get('#stats', function (context) {
            GetLatestQuizzes(function (quizzes) {
                statsView.quizzes(quizzes);
            });
            showPage("stats", " Statistics");
        });

        this.get('#settings', function (context) {
            showPage("settings", " Settings");
        });

        this.get('#quiz/:quizid/deck/:deckid', function (context) {

            var deckId = this.params.deckid;
            var quizId = this.params.quizid;

            GetDeck(deckId, function (deck) {
                console.log(deckId);
                // Create a new quiz
                CreateNewQuiz(quizId, deckId);

                // Set the quizView data
                quizView.deck(deck);
                quizView.quizId = quizId;
                quizView.selectedCard(GetRandomQuizCard());

                // Set the header and show page
                subHeader = ": Quiz for " + deck.name();
                showPage("quiz", subHeader);
            });

        });

    });

    $(function () {
        app.run('#/');
    });

})(jQuery);

function showPage(pageID, subHeader) {
    // Hide all pages
    $(".page").hide();

    // Show the given page
    $("#" + pageID).show();

    // change the sub header
    $("#subHeader").text(subHeader);
    
    // Close the menu
    //jPM.close();
}
