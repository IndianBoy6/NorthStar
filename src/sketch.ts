let blockSize: number;// the size(in pixels) of each inch


let robot: Robot;

let loadFile: any;// the object used to load filee from the client's file system

var positionText: HTMLElement;
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
		if (robot.startTrajectory()) {// returns true/false whether it should actually playback trajectory
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

	loadFile = <HTMLInputElement>document.createElement("input");
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
			showSnackbar("You have not selected a config file.<br>Press \"\Set Config File\"")
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

	//document.body.appendChild(document.getElementById("main"));

}
function draw(): void {
	background(200);

	fill(0, 0, 0);
	robot.show();



}


function keypressed(e: KeyboardEvent): void {
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


function downloadCode(code: any, exportName: string): void {
	const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(code);
	const downloadAnchorNode = document.createElement("a");
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", exportName);
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}


function button(html: string, onpress: any): HTMLElement {
	const button = document.createElement("button");
	button.innerHTML = html;
	button.addEventListener("click", onpress);
	//button.style.position = "relative";
	document.getElementById("main").prepend(button);
	return button;

}

function exportToCode(config: any, points: Array<p5.Vector>): Array<string> {

	if (robot.path.length == 0) {
		showSnackbar("No path to export. Try creating some points first");
		return;
	}

	let valid = true;

	const imports: Array<string> = config["imports"];
	const declarations: Array<string> = config["declarations"];
	const initializations: Array<string> = config["inits"];
	const blockingMovement: boolean = config["blockingMovement"];
	const movementFunction: string = config["movementfunction"];
	const additionalFunctions: Array<string> = config["additionalfunctions"];
	const additionalClasses: Array<string> = config["additionalclasses"];

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

	let code: Array<string> = [];

	code.push("package YOUR_PACKAGE;");
	code = code.concat(imports);
	code.push("@Autonomous");
	code.push("public class CLASSNAME extends LinearOpMode{");

	if (!blockingMovement) {
		let enumString: Array<string> = [];
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

	if (blockingMovement) {// if movement is blocking, we can just add move functions one after another
		for (const rawPoint of points.slice(1)) {
			const point = createVector(rawPoint.x - robot.positionOffset.x, rawPoint.y - robot.positionOffset.y);
			let evaluatedMovementFunction = movementFunction + "";
			evaluatedMovementFunction = evaluatedMovementFunction.split("$x").join(point.x.toString());
			evaluatedMovementFunction = evaluatedMovementFunction.split("$y").join(point.y.toString());
			code.push(evaluatedMovementFunction + ";");
		}
	}
	else {// if movement is not blocking, we have to use a state machine to maintain state.
		let replacedMovementFunction = movementFunction;

		code.push("while(opModeIsActive()){");


		code.push("switch(currentState){");
		for (let i = 1; i < points.length; i++) {
			let point: p5.Vector = createVector(points[i].x, points[i].y);
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
			// iterate to doneState
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

function showSnackbar(text: string) {
	let snackbar = document.getElementById("snackbar");
	snackbar.className = "show";
	snackbar.innerHTML = text;
	setTimeout(() => { snackbar.className = "" }, 6000);
}