
class Robot {
	robotSize: number;
	initPos: p5.Vector;
	position: p5.Vector;
	blockSize: number;
	path: Array<p5.Vector>;
	playingTrajectory: boolean;
	trajectoryStep: number;
	oldPos: p5.Vector;
	offsetSet: boolean;

	positionOffset: p5.Vector;

	positionText: HTMLElement;

	constructor(blockSize: number) {
		this.robotSize = 12;
		this.initPos = createVector(72, 72);
		this.position = createVector(72, 72);
		this.blockSize = blockSize;

		this.path = []; // the trajectory the robot follows

		this.playingTrajectory = false;
		this.trajectoryStep = 0;

		this.oldPos = createVector(0, 0);

		this.positionOffset = createVector(0,0);
		this.offsetSet = false;
	}

	setPositionText(element: HTMLElement){
		this.positionText = element;
	}

	setBlockSize(newBlockSize: number): void {
		this.blockSize = newBlockSize;
	}

	show(): void {
		strokeWeight(1);
		rectMode(CENTER);
		fill(120, 120, 255);
		rect(
			this.posToScreen(this.position.x),
			this.posToScreen(this.position.y),
			this.posToScreen(this.robotSize),
			this.posToScreen(this.robotSize)
		);

		fill(0, 0, 0);


		if (this.playingTrajectory) {
			this.renderTrajectory(this.path.slice(0, this.trajectoryStep + 1));
		}
		else {
			this.renderTrajectory(this.path);

			if (this.path.length > 0) {
				strokeWeight(2.5);
				line(this.posToScreen(
					this.position.x),
					this.posToScreen(this.position.y),
					this.posToScreen(this.path.slice(-1)[0].x),
					this.posToScreen(this.path.slice(-1)[0].y)
				);
			}
		}



	}

	posToScreen(i: number): number {
		return i * (this.blockSize / 144);
	}
	screenToPos(i: number): number {
		return i * (144 / this.blockSize);
	}

	clipPos(): void {

		if (this.position.x > 144 - this.robotSize / 2) this.position.x = 144 - this.robotSize / 2;
		if (this.position.x < this.robotSize / 2) this.position.x = this.robotSize / 2;
		if (this.position.y > 144 - this.robotSize / 2) this.position.y = 144 - this.robotSize / 2;
		if (this.position.y < this.robotSize / 2) this.position.y = this.robotSize / 2;
	}

	move(x: number, y: number): void {
		this.moveTo(this.position.x + x, this.position.y + y);

	}

	moveTo(x: number, y: number): void {
		if (!this.playingTrajectory) {
			this.position.x = int(x);
			this.position.y = int(y);

			this.clipPos();
			this.updateText();
		}
	}

	setPoint(): void {
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

	updateText(){
		this.positionText.innerText = (this.position.x - this.positionOffset.x) + ", " + (this.position.y - this.positionOffset.y);
	}

	renderTrajectory(trajectory: Array<p5.Vector>): void {
		for (let i = 0; i < trajectory.length - 1; i++) {
			const p1 = trajectory[i];
			const p2 = trajectory[i + 1];
			line(this.posToScreen(p1.x), this.posToScreen(p1.y), this.posToScreen(p2.x), this.posToScreen(p2.y));
		}
	}

	startTrajectory(): boolean {
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
	stopTrajectory(): void {
		this.playingTrajectory = false;
		this.trajectoryStep = 0;
		this.position = this.oldPos;
	}

	stepTrajectoryForward(): void {
		if (this.trajectoryStep >= this.path.length - 1 || !this.playingTrajectory) {
			return;
		}
		this.trajectoryStep++;
		this.position = this.path[this.trajectoryStep];
	}
	stepTrajectoryBackward(): void {
		if (this.trajectoryStep <= 0 || !this.playingTrajectory) {
			return;
		}
		this.trajectoryStep--;
		this.position = this.path[this.trajectoryStep];
	}
}