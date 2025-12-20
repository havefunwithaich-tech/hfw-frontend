import React from 'react';

const AmazonCTA = ({ link, imageUrl, title, price }) => {
  if (!link) return null;

  return (
    <div style={{
      border: '1px solid #444',
      borderRadius: '8px',
      padding: '20px',
      margin: '60px auto',
      maxWidth: '600px',
      backgroundColor: '#2a2a2a',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '1.1em', margin: '0 0 15px 0' }}>
        Recommended Book / Tool
      </h3>

      <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ marginBottom: '15px' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              style={{
                maxHeight: '200px',
                width: 'auto',
                maxWidth: '100%',
                margin: '0 auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                display: 'block'
              }}
            />
          ) : (
            <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#333', color: '#ccc' }}>
              No Image
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#66ccff', fontWeight: 'bold', fontSize: '1.2em', margin: '0 0 5px 0' }}>
            {title}
          </p>
          {price && <p style={{ color: '#ccc', fontSize: '0.9em', margin: 0 }}>{price}</p>}
        </div>

        <button style={{
          backgroundColor: '#ff9900',
          color: 'black',
          border: 'none',
          padding: '12px 30px',
          fontSize: '1em',
          fontWeight: 'bold',
          borderRadius: '5px',
          cursor: 'pointer',
          width: 'auto',
          maxWidth: '100%'
        }}>
          Check on Amazon
        </button>
      </a>
    </div>
  );
};

export default AmazonCTA;
