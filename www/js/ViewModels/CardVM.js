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

    self.addAnswer = function () {
        var answer = new Answer(self.card().multipleAnswers().length + 1, self.card().id(), null, false, 2);
        self.card().multipleAnswers.push(answer);
        AddAnswer(answer);
    };

    self.saveAnswer = function (answer) {
        console.log(answer.isCorrect());
        answer.Save();
    }

    self.removeAnswer = function (answer) {
        if (confirm("Are you sure you want to delete the answer?")) {
            self.card().multipleAnswers.remove(answer);
            answer.Delete();
        }
    }

    self.newCard = function () {
        var validation = self.card().Validate();

        if (validation.valid) {
            self.card().Save();
            var newCardId = GenerateGuid();
            self.card().id(newCardId);
            GetCard(newCardId, self.card().deckId, function (card, deckName) {
                self.card(card);
            });
        }
        else
            alert("Card cannot be saved." + validation.message);
    };

    self.done = function () {
        var validation = self.card().Validate();

        if (validation.valid)
            self.card().Save();

        else if (confirm("Card is not complete.\n This card will be deleted unless you cancel." + validation.message)) {
            self.card().Delete();
        }
        else return false;

        location.hash = '#deck/' + self.card().deckId;
    };

    self.addItemsAllowed = ko.computed(function () {
        return self.card().multipleAnswers().length < self.answerLimit();
    });

}
var element = $('#createCard')[0];
//ko.cleanNode(element);
var editCardView = new EditCardViewModel(null, null, null, null, null, null, null);
ko.applyBindings(editCardView, element); //document.getElementById("#createCard"));

function uploadImage(file) {

    if (file.type.toLowerCase() != 'image/png' && file.type != 'image/jpg' && !file.type != 'image/gif' && file.type != 'image/jpeg')
        alert("File doesnt match png, jpg or gif");

    else if (isPhonegap()) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            gotFS(fs, file, file.type);
        }, errorHandler);
    }
    else {
        if (file.name.length < 1)
            alert("No file name specified.");
        //    else if (file.size > 300000)
        //        alert("File is to big");
        else {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function (event) {

                // shrink image
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                var img = document.createElement('img');
                img.src = reader.result;
                img.onload = function () {
                    var newWidth = $('.page').width() * .85; //viewport.width * .7;
                    var newHeight = img.height / img.width * newWidth;
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, newWidth, newHeight);
                    var shrunkImg = canvas.toDataURL('image/jpeg');
                    var imgData = canvas.toDataURL().replace(/data:image\/png;base64,/, '');
                    // save image data to the phone storage

                    // Save the image path to the database (on web, should upload the entire image)
                    editCardView.card().UpdateImagePath(file.name);

                    // Display the image
                    $("#imgDisplay").attr({ "src": shrunkImg });
                }

                if (event.target.error)
                    errorHandler(event.target.error);
            }
        }
    }
}

function getFileEnding(type) {
    if (file.type.toLowerCase() != 'image/png' && file.type != 'image/jpg' && !file.type != 'image/gif' && file.type != 'image/jpeg')
    switch (type.toLowerCase()) {
        case 'image/png':
            return ".png";
        case 'image/jpg':
            return ".jpg";
        case 'image/jpeg':
            return ".jpg";
        case 'image/gif':
            return ".gif";
        default:
            return "";
    }
}

function gotFS(fileSystem, file, type) {
    
    var flags = { create: true, exclusive: false };
    fileSystem.root.getFile(file.name, flags, function (fe) { gotFileEntry(fe, file, type); }, errorHandler2);
}

function gotFileEntry(fe, file, type) {

    var reader = new FileReader();
    reader.onloadend = function (event) {
        // shrink image
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var img = document.createElement('img');
        img.src = reader.result;
        img.onload = function () {
                    
            var newHeight = img.height / img.width * 400;
            canvas.width = 400;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 400, newHeight);

            // use setTimeout to allow the canvas to finish drawing
            setTimeout(function () {

                var shrunkImg = canvas.toDataURL('image/jpeg');

                // save image data to the phone storage
                var imgData = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
                dirImg.getFile(file.name, { create: true, exclusive: false }, getWin, getFail);
                var getWin = function (f) {
                    f.createWriter(writeWin, writeFail);
                };
                var writeWin = function (writer) {
                    writer.write(imgData);
                };
                var writeFail = function (error) {
                    alert("Failed to write file: " + error.code);
                };
                var getFail = function (error) {
                    alert("Failed to retrieve file: " + error.code);
                };
                // copy file 
                fe.copyTo(dirImg, "myCopy" + getFileEnding(type), null, null);
                //fe.createWriter(gotFileWriter, function (error) { alert("CreateWriter failed: " + error.code); });

                // Save the image path to the database
                editCardView.card().UpdateImagePath(fe.fullPath);

                // Display the image
                $("#imgDisplay").attr({ "src": shrunkImg });
            }, 0)



        }
    };
    reader.onerror = function (event) {
        errorHandler2(event.target.error.code);
    };
    reader.readAsDataURL(file);
}

function errorHandler2(e) {
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
