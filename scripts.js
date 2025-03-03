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

const recipes = [
  {
    id: 1,
    title: "Vegan Lentil Soup",
    image: "./chicken.webp",
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
    image: "./chicken.webp",
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
    image: "./chicken.webp",
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
    image: "./chicken.webp",
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
    image: "./chicken.webp",
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
    image: "./chicken.webp",
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
    image: "./chicken.webp",
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
