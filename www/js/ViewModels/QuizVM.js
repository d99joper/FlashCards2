function QuizViewModel(deck) {
    var self = this;

    self.deck = ko.observable(deck);
    self.quizId;
    self.selectedCard = ko.observable();
    self.notUsedCards = ko.observableArray();
    self.usedCards = ko.observableArray([]);
    self.showAnswer = ko.observable(false);
    self.cardsShown = ko.observableArray([]);
    self.correctAnswers = ko.observable(0);

    self.percentage = ko.computed(function () {
        var percentCalc = 0;
        if(self.cardsShown().length != 0) percentCalc = self.correctAnswers() / self.cardsShown().length;
        var percentage = (100 * percentCalc).toFixed(0);
        return percentage;
    });
    self.correct = function () { self.newCard(true);  };
    self.inCorrect = function () { self.newCard(false); };
    self.FinalizeQuiz = function () {
        self.notUsedCards([]);
        self.usedCards([]);
        self.showAnswer(false);
        self.cardsShown([]); ;
        self.correctAnswers(0);
        $('#quizSummaryModal').modal('hide');
        window.location.href = "#home";
    };

    self.newCard = function (correct) {
        // Reset UI
        self.showAnswer(false);
        $("#quizSingleAnswer").hide();
        $("#quizTrueFalseAnswer").hide();
        self.cardsShown.push({ card: self.selectedCard(), isCorrect: correct });
        // Save stats
        if (correct) {
            self.correctAnswers(self.correctAnswers() + 1);
            SaveStats(true);
        }
        else {
            SaveStats(false);
        }

        // put the old card in the used cards pile
        self.usedCards.push(self.selectedCard());
        self.notUsedCards.remove(self.selectedCard());

        // Get a new card
        self.selectedCard(GetRandomQuizCard());
    };

    self.showHideAnswer = function () {

        if (self.showAnswer())
            $("#btnShowHideAnswer").text("show answer");
        else
            $("#btnShowHideAnswer").text("hide answer");

        self.showAnswer(!self.showAnswer());

        var typeId = parseInt(self.selectedCard().typeId());
        switch (self.selectedCard().typeId()) {
            case 1:
                $("#quizSingleAnswer").toggle();
                break;
            case 2:
                break;
            case 3:
                $("#quizTrueFalseAnswer").toggle(); break;
                break;
            default:
                break;
        }
    };

    self.deck.subscribe(function (newDeck) { self.notUsedCards(newDeck.cards()); });

}

var element = $('#quiz')[0];
var quizView = new QuizViewModel(null);
ko.applyBindings(quizView, element);

function CreateNewQuiz(quizId, deckId) {

    db.transaction(function (t) {
        t.executeSql('SELECT CorrectAnswers, Cards FROM Quiz WHERE QuizId = ?', [quizId],
            function (tx, rs) {
                if (rs != null && rs.rows.length > 0) {
                    //                    quizView.correctAnswers(rs.rows.item(0)["CorrectAnswers"]);
                    //                    quizView.cardsShown();
                    return false;
                }
                else {
                    t.executeSql('INSERT INTO Quiz(QuizId, DeckId, TakenTime, Cards, CorrectAnswers) VALUES (?,?,?,?,?)'
                        , [quizId, deckId, new Date, 0, 0]
                        , function (tx2, rs2) {
                            console.log(rs2.insertId);
                        }
                        , errorHandler);
                }
            }
            , errorHandler);

    });
    
    return false;
}

function GetRandomQuizCard() {
    
    if (quizView.notUsedCards().length == 0) {
        // re-stack the deck
        quizView.notUsedCards(quizView.usedCards());
        quizView.usedCards([]);
    }
    var randomIndex = Math.floor((Math.random() * quizView.notUsedCards().length));
    var card = quizView.notUsedCards()[randomIndex];
    return card;
}

function SaveStats(isCorrect) {

    // update quiz table
    db.transaction(function (t) {
        t.executeSql("UPDATE Quiz SET Cards = Cards+1, CorrectAnswers = CorrectAnswers+? WHERE QuizId = ?"
            , [isCorrect == true ? 1 : 0, quizView.quizId]
            , []
            , errorHandler);
    });

    // update card table
    db.transaction(function (t) {
        t.executeSql("UPDATE Card SET Asked = Asked+1, CorrectlyAnswered = CorrectlyAnswered+? WHERE CardId = ?"
            , [isCorrect == true ? 1 : 0, quizView.selectedCard().id()]
            , []
            , errorHandler);
    });

    return false;
}

