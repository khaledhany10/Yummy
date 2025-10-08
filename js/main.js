/// <reference types="../@types/jquery" />

// Global variables
let rowData = document.getElementById("rowData");
let searchContainer = document.getElementById("searchContainer");

// Initialize the application
$(document).ready(() => {
    initializeSidebar();
    searchByName("").then(() => {
        $(".loading-screen").fadeOut(500);
    });
});

// Sidebar functionality
// في ملف script.js - تحديث دالة initializeSidebar
function initializeSidebar() {
  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toggle-btn';
  toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
  document.body.appendChild(toggleBtn);

  // Create overlay for mobile
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  const sidebar = document.querySelector('.side-navbar');
  const mainContent = document.querySelector('.main-content');

  // Toggle sidebar function
  function toggleSidebar() {
      if (window.innerWidth <= 768) {
          // Mobile behavior
          sidebar.classList.toggle('mobile-open');
          overlay.classList.toggle('active');
          document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
      } else {
          // Desktop behavior
          sidebar.classList.toggle('collapsed');
          mainContent.classList.toggle('expanded');
          
          // Update button position and icon
          if (sidebar.classList.contains('collapsed')) {
              toggleBtn.style.left = '20px';
              toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
          } else {
              toggleBtn.style.left = '300px';
              toggleBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
          }
      }
  }

  // Toggle sidebar
  toggleBtn.addEventListener('click', toggleSidebar);

  // Close sidebar when clicking overlay (mobile only)
  overlay.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
          sidebar.classList.remove('mobile-open');
          overlay.classList.remove('active');
          document.body.style.overflow = '';
      }
  });

  // Close sidebar when clicking on nav links (mobile only)
  document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
              sidebar.classList.remove('mobile-open');
              overlay.classList.remove('active');
              document.body.style.overflow = '';
          }
      });
  });

  // Handle window resize
  window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
          // Reset to desktop state
          sidebar.classList.remove('mobile-open');
          overlay.classList.remove('active');
          document.body.style.overflow = '';
          sidebar.classList.remove('collapsed');
          mainContent.classList.remove('expanded');
          toggleBtn.style.left = '300px';
          toggleBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      } else {
          // Reset to mobile state
          sidebar.classList.add('collapsed');
          mainContent.classList.add('expanded');
          toggleBtn.style.left = '20px';
          toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
  });

  // Menu toggle for mobile (small screens) - internal menu button
  $('.menu-toggle').on('click', function () {
      if (window.innerWidth <= 768) {
          sidebar.classList.toggle('mobile-open');
          overlay.classList.toggle('active');
          document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
      }
  });
}
// Display Meals
function displayMeals(arr) {
    let cartoona = "";
    if (!arr || arr.length === 0) {
        cartoona = `
            <div class="col-12 text-center">
                <div class="alert alert-secondary">
                    <i class="fa-solid fa-utensils fa-3x mb-3"></i>
                    <h3>No meals found</h3>
                    <p>Try searching for something else</p>
                </div>
            </div>`;
    } else {
        for (let i = 0; i < arr.length; i++) {
            cartoona += `
                <div class="col-md-3 col-sm-6 mb-4">
                    <div onclick="getMealDetails('${arr[i].idMeal}')" 
                         class="meal position-relative overflow-hidden rounded-3 shadow-lg">
                        <img class="w-100" src="${arr[i].strMealThumb}" alt="${arr[i].strMeal}">
                        <div class="meal-layer position-absolute d-flex align-items-center justify-content-center text-dark p-3">
                            <h3 class="fw-bold text-center">${arr[i].strMeal}</h3>
                        </div>
                    </div>
                </div>`;
        }
    }
    rowData.innerHTML = cartoona;
}

