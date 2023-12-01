import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.loadMoreBtn.style.display = 'none';
let page = 1;
refs.searchForm.addEventListener('submit', handleSearchFormSubmit);

async function handleSearchFormSubmit(e) {
  e.preventDefault();

  try {
    const imgs = await serviceImgs(page);
    refs.gallery.innerHTML = createMarkup(imgs);
    const instance = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    });
    refs.loadMoreBtn.style.display = 'block';
    refs.loadMoreBtn.addEventListener('click', handleLoadMore);
  } catch (err) {
    console.log(err);
  }
}

async function handleLoadMore() {
  page += 1;
  refs.loadMoreBtn.disabled = true;
  try {
    const imgs = await serviceImgs(page);
    refs.gallery.insertAdjacentHTML('beforeend', createMarkup(imgs));
    refs.loadMoreBtn.disabled = false;
    const instance = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    });
    instance.refresh();

    if (page >= 13) {
      refs.loadMoreBtn.style.display = 'none';
      refs.searchForm.reset();
      return;
    }
  } catch (err) {
    console.log(err);
  }
}

async function serviceImgs(page = 1) {
  const BASE_URL = 'https://pixabay.com/api';
  const API_KEY = '41015313-3795b9b90280ed51c599e304f';
  const inputValue = refs.searchForm.elements['searchQuery'].value
    .toLowerCase()
    .trim();
  const params = new URLSearchParams({
    key: API_KEY,
    q: inputValue,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page,
  });

  try {
    const { data } = await axios.get(`${BASE_URL}/?${params}`);
    return data.hits;
  } catch (err) {
    console.log(err);
  }
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
      <div class="photo-card gallery__item">
        <a class="gallery__link link" href="${largeImageURL}">
          <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" width="250"/>
            <div class="info">
              <p class="info-item">
                <b>Likes: ${likes}</b>
              </p>
              <p class="info-item">
                <b>Views: ${views}</b>
              </p>
              <p class="info-item">
                <b>Comments: ${comments}</b>
              </p>
              <p class="info-item">
                <b>Downloads: ${downloads}</b>
              </p>
            </div>
        </a>
      </div>`
    )
    .join('');
}
