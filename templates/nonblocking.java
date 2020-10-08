package YOUR_PACKAGE;

[imports]

public class CLASSNAME extends LinearOpMode {

    enum State {// Helps manage state when movement is non-blocking
        Point1, 
        Point2,
        // etc
        Done
    }

    [declarations]

    @Override
    public void runOpMode(){
        State currentState = State.Point1;
        [inits]
        waitForStart();
        while(opModeIsActive()){
            switch(currentState){
                case Point1:
                    if(robot.move(firstPoint)){
                    //robot.move should only return true if the robot is at that point's position
                        currentState = State.Point2;
                    }
                    break;
                case Point2:
                    if(robot.move(secondPoint)){
                        currentState = State.Done;
                    }
                    break;

            }
        }
    }

    [additionalfunctions]

}[additionalclasses]