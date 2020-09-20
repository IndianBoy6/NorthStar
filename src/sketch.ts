let blockSize: number;// the size(in pixels) of each inch


let robot: Robot;

let loadFile: any;// the object used to load file from the client's file system
function setup() {
	blockSize = Math.min(window.innerHeight, window.innerWidth) * 0.9;


	document.addEventListener("keydown", keypressed);
	createCanvas(blockSize, blockSize);
	document.body.appendChild(document.createElement("br"));

	robot = new Robot(blockSize);

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

	loadFile = document.createElement("input");
	loadFile.display = "none";
	loadFile.type = "file";

	const exportButton = button("Export Trajectory", () => {
		if (loadFile.files.length > 0) {
			const fileReader = new FileReader();
			fileReader.onload = function (e) {
				const code = exportToCode(JSON.parse(e.target.result.toString()), robot.path);
				let fileName = prompt("What should the name of this file be?");
				downloadCode(code.join("\n"), fileName);

			};
			fileReader.readAsText(loadFile.files[0]);
		}
		else {
			console.log("You haven't selected a config file. Press the \"Set Config File\" Button First.");
		}


	});


	stepForwardPlayback.style.display = "none";
	stepBackwardPlayback.style.display = "none";
	endPlayback.style.display = "none";

	loadFile = document.createElement("input");
	loadFile.style.display = "none";
	loadFile.type = "file";

	
	setConfigButton.style.width = "30%";
	playbackButton.style.width = "30%";
	exportButton.style.width = "30%";

	window.onresize = () => {
		blockSize = Math.min(window.innerHeight, window.innerWidth) * 0.9;
		resizeCanvas(blockSize, blockSize);
		robot.setBlockSize(blockSize);

	};


}
function draw() {
	background(200);

	fill(0, 0, 0);
	robot.show();



}


function keypressed(e: KeyboardEvent) {
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
		robot.setPoint();
	}

	if (e.shiftKey) {
		robot.moveTo(robot.screenToPos(mouseX), robot.screenToPos(mouseY));
	}


}


function downloadCode(code: any, exportName: string) {
	const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(code);
	const downloadAnchorNode = document.createElement("a");
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", exportName);
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}


function button(html: string, onpress: any) {
	const button = document.createElement("button");
	button.innerHTML = html;
	button.addEventListener("click", onpress);
	button.style.position = "relative";
	document.body.appendChild(button);
	return button;

}

function exportToCode(config: any, points: Array<p5.Vector>) {
	console.log(config);
	let valid = true;

	const imports: string = config["imports"];
	const declarations: string = config["declarations"];
	const initializations: string = config["inits"];
	const blockingMovement: boolean = config["blockingMovement"];
	const movementFunction: string = config["movementfunction"];

	if (imports == undefined || typeof imports != "string") {
		console.log("imports is missing or invalid");
		valid = false;
	}
	if (declarations == undefined || typeof declarations != "string") {
		console.log("declarations is missing or invalid");
		valid = false;
	}
	if (initializations == undefined || typeof initializations != "string") {
		console.log("initializations is missing or invalid");
		valid = false;
	}
	if (blockingMovement == undefined || typeof blockingMovement != typeof true) {
		console.log("blockingMovement is missing or invalid");
		valid = false;
	}
	if (movementFunction == undefined || typeof movementFunction != "string" || !movementFunction.includes("$x") || !movementFunction.includes("$y")) {
		console.log("movementFunction is missing or invalid");
		valid = false;
	}

	if (!valid) {
		console.log("invalid");
		return;
	}

	let code: Array<string> = [];

	code.push("package YOUR_PACKAGE;");
	code = code.concat(imports.split("\n"));
	code.push("@Autonomous");
	code.push("public class CLASSNAME extends LinearOpMode{");

	if (!blockingMovement) {
		let enumString: Array<string> = [];
		enumString.push("enum State{");
		for (let i = 1; i < points.length; i++) {
			let currentKey = "Point" + i;
			enumString.push(currentKey + ",");
		}
		enumString.push("Done");
		enumString.push("}");

		code = code.concat(enumString);
	}

	code = code.concat(declarations.split("\n"));

	code.push("@Override");
	code.push("public void runOpMode(){");

	if (!blockingMovement) {
		code.push("State currentState = State.Point0;");
	}

	code = code.concat(initializations.split("\n"));
	code.push("waitForStart();");

	if (blockingMovement) {// if movement is blocking, we can just add move functions one after another
		for (const rawPoint of points.slice(1)) {
			const point = createVector(rawPoint.x - robot.positionOffset.x, rawPoint.y - robot.positionOffset.y);
			let output = movementFunction + "";
			output = output.split("$x").join(point.x.toString());
			output = output.split("$y").join(point.y.toString());
			code.push(output);
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
				console.log(nextIdx);
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
	code.push("}");


	return code;


}


