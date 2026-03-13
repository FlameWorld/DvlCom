    function scrollToSection(id) {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }

    if (window.particlesJS) {
      particlesJS("particles-js", {
        particles: {
          number: {
            value: 110,
            density: { enable: true, value_area: 1100 }
          },
          color: {
            value: ["#00eaff", "#ff2bd6", "#8d42ff", "#7dffea"]
          },
          shape: { type: ["circle", "triangle"] },
          opacity: {
            value: 0.45,
            random: true
          },
          size: {
            value: 3.4,
            random: true
          },
          line_linked: {
            enable: true,
            distance: 130,
            color: "#6f5dff",
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 2.1,
            random: true,
            out_mode: "out"
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
            resize: true
          },
          modes: {
            repulse: {
              distance: 80,
              duration: 0.35
            },
            push: {
              particles_nb: 4
            }
          }
        },
        retina_detect: true
      });
    }

    function extractDiscordInviteCode(url) {
      try {
        var parsed = new URL(url);
        var host = parsed.hostname.replace(/^www\./, "");
        if (host === "discord.gg") {
          return parsed.pathname.split("/").filter(Boolean)[0] || "";
        }
        if (host === "discord.com" || host === "discordapp.com") {
          var parts = parsed.pathname.split("/").filter(Boolean);
          var inviteIndex = parts.indexOf("invite");
          if (inviteIndex !== -1 && parts[inviteIndex + 1]) {
            return parts[inviteIndex + 1];
          }
        }
      } catch (error) {
        return "";
      }
      return "";
    }

    function formatMemberCount(count) {
      return new Intl.NumberFormat().format(count) + " Members";
    }

    async function hydratePartnerCard(card) {
      var joinLink = card.querySelector(".partner-join-btn");
      if (!joinLink || !joinLink.href) {
        return;
      }

      var inviteCode = extractDiscordInviteCode(joinLink.href);
      if (!inviteCode) {
        return;
      }

      try {
        var response = await fetch(
          "https://discord.com/api/v10/invites/" +
            encodeURIComponent(inviteCode) +
            "?with_counts=true"
        );
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

        if (
          typeof invite.approximate_member_count === "number" &&
          countEl
        ) {
          countEl.textContent = formatMemberCount(
            invite.approximate_member_count
          );
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
      } catch (error) {
        // Keep default static values if API call fails.
      }
    }

    document.addEventListener("DOMContentLoaded", function () {
      var partnerCards = Array.from(
        document.querySelectorAll(".partner-invite-card, .community-discord-card")
      );

      function refreshPartnerCards() {
        partnerCards.forEach(function (card) {
          hydratePartnerCard(card);
        });
      }

      refreshPartnerCards();
      // Re-sync counts/icons periodically so joins are reflected while viewing.
      setInterval(refreshPartnerCards, 60000);
    });
