function Quiz(id, deckid, deckName, takenTime, cards, correct) {
    var self = this;

    self.quizId = id;
    self.deckId = deckid;
    self.deckName = deckName;
    self.takenTime = takenTime;
    self.numberOfCards = cards;
    self.correctAnswers = correct;

    self.formattedDate = ko.computed(function () {
        var d = new Date(self.takenTime);
        return 'on ' + d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' at ' + d.getHours() + ':' + d.getMinutes();
    });
    self.percentage = ko.computed(function () {
        var percentCalc = 0;
        if (self.numberOfCards != 0) percentCalc = self.correctAnswers / self.numberOfCards;
        var percentage = (100 * percentCalc).toFixed(0);
        return percentage;
    });
}

function GetLatestQuizzes(callback) {

    var quizzes = [];

    db.transaction(function (t) {
        t.executeSql('SELECT Deck.Name, Deck.DeckId, Quiz.QuizId, Quiz.TakenTime, CorrectAnswers, Cards FROM Quiz ' +
                     ' INNER JOIN Deck ON Quiz.DeckId = Deck.DeckId ORDER BY TakenTime DESC LIMIT 5'
                     , [],
            function (tx, rs) {
                if (rs != null && rs.rows.length > 0) {
                    for (i = 0; i < rs.rows.length; i++) {
                        var q = rs.rows.item(i);
                        quizzes.push(new Quiz(q["QuizId"], q["DeckId"], q["Name"], q["TakenTime"], q["Cards"], q["CorrectAnswers"]));
                    }
                    callback(quizzes);
                }
            }
            , errorHandler);

    });

    return false;
}
