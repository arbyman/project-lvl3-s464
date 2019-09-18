import i18next from 'i18next';

const alertError = document.createElement('div');
alertError.classList.add('alert', 'alert-danger');
const alertInfo = document.createElement('div');
alertInfo.classList.add('alert', 'alert-info');

const renderInput = ({
  state, url,
}) => {
  alertError.remove();
  const input = document.getElementById('inputRSS');
  const button = document.querySelector('.jumbotron button[type="submit"]');
  input.value = url;
  input.disabled = false;
  switch (state) {
    case 'invalid':
      input.classList.add('border', 'border-danger');
      alertInfo.remove();
      alertError.textContent = i18next.t('invalidURL');
      input.parentNode.append(alertError);
      button.disabled = true;
      break;
    case 'valid':
      input.classList.remove('border', 'border-danger');
      alertInfo.remove();
      button.disabled = false;
      break;
    case 'loading':
      alertInfo.textContent = i18next.t('loading');
      input.parentNode.append(alertInfo);
      button.disabled = true;
      input.disabled = true;
      break;
    case 'loadingFail':
      input.classList.add('border', 'border-danger');
      alertInfo.remove();
      alertError.textContent = i18next.t('loadingError');
      input.parentNode.append(alertError);
      button.disabled = true;
      break;
    default:
      input.classList.remove('border', 'border-danger');
      alertInfo.remove();
      input.value = '';
      button.disabled = true;
  }
};

const renderSubscribes = ({ subscribes, state }) => {
  if (state !== 'loadSuccess') {
    return;
  }
  const subscribesList = document.querySelector('.subscribes');
  subscribes.forEach(({
    title, description, id, status,
  }) => {
    if (status !== 'unpublished') {
      return;
    }
    const newSubscribe = document.createElement('li');
    newSubscribe.classList.add('list-group-item');
    newSubscribe.id = `subscribe-${id}`;
    newSubscribe.innerHTML = `<h4>${title}</h4><p>Description: ${description}</p>`;
    subscribesList.prepend(newSubscribe);
  });
};

const renderNews = ({ state, feedNews }) => {
  if (state !== 'loadSuccess') {
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
