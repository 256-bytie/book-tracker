let allBooks = [];
let currentRating = 0;
let coverPreview = null;
let currentBookIndex = -1;
let activeCategory = 'All';
let customCategories = ['All'];
let renameTargetCategory = null;

document.addEventListener('DOMContentLoaded', () => {
  try {
    loadBooks();
    renderCategories();
  } catch (err) {
    console.error('Error loading books:', err);
    allBooks = [];
    saveBooks();
    renderCategories();
    filterAndDisplayBooks();
  }
});

// Load from localStorage
function loadBooks() {
  const saved = localStorage.getItem('bookTrackerData');
  if (saved) {
    allBooks = JSON.parse(saved);
    const savedCategories = [...new Set(allBooks.map(b => b.category || 'Uncategorized'))];
    customCategories = ['All', ...savedCategories.filter(c => c !== 'All')];
  } else {
    allBooks = [
      {
        title: "Steel-Eating Player",
        chapter: "68",
        status: "Reading",
        type: "Manhwa",
        rating: 4,
        cover: "",
        category: "p.mo"
      },
      {
        title: "Berserk",
        chapter: "347",
        status: "Completed",
        type: "Manga",
        rating: 5,
        cover: "",
        category: "martial-arts"
      }
    ];
    customCategories.push("p.mo", "martial-arts");
    saveBooks();
  }
  filterAndDisplayBooks();
}

function saveBooks() {
  localStorage.setItem('bookTrackerData', JSON.stringify(allBooks));
}

document.getElementById('search-input').addEventListener('input', filterAndDisplayBooks);
document.getElementById('sort-select').addEventListener('change', filterAndDisplayBooks);

// Filtering
function filterAndDisplayBooks() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const sortValue = document.getElementById('sort-select').value;
  let filtered = [...allBooks];

  if (activeCategory !== 'All') {
    filtered = filtered.filter(b => (b.category || 'Uncategorized') === activeCategory);
  }

  if (search) {
    filtered = filtered.filter(book => book.title.toLowerCase().includes(search));
  }

  if (sortValue === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortValue.startsWith('status:')) {
    const status = sortValue.split(':')[1];
    filtered = filtered.filter(b => b.status === status);
  }

  updateDisplay(filtered);
  updateTabIndicator();
}

// Render category tabs
function renderCategories() {
  const container = document.getElementById('category-tabs');
  container.innerHTML = '';
  customCategories.forEach(cat => {
    const tab = document.createElement('div');
    tab.className = 'tab' + (cat === activeCategory ? ' active' : '');
    tab.textContent = cat;

    tab.onclick = () => {
      activeCategory = cat;
      renderCategories();
      filterAndDisplayBooks();
    };

    tab.oncontextmenu = (e) => {
      e.preventDefault();
      if (cat === 'All') return;
      renameTargetCategory = cat;
      document.getElementById('rename-category-input').value = cat;
      document.getElementById('rename-modal').style.display = 'flex';
    };

    container.appendChild(tab);
  });

  const indicator = document.createElement('div');
  indicator.id = 'tab-indicator';
  container.appendChild(indicator);
  updateTabIndicator();
}

function updateTabIndicator() {
  const active = document.querySelector('.tab.active');
  const indicator = document.getElementById('tab-indicator');
  if (active && indicator) {
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.left = `${active.offsetLeft}px`;
  }
}

window.addEventListener('resize', updateTabIndicator);

// FAB logic
const fabBtn = document.getElementById('menu-button');
const fabOptions = document.getElementById('fab-options');

fabBtn.addEventListener('click', () => {
  fabOptions.classList.toggle('active');
});

document.getElementById('add-book-btn').addEventListener('click', () => {
  fabOptions.classList.remove('active');
  currentBookIndex = -1;
  document.getElementById('modal-title').textContent = 'Add New Book';
  document.getElementById('btn-delete').style.display = 'none';
  resetForm();
  openModal();
});

document.getElementById('create-category-btn').addEventListener('click', () => {
  fabOptions.classList.remove('active');
  document.getElementById('new-category-input').value = '';
  document.getElementById('category-modal').style.display = 'flex';
});

// Create category modal
function closeCategoryModal() {
  document.getElementById('category-modal').style.display = 'none';
}

function saveNewCategory() {
  const input = document.getElementById('new-category-input');
  const name = input.value.trim();
  if (!name || customCategories.includes(name)) return;

  customCategories.push(name);
  renderCategories();
  closeCategoryModal();
}

// Rename modal
function closeRenameModal() {
  document.getElementById('rename-modal').style.display = 'none';
  renameTargetCategory = null;
}

