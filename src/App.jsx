import {
  useEffect,
  useRef,
  useState,
} from "react";

import "./App.css";

import video from "./assets/video/bday.mp4";

import PhotoCard from "./components/PhotoCard";


/* ========================================
   LOAD PHOTO URLS
======================================== */

const photoModules = import.meta.glob(
  "./assets/photos-optimized/*.webp",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);


const photos = Object.entries(photoModules)
  .sort(([a], [b]) => {

    return a.localeCompare(
      b,
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      }
    );

  })
  .map(([, src]) => src);


/* ========================================
   CENTER POSITIONS
======================================== */

const positions = [

  {
    x: -0.9,
    y: -1,
    rotation: -10,
    scale: 0.9,
  },

  {
    x: 0,
    y: -1.2,
    rotation: 2,
    scale: 1,
  },

  {
    x: 0.9,
    y: -1,
    rotation: 9,
    scale: 0.9,
  },

  {
    x: -1.15,
    y: 0,
    rotation: -7,
    scale: 1,
  },

  {
    x: 1.15,
    y: 0,
    rotation: 7,
    scale: 1,
  },

  {
    x: -0.9,
    y: 1,
    rotation: 8,
    scale: 0.9,
  },

  {
    x: 0,
    y: 1.2,
    rotation: -2,
    scale: 1,
  },

  {
    x: 0.9,
    y: 1,
    rotation: -8,
    scale: 0.9,
  },

];


const MAX_VISIBLE = 8;


