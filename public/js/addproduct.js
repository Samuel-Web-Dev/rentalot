document.addEventListener('DOMContentLoaded', (event) => {
    var dateInput = document.getElementById('date');
    var today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  });   