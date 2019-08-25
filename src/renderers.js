import $ from 'jquery';

const renderInput = ({ state, url }, { alertInvalidUrl }) => {
  $('#inputRSS')[0].value = url;
  $(alertInvalidUrl).remove();
  $('#inputRSS').removeClass('border border-danger');
  switch (state) {
    case 'invalid':
      $('#inputRSS').addClass('border border-danger');
      $('.form-group').append(alertInvalidUrl);
      $('.form-feed .btn-primary').prop('disabled', true);
      break;
    case 'valid':
      $('#inputRSS').removeClass('border border-danger');
      $('.form-feed .btn-primary').prop('disabled', false);
      break;
    default:
      $('.form-feed .btn-primary').prop('disabled', true);
  }
};
const renderSubscribes = ({ subscribes }) => {
  $('.list-group-item').remove();
  subscribes.forEach(({ title, description }) => {
    $('.subscribes').append(`<li class="list-group-item"><h4>${title}</h4><p>Description: ${description}</p></li>`);
  });
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
