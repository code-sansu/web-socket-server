import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (role === 'server') {
      navigate('/server');
    } else {
      navigate('/client');
    }
  };

  return (
    <div>
      <h1>Select Your Role</h1>
      <button onClick={() => handleRoleSelect('server')}>Server</button>
      <button onClick={() => handleRoleSelect('client')}>Client</button>
    </div>
  );
};

export default HomePage;
