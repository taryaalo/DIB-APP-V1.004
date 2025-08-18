import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js/dist/face-api.js';
import { useLanguage } from '../contexts/LanguageContext';
import { useFormData } from '../contexts/FormContext';
import { t } from '../i18n';
import ThemeSwitcher from '../common/ThemeSwitcher';
import LanguageSwitcher from '../common/LanguageSwitcher';
import '../styles/SelfiePage.css';

const challenges = ['center','turnLeft','turnRight','turnUp','turnDown'];

const SelfiePage_EN = ({ onNavigate, backPage, nextPage }) => {
  const { language } = useLanguage();
  const { formData } = useFormData();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const guideTextRef = useRef(null);
  const faceFitGuideRef = useRef(null);
  const virtualFaceGuideRef = useRef(null);

  const photoRefs = {
    center: useRef(null),
    turnLeft: useRef(null),
    turnRight: useRef(null),
    turnUp: useRef(null),
    turnDown: useRef(null),
    verified: useRef(null)
  };

  const registeredDescriptor = useRef(null);
  const verificationInterval = useRef(null);
  const livenessInterval = useRef(null);
  const currentChallengeIndex = useRef(0);
  const initialNosePosition = useRef(null);
  const allLivenessData = useRef({});
  const initializedRef = useRef(false);

  const [status, setStatus] = useState(t('loadingModels', language));
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaDevices = navigator.mediaDevices;
      let stream;
      if (mediaDevices && typeof mediaDevices.getUserMedia === 'function') {
        stream = await mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
      } else {
        const legacyGetUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia;
        if (!legacyGetUserMedia) {
          throw new Error('MediaDevices API or getUserMedia not supported');
        }
        stream = await new Promise((resolve, reject) =>
          legacyGetUserMedia.call(
            navigator,
            { video: { facingMode: 'user' }, audio: false },
            resolve,
            reject
          )
        );
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionDenied(false);
      return true;
    } catch (err) {
      setPermissionDenied(true);
      setStatus(t('cameraPermissionDenied', language));
      console.error('Camera error', err);
      return false;
    }
  }, [language]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      setStatus(t('requestingCameraPermission', language));
      if (!(await startCamera())) return;
      setStatus(t('loadingModels', language));
      await Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'),
        faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'),
        faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/')
      ]);
      setStatus(t('cameraReady', language));
      setButtonDisabled(false);
    };

    init();
  }, [language, startCamera]);

  useEffect(() => {
    if (permissionDenied) {
      setStatus(t('cameraPermissionDenied', language));
    } else if (buttonDisabled) {
      setStatus(t('loadingModels', language));
    } else {
      setStatus(t('cameraReady', language));
    }
  }, [language, buttonDisabled, permissionDenied]);

  const updateGuide = (challenge) => {
    const guideText = guideTextRef.current;
    const faceFitGuide = faceFitGuideRef.current;
    const virtualFaceGuide = virtualFaceGuideRef.current;
    if (!guideText || !faceFitGuide || !virtualFaceGuide) return;

    virtualFaceGuide.classList.remove('visible','animate-turnLeft','animate-turnRight','animate-turnUp','animate-turnDown');

    const challengeInstructions = {
      center: t('challengeCenter', language),
      turnLeft: t('challengeTurnLeft', language),
      turnRight: t('challengeTurnRight', language),
      turnUp: t('challengeTurnUp', language),
      turnDown: t('challengeTurnDown', language)
    };
    guideText.textContent = challengeInstructions[challenge];

    if (challenge === 'center') {
      faceFitGuide.classList.remove('hidden','correct');
    } else {
      faceFitGuide.classList.add('hidden');
      virtualFaceGuide.classList.add('visible');
      virtualFaceGuide.classList.add(`animate-${challenge}`);
    }
  };

  const runLivenessChallenge = () => {
    const challenge = challenges[currentChallengeIndex.current];
    updateGuide(challenge);
    const headTurnThreshold = 25;

    livenessInterval.current = setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks();
      if (detection && detection.detection && detection.landmarks) {
        drawDetections(detection);
        let challengePassed = false;
        const { box } = detection.detection;
        const nose = detection.landmarks.getNose();
        const noseTip = nose[3];

        switch (challenge) {
          case 'center': {
            const faceWidth = box.width;
            const faceCenterX = box.left + box.width / 2;
            const videoCenterX = videoRef.current.videoWidth / 2;
            const distanceX = Math.abs(faceCenterX - videoCenterX);
            const positionCheck = distanceX < videoRef.current.videoWidth * 0.15;
            const sizeCheck = faceWidth > videoRef.current.videoWidth * 0.3 && faceWidth < videoRef.current.videoWidth * 0.6;
            if (positionCheck && sizeCheck) {
              faceFitGuideRef.current.classList.add('correct');
              initialNosePosition.current = { x: noseTip.x, y: noseTip.y };
              challengePassed = true;
            } else {
              faceFitGuideRef.current.classList.remove('correct');
            }
            break;
          }
          case 'turnLeft':
            if (initialNosePosition.current && (noseTip.x - initialNosePosition.current.x > headTurnThreshold)) challengePassed = true;
            break;
          case 'turnRight':
            if (initialNosePosition.current && (initialNosePosition.current.x - noseTip.x > headTurnThreshold)) challengePassed = true;
            break;
          case 'turnUp':
            if (initialNosePosition.current && (initialNosePosition.current.y - noseTip.y > headTurnThreshold)) challengePassed = true;
            break;
          case 'turnDown':
            if (initialNosePosition.current && (noseTip.y - initialNosePosition.current.y > headTurnThreshold)) challengePassed = true;
            break;
          default:
            break;
        }

        if (challengePassed) {
          clearInterval(livenessInterval.current);
          const highQualityDetection = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
          if (highQualityDetection) {
            allLivenessData.current[challenge] = {
              descriptor: Array.from(highQualityDetection.descriptor),
              landmarks: highQualityDetection.landmarks.positions
            };
            if (challenge === 'center') {
              registeredDescriptor.current = highQualityDetection.descriptor;
            }
          }
          capturePhoto(videoRef.current, photoRefs[challenge].current);
          currentChallengeIndex.current++;
          if (currentChallengeIndex.current >= challenges.length) {
            guideTextRef.current.textContent = '';
            virtualFaceGuideRef.current.classList.remove('visible');
            setStatus(t('livenessConfirmed', language));
            if (registeredDescriptor.current) {
              saveDataToServer();
              setStatus(t('registrationComplete', language));
              setButtonDisabled(true);
              startVerification();
            } else {
              setStatus(t('couldNotCapture', language));
              setButtonDisabled(false);
              currentChallengeIndex.current = 0;
            }
          } else {
            setTimeout(() => runLivenessChallenge(), 500);
          }
        }
      } else {
        if (challenge === 'center' && faceFitGuideRef.current) faceFitGuideRef.current.classList.remove('correct');
      }
    }, 300);
  };

  const startVerification = () => {
    verificationInterval.current = setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection && registeredDescriptor.current) {
        const distance = faceapi.euclideanDistance(
          registeredDescriptor.current,
          detection.descriptor
        );

        if (distance < 0.6) {
          clearInterval(verificationInterval.current);
          overlayRef.current.classList.add('success');
          setStatus(
            t('identityVerified', language) + ` (Distance: ${distance.toFixed(2)})`
          );
          drawDetections(detection);
          capturePhoto(videoRef.current, photoRefs.verified.current);
        }
      }
    }, 700);
  };

  const drawDetections = (detection) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    const displaySize = { width: video.clientWidth, height: video.clientHeight };
    faceapi.matchDimensions(canvas, displaySize);
    const resized = faceapi.resizeResults(detection, displaySize);
    context.clearRect(0,0,canvas.width, canvas.height);
    context.translate(canvas.width,0);
    context.scale(-1,1);
    faceapi.draw.drawFaceLandmarks(canvas, resized);
    context.setTransform(1,0,0,1,0,0);
  };

  const capturePhoto = (videoEl, imgEl) => {
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = videoEl.videoWidth;
    photoCanvas.height = videoEl.videoHeight;
    const ctx = photoCanvas.getContext('2d');
    ctx.translate(photoCanvas.width,0);
    ctx.scale(-1,1);
    ctx.drawImage(videoEl,0,0,photoCanvas.width,photoCanvas.height);
    const dataUrl = photoCanvas.toDataURL('image/jpeg',0.9);
    imgEl.src = dataUrl;
  };

  const saveDataToServer = async () => {
    const photos = {
      center: photoRefs.center.current.src,
      turnLeft: photoRefs.turnLeft.current.src,
      turnRight: photoRefs.turnRight.current.src,
      turnUp: photoRefs.turnUp.current.src,
      turnDown: photoRefs.turnDown.current.src
    };
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/save-selfie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceNumber: formData.personalInfo?.referenceNumber,
          photos,
          data: allLivenessData.current
        })
      });
    } catch (e) {
      console.error('save selfie error', e);
    }
  };

  const handleStart = () => {
    setButtonDisabled(true);
    setStatus(t('followInstructions', language));
    currentChallengeIndex.current = 0;
    allLivenessData.current = {};
    runLivenessChallenge();
  };

  return (
    <div className="selfie-page">
      <header className="header docs-header">
        <div className="header-switchers">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <button onClick={() => onNavigate(backPage)} className="btn-back">
          <span>{t('back', language)}</span>
        </button>
      </header>
      <div className="container">
        <h1 className="page-title">{t('selfieTitle', language)}</h1>
        <div className="camera-container">
          <video id="video" ref={videoRef} autoPlay muted playsInline></video>
          <canvas id="canvas" ref={canvasRef}></canvas>
          <div id="guideContainer">
            <p id="guideText" ref={guideTextRef}></p>
            <svg id="guideSvg" viewBox="0 0 400 480">
              <ellipse id="faceFitGuide" ref={faceFitGuideRef} cx="200" cy="240" rx="120" ry="180"/>
              <g id="virtualFaceGuide" ref={virtualFaceGuideRef}></g>
            </svg>
          </div>
          <div id="overlay" ref={overlayRef} className="overlay"></div>
        </div>
        <button id="registerButton" disabled={buttonDisabled} onClick={handleStart}>{t('startLivenessCheck', language)}</button>
        <div id="results" className="info">{status}</div>
        <div className="photo-strip">
          <div className="photo-box"><label>{t('center', language)}</label><img ref={photoRefs.center} alt="center" /></div>
          <div className="photo-box"><label>{t('left', language)}</label><img ref={photoRefs.turnLeft} alt="left" /></div>
          <div className="photo-box"><label>{t('right', language)}</label><img ref={photoRefs.turnRight} alt="right" /></div>
          <div className="photo-box"><label>{t('up', language)}</label><img ref={photoRefs.turnUp} alt="up" /></div>
          <div className="photo-box"><label>{t('down', language)}</label><img ref={photoRefs.turnDown} alt="down" /></div>
          <div className="photo-box">
            <label>{t('verified', language)}</label>
            <img ref={photoRefs.verified} alt="verified" />
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-next" onClick={() => onNavigate(nextPage)}>{t('next', language)}</button>
      </div>
    </div>
  );
};

export default SelfiePage_EN;
