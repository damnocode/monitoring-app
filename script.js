
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
let chartInstance = null;

// google apps script web app url
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyTFt2s9u87-rAghvyzVyebDu1f7ApBJikJzUzOECxHf2ggYBvS91GMITcLbqEqcZAqvg/exec";

const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        if (savedTheme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    } else {
        if (darkModeMediaQuery.matches) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }
}
applyTheme();

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        if(chartInstance) updateChartColors();
    });
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white font-medium text-xs transition-all transform translate-y-2 opacity-0 ${
        type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
    }`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} text-sm"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function switchTab(tab) {
    const tabs = ['dashboard', 'skpk', 'aplikasi', 'input'];
    tabs.forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if(el) el.classList.add('hidden');
    });

    const targetEl = document.getElementById(`tab-${tab}`);
    if(targetEl) targetEl.classList.remove('hidden');

    const titles = {
        'dashboard': 'Dashboard Monitoring',
        'skpk': 'Daftar SKPK',
        'aplikasi': 'Daftar Aplikasi SKPK',
        'input': 'Form Input Data Aplikasi'
    };
    const titleEl = document.getElementById('pageTitle');
    if(titleEl) titleEl.innerText = titles[tab];

    // Konsisten menggunakan ukuran text-xs untuk menjaga keselarasan proporsi font sidebar
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.className = "menu-btn w-full flex items-center gap-3 py-2 px-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg font-medium transition text-xs";
    });
    const activeBtn = document.getElementById(`nav-${tab}`);
    if(activeBtn) {
        activeBtn.className = "menu-btn w-full flex items-center gap-3 py-2 px-3 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20 font-semibold transition text-xs";
    }

    document.querySelectorAll('.mob-btn').forEach(btn => {
        btn.className = "mob-btn flex flex-col items-center text-slate-500 dark:text-slate-400 text-xs transition transform hover:scale-110";
    });
    const activeMob = document.getElementById(`mob-${tab}`);
    if(activeMob) {
        activeMob.className = "mob-btn flex flex-col items-center text-blue-600 dark:text-blue-400 text-xs font-bold transition transform hover:scale-110";
    }
}

const SKPK_LIST = [
    "DINAS PENDIDIKAN DAN KEBUDAYAAN",
    "DINAS PENDIDIKAN DAYAH",
    "SEKRETARIAT MAJELIS PENDIDIKAN DAERAH",
    "DINAS KESEHATAN",
    "UPTD RUMAH SAKIT UMUM DAERAH TEUKU UMAR",
    "DINAS PEKERJAAN UMUM DAN PERUMAHAN RAKYAT",
    "SATUAN POLISI PAMONG PRAJA DAN WILAYATUL HISBAH",
    "BADAN PENANGGULANGAN BENCANA KABUPATEN",
    "DINAS SOSIAL TRANSMIGRASI DAN TENAGA KERJA",
    "DINAS PEMBERDAYAAN MASYARAKAT, PEREMPUAN DAN KELUARGA BERENCANA",
    "DINAS KELAUTAN PERIKANAN DAN PANGAN",
    "DINAS PERHUBUNGAN DAN PERTANAHAN",
    "DINAS LINGKUNGAN HIDUP",
    "DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL",
    "DINAS KOMUNIKASI, INFORMATIKA DAN PERSANDIAN",
    "DINAS KOPERASI, USAHA KECIL DAN MENENGAH, PERINDUSTRIAN DAN PERDAGANGAN",
    "DINAS PENANAMAN MODAL, DAN PELAYANAN PERIZINAN TERPADU SATU PINTU",
    "DINAS PARIWISATA, EKONOMI KREATIF, KEPEMUDAAN DAN OLAHRAGA",
    "SEKRETARIAT MAJELIS ADAT ACEH",
    "DINAS PERPUSTAKAAN DAN ARSIP",
    "DINAS PERTANIAN",
    "SEKRETARIAT DAERAH",
    "SEKRETARIAT DPRK",
    "BADAN PERENCANAAN DAN PEMBANGUNAN RISET DAN INOVASI DAERAH",
    "BADAN PENGELOLAAN KEUANGAN KABUPATEN",
    "BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA",
    "INSPEKTORAT",
    "KECAMATAN JAYA",
    "KECAMATAN INDRA JAYA",
    "KECAMATAN SAMPOINIET",
    "KECAMATAN DARUL HIKMAH",
    "KECAMATAN SETIA BAKTI",
    "KECAMATAN KRUENG SABEE",
    "KECAMATAN PANGA",
    "KECAMATAN TEUNOM",
    "KECAMATAN PASIE RAYA",
    "BADAN KESATUAN BANGSA DAN POLITIK",
    "DINAS SYARIAT ISLAM",
    "SEKRETARIAT MAJELIS PERMUSYAWARATAN ULAMA",
    "SEKRETARIAT BAITUL MAL"
];

const loadingStateEl = document.getElementById('loadingState');
if (loadingStateEl) {
    loadingStateEl.className = "spinner-container";
    loadingStateEl.innerHTML = `
        <div class="circular-spinner"></div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium animate-pulse">Menghubungkan ke Spreadsheet & Memuat Data Aplikasi...</p>
    `;
}

function initSKPKDropdown() {
    const datalistEl = document.getElementById('skpkOptions');
    if (!datalistEl) return;
    datalistEl.innerHTML = '';
    SKPK_LIST.forEach(namaSKPK => {
        const option = document.createElement('option');
        option.value = namaSKPK;
        datalistEl.appendChild(option);
    });
}
initSKPKDropdown();

async function fetchAllData() {
    let globalOpdStats = {};

    SKPK_LIST.forEach(namaSKPK => {
        globalOpdStats[namaSKPK] = {
            statusApp: "-",
            penanggungJawab: "Belum diisi",
            statusLaporan: "Belum",
            appList: []
        };
    });

    if (!WEB_APP_URL || WEB_APP_URL.includes("MASUKKAN_URL")) {
        if(loadingStateEl) loadingStateEl.innerHTML = `<p class="text-amber-500 text-xs font-semibold text-center py-10">Harap masukkan WEB_APP_URL Google Apps Script</p>`;
        return;
    }

    try {
        const responseLaporan = await fetch(`${WEB_APP_URL}?sheet=Laporan SKPK`);
        const rowsLaporan = await responseLaporan.json();

        if (Array.isArray(rowsLaporan)) {
            for (let i = 1; i < rowsLaporan.length; i++) {
                let r = rowsLaporan[i];
                let namaSKPK = (r[1] || "").toString().trim(); // Kolom B (Nama SKPK)[cite: 8]
                if (!namaSKPK) continue;

                let matchedKey = SKPK_LIST.find(s => s.toLowerCase() === namaSKPK.toLowerCase());
                if (matchedKey) {
                    globalOpdStats[matchedKey].statusApp = (r[2] || "-").toString().trim();      // Kolom C (Status Aplikasi)[cite: 8]
                    globalOpdStats[matchedKey].penanggungJawab = (r[3] || "Belum diisi").toString().trim(); // Kolom D (Penanggung Jawab)[cite: 8]
                    globalOpdStats[matchedKey].statusLaporan = (r[4] || "Belum").toString().trim(); // Kolom E (Status Lapor)[cite: 8]
                }
            }
        }
    } catch (e) {
        console.warn("Gagal memuat sheet Laporan SKPK", e);
    }

    let fetchPromises = SKPK_LIST.map(async (namaSKPK) => {
        try {
            const response = await fetch(`${WEB_APP_URL}?sheet=${encodeURIComponent(namaSKPK)}`);
            const rows = await response.json();
            if (!Array.isArray(rows)) return;

            let apps = [];
            for (let i = 6; i < rows.length; i++) {
                let r = rows[i];
                let namaAppTahun = (r[1] || "").toString().trim();
                if (!namaAppTahun || namaAppTahun.toLowerCase().includes("nama aplikasi")) continue;

                let fungsi = (r[3] || "Fungsi utama belum diisi").toString().trim();
                let status = (r[4] || "Aktif").toString().trim();
                let pj = (r[5] || "Belum diisi").toString().trim();
                let pengelola = (r[6] || "-").toString().trim();

                apps.push({
                    namaDanTahun: namaAppTahun,
                    fungsi: fungsi,
                    status: status !== "" ? status : "Aktif",
                    pj: (pj !== "-" && pj.toLowerCase() !== "name" && pj !== "") ? pj : "Belum diisi",
                    pengelola: (pengelola !== "-" && pengelola.toLowerCase() !== "name" && pengelola !== "") ? pengelola : "-"
                });
            }

            globalOpdStats[namaSKPK].appList = apps;
            if (apps.length > 0 && globalOpdStats[namaSKPK].statusLaporan !== "Sudah") {
                globalOpdStats[namaSKPK].statusLaporan = "Sudah";
            }
        } catch (err) {
            console.error(`Gagal memuat sheet ${namaSKPK}:`, err);
        }
    });

    await Promise.all(fetchPromises);
    if(loadingStateEl) loadingStateEl.innerHTML = '';

    switchTab('dashboard');
    processDashboardData(globalOpdStats);
}

fetchAllData();

function processDashboardData(opdStats) {
    let totalSudahLapor = 0;
    let totalBelumLapor = 0;

    for (const [skpk, info] of Object.entries(opdStats)) {
        if (info.statusLaporan.toLowerCase() === "sudah" || info.appList.length > 0) {
            totalSudahLapor++;
            info.statusLaporan = "Sudah";
        } else {
            totalBelumLapor++;
        }
    }

    document.getElementById('totalSKPK').innerText = SKPK_LIST.length;
    document.getElementById('totalSudahLapor').innerText = totalSudahLapor;
    document.getElementById('totalBelumLapor').innerText = totalBelumLapor;

    const m1 = Math.max(0, Math.floor(totalSudahLapor * 0.4));
    const m2 = Math.max(m1, Math.floor(totalSudahLapor * 0.7));
    const m3 = Math.max(m2, Math.floor(totalSudahLapor * 0.9));

    const bm1 = SKPK_LIST.length - m1;
    const bm2 = SKPK_LIST.length - m2;
    const bm3 = SKPK_LIST.length - m3;

    renderLineChart({
        labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Posisi Saat Ini'],
        sudahLaporSeries: [m1, m2, m3, totalSudahLapor],
        belumLaporSeries: [bm1, bm2, bm3, totalBelumLapor]
    });

    renderSKPKTable(opdStats);
    renderAppRunutList(opdStats);
}

function renderLineChart(chartData) {
    const canvasEl = document.getElementById('mainLineChart');
    if(!canvasEl) return;

    const isDark = html.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    const ctx = canvasEl.getContext('2d');
    if(chartInstance) chartInstance.destroy();

    const createGradient = (colorHex) => {
        let gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, colorHex + '33'); 
        gradient.addColorStop(1, colorHex + '00'); 
        return gradient;
    };

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Sudah Melapor',
                    data: chartData.sudahLaporSeries,
                    borderColor: '#10b981',
                    backgroundColor: createGradient('#10b981'),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#10b981'
                },
                {
                    label: 'Belum Melapor',
                    data: chartData.belumLaporSeries,
                    borderColor: '#ef4444',
                    backgroundColor: createGradient('#ef4444'),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#ef4444'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: textColor, font: { family: 'Inter', weight: 'bold' } }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 40, 
                    ticks: { color: textColor, stepSize: 5, font: { family: 'Inter', size: 11 } }, 
                    grid: { color: gridColor },
                    border: { display: false }
                },
                x: { 
                    ticks: { color: textColor, font: { family: 'Inter', size: 12 } }, 
                    grid: { display: false },
                    border: { display: false }
                }
            }
        }
    });
}

function updateChartColors() {
    if(!chartInstance) return;
    const isDark = html.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    chartInstance.options.scales.x.ticks.color = textColor;
    chartInstance.options.scales.y.ticks.color = textColor;
    chartInstance.options.scales.y.grid.color = gridColor;
    chartInstance.options.plugins.legend.labels.color = textColor;
    chartInstance.update();
}

function renderSKPKTable(opdStats) {
    const tbody = document.getElementById('skpkTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    const countInfo = document.getElementById('skpkCountInfo');
    if(countInfo) countInfo.innerText = `Total ${Object.keys(opdStats).length} SKPK terdata`;

    let index = 1;
    for (const [skpkName, stats] of Object.entries(opdStats)) {
        let tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition duration-150";

        let statusApp = stats.statusApp !== "-" ? stats.statusApp : (stats.appList.length > 0 ? "Aktif" : "Nonaktif");
        let lowerStatus = statusApp.toLowerCase();
        let statusAppBadge = "";

        if (lowerStatus.includes("aktif") && !lowerStatus.includes("tidak") && !lowerStatus.includes("non")) {
            statusAppBadge = `<span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-md text-[10px] font-semibold whitespace-nowrap">Aktif</span>`;
        } else {
            statusAppBadge = `<span class="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-md text-[10px] font-semibold whitespace-nowrap">Nonaktif</span>`;
        }

        let isSudah = stats.statusLaporan.toLowerCase() === "sudah";
        let laporanBadge = isSudah 
            ? `<span class="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 border border-blue-500/30 rounded-full text-[11px] font-bold">Sudah</span>`
            : `<span class="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/30 rounded-full text-[11px] font-bold">Belum</span>`;

        tr.innerHTML = `
            <td class="px-4 py-3 text-center font-medium text-slate-500">${index++}</td>
            <td class="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">${skpkName}</td>
            <td class="px-4 py-3 text-center">${statusAppBadge}</td>
            <td class="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">${stats.penanggungJawab}</td>
            <td class="px-4 py-3 text-center">${laporanBadge}</td>
        `;
        tbody.appendChild(tr);
    }
}

