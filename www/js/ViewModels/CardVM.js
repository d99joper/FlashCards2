function EditCardViewModel(id, deckId, question, image, typeId, answers) {
    var self = this;

    self.card = ko.observable(new Card(id, deckId, question, image, typeId, answers));
    self.answerLimit = ko.observable(10);


    // Non-editable catalog data - would come from the server
    self.types = [
        { id: 1, text: "Text" },
        { id: 2, text: "Multiple Choice" },
        { id: 3, text: "True or False" }
    ];
    
    self.saveCard = function () { SaveCard(self.card()); };

    self.addAnswer = function () {
        var answer = new Answer(self.card().multipleAnswers().length + 1, self.card().id, null, false, 2);
        self.card().multipleAnswers.push(answer);
        AddAnswer(answer);
    };

    self.saveAnswer = function (answer) {
        console.log(answer.isCorrect());
        SaveAnswer(answer);
    }

    self.removeAnswer = function (answer) {
        if (confirm("Are you sure you want to delete the answer?")) {
            self.card().multipleAnswers.remove(answer);
            DeleteAnswer(answer);
        }
    }

    self.addItemsAllowed = ko.computed(function () {
        return self.card().multipleAnswers().length < self.answerLimit();
    });

}
var element = $('#createCard')[0];
//ko.cleanNode(element);
var editCardView = new EditCardViewModel(null, null, null, null, null, null, null);
ko.applyBindings(editCardView, element); //document.getElementById("#createCard"));

function uploadImage(file) {

    if (isPhonegap()) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            gotFS(fs, file, file.type);
        }, errorHandler);
    }
    else {
        if (file.name.length < 1)
            alert("No file name specified.");
        //    else if (file.size > 300000)
        //        alert("File is to big");
        else if (file.type != 'image/png' && file.type != 'image/jpg' && !file.type != 'image/gif' && file.type != 'image/jpeg')
            alert("File doesnt match png, jpg or gif");
        else {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function (event) {
                alert(event.target.error);
                if (event.target.error)
                    errorHandler(event.target.error);
                $("#imgDisplay").attr({ "src": event.target.result, "width": "250px" });
            }
        }
    }
}

function gotFS(fileSystem, file, type) {
    var flags = { create: true, exclusive: false };
    fileSystem.root.getFile(file.name, flags, function (fe) { gotFileEntry(fe, file, type); }, fail);
}

function gotFileEntry(fileEntry, file, type) {
    alert(fileEntry.fullPath);
    var reader = new FileReader();
    reader.onloadend = function (event) {
        $("#imgDisplay").attr({ "src": event.target.result, "width": "250px" });
    };
    reader.onerror = function (event) {
        errorHandler(event.target.error.code);
    };
    reader.readAsDataURL(file);
    //fileEntry.createWriter(function (w) { gotFileWriter(w, file, type); }, fail);
}

function gotFileWriter(fileWriter, file, type) {
    var reader = new FileReader();
    reader.onloadend = function (event) {
        $("#imgDisplay").attr({ "src": event.target.result, "width": "250px" });
    };
    reader.onerror = function (event) {
        errorHandler(event.target.error.code);
    };
    reader.readAsDataURL(file);
}

function errorHandler(e) {
    var msg = '';

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
    };

    alert('Error: ' + msg);
}

function win(file) {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = function (event) {
        $("#imgDisplay").attr({ "src": event.target.result, "width": "250px" });
    }
};

var fail = function (evt) {
    alert(error.code);
};