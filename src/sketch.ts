

const blockSize = 600;


let robot: Robot;

let loadFile: any;
function setup() {

	document.addEventListener("keydown", keypressed);
	createCanvas(blockSize, blockSize);
	document.body.appendChild(document.createElement("br"));//document go brrrr

	robot = new Robot(blockSize);

	const setConfig = button("Set Config File", () => {
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
				exportToCode(JSON.parse(e.target.result.toString()), robot.path);
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


function downloadObjectAsJson(exportObj: any, exportName: string) {
	const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
	const downloadAnchorNode = document.createElement("a");
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", exportName + ".json");
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}


function button(html: string, onpress: any) {
	const button = document.createElement("button");
	button.innerHTML = html;
	button.addEventListener("click", onpress);

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
	code.push("public class CLASSNAME extends LinearOpMode");

	code = code.concat(declarations.split("\n"));

	code.push("@Override");
	code.push("public void runOpMode(){");
	code = code.concat(initializations.split("\n"));
	code.push("waitForStart();");

	if (blockingMovement) {
		for (const rawPoint of points.slice(1)) {
			const point = createVector(rawPoint.x - robot.positionOffset.x, rawPoint.y - robot.positionOffset.y);
			let output = movementFunction + "";
			output = output.split("$x").join(point.x.toString());
			output = output.split("$y").join(point.y.toString());
			code.push(output);
		}
	}
	else {
		console.log("Sorry, nonblocking movement is not currently supported");
	}

	code.push("}");
	code.push("}");


	console.log(code);
	return code;


}