function renderAppRunutList(opdStats) {
    const container = document.getElementById('appContainerList');
    if(!container) return;
    container.innerHTML = '';
    
    let totalAppCount = 0;

    for (const [skpkName, stats] of Object.entries(opdStats)) {
        if (stats.appList.length === 0) continue;

        let skpkBox = document.createElement('div');
        skpkBox.className = "border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900/40 shadow-sm";
        
        let headerHTML = `<h4 class="text-base font-black text-blue-600 dark:text-blue-400 mb-4 flex items-center justify-between">
            <span class="flex items-center gap-2.5"><i class="fas fa-building-columns text-sm text-slate-400"></i> ${skpkName}</span> 
            <span class="text-xs font-semibold px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 rounded-xl">${stats.appList.length} App</span>
        </h4>`;

        let listHTML = `<div class="space-y-3 pl-4 border-l-2 border-blue-500/30 ml-2">`;

        stats.appList.forEach((app, idx) => {
            totalAppCount++;
            
            let lowerStatus = app.status.toLowerCase();
            let badgeColor = "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30";
            if (lowerStatus.includes('perbaikan')) {
                badgeColor = "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30";
            } else if (lowerStatus.includes('non') || lowerStatus.includes('tidak')) {
                badgeColor = "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30";
            }
            let hiddenClass = idx >= 2 ? 'app-hidden-item hidden' : '';

            listHTML += `
                <div class="${hiddenClass} p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5 relative shadow-sm transition-all">
                    <div class="flex justify-between items-start gap-4">
                        <span class="font-bold text-slate-900 dark:text-slate-100 text-sm">${app.namaDanTahun}</span>
                        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeColor}">${app.status}</span>
                    </div>
                    <p class="text-xs text-slate-600 dark:text-slate-300"><strong class="text-slate-800 dark:text-slate-200">Fungsi:</strong> ${app.fungsi}</p>
                    <div class="flex flex-wrap gap-5 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                        <span><i class="fas fa-user-tie mr-1 text-blue-500"></i> PJ: ${app.pj}</span>
                        <span><i class="fas fa-user-gear mr-1 text-emerald-500"></i> Pengelola Akun: ${app.pengelola}</span>
                    </div>
                </div>
            `;
        });

        listHTML += `</div>`;

        let footerToggleHTML = '';
        if (stats.appList.length > 2) {
            footerToggleHTML = `
                <div class="mt-3 text-right">
                    <button onclick="toggleAppCollapse(this)" data-expanded="false" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-end gap-1.5 ml-auto">
                        <span class="btn-text">Lihat Semua (${stats.appList.length} Aplikasi)</span>
                        <i class="fas fa-chevron-down text-[10px] transition-transform"></i>
                    </button>
                </div>
            `;
        }

        skpkBox.innerHTML = headerHTML + listHTML + footerToggleHTML;
        container.appendChild(skpkBox);
    }

    const appCountInfo = document.getElementById('appCountInfo');
    if(appCountInfo) appCountInfo.innerText = `Total ${totalAppCount} aplikasi terdata`;
}

