#!/bin/bash

echo "================================================"
echo "🥭 מנגו דרור - התקנה אוטומטית"
echo "================================================"
echo ""

echo "🔍 בודק התקנת Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js לא מותקן!"
    echo "📥 אנא התקן Node.js מ: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  גרסת Node.js נמוכה מדי (נדרש 18+)"
    exit 1
fi

echo "✅ Node.js $(node -v) מותקן"
echo ""

echo "📦 מתקין תלויות..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ ההתקנה נכשלה!"
    exit 1
fi

echo ""
echo "✅ ההתקנה הושלמה בהצלחה!"
echo ""
echo "🚀 להפעלה: npm run dev"
echo "================================================"
