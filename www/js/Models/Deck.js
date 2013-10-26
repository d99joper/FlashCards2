function Deck(deckid, name, cards, cardCount) {
    var self = this;

    self.id = deckid;
    self.name = ko.observable(name);
    self.cards = ko.observableArray(cards);
    self.cardCount = cardCount;

    self.name.subscribe(function (newValue) {
        $("#subHeader").html(": " + newValue);
    });

    self.Save = function () {
        db.transaction(function (transaction) {
            transaction.executeSql("UPDATE Deck SET Name = ? WHERE DeckId = ?"
            , [self.name(), self.id]
            , []
            , errorHandler);
        });

        return false;
    };

    self.Delete = function () {
        db.transaction(function (t) {
            t.executeSql("DELETE FROM Deck WHERE DeckId = ?"
            , [self.id]
            , []
            , errorHandler);
        });

        return false;
    };
}

// ************ CRUD FUNCTIONS ******************* //

// Add deck
function AddDeck(deck, callback) {
    
    // Insert deck
    var r = db.transaction(function (transaction) {
        transaction.executeSql('INSERT INTO Deck(DeckId, Name, CreatedDate, CreatedBy) VALUES (?,?,?,?)'
            , [deck.id, deck.name(), new Date, null]
            , function (tx, rs) {
                console.log(rs);
                if (callback)
                    callback(rs.insertId);
            }
            , errorHandler);
    });

    return false;
}

// Get deck
function GetDeck(id, callback) {

    // Get deck
    db.transaction(function (t) {
        t.executeSql('SELECT Name FROM Deck WHERE DeckId = ?'
            , [id]
            , function (tx, rs) {
                // Deck exists
                if (rs != null && rs.rows.length > 0) {
                    var name = rs.rows.item(0)["Name"];

                    t.executeSql('SELECT CardId, DeckId, Question, ImageUrl, TypeId FROM Card WHERE DeckId = ?'
                        , [id]
                        , function (tx2, rs2) {
                            if (rs2 != null && rs2.rows != null) {
                                var cards = [];
                                GetCardsOneByOne(rs2.rows, cards, i = 0, id, rs2.rows.length, function (c) {
                                    var deck = new Deck(id, name, c, c.length);
                                    callback(deck);
                                });
//                                for (var i = 0; i < rs2.rows.length; i++) {
//                                    GetCard(rs2.rows.item(i)["CardId"], id, function (card, deckName) {
//                                        cards.push(card);
//                                    });
                                    //                                    var card = new Card(rs2.rows.item(i)["CardId"]
                                    //                                                        , rs2.rows.item(i)["DeckId"]
                                    //                                                        , rs2.rows.item(i)["Question"]
                                    //                                                        , rs2.rows.item(i)["ImageUrl"]
                                    //                                                        , rs2.rows.item(i)["TypeId"]
                                    //                                                        , null);
                                    //                                    cards.push(card);
                               // }
                            }
                            
                        }
                        , errorHandler);
                }
                // Create new (deck doesn't exist)
                else {
                    var newDeck = new Deck(id, "", null, 0); ;
                    AddDeck(newDeck, null);
                    callback(newDeck);
                }
            }
            , errorHandler);
    });

    return false;
}

function GetCardsOneByOne(rows,cards, i, deckId, l, callback) {
    if (l == i) {
        callback(cards);
        return false;
    }

    GetCard(rows.item(i)["CardId"], deckId, function(card, deckName) {
        i++;
        cards.push(card);
        GetCardsOneByOne(rows, cards,i, deckId, l, callback);        
    });
    
    
}

function GetAllDecks(callback) {

    db.transaction(function (t) {
        t.executeSql('SELECT Deck.DeckId, Name, Count(Card.CardId) as cards FROM Deck LEFT JOIN Card on Card.DeckId = Deck.DeckId GROUP BY Deck.DeckId, Name', [],
            function (tx, rs) {
                var decks = [];
                for (i = 0; i < rs.rows.length; i++) {
                    var row = rs.rows.item(i); 
                    decks.push(new Deck(row["DeckId"], row["Name"], null, row["cards"]));
                }
                callback(decks);
            }, errorHandler);
    });

    return false;
}

