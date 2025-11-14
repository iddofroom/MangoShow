import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="he" dir="rtl">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="אפליקציית ניתוח נתונים מתקדמת לסיכום מכירות, למידת מחירים וניתוח ביצועים" />
        <meta name="keywords" content="מנגו, דרור, ניתוח נתונים, דשבורד, CSV, מכירות" />
        <meta name="author" content="Iddo" />
        <meta name="theme-color" content="#667eea" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥭</text></svg>" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        <title>מנגו דרור - דשבורד ניתוח נתונים</title>
      </Head>
      <body style={{ 
        margin: 0, 
        padding: 0,
        fontFamily: "'Rubik', Arial, sans-serif"
      }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
