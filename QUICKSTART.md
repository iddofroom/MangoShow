# 🚀 התחלה מהירה - מנגו דרור

## הפעלה מקומית (5 דקות)

### צעד 1: התקנה
```bash
cd mango-dashboard
npm install
```

### צעד 2: הפעלה
```bash
npm run dev
```

### צעד 3: פתח דפדפן
```
http://localhost:3000
```

### צעד 4: העלה קובץ CSV
- לחץ על "בחר קובץ CSV"
- בחר את הקובץ שלך או השתמש ב-`example_data.csv`
- המתן לעיבוד
- צפה בדשבורד! 🎉

---

## פריסה ל-Netlify (3 דקות)

### דרך ממשק Netlify:

1. **צור חשבון Netlify** (אם אין לך)
   - גש ל-https://netlify.com
   - הירשם עם GitHub

2. **העלה את הפרויקט ל-GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Mango Dashboard"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

3. **חבר ל-Netlify**
   - לחץ "Add new site"
   - בחר "Import an existing project"
   - חבר את GitHub שלך
   - בחר את הריפו `mango-dashboard`

4. **הגדרות בנייה** (Netlify ימלא אוטומטית):
   - Build command: `npm run build`
   - Publish directory: `out`

5. **Deploy!**
   - לחץ "Deploy site"
   - המתן 2-3 דקות
   - קבל URL ייחודי!

---

## פורמט CSV הנדרש

```csv
סכום כולל,פרטי הזמנה,כמות פריטים
150,קיט סוג א - ראש הנקרה , 27.10 : 10,10
```

### חובה:
- **עמודה 1**: סכום (מספר)
- **עמודה 2**: מוצר - מיקום , תאריך : כמות
- **עמודה 3**: כמות כוללת (מספר)

---

## דוגמת שימוש

1. ✅ הכן קובץ CSV עם הנתונים שלך
2. ✅ העלה לאפליקציה
3. ✅ צפה בדשבורד עם:
   - סיכום הכנסות
   - גרפים אינטראקטיביים
   - מחירים ממוצעים
   - פירוט לפי נקודות מכירה
4. ✅ סנן לפי תאריכים
5. ✅ קבל תובנות!

---

## צריך עזרה?

📧 פנה למפתח או קרא את [README.md](README.md) המלא

---

**Made with ❤️ for Mango Dror**
