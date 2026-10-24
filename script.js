document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // MOBILE NAVBAR
  // =========================
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

// ============================
// AKTIVITAS SISWA SLIDER
// ============================

const activitySlider = document.getElementById("activitySlider");
const imageA = document.getElementById("activityImageA");
const imageB = document.getElementById("activityImageB");
const prevBtn = document.getElementById("sliderPrev");
const nextBtn = document.getElementById("sliderNext");
const dotsBox = document.getElementById("sliderDots");

if (activitySlider && imageA && imageB && prevBtn && nextBtn && dotsBox) {

    const activityImages = [
        "images/aktivitas-01.jpg",
        "images/aktivitas-02.jpg",
        "images/aktivitas-03.jpg",
        "images/aktivitas-04.jpg",
        "images/aktivitas-05.jpg",
        "images/aktivitas-06.jpg",
        "images/aktivitas-07.jpg",
        "images/aktivitas-08.jpg"
    ];

    let current = 0;
    let timer = null;
    let activeImage = imageA;

    // PRELOAD SEMUA FOTO
    activityImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // BUAT DOT
    activityImages.forEach((_, index) => {

        const dot = document.createElement("button");

        dot.className =
            "slider-dot" + (index === 0 ? " active" : "");

        dot.type = "button";

        dot.setAttribute(
            "aria-label",
            `Foto ${index + 1}`
        );

        dot.addEventListener("click", () => {

            showActivity(index);
            restartActivityTimer();

        });

        dotsBox.appendChild(dot);

    });

    const dots = [
        ...dotsBox.querySelectorAll(".slider-dot")
    ];


    function showActivity(index) {

        current =
            (index + activityImages.length)
            % activityImages.length;

        const nextImage =
            activeImage === imageA
                ? imageB
                : imageA;

        nextImage.src = activityImages[current];

        nextImage.classList.add("active");
        activeImage.classList.remove("active");

        activeImage = nextImage;


        // UPDATE DOT
        dots.forEach((dot, i) => {

            dot.classList.toggle(
                "active",
                i === current
            );

        });

    }


    function next() {

        showActivity(current + 1);

    }


    function previous() {

        showActivity(current - 1);

    }


    function startActivityTimer() {

        clearInterval(timer);

        timer = setInterval(() => {

            next();

        }, 3000);

    }


    function restartActivityTimer() {

        clearInterval(timer);

        startActivityTimer();

    }


    // TOMBOL SEBELUMNYA
    prevBtn.addEventListener("click", () => {

        previous();
        restartActivityTimer();

    });


    // TOMBOL BERIKUTNYA
    nextBtn.addEventListener("click", () => {

        next();
        restartActivityTimer();

    });


    // PAUSE SAAT MOUSE DI ATAS FOTO
    activitySlider.addEventListener(
        "mouseenter",
        () => clearInterval(timer)
    );


    activitySlider.addEventListener(
        "mouseleave",
        () => startActivityTimer()
    );


    // MULAI
    showActivity(0);
    startActivityTimer();

}
  // =========================
  // TESTIMONI
  // =========================
  const testimonialGrid = document.getElementById("testimonialGrid");
  const testimonialDots = document.getElementById("testimonialDots");

  if (testimonialGrid && testimonialDots) {
    const cards = [...testimonialGrid.querySelectorAll(".testimonial-card")];
    let index = 0;

    function visibleCount() {
      return window.innerWidth <= 768 ? 1 : 3;
    }

    function maxIndex() {
      return Math.max(0, cards.length - visibleCount());
    }

    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "testimonial-dot";
      dot.type = "button";
      dot.addEventListener("click", () => {
        index = Math.min(i, maxIndex());
        updateTestimonials();
      });
      testimonialDots.appendChild(dot);
    });

    const dots = [...testimonialDots.querySelectorAll(".testimonial-dot")];

    function updateTestimonials() {
      const count = visibleCount();
      if (count === 1) {
        testimonialGrid.style.transform = `translateX(-${index * 100}%)`;
      } else {
        const step = 100 / count;
        testimonialGrid.style.transform = `translateX(-${index * step}%)`;
      }
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    }

    window.addEventListener("resize", () => {
      index = Math.min(index, maxIndex());
      updateTestimonials();
    });

    updateTestimonials();
  }
});
