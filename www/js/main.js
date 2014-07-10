var controller = (function() {
    var errorReportingLevel = 0;
    var isInitialized = false;
    var view = new View();
    var loading = false;

    function loadPage(event, data) {
        var page;
        var hash;

        if(loading) {
            view.abort();
        }

        if(typeof data.toPage === "string") { 
            log("to page: "  + data.toPage, 1);
            hash = $.mobile.path.parseUrl(data.toPage).hash.substring(1);
            event.preventDefault();

            if((page = document.getElementById(hash)) === null) {
                $.mobile.loading("show");
                view.getPage(hash, data, dataReady, loadingFailed);
            } else {
                dataReady($(page));
            }
        }
        return;
    }

    function dataReady(page) {
        $.mobile.loading("hide");
        loading = false;
        log(page.html());
        $.mobile.pageContainer.pagecontainer("change", page, {changeHash: false});
        return;
    }

    function loadingFailed(data, errorMessage) {
        $.mobile.loading("hide");
        alert(errorMessage);
        loading = false;
        return;
    }

    function log(toLog, priority) {
        if(priority === undefined || errorReportingLevel < priority) {
            console.log(toLog);
            return true;
        }
        return false;
    }

    function initialize() {
        if(isInitialized) {
            return;
        }
        isInitialized = true;
        $( document ).on( "pagecontainerbeforechange", loadPage);
        $.mobile.linkBindingEnabled = true;
        $.mobile.ajaxEnabled = true;

        var test1 = new Date();
        var test2 = new Date();
        //alert(niceString(dayHourMinSec(test1.getTime(), test2.getTime() + 1234211)));
        return;
    }
    
    return {
        log: log,
        initialize: initialize
    };
})();

if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    // will only work on mobile devices
    document.addEventListener("deviceready", controller.initialize, false);
} else {
    //for desktop
    $(document).ready(controller.initialize);
}
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
function View() {
    var menu;
    var menuItems = ["Me","Stats","Broadcast","Friends","More"];
    var menuIcons = ["user","cloud","audio","heart","plus"];
    
    function getPage(requestedPage, dataObject, successCallback, failCallback) {
        var newPage = getDiv(requestedPage, "page").append(
                getDiv(requestedPage, "content").append(getMenu()));
        $('body').append(newPage);
        successCallback(newPage);
        return newPage;
    }

    function getMenu() {
        var navbar;
        if(!menu) {
            menu = getDiv("menu", "footer").attr({"data-position":"fixed","data-id":"menu"}).append(
                    getDiv("navbar", "navbar").append(getUL));
        }
        return menu.clone();
    }

    function getUL() {
        var ul = $("<ul>");
        var li;
        for(var i = 0; i < menuItems.length; i++) {
            li = $("<li>");
            li.append($("<a>", {href: "#" +  menuItems[i],
                "data-icon": menuIcons[i], "data-role":"button"}));
            ul.append(li);
        }
        return ul;
    }

    function getDiv(id, dataRole) {
        return $("<div>", {id: id, "data-role": dataRole});
    }
    return {
        getPage: getPage,
        abort: true
    };
}
