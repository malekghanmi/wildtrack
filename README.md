# 🌍 WildTrack v2 — Global Animal Intelligence Platform

## What's New in v2

### ✅ Login screen removed
The app launches directly with 50 demo animals. No account needed.

### ✅ 50 animals across 7 continents
Africa, Americas, Europe, Asia, Ocean, Arctic, Antarctica — lions, elephants, sharks, whales, polar bears, penguins, tigers, wolves, dolphins and more.

### ✅ 4-method AI prediction engine
Every prediction combines:
1. **Bézier Curve** — smooth curved path (not a straight line)
2. **Territory Return** — animals are pulled back toward their home range
3. **Circadian Clock** — each species has a 24-hour activity profile (lions hunt at night, eagles fly at dawn)
4. **Kalman Filter** — velocity smoothing with growing uncertainty ellipses

### ✅ Real species photos
Photos load automatically from Wikipedia Commons for each species.

### ✅ White / glassmorphism premium design
Clean white background with premium typography, glassmorphism panels, and subtle shadows.

---

## 🔑 To use Movebank live data (optional)

1. Go to https://www.movebank.org and create a free account
2. Open `js/config.js`
3. Add your credentials:
```js
DEFAULT_USER: 'your_username',
DEFAULT_PASS: 'your_password',
```

---

## 📸 To add your own animal photos

In `js/config.js`, find `SPECIES_PHOTOS` and replace any URL:
```js
'Lion': 'https://your-server.com/lion.jpg',
```
Photos must be direct image URLs (ending in .jpg, .png, .webp, etc.)

---

## 🚀 How to run

Simply open `index.html` in any modern browser.
No server needed — works fully offline with demo data.

---

## 📁 Project structure

```
wildtrack/
├── index.html          ← Main entry point (no login)
├── css/
│   └── style.css       ← Premium white theme
└── js/
    ├── config.js       ← Settings, photo URLs, Movebank credentials
    ├── data.js         ← 50 animals demo dataset
    ├── prediction.js   ← 4-method AI prediction engine
    ├── map.js          ← Leaflet map + uncertainty circles
    ├── ui.js           ← UI rendering + photo cards
    ├── analytics.js    ← GPS analytics
    ├── api.js          ← Movebank API module
    └── app.js          ← Main controller
```

---

## 🎓 LinkedIn Post

> 🌍 Just built **WildTrack v2** — a real-time global animal tracking dashboard
>
> 50 animals. 7 continents. 4 AI prediction methods combined:
> • Bézier curved paths (not straight lines!)
> • Territory return algorithm
> • Circadian 24h behaviour model (lions hunt at night 🌙)
> • Kalman filter with growing uncertainty ellipses
>
> Stack: Vanilla JS · Leaflet.js · Chart.js · Wikipedia Commons API · Movebank GPS data
>
> Every animal card shows a real photo, live speed, current activity, and a confidence ring for the prediction.
>
> This started as a school project and became a full wildlife intelligence platform.
>
> #WildlifeTracking #MachineLearning #DataViz #JavaScript #OpenData
