// DOM SELECTORS
// Function to get DOM elements by ID
const getElement = (id) => document.getElementById(id)

const elements = {
  recipeGrid: document.getElementById("recipe-grid"),
  resetButton: document.getElementById("reset-button"),
  searchRecipes: document.getElementById("search-input"),
  randomButton: document.getElementById("random-button"),
  selectBoxes: document.querySelectorAll(".select-box"), // All select-boxes
  options: document.querySelectorAll(".custom-select .option")
}

// GLOBAL VARIABLES
const URL =
  "https://api.spoonacular.com/recipes/random?apiKey=690ac6592da546bc9d81f64e827555ff&number=100"
let recipes = []
let totalRecipesFetched =
  parseInt(localStorage.getItem("totalRecipesFetched")) || 0
let dietFilters = []
let filteredRecipes = [...recipes]
let currentPage = 1
const recipesPerPage = 8

const cuisineCategories = {
  European: [
    "Italian",
    "French",
    "Spanish",
    "Greek",
    "German",
    "Swedish",
    "English",
    "British",
    "Irish",
    "Scottish",
    "Mediterranean"
  ],
  Asian: [
    "Chinese",
    "Japanese",
    "Korean",
    "Thai",
    "Vietnamese",
    "Indian",
    "Filipino",
    "Pakistani",
    "Bangladeshi",
    "Sri Lankan"
  ],
  MiddleEastern: ["Turkish", "Lebanese", "Persian", "Israeli"],
  American: ["Mexican", "Cajun", "Tex-Mex", "Southern"],
  African: ["North African", "Ethiopian", "West African"],
  Oceanian: ["Australian", "Polynesian"]
}

//// FUNCTIONS ////

const loadingMessage = () => {
  elements.recipeGrid.innerHTML = `<h3 class="loading-message">Loading recipes...</h3>`
}

// Save recipes to localStorage
const saveRecipesToLocalStorage = () => {
  localStorage.setItem("recipes", JSON.stringify(recipes))
}

const matchCuisineCategory = (cuisines) => {
  if (!Array.isArray(cuisines) || cuisines.length === 0) {
    return "Unknown"
  }

  for (let category in cuisineCategories) {
    if (
      cuisines &&
      cuisines.some((cuisine) => cuisineCategories[category].includes(cuisine))
    )
      return category // Returns the category that first matches
  }
  return "Unknown"
}

const formatRecipes = (recipes) => {
  return recipes.map((recipe) => {
    let cuisineCategory = matchCuisineCategory(recipe.cuisines)

    return {
      ...recipe,
      title: recipe.title ? capitalizeWords(recipe.title) : "Unknown title",
      cuisine: cuisineCategory,
      dishTypes: Array.isArray(recipe.dishTypes)
        ? recipe.dishTypes.map((dishType) => capitalizeWords(dishType))
        : [],
      diets: Array.isArray(recipe.diets)
        ? recipe.diets.map((diet) => capitalizeWords(diet))
        : []
    }
  })
}

const handleErrorMessages = (error) => {
  console.error("Error detected:", error)

  let message = "An unexpected error occurred. Please try again."
  let messageType = "warning"

  if (typeof error === "object" && error !== null) {
    if (error.status === "failure" && error.code === 402) {
      console.log("API Quota exceeded - 402 detected in API response.")
      message = "API Quota exhausted! You have reached the daily limit."
      messageType = "error"
    }
  } else if (
    typeof error === "string" &&
    error.toLowerCase().includes("networkerror")
  ) {
    console.log("Network error detected!")
    message = "No internet connection. Please check your network."
    messageType = "error"
  } else if (
    error instanceof DOMException &&
    error.name === "QuotaExceededError"
  ) {
    console.log("LocalStorage quota exceeded!")
    message = "LocalStorage is full! Please clear some space."
    messageType = "error"
  } else if (
    typeof error === "string" &&
    error.toLowerCase().includes("quota")
  ) {
    console.log("API Quota exhausted!")
    message = "API Quota exhausted! You have reached the daily limit."
    messageType = "error"
  } else {
    console.error("Error fetching data:", error)
    message = "Failed to load recipes. Please try again later."
  }

  // Update the message in the HTML
  const errorContainer = document.getElementById("error-container")
  if (errorContainer) {
    // Clear recipeGrid when displaying the error message
    elements.recipeGrid.innerHTML = ""
    errorContainer.innerHTML = `<h3>${message}</h3>`
    errorContainer.className = messageType
    errorContainer.style.display = "block"
  }
}

