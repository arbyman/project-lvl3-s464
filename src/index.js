import './bootstrap/bootstrap';
import './styles.scss';
import { isURL } from 'validator';
import { watch } from 'melanke-watchjs';
import $ from 'jquery';
import axios from 'axios';

const model = {
  subscribes: [],
  feedNews: [],
};

const stateInput = {
  url: '',
  existUrl: false,
  validUrl: false,
};

const messages = {
  alertInvalidUrl: $('<div class="alert alert-danger">Invalid URL.</div>'),
  alertExistUrl: $('<div class="alert alert-danger">URL already exist.</div>'),
  alertLoading: $('<li class="list-group-item">Loading...</li>'),
  alertErrorLoading: $('<li class="list-group-item">Loading error!</li>'),
};

const makeModal = description => $(`<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
Read more
</button>
<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="modal-body">${description}</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`);

const onChange = (event) => {
  const { value } = event.currentTarget;
  stateInput.url = value;
  stateInput.existUrl = !!model.subscribes.find(({ link }) => link === stateInput.url);
  stateInput.validUrl = isURL(stateInput.url);
};

const renderInput = () => {
  $('#inputRSS').removeClass('border border-danger');
  $('#inputRSS')[0].value = stateInput.url;
  $(messages.alertInvalidUrl).remove();
  $(messages.alertExistUrl).remove();
  $('.btn-primary').prop('disabled', true);
  const { url, validUrl, existUrl } = stateInput;
  if (!url) {
    return;
  }
  if (!validUrl) {
    $('#inputRSS').addClass('border border-danger');
    $('.form-group').append(messages.alertInvalidUrl);
  }
  if (existUrl) {
    $('.form-group').append(messages.alertExistUrl);
  }
  if (validUrl && !existUrl) {
    $('.btn-primary').prop('disabled', false);
  }
};
watch(stateInput, renderInput);

const onClick = (event) => {
  event.preventDefault();
  const { url } = stateInput;
  stateInput.url = '';
  const proxy = 'https://cors-anywhere.herokuapp.com/';
  $(messages.alertErrorLoading).remove();
  $('.subscribes').append(messages.alertLoading);
  axios.get(`${proxy}${url}`)
    .then((response) => {
      $(messages.alertLoading).remove();
      const res = $.parseXML(response.data);
      const link = url;
      const title = $(res).find('channel title').filter(':first').text();
      const description = $(res).find('channel description').filter(':first').text();
      model.subscribes.push({ title, description, link });
      const items = $(res).find('channel item');
      items.each((index, item) => {
        const titleNews = $(item).find('title').text();
        const linkNews = $(item).find('link').text();
        const descriptionNews = $(item).find('description').text();
        model.feedNews.push({ titleNews, linkNews, descriptionNews });
      });
    })
    .catch(() => $('.subscribes').append(messages.alertErrorLoading));
};
const renderSubscribes = () => {
  $('.list-group-item').remove();
  model.subscribes.forEach(({ title, description }) => {
    $('.subscribes').append(`<li class="list-group-item"><h4>${title}</h4><p>Description: ${description}</p></li>`);
  });
};
const renderNews = () => {
  model.feedNews.forEach(({ titleNews, linkNews, descriptionNews }) => {
    const id = Math.floor((Math.random() * 100) + 1);
    $('.feed-news').append(`
    <li class="list-group-item">
      <a href="${linkNews}">${titleNews}</a>
      <a href="#Modal-${id}" class="btn btn-primary" id="btn-${id}" data-toggle="modal">Read more</a>
      <div class="modal fade" id="Modal-${id}" tabindex="-1" role="dialog" aria-labelledby="Label${id}" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <div class="modal-body">${descriptionNews}</div>
          </div>
        </div>
      </div>
    </li>`);
    //$(`#btn-${id}`).on('click', () => $(`#Modal-${id}`).modal('show'));
  });
};

watch(model, 'subscribes', renderSubscribes);
watch(model, 'feedNews', renderNews);
$('#inputRSS').on('input', onChange);
$('.form-feed').submit(onClick);
