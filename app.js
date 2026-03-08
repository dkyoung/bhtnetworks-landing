"use strict";

const CONFIG = {
  businessEmail: "domingo@bhtnetworks.com",
  mailSubject: "BHT Networks - Commercial Site Survey Request",
};

const $ = (sel, parent = document) => parent.querySelector(sel);

function setYear() {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

function setupMobileMenu() {
  const btn = $("#menuBtn");
  const nav = $("#mobileNav");
  if (!btn || !nav) return;

  const closeMenu = () => {
    nav.classList.remove("isOpen");
    nav.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    nav.classList.add("isOpen");
    nav.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
  };

  btn.addEventListener("click", () => {
    const isOpen = nav.classList.contains("isOpen");
    if (isOpen) closeMenu();
    else openMenu();
  });

  nav.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.matches("a")) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function setupCopyEmail() {
  const emailText = $("#contactEmailText");
  if (emailText) emailText.textContent = CONFIG.businessEmail;

  const bindCopy = (btnId) => {
    const btn = $(btnId);
    if (!btn) return;

    btn.addEventListener("click", async () => {
      const ok = await copyToClipboard(CONFIG.businessEmail);
      const original = btn.textContent;
      btn.textContent = ok ? "Copied" : "Copy failed";
      setTimeout(() => (btn.textContent = original), 1200);
    });
  };

  bindCopy("#copyEmailBtn");
  bindCopy("#copyEmailBtn2");
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function setupContactForm() {
  const form = $("#contactForm");
  const note = $("#formNote");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (note) note.textContent = "";

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const location = String(data.get("location") || "").trim();
    const message = String(data.get("message") || "").trim();

    const errors = [];
    if (name.length < 2) errors.push("Please enter your name.");
    if (!validEmail(email)) errors.push("Please enter a valid email address.");
    if (location.length < 2) errors.push("Please provide your business or location.");
    if (message.length < 5) errors.push("Please provide a short message about your site.");

    if (errors.length) {
      if (note) note.textContent = errors.join(" ");
      return;
    }

    data.append("_subject", CONFIG.mailSubject);

    if (note) note.textContent = "Sending request...";

    try {
      const endpoint = form.getAttribute("action");
      if (!endpoint || !endpoint.startsWith("https://formspree.io/")) {
        if (note) note.textContent = "Form service is not configured correctly.";
        return;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        if (note) {
          note.textContent =
            "Thank you. Your request was submitted successfully. Our team will follow up within 1–2 business days.";
        }
        form.reset();
        return;
      }

      let errMsg = "We could not submit your request right now. Please try again shortly.";
      try {
        const json = await res.json();
        if (json && json.errors && json.errors.length) {
          errMsg = json.errors.map((x) => x.message).join(" ");
        }
      } catch {}

      if (note) note.textContent = errMsg;
    } catch {
      if (note) {
        note.textContent = "Network error. Please try again or email domingo@bhtnetworks.com.";
      }
    }
  });
}

function setupBackToTop() {
  const backToTopLink = $(".footer__link[href='#top']");
  if (!backToTopLink) return;

  backToTopLink.addEventListener("click", (e) => {
    e.preventDefault();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
}

function init() {
  setYear();
  setupMobileMenu();
  setupCopyEmail();
  setupContactForm();
  setupBackToTop();
}

document.addEventListener("DOMContentLoaded", init);
