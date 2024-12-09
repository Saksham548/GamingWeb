import React, { useState } from 'react';

const LinkGenerator = ({ sessionId, onGenerate }) => {
  const [link, setLink] = useState('');

  const generateLink = () => {
    const shortUrl = 'https://your-shortener-service.com/g/' + sessionId;
    setLink(shortUrl);
    onGenerate(shortUrl);
  };

  return (
    <div>
      <button onClick={generateLink}>Generate Share Link</button>
      {link && <p>Shareable Link: {link}</p>}
    </div>
  );
};

export default LinkGenerator;
