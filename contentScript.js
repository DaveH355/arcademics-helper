console.log("ClickIsTrusted: loading contentscript (and here is the debug link).");

function makeModifiersInteger(e) {
    let res = 0;
    if (e.getModifierState("Alt"))
        res += 1;
    if (e.getModifierState("Control"))
        res += 2;
    if (e.getModifierState("Meta"))
        res += 4;
    if (e.getModifierState("Shift"))
        res += 8;
    return res;
}

function convertMouseType(type) {
    if (type.startsWith("mousedown"))
        return "mousePressed";
    if (type.startsWith("mouseup"))
        return "mouseReleased";
    if (type.startsWith("mousemove"))
        return "mouseMoved";
    if (type.startsWith("wheel"))
        return "mouseWheel";
    throw new Error(`The ${type} event cannot be replicated by the ClickIsTrusted extension.`);
}

function convertButton(button) {
    if (button === 0)
        return "left";
    if (button === 1)
        return "middle";
    if (button === 2)
        return "right";
    if (button === 3)
        return "back";
    if (button === 4)
        return "forward";
}

function convertMouseEvent(e) {
    return {
        type: convertMouseType(e.type),
        modifiers: makeModifiersInteger(e),
        buttons: e.buttons,
        button: convertButton(e.button),
        x: e.clientX,
        y: e.clientY,
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        clickCount: 1, // needed to make composed `click` events
        // deltaMode: e.deltaMode, //isn't active in the interface.
        // timeStamp: e.timeStamp //todo include this one??
        // pointerType: "mouse" || "pen" //todo enable this one??
    };
}

function convertTouchType(type) {
    if (type.startsWith("touchstart"))
        return "touchStart";
    if (type.startsWith("touchmove"))
        return "touchMove";
    if (type.startsWith("touchend"))
        return "touchEnd";
    if (type.startsWith("touchcancel"))
        return "touchcancel";
    throw new Error(`The ${type} event cannot be replicated by the ClickIsTrusted extension.`);
}

//todo this is untested and probably doesn't work. see eventToObject.js
function convertTouchPoint(t) {
    return {
        x: t.clientX,
        y: t.clientY,
        radiusX: t.radiusX,
        radiusY: t.radiusY,
        rotationAngle: t.rotationAngle,
        force: t.force,
        id: t.identifier
    };
}

function convertTouchEvent(e) {
    return {
        type: convertTouchType(e.type),
        modifiers: makeModifiersInteger(e),
        touchPoints: e.touches.map(convertTouchPoint),
        // timeStamp: e.timeStamp //todo include this one??
    }
}

function convertKeyType(type) {
    if (type === "keydown-is-trusted")
        return "keyDown";
    if (type === "keyup-is-trusted")
        return "keyUp";
    if (type === "rawkeydown-is-trusted")
        return "rawKeyDown";
    if (type === "char-is-trusted")
        return "char";
    throw new Error(`The ${e.type} event cannot be replicated by the ClickIsTrusted extension.`);
}

function convertKeyEvent(e) {
    return {
        type: convertKeyType(e.type),
        modifiers: makeModifiersInteger(e),
        key: e.key,
        code: e.code,
        location: e.location,
        autoRepeat: e.repeat,

        text: e.text,
        keyIdentifier: e.keyIdentifier,
        unmodifiedText: e.unmodifiedText,
        isKeyPad: e.isKeyPad,
        isSystemKey: e.isSystemKey,
        nativeVirtualKeyCode: e.nativeVirtualKeyCode,
        windowsVirtualKeyCode: e.windowsVirtualKeyCode,

        // timeStamp: e.timeStamp //todo include this one??
    };
}

function convertInputEvent(e) {
    if (!e.type.startsWith("beforeinput"))
        throw new Error(`The ${e.type} event cannot be replicated by the ClickIsTrusted extension.`);
    return {
        type: e.type,
        text: e.data,
        // timeStamp: e.timeStamp //todo include this one??
    };
}

//att 1. calling chrome.runtime cannot be done from inside the event listener. (a different 'this' context?? don't know).
function sendMessage(e) {
    let message;
    if (e instanceof MouseEvent)
        message = convertMouseEvent(e);
    else if (e instanceof TouchEvent)
        message = convertTouchEvent(e);
    else if (e instanceof KeyboardEvent)
        message = convertKeyEvent(e);
    else if (e instanceof InputEvent)
        message = convertInputEvent(e);
    else
        throw new Error("a script has tried to send a bad message: ", e);
    console.log("Passing native event request to background.js: ", message);
    chrome.runtime.sendMessage(message);
}

function manInTheMiddle(event) {
    console.log("received native event request from web page:", event);
    event.stopImmediatePropagation();
    event.preventDefault();
    sendMessage(event);
}

window.addEventListener("mousedown-is-trusted", manInTheMiddle);
window.addEventListener("mousemove-is-trusted", manInTheMiddle);
window.addEventListener("mouseup-is-trusted", manInTheMiddle);
window.addEventListener("wheel-is-trusted", manInTheMiddle);
window.addEventListener("keydown-is-trusted", manInTheMiddle);
window.addEventListener("keyup-is-trusted", manInTheMiddle);
window.addEventListener("rawkeydown-is-trusted", manInTheMiddle);
window.addEventListener("char-is-trusted", manInTheMiddle);
window.addEventListener("beforeinput-is-trusted", manInTheMiddle);


//Arcademics Script Begin
let answers = {
    ANS_1: null,
    ANS_2: null,
    ANS_3: null,
    ANS_4: null
};

