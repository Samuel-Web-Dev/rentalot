document.addEventListener('DOMContentLoaded', () => {
    const categoryLinks = document.querySelectorAll('.categories a');
    const paginationContainer = document.querySelector('.pagination');

    // Function to update the active category link
    function updateActiveCategory(activeLink) {
      document.querySelector('a.active')?.classList.remove('active');
      activeLink.classList.add('active');
    }

    // Function to create a product item element
    function createProductItem(product) {
      const productItem = document.createElement('div');
      productItem.classList.add('products__list--item');
      productItem.innerHTML = `
        <div class="products__list--item_user">
          <img src="/${product.userId.profilePic}" alt="${product.userId.name}">
          <span>${product.userId.name}</span>
        </div>
        <div class="products__list--item_details">
          <img src="${product.imageUrl}" alt="${product.name}">
          <a href="/products/product-detail/${product._id}">
            <div class="details">
              <span>Details</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </div>
          </a>
        </div>
      `;
      return productItem;
    }

    // Function to display "No Product" message
    function displayNoProductMessage(container) {
      container.innerHTML = '<h1 class="no-product">No Product</h1>';
    }

    // Function to fetch products by category and update the product list
    function fetchProductsByCategoryAndPage(category, page) {
      const productList = document.querySelector('.products__list');
      productList.innerHTML = 'Loading...';

      fetch(`/products/category/${category}?page=${page}`, {
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              console.error('Response Text:', text);
              throw new Error(`HTTP error! Status: ${response.status}`);
            });
          }
          return response.json();
        })
        .then(data => {
          productList.innerHTML = ''; // Clear existing products

          if (data.products && data.products.length > 0) {
            data.products.forEach(product => {
              const productItem = createProductItem(product);
              productList.appendChild(productItem);
            });

            // Update pagination
            updatePagination(data, category);
          } else {
            paginationContainer.style.display = 'none';
            displayNoProductMessage(productList);
          }
        })
        .catch(error => {
          productList.innerHTML = 'Failed to load products';
          console.error('Error details:', error);
        });
    }

    // Function to update pagination
    function updatePagination(data, category) {
      paginationContainer.innerHTML = ''; // Clear existing pagination
      paginationContainer.style.display = '';

      // Add link to the first page if not on the first page and previous page is not the first page
      if (data.currentPage > 1 && data.previousPage !== 1) {
        paginationContainer.innerHTML += `<a href="#" data-page="1" data-category="${category}">1</a>`;
      }

      // Add link to the previous page if it exists and is not already the first page
      if (data.hasPreviousPage) {
        paginationContainer.innerHTML += `<a href="#" data-page="${data.previousPage}" data-category="${category}">${data.previousPage}</a>`;
      }

      // Add link to the current page
      paginationContainer.innerHTML += `<a class="active" href="#" data-page="${data.currentPage}" data-category="${category}">${data.currentPage}</a>`;

      // Add link to the next page if it exists
      if (data.hasNextPage) {
        paginationContainer.innerHTML += `<a href="#" data-page="${data.nextPage}" data-category="${category}">${data.nextPage}</a>`;
      }

      // Add link to the last page if not on the last page and next page is not the last page
      if (data.lastPage !== data.currentPage && data.nextPage !== data.lastPage) {
        paginationContainer.innerHTML += `<a href="#" data-page="${data.lastPage}" data-category="${category}">${data.lastPage}</a>`;
      }

      // Add event listeners to new pagination links
      addPaginationEventListeners();
    }

    // Function to add event listeners to pagination links
    function addPaginationEventListeners() {
      const paginationLinks = paginationContainer.querySelectorAll('a');
      paginationLinks.forEach(pageLink => {
        pageLink.addEventListener('click', function(event) {
          event.preventDefault();
          const page = this.getAttribute('data-page');
          const category = this.getAttribute('data-category');
          fetchProductsByCategoryAndPage(category, page);
        });
      });
    }

    // Add event listeners to category links
    categoryLinks.forEach(categoryLink => {
      categoryLink.addEventListener('click', function(event) {
        event.preventDefault();
        updateActiveCategory(this);
        const category = this.getAttribute('data-category');
        fetchProductsByCategoryAndPage(category, 1); // Fetch page 1 when a new category is selected
      });
    });

    // Initialize with the default category
    const defaultCategory = document.querySelector('.categories a.active').getAttribute('data-category');
    fetchProductsByCategoryAndPage(defaultCategory, 1);
  });
