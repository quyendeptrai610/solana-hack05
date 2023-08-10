import React, { useState } from 'react';

const form = () => {
  const [username, setUsername] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleLogin = () => {
    // Thực hiện kiểm tra tên đăng nhập ở đây
    if (username === "8pjN8CTZ46fJ2sRBGT6wFMU9nAjCoQu9bNQC2SL3R1jZ") {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  };

  return (
    <div>
      <label htmlFor="userKey">User Key</label>
      <input
        id="userKey"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default form;
