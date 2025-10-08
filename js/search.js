// <reference types="../@types/jquery" />
$(document).ready(() => {
    let urlParams = new URLSearchParams(window.location.search);
    let query = urlParams.get('query');
    searchByName(query);
});

async function searchByName(mealName) {
    $("#rowData").html("");
    $(".inner-loading-screen").fadeIn(300);
    let x = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`);
    response = await x.json();
    console.log(displayMeals(response.meals));
    $(".inner-loading-screen").fadeOut(1000);
}

function displayMeals(arr) {
    let content = "";
    arr.forEach(khaled => {
        content += `
        <div class="col-md-3">
                <div onclick="getMealDetails('${khaled.idMeal}')" class="meal position-relative overflow-hidden rounded-2 cursor-pointer">
                    <img class="w-100" src="${khaled.strMealThumb}" alt="">
                    <div class="meal-layer position-absolute d-flex align-items-center text-black p-2">
                        <h3>${khaled.strMeal}</h3>
                    </div>
                </div>
        </div>
        `
    });
    $("#rowData").html(content);
}

async function getMealDetails(mealId) {
    $("#rowData").html("");
    $(".inner-loading-screen").fadeIn(300);
    let response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
    response = await response.json();
    displayMealDetails(response.meals[0]);
    $(".inner-loading-screen").fadeOut(1000);
}

function displayMealDetails(meal) {
    let ingredients = ``;

    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredients += `<li class="alert alert-info m-2 p-1">${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}</li>`;
        }
    }

    let cartoona = `
    <div class="col">
        <img class="w-25 rounded-3" src="${meal.strMealThumb}" alt="">
        <h2>Instractions</h2>
        <h2>${meal.strMeal}</h2>
        <p>${meal.strInstructions}</p>
        <h3><span class="fw-bolder">Area:</span> ${meal.strArea}</h3>
        <h3><span class="fw-bolder">Category:</span> ${meal.strCategory}</h3>
        <h3>Recipes:</h3>
        <ul class="list-unstyled d-flex g-3 flex-wrap">
            ${ingredients}
        </ul>
        <a target="_blank" href="${meal.strSource}" class="btn btn-success">Source</a>
        <a target="_blank" href="${meal.strYoutube}" class="btn btn-danger">Youtube</a>
    </div>`;
    
    $("#rowData").html(cartoona);
}