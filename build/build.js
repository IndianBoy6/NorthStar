class Robot {
    constructor(blockSize) {
        this.robotSize = 12;
        this.initPos = createVector(72, 72);
        this.position = createVector(72, 72);
        this.blockSize = blockSize;
        this.path = [];
        this.playingTrajectory = false;
        this.trajectoryStep = 0;
        this.oldPos = createVector(0, 0);
        this.positionOffset = createVector(0, 0);
        this.offsetSet = false;
    }
    setPositionText(element) {
        this.positionText = element;
    }
    setBlockSize(newBlockSize) {
        this.blockSize = newBlockSize;
    }
    show() {
        strokeWeight(1);
        rectMode(CENTER);
        fill(120, 120, 255);
        rect(this.posToScreen(this.position.x), this.posToScreen(this.position.y), this.posToScreen(this.robotSize), this.posToScreen(this.robotSize));
        fill(0, 0, 0);
        if (this.playingTrajectory) {
            this.renderTrajectory(this.path.slice(0, this.trajectoryStep + 1));
        }
        else {
            this.renderTrajectory(this.path);
            if (this.path.length > 0) {
                strokeWeight(2.5);
                line(this.posToScreen(this.position.x), this.posToScreen(this.position.y), this.posToScreen(this.path.slice(-1)[0].x), this.posToScreen(this.path.slice(-1)[0].y));
            }
        }
    }
    posToScreen(i) {
        return i * (this.blockSize / 144);
    }
    screenToPos(i) {
        return i * (144 / this.blockSize);
    }
    clipPos() {
        if (this.position.x > 144 - this.robotSize / 2)
            this.position.x = 144 - this.robotSize / 2;
        if (this.position.x < this.robotSize / 2)
            this.position.x = this.robotSize / 2;
        if (this.position.y > 144 - this.robotSize / 2)
            this.position.y = 144 - this.robotSize / 2;
        if (this.position.y < this.robotSize / 2)
            this.position.y = this.robotSize / 2;
    }
    move(x, y) {
        this.moveTo(this.position.x + x, this.position.y + y);
    }
    moveTo(x, y) {
        if (!this.playingTrajectory) {
            this.position.x = int(x);
            this.position.y = int(y);
            this.clipPos();
            this.updateText();
        }
    }
    setPoint() {
        if (!this.offsetSet) {
            this.positionOffset = createVector(this.position.x, this.position.y);
            this.offsetSet = true;
        }
        let lastPoint = undefined;
        if (this.path.length > 0) {
            lastPoint = this.path.slice(-1)[0];
        }
        else {
            lastPoint = createVector(-1, -1);
        }
        if (!(lastPoint.x == this.position.x && lastPoint.y == this.position.y)) {
            this.path.push(createVector(this.position.x, this.position.y));
        }
        this.updateText();
    }
    updateText() {
        this.positionText.innerText = (this.position.x - this.positionOffset.x) + ", " + (this.position.y - this.positionOffset.y);
    }
    renderTrajectory(trajectory) {
        for (let i = 0; i < trajectory.length - 1; i++) {
            const p1 = trajectory[i];
            const p2 = trajectory[i + 1];
            line(this.posToScreen(p1.x), this.posToScreen(p1.y), this.posToScreen(p2.x), this.posToScreen(p2.y));
        }
    }
    startTrajectory() {
        if (this.path.length > 0) {
            this.playingTrajectory = true;
            this.oldPos = this.position;
            this.position = this.path[this.trajectoryStep] || this.position;
            return true;
        }
        else {
            showSnackbar("No path to play back. Try creating some points first.");
            return false;
        }
    }
    stopTrajectory() {
        this.playingTrajectory = false;
        this.trajectoryStep = 0;
        this.position = this.oldPos;
    }
    stepTrajectoryForward() {
        if (this.trajectoryStep >= this.path.length - 1 || !this.playingTrajectory) {
            return;
        }
        this.trajectoryStep++;
        this.position = this.path[this.trajectoryStep];
    }
    stepTrajectoryBackward() {
        if (this.trajectoryStep <= 0 || !this.playingTrajectory) {
            return;
        }
        this.trajectoryStep--;
        this.position = this.path[this.trajectoryStep];
    }
}
let blockSize;
let robot;
let loadFile;
var positionText;
function setup() {
    blockSize = Math.min(window.innerHeight, window.innerWidth) * 0.9;
    positionText = document.getElementById("positionLabel");
    document.body.appendChild(positionText);
    document.addEventListener("keydown", keypressed);
    robot = new Robot(blockSize);
    robot.setPositionText(positionText);
    const setConfigButton = button("Set Config File", () => {
        loadFile = document.createElement("input");
        loadFile.type = "file";
        loadFile.click();
    });
    const playbackButton = button("Playback Trajectory", () => {
        if (robot.startTrajectory()) {
            stepForwardPlayback.style.display = "";
            stepBackwardPlayback.style.display = "";
            endPlayback.style.display = "";
        }
    });
    const stepForwardPlayback = button("Step Forward", () => { robot.stepTrajectoryForward(); });
    const stepBackwardPlayback = button("Step Backward", () => { robot.stepTrajectoryBackward(); });
    const endPlayback = button("Stop Playback", () => {
        robot.stopTrajectory();
        stepForwardPlayback.style.display = "none";
        stepBackwardPlayback.style.display = "none";
        endPlayback.style.display = "none";
    });
    loadFile = document.createElement("input");
    loadFile.display = "none";
    loadFile.type = "file";
    const exportButton = button("Export Trajectory", () => {
        if (loadFile.files.length > 0) {
            const fileReader = new FileReader();
            fileReader.onload = function (e) {
                const code = exportToCode(JSON.parse(e.target.result.toString()), robot.path);
                if (code != undefined) {
                    let fileName = prompt("What should the name of this file be?");
                    downloadCode(code.join("\n"), fileName);
                }
            };
            fileReader.readAsText(loadFile.files[0]);
        }
        else {
            showSnackbar("You have not selected a config file.<br>Press \"\Set Config File\"");
        }
    });
    stepForwardPlayback.style.display = "none";
    stepBackwardPlayback.style.display = "none";
    endPlayback.style.display = "none";
    loadFile = document.createElement("input");
    loadFile.style.display = "none";
    loadFile.type = "file";
    setConfigButton.style.width = (blockSize / 3).toString();
    playbackButton.style.width = (blockSize / 3).toString();
    exportButton.style.width = (blockSize / 3).toString();
    window.onresize = () => {
        blockSize = Math.min(window.innerHeight, window.innerWidth) * 0.6;
        resizeCanvas(blockSize, blockSize);
        robot.setBlockSize(blockSize);
        setConfigButton.style.width = (blockSize / 3).toString();
        playbackButton.style.width = (blockSize / 3).toString();
        exportButton.style.width = (blockSize / 3).toString();
    };
    document.getElementById("main").prepend(document.createElement("br"));
    createCanvas(blockSize, blockSize);
    document.getElementById("main").prepend(document.getElementById("defaultCanvas0"));
    document.getElementById("main").prepend(document.getElementById("positionLabel"));
}
function draw() {
    background(200);
    fill(0, 0, 0);
    robot.show();
}
function keypressed(e) {
    if (e.key == "w") {
        robot.move(0, -1);
    }
    if (e.key == "s") {
        robot.move(0, 1);
    }
    if (e.key == "a") {
        robot.move(-1, 0);
    }
    if (e.key == "d") {
        robot.move(1, 0);
    }
    if (e.key == " ") {
        e.preventDefault();
        robot.setPoint();
    }
    if (e.shiftKey) {
        robot.moveTo(robot.screenToPos(mouseX), robot.screenToPos(mouseY));
    }
}
function downloadCode(code, exportName) {
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(code);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
function button(html, onpress) {
    const button = document.createElement("button");
    button.innerHTML = html;
    button.addEventListener("click", onpress);
    document.getElementById("main").prepend(button);
    return button;
}
function exportToCode(config, points) {
    if (robot.path.length == 0) {
        showSnackbar("No path to export. Try creating some points first");
        return;
    }
    let valid = true;
    const imports = config["imports"];
    const declarations = config["declarations"];
    const initializations = config["inits"];
    const blockingMovement = config["blockingMovement"];
    const movementFunction = config["movementfunction"];
    const additionalFunctions = config["additionalfunctions"];
    const additionalClasses = config["additionalclasses"];
    if (imports == undefined || !Array.isArray(imports)) {
        showSnackbar("Error: The imports section of your config is missing/invalid");
        valid = false;
    }
    else if (declarations == undefined || !Array.isArray(declarations)) {
        showSnackbar("Error: The declarations section of your config is missing/invalid");
        valid = false;
    }
    else if (initializations == undefined || !Array.isArray(initializations)) {
        showSnackbar("Error: The initializations section of your config is missing/invalid");
        valid = false;
    }
    else if (blockingMovement == undefined || typeof blockingMovement != typeof true) {
        showSnackbar("Error: The blockingMovement section of your config is missing/invalid");
        valid = false;
    }
    else if (movementFunction == undefined || typeof movementFunction != "string") {
        showSnackbar("Error: The movementFunction section of your config is missing/invalid");
        valid = false;
    }
    else if (additionalFunctions == undefined || !Array.isArray(additionalFunctions)) {
        showSnackbar("Error: The additionalFunctions section of your config is missing/invalid");
        valid = false;
    }
    else if (additionalClasses == undefined || !Array.isArray(additionalClasses)) {
        showSnackbar("Error: The additionalClasses section of your config is missing/invalid");
        valid = false;
    }
    if (!valid) {
        return;
    }
    let code = [];
    code.push("package YOUR_PACKAGE;");
    code = code.concat(imports);
    code.push("@Autonomous");
    code.push("public class CLASSNAME extends LinearOpMode{");
    if (!blockingMovement) {
        let enumString = [];
        enumString.push("enum State{");
        for (let i = 0; i < points.length; i++) {
            let currentKey = "Point" + i;
            enumString.push(currentKey + ",");
        }
        enumString.push("Done");
        enumString.push("}");
        code = code.concat(enumString);
    }
    code = code.concat(declarations);
    code.push("@Override");
    code.push("public void runOpMode(){");
    if (!blockingMovement) {
        code.push("State currentState = State.Point1;");
    }
    code = code.concat(initializations);
    code.push("waitForStart();");
    if (blockingMovement) {
        for (const rawPoint of points.slice(1)) {
            const point = createVector(rawPoint.x - robot.positionOffset.x, rawPoint.y - robot.positionOffset.y);
            let evaluatedMovementFunction = movementFunction + "";
            evaluatedMovementFunction = evaluatedMovementFunction.split("$x").join(point.x.toString());
            evaluatedMovementFunction = evaluatedMovementFunction.split("$y").join(point.y.toString());
            code.push(evaluatedMovementFunction + ";");
        }
    }
    else {
        let replacedMovementFunction = movementFunction;
        code.push("while(opModeIsActive()){");
        code.push("switch(currentState){");
        for (let i = 1; i < points.length; i++) {
            let point = createVector(points[i].x, points[i].y);
            point.x -= robot.positionOffset.x;
            point.y -= robot.positionOffset.y;
            let formattedMovementFunction = movementFunction;
            formattedMovementFunction = formattedMovementFunction.split("$x").join(point.x.toString());
            formattedMovementFunction = formattedMovementFunction.split("$y").join(point.y.toString());
            code.push("case Point" + i + ":");
            code.push("if(" + formattedMovementFunction + ") {");
            if (i == points.length - 1) {
                code.push("currentState = State.Done;");
            }
            else {
                let nextIdx = i + 1;
                code.push("currentState = State.Point" + nextIdx + ";");
            }
            code.push("}");
            code.push("break;");
        }
        code.push("}");
        code.push("}");
    }
    code.push("}");
    code = code.concat(additionalFunctions);
    code.push("}");
    code = code.concat(additionalClasses);
    return code;
}
function showSnackbar(text) {
    let snackbar = document.getElementById("snackbar");
    snackbar.className = "show";
    snackbar.innerHTML = text;
    setTimeout(() => { snackbar.className = ""; }, 6000);
}
//# sourceMappingURL=../src/src/build.js.map