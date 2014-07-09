var controller = (function() {
    var errorReportingLevel = 0;
    var isInitialized = false;

    function errorLogging(toLog, priority) {
        if(priority === undefined || errorReportingLevel < priority) {
            console.log(toLog);
            return true
        }
        return false
    }

    function initialize() {
        if(isInitialized) {
            return;
        }
        isInitialized = true;
        var test1 = new Date();
        var test2 = new Date();
        alert(niceString(dayHourMinSec(test1.getTime(), test2.getTime() + 1234211)));
        return;
    }
    
    return {
        log: errorLogging,
        initialize: initialize
    };
})();

// will only work on mobile devices
document.addEventListener("deviceready", controller.initialize, false);
var youLoseUser = (function() {
    var data;
    var controller;

    function loadData(data) {
        data = data || newUser();
        return;
    }

    function newUser() {
        return; 
    }

    function initialize(controller) {
        controller = controller;
        loadData(controller.fetchData("user"));
        return; 
    }

    function getLastLoss(controller) {
        return data.lastLoss;
    }
    function newLoss() {
        data.lastLoss = new Date().getTime();
        return; 
    }

    function toString() {
        return data && JSON.stringify(data) || 
            controller && controller.log("error: user data is falsy");
    }

    return {
        initialize: initialize ,
        getLastLoss: getLastLoss,
        newLoss: newLoss
    };
})();
function dayHourMinSec(date1, date2) {
    if(! isAnInt(date1) || ! isAnInt(date2)) {
            return undefined;
    }
    // get total seconds between the times
    var delta = Math.abs(date1 - date2) / 1000;

    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    var seconds = parseInt(delta); 
    return [days, hours, minutes, seconds];
}
function isAnInt(number) {
    return !isNaN(number) && parseInt(Number(number)) == number;
}
function niceString(dhmsArray) {
    for(var i =0; i < 4; i++) {
        if(! isAnInt(dhmsArray[i])) {
            return undefined;
        }
    }
    return dhmsArray[0] + "D : " + dhmsArray[1] + "H : " + dhmsArray[2] + "m : " + dhmsArray[3] + "s";
}
