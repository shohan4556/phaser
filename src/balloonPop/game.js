const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,

  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

// Variables for game objects and states
var ballonsList = [];
var letters = ["a", "b", "c", "d", "e"];

// -------------------------------------- Preload
function preload() {
  this.load.image("bg", "../../assets/ballonPop/bg.png");
  this.load.image("balloon", "../../assets/ballonPop/redBalloon.webp");
}

// -------------------------------------- Create
function create() {
  this.add.image(400, 300, "bg").setScale(2.4);

  // bar for letters
  const rect = new Phaser.Geom.Rectangle(200, 0, 400, 60);
  const letterBar = this.add.graphics({ fillStyle: { color: 0xff0008000 } });
  letterBar.fillRectShape(rect);
  letterBar.setDepth(20);

  // letters in letter bar
  for (let i = 0; i < letters.length; i++) {
    txtStyle = {
      fontSize: "32px",
      fill: "#ffffff",
    };
    this.add.text(240 + i * 70, 15, letters[i], txtStyle).setDepth(21);
  }

  //

  for (let i = 0; i < 7; i++) {
    // Generate random x and y positions
    var x = Phaser.Math.Between(0, 800);
    var y = Phaser.Math.Between(0, 600);

    const container = this.add.container(x, y);
    container.setSize(80, 150);

    const balloon = this.add.image(0, 0, "balloon").setDisplaySize(80, 150);
    balloon.setInteractive();
    balloon.setName('balloon_' + letters[i]);
    const textObj = this.add.text(0, -20, letters[i], txtStyle).setOrigin(0.5);

    container.add(balloon);
    container.add(textObj);
    container.setName('container_' + letters[i]);

    // remove balloon by click
    container.setInteractive(
      new Phaser.Geom.Circle(0, 0, 40),
      Phaser.Geom.Circle.Contains
    );

    balloon.on("pointerdown", (pt) => {
      console.log("Balloon clicked", container.name);
      container.destroy();
      // container.destroy();
    });

    // Store the container in the array
    ballonsList.push(container);
  }
}

// -------------------------------------- Update
function update() {
  // Move each balloon upwards
  ballonsList.forEach(function (container) {
    container.y -= 2;

    // Reset balloon position if it goes off the top of the screen
    if (container.y < 0) {
      container.y = 600;
      // Generate a new random x position
      container.x = Phaser.Math.Between(50, 750);
    }
  });
}
