"use client";
import React, { useEffect } from "react";
import "./Features.css";
import { FaStethoscope, FaUserMd, FaClipboardCheck } from "react-icons/fa";

const Features = () => {
  useEffect(() => {
    const handleScrollAnimation = () => {
      const elements = document.querySelectorAll(".scroll-animation");
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        if (isVisible) {
          element.classList.add("visible");
        } else {
          element.classList.remove("visible");
        }
      });
    };

    window.addEventListener("scroll", handleScrollAnimation);
    handleScrollAnimation(); // Trigger on mount to handle initial state

    return () => window.removeEventListener("scroll", handleScrollAnimation);
  }, []);

  return (
    <section className="features scroll-animation">
      <h2>Our Services</h2>
      <div className="features-container">
        <div className="feature scroll-animation">
          <FaStethoscope className="feature-icon" />
          <h3>Comprehensive Check-ups</h3>
          <p>
            We offer thorough medical check-ups to ensure your health is in top
            condition.
          </p>
        </div>
        <div className="feature scroll-animation">
          <FaUserMd className="feature-icon" />
          <h3>Expert Consultations</h3>
          <p>
            Our specialists provide detailed consultations to address all your
            health concerns.
          </p>
        </div>
        <div className="feature scroll-animation">
          <FaClipboardCheck className="feature-icon" />
          <h3>Personalized Treatment Plans</h3>
          <p>
            We create customized treatment plans tailored to your individual
            needs.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