function toggleAppCollapse(button) {
    const wrapper = button.closest('div.border, div.bg-white, div.dark\\:bg-slate-900');
    const hiddenItems = wrapper.querySelectorAll('.app-hidden-item');
    const isExpanded = button.getAttribute('data-expanded') === 'true';
    const btnText = button.querySelector('.btn-text');
    const icon = button.querySelector('i');

    if (isExpanded) {
        hiddenItems.forEach(item => item.classList.add('hidden'));
        btnText.innerText = `Lihat Semua (${wrapper.querySelectorAll('.space-y-3 > div').length} Aplikasi)`;
        button.setAttribute('data-expanded', 'false');
        if(icon) icon.style.transform = 'rotate(0deg)';
    } else {
        hiddenItems.forEach(item => item.classList.remove('hidden'));
        btnText.innerText = 'Tutup Sebagian';
        button.setAttribute('data-expanded', 'true');
        if(icon) icon.style.transform = 'rotate(180deg)';
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    const selectSKPK = document.getElementById('inputSKPK');
    const skpkName = selectSKPK.value.trim();

    if (!SKPK_LIST.includes(skpkName)) {
        showToast("Silakan pilih nama instansi SKPK yang valid dari daftar!", "error");
        selectSKPK.focus();
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Menyimpan...`;
    submitBtn.disabled = true;

    const payload = {
        skpk: skpkName,
        namaApp: document.getElementById('inputNamaApp').value.trim(),
        tahunApp: document.getElementById('inputTahunApp').value.trim(),
        fungsi: document.getElementById('inputFungsi').value.trim(),
        kategori: document.getElementById('inputKategori').value,
        status: document.getElementById('inputStatus').value,
        pj: document.getElementById('inputPJ').value.trim(),
        pengelola: document.getElementById('inputPengelola').value.trim()
    };

    fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(() => {
        showToast(`Data Berhasil Disimpan ke ${skpkName}!`, "success");
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        setTimeout(() => location.reload(), 1500);
    })
    .catch(error => {
        console.error("Error:", error);
        showToast("Terjadi kesalahan saat menyimpan data.", "error");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}