// DOM SELECTORS

const recipeGrid = document.getElementById("recipe-grid")
const resetFilter = document.getElementById("reset-filter")

// GLOBAL VARIABLES
const URL =
  "https://api.spoonacular.com/recipes/random?apiKey=690ac6592da546bc9d81f64e827555ff&number=100"

// Empty array to store the fetched recipes
let recipes = []

// Total number of recipes fetched
let totalRecipesFetched =
  parseInt(localStorage.getItem("totalRecipesFetched")) || 0

// List for chosen diets
let dietFilters = []

// Global variable to keep the filtered recipes
let filteredRecipes = [...recipes]

//Pagination variables
const recipesPerPage = 8
let currentPage = 1

// FUNCTIONS

// Save recipes to localStorage
const saveRecipesToLocalStorage = () => {
  localStorage.setItem("recipes", JSON.stringify(recipes))
}

// Load recipes from localStorage
const loadRecipesFromLocalStorage = () => {
  const storedRecipes = localStorage.getItem("recipes")
  console.log("Loading recipes from localStorage:", recipes)
  return storedRecipes ? JSON.parse(storedRecipes) : []
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
    if (!recipe.ingredients) {
      ingredientsHTML = `<li>Ingredients not available</li>`
    } else {
      ingredientsHTML = recipe.ingredients
        .map((ingredient) => `<li>${ingredient}</li>`)
        .join("")
    }

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

    // Append the recipe card to the recipe grid
    recipeGrid.appendChild(recipeCard)
  })
}

// Load recipes from localStorage
recipes = loadRecipesFromLocalStorage()

const fetchRecipes = () => {
  // Fetch recipes from the Spoonacular API
  if (recipes.length > 0) {
    updateRecipeList(recipes) // Used saved recipes from localStorage if there are any
  } else {
    fetch(URL)
      .then((response) => {
        console.log("Response from API:", response) // Debug: Log the response
        return response.json() // Convert the response to JSON
      })
      .then((data) => {
        // Keep track of the number of fetched recipes
        totalRecipesFetched += data.recipes.length // Update the counter
        console.log("Total recipes fetched today:", totalRecipesFetched) // Check the value
        // Store the fetched recipes in the recipes array
        recipes = data.recipes.map((recipe) => {
          console.log("Cuisine data:", recipe.cuisines)
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
        console.log("Fetched recipes from API:", recipes) // Debug: Log the fetched recipes
        saveRecipesToLocalStorage() // Save the recipes in localStorage
        recipes = formatRecipes(recipes) // Format the recipes
        filteredRecipes = [...recipes] // Update the filtered recipes
        updateRecipeList(recipes) // Update the UI with the fetched recipes
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
        recipeGrid.innerHTML =
          "<p class='warning'>Failed to load recipes. Please try again later.</p>"
      })
  }
}

fetchRecipes()

const fetchNewRecipes = () => {
  fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      console.log("Fetched data:", data) // Debug: Log the API's answer

      if (!data.recipes || data.recipes.length === 0) {
        console.warn("No new recipes fetched!")
        return // Stop this function if no new recipes are being collected
      }

      recipes = formatRecipes([...recipes, ...data.recipes]) // Add new recipes
      console.log(recipes)
      localStorage.setItem("recipes", JSON.stringify(recipes)) // Save them locally
      filteredRecipes = [...recipes] // Update the filtered recipes
      updatePaginatedRecipes()
      return recipes
    })
    .catch((error) => {
      console.error("Error fetching new recipes:", error)

      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        console.log("LocalStorage quota exceeded!")
        recipeGrid.innerHTML = `<h3>LocalStorage is full! Please clear some space.</h3>`
      } else if (error.toString().toLowerCase().includes("quota")) {
        console.log("API Quota exhausted!")
        recipeGrid.innerHTML = `<h3>API Quota exhausted! Daily recipe limit reached!</h3>`
      }
    })
}

const capitalizeWords = (str) => {
  return str
    .split(" ") // Divide the string into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" ") // Put the words back together again
}

