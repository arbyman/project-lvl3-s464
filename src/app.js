import { isURL } from 'validator';
import { watch } from 'melanke-watchjs';
import $ from 'jquery';
import axios from 'axios';
import path from 'path';
import { renderInput, renderNews, renderSubscribes } from './renderers';

const proxy = 'https://cors-anywhere.herokuapp.com/';
const model = {
  subscribes: [],
  feedNews: [],
};
const stateInput = {
  url: '',
  state: 'empty',
};
const messages = {
  alertInvalidUrl: $('<div class="alert alert-danger">URL invalid or exist</div>'),
  alertLoading: $('<li class="list-group-item">Loading...</li>'),
  alertErrorLoading: $('<li class="list-group-item">Loading error!</li>'),
};
const isExist = value => model.subscribes.find(({ url }) => url === value);
export default () => {
  const onChange = (event) => {
    const { value } = event.currentTarget;
    stateInput.url = value;
    if (value) {
      stateInput.state = 'filled';
    }
    switch (stateInput.state) {
      case 'filled':
        stateInput.state = (isURL(value) && !isExist(value)) ? 'valid' : 'invalid';
        break;
      default:
        stateInput.state = 'empty';
        stateInput.url = '';
    }
  };

  const getData = (link) => {
    $(messages.alertErrorLoading).remove();
    axios.get(`${proxy}${link}`)
      .then((response) => {
        const data = $.parseXML(response.data);
        if (!model.subscribes.find(({ url }) => url === link)) {
          const title = $(data).find('channel title').filter(':first').text();
          const description = $(data).find('channel description').filter(':first').text();
          model.subscribes.push({ title, description, url: link });
        }
        const items = $(data).find('channel item');
        items.each((index, item) => {
          const linkNews = $(item).find('link').text();
          const idNews = path.basename(linkNews);
          const titleNews = $(item).find('title').text();
          const descriptionNews = $(item).find('description').text();
          if (!model.feedNews.find(({ id }) => id === idNews)) {
            model.feedNews.push({
              titleNews, linkNews, descriptionNews, id: idNews,
            });
          }
        });
        setTimeout(() => getData(link), 5000);
      })
      .catch(() => {
        $(messages.alertLoading).remove();
        $('.subscribes').append(messages.alertErrorLoading);
      });
  };
  const onClick = (event) => {
    event.preventDefault();
    const { url } = stateInput;
    stateInput.url = '';
    stateInput.state = 'empty';
    $(messages.alertErrorLoading).remove();
    $('.subscribes').append(messages.alertLoading);
    getData(url);
  };

  watch(stateInput, renderInput.bind(null, stateInput, messages));
  watch(model, 'subscribes', renderSubscribes.bind(null, model));
  watch(model, 'feedNews', renderNews.bind(null, model));
  $('#inputRSS').on('input', onChange);
  $('.form-feed').submit(onClick);
};
