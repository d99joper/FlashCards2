function Card(id, deckid, question, imageUrl, typeId, singleAnswer, multipleAnswers, tfAnswer) {
    var self = this;

    if (!singleAnswer) singleAnswer = new Answer(0, 0, null, null, 1);
    if (!tfAnswer) tfAnswer = new Answer(0, 0, null, true, 3);
    
    self.id = id;
    self.deckId = deckid;
    self.question = ko.observable(question);
    self.imageUrl = imageUrl;
    self.typeId = ko.observable(typeId);
    self.multipleAnswers = ko.observableArray(multipleAnswers);
    self.singleAnswer = ko.observable(singleAnswer);
    self.trueFalseAnswer = ko.observable(tfAnswer);

    self.typeId.subscribe(function (newValue) { SaveCard(self); });
    self.question.subscribe(function (newValue) { SaveCard(self); });

    self.UpdateImagePath = function (path) {
        self.imageUrl = path;
        SaveCard(self);
    };
}

function Answer(id, cardId, text, isCorrect, typeId) {
    var self = this;

    self.id = id;
    self.cardId = cardId;
    self.text = ko.observable(text);
    self.isCorrect = ko.observable(isCorrect);
    self.typeId = typeId;

    self.isCorrect.subscribe(function (newValue) { SaveAnswer(self); });
    self.text.subscribe(function (newValue) { SaveAnswer(self); });
}

function Type(id, name) {
    var self = this;

    self.id = id;
    self.name = name;
}

// Add card
function AddCard(card, callback) {

    // Insert card
    db.transaction(function (t) {
        t.executeSql('INSERT INTO Card(CardId, DeckId, Question, ImageUrl, TypeId, Asked, CorrectlyAnswered) VALUES (?,?,?,?,?,0,0)'
            , [card.id, card.deckId, card.question(), card.imageUrl, card.typeId()]
            , function (tx, rs) {
                // Insert two initial answers
                t.executeSql("INSERT INTO Answer(AnswerId, CardId, Text, IsCorrect, TypeId) VALUES(?,?,?,?,?)"
                    , [1, card.id, null, null, 1], [], errorHandler);
                t.executeSql("INSERT INTO Answer(AnswerId, CardId, Text, IsCorrect, TypeId) VALUES(?,?,?,?,?)"
                    , [2, card.id, null, true, 3], [], errorHandler);
                // return the inserted card id
                if(callback)
                    callback(rs.insertId);
            }
            , errorHandler);
    });

    return false;
}

// Get next card id
function GetCardNextId(deckId, callback) {
    
    console.log("GetNextCardId");

    db.transaction(function (tx) {
        tx.executeSql('SELECT MAX(CardId) as id FROM Card WHERE DeckId = ?', [deckId],
            function (tx, result) {
                if (result != null && result.rows != null)
                    callback(result.rows.item(0)["id"] + 1);
            }, errorHandler);
    });

    return false;
}

// Get Card
function GetCard(cardId, deckId, callback) {

    db.transaction(function (transaction) {
        transaction.executeSql('SELECT Card.CardId, Card.DeckId, Card.Question, Card.ImageUrl, Card.TypeId, Deck.Name as DeckName, ' +
                                'Answer.AnswerId, Answer.text, Answer.isCorrect, Answer.TypeId as answerTypeId ' +
                                'FROM Card INNER JOIN Deck on Card.DeckId = Deck.DeckId ' +
                                'LEFT JOIN Answer on (Card.CardId = Answer.CardId) WHERE Card.CardId = ? AND Card.DeckId = ? '
            , [cardId, deckId]
            , function (tx, rs) {
                if (rs != null && rs.rows.length > 0) {

                    var question = rs.rows.item(0)["Question"];
                    var imageUrl = rs.rows.item(0)["ImageUrl"];
                    var typeId = rs.rows.item(0)["TypeId"];
                    var mAnswers = [];
                    var sAnswer, tfAnswer = null;
                    for (i = 0; i < rs.rows.length; i++) {

                        switch (parseInt(rs.rows.item(i)["answerTypeId"])) {
                            case 1:
                                sAnswer = new Answer(rs.rows.item(i)["AnswerId"], cardId, rs.rows.item(i)["Text"], rs.rows.item(i)["IsCorrect"] == 'true', rs.rows.item(i)["answerTypeId"]);
                                break;
                            case 2:
                                mAnswers.push(new Answer(rs.rows.item(i)["AnswerId"], cardId, rs.rows.item(i)["Text"], rs.rows.item(i)["IsCorrect"] == 'true', rs.rows.item(i)["answerTypeId"]));
                                break;
                            case 3:
                                tfAnswer = new Answer(rs.rows.item(i)["AnswerId"], cardId, rs.rows.item(i)["Text"], rs.rows.item(i)["IsCorrect"] == 'true', rs.rows.item(i)["answerTypeId"]);
                                break;
                            default:
                                break;
                        }
                    }

                    var card = new Card(cardId, deckId, question, imageUrl, typeId, sAnswer, mAnswers, tfAnswer);
                    callback(card, rs.rows.item(0)["DeckName"]);
                }
                else {
                    transaction.executeSql('SELECT Name as DeckName FROM Deck WHERE DeckId = ? '
                    , [deckId]
                    , function (tx, rs) {
                        if (rs != null && rs.rows.length > 0) {
                            AddCard(new Card(cardId, deckId, null, null, 1, null, null, null), null);
                            GetCard(cardId, deckId, function (newCard) { callback(newCard, rs.rows.item(0)["DeckName"]); });
                        }
                    }
                    , errorHandler);
                }
            }
            , errorHandler);
        });

    return false;
}

