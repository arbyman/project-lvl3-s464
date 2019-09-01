import $ from 'jquery';

const input = document.getElementById('inputRSS');
const button = document.querySelector('.jumbotron button[type="submit"]');
const subscribesList = document.querySelector('.subscribes');
const alertError = document.createElement('div');
alertError.classList.add('alert', 'alert-danger');

const renderInput = ({
  state, url, message, submitDisabled,
}) => {
  alertError.remove();
  button.disabled = submitDisabled;
  input.value = url;
  switch (state) {
    case 'invalid':
      input.classList.add('border', 'border-danger');
      alertError.textContent = message;
      input.parentNode.append(alertError);
      break;
    case 'valid':
      input.classList.remove('border', 'border-danger');
      break;
    default:
      input.classList.remove('border', 'border-danger');
      input.value = '';
  }
};

const alertLoading = $('<li class="list-group-item"><h4>Loading...</h4></li>');
const alertLoadingFailed = $('<li class="list-group-item"><h4>Loading failed!</h4></li>');
const renderSubscribes = ({ subscribes, state }) => {
  switch (state) {
    case 'loadNewChannel':
      $('.subscribes').append(alertLoading);
      break;
    case 'loadSuccess':
      $(alertLoading).remove();
      $('.subscribes .list-group-item').remove();
      subscribes.forEach(({ title, description }) => {
        $('.subscribes').append(`<li class="list-group-item"><h4>${title}</h4><p>Description: ${description}</p></li>`);
      });
      break;
    case 'loadFailed':
      $(alertLoading).remove();
      $(subscribesList).append(alertLoadingFailed);
      break;
    default:
      $(alertLoading).remove();
  }
};
const renderNews = ({ state, feedNews }) => {
  feedNews.forEach(({
    titleNews, linkNews, descriptionNews, id,
  }) => {
    switch (state) {
      case 'loadSuccess':
        if ($(`#news-${id}`).length) {
          $(`#news-${id} .badge`).remove();
          break;
        }
        $('.feed-news').prepend(`
          <li class="list-group-item" id="news-${id}">
            <a href="${linkNews}">
              ${titleNews}
              <span class="badge badge-success">New</span>
            </a>
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
            </div>
          </li>`);
        break;
      default:
    }
  });
};
export { renderInput, renderSubscribes, renderNews };
