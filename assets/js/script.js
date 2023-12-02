let userSelected = [];
let recipe = [];
let score = 0;
let possibleScore = 0;
let questionIndex = 0;
let maxLevel = 0;
let submitted = false;

document.addEventListener("DOMContentLoaded", function () {
    /* Welcome modal */
    const welcomeModal = document.getElementById("welcome-modal");
    const welcomeCloseBtn = document.getElementById("welcome-modal-close");
    displayModal(welcomeModal, undefined, welcomeCloseBtn, true, true);

    /* Cake modal */
    const cakeModal = document.getElementById("cake-modal");
    const cakeOpenModalBtn = document.getElementById("cake-info-btn");
    const cakeCloseModalBtn = document.getElementById("cake-modal-close");
    displayModal(cakeModal, cakeOpenModalBtn, cakeCloseModalBtn, false, false);

    /* Instructions modal */
    const instructionsModal = document.getElementById("instructions-modal");
    const instructionsOpenBtn = document.getElementById("instructions-btn");
    const instructionscloseBtn = document.getElementById("instructions-modal-close");
    displayModal(instructionsModal, instructionsOpenBtn, instructionscloseBtn, false, false);

    /* Confirm quit modal */
    const confirmQuitModal = document.getElementById("confirm-quit-modal");
    const confirmQuitOpenBtn = document.getElementById("quit-button");
    const confirmQuitCancel = document.getElementById("confirm-quit-modal-close");
    const confirmQuitButton = document.getElementById("confirm-quit");

    displayModal(confirmQuitModal, confirmQuitOpenBtn, confirmQuitCancel, false, false);
    confirmQuitButton.addEventListener("click", function () {
        confirmQuitModal.style.display = "none"; //closes modal
        quitGame();
    });

    const finishButton = document.getElementById("finish-button");
    finishButton.addEventListener("click", quitGame);
    runGame();
})

async function runGame() {
    const pantryArea = document.getElementById("pantry-area");
    const nextSubmitButton = document.getElementById("next-submit-button");
    const pantryData = await pullPantryData("assets/json/pantry.json");

    if (questionIndex === 0) {
        createPantry(pantryData, pantryArea);
    }

    createQuestion(pantryData.pantry[questionIndex]);
    updateSelectionCounter();

    nextSubmitButton.addEventListener("click", nextSubmit);
    maxLevel = pantryData.pantry.length - 1;

    updateLevel();
}

/**
 * Pulls the pantry data from JSON
 * Returns object pantryData
 */
async function pullPantryData(dataAddressString) {
    const pantryRawData = await fetch(dataAddressString);
    const pantryData = await pantryRawData.json();
    return pantryData;
}

/**
 * Creates an array of all pantry item recipe (ingredients)
 * by concatenating the recipe arrays of all pantry items and deduplicating.
 * Builds the pantry divs in HTML.
 */
function createPantry(pantryData, pantryDiv) {
    let masterPantryArray = [];
    pantryDiv.innerHTML = "";

    for (let i = 0; i < pantryData.pantry.length; i++) {
        masterPantryArray = masterPantryArray.concat(pantryData.pantry[i].recipe);
    }
    const pantryArray = [...new Set(masterPantryArray)];

    //Randomize order in pantry array
    shuffle(pantryArray);

    for (item in pantryArray) {
        const pantryItem = document.createElement("div");
        pantryItem.innerHTML = pantryArray[item];
        pantryItem.addEventListener("click", pantryItemSelect);
        pantryItem.classList.add("pantry-item");
        pantryItem.classList.add("pantry-item-active");
        pantryDiv.appendChild(pantryItem);
    }
}

/**
 * Builds the question and recipe 
 * Reference: https://www.w3schools.com/howto/howto_css_modals.asp
 */
function createQuestion(level) {
    recipe = level.recipe;
    document.getElementById("cake-name").innerHTML = level.name;
    document.getElementById("cake-country").innerHTML = `(${level.country})`;
    document.getElementById("cake-question").innerHTML = level.question;
    document.getElementById("cake-recipe-hint").innerHTML = `This recipe contains ${recipe.length} ingredients.`;
    document.getElementById("question-image").setAttribute("src", level.image);
    document.getElementById("question-image").setAttribute("alt", level.altText);
    document.getElementById("cake-modal-heading").innerHTML = `About ${level.name}:`;
    document.getElementById("cake-description").innerHTML = level.description;
}

/**
 * Adds a border to pantry item when clicked, and adds item to users selection, 
 * or removes the border on click if already existing, 
 * and removes item from user selection. 
 * Only selects the item if selection < recipe.
 */
