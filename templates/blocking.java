package YOUR_PACKAGE;

[imports]

public class CLASSNAME extends LinearOpMode {
    [declarations]

    @Override
    public void runOpMode(){
        [inits]
        waitForStart();
        robot.move(firstPoint);
        robot.move(secondPoint);
        //etc
    }

    [additionalfunctions]

}
[additionalclasses]