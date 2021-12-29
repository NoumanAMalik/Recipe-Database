const mealsElement = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const mealPopup = document.getElementById("meal-popup");
const mealInfoElement = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("close-popup");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

getRandomMeal();
fetchFavoriteMeals();

async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);

    const respData = await resp.json();
    const meal = await respData.meals[0];

    return meal;    
}

async function getMealsBySearch(term) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);

    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `
    <div class="meal-header">
        ${random ? `<span class="random">Random Recipe</span>` : ""}
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-button"><i class="fas fa-heart"></i></button>
    </div>
    `;
    const btn = meal.querySelector(".meal-body .fav-button");
    
    btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) {
            removeMealFromLocalStorage(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            addMealToLocalStorage(mealData.idMeal);
            btn.classList.toggle("active");
        }

        fetchFavoriteMeals();
    });

    meal.addEventListener("click", () => {
        showMealInfo(mealData);
    })

    mealsElement.appendChild(meal);
}

function addMealToLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();

    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();

    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter(id => id !== mealId)));
}

function getMealsFromLocalStorage() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavoriteMeals() {
    // Clear the container
    favoriteContainer.innerHTML = "";
    const mealIds = getMealsFromLocalStorage();

    for (let i = 0; i < mealIds.length; i ++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);

        addMealToFav(meal);
    }
}

function addMealToFav(mealData) {
    const favMeal = document.createElement('li');
    favMeal.innerHTML = `
    <li><img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"><span>${mealData.strMeal}</span></li>
    <button class="clear"><i class="fas fa-window-close"></i></button>
    `;
    const btn = favMeal.querySelector(".clear");

    btn.addEventListener('click', () => {
        removeMealFromLocalStorage(mealData.idMeal);

        fetchFavoriteMeals();
    })

    favMeal.addEventListener("click", () => {
        showMealInfo(mealData);
    })

    favoriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
    // Clear the previous meal
    mealInfoElement.innerHTML = "";

    // Update the meal info
    const mealElement = document.createElement("div");

    const ingredients = [];

    // Get ingredients and measurements
    for (let i = 1; i < 20; i ++) {
        if (mealData["strIngredient" + i]) {
            ingredients.push(`${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`);
        } else {
            break;
        }
    }

    mealElement.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <p>${mealData.strInstructions}</p>
        <h3>Ingredients</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `)
                .join("")}
        </ul>
    `;

    mealInfoElement.appendChild(mealElement);

    // Show the popup
    mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click", async () => {
    // Clean the container
    mealsElement.innerHTML = "";

    const search = searchTerm.value;

    const meals = await getMealsBySearch(search);

    if (meals) { // If there are meals then show | this is to prevent error for looping through a null array
        meals.forEach(meal => {
            addMeal(meal);
        });
    }
});

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});