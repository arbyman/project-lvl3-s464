import './bootstrap/bootstrap';
import './styles.scss';
import { isURL } from 'validator';
import { watch } from 'melanke-watchjs';
import $ from 'jquery';
import axios from 'axios';
import path from 'path';

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

const onChange = (event) => {
  const { value } = event.currentTarget;
  stateInput.url = value;
  stateInput.existUrl = !!model.subscribes.find(({ url }) => url === stateInput.url);
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
      const title = $(res).find('channel title').filter(':first').text();
      const description = $(res).find('channel description').filter(':first').text();
      model.subscribes.push({ title, description, url });
      const items = $(res).find('channel item');
      items.each((index, item) => {
        const linkNews = $(item).find('link').text();
        const id = path.basename(linkNews);
        const titleNews = $(item).find('title').text();
        const descriptionNews = $(item).find('description').text();
        model.feedNews.push({
          titleNews, linkNews, descriptionNews, id,
        });
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
  model.feedNews.forEach(({
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

watch(model, 'subscribes', renderSubscribes);
watch(model, 'feedNews', renderNews);
$('#inputRSS').on('input', onChange);
$('.form-feed').submit(onClick);

setInterval(() => {
  model.subscribes.forEach(({ url }) => {
    const proxy = 'https://cors-anywhere.herokuapp.com/';
    axios.get(`${proxy}${url}`)
      .then((response) => {
        const res = $.parseXML(response.data);
        const items = $(res).find('channel item');
        items.each((index, item) => {
          const linkNews = $(item).find('link').text();
          const idNews = path.basename(linkNews);
          const titleNews = $(item).find('title').text();
          const descriptionNews = $(item).find('description').text();
          if (model.feedNews.find(({ id }) => id !== idNews)) {
            model.feedNews.push({
              titleNews, linkNews, descriptionNews, id: idNews,
            });
          }
        });
      })
      .catch(() => $('.subscribes').append(messages.alertErrorLoading));
  });
}, 5000);
