function toggleDropdown(event) {
  event.stopPropagation();
  // Hitta det custom-select-element som är relaterat till det klickade select-boxen
  const selectContainer = event.currentTarget.parentElement;
  selectContainer.classList.toggle('active');
}

function selectOption(value, event) {
  event.stopPropagation();
  // Hitta rätt custom-select container
  const selectContainer = event.currentTarget.closest('.custom-select');
  const selectedOption = selectContainer.querySelector('.selected-option');
  selectedOption.textContent = value;
  selectContainer.classList.remove('active');
}

// Stänger alla öppna dropdowns om man klickar utanför
document.addEventListener('click', function(event) {
  document.querySelectorAll('.custom-select').forEach(function(select) {
    if (!select.contains(event.target)) {
      select.classList.remove('active');
    }
  });
});