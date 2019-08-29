import $ from 'jquery';
import path from 'path';

const parser = new DOMParser();
export default {
  getSubscribe: (xml) => {
    const data = parser.parseFromString(xml, 'application/xml');
    if (!data.querySelector('channel')) {
      throw new Error('No RSS');
    }
    const title = $(data).find('channel title').filter(':first').text();
    const description = $(data).find('channel description').filter(':first').text();
    return { title, description };
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
