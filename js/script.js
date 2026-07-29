/* =========================================================
   1000 STORIES — site interactions
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Header scroll state ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const hamburger = document.getElementById("hamburgerBtn");
  const navMobile = document.getElementById("navMobile");
  hamburger.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });
  navMobile.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // /* ---------- Portfolio filter ---------- */
  // const filterButtons = document.querySelectorAll(".gallery-filters button");
  // const galleryItems = document.querySelectorAll(".gallery-item");
  // filterButtons.forEach((btn) => {
  //   btn.addEventListener("click", () => {
  //     filterButtons.forEach((b) => b.classList.remove("is-active"));
  //     btn.classList.add("is-active");
  //     const filter = btn.dataset.filter;
  //     galleryItems.forEach((item) => {
  //       const match = filter === "all" || item.dataset.category === filter;
  //       item.classList.toggle("is-hidden", !match);
  //     });
  //   });
  // });

  /* ---------- Testimonial carousel ---------- */
  const slides = document.querySelectorAll(".testimonial-slide");
  const dots = document.querySelectorAll(".testimonial-dots button");
  let activeSlide = 0;
  let carouselTimer;

  function showSlide(i) {
    slides.forEach((s) => s.classList.remove("is-active"));
    dots.forEach((d) => d.classList.remove("is-active"));
    slides[i].classList.add("is-active");
    dots[i].classList.add("is-active");
    activeSlide = i;
  }

  function nextSlide() {
    showSlide((activeSlide + 1) % slides.length);
  }

  function startCarousel() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(nextSlide, 6000);
  }

  if (slides.length) {
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        showSlide(i);
        startCarousel();
      });
    });
    startCarousel();
  }

  /* ---------- FAQ accordion ---------- */
  const faqItems = document.querySelectorAll(".faq-item");
  function setFaqHeight(item) {
    const answer = item.querySelector(".faq-a");
    answer.style.maxHeight = item.classList.contains("is-open")
      ? answer.scrollHeight + "px"
      : "0px";
  }
  faqItems.forEach((item) => {
    setFaqHeight(item);
    item.querySelector(".faq-q").addEventListener("click", () => {
      const wasOpen = item.classList.contains("is-open");
      faqItems.forEach((i) => {
        i.classList.remove("is-open");
        setFaqHeight(i);
      });
      if (!wasOpen) {
        item.classList.add("is-open");
        setFaqHeight(item);
      }
    });
  });
  window.addEventListener("resize", () => {
    faqItems.forEach((item) => {
      if (item.classList.contains("is-open")) setFaqHeight(item);
    });
  });

  /* ---------- Enquiry form ----------
     No backend is wired up. Swap this handler for a real request to
     your form provider (Formspree, Basin, your own API, etc.) —
     see the comment above the <form> in index.html.
  ---------------------------------------------------------------- */
  const form = document.getElementById("enquiryForm");
  const success = document.getElementById("formSuccess");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          form.reset();
          success.classList.add("is-visible");
        } else {
          // Formspree responded, but rejected the submission.
          // Log the details so we can see WHY instead of guessing.
          const data = await response.json().catch(() => null);
          console.error(
            "Formspree rejected the submission:",
            response.status,
            data,
          );
          alert(
            "Something went wrong sending your enquiry. Please email us directly at hello@thousandmemories.studio",
          );
        }
      } catch (err) {
        // This only fires for actual network failures (no internet, etc.)
        console.error("Network error submitting form:", err);
        alert(
          "Something went wrong — please email us directly at hello@thousandmemories.studio",
        );
      }
    });
  }
});
