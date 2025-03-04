const recipes = [
  {
    id: 1,
    title: "Vegan Lentil Soup",
    image: "./assets/lentil-soup.webp",
    readyInMinutes: 30,
    servings: 4,
    sourceUrl: "https://example.com/vegan-lentil-soup",
    diets: ["vegan"],
    cuisine: "Mediterranean",
    ingredients: [
      "red lentils",
      "carrots",
      "onion",
      "garlic",
      "tomato paste",
      "cumin",
      "paprika",
      "vegetable broth",
      "olive oil",
      "salt",
    ],
    pricePerServing: 2.5,
    popularity: 85,
  },
  {
    id: 2,
    title: "Vegetarian Pesto Pasta",
    image: "./assets/pesto-pasta.webp",
    readyInMinutes: 25,
    servings: 2,
    sourceUrl: "https://example.com/vegetarian-pesto-pasta",
    diets: ["vegetarian"],
    cuisine: "Italian",
    ingredients: [
      "pasta",
      "basil",
      "parmesan cheese",
      "garlic",
      "pine nuts",
      "olive oil",
      "salt",
      "black pepper",
    ],
    pricePerServing: 3.0,
    popularity: 92,
  },
  {
    id: 3,
    title: "Gluten-Free Chicken Stir-Fry",
    image: "./assets/stir-fry.webp",
    readyInMinutes: 20,
    servings: 3,
    sourceUrl: "https://example.com/gluten-free-chicken-stir-fry",
    diets: ["gluten-free"],
    cuisine: "Asian",
    ingredients: [
      "chicken breast",
      "broccoli",
      "bell pepper",
      "carrot",
      "soy sauce (gluten-free)",
      "ginger",
      "garlic",
      "sesame oil",
      "cornstarch",
      "green onion",
      "sesame seeds",
      "rice",
    ],
    pricePerServing: 4.0,
    popularity: 78,
  },
  {
    id: 4,
    title: "Dairy-Free Tacos",
    image: "./assets/dairy-free-tacos.webp",
    readyInMinutes: 15,
    servings: 2,
    sourceUrl: "https://example.com/dairy-free-tacos",
    diets: ["dairy-free"],
    cuisine: "Mexican",
    ingredients: [
      "corn tortillas",
      "ground beef",
      "taco seasoning",
      "lettuce",
      "tomato",
      "avocado",
    ],
    pricePerServing: 2.8,
    popularity: 88,
  },
  {
    id: 5,
    title: "Middle Eastern Hummus",
    image: "./assets/hummus.webp",
    readyInMinutes: 10,
    servings: 4,
    sourceUrl: "https://example.com/middle-eastern-hummus",
    diets: ["vegan", "gluten-free"],
    cuisine: "Middle Eastern",
    ingredients: ["chickpeas", "tahini", "garlic", "lemon juice", "olive oil"],
    pricePerServing: 1.5,
    popularity: 95,
  },
  {
    id: 6,
    title: "Quick Avocado Toast",
    image: "./assets/avocado-toast.webp",
    readyInMinutes: 5,
    servings: 1,
    sourceUrl: "https://example.com/quick-avocado-toast",
    diets: ["vegan"],
    cuisine: "Mediterranean",
    ingredients: ["bread", "avocado", "lemon juice", "salt"],
    pricePerServing: 2.0,
    popularity: 90,
  },
  {
    id: 7,
    title: "Beef Stew",
    image: "./assets/beef-stew.webp",
    readyInMinutes: 90,
    servings: 5,
    sourceUrl: "https://example.com/beef-stew",
    diets: [],
    cuisine: "European",
    ingredients: [
      "beef chunks",
      "potatoes",
      "carrots",
      "onion",
      "garlic",
      "tomato paste",
      "beef broth",
      "red wine",
      "bay leaves",
      "thyme",
      "salt",
      "black pepper",
      "butter",
      "flour",
      "celery",
      "mushrooms",
    ],
    pricePerServing: 5.5,
    popularity: 80,
  },
]

// DOM selectors
const messageBox = document.getElementById("message-box")
const filterSelects = document.querySelectorAll(".custom-select")

function toggleDropdown(event) {
  event.stopPropagation()
  // Find the correct custom-select that belongs with the clicked select-box
  const selectContainer = event.currentTarget.parentElement
  selectContainer.classList.toggle("active")
}

function selectOption(value, event) {
  event.stopPropagation()
  // Find the correct custom-select container
  const selectContainer = event.currentTarget.closest(".custom-select")
  const selectedOption = selectContainer.querySelector(".selected-option")

  // Set the chosen value and close the dropdown
  selectedOption.textContent = value
  selectContainer.classList.remove("active")

  // Save the value in a data attribute for later use
  selectContainer.dataset.value = value

  // Create and invoke a custom 'change' event on this custom-select
  const changeEvent = new Event("change", { bubbles: true })
  selectContainer.dispatchEvent(changeEvent)
}

// Closes all the open dropdowns if clicking outside of them
document.addEventListener("click", function (event) {
  document.querySelectorAll(".custom-select").forEach(function (select) {
    if (!select.contains(event.target)) {
      select.classList.remove("active")
    }
  })
})

