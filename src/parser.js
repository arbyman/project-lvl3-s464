const parser = new DOMParser();

export default (rss) => {
  const data = parser.parseFromString(rss, 'application/xml');
  if (!data.querySelector('channel')) {
    throw new Error('No RSS');
  }
  const title = data.querySelector('channel title').textContent;
  const description = data.querySelector('channel description').textContent;
  const items = Array.from(data.querySelectorAll('channel item'));
  const channelNews = items.map((item) => {
    const linkNews = item.querySelector('link').textContent;
    const titleNews = item.querySelector('title').textContent;
    const descriptionNews = item.querySelector('description').textContent;
    return { titleNews, linkNews, descriptionNews };
  });
  return {
    channel: { title, description },
    news: channelNews,
  };
};
