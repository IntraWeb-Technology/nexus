const result = $('Generate Post').first().json;
const config = $('Get Config').first().json;

if (result.success === false || !result.data?.text) {
  throw new Error(result.error || 'Generate Post returned no content');
}

const text = result.data.text;
let postData;

try {
  postData = JSON.parse(text);
} catch (e) {
  postData = {
    hook: text.substring(0, 100),
    full_post: text,
    hashtags: '',
    suggested_link: '',
    news_source: '',
  };
}

return [
  {
    json: {
      sheetId: config.google?.masterSheetId,
      dateGenerated: new Date().toISOString(),
      newsHook: postData.hook || '',
      fullPost: postData.full_post || '',
      hashtags: postData.hashtags || '',
      suggestedLink: postData.suggested_link || '',
      status: 'draft',
      scheduledTime: '',
      postNotes: `Source: ${postData.news_source || ''}`,
    },
  },
];
