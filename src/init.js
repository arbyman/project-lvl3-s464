import i18next from 'i18next';

export default () => i18next
  .init({
    lng: 'en',
    debug: true,
    resources: {
      en: {
        translation: {
          invalidURL: 'URL is invalid or already exists.',
          loading: 'Loading...',
          loadingError: 'Loading failed!',
        },
      },
    },
  }, (err) => {
    if (err) {
      throw new Error('Error translation.');
    }
  });
