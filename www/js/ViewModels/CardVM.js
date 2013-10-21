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