const formatRecipes = (recipes) => {
  console.log("Formatting recipes...")
  return recipes.map((recipe) => ({
    ...recipe,
    title: recipe.title ? capitalizeWords(recipe.title) : "",
    cuisine: recipe.cuisines ? capitalizeWords(recipe.cuisines) : "Unknown",
    dishTypes: Array.isArray(recipe.dishTypes)
      ? recipe.dishTypes.map((dishType) => capitalizeWords(dishType))
      : [],
    diets: Array.isArray(recipe.diets)
      ? recipe.diets.map((diet) => capitalizeWords(diet))
      : [],
    ingredients: Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map((ingredient) => capitalizeWords(ingredient))
      : []
  }))
}

const searchRecipes = () => {
  let searchInput = document
    .getElementById("search-input")
    .value.trim()
    .toLowerCase()

  // Start with all recipes when searching from scratch
  let baseRecipes = recipes

  // In your search function, protect against undefined values

  if (!searchInput) {
    // Apply other filters first (optional)

    // If search is empty, use the filtered recipes or all recipes
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
  updateRecipeList(searchResults)
}

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
    filterRecipes()
    sortRecipes(option.textContent.trim())
  } else {
    filterRecipes()
  }

  console.log("Filter type: ", dropdown.dataset.filterType)
}

const filterRecipes = () => {
  // Reset to page 1 for each filter
  currentPage = 1

  // Get selected filters
  const timeFilter = document
    .querySelector('[data-filter-type="time"] .selected-option')
    .textContent.trim()

  const ingredientFilter = document
    .querySelector('[data-filter-type="ingredients"] .selected-option')
    .textContent.trim()

  const dishTypeFilter = document
    .querySelector('[data-filter-type="dish-type"] .selected-option')
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
    console.warn("No recipes available to filter.")
    return
  }

  // Filter the recipes
  filteredRecipes = recipes.filter((recipe) => {
    // Assume match unless proven otherwise
    let timeMatch = true
    let ingredientMatch = true
    let dishTypeMatch = true
    let cuisineMatch = true
    let dietMatch = true

    // Ingredient filter
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

    // Time filter
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

    // Dish types filter
    if (dishTypeFilter !== "All dish types") {
      dishTypeMatch = recipe.dishTypes
        .map((dt) => dt.toLowerCase())
        .includes(dishTypeFilter.toLowerCase())
    }

    // Cuisine filter
    if (cuisineFilter !== "All cuisines") {
      cuisineMatch = Array.isArray(recipe.cuisine)
        ? recipe.cuisine.includes(cuisineFilter)
        : recipe.cuisine === cuisineFilter
    }

    // Diet filter: Recipes must match all selected diets
    if (dietFilters.length > 0) {
      dietMatch = dietFilters.every((diet) =>
        recipe.diets.map((d) => d.toLowerCase()).includes(diet.toLowerCase())
      )
    } else {
      dietMatch = true
    }
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

  if (order === "Sort by time") {
    sortedRecipes.sort(
      (a, b) => (a.readyInMinutes || 0) - (b.readyInMinutes || 0)
    )
  } else if (order === "Sort by popularity") {
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
  updatePaginatedRecipes()

  // Update the UI after a short delay
  setTimeout(() => {
    updatePaginatedRecipes()
  }, 10)

  // Close open dropdowns
  document.querySelectorAll(".custom-select").forEach((select) => {
    select.classList.remove("active")
  })

  document
    .querySelectorAll(".custom-select .selected-option")
    .forEach((option) => {
      const filterType = option.closest(".custom-select").dataset.filterType
      option.textContent =
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

// EVENT LISTENERS
// (only add them once!)
document.addEventListener("DOMContentLoaded", () => {
  if (recipes.length === 0) {
    console.log("Recipes not loaded yet, fetching now...")
    fetch(URL) // ✅ Make sure to fetch the recipes if they are not loaded yet
  } else {
    filteredRecipes = [...recipes]
    updatePaginatedRecipes()
  }
})

document.getElementById("search-input").addEventListener("input", searchRecipes)

document.getElementById("random-button").addEventListener("click", () => {
  generateRandomRecipe()
})

document.getElementById("reset-filter").addEventListener("click", resetFilters)
