import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

import "./App.css";
import video from "./assets/video/bday.mp4";

gsap.registerPlugin(Draggable);

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
   CENTERED GALLERY POSITIONS

   These are relative positions around
   the CENTER of the screen.
========================================= */

const positions = [
  { x: -0.9, y: -1.0, rotation: -10, scale: 0.85 },
  { x: 0, y: -1.25, rotation: 3, scale: 1 },
  { x: 0.9, y: -1.0, rotation: 10, scale: 0.85 },

  { x: -1.15, y: 0, rotation: -7, scale: 1 },
  { x: 1.15, y: 0, rotation: 7, scale: 1 },

  { x: -0.9, y: 1.0, rotation: 8, scale: 0.85 },
  { x: 0, y: 1.25, rotation: -3, scale: 1 },
  { x: 0.9, y: 1.0, rotation: -8, scale: 0.85 },
];


function App() {

  const videoRef = useRef(null);
  const galleryRef = useRef(null);

  const animationStarted = useRef(false);
  const timelineRef = useRef(null);

  const [isStarted, setIsStarted] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);


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
      setShowGallery(true);

    }

  };


  /* =========================================
     PHOTO GALLERY ANIMATION
  ========================================= */

  useEffect(() => {

    if (!showGallery) return;
    if (!galleryRef.current) return;


    const cards =
      galleryRef.current.querySelectorAll(".photo-card");


    if (!cards.length) return;


    const ctx = gsap.context(() => {


      /* =====================================
         RESPONSIVE RADIUS

         Controls how far photos move
         away from the center.
      ===================================== */

      const isMobile =
        window.innerWidth <= 768;


      const radiusX =
        isMobile ? 105 : 300;


      const radiusY =
        isMobile ? 145 : 240;


      /* =====================================
         INITIAL STATE
      ===================================== */

      gsap.set(cards, {

        opacity: 0,

        scale: 0.6,

        x: 0,

        y: 0,

        rotation: 0,

        filter: "blur(15px)",

      });


      /* =====================================
         MASTER TIMELINE
      ===================================== */

      const masterTimeline =
        gsap.timeline();


      timelineRef.current =
        masterTimeline;


      /* =====================================
         ANIMATE EACH PHOTO
      ===================================== */

      cards.forEach((card, index) => {


        /* Get one of 8 positions */

        const position =
          positions[
            index % positions.length
          ];


        /* Calculate position from center */

        const targetX =
          position.x * radiusX;


        const targetY =
          position.y * radiusY;


        /* Entrance direction */

        const direction =
          index % 4;


        let startX = 0;
        let startY = 0;


        if (direction === 0) {

          startX = -window.innerWidth;

        }

        else if (direction === 1) {

          startX = window.innerWidth;

        }

        else if (direction === 2) {

          startY = -window.innerHeight;

        }

        else {

          startY = window.innerHeight;

        }


        /* Set entrance position */

        gsap.set(card, {

          x: startX,

          y: startY,

          rotation:
            position.rotation +
            gsap.utils.random(-8, 8),

        });


        /* =====================================
           ENTER ANIMATION
        ===================================== */

        masterTimeline.to(

          card,

          {

            opacity: 1,

            x: targetX,

            y: targetY,

            scale: position.scale,

            rotation:
              position.rotation,

            filter: "blur(0px)",

            duration: 0.9,

            ease: "power3.out",

          },

          index * 0.22

        );


        /* =====================================
           FLOATING MOVEMENT
        ===================================== */

        masterTimeline.to(

          card,

          {

            x:
              targetX +
              gsap.utils.random(-12, 12),

            y:
              targetY +
              gsap.utils.random(-12, 12),

            rotation:
              position.rotation +
              gsap.utils.random(-3, 3),

            duration: 1.5,

            ease: "sine.inOut",

          },

          index * 0.22 + 0.9

        );


        /* =====================================
           REMOVE OLD PHOTO

           Keeps maximum 8 visible.
        ===================================== */

        if (index >= 8) {

          const oldCard =
            cards[index - 8];


          masterTimeline.to(

            oldCard,

            {

              opacity: 0,

              scale: 0.75,

              filter: "blur(10px)",

              duration: 0.5,

              ease: "power2.in",

            },

            index * 0.22

          );

        }

      });


    }, galleryRef);


    return () => {

      ctx.revert();

    };


  }, [showGallery]);

/* =========================================
   DRAG PHOTOS
========================================= */

