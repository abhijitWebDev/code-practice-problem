import axios from 'axios';

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };

  return languageMap[language.toUpperCase()];
};

export const getLanguageName = (languageId) => {
  const LANGUAGE_NAMES = {
    74: TypeScript,
    71: Python,
    62: Java,
    63: Javascript,
  }
}

export const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    { submissions },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.JUDGE0_API_KEY}`, // move key to .env
      },
    }
  );
  console.log('submission results', data);

  return data;
};

export const pollBatchResults = async (tokens) => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  while (true) {
    const { data } = await axios.get(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(','),
          base64_encode: false,
        },
      }
    );

    const results = data.submissions;
    const isAllDone = results.every(
      (r) => r.status.id !== 1 && r.status.id !== 2
    );

    if (isAllDone) return results;

    await sleep(1000);
  }
};
