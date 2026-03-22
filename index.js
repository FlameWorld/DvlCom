var slideIds = ["home", "team", "community", "partnership", "tiktok"];
var activeSlideIndex = 0;
var isAnimatingSlide = false;
var prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function padSlideNumber(number) {
  return String(number).padStart(2, "0");
}

function isMenuPersistent() {
  return false;
}

function syncSlideUi() {
  var slides = document.querySelectorAll(".slide");
  var menuItems = document.querySelectorAll(".menu-item");
  var currentLabel = document.querySelector(".slide-indicator-current");
  var totalLabel = document.querySelector(".slide-indicator-total");

  slides.forEach(function (slide, index) {
    var state = "after";
    if (index < activeSlideIndex) {
      state = "before";
    }
    if (index === activeSlideIndex) {
      state = "active";
    }
    slide.setAttribute("data-state", state);
    slide.classList.toggle("is-active", index === activeSlideIndex);
  });

  menuItems.forEach(function (item) {
    var isActive = item.getAttribute("data-target") === slideIds[activeSlideIndex];
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-current", isActive ? "page" : "false");
  });

  if (currentLabel) {
    currentLabel.textContent = padSlideNumber(activeSlideIndex + 1);
  }

  if (totalLabel) {
    totalLabel.textContent = padSlideNumber(slideIds.length);
  }

  var currentId = slideIds[activeSlideIndex];
  if (currentId) {
    try {
      window.history.replaceState(null, "", "#" + currentId);
    } catch (error) {
      window.location.hash = currentId;
    }
  }

  var activeContent = document.querySelector(".slide.is-active .slide-content");
  if (activeContent) {
    activeContent.scrollTop = 0;
  }
}