const fetchRecipes = () => {
  // Fetch recipes from the Spoonacular API
  fetch(URL)
    .then((response) => {
      // Throw extra error to find what's wrong in the case that something is
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json() // Convert the response to JSON
    })
    .then((data) => {
      // If the API answers with "failure" and the code 402
      if (data.status === "failure" && data.code === 402) {
        throw data
      }

      // Keep track of the number of fetched recipes
      totalRecipesFetched += data.recipes.length // Update the counter

      // Store the fetched recipes in the recipes array
      recipes = data.recipes.map((recipe) => {
        return {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          dishTypes: Array.isArray(recipe.dishTypes) ? recipe.dishTypes : [],
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          sourceUrl: recipe.sourceUrl,
          diets: Array.isArray(recipe.diets) ? recipe.diets : [],
          cuisines: Array.isArray(recipe.cuisines) ? recipe.cuisines : [],
          ingredients: Array.isArray(recipe.extendedIngredients)
            ? recipe.extendedIngredients.map(
                (ingredient) => ingredient.original
              )
            : []
        }
      })

      console.log("Fetched recipes from API:", recipes) // Debug: Log the fetched recipes
      saveRecipesToLocalStorage() // Save the recipes in localStorage
      recipes = formatRecipes(recipes) // Format the recipes
      filteredRecipes = [...recipes] // Update the filtered recipes
      updatePaginatedRecipes(recipes) // Update the UI with the correct number of recipes per page
    })
    .catch((error) => {
      handleErrorMessages(error)
    })
}

// Load recipes from localStorage
const loadRecipesFromLocalStorage = () => {
  const storedRecipes = localStorage.getItem("recipes")
  // If there are no recipes saved locally
  if (!storedRecipes) {
    fetchRecipes()
    return
  }
  recipes = JSON.parse(storedRecipes)
  console.log("Loading recipes from localStorage:", recipes)
  recipes = formatRecipes(recipes)
  filteredRecipes = [...recipes]
  updatePaginatedRecipes()
}

const addRecipeInfoToCard = (recipe, recipeCard) => {
  // Get the ingredientsHTML variable from createListOfIngredients()
  const ingredientsHTML = createListOfIngredients(recipe)
  // Add recipe details inside the div
  recipeCard.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.title}">
    <h3>${recipe.title}</h3>
    <p><b>Dish type:</b> ${recipe.dishTypes.join(", ")}</p>
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
}

const createListOfIngredients = (recipe) => {
  let ingredientsHTML = ""
  // Create a list of ingredients
  if (!recipe.ingredients) {
    ingredientsHTML = `<li>Ingredients not available</li>`
  } else {
    ingredientsHTML = recipe.ingredients
      .map((ingredient) => `<li>${ingredient}</li>`)
      .join("")
  }
  return ingredientsHTML
}

const noRecipesToDisplay = () => {
  if (!filteredRecipes || filteredRecipes.length === 0) {
    elements.recipeGrid.innerHTML = `<p>No recipes found.</p>`
    return
  }
}

const createRecipeCard = (updatePaginatedRecipes) => {
  // Create a card for each recipe
  updatePaginatedRecipes.forEach((recipe) => {
    const recipeCard = document.createElement("div")
    recipeCard.classList.add("recipe-card")

    // Create list of ingredients and then add the recipe info to the card
    createListOfIngredients(recipe)
    addRecipeInfoToCard(recipe, recipeCard)

    // Append the recipe card to the recipe grid
    elements.recipeGrid.appendChild(recipeCard)
  })
}