useEffect(() => {

  if (!showGallery) return;

  if (!galleryRef.current) return;


  const cards =
    galleryRef.current.querySelectorAll(".photo-card");


  const draggables = [];


  cards.forEach((card) => {

    const draggable = Draggable.create(card, {

      type: "x,y",

      bounds: ".gallery",

      inertia: false,


      onPress() {

        /* Bring dragged image to front */

        gsap.to(this.target, {

          zIndex: 500,

          duration: 0.2,

        });

      },


      onDragStart() {

        gsap.to(this.target, {

          scale: "+=0.08",

          duration: 0.2,

          ease: "power2.out",

        });

      },


      onDragEnd() {

        gsap.to(this.target, {

          scale: "-=0.08",

          duration: 0.3,

          ease: "power2.out",

        });

      },

    });


    draggables.push(...draggable);

  });


  return () => {

    draggables.forEach((draggable) => {

      draggable.kill();

    });

  };


}, [showGallery]);


  /* =========================================
     START EXPERIENCE
  ========================================= */

  const startExperience = async () => {

    if (!videoRef.current) return;

    try {

      await videoRef.current.play();

      setIsStarted(true);

    }

    catch (error) {

      console.error(
        "Video failed to play:",
        error
      );

    }

  };


  /* =========================================
     HOVER EFFECT
  ========================================= */

  const handleMouseMove = (event) => {

    if (activePhoto !== null) return;


    const card =
      event.currentTarget;


    const rect =
      card.getBoundingClientRect();


    const x =
      event.clientX - rect.left;


    const y =
      event.clientY - rect.top;


    const centerX =
      rect.width / 2;


    const centerY =
      rect.height / 2;


    const rotateY =
      (x - centerX) / 18;


    const rotateX =
      -(y - centerY) / 18;


    gsap.to(card, {

      rotateX,

      rotateY,

      scale: "+=0.08",

      duration: 0.3,

      ease: "power2.out",

      transformPerspective: 1000,

    });

  };


  const handleMouseLeave = (event) => {

    if (activePhoto !== null) return;


    gsap.to(event.currentTarget, {

      rotateX: 0,

      rotateY: 0,

      duration: 0.5,

      ease: "power3.out",

    });

  };


  /* =========================================
     PHOTO CLICK
  ========================================= */

  const handlePhotoClick = (
    event,
    index
  ) => {

    event.stopPropagation();

    setActivePhoto(index);

  };


  /* =========================================
     CLOSE PHOTO
  ========================================= */

  const closePhoto = () => {

    if (activePhoto !== null) {

      setActivePhoto(null);

    }

  };


  /* =========================================
     RESTART
  ========================================= */

  const restartExperience = async (
    event
  ) => {

    event.stopPropagation();

    if (!videoRef.current) return;


    if (timelineRef.current) {

      timelineRef.current.kill();

    }


    animationStarted.current = false;


    setShowGallery(false);

    setActivePhoto(null);


    videoRef.current.pause();

    videoRef.current.currentTime = 0;


    await videoRef.current.play();


    setIsStarted(true);

  };


  /* =========================================
     RENDER
  ========================================= */

  return (

    <main
      className="app"
      onClick={closePhoto}
    >


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

      </video>



      {/* PHOTO GALLERY */}

      {showGallery && (

        <div
          ref={galleryRef}
          className="gallery"
        >

          {photos.map(
            (photo, index) => (

              <div

                key={index}

                className={`
                  photo-card
                  ${
                    activePhoto === index
                      ? "active"
                      : ""
                  }
                  ${
                    activePhoto !== null &&
                    activePhoto !== index
                      ? "inactive"
                      : ""
                  }
                `}

                onClick={(event) =>
                  handlePhotoClick(
                    event,
                    index
                  )
                }

                onMouseMove={
                  handleMouseMove
                }

                onMouseLeave={
                  handleMouseLeave
                }

              >

                <img
                  src={photo}
                  alt={`Memory ${index + 1}`}
                  draggable="false"
                />

              </div>

            )
          )}

        </div>

      )}



      {/* START SCREEN */}

      {!isStarted && (

        <div className="start-screen">

          <div className="start-content">

            <p>
              SOMETHING SPECIAL
            </p>


            <button
              onClick={startExperience}
            >

              <span>▶</span>

              START

            </button>

          </div>

        </div>

      )}



      {/* RESTART BUTTON */}

      {isStarted && (

        <button
          className="restart-button"
          onClick={restartExperience}
          aria-label="Restart"
        >

          ↻

        </button>

      )}


    </main>

  );

}


export default App;