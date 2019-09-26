import { isURL } from 'validator';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import path from 'path';
import initMessagesLanguage from './initMessagesLanguage';
import { renderInput, renderNews, renderSubscribes } from './renderers';
import parser from './parser';

const proxy = 'https://cors-anywhere.herokuapp.com/';
const time = 5000;

export default () => {
  const state = {
    stateLoadingNews: 'pending',
    subscribes: [],
    feedNews: [],
    inputURL: {
      url: '',
      state: 'empty',
    },
  };

  initMessagesLanguage();

  const isExist = value => state.subscribes.find(({ url }) => url === value);
  const onChange = (event) => {
    const { value } = event.currentTarget;
    if (value) {
      state.inputURL.state = 'filled';
    }
    state.inputURL.url = value;
    switch (state.inputURL.state) {
      case 'filled':
        if (!isURL(value) || isExist(value)) {
          state.inputURL.state = 'invalid';
          break;
        }
        state.inputURL.state = 'valid';
        break;
      default:
        state.inputURL.state = 'empty';
    }
  };

  const updatingNews = async (link) => {
    try {
      const { data } = await axios.get(`${proxy}${link}`);
      const { subscribes: publishedSubscibes } = state;
      state.subscribes = publishedSubscibes.map(currentSubscribe => ({ ...currentSubscribe, status: 'published' }));
      if (state.stateLoadingNews === 'loadNewChannel') {
        const { channel: newSubscribe } = parser(data);
        state.subscribes.push({
          ...newSubscribe, url: link, status: 'unpublished',
        });
        state.inputURL.state = 'empty';
        state.inputURL.url = '';
      }
      const { feedNews: publishedNews } = state;
      state.feedNews = publishedNews.map(currentNews => ({ ...currentNews, status: 'published' }));
      const { news } = parser(data);
      news.forEach((currentNews) => {
        const { linkNews } = currentNews;
        const idNews = path.basename(linkNews);
        if (!state.feedNews.find(({ id }) => id === idNews)) {
          state.feedNews.push({ ...currentNews, id: idNews, status: 'unpublished' });
        }
      });
      state.stateLoadingNews = 'loadSuccess';
      setTimeout(() => {
        state.stateLoadingNews = 'updatingNews';
        updatingNews(link);
      }, time);
    } catch {
      state.stateLoadingNews = 'loadFailed';
      state.inputURL.state = 'loadingFail';
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const { url } = state.inputURL;
    state.stateLoadingNews = 'loadNewChannel';
    state.inputURL.state = 'loading';
    updatingNews(url);
  };

  watch(state, 'inputURL', () => renderInput(state.inputURL));
  watch(state, 'stateLoadingNews', () => renderSubscribes(state));
  watch(state, 'stateLoadingNews', () => renderNews(state));

  const input = document.getElementById('inputRSS');
  const form = document.querySelector('.form-feed');
  input.addEventListener('input', onChange);
  form.addEventListener('submit', onSubmit);
};
