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

    self.displayUrl = function () {
        if (isPhonegap()) return dirImg.fullPath + "/" + self.card().imageUrl;        
        else return self.card().imageUrl
    }

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
    var type = file.type.toLowerCase(); 
    if (type != 'image/png' && type != 'image/jpg' && !type != 'image/gif' && type != 'image/jpeg')
        alert("File doesnt match png, jpg or gif");
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
                var newWidth = viewport.width * .7;
                var newHeight = img.height / img.width * newWidth;
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, newWidth, newHeight);
                var shrunkImg = canvas.toDataURL('image/jpeg');
                // Display the image
                $("#imgDisplay").attr({ "src": shrunkImg });

                var imageName = GenerateGuid();
                if (isPhonegap()) imageName += ".png";
                else imageName += getFileEnding(file.type);

                // Save the image path to the database (on web, should upload the entire image)
                editCardView.card().UpdateImagePath(imageName);

                if (isPhonegap()) {
                    // window.requestFileSystem(LocalFileSystem.PERSISTENT, file.size, function (fs) { gotFS(fs, file, file.type); }, errorHandler);    
                    window.canvas2ImagePlugin.saveImageDataToLibrary(
                        function (filePath) {
                            alert(filePath);
                            dirRoot.getFile(filePath, { create: true, exclusive: false },
                                function (fe) {
                                    alert(fe.fullPath);
                                    fe.moveTo(dirImg, imageName,
                                        function (msg) {
                                            // Save the image path to the database
                                            editCardView.card().UpdateImagePath(imageName);
                                        }
                                        , function (e) { alert("Failed to move image. \n" + error.code); }
                                    );
                                }
                                , errorHandler2);
                        },
                        function (err) {
                            alert("Failed saving image to card. \n" + err);
                        },
                        canvas
                    );
                }
            }
            if (event.target.error)
                errorHandler(event.target.error);
        }
    }
}

function getFileEnding(type) {

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

function gotFS(fs, file, type) {
    var flags = { create: true, exclusive: false };
    fs.root.getFile(file.name, flags, function (fe) { gotFileEntry(fe, file, type); }, errorHandler2);
}

function gotFileEntry(fe, file, type) {
    //alert("gotFileEntry: " + file.size);
    // copy file
    //fe.file(function (f) { alert(f.size); }, function (e) { alert(e.code); });
    //fe.copyTo(dirImg, "copy.jpg", function(f) {alert("successful copy: " + f.fullPath);}, null);

    var reader = new FileReader();
    reader.onloadend = function (event) {
        // shrink image
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var img = document.createElement('img');
        img.src = reader.result;

        img.onload = function () {
            
            var newWidth = $(".page").width() * .8;
            var newHeight = img.height / img.width * newWidth;
            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, newWidth, newHeight);
            
            var imageName = GenerateGuid() + ".png";

            window.canvas2ImagePlugin.saveImageDataToLibrary(
                function (filePath) {
                    alert(filePath);
                    dirRoot.getFile(filePath, { create: true, exclusive: false },
                        function (fe2) {
                            alert(fe2.fullPath);
                            fe2.moveTo(dirImg, imageName, 
                                function (msg) {
                                    // Save the image path to the database
                                    editCardView.card().UpdateImagePath(imageName);
                                }
                                , function (e) { alert("Failed to move image. \n" + error.code); }
                            );
                        }
                        , errorHandler2);
                },
                function (err) {
                    alert("Failed saving image to card. \n" + err);
                },
                canvas
            );

            // use setTimeout to allow the canvas to finish drawing
            setTimeout(function () {

                var shrunkImg = canvasToData(type, canvas); //canvas.toDataURL('image/jpeg');

                // save image data to the phone storage
                //                var imgData64 = canvas.toDataURL("image/png").replace(/data:image\/png;base64,/, ''); //canvas.toDataURL("image/png");//.replace("image/png", "image/octet-stream");                
                //                setTimeout(function () {
                //                    //dirImg.getFile("test.png", { create: true, exclusive: false }, function (f) { getWin(imgData64, f); }, getFail);
                //                    //dirImg.getFile("test4.png", { create: true, exclusive: false }, function (f) { getWin2(imgData64, f); }, getFail);
                //                    //dirImg.getFile(file.name, { create: true, exclusive: false }, function (f) { getWin(shrunkImg, f); }, getFail);
                //                }, 0);

                //                setTimeout(function () {
                //                    var data = Base64Binary.decode(imgData64);
                //                    var str = "";
                //                    for (var i = 0, l = data.length; i < l; i++)
                //                        str += String.fromCharCode(data[i]);
                //                    //var data = Base64Binary.decode(shrunkImg);
                //                    //var str = String.fromCharCode.apply(null, data); // "ÿ8É"
                //                    //console.log(str);
                //                    // to Base64
                //                    var b64 = btoa(str); // "/zjJCA=="
                //                    console.log(b64);
                //                    setTimeout(function () {
                //                        dirImg.getFile("test2.png", { create: true, exclusive: false }, function (f) { getWin2(str, f); }, getFail);
                //                        dirImg.getFile("test3.png", { create: true, exclusive: false }, function (f) { getWin2(b64, f); }, getFail);
                //                        //dirImg.getFile(file.name, { create: true, exclusive: false }, function (f) { getWin(imgData, f); }, getFail);
                //                    }, 0);
                //                }, 0);
                //var uintArray = Base64Binary.decode(data);
                //fe.createWriter(gotFileWriter, function (error) { alert("CreateWriter failed: " + error.code); });

                // Save the image path to the database
                //editCardView.card().UpdateImagePathimageName); //fe.fullPath);

                // Display the image
                $("#imgDisplay").attr({ "src": shrunkImg });
            }, 0)

        }
    };
    reader.onerror = function (event) {
        errorHandler2(event.target.error.code);
    };
    //reader.readAsBinaryString(file);
    reader.readAsDataURL(file);
}

function canvasToData(type, canvas) {

    switch (type.toLowerCase()) {
        case 'image/png':
            return canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        case 'image/jpg':
            return canvas.toDataURL("image/jpg").replace("image/jpg", "image/octet-stream");
        case 'image/jpeg':
            return canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
        case 'image/gif':
            return canvas.toDataURL("image/gif").replace("image/gif", "image/octet-stream");
        default:
            return "";
    }
    
}

function getWin(data, f) { f.createWriter(function (w) { writeWin(data, w); }, writeFail); };
function getWin2(data, f) { f.createWriter(function (w) { writeWin2(data, w); }, writeFail); };
function writeWin(data, writer) { writer.write(atob(data)); };
function writeWin2(data, writer) { writer.write(data); };
function writeFail(error) { alert("Failed to write file: " + error.code); };
function getFail(error) { alert("Failed to retrieve file: " + error.code); };

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
