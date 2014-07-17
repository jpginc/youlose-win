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
    return replaceClass("active", "", element);
}

function addClass(className, element) {
    return replaceClass("active", "active", element);
}

function replaceClass(className, newClassName, element) {
    if(element.className) {
        var regex = new RegExp(className, "g");
        element.className = element.className.replace(regex, "").trim() + " " + newClassName;
    }
}

/*
Copyright (c) 2014 The Financial Times Ltd.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
/*
 FastClick: polyfill to remove click delays on browsers with touch UIs.

 @version 1.0.2
 @codingstandard ftlabs-jsv2
 @copyright The Financial Times Limited [All Rights Reserved]
 @license MIT License (see LICENSE.txt)
*/
(function e$$0(h,l,c){function k(g,a){if(!l[g]){if(!h[g]){var b="function"==typeof require&&require;if(!a&&b)return b(g,!0);if(f)return f(g,!0);throw Error("Cannot find module '"+g+"'");}b=l[g]={exports:{}};h[g][0].call(b.exports,function(a){var b=h[g][1][a];return k(b?b:a)},b,b.exports,e$$0,h,l,c)}return l[g].exports}for(var f="function"==typeof require&&require,m=0;m<c.length;m++)k(c[m]);return k})({1:[function(n,h,l){function c(a,b){function d(a,b){return function(){return a.apply(b,arguments)}}
var e;b=b||{};this.trackingClick=!1;this.trackingClickStart=0;this.targetElement=null;this.lastTouchIdentifier=this.touchStartY=this.touchStartX=0;this.touchBoundary=b.touchBoundary||10;this.layer=a;this.tapDelay=b.tapDelay||200;if(!c.notNeeded(a)){for(var g="onMouse onClick onTouchStart onTouchMove onTouchEnd onTouchCancel".split(" "),f=0,h=g.length;f<h;f++)this[g[f]]=d(this[g[f]],this);k&&(a.addEventListener("mouseover",this.onMouse,!0),a.addEventListener("mousedown",this.onMouse,!0),a.addEventListener("mouseup",
this.onMouse,!0));a.addEventListener("click",this.onClick,!0);a.addEventListener("touchstart",this.onTouchStart,!1);a.addEventListener("touchmove",this.onTouchMove,!1);a.addEventListener("touchend",this.onTouchEnd,!1);a.addEventListener("touchcancel",this.onTouchCancel,!1);Event.prototype.stopImmediatePropagation||(a.removeEventListener=function(b,d,c){var e=Node.prototype.removeEventListener;"click"===b?e.call(a,b,d.hijacked||d,c):e.call(a,b,d,c)},a.addEventListener=function(b,d,c){var e=Node.prototype.addEventListener;
"click"===b?e.call(a,b,d.hijacked||(d.hijacked=function(a){a.propagationStopped||d(a)}),c):e.call(a,b,d,c)});"function"===typeof a.onclick&&(e=a.onclick,a.addEventListener("click",function(a){e(a)},!1),a.onclick=null)}}var k=0<navigator.userAgent.indexOf("Android"),f=/iP(ad|hone|od)/.test(navigator.userAgent),m=f&&/OS 4_\d(_\d)?/.test(navigator.userAgent),g=f&&/OS ([6-9]|\d{2})_\d/.test(navigator.userAgent);c.prototype.needsClick=function(a){switch(a.nodeName.toLowerCase()){case "button":case "select":case "textarea":if(a.disabled)return!0;
break;case "input":if(f&&"file"===a.type||a.disabled)return!0;break;case "label":case "video":return!0}return/\bneedsclick\b/.test(a.className)};c.prototype.needsFocus=function(a){switch(a.nodeName.toLowerCase()){case "textarea":return!0;case "select":return!k;case "input":switch(a.type){case "button":case "checkbox":case "file":case "image":case "radio":case "submit":return!1}return!a.disabled&&!a.readOnly;default:return/\bneedsfocus\b/.test(a.className)}};c.prototype.sendClick=function(a,b){var d,
c;document.activeElement&&document.activeElement!==a&&document.activeElement.blur();c=b.changedTouches[0];d=document.createEvent("MouseEvents");d.initMouseEvent(this.determineEventType(a),!0,!0,window,1,c.screenX,c.screenY,c.clientX,c.clientY,!1,!1,!1,!1,0,null);d.forwardedTouchEvent=!0;a.dispatchEvent(d)};c.prototype.determineEventType=function(a){return k&&"select"===a.tagName.toLowerCase()?"mousedown":"click"};c.prototype.focus=function(a){var b;f&&a.setSelectionRange&&0!==a.type.indexOf("date")&&
"time"!==a.type?(b=a.value.length,a.setSelectionRange(b,b)):a.focus()};c.prototype.updateScrollParent=function(a){var b,d;b=a.fastClickScrollParent;if(!b||!b.contains(a)){d=a;do{if(d.scrollHeight>d.offsetHeight){b=d;a.fastClickScrollParent=d;break}d=d.parentElement}while(d)}b&&(b.fastClickLastScrollTop=b.scrollTop)};c.prototype.getTargetElementFromEventTarget=function(a){return a.nodeType===Node.TEXT_NODE?a.parentNode:a};c.prototype.onTouchStart=function(a){var b,d,c;if(1<a.targetTouches.length)return!0;
b=this.getTargetElementFromEventTarget(a.target);d=a.targetTouches[0];if(f){c=window.getSelection();if(c.rangeCount&&!c.isCollapsed)return!0;if(!m){if(d.identifier===this.lastTouchIdentifier)return a.preventDefault(),!1;this.lastTouchIdentifier=d.identifier;this.updateScrollParent(b)}}this.trackingClick=!0;this.trackingClickStart=a.timeStamp;this.targetElement=b;this.touchStartX=d.pageX;this.touchStartY=d.pageY;a.timeStamp-this.lastClickTime<this.tapDelay&&a.preventDefault();return!0};c.prototype.touchHasMoved=
function(a){a=a.changedTouches[0];var b=this.touchBoundary;return Math.abs(a.pageX-this.touchStartX)>b||Math.abs(a.pageY-this.touchStartY)>b?!0:!1};c.prototype.onTouchMove=function(a){if(!this.trackingClick)return!0;if(this.targetElement!==this.getTargetElementFromEventTarget(a.target)||this.touchHasMoved(a))this.trackingClick=!1,this.targetElement=null;return!0};c.prototype.findControl=function(a){return void 0!==a.control?a.control:a.htmlFor?document.getElementById(a.htmlFor):a.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")};
c.prototype.onTouchEnd=function(a){var b,c,e=this.targetElement;if(!this.trackingClick)return!0;if(a.timeStamp-this.lastClickTime<this.tapDelay)return this.cancelNextClick=!0;this.cancelNextClick=!1;this.lastClickTime=a.timeStamp;b=this.trackingClickStart;this.trackingClick=!1;this.trackingClickStart=0;g&&(c=a.changedTouches[0],e=document.elementFromPoint(c.pageX-window.pageXOffset,c.pageY-window.pageYOffset)||e,e.fastClickScrollParent=this.targetElement.fastClickScrollParent);c=e.tagName.toLowerCase();
if("label"===c){if(b=this.findControl(e)){this.focus(e);if(k)return!1;e=b}}else if(this.needsFocus(e)){if(100<a.timeStamp-b||f&&window.top!==window&&"input"===c)return this.targetElement=null,!1;this.focus(e);this.sendClick(e,a);f&&"select"===c||(this.targetElement=null,a.preventDefault());return!1}if(f&&!m&&(b=e.fastClickScrollParent)&&b.fastClickLastScrollTop!==b.scrollTop)return!0;this.needsClick(e)||(a.preventDefault(),this.sendClick(e,a));return!1};c.prototype.onTouchCancel=function(){this.trackingClick=
!1;this.targetElement=null};c.prototype.onMouse=function(a){return this.targetElement&&!a.forwardedTouchEvent&&a.cancelable?!this.needsClick(this.targetElement)||this.cancelNextClick?(a.stopImmediatePropagation?a.stopImmediatePropagation():a.propagationStopped=!0,a.stopPropagation(),a.preventDefault(),!1):!0:!0};c.prototype.onClick=function(a){if(this.trackingClick)return this.targetElement=null,this.trackingClick=!1,!0;if("submit"===a.target.type&&0===a.detail)return!0;a=this.onMouse(a);a||(this.targetElement=
null);return a};c.prototype.destroy=function(){var a=this.layer;k&&(a.removeEventListener("mouseover",this.onMouse,!0),a.removeEventListener("mousedown",this.onMouse,!0),a.removeEventListener("mouseup",this.onMouse,!0));a.removeEventListener("click",this.onClick,!0);a.removeEventListener("touchstart",this.onTouchStart,!1);a.removeEventListener("touchmove",this.onTouchMove,!1);a.removeEventListener("touchend",this.onTouchEnd,!1);a.removeEventListener("touchcancel",this.onTouchCancel,!1)};c.notNeeded=
function(a){var b,c;if("undefined"===typeof window.ontouchstart)return!0;if(c=+(/Chrome\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1])if(k){if((b=document.querySelector("meta[name=viewport]"))&&(-1!==b.content.indexOf("user-scalable=no")||31<c&&document.documentElement.scrollWidth<=window.outerWidth))return!0}else return!0;return"none"===a.style.msTouchAction?!0:!1};c.attach=function(a,b){return new c(a,b)};"function"==typeof define&&"object"==typeof define.amd&&define.amd?define(function(){return c}):
"undefined"!==typeof h&&h.exports?(h.exports=c.attach,h.exports.FastClick=c):window.FastClick=c},{}],2:[function(n,h,l){n("./bower_components/fastclick/lib/fastclick.js")},{"./bower_components/fastclick/lib/fastclick.js":1}]},{},[2]);
/* Modernizr 2.8.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-svg
 */
;window.Modernizr=function(a,b,c){function u(a){i.cssText=a}function v(a,b){return u(prefixes.join(a+";")+(b||""))}function w(a,b){return typeof a===b}function x(a,b){return!!~(""+a).indexOf(b)}function y(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:w(f,"function")?f.bind(d||b):f}return!1}var d="2.8.3",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l={svg:"http://www.w3.org/2000/svg"},m={},n={},o={},p=[],q=p.slice,r,s={}.hasOwnProperty,t;!w(s,"undefined")&&!w(s.call,"undefined")?t=function(a,b){return s.call(a,b)}:t=function(a,b){return b in a&&w(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=q.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(q.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(q.call(arguments)))};return e}),m.svg=function(){return!!b.createElementNS&&!!b.createElementNS(l.svg,"svg").createSVGRect};for(var z in m)t(m,z)&&(r=z.toLowerCase(),e[r]=m[z](),p.push((e[r]?"":"no-")+r));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)t(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof enableClasses!="undefined"&&enableClasses&&(f.className+=" "+(b?"":"no-")+a),e[a]=b}return e},u(""),h=j=null,e._version=d,e}(this,this.document);
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

        activate(type, key);
        return myself;
    };

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
