import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

function PhotoCard({
  photo,
  position,
  onRemove,
  onExpand,
}) {
  const cardRef = useRef(null);
  const draggableRef = useRef(null);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!cardRef.current || !loaded) return;

    const card = cardRef.current;

    const isMobile =
      window.innerWidth <= 768;

    const radiusX =
      isMobile ? 105 : 310;

    const radiusY =
      isMobile ? 145 : 240;

    const targetX =
      position.x * radiusX;

    const targetY =
      position.y * radiusY;


    /* --------------------------------
       INITIAL ENTRANCE POSITION
    -------------------------------- */

    const direction =
      photo.id % 4;

    let startX = 0;
    let startY = 0;

    if (direction === 0) {
      startX = -window.innerWidth;
    }

    if (direction === 1) {
      startX = window.innerWidth;
    }

    if (direction === 2) {
      startY = -window.innerHeight;
    }

    if (direction === 3) {
      startY = window.innerHeight;
    }


    gsap.set(card, {
      opacity: 0,
      scale: 0.7,
      x: startX,
      y: startY,
      rotation: position.rotation,
      filter: "blur(12px)",
    });


    /* --------------------------------
       ENTER
    -------------------------------- */

    gsap.to(card, {
      opacity: 1,
      scale: position.scale,
      x: targetX,
      y: targetY,
      rotation: position.rotation,
      filter: "blur(0px)",
      duration: 0.9,
      ease: "power3.out",
      delay: (photo.slot || 0) * 0.08,
    });


    /* --------------------------------
       DRAGGABLE
    -------------------------------- */

    draggableRef.current = Draggable.create(
      card,
      {
        type: "x,y",

        onPress() {
          gsap.set(card, {
            zIndex: 1000,
          });
        },

        onDragStart() {
          gsap.to(card, {
            scale:
              position.scale + 0.08,

            duration: 0.2,
          });
        },

        onDragEnd() {
          gsap.to(card, {
            scale: position.scale,
            duration: 0.25,
          });
        },

        onClick() {
          onExpand(photo);
        },
      }
    )[0];


    return () => {

      if (draggableRef.current) {
        draggableRef.current.kill();
      }

    };

  }, [loaded]);


  /* --------------------------------
     REMOVE ANIMATION
  -------------------------------- */

  useEffect(() => {

    if (!photo.removing) return;

    if (!cardRef.current) return;

    gsap.to(cardRef.current, {

      opacity: 0,

      scale: 0.65,

      filter: "blur(10px)",

      duration: 0.5,

      ease: "power2.in",

      onComplete: () => {

        onRemove(photo.id);

      },

    });

  }, [photo.removing]);


  return (

    <div
      ref={cardRef}
      className={`
        photo-card
        ${loaded ? "loaded" : ""}
      `}
    >

      <img
        src={photo.src}
        alt="Memory"
        draggable="false"
        decoding="async"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
      />

    </div>

  );

}

export default PhotoCard;