function pantryItemSelect(event) {
    const clickedItem = event.target;

    if (!submitted) {
        //if not already selected, and counter is not full, add item to selection
        if (!clickedItem.classList.contains("pantry-item-selected") && userSelected.length < recipe.length) {
            clickedItem.classList.add("pantry-item-selected");
            userSelected.push(clickedItem.innerHTML);
            updateSelectionCounter();
            //if counter full - remove hover class from all pantry items without selected class
            if (userSelected.length === recipe.length) {
                removeActive();
            }
            //if item in selection, remove it from the selection    
        } else if (clickedItem.classList.contains("pantry-item-selected")) {
            clickedItem.classList.remove("pantry-item-selected");
            userSelected = userSelected.filter(item => item !== clickedItem.innerHTML);
            updateSelectionCounter();
            //make all pantry items that are not selected get hover class
            addActive();
        }
    }
}

function removeActive() {
    let pantry = document.getElementById("pantry-area");
    let pantryArray = pantry.childNodes;
    //iterate pantry items. if they dont have selected class, then remove hover class

    pantryArray.forEach(function (element) {
        if (!element.classList.contains("pantry-item-selected")) {
            element.classList.remove("pantry-item-active");
        }
    })
}

function addActive() {
    let pantry = document.getElementById("pantry-area");
    let pantryArray = pantry.childNodes;
    //iterate pantry items. if they dont have selected class, then remove hover class

    pantryArray.forEach(function (element) {
        if (!element.classList.contains("pantry-item-selected" && !element.classList.contains("pantry-item-active"))) {
            element.classList.add("pantry-item-active");
        }
    })
}

/**
 * Checks if button is Submit, then runs the submit function
 * and updates button to "Next". If button iis "Next", runs next function
 * and updates button to submit. 
 */
function nextSubmit(event) {
    const nextSubmitButton = event.target;
    if (nextSubmitButton.innerHTML === "Submit") {
        submitSelection();
        if (questionIndex === maxLevel) {
            nextSubmitButton.hidden = "true";
            nextSubmitButton.setAttribute("aria-hidden", "true");
            document.getElementById("quit-button").hidden = "true";
            document.getElementById("quit-button").setAttribute("aria-hidden", "true");
            document.getElementById("finish-button").removeAttribute("hidden");
            document.getElementById("finish-button").setAttribute("aria-hidden", "false");
        } else {
            nextSubmitButton.innerHTML = "Next";
        }
    } else {
        nextQuestion();
        scrollTop();
        nextSubmitButton.innerHTML = "Submit";
    }
}

//Check userSelected against recipe array. 
function submitSelection() {
    submitted = true;
    userCorrect = userSelected.filter(item => recipe.includes(item));
    userIncorrect = userSelected.filter(item => !recipe.includes(item));
    userMissed = recipe.filter(item => !userSelected.includes(item));

    let countCorrect = userCorrect.length;
    let countIncorrect = userIncorrect.length;
    let countMissed = userMissed.length;

    updateQuestionResults(countCorrect, countIncorrect, countMissed);
    displayPantryFeedback(userCorrect, userIncorrect, userMissed);
    updateScore(countCorrect, countIncorrect);
}

/**
 * Takes 3 arrays of strings. Creates another array based on the children of an HTML element.
 * Compares the created array to the parameter arrays and adds/removes classes to the HTML elements
 * based on whether they are found in the parameter arrays.
 * @param {String[]} userCorrect 
 * @param {String[]} userIncorrect 
 * @param {String[]} userMissed 
 */
function displayPantryFeedback(userCorrect, userIncorrect, userMissed) {
    let pantry = document.getElementById("pantry-area");
    let pantryArray = pantry.childNodes;

    pantryArray.forEach(function (element) {
        let feedbackIcon = document.createElement("i");

        if (userCorrect.includes(element.innerHTML)) {
            element.classList.add("item-correct");
            feedbackIcon.className = "fa-solid fa-circle-check";
        } else if (userIncorrect.includes(element.innerHTML)) {
            element.classList.add("item-incorrect");
            feedbackIcon.className = "fa-solid fa-circle-xmark";
        } else if (userMissed.includes(element.innerHTML)) {
            element.classList.add("item-missed");
            feedbackIcon.className = "fa-solid fa-minus";
        }

        element.appendChild(feedbackIcon);
        element.classList.remove("pantry-item-selected");

        if (element.classList.contains("pantry-item-active")) {
            element.classList.remove("pantry-item-active");
        }
    })
}

function nextQuestion() {
    submitted = false;
    questionIndex++;
    userSelected = [];
    let pantry = document.getElementById("pantry-area");
    let pantryArray = pantry.childNodes;

    pantryArray.forEach(function (element) {
        if (element.innerHTML) {
            element.classList.remove("item-correct");
            element.classList.remove("item-incorrect");
            element.classList.remove("item-missed");
            if (element.querySelector("i")) {
                element.querySelector("i").remove();
            }
            element.classList.add("pantry-item-active");
        }
    })

    resetQuestionResults();
    runGame();
}

