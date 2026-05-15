# 🎬 VideoFlix - Premium Video Portal

Netflix + YouTube + TikTok uslubidagi zamonaviy, mobil-first video portal. Google Sheets orqali boshqariladi, frameworksiz toza HTML/CSS/JS bilan yozilgan, lekin React darajasidagi modulli arxitekturaga ega.

---

## 📁 1. Folder Structure

```
video-portal/
├── index.html              # Asosiy SPA giper-sahifa
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline cache)
├── README.md               # Bu fayl
│
├── css/
│   ├── variables.css       # Design tokens (rang, spacing, z-index)
│   ├── base.css            # Reset, body, layout
│   ├── components.css      # Header, navbar, cards, buttons
│   ├── player.css          # Video player UI
│   ├── animations.css      # Keyframes va animatsiyalar
│   └── responsive.css      # Media queries
│
├── js/
│   ├── app.js              # Entry point, PWA, network, pull-to-refresh
│   └── Router.js           # SPA hash router
│
├── api/
│   └── SheetsAPI.js        # GViz JSON parser + cache
│
├── components/
│   ├── VideoCard.js        # 4 ta turdagi kart (story/carousel/grid/list)
│   ├── Skeleton.js         # Loading skeleton
│   └── Player.js           # Custom video player (HLS + MP4 + PiP)
│
├── pages/
│   ├── HomePage.js         # Bosh sahifa (hero + trending + sections)
│   ├── SearchPage.js       # Qidiruv + filter
│   ├── FavoritesPage.js    # Sevimlilar + ko'rilganlar
│   ├── ProfilePage.js      # Profil
│   └── SettingsPage.js     # Sozlamalar
│
├── utils/
│   ├── Storage.js          # LocalStorage wrapper
│   ├── Toast.js            # Toast bildirishnomalar
│   └── Helpers.js          # Yordamchi funksiyalar
│
└── assets/
    └── icons/              # PWA ikonkalari (72-512px)
```

---

## 🚀 2. Deploy Guide

### A) GitHub Pages (eng tezkor)
```bash
# 1. GitHub'da yangi repo yarating (masalan: videoflix)
git init
git add .
git commit -m "Initial VideoFlix"
git branch -M main
git remote add origin https://github.com/USERNAME/videoflix.git
git push -u origin main

# 2. Repo Settings → Pages → Branch: main / root → Save
# 3. URL: https://USERNAME.github.io/videoflix/
```

### B) Netlify (drag & drop)
1. https://app.netlify.com/drop ga kiring
2. `video-portal` papkani sudrab tashlang
3. Tayyor URL beradi

### C) Vercel
```bash
npm i -g vercel
cd video-portal
vercel
```

### D) Local test
```bash
cd video-portal
python3 -m http.server 8000
# Brauzerda: http://localhost:8000
```

> ⚠️ **MUHIM:** `file://` orqali ochmang — ES modules ishlamaydi. Albatta server orqali oching.

---

## 📊 3. Google Sheets Setup

### Sheet tuzilmasi (A–J ustunlar):

| Ustun | Maydon | Misol |
|---|---|---|
| A | Bo'lim nomi | `Yangi filmlar` |
| B | Card turi | `carousel` / `grid` / `list` / `story` |
| C | Video nomi | `Avatar 2` |
| D | Tavsif | `Pandora sayyorasidagi sarguzashtlar` |
| E | Thumbnail URL | `https://...jpg` |
| F | Video URL | `https://...mp4` yoki `https://...m3u8` |
| G | Janr | `Fantastika` |
| H | Til | `O'zbek` |
| I | Davlat | `AQSH` |
| J | Yil | `2024` |

### Sheet'ni public qilish:
1. Google Sheets'ni oching
2. **Share** → **Anyone with the link** → **Viewer**
3. Sheet ID `URL`dan olinadi: `docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
4. Hozir ishlatilayotgan: `14S4GwzF2ddm3pIjXZSRCfMpzhErRG_maxqxbfdv-nd0`

### Yangi videoni qo'shish:
Sheetga yangi qator yozing → **5 daqiqada saytda paydo bo'ladi** (cache).
Tezroq yangilash uchun saytda **Pull-to-refresh** qiling.

### Sheet ID o'zgartirish:
`api/SheetsAPI.js` faylining 6-qatori:
```js
const SHEET_ID = 'SIZNING_SHEET_ID';
```

---

## 📱 4. Android WebView Integration

### Android Studio (Java)

`MainActivity.java`:
```java
package com.example.videoflix;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setMediaPlaybackRequiresUserGesture(false);
        ws.setAllowFileAccess(true);
        ws.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        ws.setCacheMode(WebSettings.LOAD_DEFAULT);
        ws.setUserAgentString(ws.getUserAgentString() + " VideoFlixApp");

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        // 2 variant:
        webView.loadUrl("https://USERNAME.github.io/videoflix/");
        // YOKI offline (assets folder ichida):
        // webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
```

`activity_main.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<WebView xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/webview"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

`AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<application
    android:usesCleartextTraffic="true"
    android:hardwareAccelerated="true"
    android:theme="@style/Theme.AppCompat.DayNight.NoActionBar">
```

---