// Update the UI with recipes
const updateRecipeList = (recipes) => {
  // Clear the grid before adding new recipes
  elements.recipeGrid.innerHTML = ""

  // Check if there are no recipes to display
  noRecipesToDisplay()

  // Create a card for each recipe
  createRecipeCard(recipes)
}

const fetchNewRecipes = () => {
  fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      // If the API answers with "failure" and the code 402
      if (data.status === "failure" && data.code === 402) {
        throw data
      }

      if (!data.recipes || data.recipes.length === 0) {
        console.warn("No new recipes fetched!")
        throw new Error("No recipes found.")
      }

      totalRecipesFetched += data.recipes.length

      // Filter out possible undefined objects
      let newRecipes = data.recipes
        .filter((recipe) => recipe !== undefined)
        .map((recipe) => {
          return {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            dishTypes: Array.isArray(recipe.dishTypes) ? recipe.dishTypes : [],
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            sourceUrl: recipe.sourceUrl,
            diets: Array.isArray(recipe.diets) ? recipe.diets : [],
            cuisine: Array.isArray(recipe.cuisines)
              ? recipe.cuisines[0]
              : "Unknown",
            ingredients: Array.isArray(recipe.extendedIngredients)
              ? recipe.extendedIngredients.map(
                  (ingredient) => ingredient.original
                )
              : []
          }
        })

      recipes = [...recipes, ...newRecipes] // Add new recipes to the array.
      recipes = formatRecipes(recipes) // Format new recipes
      saveRecipesToLocalStorage() // Save the recipes in localStorage
      filteredRecipes = [...recipes] // Update the filtered recipes
      updatePaginatedRecipes()
    })
    .catch((error) => {
      handleErrorMessages(error)
    })
}

const capitalizeWords = (str) => {
  if (!str) return "" // If str is null/undefined - return an empty string
  if (Array.isArray(str)) str = str.join(" ") // If it's an array - make it a string
  return str
    .split(" ") // Seperate into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Captalize every word
    .join(" ") // Join them together again
}

const searchRecipes = () => {
  let searchInput = document
    .getElementById("search-input")
    .value.trim()
    .toLowerCase()

  // Start with all recipes when searching from scratch
  let baseRecipes = recipes

  // If search is empty, use the filtered recipes or all recipes
  if (!searchInput) {
    filterRecipes()
    return
  }

  // Search within filtered recipes if they exist
  let dataToSearch = filteredRecipes.length > 0 ? filteredRecipes : baseRecipes

  let searchResults = dataToSearch.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchInput) ||
      (Array.isArray(recipe.ingredients) &&
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchInput)
        ))
  )
  // Update filteredRecipes to maintain state
  filteredRecipes = searchResults
  updatePaginatedRecipes()
}

function toggleDropdown(event) {
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

  if (!dropdown) {
    console.warn("Dropdown container not found for option:", option)
    return
  }

  // Update the dropdown's heading with the chosen option
  dropdown.querySelector(".selected-option").textContent =
    option.textContent.trim()
  // Close the dropdown after selection
  dropdown.classList.remove("active")

  if (dropdown.dataset.filterType === "sort") {
    filterRecipes()
    sortRecipes(option.textContent.trim())
  } else {
    filterRecipes()
  }

  console.log("Filter type: ", dropdown.dataset.filterType)
}

const timeFilter = (recipe) => {
  //Assume it is true at first
  let timeMatch = true
  const timeFilter = document
    .querySelector('[data-filter-type="time"] .selected-option')
    .textContent.trim()

  // Check if a specific time is selected, otherwise, all times are included
  if (timeFilter !== "All times") {
    if (timeFilter === "Under 30 min") {
      timeMatch = recipe.readyInMinutes < 30
    } else if (timeFilter === "30-60 min") {
      timeMatch = recipe.readyInMinutes >= 30 && recipe.readyInMinutes <= 60
    } else if (timeFilter === "61-90 min") {
      timeMatch = recipe.readyInMinutes >= 61 && recipe.readyInMinutes <= 90
    } else if (timeFilter === "Over 90 min") {
      timeMatch = recipe.readyInMinutes > 90
    }
  }
  return timeMatch
}

