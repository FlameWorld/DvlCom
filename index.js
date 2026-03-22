
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("floatingMenuToggle");
  const menu = document.getElementById("floatingQuickMenu");
  const overlay = document.getElementById("floatingMenuOverlay");
  const track = document.getElementById("slidesTrack");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const menuLinks = Array.from(document.querySelectorAll(".floating-menu-link"));
  const indicators = Array.from(document.querySelectorAll(".indicator"));
  const jumpButtons = Array.from(document.querySelectorAll("[data-slide-jump]"));
  const tiktokAvatar = document.getElementById("tiktokAvatar");

  let currentSlide = 0;
  let wheelLocked = false;
  let touchStartX = 0;
  let touchStartY = 0;
  const totalSlides = slides.length || 5;

  function setMenuState(isOpen) {
    if (!menu || !menuToggle || !overlay) return;
    menu.classList.toggle("is-open", isOpen);
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menu.setAttribute("aria-hidden", isOpen ? "false" : "true");
    overlay.hidden = !isOpen;
  }

  function closeMenu() {
    setMenuState(false);
  }

  function updateUi() {
    if (track) {
      track.style.transform = "translateX(-" + (currentSlide * 20) + "%)";
    }

    menuLinks.forEach((link, i) => {
      link.classList.toggle("is-active", i === currentSlide);
    });

    indicators.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentSlide);
    });

    if (slides[currentSlide]) {
      slides[currentSlide].scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(totalSlides - 1, index));
    updateUi();
    closeMenu();
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setMenuState(!menu.classList.contains("is-open"));
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  document.addEventListener("click", function (e) {
    if (!menu || !menuToggle) return;
    const clickedInsideMenu = menu.contains(e.target);
    const clickedToggle = menuToggle.contains(e.target);
    if (!clickedInsideMenu && !clickedToggle && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
    if (event.key === "ArrowRight" || event.key === "PageDown") nextSlide();
    if (event.key === "ArrowLeft" || event.key === "PageUp") prevSlide();
  });

  menuLinks.forEach((link, index) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = Number(link.dataset.slide ?? index);
      goToSlide(target);
    });
  });

  indicators.forEach((dot, index) => {
    dot.addEventListener("click", function () {
      const target = Number(dot.dataset.slide ?? index);
      goToSlide(target);
    });
  });

  jumpButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      goToSlide(Number(btn.dataset.slideJump || 0));
    });
  });

  window.addEventListener("wheel", function (event) {
    event.preventDefault();
    if (wheelLocked) return;
    wheelLocked = true;

    if (event.deltaY > 0) nextSlide();
    else if (event.deltaY < 0) prevSlide();

    setTimeout(function () {
      wheelLocked = false;
    }, 650);
  }, { passive: false });

  window.addEventListener("touchstart", function (event) {
    if (!event.touches.length) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", function (event) {
    if (!event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });

  window.addEventListener("resize", updateUi);

  async function loadDiscordInviteCard(inviteCode, nameId, countId, iconId) {
    const nameEl = document.getElementById(nameId);
    const countEl = document.getElementById(countId);
    const iconEl = document.getElementById(iconId);

    try {
      const res = await fetch("https://discord.com/api/v9/invites/" + inviteCode + "?with_counts=true");
      if (!res.ok) throw new Error("Invite fetch failed");
      const data = await res.json();

      if (nameEl && data.guild && data.guild.name) {
        nameEl.textContent = data.guild.name;
      }

      if (countEl) {
        const online = typeof data.approximate_presence_count === "number" ? data.approximate_presence_count : null;
        const total = typeof data.approximate_member_count === "number" ? data.approximate_member_count : null;
        if (online !== null && total !== null) {
          countEl.textContent = online + " online • " + total + " members";
        } else if (total !== null) {
          countEl.textContent = total + " members";
        } else {
          countEl.textContent = "Discord server";
        }
      }

      if (iconEl && data.guild && data.guild.id && data.guild.icon) {
        iconEl.src = "https://cdn.discordapp.com/icons/" + data.guild.id + "/" + data.guild.icon + ".png?size=256";
      }
    } catch (e) {
      if (countEl) countEl.textContent = "Server unavailable";
    }
  }

  loadDiscordInviteCard("U3dPecbffQ", "communityName1", "communityCount1", "communityIcon1");
  loadDiscordInviteCard("JGmMJrDHN6", "communityName2", "communityCount2", "communityIcon2");
  loadDiscordInviteCard("9aX5u5h8fJ", "partnerName1", "partnerCount1", "partnerIcon1");
  loadDiscordInviteCard("tCVKMrnAR6", "partnerName2", "partnerCount2", "partnerIcon2");
  loadDiscordInviteCard("FHGkct9MPX", "partnerName3", "partnerCount3", "partnerIcon3");
  loadDiscordInviteCard("c625tqaAbc", "partnerName4", "partnerCount4", "partnerIcon4");
  loadDiscordInviteCard("zwBEe3Tvma", "partnerName5", "partnerCount5", "partnerIcon5");

  if (tiktokAvatar) {
    tiktokAvatar.addEventListener("error", function () {
      tiktokAvatar.src = "DvlProfile.png";
    });
  }

  updateUi();
});
