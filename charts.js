/**
 * VIREXA FINANCE — Canvas & SVG Financial Visualizations
 * Zero-dependency, GPU-friendly, high-performance financial charts
 */

(function () {
  'use strict';

  // --- Financial Dashboard Spline Chart ---
  const chartCanvas = document.getElementById('dashboardSplineChart');
  const timeframeButtons = document.querySelectorAll('.timeframe-btn');

  // Chart datasets for different time horizons
  const chartData = {
    '1W': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      income: [1200, 1800, 950, 2400, 3100, 1400, 1630],
      spending: [600, 850, 1200, 700, 1400, 980, 1112]
    },
    '1M': {
      labels: ['W1', 'W2', 'W3', 'W4'],
      income: [3200, 4100, 2800, 4380],
      spending: [1800, 1600, 2100, 1342]
    },
    '6M': {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      income: [11200, 10800, 13500, 12100, 14900, 16400],
      spending: [5800, 6200, 5900, 6800, 7100, 6842]
    },
    '1Y': {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      income: [34000, 38500, 42100, 48200],
      spending: [18200, 19400, 20800, 21500]
    }
  };

  let activeTimeframe = '6M';
  let ctx = null;
  let animProgress = 0;
  let chartAnimId = null;

  function initDashboardChart() {
    if (!chartCanvas) return;
    ctx = chartCanvas.getContext('2d');
    resizeCanvas();
    animateChartDraw();

    window.addEventListener('resize', () => {
      resizeCanvas();
      drawChart(1);
    });

    window.addEventListener('themeChanged', () => {
      drawChart(1);
    });

    timeframeButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        timeframeButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeTimeframe = this.getAttribute('data-timeframe') || '6M';
        animateChartDraw();
      });
    });
  }

  function resizeCanvas() {
    if (!chartCanvas) return;
    const parent = chartCanvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    chartCanvas.width = parent.clientWidth * dpr;
    chartCanvas.height = parent.clientHeight * dpr;
    ctx.scale(dpr, dpr);
  }

  function animateChartDraw() {
    if (chartAnimId) cancelAnimationFrame(chartAnimId);
    let start = null;
    const duration = 650;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      drawChart(eased);

      if (progress < 1) {
        chartAnimId = requestAnimationFrame(step);
      }
    }
    chartAnimId = requestAnimationFrame(step);
  }

  function drawChart(progress) {
    if (!ctx || !chartCanvas) return;
    const width = chartCanvas.parentElement.clientWidth;
    const height = chartCanvas.parentElement.clientHeight;
    ctx.clearRect(0, 0, width, height);

    const data = chartData[activeTimeframe];
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    const paddingBottom = 35;
    const paddingTop = 25;
    const paddingLeft = 40;
    const paddingRight = 20;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    // Determine max value for scaling
    const maxVal = Math.max(...data.income, ...data.spending) * 1.15;

    // Draw horizontal grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';

    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = paddingTop + (plotHeight / gridSteps) * i;
      const val = Math.round(maxVal - (maxVal / gridSteps) * i);

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      ctx.fillText(`$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`, paddingLeft - 8, y + 4);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    const pointSpacing = plotWidth / (data.labels.length - 1);
    data.labels.forEach((label, idx) => {
      const x = paddingLeft + idx * pointSpacing;
      ctx.fillText(label, x, height - 10);
    });

    // Helper to calculate coordinates
    function getCoords(values) {
      return values.map((val, idx) => {
        const x = paddingLeft + idx * pointSpacing;
        const currentVal = val * progress;
        const y = paddingTop + plotHeight - (currentVal / maxVal) * plotHeight;
        return { x, y };
      });
    }

    // Draw Smooth Spline Curves
    function drawSpline(points, strokeColor, fillColor, gradientStop) {
      if (points.length === 0) return;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }

      // Line style
      ctx.lineWidth = 3;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();

      // Fill area under curve
      ctx.lineTo(points[points.length - 1].x, paddingTop + plotHeight);
      ctx.lineTo(points[0].x, paddingTop + plotHeight);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + plotHeight);
      grad.addColorStop(0, gradientStop);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Point circles
      points.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
        ctx.strokeStyle = isDark ? '#080f24' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    const incomeCoords = getCoords(data.income);
    const spendingCoords = getCoords(data.spending);

    // Draw Spending curve first (cyan/teal)
    drawSpline(spendingCoords, '#06b6d4', 'rgba(6, 182, 212, 0.25)', 'rgba(6, 182, 212, 0.3)');

    // Draw Income curve on top (electric blue)
    drawSpline(incomeCoords, '#3b82f6', 'rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.35)');
  }

  // Initialize on load
  document.addEventListener('DOMContentLoaded', initDashboardChart);
})();