// Save Card
function SaveCard(card) {

    db.transaction(function (t) {
        t.executeSql("UPDATE Card SET Question = ?, TypeId = ?, ImageUrl = ? WHERE CardId = ? and DeckId = ?"
            , [card.question(), card.typeId(), card.imageUrl, card.id, card.deckId]
            , []
            , errorHandler);
    });

    return false;
}

function DeleteCard(card) {

    db.transaction(function (t) {
        t.executeSql("DELETE FROM Card WHERE CardId = ? and DeckId = ?"
            , [card.id, card.deckId]
            , []
            , errorHandler);
    });

    return false;
}

function ValidateCard(callback) {

    var isValid = true;
    var msg = "\n\nIssues:\n";

    var card = editCardView.card();

    if (card.question() == "" || card.question() == null) {
        msg += "- The question has no text.\n";
        isValid = false;
    }

    var tid = card.typeId();
    switch (parseInt(tid)) {
        case 1:
            if (card.singleAnswer().text() == "" || card.singleAnswer().text() == null) {
                isValid = false;
                msg += "- The answer has no text.\n";
            }
            break;
        case 2:
            var answers = card.multipleAnswers();
            var noCorrectAnswer = true;
            var noAnswerText = false;
            for (i = 0; i < answers.length; i++) {
                if (answers[i].isCorrect() == true) noCorrectAnswer = false;
                if (!noAnswerText & (answers[i].text() == "" || answers[i].text() == null)) {
                    noAnswerText = true;
                    msg += "- All answers must have text.\n";
                }
            }
            if (noCorrectAnswer) {
                msg += "- At least one answer must be marked as correct.\n";
                isValid = false;
            }
            break;
        case 3:
            break;
        default:
            return false;
    }



    return [{ valid: isValid, message: msg}];
}

// Add answer
function AddAnswer(answer) {
    db.transaction(function (t) {
        t.executeSql("SELECT MAX(AnswerId) as id FROM Answer"
            , []
            , function (tx, rs) {
                console.log("add answer");
                var newId = rs.rows.item(0)["id"] + 1;
                t.executeSql("INSERT INTO Answer(AnswerId, CardId, Text, IsCorrect, TypeId) VALUES(?,?,?,?,?)"
                    , [newId, answer.cardId, answer.text(), answer.isCorrect(), answer.typeId]
                    , function (tx, rs) {
                        if (rs != null && rs.rows != null) {
//                            console.log(rs);
//                            console.log(rs.rows);
                        }
                    }
                    , errorHandler);
                answer.id = newId;
            }
            , errorHandler);
    });

    return false;
}

function SaveAnswer(answer) {
    console.log(answer);
    db.transaction(function (t) {
        t.executeSql("UPDATE Answer SET Text = ?, IsCorrect = ? WHERE AnswerId = ? and CardId = ?"
            , [answer.text(), answer.isCorrect(), answer.id, answer.cardId]
            , []
            , errorHandler);
    });

    return false;
}

function DeleteAnswer(answer) {
    console.log(answer);
    db.transaction(function (t) {
        t.executeSql("DELETE FROM Answer WHERE AnswerId = ? and CardId = ? "
            , [answer.id, answer.cardId]
            , []
            , errorHandler);
    });

    return false;
}

// Insert answers
//if (card.answers) {
//    for (var i = 0; i < card.answers.length; i++) {
//        console.log("I'm here");
//        db.transaction(function (transaction) {
//            transaction.executeSql('INSERT INTO Answer(AnswerId, CardId, Text, isCorrect) VALUES (?,?,?,?)'
//                            , [card.answers[i].Id, card.answers[i].CardId, card.answers[i].Text, card.answers[i].isCorrect]
//                            , nullHandler, errorHandler);
//        });
//    }
//}