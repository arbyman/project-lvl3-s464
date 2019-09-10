import path from 'path';

const parser = new DOMParser();
export default {
  getSubscribe: (xml) => {
    const data = parser.parseFromString(xml, 'application/xml');
    if (!data.querySelector('channel')) {
      throw new Error('No RSS');
    }
    const title = data.querySelector('channel title').textContent;
    const description = data.querySelector('channel description').textContent;
    return { title, description };
  },
  getNews: (xml) => {
    const data = parser.parseFromString(xml, 'application/xml');
    if (!data.querySelector('channel')) {
      throw new Error('No RSS');
    }
    const items = Array.from(data.querySelectorAll('channel item'));
    return items.map((item) => {
      const linkNews = item.querySelector('link').textContent;
      const id = path.basename(linkNews);
      const titleNews = item.querySelector('title').textContent;
      const descriptionNews = item.querySelector('description').textContent;
      return {
        titleNews, linkNews, descriptionNews, id,
      };
    });
  },
};