function App() {

  const videoRef = useRef(null);

  const animationStarted = useRef(false);

  const nextPhotoIndex = useRef(0);


  const [started, setStarted] =
    useState(false);

  const [showGallery, setShowGallery] =
    useState(false);

  const [visiblePhotos, setVisiblePhotos] =
    useState([]);

  const [expandedPhoto, setExpandedPhoto] =
    useState(null);

  const [showBirthdayMessage, setShowBirthdayMessage] =
    useState(false);


  /* ========================================
     PRELOAD IMAGES

     First 12 load while video plays.
  ======================================== */

  useEffect(() => {

    const preloadCount = 12;

    photos
      .slice(0, preloadCount)
      .forEach((src) => {

        const image = new Image();

        image.src = src;

      });

  }, []);



  /* ========================================
     PRELOAD UPCOMING PHOTOS
  ======================================== */

  const preloadNextPhotos = (
    startIndex
  ) => {

    const preloadAmount = 4;


    for (
      let i = startIndex;
      i < Math.min(
        startIndex + preloadAmount,
        photos.length
      );
      i++
    ) {

      const image = new Image();

      image.src = photos[i];

    }

  };


  /* ========================================
     START GALLERY
  ======================================== */

  const startGallery = () => {

    if (animationStarted.current) return;

    animationStarted.current = true;

    setShowGallery(true);


    /* Initial 8 photos */

    const initialPhotos =
      photos
        .slice(0, MAX_VISIBLE)
        .map((src, index) => ({

          id: index,

          src,

          slot: index,

        }));


    setVisiblePhotos(
      initialPhotos
    );


    nextPhotoIndex.current =
      MAX_VISIBLE;


    preloadNextPhotos(
      MAX_VISIBLE
    );

  };


  /* ========================================
     VIDEO TIME CHECK
  ======================================== */

  const handleTimeUpdate = () => {

    if (!videoRef.current) return;


    if (
      videoRef.current.currentTime >= 7 &&
      !animationStarted.current
    ) {

      startGallery();

    }

  };


  /* ========================================
     ROTATE PHOTOS

     Replace oldest photo.
  ======================================== */

  useEffect(() => {

    if (!showGallery) return;


    const interval =
      setInterval(() => {

        if (
          nextPhotoIndex.current >=
          photos.length
        ) {

          clearInterval(interval);

          return;

        }


        /* Mark oldest for removal */

        setVisiblePhotos(
          current => {

            if (!current.length) {
              return current;
            }


            const updated =
              current.map(
                (photo, index) => {

                  if (index === 0) {

                    return {
                      ...photo,
                      removing: true,
                    };

                  }

                  return photo;

                }
              );


            return updated;

          }
        );

      }, 1100);


    return () => {

      clearInterval(interval);

    };

  }, [showGallery]);


  /* ========================================
     REMOVE OLD PHOTO
  ======================================== */

  const removePhoto = (
    id
  ) => {

    setVisiblePhotos(
      current => {

        const filtered =
          current.filter(
            photo =>
              photo.id !== id
          );


        if (
          nextPhotoIndex.current >=
          photos.length
        ) {

          return filtered;

        }


        const newIndex =
          nextPhotoIndex.current;


        const newPhoto = {

          id: newIndex,

          src: photos[newIndex],

          slot:
            newIndex %
            MAX_VISIBLE,

        };


        nextPhotoIndex.current += 1;


        /* Preload next */

        preloadNextPhotos(
          nextPhotoIndex.current
        );


        return [
          ...filtered,
          newPhoto,
        ];

      }
    );

  };


  /* ========================================
     START EXPERIENCE
  ======================================== */

  const startExperience =
    async () => {

      if (!videoRef.current) return;

      try {

        await videoRef.current.play();

        setStarted(true);

      }

      catch (error) {

        console.error(
          "Video playback failed:",
          error
        );

      }

    };


  /* ========================================
     VIDEO ENDED
  ======================================== */

  const handleVideoEnd = () => {

    setShowGallery(false);

    setExpandedPhoto(null);


    setTimeout(() => {

      setShowBirthdayMessage(true);

    }, 400);

  };


  /* ========================================
     EXPAND PHOTO
  ======================================== */

  const handleExpand = (
    photo
  ) => {

    setExpandedPhoto(photo);

  };


  /* ========================================
     CLOSE EXPANDED
  ======================================== */

  const closeExpanded = () => {

    setExpandedPhoto(null);

  };


  /* ========================================
     RESTART
  ======================================== */

  const restartExperience =
    async (event) => {

      event.stopPropagation();


      if (!videoRef.current) return;


      animationStarted.current = false;

      nextPhotoIndex.current = 0;


      setShowGallery(false);

      setVisiblePhotos([]);

      setExpandedPhoto(null);

      setShowBirthdayMessage(false);


      videoRef.current.currentTime = 0;


      await videoRef.current.play();

    };


  return (

    <main className="app">


      {/* =================================
          VIDEO
      ================================= */}

      <video
        ref={videoRef}
        className="birthday-video"
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
      >

        <source
          src={video}
          type="video/mp4"
        />

      </video>



      {/* =================================
          PHOTO GALLERY
      ================================= */}

      {showGallery && (

        <div className="gallery">

          {visiblePhotos.map(
            (photo, index) => (

              <PhotoCard
                key={photo.id}
                photo={photo}
                position={
                  positions[
                    photo.slot %
                    positions.length
                  ]
                }
                onRemove={removePhoto}
                onExpand={handleExpand}
              />

            )
          )}

        </div>

      )}



      {/* =================================
          EXPANDED PHOTO
      ================================= */}

      {expandedPhoto && (

        <div
          className="expanded-overlay"
          onClick={closeExpanded}
        >

          <img
            src={expandedPhoto.src}
            alt="Memory"
          />

        </div>

      )}



      {/* =================================
          FINAL MESSAGE
      ================================= */}

      {showBirthdayMessage && (

        <div className="birthday-message">

          <div className="birthday-glow" />

          <div className="birthday-content">

            <span className="birthday-word rionaaa">
              Happy Birthday Rionaaa!
            </span>

          </div>

        </div>

      )}



      {/* =================================
          START SCREEN
      ================================= */}

      {!started && (

        <div className="start-screen">

          <button
            className="start-button"
            onClick={startExperience}
          >

            Whoosh!

          </button>

        </div>

      )}



      {/* =================================
          RESTART
      ================================= */}

      {started && !showBirthdayMessage && (

        <button
          className="restart-button"
          onClick={restartExperience}
        >

          ↻

        </button>

      )}

    </main>

  );

}


export default App;