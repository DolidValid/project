import React from 'react';
import ImportBatch from '../../components/ImportBatch';

const SetServiceStatus = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      

      {/* ImportBatch on the right */}
      <div style={{ flex: 1, padding: '20px' }}>
        <ImportBatch />
      </div>
    </div>
  );
};

export default SetServiceStatus;