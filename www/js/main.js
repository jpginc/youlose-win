var controller = (function() {
    var errorReportingLevel = 0;
    var isInitialized = false;
    var view;
    var localData;
    var pageLoader;
    var user;
    var ignoreClicks = false;

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
        isInitialized = true;

        log("initializing..", 1);
        localData = new LocalData();
        user = new User(publicMethods);
        view = new View(publicMethods);
        log("view done", 1);
        pageLoader = new PageLoader(publicMethods);
        log("page loader done", 1);
        pageLoader.loadPage("user", view.change);
        log("initializing done", 1);
        view.initLostBtn(pageLoader.lostBtn(user)).showBtn();
        return publicMethods;
    }

    function loadPage(toLoad) {
        view.loading();
        pageLoader.loadPage(toLoad, view.change);
        return publicMethods;
    }

    function navClick(event) {
        if(ignoreClicks) {
            log("ignoring a click", 1);
            return;
        }
        ignoreClicks = true;
        window.setTimeout(function() { ignoreClicks = false;}, 200);
        loadPage($(this).attr("data-link-to"));
    }

    function resume() {
        if(moreThan5Min(user.getLastLoss)) {
            view.showBtn();
        }
        return publicMethods;
    }

    function get(key) {
        return localData.get(key);
    }

    function save(key, value) {
        return localData.save(key, value);
    }

    function doLoss() {
        log("lose!", 1);
        view.pressBtn(user.getLastLoss());
        user.lose();
    }
    function getLastLoss() {
        return user.getLastLoss();
    }

    var publicMethods = {
        log: log,
        initialize: initialize,
        loadPage: loadPage,
        resume: resume,
        get: get,
        save: save,
        navClick: navClick,
        doLoss: doLoss,
        getLastLoss: getLastLoss
    };

    return publicMethods;
})();
function User(controller) {
    var data;

    this.loadData = function(toLoad) {
        data = toLoad ? $.parseJSON(toLoad) : newUser();
        if(data === "undefined") {
            controller.log("data is the string undefined. might be an error saving data", 9);
        } 
        return this;
    };

    function newUser() {
        return { lastLoss: undefined,
            lossHistory: ""
        };
    }

    this.initialize = function() {
        return this;
    };

    this.getLastLoss = function() {
        return data ? data.lastLoss : undefined;
    };
    this.lose = function() {
        if(data && data.lastLoss) {
            data.lossHistory = data.lossHistory ? 
                data.lossHistory + "," + data.lastLoss : data.lastLoss;
        }
        data.lastLoss = new Date().getTime();
        controller.save("user", this.toString());
        return this;
    };

    this.toString = function() { 
        return JSON.stringify(data);
    };

    this.loadData(controller.get("user"));
    return this;
}
function dayHourMinSec(date1, date2) {
    if(! isAnInt(date1) || ! isAnInt(date2)) {
        controller.log("date 1 or 2 isn't an int", 1);
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
    if(dhmsArray === undefined) {
        controller.log("htmls array is undeinfed)");
        return "You've never LOST!";
    }
    for(var i =0; i < 4; i++) {
        if(! isAnInt(dhmsArray[i])) {
            controller.log("invalid element in dhmsArray", 1);
            return "You've never LOST!";
        }
    }
    return dhmsArray[0] + "D : " + dhmsArray[1] + "H : " + dhmsArray[2] + "m : " + dhmsArray[3] + "s";
}
function getNiceTimeString(from) {
    return niceString(dayHourMinSec(new Date().getTime(), from));
}
function niceStringGetTime(string) {
    var array = string.split(":");
    var now = new Date().getTime();
    now -= parseInt(array[0]) * 24 * 60 * 60 * 1000;
    now -= parseInt(array[1]) * 60 * 60 * 1000;
    now -= parseInt(array[2]) * 60 * 1000;
    now -= parseInt(array[3]) * 1000;
    return now;
}
function View(controller) {
    var lostBtnHandle;
    var lostBtnTimerHandle;
    var intervalHandle;
    var myself = this;

    //a jquery dom object that is already inserted into the dom
    this.change = function(to) {
        $.mobile.loading("hide");
        controller.log("about to change!", 1);
        $.mobile.pageContainer.pagecontainer("change", to, {changeHash: false, transition: "none"});
        controller.log("changed", 1);
        return this;
    };

    this.pressBtn = function(lastLoss) {
        clearInterval(intervalHandle);
        lostBtnTimerHandle.html("do something cool!");
        setTimeout(function() {
            lostBtnHandle.popup("close");
        }, 2000);
/*
        var difference = (new Date().getTime()) - lastLoss;
        var step = Math.floor(difference / (1000/24));
        var timeCoundownInterval = setInterval(function() {
            timeCountdown(step);
        }, 1000/24);
*/
        return this;
    };

/*
        var difference = (new Date().getTime()) - lastLoss;
    function timeCountdown(step) {
        var div;
        console.log("counting down!");
        var countingDown = niceStringGetTime(div.html());
        countingDown -= step;
        var difference = new Date().getTime() - countingDown;
        if(difference < 0) {
            div.html(getNiceTimeString(new Date().getTime())).toggleClass("countdown", false);
            clearInterval(timeCoundownInterval);
        } else {
            div.html(getNiceTimeString(countingDown)).toggleClass("countDown");
        }
        return;
    }
*/

    this.initLostBtn = function(btn) {
        lostBtnHandle = btn;
        lostBtnTimerHandle = btn.find("#lossTimer");
        //initialise the popup
        btn.popup();

        //onclick
        btn.on("vclick", "#youLoseBtn", function() { 
            controller.doLoss();
            });

        //make it not draggable
        btn.on("dragstart", "#youLoseBtn", function() {return false;});

        btn.on("popupafteropen", function() {
            clearInterval(intervalHandle);
            intervalHandle = setInterval(function() {
                updateTimer();
            }, 1000);
        });
        btn.on("popupafterclose", function() {
            clearInterval(intervalHandle);
        });

        return this;
    };

    function updateTimer() {
        controller.log("timer is on" + getNiceTimeString(controller.getLastLoss()), 1);
        lostBtnTimerHandle.html(createElement("p",{},getNiceTimeString(controller.getLastLoss())));
        return;
    }


    this.showBtn = function(dismiss) {
        if(! lostBtnHandle) {
            initLostBtn();
        }
        var popupOptions = {
            dismissible: false,
            history: false,
            shadow: false,
        };
        var openOptions = {
            "position-to": "window",
            x: 0,
            y: 0,
        };

        if(lostBtnHandle === undefined) {
            controller.log("lostBtn undefined", 5);
            return this;
        }
        if(dismiss) {
            lostBtnHandle.popup("close");
        } else {
            setTimeout(function() { 
                myself.loading();
                setTimeout(function() {
                    lostBtnHandle.popup("option", popupOptions);
                    lostBtnHandle.popup("open", openOptions);
                    myself.loading(false);
                }, 500);
            }, 400);
        }
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
function PageLoader(conteroller) {
    testAppendContent();

    var body = $("body");
    var navbarHtml;
    var pages = {
        error: errorPage(),
        info: infoPage(),
    };

    //inserts the page to the dom (if required) and returns
    //the widget
    this.loadPage = function(toLoad, callback) {
        if(! pages[toLoad]) {
            controller.log("page not found!", 4);
            toLoad = "error";
        } 
        callback(insertToDom(toLoad));
        return this;
    };

    function insertToDom(page) {
        var domElement = document.getElementById(page + "Page");
        if(domElement === null) {
            controller.log("page not in dom yet, inserting...", 1);
            controller.log("html:" + pages[page].html(), 1);
            pages[page].on("vclick", ".navImg", controller.navClick);
            pages[page].on("dragstart", ".navImg", function() {return false;});
            $("body").append(pages[page]);
        }
        return pages[page];
    }

    function navbar() {
        if(navbarHtml) {
            return navbarHtml;
        }

        var fileType = ".png";
        var postfix = ') no-repeat scroll center center / auto 100% transparent;"';
        var prefix = "background:url(css/images/Button_";
        var buttons = ["info", "World", "Broadcast", "Friends", "More"];
        var footerOptions = {
            class: "footer",
            "data-position": "fixed",
            "data-id": "menu",
            "data-tap-toggle": false,
            "data-role": "footer"
        };
        var footer = createElement("div", footerOptions);
        var nav = createElement("div", {class: "navbar"}); //, "data-role": "navbar"});

        var imgOptions = {class:"navImg",style: "", "data-link-to": ""};
        var navHtml = "";

        //populate the nav bar with nav images
        if(useSvg()) {
            fileType = ".svg";
        } 
        for(var i = 0; i < buttons.length; i++) {
            var img;
            imgOptions.style = prefix + buttons[i] + fileType + postfix;
            imgOptions["data-link-to"] = buttons[i];
            navHtml += createElement("div", imgOptions);
        }
        nav = appendContent(nav, navHtml);
        footer = appendContent(footer, nav);
        controller.log("nav html: " + footer, 1);

        navbarHtml = footer;

        return footer;
    }
    
    function lossTimer(user) {
        var lossString = getNiceTimeString(user.getLastLoss());
        var pageOptions = {
            "data-role": "header",
            id: "lossTimer"
        };
        var contentOptions = {
            "data-role": "content",
            id: "errorPageContent"
        };

        var page  = createElement("div", pageOptions);
        var content  = createElement("p", {}, lossString);
        page = appendContent(page, content);
        return page;

    }

    //to do make this a dialog
    function errorPage(){
        controller.log("making error page", 3);
        var pageOptions = {
            "data-role": "page",
            id: "errorPage"
        };
        var contentOptions = {
            "data-role": "content",
            id: "errorPageContent"
        };

        var page = createElement("div", pageOptions);
        var contentDiv = createElement("div", contentOptions);
        var content  = createElement("h1", {}, "Error Loading Page!");
        contentDiv = appendContent(contentDiv, content );
        page = appendContent(page, [contentDiv, navbar()]);
        return $(page);
    }

    function infoPage() {
        var pageOptions = {
            "data-role": "page",
            id: "infoPage"
        };
        var contentOptions = {
            "data-role": "content",
            id:"infoPageContent"
        };
        var page = createElement("div", pageOptions);
        var contentDiv = createElement("div", contentOptions);
        var content  = createElement("h1", {}, 
                (useSvg() ? "svg's should work" : "info Bro!"));

        contentDiv = appendContent(contentDiv, content );
        page = appendContent(page, [contentDiv, navbar()]);
        return $(page);
    }

    this.lostBtn = function(user) {
        var jqueryTimerDiv;
        var pageOptions = {
            "data-role": "popup",
            id: "youLosePopup",
            "data-overlay-theme": "b"
        };

        var fileType = ".png";
        if(useSvg()) {
            fileType = ".svg";
        } 
        var postfix = ') no-repeat scroll center center / auto 100% transparent;"';
        var prefix = "background:url(css/images/Button_Lost";

        var imgOptions = {
            alt: "youLOST Button",
            id: "youLoseBtn",
            style: prefix + fileType + postfix
        };

        var popup = createElement("div", pageOptions);
        //var contentWrapper= createElement("div", {id: "btnShadow"});
        var content = createElement("div", imgOptions);
        //contentWrapper = appendContent(contentWrapper, content);
        popup = $(appendContent(popup, [lossTimer(user), content]));
        return popup;
    };

    function appendContent(existing, toAppend) {
        var regex = /<\/[^>]+>$/;
        var newStr = existing.replace(regex, function(match) {
            return arrayToOneString(toAppend) + match;
            });
        if(toAppend !== undefined && newStr === existing) {
            return existing + toAppend;
        }
        return newStr;
    }
    function testAppendContent() {
        var str1 = "<div><h1>please be here</h1>";
        var str2 = "hello";
        var str3 = appendContent(str1 + "</div>", str2); 
        if(str3 !== str1 + str2 + "</div>") {
            console.log("appendContent test failed");
        }
        return;
    }

    function arrayToOneString(array) {
        if(typeof array === "string") {
            return array;
        }
        var str = "";
        for(var i = 0; i < array.length; i++) {
            str += "" + array[i];
        }
        return str;
    }
    function useSvg() {
        return false;
        //return Modernizr.svg && ! navigator.userAgent.match(/Windows/); 
    }

    return this;
}
function createElement(type, options, content) {
    var element = "<" + type; 
    for(var key in options) {
        var obj = options[key];
        if(options.hasOwnProperty(key)) {
            element += " " + key + '="' + options[key] + '"';
        }
    }
    element += ">" + (content || "")  + "</" + type + ">";
    return element;
}

function moreThan5Min(time) {
    return new Date().getTime - time < 1000 * 50 * 5;
}
// will only work on mobile devices
controller.log("mobile startup", 1);
document.addEventListener("deviceready", controller.initialize, false);
document.addEventListener("resume", controller.resume, false);

function LocalData() {
    var loadAtStartup = ["user"]; 
    var allEntries = $.merge([], loadAtStartup);
    var savedData;

    this.initialize = function() {
        savedData = {};
        for(var i = 0; i < loadAtStartup.length; i++) {
            try {
                savedData[loadAtStartup[i]] =
                    $.parseJSON(window.localStorage.getItem(loadAtStartup[i]));
            } catch(err) {
                controller.log("error parsing json!", 8);
            }
        }
        return this;
    };

    this.get = function(key) {
        if(!savedData) {
                this.initialize();
            }
        controller.log("getting " +key, 1);
        controller.log("has " + savedData[key], 1);
        return savedData[key];
    };

    this.save = function(key, value) {
        if(!savedData) {
            this.initialize();
        }
        savedData[key] = value;
        window.localStorage.setItem(key, JSON.stringify(value));
        return this;
    };

    return this;
}
