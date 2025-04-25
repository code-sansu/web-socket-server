import React from 'react';
import { useNavigate } from 'react-router-dom';

const SamplePage = () => {
  const navigate = useNavigate();


  return (
    <div>
      <h1>This is a Sample Page.</h1>
    </div>
  );
};

export default SamplePage;