function closeMenu() {
  var menu = document.getElementById("slideMenu");
  var toggle = document.getElementById("menuToggle");
  var backdrop = document.getElementById("menuBackdrop");

  if (menu) {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
  }

  if (toggle) {
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (backdrop) {
    backdrop.classList.remove("is-visible");
    backdrop.hidden = true;
  }

  document.body.classList.remove("menu-open");
}

function openMenu() {
  var menu = document.getElementById("slideMenu");
  var toggle = document.getElementById("menuToggle");
  var backdrop = document.getElementById("menuBackdrop");

  if (menu) {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
  }

  if (toggle) {
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  if (backdrop) {
    backdrop.hidden = false;
    backdrop.classList.add("is-visible");
  }

  document.body.classList.add("menu-open");
}

function toggleMenu() {
  var menu = document.getElementById("slideMenu");
  if (!menu || isMenuPersistent()) {
    return;
  }

  if (menu.classList.contains("is-open")) {
    closeMenu();
    return;
  }

  openMenu();
}

function goToSlide(target) {
  var targetIndex =
    typeof target === "number" ? target : slideIds.indexOf(String(target));

  if (
    targetIndex < 0 ||
    targetIndex >= slideIds.length ||
    targetIndex === activeSlideIndex ||
    isAnimatingSlide
  ) {
    return;
  }

  isAnimatingSlide = true;
  activeSlideIndex = targetIndex;
  syncSlideUi();
  closeMenu();

  window.setTimeout(function () {
    isAnimatingSlide = false;
  }, 540);
}

function moveSlide(direction) {
  var nextIndex = activeSlideIndex + direction;
  if (nextIndex < 0 || nextIndex >= slideIds.length) {
    return;
  }
  goToSlide(nextIndex);
}

function scrollToSection(id) {
  goToSlide(id);
}

function initTouchNavigation() {
  var shell = document.getElementById("slidesShell");
  var touchStartX = 0;
  var touchStartY = 0;
  var tracking = false;

  if (!shell) {
    return;
  }

  shell.addEventListener(
    "touchstart",
    function (event) {
      if (!event.touches || event.touches.length !== 1) {
        tracking = false;
        return;
      }

      var target = event.target;
      if (
        target.closest("a, button") ||
        target.closest("#slideMenu")
      ) {
        tracking = false;
        return;
      }

      tracking = true;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  shell.addEventListener(
    "touchend",
    function (event) {
      if (!tracking || !event.changedTouches || event.changedTouches.length !== 1) {
        tracking = false;
        return;
      }

      var deltaX = event.changedTouches[0].clientX - touchStartX;
      var deltaY = event.changedTouches[0].clientY - touchStartY;

      tracking = false;

      if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY) * 1.3) {
        return;
      }

      if (deltaX < 0) {
        moveSlide(1);
        return;
      }

      moveSlide(-1);
    },
    { passive: true }
  );
}

function optimizeForPerformance() {
  var isMobile =
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  var isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

  if (isMobile || isLowEnd) {
    document.body.classList.add("performance-mode");
  }

  if (prefersReducedMotion) {
    document.body.classList.add("reduced-motion");
  }
}

optimizeForPerformance();

function initBackgroundParticles() {
  var canvas = document.getElementById("bgParticles");
  if (!canvas || prefersReducedMotion) {
    if (canvas) {
      canvas.style.display = "none";
    }
    return;
  }

  var context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  var particles = [];
  var streaks = [];
  var density = document.body.classList.contains("performance-mode") ? 30 : 56;
  var streakDensity = document.body.classList.contains("performance-mode") ? 8 : 14;
  var width = 0;
  var height = 0;
  var pixelRatio = 1;
  var animationFrameId = 0;
  var resizeTimer = 0;
  var isRunning = true;
  var frameInterval = document.body.classList.contains("performance-mode") ? 1000 / 26 : 1000 / 36;
  var lastFrameTime = 0;
  var colors = [
    "102, 247, 255",
    "255, 78, 164",
    "156, 123, 255",
    "255, 255, 255"
  ];

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    buildParticles();
  }

  function buildParticles() {
    particles = [];
    streaks = [];

    for (var i = 0; i < density; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.4 + Math.random() * 3.8,
        vx: -0.12 + Math.random() * 0.24,
        vy: -0.26 - Math.random() * 0.34,
        alpha: 0.18 + Math.random() * 0.35,
        color: colors[i % colors.length]
      });
    }

    for (var j = 0; j < streakDensity; j += 1) {
      streaks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        len: 40 + Math.random() * 120,
        speed: 1 + Math.random() * 1.5,
        alpha: 0.05 + Math.random() * 0.12
      });
    }
  }

  function drawParticle(particle) {
    context.beginPath();
    context.fillStyle = "rgba(" + particle.color + ", " + particle.alpha + ")";
    context.shadowBlur = 18;
    context.shadowColor = "rgba(" + particle.color + ", 0.45)";
    context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    context.fill();
  }

  function drawStreak(streak, index) {
    var gradient = context.createLinearGradient(
      streak.x,
      streak.y,
      streak.x,
      streak.y + streak.len
    );
    var accent = index % 2 === 0 ? "103, 235, 255" : "255, 76, 164";
    gradient.addColorStop(0, "rgba(" + accent + ", 0)");
    gradient.addColorStop(0.5, "rgba(" + accent + ", " + streak.alpha + ")");
    gradient.addColorStop(1, "rgba(" + accent + ", 0)");

    context.beginPath();
    context.strokeStyle = gradient;
    context.lineWidth = 1.8;
    context.shadowBlur = 12;
    context.shadowColor = "rgba(" + accent + ", 0.22)";
    context.moveTo(streak.x, streak.y);
    context.lineTo(streak.x + 10, streak.y + streak.len);
    context.stroke();
  }

  function tick() {
    if (!isRunning) {
      return;
    }

    var now = window.performance && window.performance.now
      ? window.performance.now()
      : Date.now();

    if (now - lastFrameTime < frameInterval) {
      animationFrameId = window.requestAnimationFrame(tick);
      return;
    }

    lastFrameTime = now;

    context.clearRect(0, 0, width, height);

    particles.forEach(function (particle) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.y < -12) {
        particle.y = height + 12;
        particle.x = Math.random() * width;
      }
      if (particle.x < -12) {
        particle.x = width + 12;
      }
      if (particle.x > width + 12) {
        particle.x = -12;
      }

      drawParticle(particle);
    });

    streaks.forEach(function (streak, index) {
      streak.y += streak.speed;
      if (streak.y > height + streak.len) {
        streak.y = -streak.len;
        streak.x = Math.random() * width;
      }
      drawStreak(streak, index);
    });

    context.shadowBlur = 0;
    animationFrameId = window.requestAnimationFrame(tick);
  }

  resizeCanvas();
  tick();

  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeCanvas, 120);
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      isRunning = false;
      window.cancelAnimationFrame(animationFrameId);
      return;
    }

    if (!isRunning) {
      isRunning = true;
      tick();
    }
  });
  window.addEventListener("beforeunload", function () {
    isRunning = false;
    window.cancelAnimationFrame(animationFrameId);
  });
}

function extractDiscordInviteCode(url) {
  if (typeof url !== "string" || !url) {
    return "";
  }

  var directMatch = url.match(/discord\.gg\/([A-Za-z0-9-]+)/i);
  if (directMatch && directMatch[1]) {
    return directMatch[1];
  }

  var inviteMatch = url.match(/discord(?:app)?\.com\/invite\/([A-Za-z0-9-]+)/i);
  return inviteMatch && inviteMatch[1] ? inviteMatch[1] : "";
}

