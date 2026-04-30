// 1. SOZLAMALAR
const SHEET_ID = '14S4GwzF2ddm3pIjXZSRCfMpzhErRG_maxqxbfdv-nd0';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
const DEFAULT_IMG = 'https://via.placeholder.com/400x600?text=Rasm+Mavjud+Emas';

let db = []; // Barcha ma'lumotlar bazasi
let currentTab = 'home';

// 2. ILOVANI ISHGA TUSHIRISH (BOOT)
window.onload = () => {
    initPortal();
};

async function initPortal() {
    try {
        const res = await fetch(SHEET_URL);
        const txt = await res.text();
        const json = JSON.parse(txt.substring(47).slice(0, -2));
        
        // Google Sheets ma'lumotlarini ob'ektga aylantirish
        db = json.table.rows.map((r, i) => {
            return {
                id: i,
                cat: r.c[0]?.v || 'Boshqa',
                layout: r.c[1]?.v ? r.c[1].v.toString().trim().toLowerCase() : 'grid',
                title: r.c[2]?.v || 'Nomsiz video',
                desc: r.c[3]?.v || '',
                thumb: r.c[4]?.v || DEFAULT_IMG,
                url: r.c[5]?.v || '',
                genre: r.c[6]?.v || 'Kino',
                lang: r.c[7]?.v || 'Uzbek',
                country: r.c[8]?.v || 'Uzbekistan',
                year: r.c[9]?.v || '2024'
            };
        });

        console.log("Ma'lumotlar muvaffaqiyatli yuklandi!");
        renderHome();
        buildCategories();
        
        // Yuklanish ekranini yopish
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app-content').style.opacity = '1';

    } catch (err) {
        console.error("Xatolik:", err);
        alert("Internet ulanishini tekshiring!");
    }
}

// 3. ASOSIY SAHIFA (HOME) RENDERI
function renderHome() {
    const storyBox = document.getElementById('story-container');
    const mainBox = document.getElementById('main-content-area');
    
    if(storyBox) storyBox.innerHTML = '';
    if(mainBox) mainBox.innerHTML = '';

    let cats = {};

    db.forEach(item => {
        const lo = item.layout.toLowerCase().trim();
        if (lo === 'story') {
            storyBox.innerHTML += `
                <div class="story-item" onclick="goToDetail(${item.id})">
                    <div class="story-ring"><img src="${item.thumb}" onerror="this.src='${DEFAULT_IMG}'"></div>
                    <span class="story-name">${item.title}</span>
                </div>`;
        } else {
            if (!cats[item.cat]) cats[item.cat] = { type: lo, items: [] };
            cats[item.cat].items.push(item);
        }
    });

    for (let cName in cats) {
        let c = cats[cName];
        let safeName = cName.replace(/'/g, "\\'");
        
        let sectionHtml = `
            <div class="section-header">
                <h2 class="section-title">${cName}</h2>
                <span class="view-all" onclick="openCatAll('${safeName}')">Barchasi</span>
            </div>`;

        // 1. CAROUSEL (Kattaroq format)
        if (c.type === 'carousel') {
            sectionHtml += `<div class="carousel-wrapper big-carousel">` + c.items.map(item => `
                <div class="carousel-card" onclick="goToDetail(${item.id})">
                    <img src="${item.thumb}" onerror="this.src='${DEFAULT_IMG}'">
                    <div class="carousel-overlay"><h3>${item.title}</h3></div>
                </div>`).join('') + `</div>`;
        } 
        // 2. LIST (Limit: 5 ta)
        else if (c.type === 'list') {
            const limitedItems = c.items.slice(0, 5); // Faqat 5 tasini olish
            sectionHtml += `<div class="list-container">` + limitedItems.map(item => `
                <div class="playlist-item" onclick="goToDetail(${item.id})">
                    <img src="${item.thumb}" onerror="this.src='${DEFAULT_IMG}'">
                    <div class="p-info">
                        <h4>${item.title}</h4>
                        <p>${item.year} • ${item.genre}</p>
                    </div>
                </div>`).join('') + `</div>`;
        }
        // 3. GRID (16:9 nisbat, 2 qator, gorizontal skroll)
        else {
            sectionHtml += `<div class="grid-scroll-container">` + c.items.map(item => `
                <div class="grid-card-16-9" onclick="goToDetail(${item.id})">
                    <img src="${item.thumb}" onerror="this.src='${DEFAULT_IMG}'">
                    <div class="grid-info"><h4>${item.title}</h4></div>
                </div>`).join('') + `</div>`;
        }
        mainBox.innerHTML += sectionHtml;
    }
}



// 4. TABLARNI ALMASHTIRISH (BOTTOM NAV)
function switchTab(tabId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById('v-' + tabId).classList.add('active');
    event.currentTarget.classList.add('active');
    currentTab = tabId;
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// 5. KATEGORIYA PLAYLISTINI OCHISH (OVERLAY)
function openCatAll(catName) {
    const sheet = document.getElementById('cat-overlay');
    const title = document.getElementById('cat-title');
    const content = document.getElementById('cat-list-content');
    
    title.innerText = catName;
    content.innerHTML = '';

    const list = db.filter(x => x.cat === catName);
    list.forEach(item => {
        content.innerHTML += `
            <div class="playlist-item" onclick="goToDetail(${item.id})">
                <img src="${item.thumb}" onerror="this.src='${DEFAULT_IMG}'">
                <div class="p-info">
                    <h4>${item.title}</h4>
                    <p>${item.year} • ${item.genre} • ${item.lang}</p>
                </div>
                <i class="fas fa-chevron-right" style="color:#333"></i>
            </div>`;
    });
    sheet.classList.add('open');
}

function closeCatSheet() {
    document.getElementById('cat-overlay').classList.remove('open');
}

// 6. QIDIRUV TIZIMI
function doSearch() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const resultsBox = document.getElementById('search-results');
    
    if (query.length < 2) {
        resultsBox.innerHTML = '<p class="search-hint">Kamida 2 ta harf yozing...</p>';
        return;
    }

    const filtered = db.filter(x => 
        x.title.toLowerCase().includes(query) || 
        x.genre.toLowerCase().includes(query) ||
        x.cat.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        resultsBox.innerHTML = '<p class="search-hint">Hech narsa topilmadi :(</p>';
    } else {
        resultsBox.innerHTML = `<div class="grid-wrapper">` + filtered.map(item => `
            <div class="grid-card" onclick="goToDetail(${item.id})">
                <img src="${item.thumb}" onerror="this.src='${DEFAULT_IMG}'">
                <div class="grid-info">
                    <h4>${item.title}</h4>
                    <span>${item.year}</span>
                </div>
            </div>`).join('') + `</div>`;
    }
}

// 7. KATEGORIYA BO'LIMINI QURISH (TAB 2)
function buildCategories() {
    const box = document.getElementById('cat-grid-list');
    const uniqueCats = [...new Set(db.map(item => item.cat))];
    
    box.innerHTML = uniqueCats.map(c => `
        <div class="menu-item" onclick="openCatAll('${c.replace(/'/g, "\\'")}')">
            <i class="fas fa-folder" style="color:var(--primary)"></i>
            <span>${c}</span>
            <i class="fas fa-chevron-right" style="margin-left:auto; font-size:12px; color:#444"></i>
        </div>
    `).join('');
}

// 8. DETAIL VA NAVIGATSIYA
function goToDetail(id) {
    const selected = db.find(x => x.id === id);
    localStorage.setItem('currentVideo', JSON.stringify(selected));
    window.location.href = 'detail.html';
}
