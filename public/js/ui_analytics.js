function renderAnalytics() {
  lucide.createIcons();

  document.getElementById("stat-koch-level-card").style.display =
    statsViewMode === "tx" ? "none" : "block";

  const dataHist =
    statsViewMode === "tx"
      ? userStats.txWpmHistory || []
      : userStats.rxWpmHistory || [];
  const wpmVals = dataHist.filter((v) => v > 0);
  const bestHistory = wpmVals.length ? Math.max(...wpmVals) : 0;

  let bestWpm = 0;
  if (statsViewMode === "tx") {
    bestWpm = Math.max(bestHistory, userStats.bestTxWpm || 0);
  } else {
    bestWpm = Math.max(bestHistory, userStats.bestRxWpm || 0);
  }

  document.getElementById("stat-best-wpm").textContent = bestWpm;

  document.getElementById("stat-koch-level").textContent =
    userStats.kochLevel || 1;

  const t = userStats.totalPlayTime || 0;
  const hrs = Math.floor(t / 3600000);
  const mins = Math.floor((t % 3600000) / 60000);
  document.getElementById("stat-total-time").textContent = `${hrs}h ${mins}m`;

  const source = statsViewMode === "tx" ? userStats.tx : userStats.rx;
  const acc =
    source.totalChars > 0
      ? Math.max(
          0,
          100 - Math.round((source.totalErrors / source.totalChars) * 100),
        )
      : 100;

  document.getElementById("stat-accuracy").textContent = acc + "%";
  document.getElementById("heatmap-title").textContent =
    statsViewMode === "tx" ? "TX Error Heatmap" : "RX Error Heatmap";

  const grid = document.getElementById("badges-grid");
  grid.innerHTML = "";

  const totalBadges = Object.keys(BADGES_INFO).length;
  const unlockedCount = (userStats.badges || []).length;
  document.getElementById("badges-count-display").textContent =
    `${unlockedCount}/${totalBadges}`;

  const allBadges = Object.keys(BADGES_INFO).map((id) => {
    return {
      id,
      info: BADGES_INFO[id],
      unlocked: (userStats.badges || []).includes(id),
    };
  });

  allBadges.sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return 0;
  });

  const minShow = Math.max(8, unlockedCount);
  const visibleBadges = badgesExpanded
    ? allBadges
    : allBadges.slice(0, minShow);

  visibleBadges.forEach((badgeObj) => {
    const { id, info, unlocked } = badgeObj;
    const el = document.createElement("div");
    el.className = `badge-item ${unlocked ? "unlocked" : ""}`;
    el.onclick = () => showBadgeInfo(id);
    el.innerHTML = `
            <div class="badge-icon" style="color: ${unlocked ? info.color : "var(--text-muted)"}; box-shadow: none; border: none; background: ${unlocked ? info.color + "20" : "var(--bg-element)"};">
                <i data-lucide="${info.icon}"></i>
            </div>
            <div class="badge-name">${info.name}</div>
        `;
    grid.appendChild(el);
  });

  const expandContainer = document.getElementById("badges-expand-container");
  if (allBadges.length > minShow) {
    expandContainer.style.display = "block";
    expandContainer.innerHTML = `<button class="btn" style="width: 100%; border: none; background: var(--bg-element);">${badgesExpanded ? "Show Less" : "Show All Achievements"}</button>`;
    expandContainer.querySelector("button").onclick = () => {
      badgesExpanded = !badgesExpanded;
      renderAnalytics();
    };
  } else {
    expandContainer.style.display = "none";
  }

  lucide.createIcons();

  const rows = [
    "1234567890",
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM",
    ".,?!/@",
    "-:;()='\"",
  ];
  const heatmapGrid = document.getElementById("heatmap-grid");
  heatmapGrid.innerHTML = "";

  const maxErrors = Math.max(...Object.values(source.heat), 5);

  rows.forEach((rowStr) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "hm-row";
    rowStr.split("").forEach((char) => {
      const keyDiv = document.createElement("div");
      keyDiv.className = "hm-key";
      keyDiv.textContent = char;

      const errs = source.heat[char] || 0;
      if (errs > 0) {
        keyDiv.setAttribute("data-errors", errs);
        keyDiv.classList.add("has-error");
        const intensity = Math.min(1, Math.max(0.2, errs / maxErrors));
        keyDiv.style.backgroundColor = `rgba(var(--danger-rgb), ${intensity})`;
      } else {
        keyDiv.style.opacity = "0.5";
      }
      rowDiv.appendChild(keyDiv);
    });
    heatmapGrid.appendChild(rowDiv);
  });

  requestAnimationFrame(() => {
    const dataHist =
      statsViewMode === "tx" ? userStats.txWpmHistory : userStats.rxWpmHistory;
    renderChart("wpm-chart", dataHist, "#3b82f6", "no-data-msg", statsViewMode);
  });
}

let wpmChartInstance = null;

function renderChart(canvasId, data, color, emptyId, mode) {
  const canvas = document.getElementById(canvasId);

  if (!data || data.length === 0) {
    document.getElementById(emptyId).style.display = "flex";
    canvas.style.display = "none";
    if (wpmChartInstance) {
      wpmChartInstance.destroy();
      wpmChartInstance = null;
    }
    return;
  }

  document.getElementById(emptyId).style.display = "none";
  canvas.style.display = "block";

  if (wpmChartInstance) {
    wpmChartInstance.destroy();
  }

  const ctx = canvas.getContext("2d");

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 180);
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.5)");
  gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");

  wpmChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((_, i) => i + 1),
      datasets: [
        {
          label: mode === "tx" ? "TX WPM" : "RX WPM",
          data: data,
          borderColor: color,
          backgroundColor: gradient,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#fff",
          pointBorderColor: color,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          titleFont: { size: 13, family: "Inter" },
          bodyFont: { size: 14, weight: "bold", family: "Inter" },
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: () => null,
            label: (context) => `${context.parsed.y} WPM`,
          },
        },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
            drawBorder: false,
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.5)",
            font: { family: "Inter", size: 11 },
            stepSize: 10,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });
}