## 🔧 5. Sketchware Integration

### Sketchware Pro orqali APK yaratish:
1. **New Project** → Application name: `VideoFlix`
2. **View** sahifasiga **WebView** widget qo'shing → `webview1`
3. **Properties** → Width: `match_parent`, Height: `match_parent`
4. **MainActivity** → **onCreate** → quyidagi blocklarni qo'shing:

```
// Add Source Directly:
webview1.getSettings().setJavaScriptEnabled(true);
webview1.getSettings().setDomStorageEnabled(true);
webview1.getSettings().setMediaPlaybackRequiresUserGesture(false);
webview1.getSettings().setMixedContentMode(0);
webview1.loadUrl("https://USERNAME.github.io/videoflix/");
```

5. **Permissions** → INTERNET, ACCESS_NETWORK_STATE
6. **Manifest** → `<application>` ichiga: `android:usesCleartextTraffic="true"`
7. **Compile** → **Run** → APK tayyor!

---

## 💾 6. Offline Install (PWA)

Foydalanuvchi saytni telefonga ilova sifatida o'rnatishi mumkin:

### Android (Chrome):
1. Saytni oching
2. ⋮ menyu → **"Add to Home Screen"** yoki avtomatik popup paydo bo'ladi
3. **"Install"** bosing → Home screen'da ikonka chiqadi

### iOS (Safari):
1. Saytni Safari'da oching
2. Share tugmasi → **"Add to Home Screen"**

Ilova ochilgach Service Worker barcha CSS/JS/ikonkalarni cache qiladi → keyingi safarlar **offline ham ishlaydi** (videolar bundan mustasno).

---

## ⚙️ 7. PWA Setup

Allaqachon to'liq sozlangan:

- ✅ `manifest.json` — App name, ikonkalar, theme color
- ✅ `sw.js` — Service Worker (cache strategy: static = cache-first, GViz = network-first, images = cache-first)
- ✅ Install popup (30 sek kutish bilan)
- ✅ Splash screen
- ✅ Offline fallback UI
- ✅ Theme color: `#0a0a0a` (AMOLED qora)
- ✅ Display mode: `standalone` (browser UI yashirin)
- ✅ Orientation: portrait
- ✅ Shortcuts (long-press ilova ikonka): Qidirish, Sevimlilar

---

## 🎨 Asosiy xususiyatlar

### Dizayn
- **AMOLED dark mode** — sof qora fon, batareya tejaydi
- **Glassmorphism** — header & navbar shaffof shisha effekt
- **Neon accents** — `#ff0050` (qizil), `#00f0ff` (siyan), `#b933ff` (binafsha)
- **Premium animatsiyalar** — spring easing, staggered cards
- **Mobile-first** — Android ilovaga o'xshash UX

### Funksional
- **4 ta card tipi**: story (Instagram), carousel (slider), grid (responsive), list (vertical)
- **Hero auto-slider** — 5 sekundda almashinadi
- **Pull to refresh** — yangilash uchun pastga torting
- **Infinite scroll** ready
- **Search + filter** — janr bo'yicha filtrlash
- **Continue watching** — qoldirilgan vaqtdan davom etadi
- **Favorites + History** — localStorage'da saqlanadi
- **Toast notifications** — har bir harakat uchun

### Video Player
- **HLS (.m3u8)** hls.js orqali, **MP4** native
- **Avtomatik orientation detect** — vertikal/gorizontal
- **Speed control** — 0.5x dan 2x gacha
- **Quality control** — HLS levels avtomatik
- **PiP** — Picture-in-Picture
- **Fullscreen**
- **Custom controls** — gradient, glow, glassmorphism
- **Auto-next** — keyingi video kartochkasi
- **Keyboard shortcuts** — Space, Arrow keys, F, Esc
- **Save progress** — 5 sek'da bir lokal saqlaydi
- **Subtitle** UI ready

### Texnik
- **Pure HTML/CSS/JS** — framework yo'q
- **ES6 modules** — modulli, lazy importable
- **Service Worker** — offline cache
- **Intersection Observer** — lazy load images
- **Debounce/Throttle** — search & scroll optimizatsiya
- **Vibration API** — tactile feedback
- **Web Share API** — native share
- **Picture-in-Picture API**

---

## 🐛 Troubleshooting

| Muammo | Yechim |
|---|---|
| `file://` orqali ochilmaydi | HTTP server ishlating (`python3 -m http.server`) |
| Google Sheets ma'lumotlari yuklanmayapti | Sheet'ni **Anyone with link** qilib sozlang |
| Video o'ynamayapti | Console'da CORS xatosini tekshiring. m3u8 manbasi CORS header yuborishi kerak |
| Android WebView'da video ishlamaydi | `setMediaPlaybackRequiresUserGesture(false)` qo'ying |
| PWA install popup chiqmayapti | HTTPS bo'lishi shart (localhost qabul qilinadi) |
| Cache eskirayapti | `sw.js` da `CACHE_VERSION`ni o'zgartiring |

---

## 📜 Litsenziya

MIT License — istalgan loyihada foydalaning.

---

**Yaratuvchi: VideoFlix Team**
**Versiya: 1.0.0**
**2026-yil**
