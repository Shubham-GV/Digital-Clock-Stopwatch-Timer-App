"use strict";

const $ = (id) => document.getElementById(id);
const pad = (n, l = 2) => String(n).padStart(l, "0");

/* ============ 3D tilt on the glass card ============ */
const card = $("card");
window.addEventListener("pointermove", (e) => {
  const x = e.clientX / window.innerWidth - 0.5;
  const y = e.clientY / window.innerHeight - 0.5;
  card.style.setProperty("--ry", `${x * 14}deg`);
  card.style.setProperty("--rx", `${-y * 14}deg`);
});
window.addEventListener("pointerleave", () => {
  card.style.setProperty("--ry", "0deg");
  card.style.setProperty("--rx", "0deg");
});

/* ============ Tabs ============ */
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
const indicator = $("indicator");

function moveIndicator(btn) {
  indicator.style.left = btn.offsetLeft + "px";
  indicator.style.width = btn.offsetWidth + "px";
}
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.toggle("active", t === btn));
    panels.forEach((p) => p.classList.toggle("active", p.id === btn.dataset.tab));
    moveIndicator(btn);
  });
});
window.addEventListener("resize", () => moveIndicator(document.querySelector(".tab.active")));
moveIndicator(document.querySelector(".tab.active"));

/* ============ Clock ============ */
function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  $("clockTime").textContent = `${pad(h)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  $("clockAmPm").textContent = ampm;
  $("clockDate").textContent = now.toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
updateClock();
setInterval(updateClock, 250);

/* ============ Beep (Web Audio) ============ */
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
  } catch (e) { /* audio not available */ }
}

/* ============ Timer ============ */
const CIRC = 2 * Math.PI * 88; // matches r=88 in the SVG
const ringBar = $("ringBar");
ringBar.style.strokeDasharray = CIRC;

const tInputs = $("timerInputs");
const tDisplay = $("timerDisplay");
const tLabel = $("timerLabel");
const tStart = $("timerStart");

let timerTotal = 0;      // ms
let timerRemaining = 0;  // ms
let timerEnd = 0;
let timerId = null;
let timerState = "idle"; // idle | running | paused

function fmtHMS(ms) {
  const s = Math.ceil(ms / 1000);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

function readInputs() {
  const clamp = (v, max) => Math.min(max, Math.max(0, parseInt(v, 10) || 0));
  const h = clamp($("tH").value, 99);
  const m = clamp($("tM").value, 59);
  const s = clamp($("tS").value, 59);
  $("tH").value = h; $("tM").value = m; $("tS").value = s;
  return (h * 3600 + m * 60 + s) * 1000;
}

function showRunningView(on) {
  tInputs.classList.toggle("hidden", on);
  tDisplay.classList.toggle("hidden", !on);
}

function tickTimer() {
  timerRemaining = timerEnd - Date.now();
  if (timerRemaining <= 0) {
    clearInterval(timerId);
    timerRemaining = 0;
    timerState = "idle";
    tDisplay.textContent = "00:00:00";
    ringBar.style.strokeDashoffset = CIRC;
    tLabel.textContent = "Time's up!";
    tStart.textContent = "Start";
    tStart.classList.remove("running");
    beep();
    return;
  }
  tDisplay.textContent = fmtHMS(timerRemaining);
  ringBar.style.strokeDashoffset = CIRC * (1 - timerRemaining / timerTotal);
}

tStart.addEventListener("click", () => {
  if (timerState === "idle") {
    timerTotal = readInputs();
    if (timerTotal <= 0) { tLabel.textContent = "Enter a time first"; return; }
    timerRemaining = timerTotal;
  }
  if (timerState === "running") {
    clearInterval(timerId);
    timerState = "paused";
    tStart.textContent = "Resume";
    tStart.classList.remove("running");
    tLabel.textContent = "Paused";
    return;
  }
  timerEnd = Date.now() + timerRemaining;
  timerState = "running";
  showRunningView(true);
  tStart.textContent = "Pause";
  tStart.classList.add("running");
  tLabel.textContent = "Remaining";
  tickTimer();
  timerId = setInterval(tickTimer, 100);
});

$("timerReset").addEventListener("click", () => {
  clearInterval(timerId);
  timerState = "idle";
  showRunningView(false);
  ringBar.style.strokeDashoffset = 0;
  tStart.textContent = "Start";
  tStart.classList.remove("running");
  tLabel.textContent = "Set time";
});

/* ============ Stopwatch ============ */
const swDisplay = $("swDisplay");
const swStart = $("swStart");
const swLap = $("swLap");
const lapsEl = $("laps");

let swRunning = false;
let swStartTime = 0;
let swElapsed = 0;
let swRaf = null;
let lastLap = 0;
let lapCount = 0;

function fmtSW(ms) {
  const cs = Math.floor(ms / 10) % 100;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000);
  return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function swTick() {
  const total = swElapsed + (performance.now() - swStartTime);
  swDisplay.textContent = fmtSW(total);
  swRaf = requestAnimationFrame(swTick);
}

swStart.addEventListener("click", () => {
  if (!swRunning) {
    swStartTime = performance.now();
    swRunning = true;
    swRaf = requestAnimationFrame(swTick);
    swStart.textContent = "Stop";
    swStart.classList.add("running");
    swLap.disabled = false;
  } else {
    swElapsed += performance.now() - swStartTime;
    cancelAnimationFrame(swRaf);
    swRunning = false;
    swDisplay.textContent = fmtSW(swElapsed);
    swStart.textContent = "Start";
    swStart.classList.remove("running");
    swLap.disabled = true;
  }
});

swLap.addEventListener("click", () => {
  if (!swRunning) return;
  const total = swElapsed + (performance.now() - swStartTime);
  lapCount++;
  const li = document.createElement("li");
  li.innerHTML = `<span>Lap ${lapCount}</span><span>+${fmtSW(total - lastLap)}</span><span>${fmtSW(total)}</span>`;
  lapsEl.prepend(li);
  lastLap = total;
});

$("swReset").addEventListener("click", () => {
  cancelAnimationFrame(swRaf);
  swRunning = false;
  swElapsed = 0;
  lastLap = 0;
  lapCount = 0;
  swDisplay.textContent = "00:00.00";
  lapsEl.innerHTML = "";
  swStart.textContent = "Start";
  swStart.classList.remove("running");
  swLap.disabled = true;
});
