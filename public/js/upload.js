document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const placeholder = document.querySelector('.upload-placeholder');
  
    fileInput.addEventListener('change', (event) => {
      const [file] = event.target.files;
      if (file) {
        placeholder.src = URL.createObjectURL(file);
      }
    });
  });
  