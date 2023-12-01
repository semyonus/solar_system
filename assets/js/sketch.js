const SCALE_RADIUS      = 1 / 100000;
const SCALE_INCREASE    = 0.1;
const SCALE_MIN         = 0.1;
const SCALE_MAX         = 5.0;
const SCALE_MAJOR_AXIS  = 1 / 10000000;

const G = 6.67430;

const PADDING = 50;
let center = {x: 0, y: 0};

let speedMultiplier = 360 / 15; // 15 second orbit
let zoom = 1.0;

// Resize the canvas on window resize
function windowResized() {
    center = {x: (windowWidth / 2), y: (windowHeight / 2)};
    resizeCanvas(windowWidth, windowHeight);
}

// Function to handle setup
function setup() {
  // Center canvas
    createCanvas(windowWidth, windowHeight).position(PADDING / 2, PADDING / 2);
    windowResized();

  // Change angle mode to degrees
    angleMode(DEGREES);

  // Add interactive elements
    addPlanetSizeOptions();
    addOrbitalTimeOptions();
    addPlanetSelectionOptions();
    addHohmannTransferToggle();
    addZoomButtons();

    togglePlanetSize();

  // Set planet values
    for (let [_, planet] of planets) {
        planet.b     = getSemiMinorAxis(planet.a, planet.e);
        planet.ae    = getFocusPoint(planet);
        planet.v     = getEarthVelocityRatio(planet.a);
        planet.peri  = getPerihelion(planet.a, planet.e);
        planet.aphe  = getAphelion(planet.a, planet.e);
        planet.x     = planet.a;
        planet.y     = 0;
        planet.angle = 0;
    }
}

// Function to handle logic
function update(dt) {
  // Calculate new planet position and angle
    for (let [_, planet] of planets) {
    //angle = (angle + ((speedMultiplier * planet.v))) % 360;
        planet.angle = (planet.angle - ((speedMultiplier * planet.v) * (dt / 1000))) % 360;

    // Calculate new x and y position
        let r = (planet.a * (1 - (planet.e * planet.e))) / (1 + planet.e * cos(planet.angle));

        planet.x = (r * cos(planet.angle)) + planet.ae;
        planet.y = (r * sin(planet.angle));
    }
}

function drawPlanet(planet) {
    fill(planet.color);

  // Planet with a minimum radius of 5 pixels
    circle(
        (planet.ae * zoom) + (planet.x * zoom),
        planet.y * zoom, 
        Math.max(5, (planet.r * zoom))
    );

    noFill();
    ellipse(planet.ae * zoom, 0, (planet.a * 2) * zoom, (planet.b * 2) * zoom);
}

// Function to handle drawing
function draw() {
  // Handle logic
    update(deltaTime);

  // Clear canvas and reset colors
    clear();
    background(220);
  
    fill("#000000");
  //text((+zoom).toFixed(1), 46, 40);

  // Translate everything from center of screen
    translate(center.x, center.y)

    strokeWeight(1);

  // Draw sun
    fill(sun.color);
    circle(0, 0, sun.r * zoom);
  
  // Draw the planets
    let selectedPlanet = planets.get(planetSelection.value());

    if (selectedPlanet == undefined) {
        for (let [_, planet] of planets) {
            drawPlanet(planet);
        }
  // Draw focus points and lines if a specific planet has been selected
    } else {
        let p = selectedPlanet;
        drawPlanet(p);

    // Draw information box
        let x = -center.x + 250;
        let y = -center.y + 10;
        fill("#FFFFFF");
        rect(x - 220, y + 350 + 50, 285, 200);

    // Name of planet
        fill("#000000");
        textSize(16);
        text(p.name, x + 3 - 220, y + 15 + 350 + 50);
        textSize(12);

    // Planet information
        text(`Большая полуось: ${p.a.toFixed(2)} x 10^6 км`, x + 3 - 220, y + 40 + 400);
        text(`Малая полуось: ${p.b.toFixed(2)} x 10^6 км`, x + 3 - 220, y + 55 + 400);
        text(`Перигелий: ${p.peri.toFixed(2)} x 10^6 км`, x + 3 - 220, y + 75 + 400);
        text(`Афелий: ${p.aphe.toFixed(2)} x 10^6 км`, x + 3 - 220, y + 90 + 400);
        text(`Эксцентриситет: ${p.e.toFixed(4)}`, x + 3 - 220, y + 115 + 400);
        text(`Орбитальный период (в земных сутках): ${getPeriodDays(p.T).toFixed(2)}`, x + 3 - 220, y + 140 + 400);
        text(`Текущая величина угла: ${Math.abs(p.angle.toFixed(4))}`, x + 3 - 220, y + 165 + 400);

        let focalSum = getDistance(0, 0, p.x + p.ae, p.y) + getDistance(p.ae * 2, 0, p.x + p.ae, p.y);
        text(`Сумма расстояний до фокусов: ${focalSum.toFixed(2)} x 10^6 км`, x + 3 - 220, y + 190 + 400);

    // Draw focus points and lines
        circle(0, 0, 5);
        circle(p.ae * 2 * zoom, 0, 5);

        x = (p.x * zoom) + (p.ae * zoom);
        y = p.y * zoom;

        line(0, 0, x, y);
        line(p.ae * 2 * zoom, 0, x, y);
    }

    if (hohmannCheckbox.checked()) {
        let earth = planets.get("Земля");
        let mars = planets.get("Марс");
        let angle = p5.Vector.fromAngle(radians(44), (mars.a - 15));
        line(0, 0, -angle.x * zoom, angle.y * zoom);

    // Earth point
        fill(earth.color);
        circle(-(earth.peri * zoom) - (earth.ae * zoom) + (3 * zoom), 0, 10);

    // Transfer Line
        noFill();
        strokeWeight(2);
        stroke("#FF0000");
        bezier(
            -(earth.peri * zoom), 0,              // x1, y1
            -(earth.peri * zoom), mars.a * zoom,  // x2, y2
            (mars.aphe * zoom),   mars.a * zoom,  // x3, y3
            (mars.aphe * zoom) - (2 * zoom), 0    // x4, y4
        );

        stroke("#000000");
        strokeWeight(1);

    // Mars points
        fill(mars.color);
        circle((mars.aphe * zoom) - (2 * zoom), 0, 5);
        circle(-angle.x * zoom, angle.y * zoom, 8);
    }
}