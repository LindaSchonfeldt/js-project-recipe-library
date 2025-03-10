// RECIPE ARRAY
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
      "salt"
    ],
    pricePerServing: 2.5,
    popularity: 85
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
      "black pepper"
    ],
    pricePerServing: 3.0,
    popularity: 92
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
      "rice"
    ],
    pricePerServing: 4.0,
    popularity: 78
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
      "avocado"
    ],
    pricePerServing: 2.8,
    popularity: 88
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
    popularity: 95
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
    popularity: 90
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
      "mushrooms"
    ],
    pricePerServing: 5.5,
    popularity: 80
  }
]

// Fetch the recipe data from the API

/* let recipes = [] // Empty array to store the fetched recipes
fetch(URL)
  .then((response) => response.json()) // Convert the response to JSON
  .then((data) => { */

// Store the fetched recipe in the recipes array
/*     recipes = data.recipes.map((recipe) => {
      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        sourceUrl: recipe.sourceUrl,
        diets: recipe.diets,
        cuisine: recipe.cuisine,
        ingredients: recipe.extendedIngredients.map(
          (ingredient) => ingredient.original
        ),
        pricePerServing: recipe.pricePerServing,
        popularity: recipe.spoonacularScore
      }
    })
    updateRecipeList(recipes) // Update the UI with the fetched recipes
  })
  .catch((error) => {
    console.error("Error fetching data:", error)
  }) */

// DOM SELECTORS

const recipeGrid = document.getElementById("recipe-grid")
const resetFilter = document.getElementById("reset-filter")

// GLOBAL VARIABLES
// List for chosen diets
let dietFilters = []

// Global variable to keep the filtered recipes
let filteredRecipes = [...recipes]

// FUNCTIONS

const capitalizeWords = (str) => {
  return str
    .split(" ") // Divide the string into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" ") // Put the words back together again
}

const formatRecipes = (recipes) => {
  return recipes.map((recipe) => ({
    ...recipe,
    title: capitalizeWords(recipe.title),
    cuisine: capitalizeWords(recipe.cuisine),
    diets: recipe.diets.map((diet) => capitalizeWords(diet)),
    ingredients: recipe.ingredients.map((ingredient) =>
      capitalizeWords(ingredient)
    )
  }))
}

filteredRecipes = formatRecipes(filteredRecipes)

// Formatera recepten direkt vid sidan laddas
filteredRecipes = formatRecipes(filteredRecipes)

const toggleDropdown = (event) => {
  event.stopPropagation() // Prevent the dropdown from closing when clicking on the dropdown itself

  // Find the closest .custom-select for the clicked element
  const dropdown = event.currentTarget.closest(".custom-select")

  // Close all other dropdowns only if the clicked dropdown is not already active
  if (!dropdown.classList.contains("active")) {
    document.querySelectorAll(".custom-select").forEach((select) => {
      select.classList.remove("active")
    })
  }

  // Toggle the active state of the clicked dropdown
  dropdown.classList.toggle("active")
}

const selectedOption = (event) => {
  // Get the selected option
  const option = event.currentTarget

  // Dropdown is now a local variable!
  const dropdown = option.closest(".custom-select")

  // Update the dropdown's heading with the chosen option
  dropdown.querySelector(".selected-option").textContent =
    option.textContent.trim()
  // Close the dropdown after selection
  dropdown.classList.remove("active")

  if (dropdown.dataset.filterType === "sort") {
    getSortOrder() // Call the sort function
  } else {
    filterRecipes()
  }
}

const filterRecipes = () => {
  // Get selected filters
  const timeFilter = document
    .querySelector('[data-filter-type="time"] .selected-option')
    .textContent.trim()

  const ingredientFilter = document
    .querySelector('[data-filter-type="ingredients"] .selected-option')
    .textContent.trim()

  const cuisineFilter = document
    .querySelector('[data-filter-type="cuisine"] .selected-option')
    .textContent.trim()

  const dietFilter = document
    .querySelector('[data-filter-type="diet"] .selected-option')
    .textContent.trim()

  // Check if recipes exists
  if (!recipes || recipes.length === 0) {
    recipeGrid.innerHTML = "<p>No recipes found.</p>"
    console.warn("No recipes available to filter")
    return
  }

  // Filter the recipes
  filteredRecipes = recipes.filter((recipe) => {
    // Assume match unless proven otherwise
    let timeMatch = true
    let ingredientMatch = true
    let cuisineMatch = true
    let dietMatch = true

    // Time filter
    // Check if a specific time is selected, otherwise, all times are included
    if (timeFilter !== "All times") {
      if (timeFilter === "Under 15 min") {
        timeMatch = recipe.readyInMinutes < 15
      } else if (timeFilter === "15-30 min") {
        timeMatch = recipe.readyInMinutes >= 15 && recipe.readyInMinutes <= 30
      } else if (timeFilter === "31-60 min") {
        timeMatch = recipe.readyInMinutes >= 31 && recipe.readyInMinutes <= 60
      } else if (timeFilter === "Over 60 min") {
        timeMatch = recipe.readyInMinutes > 60
      }
    }

    // Ingredient filter
    // Check if a specific number of ingredient is selected, otherwise, all number of ingredient are included
    if (ingredientFilter !== "All ingredients") {
      if (ingredientFilter === "Under 5 ingredients") {
        ingredientMatch = recipe.ingredients.length < 5
      } else if (ingredientFilter === "5-10 ingredients") {
        ingredientMatch =
          recipe.ingredients.length >= 5 && recipe.ingredients.length <= 10
      } else if (ingredientFilter === "11-15 ingredients") {
        ingredientMatch =
          recipe.ingredients.length >= 11 && recipe.ingredients.length <= 15
      } else if (ingredientFilter === "Over 15 ingredients") {
        ingredientMatch = recipe.ingredients.length > 15
      }
    }

    // Cuisine filter
    if (cuisineFilter !== "All cuisines") {
      cuisineMatch = recipe.cuisine === cuisineFilter
    }

    // Diet filter: Recipes must match all selected diets
    if (dietFilters.length > 0) {
      dietMatch = dietFilters.every((diet) => recipe.diets.includes(diet))
    } else {
      dietMatch = true // If no diet is selected, all recipes are included
    }
    return timeMatch && ingredientMatch && cuisineMatch && dietMatch
  })
  // Update the UI with the filtered recipes
  sortRecipes(
    document
      .querySelector('[data-filter-type="sort"] .selected-option')
      .textContent.trim()
  )
  filteredRecipes = formatRecipes(filteredRecipes)
  updateRecipeList(filteredRecipes)
}

