// DOM selectors
const messageBox = document.getElementById("message-box")
const filterSelects = document.querySelectorAll('.custom-select')

function toggleDropdown(event) {
  event.stopPropagation();
  // Find the correct custom-select that belongs with the clicked select-box
  const selectContainer = event.currentTarget.parentElement;
  selectContainer.classList.toggle('active');
}

function selectOption(value, event) {
  event.stopPropagation();
  // Find the correct custom-select container 
  const selectContainer = event.currentTarget.closest('.custom-select');
  const selectedOption = selectContainer.querySelector('.selected-option');
  
  // Set the chosen value and close the dropdown
  selectedOption.textContent = value;
  selectContainer.classList.remove('active');

  // Save the value in a data attribute for later use
  selectContainer.dataset.value = value;

  // Create and invoke a custom 'change' event on this custom-select
  const changeEvent = new Event('change', { bubbles: true });
  selectContainer.dispatchEvent(changeEvent);
}

// Closes all the open dropdowns if clicking outside of them 
document.addEventListener('click', function(event) {
  document.querySelectorAll('.custom-select').forEach(function(select) {
    if (!select.contains(event.target)) {
      select.classList.remove('active');
    }
  });
});

// Listen for 'change' event for each custom-select
filterSelects.forEach(select => {
  select.addEventListener('change', event => {
    // Get the chosen value from the data attribute
    const selectedValue = select.dataset.value;
    // Get the type of filter via a data attribute (make sure it's in the HTML, t.ex. data-filter-type="ingredients")
    const filterType = select.dataset.filterType;
    
    // Log and print the results
    console.log(`Chosen filter type: ${filterType} - Value: ${selectedValue}`);
    messageBox.innerHTML += `<p>Chosen filter type: ${filterType} - Value: ${selectedValue}</p>`;

    // Exempel: anropa en funktion för att uppdatera recepten
    // updateRecipeList(filterType, selectedValue);
  })
});