const ingredientFilter = (recipe) => {
  let ingredientMatch = true

  const ingredientFilter = document
    .querySelector('[data-filter-type="ingredients"] .selected-option')
    .textContent.trim()

  // Check if a specific number of ingredient is selected, otherwise, all number of ingredient are included
  if (ingredientFilter !== "All ingredients") {
    if (ingredientFilter === "Under 5 ingredients") {
      ingredientMatch = recipe.ingredients.length < 5
    } else if (ingredientFilter === "5-10 ingredients") {
      ingredientMatch =
        recipe.ingredients.length > 4 && recipe.ingredients.length < 11
    } else if (ingredientFilter === "11-15 ingredients") {
      ingredientMatch =
        recipe.ingredients.length > 10 && recipe.ingredients.length < 16
    } else if (ingredientFilter === "Over 15 ingredients") {
      ingredientMatch = recipe.ingredients.length > 15
    }
  }
  return ingredientMatch
}

const dishTypeFilter = (recipe) => {
  let dishTypeMatch = true

  const dishTypeFilter = document
    .querySelector('[data-filter-type="dish-type"] .selected-option')
    .textContent.trim()

  if (dishTypeFilter !== "All dish types") {
    dishTypeMatch = recipe.dishTypes
      .map((dt) => dt.toLowerCase())
      .includes(dishTypeFilter.toLowerCase())
  }
  return dishTypeMatch
}

const cuisineFilter = (recipe) => {
  let cuisineMatch = true

  const cuisineFilter = document
    .querySelector('[data-filter-type="cuisine"] .selected-option')
    .textContent.trim()

  if (cuisineFilter !== "All cuisines") {
    cuisineMatch = Array.isArray(recipe.cuisine)
      ? recipe.cuisine.includes(cuisineFilter)
      : recipe.cuisine === cuisineFilter
  }
  return cuisineMatch
}

const dietFilter = (recipe) => {
  let dietMatch = true

  const dietFilter = document
    .querySelector('[data-filter-type="diet"] .selected-option')
    .textContent.trim()

  // Diet filter: Recipes must match all selected diets
  if (dietFilters.length > 0) {
    dietMatch = dietFilters.every((diet) =>
      recipe.diets.map((d) => d.toLowerCase()).includes(diet.toLowerCase())
    )
  }
  return dietMatch
}

const filterRecipes = () => {
  // Reset to page 1 for each filter
  currentPage = 1

  // Check if recipes exists
  if (!recipes || recipes.length === 0) {
    elements.recipeGrid.innerHTML = "<p>No recipes found.</p>"
    console.warn("No recipes available to filter.")
    return
  }

  // Filter the recipes
  filteredRecipes = recipes.filter((recipe) => {
    const timeMatch = timeFilter(recipe)
    const ingredientMatch = ingredientFilter(recipe)
    const dishTypeMatch = dishTypeFilter(recipe)
    const cuisineMatch = cuisineFilter(recipe)
    const dietMatch = dietFilter(recipe)

    return (
      timeMatch && ingredientMatch && dishTypeMatch && cuisineMatch && dietMatch
    )
  })

  // Update the UI with the filtered recipes
  sortRecipes(
    document
      .querySelector('[data-filter-type="sort"] .selected-option')
      .textContent.trim()
  )
  updatePaginatedRecipes()
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
    dietFilters.length > 0
      ? dietFilters.map((d) => capitalizeWords(d)).join(", ")
      : "All diets"
  dropdown.querySelector(".selected-option").textContent = selectedText

  filterRecipes()
}

// Random Recipe Generator
const generateRandomRecipe = () => {
  // Turn off pagination
  document.getElementById("pagination-controls").style.display = "none"
  // Get a random recipe from the array
  const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)]
  // Update the UI with the random recipe
  updateRecipeList([randomRecipe])
}

