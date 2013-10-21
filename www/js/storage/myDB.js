// global variables 
var db; 
var shortName = 'WebSqlDBFlashCards'; 
var version = '1.0';
var displayName = 'WebSqlDBFlashCards';
var maxSize = 65535;

// this line tries to open the database base locally on the device 
// if it does not exist, it will create it and return a database object stored in variable db 
db = openDatabase(shortName, version, displayName, maxSize); 

// this is called when an error happens in a transaction 
function errorHandler(transaction, error) { 
   console.log('Error: ' + error.message + ' code: ' + error.code); 
} 

// this is called when a successful transaction happens 
function successCallBack() { 
   //console.log("DEBUGGING: success"); 
} 

function nullHandler(){}; 

// called when the application loads 
function createDBStructure() { 

    if (!window.openDatabase) { 
        // not all mobile devices support databases  if it does not, the following alert will display 
        // indicating the device will not be albe to run this application 
        alert('Databases are not supported in this browser.'); 
        return; 
    } 

    // this line will try to create the table User in the database just created/openned
    db.transaction(function (tx) {

        //        tx.executeSql('DROP TABLE Quiz');
        //        tx.executeSql('DROP TABLE Deck2');
        //        tx.executeSql('DROP TABLE Deck');
        //        tx.executeSql('DROP TABLE Card');
        //        tx.executeSql('DROP TABLE Answer');
        //        tx.executeSql('DROP TABLE User');

        // Deck table
        tx.executeSql('CREATE TABLE IF NOT EXISTS Deck(DeckId GUID NOT NULL PRIMARY KEY, Name TEXT, CreatedDate DATETIME, CreatedBy GUID, ' + 
                        ' IsFavorite BOOL, UploadedDate DATETIME)',
                      [], nullHandler, errorHandler);

        // Card table
        tx.executeSql('CREATE TABLE IF NOT EXISTS Card(CardId GUID NOT NULL, DeckId GUID NOT NULL, ' +
                            'Question TEXT NULLABLE, ImageUrl TEXT NULLABLE, TypeId INTEGER NOT NULL, ' +
                            'Asked INTEGER, CorrectlyAnswered INTEGER, Priority INTEGER' +
                            ', constraint PK_Card primary key (CardId, DeckId))',
                      [], nullHandler, errorHandler);

        // Answer table
        tx.executeSql('CREATE TABLE IF NOT EXISTS Answer(AnswerId INTEGER NOT NULL, CardId GUID NOT NULL, ' +
                            'Text TEXT, IsCorrect BOOL, TypeId INTEGER' +
                            ', constraint PK_Card primary key (AnswerId, CardId))',
                      [], nullHandler, errorHandler);

        // Quiz table
        tx.executeSql('CREATE TABLE IF NOT EXISTS Quiz(QuizId GUID NOT NULL, DeckId GUID NOT NULL, ' +
                            'TakenTime DATETIME NOT NULL, Cards INTEGER, CorrectAnswers INTEGER' +
                            ', constraint PK_Card primary key (QuizId))',
                      [], nullHandler, errorHandler);

        // User table
        tx.executeSql('CREATE TABLE IF NOT EXISTS User(UserId GUID NOT NULL, Name TEXT NOT NULL, Password TEXT, ' +
                            'Email TEXT, CreatedDate DATETIME, Gender BOOL' +
                            ', constraint PK_Card primary key (UserId))',
                      [], nullHandler, errorHandler);

        // Alterations
//        tx.executeSql('ALTER TABLE Deck ADD IsFavorite BOOL', [], nullHandler, errorHandler);
//        tx.executeSql('ALTER TABLE Deck ADD UploadedDate DATETIME', [], nullHandler, errorHandler);
//        tx.executeSql('ALTER TABLE Card ADD Priority INTEGER', [], nullHandler, errorHandler);
    }
    , errorHandler
    , successCallBack); 
}
