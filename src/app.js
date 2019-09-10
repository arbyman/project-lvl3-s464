import { isURL } from 'validator';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import { renderInput, renderNews, renderSubscribes } from './renderers';
import parser from './parser';

const proxy = 'https://cors-anywhere.herokuapp.com/';
const time = 5000;

const subscribesId = new Set();
const minId = 1;
const maxId = 10000;

const getSubscribeNewId = (min, max) => {
  const id = Math.floor(Math.random() * (max - min)) + min;
  if (subscribesId.has(id)) {
    return getSubscribeNewId(minId, maxId);
  }
  return id;
};

export default () => {
  const state = {
    state: '',
    subscribes: [],
    feedNews: [],
    inputURL: {
      url: '',
      state: 'empty',
      message: '',
    },
  };

  const isExist = value => state.subscribes.find(({ url }) => url === value);
  const onChange = (event) => {
    const { value } = event.currentTarget;
    if (value) {
      state.inputURL.state = 'filled';
    }
    state.inputURL.url = value;
    switch (state.inputURL.state) {
      case 'filled':
        if (!isURL(value)) {
          state.inputURL.state = 'invalid';
          state.inputURL.message = 'URL invalid.';
          break;
        }
        if (isExist(value)) {
          state.inputURL.state = 'invalid';
          state.inputURL.message = 'URL already exists.';
          break;
        }
        state.inputURL.state = 'valid';
        state.inputURL.message = '';
        break;
      default:
        state.inputURL.state = 'empty';
        state.inputURL.message = '';
    }
  };

  const updatingNews = (link) => {
    axios.get(`${proxy}${link}`)
      .then(({ data }) => {
        if (state.state === 'loadNewChannel') {
          const newSubscribe = parser.getSubscribe(data);
          const id = getSubscribeNewId(minId, maxId);
          state.subscribes.push({ ...newSubscribe, url: link, id });
          state.inputURL.state = 'empty';
        }
        const news = parser.getNews(data);
        news.forEach((currentNews) => {
          const { id: idNews } = currentNews;
          if (!state.feedNews.find(({ id }) => id === idNews)) {
            state.feedNews.push(currentNews);
          }
        });
        state.state = 'loadSuccess';
        setTimeout(() => {
          state.state = 'updatingNews';
          updatingNews(link);
        }, time);
      })
      .catch(() => {
        state.state = 'loadFailed';
        state.inputURL.state = 'invalid';
        state.inputURL.message = 'Loading failed!';
      });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const { url } = state.inputURL;
    state.state = 'loadNewChannel';
    state.inputURL.state = 'loading';
    state.inputURL.message = 'Loading...';
    updatingNews(url);
  };

  watch(state, 'inputURL', () => renderInput(state.inputURL));
  watch(state, 'state', () => renderSubscribes(state));
  watch(state, 'state', () => renderNews(state));

  const input = document.getElementById('inputRSS');
  const form = document.querySelector('.form-feed');
  input.addEventListener('input', onChange);
  form.addEventListener('submit', onSubmit);
};
