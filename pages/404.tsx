export default function Custom404() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }} dir="rtl">
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: '600px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          fontSize: '120px',
          margin: '0 0 20px 0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '32px',
          color: '#333',
          marginBottom: '20px'
        }}>
          הדף לא נמצא
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#666',
          marginBottom: '40px'
        }}>
          מצטערים, הדף שחיפשת לא קיים במערכת
        </p>
        <a 
          href="/"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '15px 40px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: 'bold',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🏠 חזרה לדף הבית
        </a>
      </div>
    </div>
  );
}
