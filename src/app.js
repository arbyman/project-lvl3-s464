import { isURL } from 'validator';
import { watch } from 'melanke-watchjs';
import $ from 'jquery';
import axios from 'axios';
import path from 'path';
import { renderInput, renderNews, renderSubscribes } from './renderers';
import parser from './parser';

const proxy = 'https://cors-anywhere.herokuapp.com/';

const messages = {
  alertInvalidUrl: $('<div class="alert alert-danger">URL invalid or exist</div>'),
  alertLoading: $('<li class="list-group-item">Loading...</li>'),
  alertErrorLoading: $('<li class="list-group-item">Loading error!</li>'),
};
export default () => {
  const model = {
    state: '',
    subscribes: [],
    feedNews: [],
    inputURL: {
      url: '',
      state: 'empty',
      submitDisabled: true,
      errorMessage: '',
    },
  };

  const isExist = value => model.subscribes.find(({ url }) => url === value);
  const onChange = (event) => {
    const { value } = event.currentTarget;
    if (value) {
      model.inputURL.state = 'filled';
    }
    model.inputURL.url = value;
    switch (model.inputURL.state) {
      case 'filled':
        if (!isURL(value)) {
          model.inputURL.state = 'invalid';
          model.inputURL.submitDisabled = true;
          model.inputURL.message = 'URL invalid.';
          break;
        }
        if (isExist(value)) {
          model.inputURL.state = 'invalid';
          model.inputURL.submitDisabled = true;
          model.inputURL.message = 'URL already exists.';
          break;
        }
        model.inputURL.state = 'valid';
        model.inputURL.submitDisabled = false;
        model.inputURL.message = '';
        break;
      default:
        model.inputURL.state = 'empty';
        model.inputURL.submitDisabled = true;
        model.inputURL.message = '';
    }
  };

  const updateNews = (link) => {
    if (!model.subscribes.find(({ url }) => url === link)) {
      model.state = 'load';
    }
    axios.get(`${proxy}${link}`)
      .then(({ data }) => {
        if (!model.subscribes.find(({ url }) => url === link)) {
          const newSubscribe = parser.getSubscribe(data);
          model.subscribes.push({ ...newSubscribe, url: link });
          model.state = 'loadSuccess';
        }
        const news = parser.getNews(data);
        news.forEach((currentNews) => {
          const { id: idNews } = currentNews;
          if (!model.feedNews.find(({ id }) => id === idNews)) {
            model.feedNews.push(currentNews);
          }
        });
        setTimeout(() => updateNews(link), 5000);
      })
      .catch(() => {
        model.state = 'loadFailed';
        model.inputURL.state = 'invalid';
        model.inputURL.message = 'Loading failed';
      });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const { url } = model.inputURL;
    updateNews(url);
  };
  watch(model, 'inputURL', () => renderInput(model.inputURL));
  watch(model, 'state', () => renderSubscribes(model));
  watch(model, 'feedNews', () => renderNews(model));

  const input = document.getElementById('inputRSS');
  const form = document.querySelector('.form-feed');
  form.addEventListener('submit', onSubmit);
  input.addEventListener('input', onChange);
};
