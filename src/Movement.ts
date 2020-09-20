interface Translation{// Translation, unlike rotation, is global, not relative
    x: number,
    y: number
}

interface Rotation{
    angle: number
    // Note: ANGLE IS RELATIVE. Rotating 90 degrees then 90 again will take you to 180 degrees
}