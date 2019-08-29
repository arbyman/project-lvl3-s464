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
  }
};

const alertLoading = $('<li class="list-group-item"><h4>Loading...</h4></li>');
const alertLoadingFailed = $('<li class="list-group-item"><h4>Loading failed!</h4></li>');
const renderSubscribes = ({ subscribes, state }) => {
  switch (state) {
    case 'load':
      $('.subscribes').append(alertLoading);
      break;
    case 'loadSuccess':
      $(alertLoading).remove();
      $('.list-group-item').remove();
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
      $(alertLoadingFailed).remove();
  }
};
const renderNews = ({ feedNews }) => {
  feedNews.forEach(({
    titleNews, linkNews, descriptionNews, id,
  }) => {
    if ($(`.feed-news #Modal-${id}`).length) {
      return;
    }
    $('.feed-news').prepend(`
    <li class="list-group-item">
      <a href="${linkNews}">${titleNews}</a>
      <button class="btn btn-primary float-right" data-toggle="modal" data-target="#Modal-${id}">Read more</button>
      <div class="modal fade" id="Modal-${id}" tabindex="-1" role="dialog" aria-labelledby="Label-${id}" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">  
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLongTitle">${titleNews}</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">${descriptionNews}</div>
          </div>
        </div>
      </div>
    </li>`);
  });
};
export { renderInput, renderSubscribes, renderNews };