function updateSelectionCounter() {
    const selectionCounter = document.getElementById("selection-counter");
    selectionCounter.innerHTML = `${userSelected.length}/${recipe.length} selected`;

    if (userSelected.length === recipe.length) {
        selectionCounter.classList.add("counter-full");
    }

    if (userSelected.length < recipe.length && selectionCounter.classList.contains("counter-full")) {
        selectionCounter.classList.remove("counter-full");
    }
}

function updateScore(countCorrect, countIncorrect) {
    possibleScore += (recipe.length);
    score += (countCorrect - countIncorrect);
    if (score < 0) {
        score = 0;
    }
    document.getElementById("score-area").innerHTML = `Score: ${score} / ${possibleScore}`;
}

/**
 * Takes three numbers and inserts them in a string which 
 * is added to the innerHTML of a HTML element.
 * @param {Number} countCorrect 
 * @param {Number} countIncorrect 
 * @param {Number} countMissed 
 */
function updateQuestionResults(countCorrect, countIncorrect, countMissed) {
    const resultsArea = document.getElementById("results-area");

    if (countCorrect === recipe.length) {
        resultsArea.innerHTML = `${countCorrect}/${recipe.length}! Congrats!`;
    } else if (countCorrect === 0) {
        resultsArea.innerHTML = `Correct: ${countCorrect}&nbsp;&nbsp;&nbsp;Incorrect: ${countIncorrect}&nbsp;&nbsp;&nbsp;Missed: ${countMissed}&nbsp;&nbsp;&nbsp;Better luck next time!`;
    } else {
        resultsArea.innerHTML = `Correct: ${countCorrect}&nbsp;&nbsp;&nbsp;Incorrect: ${countIncorrect}&nbsp;&nbsp;&nbsp;Missed: ${countMissed}`;
    }
}

function resetQuestionResults() {
    document.getElementById("results-area").innerHTML = "";
}

function updateLevel() {
    let level = questionIndex + 1;
    let finalLevel = maxLevel + 1;
    document.getElementById("level-area").innerHTML = `Level: ${level} / ${finalLevel}`;
}

/**
 * Will randomize the item order in a given array
 * Fisher-Yates Shuffle, credit: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param {Array} shuffleArray 
 * @returns {Array}, with randomized order
 */
function shuffle(shuffleArray) {
    let currentIndex = shuffleArray.length
    let randomIndex;

    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [shuffleArray[currentIndex], shuffleArray[randomIndex]] = [
            shuffleArray[randomIndex], shuffleArray[currentIndex]
        ];
    }
    return shuffleArray;
}

/**
 * Scrolls to the top of the page.
 * Credit: https://www.w3schools.com/howto/howto_js_scroll_to_top.asp
 */
function scrollTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

/**
 * Opens main modal and updates content to show final score
 */
function quitGame() {
    let quitModal = document.getElementById("quit-modal");
    let startGameButton = document.getElementById("restart-game-button");

    quitModal.style.display = "block"; //opens modal
    document.getElementById("final-score-display").innerHTML = `Final score: ${score}`;
    document.getElementById("score-context").innerHTML = `You got ${score} points out of ${possibleScore} possible points.`;

    startGameButton.addEventListener("click", function () {
        quitModal.style.display = "none";
        startGame();
    })
}

function startGame() {
    userSelected = [];
    recipe = [];
    score = 0;
    possibleScore = 0;
    questionIndex = 0;
    maxLevel = 0;
    runGame();
    resetControls();
}

function resetControls() {
    document.getElementById("next-submit-button").removeAttribute("hidden");
    document.getElementById("next-submit-button").removeAttribute("aria-hidden");
    document.getElementById("quit-button").removeAttribute("hidden");
    document.getElementById("quit-button").removeAttribute("aria-hidden");
    document.getElementById("finish-button").hidden = "true";
    document.getElementById("finish-button").setAttribute("aria-hidden", "true");
}

/**
 * Gets the modal and "button" from HTML and 
 * Reference: https://www.w3schools.com/howto/howto_css_modals.asp
 */
function displayModal(modalParam, openModalBtn, closeModalBtn, fullScreen, defaultOpen) {
    if (defaultOpen) {
        modalParam.style.display = "block"; //opens modal
    }

    if (openModalBtn) {
        openModalBtn.onclick = function () {
            modalParam.style.display = "block"; //opens modal
        }
    }

    closeModalBtn.onclick = function () {
        modalParam.style.display = "none"; //closes modal
    }

    if (!fullScreen) {
        window.onclick = function (event) {
            if (event.target == modalParam) {
                modalParam.style.display = "none"; //closes modal
            }
        }
    }
}