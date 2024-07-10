// Configuration settings for the Phaser game
var config = {
  type: Phaser.AUTO, // Phaser will use WebGL if available, otherwise it will fall back to Canvas
  width: 800, // Width of the game canvas
  height: 600, // Height of the game canvas
  physics: {
    default: "arcade", // Use the Arcade Physics system
    arcade: {
      gravity: { y: 300 }, // Apply a vertical gravity of 300
      debug: false, // Disable the physics debugging
    },
  },
  scene: {
    preload: preload, // Preload assets
    create: create, // Create game objects
    update: update, // Update game logic
  },
};

// Variables for game objects and states
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

// Initialize the Phaser game with the configuration
var game = new Phaser.Game(config);

// Preload function to load assets before the game starts
function preload() {
  this.load.image("sky", "./assets/sky.png"); // Load background image
  this.load.image("ground", "./assets/platform.png"); // Load ground platform image
  this.load.image("star", "./assets/star.png"); // Load star image
  this.load.image("bomb", "./assets/bomb.png"); // Load bomb image
  this.load.spritesheet("dude", "./assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  }); // Load player sprite sheet
  console.log("loaded"); // Log to console when assets are loaded
}

// Create function to set up the game scene
function create() {
  // Add a background image
  this.add.image(400, 300, "sky");

  // Create a static group for platforms
  platforms = this.physics.add.staticGroup();

  // Create the ground platform and scale it to fit the width of the game
  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  // Create ledges (additional platforms)
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  // Create the player sprite and set its properties
  player = this.physics.add.sprite(100, 450, "dude");
  player.setBounce(0.2); // Add a slight bounce to the player
  player.setCollideWorldBounds(true); // Prevent the player from going out of bounds

  // Create player animations for left, turn, and right movements
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  // Enable keyboard input
  cursors = this.input.keyboard.createCursorKeys();

  // Create a group of stars to collect
  stars = this.physics.add.group({
    key: "star",
    repeat: 11, // Create 12 stars in total (repeat 11 times)
    setXY: { x: 12, y: 0, stepX: 70 }, // Position the stars along the x-axis
  });

  // Add a bounce effect to each star
  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  // Create a group for bombs
  bombs = this.physics.add.group();

  // Add score text to the game
  scoreText = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#000",
  });

  // Add collisions between player, stars, bombs, and platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  // Check for overlap between player and stars, call collectStar if they overlap
  this.physics.add.overlap(player, stars, collectStar, null, this);

  // Check for collision between player and bombs, call hitBomb if they collide
  this.physics.add.collider(player, bombs, hitBomb, null, this);
  console.log("created"); // Log to console when the create function is complete
}

// Update function to handle game logic
function update() {
  if (gameOver) {
    return; // Exit the function if the game is over
  }

  // Handle player movement based on keyboard input
  if (cursors.left.isDown) {
    player.setVelocityX(-160); // Move left
    player.anims.play("left", true); // Play left animation
  } else if (cursors.right.isDown) {
    player.setVelocityX(160); // Move right
    player.anims.play("right", true); // Play right animation
  } else {
    player.setVelocityX(0); // Stop moving
    player.anims.play("turn"); // Play turn animation
  }

  // Make the player jump if the up key is pressed and the player is touching the ground
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330); // Jump
  }
}

// Function to collect stars
function collectStar(player, star) {
  star.disableBody(true, true); // Disable the star

  // Add and update the score
  score += 10;
  scoreText.setText("Score: " + score);

  // If all stars are collected, create a new batch and add a bomb
  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true); // Re-enable the star
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, "bomb"); // Create a bomb
    bomb.setBounce(1); // Make the bomb bounce
    bomb.setCollideWorldBounds(true); // Prevent the bomb from going out of bounds
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20); // Set random velocity
    bomb.allowGravity = false; // Disable gravity for the bomb
  }

  console.log("updated"); // Log to console when stars are collected and updated
}

// Function to handle when the player hits a bomb
function hitBomb(player, bomb) {
  this.physics.pause(); // Pause the game

  player.setTint(0xff0000); // Change the player's color to red

  player.anims.play("turn"); // Play the turn animation

  gameOver = true; // Set game over to true
  console.log("game over"); // Log to console when the game is over
}
