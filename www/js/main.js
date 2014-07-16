var controller = (function() {
    var errorReportingLevel = 2;
    var isInitialized = false;
    var view;
    var localData;
    var pageLoader;
    var user;
    var ignoreClicks = false;

    //priority 10 is the highest, 1 is the lowes
    function log(toLog, priority) {
        if(errorReportingLevel < priority) {
            if(youLoseDevice === "web") {
                console.log(toLog);
            } else {
                alert(toLog);
            }
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
        getLocation(user.lose, user.lose);
    }
    function getLocation(successCallback, errorCallback) {
        var options = { 
            maximumAge: 3000, 
            timeout: 5000, 
            enableHighAccuracy: true 
        };
        if(navigator.geolocation) {
            var locationTimeoutFix = setTimeout(errorCallback, 7000);

            navigator.geolocation.getCurrentPosition(function(pos) {
                clearTimeout(locationTimeoutFix);
                successCallback(pos);
            }, function(error) {
                clearTimeout(locationTimeoutFix);
                errorCallback(error);
            });
        } else {
            errorCallback();
        }
    }

    function getLastLoss() {
        return user.getLastLoss();
    }
    function loadMapsAPI(success, fail) {
        return pageLoader.loadMapsAPI(success, fail);
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
        getLastLoss: getLastLoss,
        loadMapsAPI: loadMapsAPI

    };

    return publicMethods;
})();
function User(controller) {
    var data;
    var northPole = [90,90];
    var myself = this;

    this.loadData = function(toLoad) {
        try {
            data = toLoad ? $.parseJSON(toLoad) : newUser();
        } catch(err) {
                controller.log("error parsing user json!", 8);
                data = newUser();
        }
        if(data === "undefined") {
            controller.log("data is the string undefined. might be an error saving data", 8);
        } 
        return this;
    };

    function newUser() {
        return { lastLoss: undefined,
            lossHistory: { count: 0 }
        };
    }

    this.initialize = function() {
        return this;
    };

    this.getLastLoss = function() {
        return data ? data.lastLoss : undefined;
    };
    this.lose = function(latlng) {
        if(latlng && latlng.coords) {
            console.log("yeessssss" + latlng.coords.latidude);
            latlng = [latlng.coords.latitude, latlng.coords.latitude]; 
        } else {
            console.log("no latlng");
            latlng = northPole;
        }

        data.lastLoss = new Date().getTime();
        index = data.lossHistory.count++;
        data.lossHistory[index] = {time: data.lastLoss, location: latlng};
        controller.save("user", myself.toString());
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
    $(document).on("pagecontainerbeforeload", function(event, data) {
        event.preventDefault();
        data.deferred.reject(data.absUrl, data.options);
        
        var split = getToPage(data.url).split("-");
        if(split.length != 2) {
            controller.log("toPage format error: " + getToPage(data.url), 5);
        }
        var page = split[1];
        var database = split[2];
        var mapFunction = startMap;

        try {
            controller.loadPage("page-map");
            myself.loading("Loading Maps...");
            controller.loadMapsAPI(mapFunction, loadAPIError);
        } catch(err) {
            controller.log("loding gogole maps failed!", 9);
        }
    });

    function startMap() {
        var mapOptions = {
          center: new google.maps.LatLng(-34.397, 150.644),
          zoom: 8
        };
        var map = new google.maps.Map(document.getElementById("mapPageContent"), mapOptions);
    }

    function loadAPIError(reason) {
        controller.log("api load error", 4);
    }

    function getToPage(url) {
        return $.mobile.path.parseUrl(url).filename;
    }

    //a jquery dom object that is already inserted into the dom
    this.change = function(to, type) {
        var options = {
            changeHash: false,
        };
        switch(type) {
            case "page":
                options.transition = "none";
                break;
            case "menu":
                options.transition = "slideup";
                break;
            case "submenu":
                options.transition = "slide";
                break;
        }

        $.mobile.loading("hide");
        controller.log("about to change!", 1);
        $.mobile.pageContainer.pagecontainer("change", to, options);
        controller.log("changed", 1);
        return myself;
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
        return myself;
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

        return myself;
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
        updateTimer();
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
            return myself;
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
        return myself;
    };


    this.loading = function(message) {
        if(message === false) {
            $.mobile.loading("hide");
        } else {
            $.mobile.loading("show", {text: message});
        }
        return myself;
    };

    return this;
}
function PageLoader(conteroller) {
    var myself = this;
    var mapKey = "AIzaSyAoCSG9pGFlEtsgoz3XoHejO9-uODNLeG8";
    var body = $("body");
    var googleMapsScriptHandle;
    var navbarHtml;
    var pages = { 
        page: {
            error: errorPage(),
            user: infoPage(),
            map: mapPage(),
        },
        menu: {
            world: worldStats(),
        },
        submenu: {

        },
    };

    //inserts the page to the dom (if required) and returns
    //the widget
    this.loadPage = function(toLoad, callback) {
        var split = toLoad.split("-");
        var key = split[0];
        var value = split[1];

        if(! pages[key] || ! pages[key][value]) {
            controller.log("page not found!", 4);
            key = "page";
            value = "error";
        } 
        //pages[key][value] = insertToDom(pages[key][value], toLoad);
        //callback(pages[key][value]);
        callback(insertToDom(pages[key][value], toLoad), key);
        return myself;
    };

    function insertToDom(page, name) {
        var domElement = document.getElementById(name + "Page");
        if(domElement === null) {
            controller.log("page not in dom yet, inserting...", 1);
            controller.log("html:" + page.html());
            page.on("vclick", ".navImg", controller.navClick);
            //pages.page[page].on("dragstart", ".navImg", function() {return false;});
            $("body").append(page);
        }
        return page;
    }

    this.loadMapsAPI = function(success, fail) {
        if(typeof google !== "undefined" && typeof google.maps !== undefined) {
            //the api is already loaded
            success();
            return this;
        }

        insertToDom(pages.page.map, "map");

        //remove the previous handle. there will be a handle
        //if we tried to load the script once before but it timed out
        if(googleMapsScriptHandle) { 
            googleMapsScriptHandle.remove();
        }

        var url = "https://maps.googleapis.com/maps/api/js?key=" + mapKey + 
            "&callback=gmap_draw";
        var script = createElement("script", {src: url});
        var timeout = setTimeout(function() {fail("timout");}, 7000);
        window.gmap_draw = function(){
            clearTimeout(timeout);
            success();
        };
        googleMapsScriptHandle = $(body).append(script);  

        return this;
    };

    function mapPage(successCallback, errorCallback) {
        return $(getPage("mapPage", getContent("mapPageContent") + navbar()));
    }


    function worldStats() {
        var menuItems = {
            "Map" : "page-mapTest",
        };

        var page = getPage("worldPage", createElement("div", {class:"popupMenuOuterWrapper"},
                    createElement("div", {class:"popupMenuInnerWrapper"},
                        getHeader("worldPageHeader", "World Stats") +
                        getContent("worldPageContent", getList(menuItems)) + 
                        createElement("div", {class:"popupMenuNavBuffer"}) + 
                        navbar())));
        return $(page);
    }

    function getList(obj, type) {
        var list = createElement(type ? type : "ul", {"data-role":"listview"});
        var listItems = "";
        for(var key in obj) {
            var options = {
                "data-link-to": obj[key],
            };
            listItems += createElement("li", options, 
                    createElement('a', {href: obj[key]}, key));
        }
        list = appendContent(list, listItems);

        return list;
    }

    function getGeneric(role, id, content, otherOptions) {
        var options = {
            "data-role": role
        };
        if(id) {
            options.id = id;
        }
        if(typeof otherOptions === "object") {
            $.extend(options, otherOptions);
        }
        if(content === undefined) {
            content = "";
        }
        return createElement("div", options, content);
    }

    function getPage(id, content, otherOptions) {
        return getGeneric("page", id, content, otherOptions);
    }

    function getHeader(id, content, otherOptions) {
        if(content !== undefined) {
            content = createElement("h1", {}, content);
        }
        return getGeneric("header", id, content, otherOptions);
    }
    function getContent(id, content, otherOptions) {
        return getGeneric("content", id, content, otherOptions);
    }

    function navbar() {
        if(navbarHtml) {
            return navbarHtml;
        }

        var fileType = ".png";
        var postfix = ')"';
        var prefix = "background-image:url(css/images/Button_";
        var buttons = {
            "page-user": "Info",
            "menu-world": "World",
            "page-share": "Broadcast",
            "page-friends": "Friends",
            "menu-more": "More"
        };

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
        for(var key in buttons) {
            if(buttons.hasOwnProperty(key)) {
            var img;
            imgOptions.style = prefix + buttons[key] + fileType + postfix;
            imgOptions["data-link-to"] = key;
            navHtml += createElement("div", imgOptions);
            }
        }
        nav = appendContent(nav, navHtml);
        footer = appendContent(footer, nav);
        controller.log("nav html: " + footer, 1);

        navbarHtml = footer;

        return footer;
    }
    
    //to do make this a dialog
    function errorPage(){
        var page = getPage("errorPage",
                getHeader("errorPageHeader", "ERROR") +
                getContent("errorPageContent", "<p>Error Loading Page!" ) +
                navbar());
        return $(page);
    }

    function infoPage() {
        var page = getPage("infoPage",
                getHeader("infoPageHeader", "My Page") + 
                getContent("infoPageContent", "<p>This is where something will go</p>") +
                navbar());
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
        var postfix = ')"';
        var prefix = "background-image:url(css/images/Button_Lost";

        var imgOptions = {
            alt: "youLOST Button",
            id: "youLoseBtn",
            style: prefix + fileType + postfix
        };

        var popup = createElement("div", pageOptions);
        //var contentWrapper= createElement("div", {id: "btnShadow"});
        var content = createElement("div", imgOptions);
        //contentWrapper = appendContent(contentWrapper, content);
        popup = $(appendContent(popup, [getHeader("lossTimer"), content]));
        return popup;
    };

    function appendContent(existing, toAppend) {
        //the last closing brace 
        var regex = /<\/[^>]+>$/;
        var newStr = existing.replace(regex, function(match) {
            return arrayToOneString(toAppend) + match;
            });
        if(toAppend !== undefined && newStr === existing) {
            return existing + toAppend;
        }
        return newStr;
    }
/*
    function testAppendContent() {
        var str1 = "<div><h1>please be here</h1>";
        var str2 = "hello";
        var str3 = appendContent(str1 + "</div>", str2); 
        if(str3 !== str1 + str2 + "</div>") {
            console.log("appendContent test failed");
        }
        return;
    }
*/
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
var youLoseDevice = "mobile";
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