const toggleDiet = (event) => {
  const option = event.currentTarget
  const diet = option.textContent.trim()

  if (option.dataset.selected === "false") {
    option.dataset.selected = "true"
    dietFilters.push(diet) // Add diet to the dietFilters list
  }
  // Remove the diet from the list
  else {
    // Mark as false when unmarking
    option.dataset.selected = "false"
    dietFilters = dietFilters.filter((item) => item !== diet) // Remove diet from the dietFilters list
  }

  // Update the text in the dropdown heading
  const dropdown = option.closest(".custom-select")
  const selectedText =
    dietFilters.length > 0 ? dietFilters.join(", ") : "All diets"
  dropdown.querySelector(".selected-option").textContent = selectedText

  filterRecipes()
}

const updateRecipeList = (filteredRecipes) => {
  const recipeGrid = document.getElementById("recipe-grid")
  // Clear the grid before adding new recipes
  recipeGrid.innerHTML = ""

  // Check if there are no recipes to display
  if (!filteredRecipes || filteredRecipes.length === 0) {
    recipeGrid.innerHTML = `<p>No recipes found.</p>`
    return
  }

  filteredRecipes.forEach((recipe) => {
    const recipeCard = document.createElement("div")
    recipeCard.classList.add("recipe-card")

    // Create a list of ingredients
    const ingredientsHTML = recipe.ingredients
      .map((ingredient) => `<li>${ingredient}</li>`)
      .join("")

    // Add recipe details inside the div
    recipeCard.innerHTML = `
     <img src="${recipe.image}" alt="${recipe.title}">
    <h3>${recipe.title}</h3>
    <p><b>Cuisine:</b> ${recipe.cuisine}</p>
    <p><b>Diet:</b> ${recipe.diets.join(", ")}</p>
    <p><b>Time:</b> ${recipe.readyInMinutes} min </p>
    <p><b>Servings:</b> ${recipe.servings}</p>
    <hr>
    <p><b>Ingredients:</b></p>
    <ul>
    ${ingredientsHTML}
    </ul>
    `
    // Append the recipe card to the recipe grid
    recipeGrid.appendChild(recipeCard)
  })
}

// Random Recipe Generator
const generateRandomRecipe = () => {
  // Get a random recipe from the array
  const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)]
  // Update the UI with the random recipe
  updateRecipeList([randomRecipe])
}

// Get the selected sort order for the currently displayed recipes
const getSortOrder = () => {
  console.log("getSortOrder() is running!")

  const sortOrder = document
    .querySelector('[data-filter-type="sort"] .selected-option')
    .textContent.trim()
  console.log("Selected sort order:", sortOrder)

  sortRecipes(sortOrder)
}

const sortRecipes = (order) => {
  console.log("Sorting order:", order)

  // Get all the current recipes in the UI
  let sortedRecipes = [...filteredRecipes]

  if (order === "Ascending") {
    sortedRecipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes)
  } else if (order === "Descending") {
    sortedRecipes.sort((a, b) => b.readyInMinutes - a.readyInMinutes)
  }

  // Update the UI with the sorted recipes
  updateRecipeList(sortedRecipes)
}

const resetFilters = () => {
  // Reset the filtered recipes to the original list
  filteredRecipes = formatRecipes([...recipes])
  updateRecipeList(filteredRecipes)

  // Close open dropdowns
  document.querySelectorAll(".custom-select").forEach((select) => {
    select.classList.remove("active")
  })

  document.querySelectorAll(".selected-option").forEach((option) => {
    // Reset the text content of the dropdown heading, depending on the filter type
    option.textContent =
      option.closest(".custom-select").dataset.filterType === "diet"
        ? "All diets"
        : option.closest(".custom-select").dataset.filterType === "cuisine"
        ? "All cuisines"
        : option.closest(".custom-select").dataset.filterType === "time"
        ? "All times"
        : option.closest(".custom-select").dataset.filterType === "ingredients"
        ? "All ingredients"
        : "All"
  })
  dietFilters = []

  // Reset the selected state of the diet options
  document
    .querySelectorAll('[data-filter-type="diet"] .option')
    .forEach((option) => {
      option.dataset.selected = "false"
    })

  filterRecipes()
}

// EVENT LISTENERS
// (only add them once!)
document.addEventListener("DOMContentLoaded", () => {
  updateRecipeList(filteredRecipes) // Loads all recipes at the start
})

document.querySelectorAll(".recipe-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.border = "2px solid #0018a4"
    card.style.boxShadow = "0px 0px 30px 0px rgba(0, 24, 164, 0.2)"
  })

  card.addEventListener("mouseleave", () => {
    card.style.border = "1px solid #e9e9e9"
    card.style.boxShadow = "none"
  })
})

document.getElementById("random-button").addEventListener("click", () => {
  generateRandomRecipe()
})

document.getElementById("reset-filter").addEventListener("click", resetFilters)
