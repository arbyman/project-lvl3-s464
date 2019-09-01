import $ from 'jquery';
import path from 'path';

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

const parser = new DOMParser();
export default {
  getSubscribe: (xml) => {
    const data = parser.parseFromString(xml, 'application/xml');
    if (!data.querySelector('channel')) {
      throw new Error('No RSS');
    }
    const title = $(data).find('channel title').filter(':first').text();
    const description = $(data).find('channel description').filter(':first').text();
    const idSubscribe = getSubscribeNewId(minId, maxId);
    return { title, description, id: idSubscribe };
  },
  getNews: (xml) => {
    const data = parser.parseFromString(xml, 'application/xml');
    if (!data.querySelector('channel')) {
      throw new Error('No RSS');
    }
    const items = $(data).find('channel item');
    const news = [];
    items.each((index, item) => {
      const linkNews = $(item).find('link').text();
      const idNews = path.basename(linkNews);
      const titleNews = $(item).find('title').text();
      const descriptionNews = $(item).find('description').text();
      news.push({
        titleNews, linkNews, descriptionNews, id: idNews,
      });
    });
    return news;
  },
};
