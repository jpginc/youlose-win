var controller = (function() {
    var errorReportingLevel = 1;
    var isInitialized = false;
    var view;
    var pageLoader;

    //priority 10 is the highest, 1 is the lowes
    function log(toLog, priority) {
        if(errorReportingLevel < priority) {
            console.log(toLog);
        }
        return publicMethods;
    }

    function initialize() {
        if(isInitialized) {
            return false;
        }
        log("initializing..", 1);
        isInitialized = true;
        view = new View(this);
        log("view done", 1);
        pageLoader = new PageLoader();
        log("page loader done", 1);
        view.loading();
        pageLoader.loadPage("user", view.change);
        log("initializing done", 1);
        return publicMethods;
    }

    function loadPage(toLoad) {
        view.loading();
        pageLoader.loadPage(toLoad, view.change);
        return publicMethods;
    }

    function navClick(event) {
       loadPage($(this).attr("data-linkto"));
    }

    function resume() {
        alert("resuming!");
        return publicMethods;
    }

    function fetchData(key) {
    }

    function saveData(key) {
    }
    
    var publicMethods = {
        log: log,
        initialize: initialize,
        loadPage: loadPage,
        resume: resume,
        fetchData: fetchData,
        navClick: navClick
    };

    return publicMethods;
})();

if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    // will only work on mobile devices
    document.addEventListener("deviceready", controller.initialize, false);
    document.addEventListener("resume", controller.resume, false);
} else {
    //for desktop
    $(document).ready(controller.initialize);
}
var youLoseUser = (function() {
    var data;
    var controller;

    function loadData(data) {
        data = data || newUser();
        if(data === "undefined") {
                    controller.log("data is the string undefined. might be an error saving data", 9);
                }
        return publicMethods;
    }

    function newUser() {
        return {
            lastLoss: undefined,
            lossHistory: ""
        };
    }

    function initialize(controller) {
        controller = controller;
        loadData(controller.fetchData("user"));
        return publicMethods;
    }

    function getLastLoss() {
        return data.lastLoss;
    }
    function newLoss() {
        data.lastLoss = new Date().getTime();
        data.lossHistory += "," + data.lastLoss;
        return publicMethods;
    }

    function toString() {
        return JSON.stringify(data);
    }

    var publicMethods = {
        initialize: initialize ,
        getLastLoss: getLastLoss,
        newLoss: newLoss
    };

    return publicMethods;
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
    //a jquery dom object that is already inserted into the tree
    this.change = function(to) {
        $.mobile.loading("hide");
        controller.log("about to change!", 1);
        $.mobile.pageContainer.pagecontainer("change", to, {changeHash: false, transition: "slide"});
        controller.log("changed", 1);
        return this;
    };

    this.loading = function(off) {
        if(off === false) {
            $.mobile.loading("hide");
        } else {
            $.mobile.loading("show");
        }
        return this;
    };

    return this;
}
function PageLoader() {
    var body = $("body");
    var pages = {
        errorPage: errorPage(),
        Info: infoPage(),
    };


    //inserts the page to the dom (if required) and returns
    //the widget
    this.loadPage = function(toLoad, callback) {
        if(! pages[toLoad]) {
            controller.log("page not found!", 4);
            toLoad = "errorPage";
        } 
        insertToDom(pages[toLoad]);
        callback(pages[toLoad]);
        return this;
    };

    function insertToDom(page) {
        if(document.getElementById(page.attr("id")) === null) {
            controller.log("page not in dom yet, inserting...", 1);
            controller.log("html:" + page.html(), 1);
            $("body").append(page);
        }
        return;
    }

    function navBar() {
        var postfix = ".png";
        var prefix = "css/images/Button_";
        var buttons = ["Info", "World", "Broadcast", "Friends", "More"];
        var nav = getElement("div", {class: "navBar"}); //, "data-role": "navbar"});

        //populate the nav bar with nav images
        if(Modernizr.svg) {
            postfix = ".svg";
        } 
        for(var i = 0; i < buttons.length; i++) {
            var imgContainer = getElement('div', {class: "navImageContainer"});
            var img = getElement("img", {class: "navImage",
                src: prefix + buttons[i] + postfix,
                "data-linkto": buttons[i]});
            img.on("vmousedown", controller.navClick);
            imgContainer.append(img);
            nav.append(imgContainer);
        }
        controller.log("nav html: " + nav.html(), 1);

        //put the nav into a footer container
        var container = getElement("div", {class: "navContainer", "data-position": "fixed", 
            "data-id":"menu", "data-tap-toggle":false, "data-role":"footer"});
        container.append(nav);
        return container;
    }

    //to do make this a dialog
    function errorPage(){
        controller.log("making error page", 3);

        var page = getDiv("errorPage", "page");
        var content = getDiv("errorContent", "content");
        var text = document.createElement("h1").innerHTML = "Error Loading Page!";
        content.append(text);
        page.append([content, navBar()]);
        return page;
    }

    function infoPage() {
        var page = getDiv("infoPage", "page");
        var content = getDiv("infoPageContent", "content");
        var text = document.createElement("h1").innerHTML = "Info bro!";
        content.append(text);
        page.append([content, navBar()]);
        return page;
    }

    return this;
}
function getDiv(id, dataRole) {
    return getElement("div", {id: id, "data-role": dataRole}); 
}

function getElement(type, attrs) {
    return $(document.createElement(type)).attr(attrs);
}
localData = (function() {

})();
