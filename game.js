// the game itself
function openNav() {
    document.getElementById("mySidebar").style.width = "100%";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
}

function isNotEmpty(value) {
    return value.trim() !== ''
}

let namesList = []
const addButton = document.getElementById("add");
addButton.addEventListener("click", function() {
    let names = document.getElementById("names");
    namesList = names.value.split('\n').filter(isNotEmpty);
    let game = document.getElementsByTagName("canvas")
    if (game.length > 0) {
        game[0].remove();
    }
    startGame()
})
let game;

function randomHexCodeGenerator() {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return "0x" + n.slice(0, 6);
}

let myArray = [
    "Bruno",
    "Michael",
    "Roger",
    "Sebastian",
    "Bret"
]

const names = document.getElementById("names");

function buildSlices(){
    finalArray = []
    finalArray = namesList
    if (namesList.length === 0) {
        finalArray = myArray
    }
    let slices = []
    let degrees = 360 / finalArray.length
    for (i = 0; i < finalArray.length; i++) {
        slices.push(
            {
                degrees: degrees,
                startColor: randomHexCodeGenerator(),
                endColor: randomHexCodeGenerator(),
                rings: 100,
                iconFrame: 1,
                iconScale: 0.4,
                text: finalArray[i],
                sliceText: finalArray[i],
                sliceTextStyle: {
                    fontSize: 15,
                    color: "#000077"
                },
                sliceTextStroke: 0,
                sliceTextStrokeColor: "#ffffff" 
            }
        )
    }
    return slices;
}

function gameOptionsFn() {
    return {
        slices: buildSlices(),
        // wheel rotation duration range, in milliseconds
        rotationTimeRange: {
            min: 3000,
            max: 4500
        },
        // wheel rounds before it stops
        wheelRounds: {
            min: 2,
            max: 11
        },
        // degrees the wheel will rotate in the opposite direction before it stops
        backSpin: {
            min: 1,
            max: 4
        },
        // wheel radius, in pixels
        wheelRadius: 240,
        // color of stroke lines
        strokeColor: 0x000000,
        // width of stroke lines
        strokeWidth: 2
    }
}

function startGame() {
    // game configuration object
    let gameConfig = {
        // resolution and scale mode
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "spinning-wheel",
            width: 800,
            height: 800
        },
        // game background color
        backgroundColor: 0x000000,
        // scenes used by the game
        scene: [playGame]
    };

    // game constructor
    game = new Phaser.Game(gameConfig);

    // pure javascript to give focus to the page/frame
    window.focus()
}

// once the window loads...
window.onload = startGame



// PlayGame scene
class playGame extends Phaser.Scene{
    // constructor
    constructor() {
        super("PlayGame");
    }

    // method to be executed when the scene preloads
    preload() {
        this.load.image("pin", "pin.png");
    }