let question = null;
let num1 = null;
let num2 = null;
let answer = null;

let IFRAME = document.querySelector("#gameContainer > iframe").contentDocument;


const grandPrix = (childNum, textNum) => {
    return parseInt(IFRAME.querySelector(`#main > g > g > g:nth-child(3) > g:nth-child(4) > g:nth-child(${childNum}) > text:nth-child(${textNum})`).textContent);
}
const canoePuppies = (childNum, textNum) => {
    return parseInt(IFRAME.querySelector(`#main > g > g > g:nth-child(2) > g:nth-child(4) > g:nth-child(${childNum}) > text:nth-child(${textNum})`).textContent);
}
const tractor = (childNum, textNum) => {
    return parseInt(IFRAME.querySelector(`#main > g > g > g:nth-child(12) > g:nth-child(4) > g:nth-child(${childNum}) > text:nth-child(${textNum})`).textContent);
}
//TODO: code duplication
const dragDiv = (childNum, textNum) => {
    return parseInt(IFRAME.querySelector(`#main > g > g > g:nth-child(3) > g:nth-child(4) > g:nth-child(${childNum}) > text:nth-child(${textNum})`).textContent);
}
const duckyRace = (childNum, textNum) => {
    return parseInt(IFRAME.querySelector(`#main > g > g > g:nth-child(3) > g:nth-child(4) > g:nth-child(${childNum}) > text:nth-child(${textNum})`).textContent);
}


const dispatchEvent = (key, code) => {
    window.dispatchEvent(new KeyboardEvent("keydown-is-trusted", {
        bubbles: true,
        cancelable: true,
        key: key,
        code: code,
    }));
}

// Find out what the questions and answers are
function findQA() {
    let url = window.location.href;

    const matches = url.match(/games\/([^\/]+)/);
    const gamemode = matches[1];

    if (gamemode ===
        'canoe-puppies') {
        answers.ANS_4 = canoePuppies(5, 3)
        answers.ANS_3 = canoePuppies(4, 3)
        answers.ANS_2 = canoePuppies(3, 3)
        answers.ANS_1 = canoePuppies(2, 3)

        num1 = parseInt(IFRAME.querySelector("#main > g > g > g:nth-child(2) > g:nth-child(4) > g:nth-child(1) > g > text:nth-child(1)").textContent)
        num2 = parseInt(IFRAME.querySelector("#main > g > g > g:nth-child(2) > g:nth-child(4) > g:nth-child(1) > g > text:nth-child(2)").textContent)

        answer = num1 + num2;
    }
    if (gamemode === 'grand-prix') {
        answers.ANS_4 = grandPrix(5, 3);
        answers.ANS_3 = grandPrix(4, 3);
        answers.ANS_2 = grandPrix(3, 3);
        answers.ANS_1 = grandPrix(2, 3);

        let arr = IFRAME.querySelector("#main > g > g > g:nth-child(3) > g:nth-child(4) > g:nth-child(1) > text:nth-child(4)").textContent.split('×');
        num1 = parseInt(arr[0]);
        num2 = parseInt(arr[arr.length - 1]);

        answer = num1 * num2;
    }
    if (gamemode === "tractor-multiplication") {
        answers.ANS_4 = tractor(5, 3)
        answers.ANS_3 = tractor(4, 3)
        answers.ANS_2 = tractor(3, 3)
        answers.ANS_1 = tractor(2, 3)

        let arr = IFRAME.querySelector("#main > g > g > g:nth-child(12) > g:nth-child(4) > g:nth-child(1) > text:nth-child(4)").textContent.split('×');
        num1 = parseInt(arr[0]);
        num2 = parseInt(arr[arr.length - 1]);

        answer = num1 * num2;
    }
    //TODO: code duplication
    if (gamemode === 'drag-race') {
        answers.ANS_4 = dragDiv(5, 3)
        answers.ANS_3 = dragDiv(4, 3)
        answers.ANS_2 = dragDiv(3, 3)
        answers.ANS_1 = dragDiv(2, 3)

        let arr = IFRAME.querySelector("#main > g > g > g:nth-child(3) > g:nth-child(4) > g:nth-child(1) > text:nth-child(4)").textContent.split('÷');
        num1 = parseInt(arr[0]);
        num2 = parseInt(arr[arr.length - 1]);

        answer = num1 / num2;
    }
    //TODO: code duplication
    if (gamemode === 'ducky-race') {
        answers.ANS_4 = duckyRace(5, 3)
        answers.ANS_3 = duckyRace(4, 3)
        answers.ANS_2 = duckyRace(3, 3)
        answers.ANS_1 = duckyRace(2, 3)

        let arr = IFRAME.querySelector("#main > g > g > g:nth-child(3) > g:nth-child(4) > g:nth-child(1) > text:nth-child(4)").textContent.split('-');
        num1 = parseInt(arr[0]);
        num2 = parseInt(arr[arr.length - 1]);

        answer = num1 - num2;
    }

    for (let key in answers) {
        if (answer === answers[key]) {
            dispatchEvent(key.slice(-1), `Digit${key.slice(-1)}`);
        }
    }

    answers.ANS_1 = null;
    answers.ANS_2 = null;
    answers.ANS_3 = null;
    answers.ANS_4 = null;
    num1 = null;
    num2 = null;
    answer = null;
}

// Listen for user input
IFRAME.body.addEventListener("keypress", function onEvent(event) {
    if (event.key === "a") {
        findQA();
    }
});
