// types.ts - הגדרות טיפוסים
export interface OrderEntry {
  product: string;
  location: string;
  date: string;
  qty: number;
}

export interface RawRow {
  totalAmount: number;
  orderDetails: string;
  totalQty: number;
  rowIndex: number;
}

export interface LearnedPrice {
  product: string;
  location: string;
  date: string;
  price: number;
  confidence: number; // רמת ביטחון בלמידה
}

export interface ProductSummary {
  product: string;
  totalQty: number;
  totalRevenue: number;
  avgPrice: number;
  priceBreakdown: {
    [price: string]: {
      qty: number;
      revenue: number;
    };
  };
  locationBreakdown: {
    [location: string]: {
      qty: number;
      revenue: number;
    };
  };
  dateBreakdown: {
    [date: string]: {
      qty: number;
      revenue: number;
    };
  };
}

export interface LocationSummary {
  location: string;
  totalRevenue: number;
  totalOrders: number;
  salesDays: number; // מספר ימי מכירה - כמה תאריכים שונים
  productBreakdown: {
    [product: string]: {
      qty: number;
      revenue: number;
    };
  };
}

export interface SaleDetail {
  product: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleSummary {
  date: string;
  location: string;
  totalRevenue: number;
  products: SaleDetail[];
  rowIndex: number;
}

export interface DashboardData {
  productSummaries: ProductSummary[];
  locationSummaries: LocationSummary[];
  learnedPrices: LearnedPrice[];
  saleSummaries: SaleSummary[];
  totalRevenue: number;
  totalOrders: number;
  dateRange: {
    start: string;
    end: string;
  };
}

// פונקציה לפירוק פרטי הזמנה מעמודה B
export function parseOrderDetails(orderDetails: string, defaultQty: number): OrderEntry[] {
  const orders: OrderEntry[] = [];

  if (!orderDetails || orderDetails.trim() === '') return orders;

  const cellString = orderDetails.toString().trim();

  // בדיקה אם יש נקודתיים - מוצרים עם כמויות ספציפיות
  if (cellString.includes(':')) {
    // תבנית: "מוצר - מיקום , תאריך : כמות"
    const regex = /(.*?)\s*-\s*(.*?)\s*,\s*(\d{1,2}\.\d{1,2})\s*:\s*(\d+)/g;
    let match;

    while ((match = regex.exec(cellString)) !== null) {
      const product = match[1].trim();
      const location = match[2].trim();
      const date = match[3].trim();
      const qty = Number(match[4]);

      orders.push({ product, location, date, qty });
    }

    // אם לא נמצאו התאמות עם התבנית המלאה, נסה לחלץ רק את שם המוצר
    if (orders.length === 0) {
      const productMatch = cellString.match(/(.*?)\s*:/);
      if (productMatch) {
        const product = productMatch[1].trim();
        orders.push({ product, location: 'אחר', date: '', qty: defaultQty });
      }
    }
  } else {
    // תבנית פשוטה: "מוצר - מיקום , תאריך"
    const match = cellString.match(/^(.*?)\s*-\s*(.*?)\s*,\s*(\d{1,2}\.\d{1,2})/);

    if (match) {
      const product = match[1].trim();
      const location = match[2].trim();
      const date = match[3].trim();

      orders.push({ product, location, date, qty: defaultQty });
    } else {
      // אם אין התאמה, נסה לחלץ רק את שם המוצר
      if (cellString.length > 0) {
        const product = cellString.split('-')[0].trim();
        if (product) {
          orders.push({ product, location: 'אחר', date: '', qty: defaultQty });
        }
      }
    }
  }

  return orders;
}

// פונקציה ללמידת מחירים מהנתונים
export function learnPrices(rows: RawRow[]): LearnedPrice[] {
  const learnedPrices: LearnedPrice[] = [];
  const priceMap = new Map<string, { sum: number; count: number; samples: number[] }>();
  
  for (const row of rows) {
    // רק שורות עם מידע מלא על מיקום ותאריך (לפני שורה 5433)
    if (row.rowIndex >= 5433) continue;
    
    const orders = parseOrderDetails(row.orderDetails, row.totalQty);
    
    // אם יש רק מוצר אחד בהזמנה, אפשר לחשב מחיר מדויק
    if (orders.length === 1) {
      const order = orders[0];
      const pricePerUnit = row.totalAmount / order.qty;
      
      const key = `${order.product}|${order.location}|${order.date}`;
      
      if (!priceMap.has(key)) {
        priceMap.set(key, { sum: 0, count: 0, samples: [] });
      }
      
      const entry = priceMap.get(key)!;
      entry.sum += pricePerUnit;
      entry.count++;
      entry.samples.push(pricePerUnit);
    }
  }
  
  // המרה למערך עם חישוב ממוצע וביטחון
  for (const [key, data] of priceMap.entries()) {
    const [product, location, date] = key.split('|');
    const avgPrice = data.sum / data.count;
    
    // חישוב סטיית תקן לרמת ביטחון
    const variance = data.samples.reduce((acc, price) => 
      acc + Math.pow(price - avgPrice, 2), 0) / data.count;
    const stdDev = Math.sqrt(variance);
    const confidence = stdDev === 0 ? 1 : Math.max(0, 1 - (stdDev / avgPrice));
    
    learnedPrices.push({
      product,
      location,
      date,
      price: avgPrice,
      confidence
    });
  }
  
  return learnedPrices;
}

// פונקציה לקבלת מחיר מוצר לפי מיקום ותאריך
export function getProductPrice(
  product: string,
  location: string,
  date: string,
  learnedPrices: LearnedPrice[]
): number | null {
  // חיפוש מדויק
  const exact = learnedPrices.find(p => 
    p.product === product && p.location === location && p.date === date
  );
  
  if (exact) return exact.price;
  
  // חיפוש לפי מוצר ומיקום (ללא תאריך)
  const byLocationProduct = learnedPrices.filter(p => 
    p.product === product && p.location === location
  );
  
  if (byLocationProduct.length > 0) {
    const avgPrice = byLocationProduct.reduce((sum, p) => sum + p.price, 0) / byLocationProduct.length;
    return avgPrice;
  }
  
  // חיפוש לפי מוצר בלבד
  const byProduct = learnedPrices.filter(p => p.product === product);
  
  if (byProduct.length > 0) {
    const avgPrice = byProduct.reduce((sum, p) => sum + p.price, 0) / byProduct.length;
    return avgPrice;
  }
  
  return null;
}

// פונקציה לעיבוד נתונים ויצירת דשבורד
export function processDashboardData(
  rows: RawRow[],
  startDate?: string,
  endDate?: string
): DashboardData {
  // למידת מחירים
  const learnedPrices = learnPrices(rows);

  // מיפוי למוצרים ומיקומים
  const productMap = new Map<string, ProductSummary>();
  const locationMap = new Map<string, LocationSummary>();
  const saleSummaries: SaleSummary[] = [];

  let totalRevenue = 0;
  let totalOrders = 0;
  let minDate = '';
  let maxDate = '';
  
  for (const row of rows) {
    const orders = parseOrderDetails(row.orderDetails, row.totalQty);
    
    if (orders.length === 0) continue;
    
    // סינון לפי טווח תאריכים
    if (startDate || endDate) {
      const hasValidDate = orders.some(order => {
        const orderDate = parseDateString(order.date);
        if (!orderDate) return false;
        
        if (startDate && orderDate < parseDateString(startDate)!) return false;
        if (endDate && orderDate > parseDateString(endDate)!) return false;
        
        return true;
      });
      
      if (!hasValidDate) continue;
    }
    
    totalOrders++;

    // בניית סיכום מכירה
    const saleProducts: SaleDetail[] = [];
    const firstOrder = orders[0];
    const saleDate = firstOrder.date || '';
    const saleLocation = firstOrder.location || '';

    // אם יש רק מוצר אחד, אפשר להשתמש בסכום הכולל
    if (orders.length === 1) {
      const order = orders[0];
      const revenue = row.totalAmount;
      const unitPrice = revenue / order.qty;

      // הוסף לסיכום המכירה
      saleProducts.push({
        product: order.product,
        qty: order.qty,
        unitPrice: unitPrice,
        totalPrice: revenue
      });

      totalRevenue += revenue;
      
      // עדכון מיפוי מוצרים
      if (!productMap.has(order.product)) {
        productMap.set(order.product, {
          product: order.product,
          totalQty: 0,
          totalRevenue: 0,
          avgPrice: 0,
          priceBreakdown: {},
          locationBreakdown: {},
          dateBreakdown: {}
        });
      }

      const productSummary = productMap.get(order.product)!;
      productSummary.totalQty += order.qty;
      productSummary.totalRevenue += revenue;

      // עדכון פירוט לפי מחיר
      const priceKey = (revenue / order.qty).toFixed(2);
      if (!productSummary.priceBreakdown[priceKey]) {
        productSummary.priceBreakdown[priceKey] = { qty: 0, revenue: 0 };
      }
      productSummary.priceBreakdown[priceKey].qty += order.qty;
      productSummary.priceBreakdown[priceKey].revenue += revenue;

      if (!productSummary.locationBreakdown[order.location]) {
        productSummary.locationBreakdown[order.location] = { qty: 0, revenue: 0 };
      }
      productSummary.locationBreakdown[order.location].qty += order.qty;
      productSummary.locationBreakdown[order.location].revenue += revenue;

      if (!productSummary.dateBreakdown[order.date]) {
        productSummary.dateBreakdown[order.date] = { qty: 0, revenue: 0 };
      }
      productSummary.dateBreakdown[order.date].qty += order.qty;
      productSummary.dateBreakdown[order.date].revenue += revenue;
      
      // עדכון מיפוי מיקומים
      if (!locationMap.has(order.location)) {
        locationMap.set(order.location, {
          location: order.location,
          totalRevenue: 0,
          totalOrders: 0,
          salesDays: 0,
          productBreakdown: {},
          uniqueDates: new Set<string>()
        } as any);
      }

      const locationSummary = locationMap.get(order.location)! as any;
      locationSummary.totalRevenue += revenue;
      locationSummary.totalOrders++;

      // עדכון ימי מכירה
      if (order.date && !locationSummary.uniqueDates.has(order.date)) {
        locationSummary.uniqueDates.add(order.date);
      }

      if (!locationSummary.productBreakdown[order.product]) {
        locationSummary.productBreakdown[order.product] = { qty: 0, revenue: 0 };
      }
      locationSummary.productBreakdown[order.product].qty += order.qty;
      locationSummary.productBreakdown[order.product].revenue += revenue;
      
      // עדכון טווח תאריכים
      if (!minDate || order.date < minDate) minDate = order.date;
      if (!maxDate || order.date > maxDate) maxDate = order.date;
      
    } else {
      // הזמנה מרובת מוצרים - צריך לחלק את הסכום לפי מחירים שלמדנו
      let estimatedTotal = 0;

      for (const order of orders) {
        const price = getProductPrice(order.product, order.location, order.date, learnedPrices);
        if (price) {
          estimatedTotal += price * order.qty;
        }
      }

      // הוסף את הסכום הכולל רק פעם אחת
      totalRevenue += row.totalAmount;

      // אם הצלחנו לאמוד מחירים, נחלק את הסכום לפי יחס
      if (estimatedTotal > 0) {
        for (const order of orders) {
          const price = getProductPrice(order.product, order.location, order.date, learnedPrices);
          if (!price) continue;

          const orderEstimate = price * order.qty;
          const revenue = (orderEstimate / estimatedTotal) * row.totalAmount;
          const unitPrice = revenue / order.qty;

          // הוסף לסיכום המכירה
          saleProducts.push({
            product: order.product,
            qty: order.qty,
            unitPrice: unitPrice,
            totalPrice: revenue
          });

          // עדכון מיפויים
          if (!productMap.has(order.product)) {
            productMap.set(order.product, {
              product: order.product,
              totalQty: 0,
              totalRevenue: 0,
              avgPrice: 0,
              priceBreakdown: {},
              locationBreakdown: {},
              dateBreakdown: {}
            });
          }

          const productSummary = productMap.get(order.product)!;
          productSummary.totalQty += order.qty;
          productSummary.totalRevenue += revenue;

          // עדכון פירוט לפי מחיר (למוצרים מרובים)
          const priceKey2 = (revenue / order.qty).toFixed(2);
          if (!productSummary.priceBreakdown[priceKey2]) {
            productSummary.priceBreakdown[priceKey2] = { qty: 0, revenue: 0 };
          }
          productSummary.priceBreakdown[priceKey2].qty += order.qty;
          productSummary.priceBreakdown[priceKey2].revenue += revenue;

          if (!productSummary.locationBreakdown[order.location]) {
            productSummary.locationBreakdown[order.location] = { qty: 0, revenue: 0 };
          }
          productSummary.locationBreakdown[order.location].qty += order.qty;
          productSummary.locationBreakdown[order.location].revenue += revenue;

          if (!productSummary.dateBreakdown[order.date]) {
            productSummary.dateBreakdown[order.date] = { qty: 0, revenue: 0 };
          }
          productSummary.dateBreakdown[order.date].qty += order.qty;
          productSummary.dateBreakdown[order.date].revenue += revenue;
          
          if (!locationMap.has(order.location)) {
            locationMap.set(order.location, {
              location: order.location,
              totalRevenue: 0,
              totalOrders: 0,
              salesDays: 0,
              productBreakdown: {},
              uniqueDates: new Set<string>()
            } as any);
          }

          const locationSummary = locationMap.get(order.location)! as any;
          locationSummary.totalRevenue += revenue;

          // עדכון ימי מכירה
          if (order.date && !locationSummary.uniqueDates.has(order.date)) {
            locationSummary.uniqueDates.add(order.date);
          }

          if (!locationSummary.productBreakdown[order.product]) {
            locationSummary.productBreakdown[order.product] = { qty: 0, revenue: 0 };
          }
          locationSummary.productBreakdown[order.product].qty += order.qty;
          locationSummary.productBreakdown[order.product].revenue += revenue;
          
          if (!minDate || order.date < minDate) minDate = order.date;
          if (!maxDate || order.date > maxDate) maxDate = order.date;
        }
      } else {
        // אם אין מחירים נלמדים, חלק שווה בשווה לפי כמויות
        let totalQty = 0;
        for (const order of orders) {
          totalQty += order.qty;
        }

        for (const order of orders) {
          const revenue = (order.qty / totalQty) * row.totalAmount;
          const unitPrice = revenue / order.qty;

          // הוסף לסיכום המכירה
          saleProducts.push({
            product: order.product,
            qty: order.qty,
            unitPrice: unitPrice,
            totalPrice: revenue
          });

          // עדכון מיפויים
          if (!productMap.has(order.product)) {
            productMap.set(order.product, {
              product: order.product,
              totalQty: 0,
              totalRevenue: 0,
              avgPrice: 0,
              priceBreakdown: {},
              locationBreakdown: {},
              dateBreakdown: {}
            });
          }

          const productSummary = productMap.get(order.product)!;
          productSummary.totalQty += order.qty;
          productSummary.totalRevenue += revenue;

          // עדכון פירוט לפי מחיר
          const priceKey3 = (revenue / order.qty).toFixed(2);
          if (!productSummary.priceBreakdown[priceKey3]) {
            productSummary.priceBreakdown[priceKey3] = { qty: 0, revenue: 0 };
          }
          productSummary.priceBreakdown[priceKey3].qty += order.qty;
          productSummary.priceBreakdown[priceKey3].revenue += revenue;

          if (!productSummary.locationBreakdown[order.location]) {
            productSummary.locationBreakdown[order.location] = { qty: 0, revenue: 0 };
          }
          productSummary.locationBreakdown[order.location].qty += order.qty;
          productSummary.locationBreakdown[order.location].revenue += revenue;

          if (!productSummary.dateBreakdown[order.date]) {
            productSummary.dateBreakdown[order.date] = { qty: 0, revenue: 0 };
          }
          productSummary.dateBreakdown[order.date].qty += order.qty;
          productSummary.dateBreakdown[order.date].revenue += revenue;

          if (!locationMap.has(order.location)) {
            locationMap.set(order.location, {
              location: order.location,
              totalRevenue: 0,
              totalOrders: 0,
              salesDays: 0,
              productBreakdown: {},
              uniqueDates: new Set<string>()
            } as any);
          }

          const locationSummary = locationMap.get(order.location)! as any;
          locationSummary.totalRevenue += revenue;

          // עדכון ימי מכירה
          if (order.date && !locationSummary.uniqueDates.has(order.date)) {
            locationSummary.uniqueDates.add(order.date);
          }

          if (!locationSummary.productBreakdown[order.product]) {
            locationSummary.productBreakdown[order.product] = { qty: 0, revenue: 0 };
          }
          locationSummary.productBreakdown[order.product].qty += order.qty;
          locationSummary.productBreakdown[order.product].revenue += revenue;

          if (!minDate || order.date < minDate) minDate = order.date;
          if (!maxDate || order.date > maxDate) maxDate = order.date;
        }
      }
    }

    // הוסף את המכירה לסיכום
    if (saleProducts.length > 0) {
      saleSummaries.push({
        date: saleDate,
        location: saleLocation,
        totalRevenue: row.totalAmount,
        products: saleProducts,
        rowIndex: row.rowIndex
      });
    }
  }
  
  // חישוב מחיר ממוצע למוצרים
  for (const [, product] of productMap) {
    product.avgPrice = product.totalRevenue / product.totalQty;
  }

  // עדכון מספר הזמנות ומספר ימי מכירה למיקומים
  const locationSummaries: LocationSummary[] = [];
  for (const [, location] of locationMap) {
    const locAny = location as any;
    locationSummaries.push({
      location: locAny.location,
      totalRevenue: locAny.totalRevenue,
      totalOrders: totalOrders,
      salesDays: locAny.uniqueDates ? locAny.uniqueDates.size : 0,
      productBreakdown: locAny.productBreakdown
    });
  }

  return {
    productSummaries: Array.from(productMap.values()).sort((a, b) =>
      b.totalRevenue - a.totalRevenue
    ),
    locationSummaries: locationSummaries.sort((a, b) =>
      b.totalRevenue - a.totalRevenue
    ),
    learnedPrices,
    saleSummaries: saleSummaries.sort((a, b) => {
      // מיון לפי תאריך ואז לפי מיקום
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.location.localeCompare(b.location);
    }),
    totalRevenue,
    totalOrders,
    dateRange: {
      start: minDate,
      end: maxDate
    }
  };
}

// פונקציה לפרסור תאריך מפורמט dd.mm
function parseDateString(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{1,2})\.(\d{1,2})$/);
  if (!match) return null;
  
  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  
  // נניח שנה נוכחית אם התאריך עדיין לא עבר, אחרת שנה קודמת
  const now = new Date();
  let year = now.getFullYear();
  
  const testDate = new Date(year, month - 1, day);
  if (testDate > now) {
    year--;
  }
  
  return new Date(year, month - 1, day);
}

// פונקציה לפרסור CSV
export function parseCSV(csvText: string): RawRow[] {
  const lines = csvText.split('\n');
  const rows: RawRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    
    if (parts.length < 3) continue;
    
    const totalAmount = parseFloat(parts[0]) || 0;
    const orderDetails = parts[1] || '';
    const totalQty = parseFloat(parts[2]) || 0;
    
    rows.push({
      totalAmount,
      orderDetails,
      totalQty,
      rowIndex: i
    });
  }
  
  return rows;
}
