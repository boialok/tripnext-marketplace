(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })
})()

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Auto-dismiss flash alerts after 2 seconds (2000 milliseconds)
  setTimeout(() => {
      const alertElements = document.querySelectorAll('.alert');
      alertElements.forEach((alert) => {
          // Use Bootstrap's built-in Alert API to fade it out smoothly
          let bsAlert = bootstrap.Alert.getInstance(alert);
          if (!bsAlert) {
              bsAlert = new bootstrap.Alert(alert);
          }
          bsAlert.close();
      });
  }, 2000);

  // 2. Wishlist Asynchronous Fetch Logic
  const wishlistIcons = document.querySelectorAll('.wishlist-icon');
  
  wishlistIcons.forEach(icon => {
      icon.addEventListener('click', async (event) => {
          event.preventDefault(); 
          event.stopPropagation();

          const listingId = icon.getAttribute('data-id');

          try {
              const response = await fetch(`/listings/${listingId}/wishlist`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  }
              });

              if (response.redirected) {
                  window.location.href = response.url;
                  return;
              }

              const result = await response.json();

              if (result.added) {
                  icon.classList.remove('fa-regular');
                  icon.classList.add('fa-solid');
              } else {
                  icon.classList.remove('fa-solid');
                  icon.classList.add('fa-regular');
              }
          } catch (error) {
              console.error(error);
          }
      });
  });
});
const imageInput = document.getElementById('image');
  const previewContainer = document.getElementById('image-preview-container');

  if (imageInput && previewContainer) {
      let selectedFiles = [];

      imageInput.addEventListener('change', function(e) {
          const newFiles = Array.from(e.target.files);
          
          newFiles.forEach(file => {
              if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
                  selectedFiles.push(file);
              }
          });

          updateFileInputAndPreview();
      });

      function updateFileInputAndPreview() {
          const dt = new DataTransfer();
          selectedFiles.forEach(file => dt.items.add(file));
          imageInput.files = dt.files;

          previewContainer.innerHTML = '';

          selectedFiles.forEach((file, index) => {
              const reader = new FileReader();
              reader.onload = function(e) {
                  const previewWrapper = document.createElement('div');
                  previewWrapper.style.position = 'relative';
                  previewWrapper.style.display = 'inline-block';

                  const img = document.createElement('img');
                  img.src = e.target.result;
                  img.classList.add('img-thumbnail');
                  img.style.width = '120px';
                  img.style.height = '120px';
                  img.style.objectFit = 'cover';
                  img.style.borderRadius = '0.5rem';

                  const removeBtn = document.createElement('button');
                  removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                  removeBtn.classList.add('remove-img-btn');
                  removeBtn.onclick = function(ev) {
                      ev.preventDefault();
                      selectedFiles.splice(index, 1);
                      updateFileInputAndPreview();
                  };

                  previewWrapper.appendChild(img);
                  previewWrapper.appendChild(removeBtn);
                  previewContainer.appendChild(previewWrapper);
              }
              reader.readAsDataURL(file);
          });
      }
  }