// Get Categories
async function getCategories() {
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    searchContainer.innerHTML = "";

    try {
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`);
        response = await response.json();
        displayCategories(response.categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        displayError('Failed to load categories');
    }
    $(".inner-loading-screen").fadeOut(300);
}

function displayCategories(arr) {
    let cartoona = `
        <div class="text-center mb-5">
            <h2 class="fw-bold text-electric">🍽️ Categories</h2>
            <p class="text-muted">Choose your favorite meal type</p>
        </div>
        <div class="row">`;

    for (let i = 0; i < arr.length; i++) {
        cartoona += `
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="meal position-relative overflow-hidden rounded-3 cursor-pointer"
                     onclick="getCategoryMeals('${arr[i].strCategory}')">
                    <img class="w-100" src="${arr[i].strCategoryThumb}" alt="${arr[i].strCategory}">
                    <div class="meal-layer position-absolute d-flex flex-column justify-content-center align-items-center text-dark p-3">
                        <h4 class="fw-bold mb-2">${arr[i].strCategory}</h4>
                        <p class="small text-center">${arr[i].strCategoryDescription.split(" ").slice(0, 10).join(" ")}...</p>
                    </div>
                </div>
            </div>`;
    }

    cartoona += `</div>`;
    rowData.innerHTML = cartoona;
}

// Get Category Meals
async function getCategoryMeals(category) {
    $(".inner-loading-screen").fadeIn(200);
    try {
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        let data = await response.json();
        
        let cartoona = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold text-electric mb-0">${category} Meals</h2>
                <button onclick="getCategories()" class="btn btn-outline-info px-4">
                    <i class="fa-solid fa-arrow-left me-2"></i>Back to Categories
                </button>
            </div>
            <div class="row">`;
        
        if (data.meals && data.meals.length > 0) {
            for (let i = 0; i < Math.min(data.meals.length, 20); i++) {
                cartoona += `
                    <div class="col-md-3 col-sm-6 mb-4">
                        <div class="meal position-relative overflow-hidden rounded-3"
                             onclick="getMealDetails('${data.meals[i].idMeal}')">
                            <img class="w-100" src="${data.meals[i].strMealThumb}" alt="${data.meals[i].strMeal}">
                            <div class="meal-layer position-absolute d-flex align-items-center justify-content-center text-dark p-3">
                                <h5 class="fw-semibold text-center">${data.meals[i].strMeal}</h5>
                            </div>
                        </div>
                    </div>`;
            }
        } else {
            cartoona += `
                <div class="col-12 text-center">
                    <div class="alert alert-secondary">
                        <i class="fa-solid fa-utensils fa-3x mb-3"></i>
                        <h3>No meals found in this category</h3>
                    </div>
                </div>`;
        }
        
        cartoona += `</div>`;
        rowData.innerHTML = cartoona;
    } catch (error) {
        console.error('Error fetching category meals:', error);
        displayError('Failed to load meals');
    }
    $(".inner-loading-screen").fadeOut(200);
}