// Listen for 'change' event for each custom-select
filterSelects.forEach((select) => {
  select.addEventListener("change", (event) => {
    // Get the chosen value from the data attribute
    const selectedValue = select.dataset.value
    // Get the type of filter via a data attribute (make sure it's in the HTML, t.ex. data-filter-type="ingredients")
    const filterType = select.dataset.filterType

    // Log and print the results
    console.log(`Chosen filter type: ${filterType} - Value: ${selectedValue}`)
    messageBox.innerHTML += `<p>Chosen filter type: ${filterType} - Value: ${selectedValue}</p>`

    // Exempel: anropa en funktion för att uppdatera recepten
    // updateRecipeList(filterType, selectedValue);
  })
})

// Create a function to filter recipes after time
function sortRecipesByTime() {
  const selectedFilter = document.querySelector('[data-filter-type="time"]')
    ?.dataset.value

  let filteredRecipes = []

  // Filter recipes depending on the chosen alternative
  if (selectedFilter === "Under 15 min") {
    filteredRecipes = recipes.filter((recipe) => recipe.readyInMinutes < 15)
  } else if (selectedFilter === "15-30 min") {
    filteredRecipes = recipes.filter(
      (recipe) => recipe.readyInMinutes >= 15 && recipe.readyInMinutes <= 30
    )
  } else if (selectedFilter === "31-60 min") {
    filteredRecipes = recipes.filter(
      (recipe) => recipe.readyInMinutes >= 31 && recipe.readyInMinutes <= 60
    )
  } else if (selectedFilter === "Over 60 min") {
    filteredRecipes = recipes.filter((recipe) => recipe.readyInMinutes > 60)
  } else {
    // If All times is chosen return all recipes
    filteredRecipes = recipes
  }

  displayRecipes(filteredRecipes)
}

filterSelects.forEach((select) => {
  select.addEventListener("change", () => {
    if (select.dataset.filterType === "time") {
      sortRecipesByTime()
    }
  })
})

// Create a function to filter recipes after number of ingredients
function sortRecipesByIngredients() {
  // Get the chosen value from the dropdown menu
  const selectedFilter = document.querySelector(
    '[data-filter-type="ingredients"]'
  ).dataset.value

  let filteredRecipes = []

  // Filter the recipes depending on the chosen alternative
  if (selectedFilter === "Under 5 ingredients") {
    filteredRecipes = recipes.filter((recipe) => recipe.ingredients.length < 5)
  } else if (selectedFilter === "6-10 ingredients") {
    filteredRecipes = recipes.filter(
      (recipe) =>
        recipe.ingredients.length >= 6 && recipe.ingredients.length <= 10
    )
  } else if (selectedFilter === "11-15 ingredients") {
    filteredRecipes = recipes.filter(
      (recipe) =>
        recipe.ingredients.length >= 11 && recipe.ingredients.length <= 15
    )
  } else if (selectedFilter === "Over 16 ingredients") {
    filteredRecipes = recipes.filter((recipe) => recipe.ingredients.length > 16)
  } else {
    // If All ingredients is chosen return all recipes
    filteredRecipes = recipes
  }

  // Uppdate the UI to show the filtered recipes
  displayRecipes(filteredRecipes)
}

// Function to show the filtered recipes in the UI
function displayRecipes(filteredRecipes) {
  const recipeGrid = document.getElementById("recipe-grid")
  recipeGrid.innerHTML = "" // Clear earlier content

  filteredRecipes.forEach((recipe) => {
    const recipeCard = document.createElement("div")
    recipeCard.classList.add("recipe-card")
    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
      <div class="recipe-content">
        <h2>${recipe.title}</h2>
        <hr>
        <p><strong>Cuisine:</strong> ${recipe.cuisine}</p>
        <p><strong>Time:</strong> ${recipe.readyInMinutes} min</p>
        <hr>
        <h3>Ingredients</h3>
        <ul>${recipe.ingredients
          .map((ingredient) => `<li>${ingredient}</li>`)
          .join("")}</ul>
      </div>
    `
    recipeGrid.appendChild(recipeCard)
  })
}

// Listen after changes in the dropdown and call the sorting function
filterSelects.forEach((select) => {
  select.addEventListener("change", () => {
    if (select.dataset.filterType === "ingredients") {
      sortRecipesByIngredients()
    }
  })
})

function sortRecipes(option) {
  const recipeGrid = document.getElementById("recipe-grid")
  const displayedRecipes = Array.from(recipeGrid.children)

  let sortedRecipes = displayedRecipes.sort((a, b) => {
    const titleA = a.querySelector("h2").textContent.toLowerCase()
    const titleB = b.querySelector("h2").textContent.toLowerCase()

    return option === "Ascending"
      ? titleA.localeCompare(titleB)
      : titleB.localeCompare(titleA)
  })

  recipeGrid.innerHTML = "" // Clear current grid
  sortedRecipes.forEach((recipe) => recipeGrid.appendChild(recipe)) // Put the sorted element back
}

document
  .querySelector('[data-filter-type="sort"]')
  .addEventListener("change", function () {
    sortRecipes(this.dataset.value)
  })
