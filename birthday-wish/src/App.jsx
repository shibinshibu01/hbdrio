import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import "./App.css";
import video from "./assets/video/bday.mp4";


/* =========================================
   IMPORT ALL PHOTOS AUTOMATICALLY
========================================= */

const photoModules = import.meta.glob(
  "./assets/photos/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
  {
    eager: true,
    import: "default",
  }
);

const photos = Object.entries(photoModules)
  .sort(([a], [b]) =>
    a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  )
  .map(([, image]) => image);


/* =========================================
   APP
========================================= */

function App() {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const animationStarted = useRef(false);

  const [showPhotos, setShowPhotos] = useState(false);
  const [isStarted, setIsStarted] = useState(false);


  /* =========================================
     VIDEO TIME
  ========================================= */

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;

    if (
      currentTime >= 7 &&
      !animationStarted.current
    ) {
      animationStarted.current = true;
      setShowPhotos(true);
    }
  };


  /* =========================================
     PHOTO ANIMATION
  ========================================= */

  useEffect(() => {
    if (!showPhotos || !overlayRef.current) return;

    const photoElements =
      overlayRef.current.querySelectorAll(
        ".memory-wrapper"
      );

    if (!photoElements.length) return;

    gsap.set(photoElements, {
      opacity: 0,
      scale: 0,
      x: 0,
      y: 0,
      rotation: 0,
    });

    const timeline = gsap.timeline();

    photoElements.forEach((photo, index) => {
      const x = gsap.utils.random(-48, 48);
      const y = gsap.utils.random(-48, 48);
      const rotation = gsap.utils.random(-30, 30);
      const scale = gsap.utils.random(0.65, 1);

      timeline.to(
        photo,
        {
          opacity: 1,
          scale: scale,
          x: `${x}vw`,
          y: `${y}vh`,
          rotation: rotation,
          duration: 0.5,
          ease: "back.out(1.6)",
        },
        index * 0.1
      );
    });

    return () => {
      timeline.kill();
    };
  }, [showPhotos]);


  /* =========================================
     START VIDEO
  ========================================= */

  const startExperience = async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.play();
      setIsStarted(true);
    } catch (error) {
      console.error("Video error:", error);
    }
  };


  /* =========================================
     RESTART
  ========================================= */

  const restartExperience = async () => {
    if (!videoRef.current) return;

    // Reset animation
    animationStarted.current = false;
    setShowPhotos(false);

    // Reset video
    videoRef.current.currentTime = 0;

    try {
      await videoRef.current.play();
      setIsStarted(true);
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <div className="app">

      {/* VIDEO */}

      <video
        ref={videoRef}
        className="birthday-video"
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
      >
        <source
          src={video}
          type="video/mp4"
        />

        Your browser does not support video.
      </video>


      {/* PHOTOS */}

      {showPhotos && (
        <div
          ref={overlayRef}
          className="photos-overlay"
        >
          {photos.map((photo, index) => (
            <div
              className="memory-wrapper"
              key={index}
            >
              <img
                src={photo}
                className="memory"
                alt={`Memory ${index + 1}`}
                draggable="false"
              />
            </div>
          ))}
        </div>
      )}


      {/* START SCREEN */}

      {!isStarted && (
        <div className="start-screen">

          <div className="start-content">

            <p className="start-small">
              A LITTLE SOMETHING FOR YOU
            </p>

            <button
              className="start-button"
              onClick={startExperience}
            >
              <span className="play-icon">▶</span>
              START
            </button>

          </div>

        </div>
      )}


      {/* RESTART */}

      {isStarted && (
        <button
          className="restart-button"
          onClick={restartExperience}
        >
          ↻
        </button>
      )}

    </div>
  );
}

export default App;