const socket = new WebSocket(`ws://${window.location.hostname}:8765`);
socket.binaryType = "arraybuffer";

socket.addEventListener("open", () => {
    console.log("socket open");

    sendCommand(128);
    sendCommand(131);
});

socket.addEventListener("close", () => {
    console.log("socket closed");
});

socket.addEventListener("error", error => {
    console.log("socket error", error);
});

socket.addEventListener("message", message => {
    console.log("socket message", message);
});

function drive(velocity, turnRadius) {
    console.error("drive(", velocity, turnRadius, ")")
    const velocityUpper = (velocity >> 8) & 0xFF;
    const velocityLower = velocity & 0xFF;

    const turnRadiusUpper = (turnRadius >> 8) & 0xFF;
    const turnRadiusLower = turnRadius & 0xFF;

    sendCommand(0x89, velocityUpper, velocityLower, turnRadiusUpper, turnRadiusLower);
}

function stop() {
    sendCommand(0x80);
    sendCommand(131);
}

function sendCommand(...command) {
    socket.send(new Uint8Array(command));
}

document.getElementById("stop").addEventListener("click", () => {
    stop();
});

const joysvg = document.getElementById("joysvg");
const joycircle = joysvg.querySelector("circle");

let lastCommand = 0;

function joyUpdate(clientX, clientY) {
    const bounds = joysvg.getBoundingClientRect();

    const pointerX = 2 * (clientX - bounds.left) / (bounds.right - bounds.left) - 1;
    const pointerY = 2 * (clientY - bounds.top) / (bounds.bottom - bounds.top) - 1;

    if (pointerX < -1 || pointerX > 1) return;
    if (pointerY < -1 || pointerY > 1) return;

    const length = Math.sqrt(pointerX * pointerX + pointerY * pointerY);

    const normX = 0.5 * pointerX / length;
    const normY = 0.5 * pointerY / length;

    const joyX = Math.abs(normX) < Math.abs(pointerX) ? normX : pointerX;
    const joyY = Math.abs(normY) < Math.abs(pointerY) ? normY : pointerY; 

    joycircle.setAttribute("cx", `${joyX * 250 + 250}`);
    joycircle.setAttribute("cy", `${joyY * 250 + 250}`);

    const ctrlX = joyX * 2;
    const ctrlY = joyY * 2;

    if (Date.now() - lastCommand > 200) {
        lastCommand = Date.now();

        const speed = Math.sqrt(ctrlX * ctrlX + ctrlY * ctrlY);
        const velocity = ctrlY < 0 ? speed : -speed;

        const turnRadius = Math.ceil(500 * (1.0 - Math.abs(ctrlX)) + Math.abs(ctrlX)) * (ctrlX < 0 ? 1 : -1);

        drive(velocity * (Math.abs(ctrlX) * 500 + (1 - Math.abs(ctrlX)) * 500), ctrlY < 0 ? turnRadius : -turnRadius);
    }
}

function joyReset() {
    stop();
    joycircle.setAttribute("cx", `${250}`);
    joycircle.setAttribute("cy", `${250}`);
}

let lastTouch = 0;

joysvg.addEventListener("touchstart", ev => {
    lastTouch = Date.now();
    if (ev.changedTouches[0]) {
        joyUpdate(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);
    }
})

joysvg.addEventListener("touchmove", ev => {
    lastTouch = Date.now();
    if (ev.changedTouches[0]) {
        joyUpdate(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);
    }
});

joysvg.addEventListener("touchend", () => {
    lastTouch = Date.now();
    joyReset();
})

joysvg.addEventListener("mousedown", ev => {
    if (Date.now() - lastTouch >= 500 && ev.buttons & 1) {
        joyUpdate(ev.clientX, ev.clientY);
    }
})

joysvg.addEventListener("mousemove", ev => {
    if (Date.now() - lastTouch >= 500 && ev.buttons & 1) {
        joyUpdate(ev.clientX, ev.clientY);
    }
});

joysvg.addEventListener("mouseup", ev => {
    joyReset();
});

joysvg.addEventListener("mouseleave", ev => {
    joyReset();
});