    // method to be executed once the scene has been created
    create() {
        // starting degrees
        let startDegrees = -90;
        // making a graphic object without adding it to the game
        let graphics = this.make.graphics({
            x: 0,
            y: 0,
            add: false
        });
        let gameOptions = gameOptionsFn()
        // adding a container to group wheel and icons
        this.wheelContainer = this.add.container(game.config.width / 2, game.config.height / 2);
        // array which will contain all icons
        let iconArray = [];
        // looping through each slice
        for(let i = 0; i < gameOptions.slices.length; i++){
            // converting colors from 0xRRGGBB format to Color objects
            let startColor = Phaser.Display.Color.ValueToColor(gameOptions.slices[i].startColor);
            let endColor = Phaser.Display.Color.ValueToColor(gameOptions.slices[i].endColor)
            for(let j = gameOptions.slices[i].rings; j > 0; j--){
                // interpolate colors
                let ringColor = Phaser.Display.Color.Interpolate.ColorWithColor(startColor,endColor, gameOptions.slices[i].rings, j);
                // converting the interpolated color to 0xRRGGBB format
                let ringColorString = Phaser.Display.Color.RGBToString(Math.round(ringColor.r), Math.round(ringColor.g), Math.round(ringColor.b), 0, "0x");
                // setting fill style
                graphics.fillStyle(ringColorString, 1);
                // drawing the slice
                graphics.slice(gameOptions.wheelRadius + gameOptions.strokeWidth, gameOptions.wheelRadius + gameOptions.strokeWidth, j * gameOptions.wheelRadius / gameOptions.slices[i].rings, Phaser.Math.DegToRad(startDegrees), Phaser.Math.DegToRad(startDegrees + gameOptions.slices[i].degrees), false);
                // filling the slice
                graphics.fillPath();
            }
            // setting line style
            graphics.lineStyle(gameOptions.strokeWidth, gameOptions.strokeColor, 1);
            // drawing the biggest slice
            graphics.slice(gameOptions.wheelRadius + gameOptions.strokeWidth, gameOptions.wheelRadius + gameOptions.strokeWidth, gameOptions.wheelRadius, Phaser.Math.DegToRad(startDegrees), Phaser.Math.DegToRad(startDegrees + gameOptions.slices[i].degrees), false);
            // stroking the slice
            graphics.strokePath();

            // add slice text, if any
            if(gameOptions.slices[i].sliceText != undefined){
                // the text
                let text = this.add.text(
                    gameOptions.wheelRadius * 0.75 * Math.cos(Phaser.Math.DegToRad(startDegrees + gameOptions.slices[i].degrees / 2)),
                    gameOptions.wheelRadius * 0.75 * Math.sin(Phaser.Math.DegToRad(startDegrees + gameOptions.slices[i].degrees / 2)),
                    gameOptions.slices[i].sliceText, gameOptions.slices[i].sliceTextStyle
                );
                // set text origin to its center
                text.setOrigin(0.5);
                // set text angle
                text.angle = startDegrees + gameOptions.slices[i].degrees / 2 + 90;
                // stroke text, if required
                if(gameOptions.slices[i].sliceTextStroke && gameOptions.slices[i].sliceTextStrokeColor){
                    text.setStroke(gameOptions.slices[i].sliceTextStrokeColor, gameOptions.slices[i].sliceTextStroke);
                }
                // add text to iconArray
                iconArray.push(text);
            }
            // updating degrees
            startDegrees += gameOptions.slices[i].degrees;
        }
        // generate a texture called "wheel" from graphics data
        graphics.generateTexture("wheel", (gameOptions.wheelRadius + gameOptions.strokeWidth) * 2, (gameOptions.wheelRadius + gameOptions.strokeWidth) * 2);
        // creating a sprite with wheel image as if it was a preloaded image
        let wheel = this.add.sprite(0, 0, "wheel");
        // adding the wheel to the container
        this.wheelContainer.add(wheel);
        // adding all iconArray items to the container
        this.wheelContainer.add(iconArray);
        // adding the pin in the middle of the canvas
        this.pin = this.add.sprite(game.config.width / 2, game.config.height / 2, "pin");
        // adding the text field
        this.prizeText = this.add.text(game.config.width / 2, game.config.height - 20, "Spin the wheel", {
            font: "bold 32px Arial",
            align: "center",
            color: "white"
        });
        // center the text
        this.prizeText.setOrigin(0.5);
        // the game has just started = we can spin the wheel
        this.canSpin = true;
        // waiting for your pin, then calling "spinWheel" function
        this.pin.setInteractive();
        this.pin.on("pointerdown", this.spinWheel, this)
        // this.input.on("pointerdown", this.spinWheel, this);
    }
    // function to spin the wheel
    spinWheel() {
        // can we spin the wheel?
        let gameOptions = gameOptionsFn()
        if(this.canSpin){
            // resetting text field
            this.prizeText.setText("");
            // the wheel will spin round for some times. This is just coreography
            let rounds = Phaser.Math.Between(gameOptions.wheelRounds.min, gameOptions.wheelRounds.max);
            // then will rotate by a random number from 0 to 360 degrees. This is the actual spin
            let degrees = Phaser.Math.Between(0, 360);
            // then will rotate back by a random amount of degrees
            let backDegrees = Phaser.Math.Between(gameOptions.backSpin.min, gameOptions.backSpin.max);
            // before the wheel ends spinning, we already know the prize
            let prizeDegree = 0;
            // looping through slices
            for(let i = gameOptions.slices.length - 1; i >= 0; i--){
                // adding current slice angle to prizeDegree
                prizeDegree += gameOptions.slices[i].degrees;
                // if it's greater than the random angle...
                if(prizeDegree > degrees - backDegrees){
                    // we found the prize
                    var prize = i;
                    break;
                }
            }
            // now the wheel cannot spin because it's already spinning
            this.canSpin = false;
            // animation tweeen for the spin: duration 3s, will rotate by (360 * rounds + degrees) degrees
            // the quadratic easing will simulate friction
            this.tweens.add({
                // adding the wheel container to tween targets
                targets: [this.wheelContainer],
                // angle destination
                angle: 360 * rounds + degrees,
                // tween duration
                duration: Phaser.Math.Between(gameOptions.rotationTimeRange.min, gameOptions.rotationTimeRange.max),
                // tween easing
                ease: "Cubic.easeOut",
                // callback scope
                callbackScope: this,
                // function to be executed once the tween has been completed
                onComplete: function(tween){
                    // another tween to rotate a bit in the opposite direction
                    this.tweens.add({
                        targets: [this.wheelContainer],
                        angle: this.wheelContainer.angle - backDegrees,
                        duration: Phaser.Math.Between(gameOptions.rotationTimeRange.min, gameOptions.rotationTimeRange.max) / 2,
                        ease: "Cubic.easeIn",
                        callbackScope: this,
                        onComplete: function(tween){
                            // displaying prize text
                            this.prizeText.setText(gameOptions.slices[prize].text);
                            // player can spin again
                            this.canSpin = true;
                        }
                    })
                }
            });
        }
    }
}
