import i18next from 'i18next';

const renderInput = ({ state, url }) => {
  const alertError = document.querySelector('.form-feed .alert-danger');
  const alertInfo = document.querySelector('.form-feed .alert-info');
  alertError.classList.add('d-none');
  alertInfo.classList.add('d-none');
  const input = document.getElementById('inputRSS');
  const button = document.querySelector('.jumbotron button[type="submit"]');
  input.value = url;
  input.disabled = false;
  switch (state) {
    case 'invalid':
      input.classList.add('border', 'border-danger');
      alertError.textContent = i18next.t('invalidURL');
      alertError.classList.remove('d-none');
      button.disabled = true;
      break;
    case 'valid':
      input.classList.remove('border', 'border-danger');
      button.disabled = false;
      break;
    case 'loading':
      alertInfo.textContent = i18next.t('loading');
      alertInfo.classList.remove('d-none');
      button.disabled = true;
      input.disabled = true;
      break;
    case 'loadingFail':
      input.classList.add('border', 'border-danger');
      alertError.textContent = i18next.t('loadingError');
      alertError.classList.remove('d-none');
      button.disabled = true;
      break;
    default:
      input.classList.remove('border', 'border-danger');
      input.value = '';
      button.disabled = true;
  }
};

const renderSubscribes = ({ subscribes, stateLoadingNews }) => {
  if (stateLoadingNews !== 'loadSuccess') {
    return;
  }
  const subscribesList = document.querySelector('.subscribes');
  subscribes.forEach(({ title, description, status }) => {
    if (status !== 'unpublished') {
      return;
    }
    const newSubscribe = document.createElement('li');
    newSubscribe.classList.add('list-group-item');
    newSubscribe.innerHTML = `<h4>${title}</h4><p>Description: ${description}</p>`;
    subscribesList.prepend(newSubscribe);
  });
};

const renderNews = ({ stateLoadingNews, feedNews }) => {
  if (stateLoadingNews !== 'loadSuccess') {
    return;
  }
  const time = 5000;
  const feedNewsList = document.querySelector('.feed-news');
  feedNews.forEach(({
    titleNews, linkNews, descriptionNews, id, status,
  }) => {
    if (status !== 'unpublished') {
      return;
    }
    const nextNews = document.createElement('li');
    nextNews.classList.add('list-group-item');
    nextNews.id = `news-${id}`;
    nextNews.innerHTML = `
      <a href="${linkNews}">${titleNews} <span class="badge badge-success">New</span></a>
      <button class="btn btn-primary float-right" data-toggle="modal" data-target="#Modal-${id}">Read more</button>
      <div class="modal fade" id="Modal-${id}" tabindex="-1" role="dialog" aria-labelledby="Label-${id}" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${titleNews}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
            <div class="modal-body">${descriptionNews}</div>
          </div>
        </div>
      </div>`;
    feedNewsList.prepend(nextNews);
    setTimeout(() => {
      const badge = feedNewsList.querySelector(`#news-${id} .badge`);
      badge.remove();
    }, time);
  });
};

export { renderInput, renderSubscribes, renderNews };