function saveRenamedCategory() {
  const input = document.getElementById('rename-category-input');
  const newName = input.value.trim();
  if (!newName || newName === renameTargetCategory || customCategories.includes(newName)) return;

  const idx = customCategories.indexOf(renameTargetCategory);
  if (idx !== -1) customCategories[idx] = newName;

  allBooks.forEach(book => {
    if (book.category === renameTargetCategory) {
      book.category = newName;
    }
  });

  saveBooks();
  renderCategories();
  filterAndDisplayBooks();
  closeRenameModal();
}

// Cover image
document.getElementById('cover-upload').addEventListener('click', () => {
  document.getElementById('cover-input').click();
});

document.getElementById('cover-input').addEventListener('change', e => {
  if (e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = evt => {
      if (!coverPreview) {
        coverPreview = document.createElement('img');
        document.getElementById('cover-upload').appendChild(coverPreview);
      }
      coverPreview.src = evt.target.result;
      document.getElementById('cover-upload').querySelector('span').style.display = 'none';
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

// Rating
function rateBook(_, rating) {
  currentRating = rating;
  document.querySelectorAll('#star-rating i').forEach((icon, i) => {
    icon.classList.remove('fas', 'far');
    icon.classList.add(i < rating ? 'fas' : 'far');
  });
}

// Modal logic
function openModal() {
  document.getElementById('book-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('book-modal').style.display = 'none';
  resetForm();
}

function resetForm() {
  document.getElementById('book-name').value = '';
  document.getElementById('book-status').value = 'Reading';
  document.getElementById('book-type').value = '';
  document.getElementById('book-chapter').value = '';
  document.getElementById('book-category').value = '';
  currentRating = 0;

  document.querySelectorAll('#star-rating i').forEach(icon => {
    icon.classList.remove('fas');
    icon.classList.add('far');
  });

  if (coverPreview) {
    coverPreview.remove();
    coverPreview = null;
  }

  document.getElementById('cover-upload').querySelector('span').style.display = 'block';
  document.getElementById('cover-input').value = '';
}

function editBook(index) {
  currentBookIndex = index;
  const book = allBooks[index];

  document.getElementById('modal-title').textContent = 'Edit Book';
  document.getElementById('btn-delete').style.display = 'block';

  document.getElementById('book-name').value = book.title;
  document.getElementById('book-status').value = book.status;
  document.getElementById('book-type').value = book.type;
  document.getElementById('book-chapter').value = book.chapter;
  document.getElementById('book-category').value = book.category || '';
  currentRating = book.rating || 0;

  document.querySelectorAll('#star-rating i').forEach((icon, i) => {
    icon.classList.remove('fas', 'far');
    icon.classList.add(i < currentRating ? 'fas' : 'far');
  });

  if (book.cover) {
    if (!coverPreview) {
      coverPreview = document.createElement('img');
      document.getElementById('cover-upload').appendChild(coverPreview);
    }
    coverPreview.src = book.cover;
    document.getElementById('cover-upload').querySelector('span').style.display = 'none';
  }

  openModal();
}

function saveBook() {
  const name = document.getElementById('book-name').value.trim();
  if (!name) {
    if (typeof Android !== 'undefined' && Android.showToast) {
      Android.showToast("Please enter a book name");
    } else {
      alert("Please enter a book name");
    }
    return;
  }

  const category = document.getElementById('book-category').value.trim() || 'Uncategorized';

  const book = {
    title: name,
    status: document.getElementById('book-status').value,
    type: document.getElementById('book-type').value,
    chapter: document.getElementById('book-chapter').value || "1",
    rating: currentRating,
    cover: coverPreview ? coverPreview.src : '',
    category
  };

  if (currentBookIndex === -1) {
    allBooks.unshift(book);
  } else {
    allBooks[currentBookIndex] = book;
  }

  if (!customCategories.includes(category)) {
    customCategories.push(category);
    renderCategories();
  }

  saveBooks();
  filterAndDisplayBooks();
  closeModal();
}

document.getElementById('btn-delete').addEventListener('click', () => {
  if (currentBookIndex !== -1 && confirm('Delete this book?')) {
    allBooks.splice(currentBookIndex, 1);
    saveBooks();
    filterAndDisplayBooks();
    closeModal();
  }
});

// Render books
function updateDisplay(books) {
  const counter = document.getElementById('total-books');
  const grid = document.getElementById('library-grid');
  const empty = document.getElementById('empty-state');

  counter.textContent = books.length;

  if (books.length) {
    empty.style.display = 'none';
    grid.innerHTML = books.map((book, index) => `
      <div class="book-card" onclick="editBook(${index})">
        ${book.cover
          ? `<img src="${book.cover}" class="book-cover">`
          : `<div class="placeholder-cover">${book.title.slice(0, 15)}</div>`}
        ${book.rating > 0 ? `<div class="rating-badge">${book.rating}⭐</div>` : ''}
        <div class="book-title">${book.title}</div>
        <div class="book-chapter">Ch. ${book.chapter || '1'}</div>
      </div>
    `).join('');
  } else {
    empty.style.display = 'block';
    grid.innerHTML = '';
  }
}