// Get Area
async function getArea() {
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    searchContainer.innerHTML = "";

    try {
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/list.php?a=list`);
        response = await response.json();
        displayArea(response.meals);
    } catch (error) {
        console.error('Error fetching areas:', error);
        displayError('Failed to load areas');
    }
    $(".inner-loading-screen").fadeOut(300);
}

function displayArea(arr) {
    let cartoona = `
        <div class="text-center mb-5">
            <h2 class="fw-bold text-electric">🌍 Browse by Area</h2>
            <p class="text-muted">Choose a region to explore meals from around the world</p>
        </div>
        <div class="row">`;

    for (let i = 0; i < arr.length; i++) {
        cartoona += `
            <div class="col-md-3 col-sm-6 mb-4">
                <div onclick="getAreaMeals('${arr[i].strArea}')"
                     class="area-card rounded-3 text-center cursor-pointer p-4 shadow-sm">
                    <i class="fa-solid fa-location-dot fa-3x mb-3 text-electric"></i>
                    <h4 class="fw-semibold">${arr[i].strArea}</h4>
                </div>
            </div>`;
    }

    cartoona += `</div>`;
    rowData.innerHTML = cartoona;
}

// Get Area Meals
async function getAreaMeals(area) {
    $(".inner-loading-screen").fadeIn(200);
    try {
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
        response = await response.json();
        displayAreaMeals(response.meals, area);
    } catch (error) {
        console.error('Error fetching area meals:', error);
        displayError('Failed to load area meals');
    }
    $(".inner-loading-screen").fadeOut(200);
}

function goToHome() {
    window.location.href = window.location.href.split('/').slice(0, -1).join('/') + '/index.html';
}


function displayAreaMeals(meals, area) {
    let cartoona = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold text-electric mb-0">${area} Meals</h2>
            <button onclick="getArea()" class="btn btn-outline-info px-4">
                <i class="fa-solid fa-arrow-left me-2"></i>Back to Areas
            </button>
        </div>
        <div class="row">`;

    if (meals && meals.length > 0) {
        for (let i = 0; i < Math.min(meals.length, 20); i++) {
            cartoona += `
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="meal position-relative overflow-hidden rounded-3"
                         onclick="getMealDetails('${meals[i].idMeal}')">
                        <img class="w-100" src="${meals[i].strMealThumb}" alt="${meals[i].strMeal}">
                        <div class="meal-layer position-absolute d-flex align-items-center justify-content-center text-dark p-3">
                            <h5 class="fw-semibold text-center">${meals[i].strMeal}</h5>
                        </div>
                    </div>
                </div>`;
        }
    } else {
        cartoona += `
            <div class="col-12 text-center">
                <div class="alert alert-secondary">
                    <i class="fa-solid fa-utensils fa-3x mb-3"></i>
                    <h3>No meals found from this area</h3>
                </div>
            </div>`;
    }

    cartoona += `</div>`;
    rowData.innerHTML = cartoona;
}

// Get Ingredients
async function getIngredients() {
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    searchContainer.innerHTML = "";

    try {
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/list.php?i=list`);
        response = await response.json();
        displayIngredients(response.meals.slice(0, 20));
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        displayError('Failed to load ingredients');
    }
    $(".inner-loading-screen").fadeOut(300);
}

function displayIngredients(arr) {
    let cartoona = `
        <div class="text-center mb-5">
            <h2 class="fw-bold text-electric">🍴 Browse by Ingredients</h2>
            <p class="text-muted">Select an ingredient to explore related meals</p>
        </div>
        <div class="row">`;

    for (let i = 0; i < arr.length; i++) {
        cartoona += `
            <div class="col-md-3 col-sm-6 mb-4">
                <div onclick="getIngredientsMeals('${arr[i].strIngredient}')"
                     class="ingredient-card rounded-3 text-center cursor-pointer p-4 shadow-sm">
                    <i class="fa-solid fa-drumstick-bite fa-3x mb-3 text-electric"></i>
                    <h4 class="fw-semibold">${arr[i].strIngredient}</h4>
                    <p class="small opacity-75 mt-2">${arr[i].strDescription?.split(" ").slice(0, 8).join(" ") || "No description available"}...</p>
                </div>
            </div>`;
    }

    cartoona += `</div>`;
    rowData.innerHTML = cartoona;
}

// Get Ingredients Meals
async function getIngredientsMeals(ingredient) {
    $(".inner-loading-screen").fadeIn(200);
    try {
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        response = await response.json();
        displayIngredientsMeals(response.meals, ingredient);
    } catch (error) {
        console.error('Error fetching ingredient meals:', error);
        displayError('Failed to load ingredient meals');
    }
    $(".inner-loading-screen").fadeOut(200);
}

function displayIngredientsMeals(meals, ingredient) {
    let cartoona = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold text-electric mb-0">${ingredient} Meals</h2>
            <button onclick="getIngredients()" class="btn btn-outline-info px-4">
                <i class="fa-solid fa-arrow-left me-2"></i>Back to Ingredients
            </button>
        </div>
        <div class="row">`;

    if (meals && meals.length > 0) {
        for (let i = 0; i < Math.min(meals.length, 20); i++) {
            cartoona += `
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="meal position-relative overflow-hidden rounded-3"
                         onclick="getMealDetails('${meals[i].idMeal}')">
                        <img class="w-100" src="${meals[i].strMealThumb}" alt="${meals[i].strMeal}">
                        <div class="meal-layer position-absolute d-flex align-items-center justify-content-center text-dark p-3">
                            <h5 class="fw-semibold text-center">${meals[i].strMeal}</h5>
                        </div>
                    </div>
                </div>`;
        }
    } else {
        cartoona += `
            <div class="col-12 text-center">
                <div class="alert alert-secondary">
                    <i class="fa-solid fa-utensils fa-3x mb-3"></i>
                    <h3>No meals found with this ingredient</h3>
                </div>
            </div>`;
    }

    cartoona += `</div>`;
    rowData.innerHTML = cartoona;
}

// Meal Details
async function getMealDetails(mealID) {
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    searchContainer.innerHTML = "";

    try {
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`);
        response = await response.json();
        displayMealDetails(response.meals[0]);
    } catch (error) {
        console.error('Error fetching meal details:', error);
        displayError('Failed to load meal details');
    }
    $(".inner-loading-screen").fadeOut(300);
}

function displayMealDetails(meal) {
    let ingredients = ``;
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== "") {
            ingredients += `<li class="alert alert-primary m-2 p-2">${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}</li>`;
        }
    }

    let tags = meal.strTags ? meal.strTags.split(",") : [];
    let tagsStr = tags.map(tag => `<li class="alert alert-secondary m-2 p-2">${tag.trim()}</li>`).join("");

    let cartoona = `
        <button onclick="backToHome()" class="btn btn-outline-info mb-4">
            <i class="fa-solid fa-arrow-left me-2"></i>Back to Home
        </button>
        <div class="row">
            <div class="col-md-5">
                <img class="w-100 rounded-3 shadow-lg" src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h2 class="mt-3 text-electric">${meal.strMeal}</h2>
                <div class="mt-3">
                    <h5><span class="fw-bold text-electric">Area:</span> ${meal.strArea}</h5>
                    <h5><span class="fw-bold text-electric">Category:</span> ${meal.strCategory}</h5>
                </div>
            </div>
            <div class="col-md-7">
                <h3 class="text-electric mb-3">Instructions</h3>
                <p class="text-light" style="line-height: 1.6;">${meal.strInstructions}</p>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <h5 class="text-electric">Recipes:</h5>
                        <ul class="list-unstyled d-flex flex-wrap">${ingredients}</ul>
                    </div>
                    <div class="col-md-6">
                        <h5 class="text-electric">Tags:</h5>
                        <ul class="list-unstyled d-flex flex-wrap">${tagsStr || '<li class="alert alert-secondary m-2 p-2">No tags available</li>'}</ul>
                    </div>
                </div>
                
                <div class="mt-4">
                    ${meal.strSource ? `<a target="_blank" href="${meal.strSource}" class="btn btn-outline-info me-2"><i class="fa-solid fa-external-link me-2"></i>Source</a>` : ''}
                    ${meal.strYoutube ? `<a target="_blank" href="${meal.strYoutube}" class="btn btn-outline-danger"><i class="fa-brands fa-youtube me-2"></i>YouTube</a>` : ''}
                </div>
            </div>
        </div>`;
    rowData.innerHTML = cartoona;
}

// Back to home
function backToHome() {
    searchByName("");
}

// Search functionality
function showSearchInputs() {
    searchContainer.innerHTML = `
        <div class="row py-4">
            <div class="col-md-6 mb-3">
                <input onkeyup="searchByName(this.value)" class="form-control" type="text" placeholder="🔍 Search By Name">
            </div>
            <div class="col-md-6 mb-3">
                <input onkeyup="searchByFLetter(this.value)" maxlength="1" class="form-control" type="text" placeholder="🔤 Search By First Letter">
            </div>
        </div>`;
    rowData.innerHTML = "";
}

async function searchByName(term) {
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    try {
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
        response = await response.json();
        displayMeals(response.meals || []);
    } catch (error) {
        console.error('Error searching by name:', error);
        displayError('Search failed');
    }
    $(".inner-loading-screen").fadeOut(300);
}

async function searchByFLetter(term) {
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    term = term || "a";
    try {
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${term}`);
        response = await response.json();
        displayMeals(response.meals || []);
    } catch (error) {
        console.error('Error searching by letter:', error);
        displayError('Search failed');
    }
    $(".inner-loading-screen").fadeOut(300);
}

// Contact Form
function showContacts() {
    rowData.innerHTML = `
        <div class="contact min-vh-100 d-flex justify-content-center align-items-center">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="text-center mb-5">
                            <h2 class="text-electric">Contact Us</h2>
                            <p class="text-muted">Get in touch with us</p>
                        </div>
                        <div class="row g-4">
                            <div class="col-md-6">
                                <input id="nameInput" onkeyup="inputsValidation()" type="text" class="form-control" placeholder="Enter Your Name">
                                <div id="nameAlert" class="alert alert-danger w-100 mt-2 d-none">Please enter a valid name</div>
                            </div>
                            <div class="col-md-6">
                                <input id="emailInput" onkeyup="inputsValidation()" type="email" class="form-control" placeholder="Enter Your Email">
                                <div id="emailAlert" class="alert alert-danger w-100 mt-2 d-none">Please enter a valid email</div>
                            </div>
                            <div class="col-md-6">
                                <input id="phoneInput" onkeyup="inputsValidation()" type="text" class="form-control" placeholder="Enter Your Phone">
                                <div id="phoneAlert" class="alert alert-danger w-100 mt-2 d-none">Please enter a valid phone number</div>
                            </div>
                            <div class="col-md-6">
                                <input id="ageInput" onkeyup="inputsValidation()" type="number" class="form-control" placeholder="Enter Your Age">
                                <div id="ageAlert" class="alert alert-danger w-100 mt-2 d-none">Please enter a valid age</div>
                            </div>
                            <div class="col-md-6">
                                <input id="passwordInput" onkeyup="inputsValidation()" type="password" class="form-control" placeholder="Enter Your Password">
                                <div id="passwordAlert" class="alert alert-danger w-100 mt-2 d-none">Password must be at least 8 characters with letters and numbers</div>
                            </div>
                            <div class="col-md-6">
                                <input id="repasswordInput" onkeyup="inputsValidation()" type="password" class="form-control" placeholder="Re-enter Password">
                                <div id="repasswordAlert" class="alert alert-danger w-100 mt-2 d-none">Passwords don't match</div>
                            </div>
                            <div class="col-12 text-center">
                                <button id="submitBtn" disabled class="btn btn-info px-5 mt-3">Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

// Error display function
function displayError(message) {
    rowData.innerHTML = `
        <div class="col-12 text-center">
            <div class="alert alert-secondary">
                <i class="fa-solid fa-exclamation-triangle fa-3x mb-3"></i>
                <h3>${message}</h3>
                <p>Please try again later</p>
            </div>
        </div>`;
}

// Validation functions (unchanged from your original code)
let nameInputTouched = false;
let emailInputTouched = false;
let phoneInputTouched = false;
let ageInputTouched = false;
let passwordInputTouched = false;
let repasswordInputTouched = false;

function inputsValidation() {
    if (nameValidation() && emailValidation() && phoneValidation() && ageValidation() && passwordValidation() && repasswordValidation()) {
        submitBtn.removeAttribute("disabled");
    } else {
        submitBtn.setAttribute("disabled", true);
    }
}

function nameValidation() {
    return /^[a-zA-Z ]+$/.test(document.getElementById("nameInput").value);
}
function emailValidation() {
    return /^[^ ]+@[^ ]+\.[a-z]{2,3}$/.test(document.getElementById("emailInput").value);
}
function phoneValidation() {
    return /^[0-9]{10,15}$/.test(document.getElementById("phoneInput").value);
}
function ageValidation() {
    return /^[1-9][0-9]?$/.test(document.getElementById("ageInput").value);
}
function passwordValidation() {
    return /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/.test(document.getElementById("passwordInput").value);
}
function repasswordValidation() {
    return document.getElementById("repasswordInput").value === document.getElementById("passwordInput").value;
}