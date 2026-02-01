'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}

const ytPlayers = {};
function loadYouTubeVideo2(container) {
  const videoId = container.getAttribute('data-video-id');

  // Prevent duplicate player creation
  if (ytPlayers[videoId]) return;

  // Hide thumbnail container if exists
  const thumbnail = container.querySelector('.youtube-thumbnail');
  if (thumbnail) thumbnail.style.display = 'none';

  // Create player container
  const iframeWrapper = document.createElement('div');
  const playerDivId = `yt-player-${videoId}`;
  iframeWrapper.id = playerDivId;
  iframeWrapper.style.width = '100%';
  iframeWrapper.style.height = container.offsetHeight + 'px';

  container.appendChild(iframeWrapper);

  // Create YouTube player
  ytPlayers[videoId] = new YT.Player(playerDivId, {
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      controls: 0,            // Hide playback controls
      modestbranding: 1,      // Hide YouTube logo on control bar
      rel: 0,                 // Don't show related videos at end
      fs: 0,                  // Hide fullscreen button
      loop: 1,
      playlist: videoId,      // Required for looping
      disablekb: 1,           // Disable keyboard shortcuts
      iv_load_policy: 3,      // Hide annotations
      showinfo: 0             // Deprecated, but some legacy support


    },
    events: {
      onStateChange: function (event) {
        if (event.data === YT.PlayerState.ENDED) {
          ytPlayers[videoId].destroy();
          ytPlayers[videoId] = null;

          container.removeChild(iframeWrapper);
          if (thumbnail) thumbnail.style.display = 'block';
        }
      }
    }
  });
}
function showProductModal(title, description, imageSrc) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalDescription').textContent = description;
  document.getElementById('modalImage').src = imageSrc;
  document.getElementById('productModal').style.display = 'block';
}

function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
}

// Optional: Close modal when clicking outside the modal content
window.onclick = function (event) {
  const modal = document.getElementById('productModal');
  if (event.target === modal) {
    modal.style.display = "none";
  }
}