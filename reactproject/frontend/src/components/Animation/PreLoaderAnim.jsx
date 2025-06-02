import { gsap } from "gsap";

export const preLoaderAnim = () => {
  // Animate the logo fade in and scaling
  gsap.fromTo(
    ".preloader img",
    { opacity: 0, scale: 0 },
    { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
  );

  // Animate the text fading in sequentially
  gsap.fromTo(
    ".text-container span",
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.3, // Stagger effect for each span
      ease: "power2.out",
      delay: 1, // Delay after the logo animation
    }
  );

  // Hide preloader after animation completes
  gsap.to(".preloader", {
    opacity: 0,
    duration: 1,
    delay: 3, // Wait until text animations complete
    onComplete: () => {
      document.querySelector(".preloader").style.display = "none";
    },
  });
};
