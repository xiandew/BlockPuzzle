import Phaser from './libs/phaser-full.min';

document.documentElement.appendChild = function () { };
document.documentElement.removeChild = function () { };

let systemInfo = wx.getSystemInfoSync();
let {windowWidth, windowHeight, pixelRatio} = systemInfo;

var config = {
    type: Phaser.CANVAS,
    canvas:canvas,
    width: windowWidth * pixelRatio,
    height: windowHeight * pixelRatio,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            fps: 100,
            gravity: { y: 300 }
        }
    },
    scene: {
        preload: preload,
        create: create
    }
};

new Phaser.Game(config);

function preload ()
{
    this.load.image('block', 'assets/block.png');
}

function create ()
{
    this.physics.world.checkCollision.up = false;

    var group = this.physics.add.group({
        key: 'block',
        frameQuantity: 6,
        bounceY: 0.5,
        dragY: 30,
        velocityY: 300,
        collideWorldBounds: true,
        setXY: { x: config.width / 2, y: 0, stepY: -200 }
    });

    group.children.iterate(function (block) {
        block.body.customSeparateY = true;
    });

    this.physics.add.collider(group, group, function (s1, s2) {
        var b1 = s1.body;
        var b2 = s2.body;

        if (b1.y > b2.y) {
            b2.y += (b1.top - b2.bottom);
            b2.stop();
        }
        else {
            b1.y += (b2.top - b1.bottom);
            b1.stop();
        }
    });
}
