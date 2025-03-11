// DOM SELECTORS

const recipeGrid = document.getElementById("recipe-grid")
const resetFilter = document.getElementById("reset-filter")

// GLOBAL VARIABLES
const URL =
  "https://api.spoonacular.com/recipes/random?apiKey=690ac6592da546bc9d81f64e827555ff&number=8"

// Empty array to store the fetched recipes
let recipes = []

// Total number of recipes fetched
let totalRecipesFetched =
  parseInt(localStorage.getItem("totalRecipesFetched")) || 0

// List for chosen diets
let dietFilters = []

// Global variable to keep the filtered recipes
let filteredRecipes = [...recipes]

// FUNCTIONS

// Fetch recipes from the Spoonacular API
fetch(URL)
  .then((response) => response.json()) // Convert the response to JSON
  .then((data) => {
    // Keep track of the number of fetched recipes
    totalRecipesFetched += data.recipes.length // Update the counter
    localStorage.setItem("totalRecipesFetched", totalRecipesFetched) // Save in localStorage
    console.log("Total recipes fetched today:", totalRecipesFetched) // Check the value
    // Store the fetched recipes in the recipes array
    recipes = data.recipes.map((recipe) => {
      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        likes: recipe.aggregateLikes,
        dishTypes: recipe.dishTypes,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        sourceUrl: recipe.sourceUrl,
        diets: Array.isArray(recipe.diets) ? recipe.diets : [],
        cuisine: Array.isArray(recipe.cuisines)
          ? recipe.cuisines[0]
          : "Unknown",
        ingredients: Array.isArray(recipe.extendedIngredients)
          ? recipe.extendedIngredients.map((ingredient) => ingredient.original)
          : [],
        pricePerServing: recipe.pricePerServing,
        popularity: recipe.spoonacularScore
      }
    })
    checkRecipeLimit() // Check if the recipe limit is reached
    resetRecipeCountAtMidnight() // Reset the recipe count at midnight
    updateRecipeList(formatRecipes(recipes)) // Update the UI with the fetched and formatted recipes
  })
  .catch((error) => {
    console.error("Error fetching data:", error)
    recipeGrid.innerHTML =
      "<p class='warning'>Failed to load recipes. Please try again later.</p>"
  })

// Reset the recipe count at midnight
const resetRecipeCountAtMidnight = () => {
  const today = new Date().toISOString().split("T")[0] // Get today's date in YYYY-MM-DD format
  const lastFetchDate = localStorage.getItem("lastFetchDate")

  if (lastFetchDate !== today) {
    localStorage.setItem("totalRecipesFetched", 0) // Reset the counter to 0
    localStorage.setItem("lastFetchDate", today) // Update the date
    console.log("New day detected, resetting recipe count!")
  }
}

// Check if the recipe limit is reached
const checkRecipeLimit = () => {
  if (totalRecipesFetched >= 150) {
    recipeGrid.insertAdjacentHTML(
      "beforeend",
      "<p class='warning'>Daily recipe limit reached!</p>"
    )
    console.log("Daily recipe limit reached!")
  }
}

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
    cuisine:
      Array.isArray(recipe.cuisines) && recipe.cuisines.length
        ? capitalizeWords(recipe.cuisines.join(", "))
        : "Unknown",
    dishTypes: recipe.dishTypes.map((dishType) => capitalizeWords(dishType)),
    diets: recipe.diets.map((diet) => capitalizeWords(diet)),
    ingredients: recipe.ingredients.map((ingredient) =>
      capitalizeWords(ingredient)
    )
  }))
}

// Format the recipes directly when the page loads
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
    console.warn("No recipes available to filter")
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
          recipe.ingredients.length >= 5 && recipe.ingredients.length <= 10
      } else if (ingredientFilter === "11-15 ingredients") {
        ingredientMatch =
          recipe.ingredients.length >= 11 && recipe.ingredients.length <= 15
      } else if (ingredientFilter === "Over 15 ingredients") {
        ingredientMatch = recipe.ingredients.length > 15
      }
    }

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

    // Dish types filter
    if (dishTypeFilter !== "All dish types") {
      dishTypeMatch = recipe.dishTypes.includes(dishTypeFilter)
    } else if (dishTypeFilter === "Breakfast") {
      dishTypeMatch = recipe.dishTypes.includes("breakfast")
    } else if (dishTypeFilter === "Lunch") {
      dishTypeMatch = recipe.dishTypes.includes("lunch")
    } else if (dishTypeFilter === "Dinner") {
      dishTypeMatch = recipe.dishTypes.includes("dinner")
    } else if (dishTypeFilter === "Dessert") {
      dishTypeMatch = recipe.dishTypes.includes("dessert")
    }

    // Cuisine filter
    if (cuisineFilter !== "All cuisines") {
      cuisineMatch = recipe.cuisine === cuisineFilter
    }

    // Diet filter: Recipes must match all selected diets
    if (dietFilters.length > 0) {
      dietMatch = dietFilters.every((diet) =>
        recipe.diets.map((d) => d.toLowerCase()).includes(diet.toLowerCase())
      )
    } else {
      dietMatch = true // If no diet is selected, all recipes are included
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
    dietFilters.length > 0
      ? dietFilters.map((d) => capitalizeWords(d)).join(", ")
      : "All diets"
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
    <p><b>Likes:</b> ${recipe.aggregateLikes}</p>
    <p><b>Dish type:</b> ${recipe.dishTypes.join(", ")}</p>
    <p><b>Cuisine:</b> ${recipe.cuisines}</p>
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

  if (order === "Sort by time") {
    sortedRecipes.sort(
      (a, b) => (b.readyInMinutes || 0) - (a.readyInMinutes || 0)
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
  // Reset the filtered recipes to all recipes
  filteredRecipes = formatRecipes([...recipes])
  updateRecipeList(filteredRecipes)

  // Update the UI after a short delay
  setTimeout(() => {
    updateRecipeList(filteredRecipes)
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

// EVENT LISTENERS
// (only add them once!)
document.addEventListener("DOMContentLoaded", () => {
  updateRecipeList(filteredRecipes) // Loads all recipes at the start
})

document.getElementById("random-button").addEventListener("click", () => {
  generateRandomRecipe()
})

document.getElementById("reset-filter").addEventListener("click", resetFilters)