function initScrollPerformanceMode() {
  var slideContents = Array.from(document.querySelectorAll(".slide-content"));
  var clearTimer = 0;

  function markScrolling() {
    document.body.classList.add("is-scrolling");
    window.clearTimeout(clearTimer);
    clearTimer = window.setTimeout(function () {
      document.body.classList.remove("is-scrolling");
    }, 140);
  }

  slideContents.forEach(function (content) {
    content.addEventListener("scroll", markScrolling, { passive: true });
  });
}

function formatMemberCount(count) {
  return new Intl.NumberFormat().format(count) + " Members";
}

async function hydratePartnerCard(card) {
  if (
    !card ||
    card.dataset.loading === "true" ||
    card.dataset.inviteHydrated === "true" ||
    window.location.protocol === "file:" ||
    !navigator.onLine
  ) {
    return;
  }

  var joinLink = card.querySelector(".partner-join-btn");
  if (!joinLink || !joinLink.href) {
    return;
  }

  var inviteCode = extractDiscordInviteCode(joinLink.href);
  if (!inviteCode) {
    return;
  }

  card.dataset.loading = "true";

  try {
    var controller =
      typeof AbortController === "function" ? new AbortController() : null;
    var timeoutId = controller
      ? window.setTimeout(function () {
          controller.abort();
        }, 5000)
      : 0;
    var response = await fetch(
      "https://discord.com/api/v10/invites/" +
        encodeURIComponent(inviteCode) +
        "?with_counts=true",
      controller ? { signal: controller.signal, cache: "no-store" } : undefined
    );
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    if (!response.ok) {
      return;
    }

    var invite = await response.json();
    var guild = invite.guild || {};
    var nameEl = card.querySelector(".partner-invite-name");
    var countEl = card.querySelector(".partner-member-count");
    var iconEl = card.querySelector(".partner-invite-icon img");

    if (guild.name && nameEl) {
      nameEl.textContent = guild.name;
    }

    if (typeof invite.approximate_member_count === "number" && countEl) {
      countEl.textContent = formatMemberCount(invite.approximate_member_count);
    }

    if (guild.id && guild.icon && iconEl) {
      var ext = guild.icon.indexOf("a_") === 0 ? "gif" : "png";
      iconEl.src =
        "https://cdn.discordapp.com/icons/" +
        guild.id +
        "/" +
        guild.icon +
        "." +
        ext +
          "?size=256";
      iconEl.alt = (guild.name || "Discord Server") + " icon";
    }

    card.dataset.inviteHydrated = "true";
  } catch (error) {
    // Keep default static values if API call fails.
  } finally {
    card.dataset.loading = "false";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var menuItems = Array.from(document.querySelectorAll(".menu-item"));
  var menuToggle = document.getElementById("menuToggle");
  var menuBackdrop = document.getElementById("menuBackdrop");
  var partnerCards = Array.from(
    document.querySelectorAll(".partner-invite-card, .community-discord-card")
  );
  var hash = window.location.hash.replace("#", "");
  var hashIndex = slideIds.indexOf(hash);

  if (hashIndex >= 0) {
    activeSlideIndex = hashIndex;
  }

  syncSlideUi();
  initBackgroundParticles();
  initScrollPerformanceMode();
  initTouchNavigation();
  closeMenu();

  menuItems.forEach(function (item) {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      goToSlide(item.getAttribute("data-target"));
    });
  });

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  if (menuBackdrop) {
    menuBackdrop.addEventListener("click", closeMenu);
  }

  document.addEventListener("click", function (event) {
    var menu = document.getElementById("slideMenu");
    if (!menu || !menuToggle || isMenuPersistent()) {
      return;
    }

    if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      moveSlide(1);
    }

    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      moveSlide(-1);
    }

    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("hashchange", function () {
    var nextHash = window.location.hash.replace("#", "");
    var nextIndex = slideIds.indexOf(nextHash);

    if (nextIndex >= 0 && nextIndex !== activeSlideIndex) {
      activeSlideIndex = nextIndex;
      syncSlideUi();
      closeMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1024) {
      closeMenu();
    }
  });

  function refreshPartnerCards() {
    partnerCards.forEach(function (card) {
      hydratePartnerCard(card);
    });
  }

  refreshPartnerCards();
  if (window.location.protocol !== "file:") {
    setInterval(function () {
      if (!document.hidden && navigator.onLine) {
        refreshPartnerCards();
      }
    }, 300000);
  }
});
