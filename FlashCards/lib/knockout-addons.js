ko.observableArray.fn.filterByProperty = function (propName, matchValue, type) {
    return ko.computed(function () {
        var allItems = this(), matchingItems = [];
        console.log(allItems);
        if (matchValue === "" || matchValue == null) return allItems;

        for (var i = 0; i < allItems.length; i++) {

            currentValue = ko.utils.unwrapObservable(allItems[i][propName]);
            console.log(currentValue + " : " + matchValue);
            switch (type) {
                case "equals":
                    if (currentValue === matchValue)
                        matchingItems.push(current);
                    break;
                case "startsWith":
                    if (currentValue.indexOf(matchValue) == 0)
                        matchingItems.push(current);
                    break;
                case "endsWith":
                    if (currentValue.indexOf(matchValue) == currentValue.length - 1)
                        matchingItems.push(current);
                    break;
                case "contains":                    
                    if (currentValue.indexOf(matchValue) > -1)
                        matchingItems.push(current);
                    break;
                default:
                    break;
            }
        }

        return matchingItems;

    }, this);
}

ko.observable.fn.filterArrayByProperty = function (array, propName, matchValue, type) {
    
    return ko.computed(function () {
        var allItems = array(), matchingItems = [];
        console.log(allItems);
        if (matchValue === "" || matchValue == null) return allItems;

        for (var i = 0; i < allItems.length; i++) {

            currentValue = ko.utils.unwrapObservable(allItems[i][propName]);
            console.log(currentValue + " : " + matchValue);
            switch (type) {
                case "equals":
                    if (currentValue === matchValue)
                        matchingItems.push(current);
                    break;
                case "startsWith":
                    if (currentValue.indexOf(matchValue) == 0)
                        matchingItems.push(current);
                    break;
                case "endsWith":
                    if (currentValue.indexOf(matchValue) == currentValue.length - 1)
                        matchingItems.push(current);
                    break;
                case "contains":
                    if (currentValue.indexOf(matchValue) > -1)
                        matchingItems.push(current);
                    break;
                default:
                    break;
            }
        }

        return matchingItems;

    }, this);
}

function filterArrayByProperty(array, propName, matchValue, type) {

    var allItems = array(), matchingItems = [];
    //var matchValue = self.filter(), type = "contains";
    console.log(allItems);
    console.log(!matchValue);
    if (!matchValue || matchValue == "" || matchValue == null) return allItems;

    for (var i = 0; i < allItems.length; i++) {

        current = allItems[i];
        currentValue = ko.utils.unwrapObservable(current[propName]).toLowerCase();
        console.log(currentValue + " : " + matchValue);
        switch (type) {
            case "equals":
                if (currentValue === matchValue.toLowerCase())
                    matchingItems.push(current);
                break;
            case "startsWith":
                if (currentValue.indexOf(matchValue.toLowerCase()) == 0)
                    matchingItems.push(current);
                break;
            case "endsWith":
                if (currentValue.indexOf(matchValue.toLowerCase()) == currentValue.length - 1)
                    matchingItems.push(current);
                break;
            case "contains":
                if (currentValue.indexOf(matchValue.toLowerCase()) > -1)
                    matchingItems.push(current);
                break;
            default:
                break;
        }
    }

    return matchingItems;

}