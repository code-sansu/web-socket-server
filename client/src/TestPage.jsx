import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestPage = () => {
  const navigate = useNavigate();

 

  return (
    <div>
      <h1>This is a Test Page.</h1>
    </div>
  );
};

export default TestPage;
