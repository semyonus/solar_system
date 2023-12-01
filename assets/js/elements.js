function incrementZoom() {
    zoom += (zoom < SCALE_MAX ? SCALE_INCREASE : 0);
    zoom = +zoom.toFixed(1);
}

function decrementZoom() {
    zoom -= (zoom > SCALE_MIN ? SCALE_INCREASE : 0);
    zoom = +zoom.toFixed(1);
}

function togglePlanetSize() {
    let choice = planetSize.value();
    let value;

    value = (choice == "50x" ? 50 : 0.02);

    for (let [_, planet] of planets) {
        planet.r = planet.r * value;
}
}

const orbitalTimeOptions = new Map([
    ["1 год", 365.256 * 86400],
    ["1 день", 86400],
    ["1 час", 3600],
    ["5 минут", 5 * 60],
    ["15 секунд", 15],
    ["3 секунды", 3],
    ["1 секунда", 1]
]);

function changeOrbitalTime() {
    let choice = orbitalTime.value();
    speedMultiplier = 360 / orbitalTimeOptions.get(choice);
}

function addPlanetSizeOptions() {
    createP("Размер планет").position(30, 75);
    planetSize = createSelect();
    planetSize.option("Настоящий масштаб");
    planetSize.option("50x");
    planetSize.selected("50x");
    planetSize.position(30, 110);
    planetSize.changed(togglePlanetSize);
}

function addOrbitalTimeOptions() {
    createP("Орбитальный период").position(30, 135);
    orbitalTime = createSelect();

    for (let key of orbitalTimeOptions.keys()) {
        orbitalTime.option(key);
    }

    orbitalTime.selected("15 секунд");
    orbitalTime.position(30, 170);
    orbitalTime.changed(changeOrbitalTime);
}

function addPlanetSelectionOptions() {
    createP("Планеты").position(30, 195);
    planetSelection = createSelect();
    planetSelection.option("Все планеты");
    planetSelection.position(30, 230);

    for (let [name, _] of planets) {
        planetSelection.option(name);
    }
}

function addZoomButtons() {
    createP("Масштаб").position(30, 15);
    createButton('+').mousePressed(incrementZoom).position(30, 50);
    createButton('-').mousePressed(decrementZoom).position(60, 50);
}

function addHohmannTransferToggle() {
    hohmannCheckbox = createCheckbox('Гомановская траектория', false);
    hohmannCheckbox.position(25, 290);
}