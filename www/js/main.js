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
    return Math.abs(new Date().getTime - time) < (1000 * 50 * 5);
}

function extendObj() {
    var returnObj = {};
    for(var i = 0; i < arguments.length; i++) {
        if(typeof arguments[i] === "object") {
            for(var key in arguments[i]) {
                if(arguments[i].hasOwnProperty(key)) {
                    returnObj[key] = arguments[i][key];
                }
            }
        }
    }
    return returnObj;
}
function removeClass(className, element) {
    return replaceClass(className, "", element);
}

function addClass(className, element) {
    return replaceClass(className, className, element);
}

function replaceClass(className, newClassName, element) {
    if(element.className) {
        var regex = new RegExp(className, "g");
        element.className = element.className.replace(regex, "").trim() + " " + newClassName;
    }
}

try {
var controller = (function() {
    var errorReportingLevel = 3;
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
        if(youLoseDevice === "mobile") {
            StatusBar.hide();
            if(typeof FastClick !== "undefined") {
                log("FastClick attached!", 4);
                FastClick.attach(document.body);
            } else {
                log("FastClick failed!", 4);
            }
        }

        pageLoader = new PageLoader(publicMethods);
        localData = new LocalData();
        user = new User(publicMethods);
        view = new View(publicMethods, pageLoader.initialize());
        view.initialize();
        log("initializing done", 5);
        return publicMethods;
    }

    function getNode(pageType, key, parentNode) {
        return pageLoader.getNode(pageType, key, parentNode);
    }

    function navClick(event) {
        if(ignoreClicks) {
            log("ignoring a click", 1);
            return;
        }
        ignoreClicks = true;
        window.setTimeout(function() { ignoreClicks = false;}, 200);
        getNode(this.getAttribute("data-link-to"));
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
        getNode: getNode,
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
} catch (err) {
    alert("script crash! " + err);

}
function PageLoader(conteroller) {
    var myself = this;
    var mapKey = "AIzaSyAoCSG9pGFlEtsgoz3XoHejO9-uODNLeG8";
    var googleMapsScriptHandle;
    var appContainer = document.getElementById("appContainer");
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
        widget: {
            footer: navbar(),
            loading: loading(),
        },
        popup: {
            lostBtn: lostBtn(),
        }
    };

    //load all the divs into the dom
    //return a collection of node's
    this.initialize = function() {
        for(var type in pages) {
            for(var key in pages[type]) {
                pages[type][key] = insertToDom(pages[type][key], type, key,  document.body);
            }
        }
        return pages;
    };

    this.getNode = function(pageType, key, parentNode) {
        if(parentNode === undefined) {
            parentNode = appContainer;
        }
        if(pages[pageType] === undefined || pages[pageType][key] === undefined) {
            controller.log("page not found!", 4);
            pageType = "page";
            key = "error";
        }
        var page = pages[pageType][key];
        if(typeof page === "string") {
            controller.log("page not in dom yet, inserting...", 1);
            controller.log("html:" + page.html);
            page = insertToDom(page, pageType, key , parentNode);
        }
        return page.node;
    };

    function insertToDom(pageObj, className, id, appendTo) {
        var div = document.createElement("div");
        div.innerHTML = pageObj;
        div.id = id + "-wrapper";
        div.className = className + "-wrapper";
        return appendTo.appendChild(div);
    }

    this.loadMapsAPI = function(success, fail) {
        if(typeof google !== "undefined" && typeof google.maps !== undefined) {
            //the api is already loaded
            success();
            return this;
        }

        //remove the previous handle. there will be a handle
        //if we tried to load the script once before but it timed out
        if(googleMapsScriptHandle) { 
            document.body.removeChild(googleMapsScriptHandle);
        }

        var url = "https://maps.googleapis.com/maps/api/js?key=" + mapKey + 
            "&callback=gmap_draw";
        var script = createElement("script", {src: url});
        var timeout = setTimeout(function() {fail("timout");}, 7000);
        window.gmap_draw = function(){
            clearTimeout(timeout);
            success();
        };
        googleMapsScriptHandle = document.body.appendChild(script);  

        return this;
    };


    function mapPage(successCallback, errorCallback) {
        var options = {
            id: "mapPage",
            class: "page",
        };
        var page = getPage(options, getContent("mapPageContent")); 
        return page;
    }


    function worldStats() {
        var menuItems = {
            "Map" : "page-mapTest",
        };
        var options = {
            id: "worldPage",
            class: "page"
        };
        var page = getPage(options, createElement("div", {class:"popupMenuOuterWrapper"},
                    createElement("div", {class:"popupMenuInnerWrapper"},
                        getHeader("worldPageHeader", "World Stats") +
                        getContent("worldPageContent", getList(menuItems)) + 
                        createElement("div", {class:"popupMenuNavBuffer"}))));
        return page;
    }


    function getList(obj, type) {
        var list = createElement(type ? type : "ul", {class:"listview"});
        var listItems = "";
        for(var key in obj) {
            var options = {
                "data-link-to": obj[key],
            };
            listItems += createElement("li", options, key);
        }
        list = appendContent(list, listItems);

        return list;
    }

    function getGeneric(role, id, content, otherOptions) {
        var options = {
            class: role
        };
        if(id) {
            options.id = id;
        }
        if(typeof otherOptions === "object") {
            options = extendObj(options, otherOptions);
        }
        if(content === undefined) {
            content = "";
        }
        return createElement("div", options, content);
    }

    function getPage(id, content, otherOptions) {
        return getGeneric(id.class, id.id, content, otherOptions);
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
        var prefix = 'background-image:url(css/images/Button_';
        var postfix = '.png)';
        var buttons = {
            "page-user": "Info",
            "menu-world": "World",
            "page-share": "Broadcast",
            "page-friends": "Friends",
            "menu-more": "More"
        };

        var options = {
            id:"footer",
            class: "footer",
        };
        var footer = createElement("div", options);
        var nav = createElement("div", {class: "navbar"}); 

        var imgOptions = {class:"navImg",style: "", "data-link-to": ""};
        var navHtml = "";

        //populate the nav bar with nav images
        for(var key in buttons) {
            if(buttons.hasOwnProperty(key)) {
            var img;
            imgOptions.style = prefix + buttons[key] + postfix;
            imgOptions["data-link-to"] = key;
            imgOptions.id = buttons[key] + "-btn";
            navHtml += createElement("div", imgOptions);
            }
        }
        nav = appendContent(nav, navHtml);
        footer = appendContent(footer, nav);
        controller.log("nav html: " + footer, 1);
        return footer;
    }
    
    //to do make this a dialog
    function errorPage(){
        var options = {
            id: "errorPage",
            class: "page",
        };

        var page = getPage(options,
                getHeader("errorPageHeader", "ERROR") +
                getContent("errorPageContent", "<p>Error Loading Page!" ));
        return page;
    }

    function infoPage() {
        var options = {
            id : "infoPage",
            class : "page",
        };
        var page = getPage(options,
                getHeader("infoPageHeader", "My Page") + 
                getContent("infoPageContent", "<p>This is where something will go</p>"));
        return page;
    }
    function loading() {
        var pageOptions = {
            class: "widget",
            id: "loadingWiget",
        };
        var popup = createElement("div", pageOptions,
                createElement('p', {}, "Loading"));
        return popup;
    }

    function lostBtn(user) {
        var pageOptions = {
            class: "popup",
            id: "youLosePopup",
        };

        var imgOptions = {
            alt: "youLOST Button",
            id: "youLoseBtn",
            style: 'background-image:url(css/images/Button_Lost.png)',
        };

        var popup = createElement("div", pageOptions);
        //var contentWrapper= createElement("div", {id: "btnShadow"});
        var content = createElement("div", imgOptions);
        var timer = createElement("div",{id:"lossTimer"});
        //contentWrapper = appendContent(contentWrapper, content);
        popup = appendContent(popup, [timer, content]);
        return popup;
    }

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
function User(controller) {
    var data;
    var northPole = [90,90];
    var myself = this;

    this.loadData = function(toLoad) {
        try {
            data = toLoad ? JSON.parse(toLoad.trim()) : newUser();
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
function View(controller, pages) {
    var active = {
        page: null,
        popup: null,
        menu: null,
    };
    var timers = {
        lostTimer : {interval:1000, callback:timerUpdator},
        loading : {interval:333, callback:loadingUpdator}
    };
    var selectedBtn;
    var myself = this;

    function startMap() {
        var mapOptions = {
          center: new google.maps.LatLng(-34.397, 150.644),
          zoom: 8
        };
        var map = new google.maps.Map(document.getElementById("mapPageContent"), mapOptions);
    }

    function loadAPIError(reason) {
        controller.log("api load error" + reason, 4);
    }

    //change pages
    this.changeEvent = function() {
        controller.log("about to change!", 5);

        var name = this.getAttribute("data-link-to");
        name = name.split("-");
        var type = name[0];
        var key = name[1];
        selectBtn(this);

        activate(type, key);
        return myself;
    };

    function selectBtn(btn) {
        if(selectedBtn) {
            removeClass("selected", selectedBtn);
        }
        selectedBtn = btn;
        addClass("selected", btn);
    }

    this.changeTo = function(type, key) {
        activate(type, key);
    };


    this.pressBtn = function(lastLoss) {
        stopTimer(timers.lostTimer);

        lostTimerText("do something cool!");
        setTimeout(function() {
            deactivate("popup");
            activate("page", "user");
        }, 2000);

        return myself;
    };

    this.initialize= function() {
        myself.changeTo("page", "user");

        //add event handlers
        document.getElementById("youLoseBtn").onclick = function() { 
            controller.doLoss();
        };
        var navbarBtns = document.getElementsByClassName("navImg");
        for(var i = 0; i < navbarBtns.length; i++) {
            navbarBtns[i].onclick = myself.changeEvent;
        }

        myself.showBtn();
        return myself;
    };

    this.showBtn = function(dismiss) {
        startTimer(timers.lostTimer);
        activate("popup", "lostBtn");
        return myself;
    };

    function lostTimerText(text) {
        var timer = document.getElementById("lossTimer");
        timer.innerHTML = createElement('h1', {}, text);
    }

    function deactivate(type) {
        if(active[type]) {
            controller.log("i am deactivting!", 4);
            active[type].style.display = "none";
        }
        active[type] = null;
    }
    function activate(type, key) {
        switch(type) {
            case "page": 
                deactivate("popup");
                deactivate("menu");
                break;
            case "menu":
                if(active.menu === pages[type][key]) {
                    deactivate("menu");
                return;
                }
        }
        if(pages[type] === undefined || pages[type][key] === undefined) {
            console.log("page doesnt exist error page");
            type = "page";
            key = "error";
        }

        if(active[type] && active[type] !== pages[type][key]) {
            deactivate(type);
        }

        active[type] = pages[type][key];
        active[type].style.display = "block";
    }
    function startTimer(timerObj) {
        if(timerObj.timer) { 
            stopTimer(timerObj);
        }
        timerObj.timer = setInterval(timerObj.callback.bind(timerObj), timerObj.interval);
    }

    function stopTimer(timerObj) {
        if(timerObj.timer !== undefined) {
            try {
                clearInterval(timerObj.timer);
            } catch(err) {
                console.log("invalid timer value!", 2);
            }
        }
        timerObj.timer = undefined;
    }

    function timerUpdator() {
        controller.log("timer is on" + getNiceTimeString(controller.getLastLoss()), 1);
        lostTimerText(getNiceTimeString(controller.getLastLoss())); 
        return;
    }

    function loadingUpdator() {
        controller.log("loading timer is on", 1);
        var loadingNode = pages.widget.loading;
        loadingNode.innerHTML = loadingNode.innerHTML.replace("....") + ".";
    }

    this.loading = function(onOrOff) {
        if(onOrOff === false) {
            deactivate("widget");
            stopTimer(timers.loading);
        } else {
            activate("widget", "loading");
            startTimer(timers.loading);
        }
        return myself;
    };

    function getILostPopupNode() {
        return controller.getNode("popup", "lostBtn");
    }

    function getLoadingNode() {
        return controller.getNode("widget", "loading");
    }
    return this;
}
