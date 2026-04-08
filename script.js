const weddingDateString = "2026-05-28T07:35:00+05:30";
const RSVP_FORM_ENDPOINT = "https://formspree.io/f/xqegjvyp";

function getCountdownElements() {
  return {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
  };
}

function setCountdownValues(countdownEls, values) {
  if (!countdownEls.days || !countdownEls.hours || !countdownEls.minutes || !countdownEls.seconds) {
    return;
  }

  countdownEls.days.textContent = values.days;
  countdownEls.hours.textContent = values.hours;
  countdownEls.minutes.textContent = values.minutes;
  countdownEls.seconds.textContent = values.seconds;
}

function startCountdown() {
  const countdownEls = getCountdownElements();
  const weddingTime = new Date(weddingDateString).getTime();

  if (Number.isNaN(weddingTime)) {
    setCountdownValues(countdownEls, {
      days: "---",
      hours: "--",
      minutes: "--",
      seconds: "--",
    });
    return;
  }

  function updateCountdown() {
    const distance = weddingTime - Date.now();

    if (distance <= 0) {
      setCountdownValues(countdownEls, {
        days: "000",
        hours: "00",
        minutes: "00",
        seconds: "00",
      });
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    setCountdownValues(countdownEls, {
      days: String(days).padStart(3, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    });
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

function setupRevealAnimation() {
  const revealEls = document.querySelectorAll(".reveal");

  if (!revealEls.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function setupNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!navToggle || !navLinks) {
    return;
  }

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupForm() {
  const form = document.getElementById("rsvpForm");
  const formStatus = document.getElementById("formStatus");

  if (!form || !formStatus) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      attendance: String(data.get("attendance") || "").trim(),
      submittedAt: new Date().toISOString(),
    };

    formStatus.textContent = "Submitting your RSVP...";

    fetch(RSVP_FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Formspree submission failed");
        }

        formStatus.textContent = `Thank you, ${payload.name}. Your RSVP has been saved successfully.`;
        form.reset();
      })
      .catch(() => {
        formStatus.textContent = "Could not save your RSVP right now. Please try again.";
      });
  });
}

function setupMusicPlayer() {
  const audio = document.getElementById("weddingSong");
  const toggle = document.getElementById("musicToggle");
  const source = audio ? audio.querySelector("source") : null;

  if (!audio || !toggle) {
    return;
  }

  audio.load();

  toggle.addEventListener("click", async () => {
    const hasSource = Boolean(audio.currentSrc || (source && source.getAttribute("src")));

    if (!hasSource) {
      toggle.textContent = "No Song";
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
        toggle.textContent = "Pause";
        toggle.setAttribute("aria-pressed", "true");
      } else {
        audio.pause();
        toggle.textContent = "Play";
        toggle.setAttribute("aria-pressed", "false");
      }
    } catch (error) {
      toggle.textContent = "Play";
    }
  });

  audio.addEventListener("play", () => {
    toggle.textContent = "Pause";
    toggle.setAttribute("aria-pressed", "true");
  });
  audio.addEventListener("pause", () => {
    if (!audio.ended) {
      toggle.textContent = "Play";
      toggle.setAttribute("aria-pressed", "false");
    }
  });
  audio.addEventListener("ended", () => {
    toggle.textContent = "Play";
    toggle.setAttribute("aria-pressed", "false");
  });

  window.addEventListener("load", async () => {
    try {
      await audio.play();
    } catch (error) {
      toggle.textContent = "Play";
    }
  });
}

function initPage() {
  startCountdown();
  setupRevealAnimation();
  setupNav();
  setupForm();
  setupMusicPlayer();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}
