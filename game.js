const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const flapSound = new Audio("jump.mp3"); // or "jump.wav" if it's in the root

// In setup
let bird = {
    x: 50,
    y: 150,
    width: 80,           // Visual size
    height: 80,
    hitboxWidth: 40,     // Collision box
    hitboxHeight: 40,
    gravity: 0.5,        // Slower fall
    velocity: 0,
    lift: -8             // Smoother jump
};





const landHeight = 0.01;

let pipes = [];
let score = 0;
let frameCount = 0;
let gameStarted = false;

const birdImg = new Image();
birdImg.src = "bird.png"; // or "bird.png" if it's in the root



function drawLand() {
    ctx.fillStyle = "#000000ff"; // brown land color
    ctx.fillRect(0, canvas.height - landHeight, canvas.width, landHeight);
    // makes the land shorter

}

function drawPipes() {
    ctx.fillStyle = "green"; // green pipe color
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
    });
}
function saveScore(score) {
    const username = localStorage.getItem('currentUser');
    if (!username) return;

    let scores = JSON.parse(localStorage.getItem('highScores')) || [];

    // Check if user already exists
    const existing = scores.find(entry => entry.username === username);

    if (existing) {
        // Update only if new score is higher
        if (score > existing.score) {
            existing.score = score;
        }
    } else {
        // Add new entry
        scores.push({ username, score });
    }

    // Save updated scores
    localStorage.setItem('highScores', JSON.stringify(scores));
}

function update() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
    }

    drawBird();

    pipes.forEach(pipe => pipe.x -= 2);
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    if (frameCount % 90 === 0) {
        const top = Math.random() * 200 + 50;
        const gap = 200;
        pipes.push({
            x: canvas.width,
            width: 50,
            top: top,
            bottom: canvas.height - top - gap
        });
    }

    drawPipes();

    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, 10, 30);

    pipes.forEach(pipe => {
        const hitboxX = bird.x + (bird.width - bird.hitboxWidth) / 2;
        const hitboxY = bird.y + (bird.height - bird.hitboxHeight) / 2;

        if (
            hitboxX < pipe.x + pipe.width &&
            hitboxX + bird.hitboxWidth > pipe.x &&
            (hitboxY < pipe.top || hitboxY + bird.hitboxHeight > canvas.height - pipe.bottom)
        ) {
            resetGame();
        }
    });

    if (pipes.length && pipes[0].x + pipes[0].width === bird.x) score++;

    frameCount++;
    requestAnimationFrame(update);


    if (bird.y + bird.height >= canvas.height - landHeight) {
        resetGame(); // Trigger game over
    }
}
function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);



}

const currentUser = localStorage.getItem('currentUser'); // already in your script



function resetGame() {
    updateHighScore(); // <-- Save before resetting score
    saveScore(score);  // <-- Save before resetting score

    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameStarted = false;
    ctx.fillStyle = "black";
    ctx.font = "36px Arial";
    ctx.fillText("Game Over! Click to restart", 5, canvas.height / 2);

    showLeaderboard(); // Refresh the leaderboard UI (if you have it)
}


function flap() {
    if (!gameStarted) {
        gameStarted = true;
        frameCount = 0;
        update();
    }
    bird.velocity = bird.lift;
    flapSound.currentTime = 0;
    flapSound.play();
}



function updateHighScore() {
    if (!currentUser) return;

    try {
        // Read existing scores
        const data = localStorage.getItem('highScores') || '[]';
        let scores = JSON.parse(data);

        const userScoreIndex = scores.findIndex(s => s.username === currentUser);
        if (userScoreIndex === -1) {
            scores.push({ username: currentUser, score: score });
        } else if (score > scores[userScoreIndex].score) {
            scores[userScoreIndex].score = score;
        }

        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10); // Keep only top 10 scores

        // Save to localStorage
        localStorage.setItem('highScores', JSON.stringify(scores));
    } catch (error) {
        console.error('Error updating high scores:', error);
    }
}




function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
canvas.addEventListener("mousedown", flap);
canvas.addEventListener("touchstart", flap);

// Spacebar to jump
document.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
        flap();
    }
});

ctx.fillStyle = "black";
ctx.font = "28px Arial";
ctx.fillText("Click to Start", 110, canvas.height / 2);


birdImg.onload = () => {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    ctx.fillStyle = "black";
    ctx.font = "28px Arial";
    ctx.fillText("Click to Start", 110, canvas.height / 2);
};

saveScore(currentScore);

