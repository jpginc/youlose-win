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
        view.lostBtn(pageLoader.lostBtn(user)).showBtn();
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
        alert("resuming!");
        return publicMethods;
    }

    function get(key) {
        return localData.get(key);
    }

    function save(key, value) {
        return localData.save(key, value);
    }

    function doLoss(btn) {
        log("lose!", 1);
        user.lose();
        view.pressBtn(btn);
    }
    
    var publicMethods = {
        log: log,
        initialize: initialize,
        loadPage: loadPage,
        resume: resume,
        get: get,
        save: save,
        navClick: navClick,
        doLoss: doLoss
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
function View(controller) {
    var lostBtnHandle;
    var myself = this;

    //a jquery dom object that is already inserted into the dom
    this.change = function(to) {
        $.mobile.loading("hide");
        controller.log("about to change!", 1);
        $.mobile.pageContainer.pagecontainer("change", to, {changeHash: false, transition: "none"});
        controller.log("changed", 1);
        return this;
    };

    this.lostBtn = function(btn) {
        lostBtnHandle = btn;
        //initialise the popup;
        lostBtnHandle.popup();
        return this;
    };

    this.pressBtn = function(btn) {
        btn.find("#btnShadow").addClass("clicked");
        setTimeout(function() {
            btn.find("#btnShadow").removeClass("clicked");
            setTimeout(function() {
                btn.popup("close");
            }, 200);
        },200);
        return this;
    };

    this.showBtn = function(dismiss) {
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

        var postfix = '.png) no-repeat scroll center center / auto 100% transparent;"';
        var prefix = 'background:url(css/images/Button_';
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
            postfix = '.svg) no-repeat scroll center center / auto 100% transparent;"';
        } 
        for(var i = 0; i < buttons.length; i++) {
            var img;
            imgOptions.style = prefix + buttons[i] + postfix;
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
        var content  = createElement("h1", {}, lossString);
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
        var pageOptions = {
            "data-role": "popup",
            id: "youLosePopup",
            "data-overlay-theme": "b"
        };

        var imgOptions = {
            alt: "youLOST Button",
            src: "css/images/Button_Lost." + (Modernizr.svg ? "svg" : "png"),
            id: "youLoseBtn"
        };

        var popup = createElement("div", pageOptions);
        //var contentWrapper= createElement("div", {id: "btnShadow"});
        var content = createElement("img", imgOptions);
        //contentWrapper = appendContent(contentWrapper, content);
        popup = $(appendContent(popup, [lossTimer(user), content]));
        popup.popup();
        popup.on("vclick","img", function() { 
            controller.doLoss(popup);
            });
        popup.on("dragstart", "img", function() {return false;});
        return popup;
    };

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
        return Modernizr.svg && ! navigator.userAgent.match(/Windows/); 
    }

    return this;
}
function getDiv(id, dataRole) {
    return getElement("div", {id: id, "data-role": dataRole}); 
}

function getElement(type, attrs) {
    return $(document.createElement(type)).attr(attrs);
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