// Get the selected sort order for the currently displayed recipes
const getSortOrder = () => {
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

  if (order === "Sort by time") {
    // Shortest time first
    sortedRecipes.sort(
      (a, b) => (a.readyInMinutes || 0) - (b.readyInMinutes || 0)
    )
  } else if (order === "Sort by popularity") {
    // Most popular recipe first
    sortedRecipes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
  }

  // Update the UI with the sorted recipes
  updateRecipeList(sortedRecipes)
}

const resetFilters = () => {
  // If they array is empty, the recipes are not loaded yet
  if (!recipes.length) {
    console.warn("Recipes not loaded yet. Reset delayed.")
    return
  }

  // Turn on the pagination again if the last page was "random recipe"
  document.getElementById("pagination-controls").style.display = "flex"

  // Reset the filtered recipes to all recipes
  filteredRecipes = [...recipes]
  filterRecipes()

  // Update the UI after a short delay
  setTimeout(() => {
    filterRecipes()
  }, 10) // 1 sec

  // Close open dropdowns
  document.querySelectorAll(".custom-select").forEach((select) => {
    const filterType = select.dataset.filterType
    const selectedOption = select.querySelector(".selected-option")
    selectedOption.textContent =
      filterType === "diet"
        ? "All diets"
        : filterType === "cuisine"
        ? "All cuisines"
        : filterType === "dish-type"
        ? "All dish types"
        : filterType === "time"
        ? "All times"
        : filterType === "ingredients"
        ? "All ingredients"
        : "Choose an alternative"
  })

  // Reset the diet filters
  dietFilters = []
  // Reset the selected state of the diet options
  document
    .querySelectorAll('[data-filter-type="diet"] .option')
    .forEach((option) => {
      option.dataset.selected = "false"
    })
  filterRecipes()
}

const updatePaginationButtons = () => {
  document.getElementById(
    "page-info"
  ).textContent = `Page ${currentPage} of ${Math.ceil(
    filteredRecipes.length / recipesPerPage
  )}`

  document.getElementById("prev-page").disabled = currentPage === 1
  document.getElementById("next-page").disabled =
    currentPage === Math.ceil(filteredRecipes.length / recipesPerPage)
}

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--
    console.log(`Page changed to: ${currentPage}`)
    updatePaginatedRecipes()
  }
})

document.getElementById("next-page").addEventListener("click", () => {
  if (currentPage < Math.ceil(filteredRecipes.length / recipesPerPage)) {
    currentPage++
    console.log(`Page changed to: ${currentPage}`)
    updatePaginatedRecipes()
  }
})

const updatePaginatedRecipes = () => {
  const startIndex = (currentPage - 1) * recipesPerPage
  const endIndex = startIndex + recipesPerPage
  const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex)

  console.log(
    `Showing recipes ${startIndex + 1} to ${endIndex} out of ${
      filteredRecipes.length
    }`
  )

  updateRecipeList(paginatedRecipes)
  updatePaginationButtons()
}

const initializeEventListeners = () => {
  elements.resetButton.addEventListener("click", resetFilters)
  elements.randomButton.addEventListener("click", generateRandomRecipe)
  elements.searchRecipes.addEventListener("input", searchRecipes)
  elements.selectBoxes.forEach((box) => {
    box.addEventListener("click", toggleDropdown)
  })
  elements.options.forEach((option) => {
    // Check what dropdown the alternative belongs to
    const parentType = option.closest(".custom-select").dataset.filterType
    if (parentType === "diet") {
      option.addEventListener("click", toggleDiet)
    } else if (parentType === "sort") {
      option.addEventListener("click", selectedOption)
    } else {
      option.addEventListener("click", selectedOption)
    }
  })
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("offline", () => {
    handleErrorMessages()
  })
  loadingMessage()

  setTimeout(() => {
    if (!recipes || recipes.length === 0) {
      loadRecipesFromLocalStorage()
    } else {
      fetchRecipes()
    }
    filteredRecipes = [...recipes]
    updatePaginatedRecipes()
    initializeEventListeners()
  }, 2000) //Timeout is set to 2s
})
