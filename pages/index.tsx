import { useState } from 'react';
import Papa from 'papaparse';
import dynamic from 'next/dynamic';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import {
  processDashboardData,
  DashboardData,
  RawRow
} from '../utils/dataProcessor';

// Component only for client-side rendering
const ClientOnlyHome = dynamic(() => Promise.resolve(HomeComponent), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ color: 'white', fontSize: '24px' }}>
        ⏳ טוען...
      </div>
    </div>
  )
});

function HomeComponent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState(''); // חיפוש נקודת מכירה

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      complete: (results) => {
        try {
          const rows: RawRow[] = [];
          
          // עיבוד כל השורות מה-CSV
          for (let i = 1; i < results.data.length; i++) {
            const row = results.data[i] as string[];
            
            if (!row || row.length < 3) continue;
            
            const totalAmount = parseFloat(row[0]) || 0;
            const orderDetails = row[1] || '';
            const totalQty = parseFloat(row[2]) || 0;
            
            if (totalAmount > 0 && orderDetails) {
              rows.push({
                totalAmount,
                orderDetails,
                totalQty,
                rowIndex: i
              });
            }
          }
          
          if (rows.length === 0) {
            setError('לא נמצאו נתונים תקינים בקובץ');
            setLoading(false);
            return;
          }
          
          const dashboardData = processDashboardData(rows);
          setData(dashboardData);
          setLoading(false);
        } catch (err) {
          setError('שגיאה בעיבוד הקובץ: ' + (err as Error).message);
          setLoading(false);
        }
      },
      error: (err) => {
        setError('שגיאה בקריאת הקובץ: ' + err.message);
        setLoading(false);
      }
    });
  };

  const formatCurrency = (value: number) => {
    return `₪${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US');
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }} dir="rtl">
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '48px',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🥭 מנגו דרור - דשבורד ניתוח נתונים
        </h1>
        
        {!data && (
          <p style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '18px',
            marginBottom: '40px'
          }}>
            העלה קובץ CSV לקבלת ניתוח מקיף של המכירות
          </p>
        )}

        {/* אזור העלאת קובץ - מוסתר לאחר העלאה */}
        {!data && (
          <div style={{
            border: '3px dashed #667eea',
            borderRadius: '15px',
            padding: '40px',
            textAlign: 'center',
            marginBottom: '30px',
            background: '#f8f9ff'
          }}>
            <label htmlFor="file-upload" style={{
              cursor: 'pointer',
              display: 'inline-block'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '15px 40px',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'transform 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                📁 בחר קובץ CSV
              </div>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            {loading && (
              <div style={{ marginTop: '20px', color: '#667eea', fontSize: '16px' }}>
                ⏳ מעבד נתונים...
              </div>
            )}

            {error && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#fee',
                color: '#c00',
                borderRadius: '10px',
                fontWeight: 'bold'
              }}>
                ❌ {error}
              </div>
            )}
          </div>
        )}

        {/* דשבורד */}
        {data && (
          <div>
            {/* סיכום כללי */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '10px' }}>
                  סה"כ הכנסות
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                  {formatCurrency(data.totalRevenue)}
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '10px' }}>
                  מספר הזמנות
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                  {formatNumber(data.totalOrders)}
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '10px' }}>
                  ממוצע להזמנה
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                  {formatCurrency(data.totalRevenue / data.totalOrders)}
                </div>
              </div>
            </div>

            {/* גרפים */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
                📊 הכנסות לפי מוצר
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.productSummaries.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#667eea" name="הכנסות" />
                </BarChart>
              </ResponsiveContainer>
            </div>


            {/* טבלת מוצרים */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
                📦 סיכום מוצרים
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: 'white',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  <thead>
                    <tr style={{ background: '#667eea', color: 'white' }}>
                      <th style={{ padding: '15px', textAlign: 'right' }}>מוצר</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>כמות</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>הכנסות</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>מחיר ממוצע</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.productSummaries.map((product, index) => (
                      <tr key={index} style={{
                        background: index % 2 === 0 ? '#f8f9ff' : 'white',
                        borderBottom: '1px solid #eee'
                      }}>
                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{product.product}</td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>{formatNumber(product.totalQty)}</td>
                        <td style={{ padding: '15px', textAlign: 'center', color: '#667eea', fontWeight: 'bold' }}>
                          {formatCurrency(product.totalRevenue)}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          {formatCurrency(product.avgPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* טבלת נקודות מכירה */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
                📍 סיכום נקודות מכירה
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: 'white',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  <thead>
                    <tr style={{ background: '#2d9c5e', color: 'white' }}>
                      <th style={{ padding: '15px', textAlign: 'right' }}>נקודת מכירה</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>הכנסות</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>מספר ימי מכירה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.locationSummaries]
                      .sort((a, b) => {
                        // שים "אחר" בסוף
                        if (a.location === 'אחר') return 1;
                        if (b.location === 'אחר') return -1;
                        return b.totalRevenue - a.totalRevenue;
                      })
                      .map((location, index) => (
                      <tr key={index} style={{
                        background: index % 2 === 0 ? '#f0fff4' : 'white',
                        borderBottom: '1px solid #eee'
                      }}>
                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{location.location}</td>
                        <td style={{ padding: '15px', textAlign: 'center', color: '#2d9c5e', fontWeight: 'bold' }}>
                          {formatCurrency(location.totalRevenue)}
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          {formatNumber(location.salesDays)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* פירוט מוצרים לפי נקודת מכירה */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
                🔍 פירוט מוצרים לפי נקודת מכירה
              </h2>

              {/* שדה חיפוש */}
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="חפש נקודת מכירה..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '2px solid #667eea',
                    fontSize: '18px',
                    background: '#f8f9ff'
                  }}
                />
              </div>

              {data.locationSummaries
                .filter(location =>
                  location.location !== 'אחר' && // הסתר "אחר"
                  (searchLocation === '' ||
                  location.location.toLowerCase().includes(searchLocation.toLowerCase()))
                )
                .map((location, locIndex) => (
                <div key={locIndex} style={{
                  marginBottom: '30px',
                  background: '#f8f9ff',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '2px solid #667eea'
                }}>
                  <h3 style={{ fontSize: '24px', marginBottom: '15px', color: '#667eea' }}>
                    📍 {location.location}
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      background: 'white',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <thead>
                        <tr style={{ background: '#667eea', color: 'white' }}>
                          <th style={{ padding: '12px', textAlign: 'right' }}>מוצר</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>כמות</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>הכנסות</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(location.productBreakdown)
                          .sort(([, a], [, b]) => b.revenue - a.revenue)
                          .map(([product, data], index) => (
                          <tr key={index} style={{
                            background: index % 2 === 0 ? '#f8f9ff' : 'white',
                            borderBottom: '1px solid #eee'
                          }}>
                            <td style={{ padding: '12px' }}>{product}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{formatNumber(data.qty)}</td>
                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                              {formatCurrency(data.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    );
  }

  export default ClientOnlyHome;
