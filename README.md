# NorthStar

A Simple GUI app to convert paths created into Java programs.<br>
Add: GIF of quick demonstration



## Table of Contents

- [Quickstart](#quickstart)
- [Inspiration](#inspirations)
- [Installation](#installation)
- [Configuration](#configuration)
- [User Interface](#user-interface)

## Quickstart
After installing and running NorthStar, you should see a relatively simple GUI. In the main window, you should see a top-down view of the FTC field, with your robot in the middle. Take a moment to look through through the [User Interface](#User-Interface) section. Now, starting creating a trajectory. After you're done, upload your [config](#configuration) file and export your trajectory. You should now have a java file containing code to drive the robot through the trajectory you created.

## Inspiration
As a programmer on my FTC team, I've realized FTC programming can be a lot of tedious work. In autonomous mode, specifically, a lot of the time is spent measuring distances, converting them to the right unit, and slowly filling them into your program. [RoadRunner](https://github.com/acmerobotics/road-runner), a motion planning library created by ACME Robotics, has a program to convert paths you create using their GUI into programs. However, it only supports RoadRunner, making it hard for teams not using RoadRunner to integrate this. My goal is to make it easier for any team to create autonomous programs with minimal overhead.

## Installation


```
Add Later
```

## Configuration
To convert your trajectory into java file, you'll need a `config.json` file. Use this example to create your own `config.json`
```json
{
    "imports": "import everything;",
    "declarations": "Robot robot;",
    "inits": "robot = new Robot(0,0);",
    "blockingMovement":true,
    "movementfunction":"robot.move($x, $y);"
}

```


## User Interface
### Keyboard
- <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> - Move Robot Forward, Left, Backwards, and Right
- <kbd>Shift</kbd> - Move Robot To Current Mouse Position
- <kbd>Space</kbd> - Add Robot's Current Position To The Trajectory
### Buttons
- Set Config File - This is Used To Set The Config File
- Playback Trajectory - This Is Used to step through your trajectory one point at a time
- Export Trajectory - After a Config File is set, you can export your trajectory into code.
<br/><br/><br/><br/>