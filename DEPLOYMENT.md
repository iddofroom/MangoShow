# 🚀 מדריך פריסה מלא ל-Netlify

## שיטה 1: דרך ממשק Netlify (המומלץ)

### הכנה
1. וודא שיש לך חשבון GitHub
2. צור חשבון ב-[Netlify](https://netlify.com)

### העלאת הפרויקט ל-GitHub

```bash
# אתחול Git (אם עדיין לא עשית)
cd mango-dashboard
git init

# הוספת כל הקבצים
git add .

# יצירת commit ראשון
git commit -m "Initial commit: Mango Dashboard"

# יצירת ריפוזיטורי ב-GitHub (דרך האתר)
# לאחר מכן:
git remote add origin https://github.com/YOUR_USERNAME/mango-dashboard.git
git branch -M main
git push -u origin main
```

### חיבור ל-Netlify

1. **התחבר ל-Netlify**
   - גש ל-https://app.netlify.com
   - לחץ "Add new site"

2. **יבוא הפרויקט**
   - בחר "Import an existing project"
   - לחץ על "GitHub"
   - אשר את החיבור לחשבון GitHub שלך
   - בחר את הריפו `mango-dashboard`

3. **הגדרות Build**
   Netlify אמור למלא אוטומטית:
   ```
   Build command: npm run build
   Publish directory: out
   ```
   
   אם לא, הכנס את הערכים האלה ידנית.

4. **Deploy!**
   - לחץ "Deploy site"
   - המתן כ-2-3 דקות
   - תקבל URL כמו: `https://random-name-123.netlify.app`

5. **שנה את שם האתר (אופציונלי)**
   - Site settings → Domain management → Change site name
   - בחר שם כמו: `mango-dror-dashboard.netlify.app`

---

## שיטה 2: דרך Netlify CLI

### התקנת Netlify CLI

```bash
npm install -g netlify-cli
```

### התחברות

```bash
netlify login
```

### בנייה ופריסה

```bash
# בנה את הפרויקט
npm run build

# deploy לפרודקשן
netlify deploy --prod

# או בשני שלבים:
netlify deploy --build  # גרסת טסט
netlify deploy --prod   # לפרודקשן
```

---

## שיטה 3: Drag & Drop (הכי פשוט אבל לא מומלץ)

1. בנה את הפרויקט מקומית:
   ```bash
   npm run build
   ```

2. גש ל-[Netlify Drop](https://app.netlify.com/drop)

3. גרור את התיקייה `out` למסך

4. קבל URL מיד!

**חיסרון**: לא מתעדכן אוטומטית כשיש שינויים בקוד.

---

## הגדרות מתקדמות

### משתני סביבה (Environment Variables)

אם יש משתני סביבה, הוסף אותם ב:
- Site settings → Environment variables → Add variable

### Custom Domain

1. Site settings → Domain management
2. Add custom domain
3. עקוב אחרי ההוראות להגדרת DNS

### SSL/HTTPS

Netlify מספק HTTPS אוטומטית! ✅

---

## פתרון בעיות נפוצות

### Build נכשל

**בדוק:**
1. הקובץ `netlify.toml` קיים
2. הגרסה של Node.js נכונה (18+)
3. כל הקבצים עלו ל-Git

**פתרון:**
```bash
# נקה cache מקומי
rm -rf node_modules .next out
npm install
npm run build
```

### האפליקציה לא נטענת

**בדוק:**
1. ה-publish directory הוא `out`
2. הבנייה הסתיימה בהצלחה
3. אין שגיאות ב-deploy logs

### נתונים לא נשמרים

זה תקין! האפליקציה עובדת בצד הלקוח בלבד.
אין שרת backend, כל העיבוד נעשה בדפדפן.

---

## עדכון האפליקציה

### אוטומטי (דרך GitHub)

כל push ל-main מעדכן אוטומטית:
```bash
git add .
git commit -m "תיאור השינוי"
git push
```

Netlify יבנה וידפלוי אוטומטית!

### ידני (דרך CLI)

```bash
npm run build
netlify deploy --prod
```

---

## ניטור וסטטיסטיקות

בממשק Netlify תוכל לראות:
- ✅ מספר visitors
- ✅ Bandwidth usage
- ✅ Build logs
- ✅ Deploy history
- ✅ Analytics (בתשלום)

---

## אבטחה

Netlify כולל:
- ✅ HTTPS אוטומטי
- ✅ DDoS protection
- ✅ CDN גלובלי
- ✅ Auto-backups

---

## תמחור

**Free tier כולל:**
- 100GB bandwidth/חודש
- 300 build minutes/חודש
- Unlimited sites
- HTTPS
- Continuous deployment

**מספיק לרוב המקרים!**

---

## נספחים

### תהליך build מלא

```
1. Netlify מקבל push
2. מוריד את הקוד מ-GitHub
3. מריץ `npm install`
4. מריץ `npm run build`
5. לוקח את התיקייה `out`
6. מפרסם ל-CDN
7. שולח הודעה שהפריסה הצליחה
```

### זמני build טיפוסיים

- Build ראשון: ~3-5 דקות
- Builds עוקבים: ~2-3 דקות (עם cache)

---

## עזרה נוספת

- [תיעוד Netlify](https://docs.netlify.com)
- [קהילת Netlify](https://community.netlify.com)
- [Status page](https://www.netlifystatus.com)

---

**הצלחה! 🎉**
