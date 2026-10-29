import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, MapPin, Scan, Power, Clock, 
  AlertTriangle, CheckCircle2, RefreshCw, Search, ShieldAlert, AlertCircle
} from 'lucide-react';

import L from 'leaflet';

const SIGNAL_CONFIG = {
  lat: 32.07789691777519, // Adjust target latitude
  lng: 34.774121609655985, // Adjust target longitude
  zoom: 15,     // Zoom level (1-18)
  label: "SIGNAL ORIGIN: 32.0853° N, 34.7818° E"
};
const CODE = '2810'

export default function App() {
  const [currentPage, setCurrentPage] = useState('sound');

  // Hash-based routing driven exclusively by QR code scans (#sound to #princelog)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['sound', 'lablog', 'anomalylog', 'worldline', 'barmanstory', 'logbook', 'princelog'].includes(hash)) {
        setCurrentPage(hash);
      } else if (!hash) {
        window.location.hash = 'sound';
        setCurrentPage('sound');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none">
      <div className="p-6 flex-grow flex flex-col">
        {currentPage === 'sound' && <Page1 />}
        {currentPage === 'lablog' && <Page2 />}
        {currentPage === 'anomalylog' && <Page3 />}
        {currentPage === 'worldline' && <Page4 />}
        {currentPage === 'barmanstory' && <Page5 />}
        {currentPage === 'logbook' && <Page6 />}
        {currentPage === 'princelog' && <Page7 />}
      </div>
    </div>
  );
}

/* ================= PAGE 1: CAT ATTRACTOR SYSTEM ================= */
function Page1() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [coffeeCode, setCoffeeCode] = useState('');
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  const toggleSound = () => {
    if (isPlaying) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      setIsPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(14200, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtxRef.current.currentTime);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        oscRef.current = osc;
        setIsPlaying(true);
      } catch (e) {
        setStatusMsg('Audio playback restricted by browser policy.');
      }
    }
  };

  const handleDeactivate = (e) => {
    e.preventDefault();
    const cleaned = coffeeCode.trim().toLowerCase();
    if (cleaned === CODE) {
      if (isPlaying && oscRef.current) {
        oscRef.current.stop();
        setIsPlaying(false);
      }
      setIsDeactivated(true);
      setStatusMsg('Success: Signal deactivation accepted. Transmitter disabled.');
    } else {
      setStatusMsg('Error: Code required. Check laboratory coffee log.');
    }
  };

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2 text-amber-500 text-xs tracking-wider font-semibold uppercase mb-1">
          <AlertTriangle className="w-4 h-4" />
          <span>Transmitter Terminal</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Signal Beacon</h1>
        <p className="text-xs text-zinc-400">
          Unidentified high-frequency broadcasting system active.
        </p>
      </div>
      {statusMsg && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-lg text-amber-300 text-xs">
          {statusMsg}
        </div>
      )}

      {/* Button 1: Audio Toggle */}
      <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 text-center space-y-3">
        <div className="relative inline-flex items-center justify-center p-4">
          <div className={`absolute inset-0 rounded-full ${isPlaying ? 'bg-amber-500/20 animate-ping' : 'bg-transparent'}`}></div>
          <button
            onClick={toggleSound}
            disabled={isDeactivated}
            className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold shadow-lg transition-all ${
              isDeactivated 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                : isPlaying 
                  ? 'bg-amber-500 text-black border-2 border-amber-300 shadow-amber-500/30' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
            }`}
          >
            {isPlaying ? <Volume2 className="w-7 h-7" /> : <VolumeX className="w-7 h-7 text-zinc-400" />}
            <span className="text-[10px] mt-1 uppercase font-mono">{isPlaying ? 'Active' : 'Lure Sound'}</span>
          </button>
        </div>
        <p className="text-[11px] text-zinc-500 font-mono">14.2 kHz Attractor Frequency</p>
      </div>

      {/* Controls: Scan Map & Deactivation Form */}
      <div className="space-y-3">
        {/* Button 2: Scan Area Map */}
        <button
          onClick={() => setShowMap(!showMap)}
          className="w-full py-3 px-4 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-medium text-xs text-white flex items-center justify-between transition"
        >
          <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400" /> {showMap ? 'Hide' : 'Scan Area for signals'}</span>
        </button>

        {showMap && (
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 animate-fadeIn">
            <LeafletDarkMap 
              lat={SIGNAL_CONFIG.lat} 
              lng={SIGNAL_CONFIG.lng} 
              zoom={SIGNAL_CONFIG.zoom} 
              label={SIGNAL_CONFIG.label} 
            />
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Button 3 / Form: Turn off all signals */}
        <form onSubmit={handleDeactivate} className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
          <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
            Turn Off All Signals (Requires Code)
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={coffeeCode}
              onChange={(e) => setCoffeeCode(e.target.value)}
              placeholder="Enter code..."
              disabled={isDeactivated}
              className="flex-grow bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              type="submit"
              disabled={isDeactivated}
              className="bg-red-900/40 hover:bg-red-800/60 border border-red-700 text-red-300 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
            >
              <Power className="w-3.5 h-3.5" /> Turn Off
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= PAGE 2: LAB LOG ================= */
function Page2() {
  return (
    <div className="p-4 space-y-3 leading-relaxed">
      <div className="text-[11px] text-zinc-500 border-b border-zinc-900 pb-1 flex justify-between">
        <span>LOG ENTRY #304</span>
        <span>29/10/2006 20:35</span>
      </div>
      <p style={{ textAlign: "justify", fontFamily: "math" }}>
        The experiment is going on nicely. I managed to draw near 72% of local felines, though the process of imbuing intelligence is still far from successful. But that's okay. I knew this process would be slow going when I decided to take it upon myself.
        <br/>
        <br/>
        The only thing bothering me is that infinitesimal drift. It's causing the beacon sound to resonate, damaging my equipment. I don't think it's dangerous just yet. But it might be. I'm going to look into it tomorrow, but I'll have to be extra careful.
        <br/>
        <br/>
        The local government still doesn't know I'm here. I thought about asking them for help with the drift, but I decided against it, lest they think I'm a foreign agent and eliminate me. People don't believe in independent science these days. Just academy and corporations.
        <br/>
        <br/>
        Just as a precaution, I changed the signal disarming code again. Intellectually, there is no reason to be suspicious. I didn't find any real signs that someone is trying to sabotage my experiment. But if they are trying, this might make it a bit harder on them.
        <br/>
        <br/>
        I used the four digits of Elise's birthday. It was yesterday.
        <br/>
        <br/>
        Happy birthday my love.
      </p>
    </div>
  );
}

/* ================= PAGE 3: GRAVITY ANOMALY AGENT ================= */
function Page3() {
    return (
      <div className="p-4 space-y-3 leading-relaxed">
        <div className="text-[11px] text-zinc-500 border-b border-zinc-900 pb-1 flex justify-between">
          <span>REQUEST FOR HELP</span>
          <span>29/10/2026 18:20</span>
        </div>
        <p style={{ textAlign: "justify", fontFamily: "math" }}>
          If you are reading this, it means I failed.
          <br/><br/>
          My name is Agent Signet. I was sent here to solve the local gravitational anomaly, marked as Anomaly #8529. This was supposed to be a simple operation of finding the source and disabling it.
          <br/><br/>
          As usual, we have safeguards. The link to this guide was to be sent in an encoded message to an impartial agency in case the anomaly took my life.
          <br/><br/>
          I am sorry to put this on your shoulders, but this anomaly is dangerous.
          <br/><br/>
          The anomaly is a result of a local spacetime singularity. This usually means a local engineer or architect built a structure that breaks the rules of space and time. These anomalies make local buildings impossible to navigate, although some locals gain this ability after a while.
          <br/><br/>
          To sever the anomaly, one simply has to "straighten" space, so to speak, by dragging a worldline between two key points. I have found one of the points to be in the basement of building A of the anomaly, and I believe the other point is in the basement of building B, though I could not confirm it.
          <br/><br/>
          Use <a href="#worldline" className="text-cyan-400 underline font-semibold hover:text-cyan-300">this link</a> to open the worldline interface. Scan the first key point in building A, then you only have about a minute to get to the second point and scan it as well.
          <br/><br/>
          Good luck, and may time be on your side.
        </p>
      </div>
    );
}

/* ================= PAGE 4: WORLDLINE INTERFACE ================= */
function Page4() {
  const [scanState, setScanState] = useState('IDLE'); // IDLE, WAITING_2, SUCCESS, EXPIRED
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds (1.5 minutes)
  const [scannedCodes, setScannedCodes] = useState([]);
  const [statusMsg, setStatusMsg] = useState('Point camera at Key Point A barcode.');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const lastScanTimeRef = useRef(0);

  // 1. Load jsQR library dynamically for real-time barcode decoding
  useEffect(() => {
    if (!window.jsQR) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
      script.async = true;
      document.head.appendChild(script);
    }
    startCamera();

    return () => stopCamera();
  }, []);

  // 2. Countdown timer effect for 90-second execution window
  useEffect(() => {
    let timer;
    if (scanState === 'WAITING_2' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && scanState === 'WAITING_2') {
      setScanState('EXPIRED');
      setStatusMsg('WORLDLINE COLLAPSED: 90-second window expired. Re-anchoring required.');
      stopCamera();
    }
    return () => clearInterval(timer);
  }, [scanState, timeLeft]);

  // 3. Camera initialization
  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      setCameraError('Camera access denied or unavailable. Use manual triggers below for testing.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // 4. Real-time video frame scanning loop
  useEffect(() => {
    let animId;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scanFrame = () => {
      const video = videoRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA && cameraActive && scanState !== 'SUCCESS' && scanState !== 'EXPIRED') {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (window.jsQR) {
          const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            const now = Date.now();
            // Debounce scans (1.5 seconds cooldown between detections)
            if (now - lastScanTimeRef.current > 1500) {
              lastScanTimeRef.current = now;
              processScannedValue(code.data.trim().toUpperCase());
            }
          }
        }
      }

      if (scanState !== 'SUCCESS' && scanState !== 'EXPIRED') {
        animId = requestAnimationFrame(scanFrame);
      }
    };

    if (cameraActive) {
      animId = requestAnimationFrame(scanFrame);
    }

    return () => cancelAnimationFrame(animId);
  }, [cameraActive, scanState, scannedCodes]);

  // 5. Core validation logic for "CODE A" and "CODE B"
  const processScannedValue = (rawValue) => {
    if (scanState === 'IDLE' || scanState === 'EXPIRED') {
      if (rawValue === 'CODE A') {
        setScannedCodes(['CODE A']);
        setScanState('WAITING_2');
        setTimeLeft(90);
        setStatusMsg('Key Point A Anchored!');
        setTimeout(() => setStatusMsg('timer'), 1000)
      } else if (rawValue === 'CODE B') {
        setStatusMsg('Error: Invalid order! You must scan Key Point A first.');
      } else {
        setStatusMsg(`Invalid key point.`);
      }
    } else if (scanState === 'WAITING_2') {
      if (rawValue === 'CODE B') {
        setScannedCodes((prev) => [...prev, 'CODE B']);
        setScanState('SUCCESS');
        setStatusMsg('WORLDLINE ANCHORED! Spacetime anomaly #8529 successfully severed.');
        stopCamera();
      } else if (rawValue === 'CODE A') {
        setStatusMsg('Key Point A is already anchored.');
      } else {
        setStatusMsg(`Invalid key point.`);
      }
    }
  };

  const handleReset = () => {
    setScanState('IDLE');
    setScannedCodes([]);
    setTimeLeft(90);
    setStatusMsg('Point camera at Key Point A barcode');
    startCamera();
  };

  return (
    <div className="space-y-4 flex-grow flex flex-col justify-between font-sans">
      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest font-bold">
            ANOMALY #8529 // AGENT SIGNET
          </span>
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Worldline Interface</h1>

        {/* Live Camera Scanner Viewfinder */}
        <div className="relative w-full aspect-square bg-zinc-950 rounded-2xl border-2 border-zinc-800 overflow-hidden flex flex-col items-center justify-center my-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />

          {/* Scanner Reticle Overlay */}
          <div className="relative z-10 w-48 h-48 border-2 border-cyan-500/60 rounded-xl flex items-center justify-center">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 -mt-0.5 -ml-0.5"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 -mt-0.5 -mr-0.5"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 -mb-0.5 -ml-0.5"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 -mb-0.5 -mr-0.5"></div>
            <div className="w-full h-0.5 bg-cyan-400/80 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
          </div>

          {cameraError && (
            <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-4 text-center z-20">
              <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-xs text-zinc-300 font-mono">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Live Status Banner */}
        <div className="inset-x-3 bg-zinc-950/90 border border-zinc-800 backdrop-blur p-2.5 rounded-xl text-[11px] text-center text-zinc-200 font-mono leading-snug z-20 shadow-lg">
          {statusMsg === "timer" ? <>
            <Clock className={`w-3.5 h-3.5 ${scanState === 'WAITING_2' ? 'text-amber-400 animate-spin' : 'text-zinc-500'}`} />
            <span className={timeLeft < 20 ? 'text-red-400 font-bold animate-pulse' : 'text-zinc-200'}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </> : statusMsg}
        </div>

        {/* Anchor Progress Indicators */}
        <div className="grid grid-cols-2 gap-2 my-2">
          <div className={`p-2.5 rounded-lg border text-center text-[11px] font-mono flex items-center justify-center gap-1.5 transition ${scannedCodes.includes('CODE A') ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Key Point A
          </div>
          <div className={`p-2.5 rounded-lg border text-center text-[11px] font-mono flex items-center justify-center gap-1.5 transition ${scannedCodes.includes('CODE B') ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Key Point B
          </div>
        </div>
      </div>

      {/* Testing Triggers / Reset Controls */}
      {scanState === 'EXPIRED' && (
        <div className="space-y-2">
          <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wide text-center">Manual Testing Overrides</div>
            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-red-900/40 hover:bg-red-800/60 border border-red-700 text-red-200 text-xs font-bold rounded-lg flex items-center justify-center gap-2 font-mono transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-anchor Worldline
            </button>
        </div>
      )}
    </div>
  );
}

/* ================= PAGE 5: CLUE & TAVERN JOURNAL ================= */
function Page5() {
    return (
      <div className="p-4 space-y-3 leading-relaxed">
        <div className="text-[11px] text-zinc-500 border-b border-zinc-900 pb-1 flex justify-between">
          <span>Note for Barman</span>
        </div>
        <p style={{ textAlign: "justify", fontFamily: "math" }}>
          My dear friend, I must leave now. They want to make me king, and this is not something I want. I'm afraid I haven't the time to say proper goodbye.
          <br/>
          You must take over The King of Spades. I believe the club will be much better in your hands anyways. I leave you <a href='#logbook' className="text-cyan-400 underline font-semibold hover:text-cyan-300">the ledger</a> with all past bets and games.
          <br/>
          If someone tries to find me, tell them I'm happy. If you want to find me, use the ledger. Though I am out of town by now, I will leave you a note in the specified location.
        </p>
      </div>
    );
}

/* ================= PAGE 6: HARD-TO-FIND DENSE LEDGER ================= */
function Page6() {
  const [query, setQuery] = useState('');

  const ledgerEntries = [
    { id: 'TX-0001', date: '01-09-26', patron: 'A. Vance', table: 'TB-01', bet: '$1,200', note: 'Cleared in cash' },
    { id: 'TX-0002', date: '01-09-26', patron: 'H. Kowalski', table: 'TB-03', bet: '$850', note: 'Marker opened' },
    { id: 'TX-0003', date: '01-09-26', patron: 'M. Sterling', table: 'TB-02', bet: '$3,400', note: 'Wire pending' },
    { id: 'TX-0004', date: '01-09-26', patron: 'Unknown', table: 'TB-05', bet: '$500', note: 'Cash payment' },
    { id: 'TX-0005', date: '02-09-26', patron: 'E. Thorne', table: 'TB-01', bet: '$12,500', note: 'VIP Lounge credit' },
    { id: 'TX-0006', date: '02-09-26', patron: 'R. Chen', table: 'TB-04', bet: '$2,100', note: 'Settled' },
    { id: 'TX-0007', date: '02-09-26', patron: 'D. Blackwood', table: 'TB-08', bet: '$15,000', note: 'Collateral held' },
    { id: 'TX-0008', date: '03-09-26', patron: 'J. Mercer', table: 'TB-02', bet: '$4,200', note: 'Marker extended' },
    { id: 'TX-0009', date: '03-09-26', patron: 'L. Moreau', table: 'TB-06', bet: '$800', note: 'Cleared' },
    { id: 'TX-0010', date: '03-09-26', patron: 'S. O\'Connor', table: 'TB-01', bet: '$6,700', note: 'Paid in cash' },
    { id: 'TX-0011', date: '04-09-26', patron: 'V. Petrov', table: 'TB-07', bet: '$9,100', note: 'Pending audit' },
    { id: 'TX-0012', date: '04-09-26', patron: 'C. Hayes', table: 'TB-03', bet: '$1,500', note: 'IOU signed' },
    { id: 'TX-0013', date: '04-09-26', patron: 'B. Gallagher', table: 'TB-05', bet: '$22,000', note: 'High stakes room' },
    { id: 'TX-0014', date: '05-09-26', patron: 'F. Rossi', table: 'TB-09', bet: '$3,800', note: 'Cleared' },
    { id: 'TX-0015', date: '05-09-26', patron: 'G. Sinclair', table: 'TB-02', bet: '$11,000', note: 'Secured marker' },
    { id: 'TX-0016', date: '05-09-26', patron: 'K. Tanaka', table: 'TB-10', bet: '$750', note: 'Cash' },
    { id: 'TX-0017', date: '06-09-26', patron: 'N. Webb', table: 'TB-01', bet: '$5,400', note: 'Partial payment' },
    { id: 'TX-0018', date: '06-09-26', patron: 'P. Adler', table: 'TB-04', bet: '$18,500', note: 'VIP lounge' },
    { id: 'TX-0019', date: '06-09-26', patron: 'T. Fletcher', table: 'TB-06', bet: '$2,900', note: 'Settled' },
    { id: 'TX-0020', date: '07-09-26', patron: 'W. Bishop', table: 'TB-11', bet: '$400', note: 'Void' },
    { id: 'TX-0021', date: '07-09-26', patron: 'A. Rostov', table: 'TB-03', bet: '$14,200', note: 'Marker cleared' },
    { id: 'TX-0022', date: '07-09-26', patron: 'C. DuPont', table: 'TB-08', bet: '$8,900', note: 'Wire transfer' },
    { id: 'TX-0023', date: '08-09-26', patron: 'E. Cross', table: 'TB-02', bet: '$600', note: 'Cleared' },
    { id: 'TX-0024', date: '08-09-26', patron: 'I. Novikov', table: 'TB-05', bet: '$31,000', note: 'Private room' },
    { id: 'TX-0025', date: '08-09-26', patron: 'L. Fontaine', table: 'TB-01', bet: '$4,800', note: 'Pending' },
    { id: 'TX-0027', date: '09-09-26', patron: 'O. Lindqvist', table: 'TB-04', bet: '$9,500', note: 'Marker extended' },
    { id: 'TX-0028', date: '09-09-26', patron: 'R. Drake', table: 'TB-09', bet: '$16,000', note: 'Jewelry held' },
    { id: 'TX-0029', date: '10-09-26', patron: 'S. Nakamura', table: 'TB-03', bet: '$2,300', note: 'Settled' },
    { id: 'TX-0030', date: '10-09-26', patron: 'U. Weiss', table: 'TB-12', bet: '$5,000', note: 'Cleared' },
    { id: 'TX-0031', date: '10-09-26', patron: 'V. Quinn', table: 'TB-01', bet: '$8,200', note: 'Paid in cash' },
    { id: 'TX-0032', date: '11-09-26', patron: 'Y. Ivanov', table: 'TB-06', bet: '$1,900', note: 'IOU signed' },
    { id: 'TX-0033', date: '11-09-26', patron: 'Z. Al-Mansoor', table: 'TB-05', bet: '$45,000', note: 'High roller lounge' },
    { id: 'TX-0034', date: '11-09-26', patron: 'B. Carlisle', table: 'TB-02', bet: '$3,300', note: 'Settled' },
    { id: 'TX-0035', date: '12-09-26', patron: 'D. Marsh', table: 'TB-08', bet: '$7,100', note: 'Marker cleared' },
    { id: 'TX-0036', date: '12-09-26', patron: 'F. Gallagher', table: 'TB-10', bet: '$950', note: 'Cleared' },
    { id: 'TX-0037', date: '12-09-26', patron: 'H. Thorne', table: 'TB-04', bet: '$13,400', note: 'Pending' },
    { id: 'TX-0038', date: '13-09-26', patron: 'J. Volkov', table: 'TB-01', bet: '$2,800', note: 'Cash' },
    { id: 'TX-0039', date: '13-09-26', patron: 'K. Mercer', table: 'TB-03', bet: '$6,200', note: 'Paid in cash' },
    { id: 'TX-0040', date: '13-09-26', patron: 'M. O\'Brian', table: 'TB-07', bet: '$21,000', note: 'Secured marker' },
    { id: 'TX-0041', date: '14-09-26', patron: 'N. Santos', table: 'TB-09', bet: '$4,100', note: 'Settled' },
    { id: 'TX-0042', date: '14-09-26', patron: 'P. Zhang', table: 'TB-02', bet: '$1,700', note: 'Cleared' },
    { id: 'TX-0043', date: '14-09-26', patron: 'R. Kowalski', table: 'TB-05', bet: '$8,800', note: 'Wire transfer' },
    { id: 'TX-0044', date: '15-09-26', patron: 'T. Vance', table: 'TB-11', bet: '$10,500', note: 'VIP Suite' },
    { id: 'TX-0045', date: '15-09-26', patron: 'V. Dubois', table: 'TB-06', bet: '$300', note: 'Void' },
    { id: 'TX-0046', date: '15-09-26', patron: 'W. Sterling', table: 'TB-08', bet: '$5,900', note: 'Marker extended' },
    { id: 'TX-0047', date: '16-09-26', patron: 'A. Blackwood', table: 'TB-03', bet: '$17,200', note: 'Collateral held' },
    { id: 'TX-0048', date: '16-09-26', patron: 'C. Lindqvist', table: 'TB-01', bet: '$2,400', note: 'Cleared' },
    { id: 'TX-0049', date: '16-09-26', patron: 'E. Petrov', table: 'TB-04', bet: '$900', note: 'Cash' },
    { id: 'TX-0050', date: '17-09-26', patron: 'G. Hayes', table: 'TB-10', bet: '$6,300', note: 'Paid in cash' },
    { id: 'TX-0051', date: '17-09-26', patron: 'I. Adler', table: 'TB-02', bet: '$14,000', note: 'High roller lounge' },
    { id: 'TX-0052', date: '17-09-26', patron: 'K. Fontaine', table: 'TB-07', bet: '$3,600', note: 'Settled' },
    { id: 'TX-0053', date: '18-09-26', patron: 'L. Rostov', table: 'TB-05', bet: '$1,250', note: 'Cleared' },
    { id: 'TX-0054', date: '18-09-26', patron: 'N. Chen', table: 'TB-09', bet: '$8,400', note: 'Marker cleared' },
    { id: 'TX-0055', date: '18-09-26', patron: 'P. Drake', table: 'TB-06', bet: '$27,000', note: 'Private room' },
    { id: 'TX-0056', date: '19-09-26', patron: 'R. Al-Mansoor', table: 'TB-01', bet: '$5,100', note: 'Pending' },
    { id: 'TX-0057', date: '19-09-26', patron: 'S. Volkov', table: 'TB-03', bet: '$2,000', note: 'Cash' },
    { id: 'TX-0058', date: '19-09-26', patron: 'U. Mercer', table: 'TB-08', bet: '$11,500', note: 'Secured marker' },
    { id: 'TX-0059', date: '20-09-26', patron: 'W. Novikov', table: 'TB-12', bet: '$4,600', note: 'Settled' },
    { id: 'TX-0060', date: '20-09-26', patron: 'Y. Rossi', table: 'TB-02', bet: '$7,300', note: 'Wire transfer' },
    { id: 'TX-0061', date: '20-09-26', patron: 'A. Thorne', table: 'TB-04', bet: '$1,800', note: 'Cleared' },
    { id: 'TX-0062', date: '21-09-26', patron: 'B. Santos', table: 'TB-07', bet: '$19,500', note: 'VIP lounge' },
    { id: 'TX-0063', date: '21-09-26', patron: 'D. Ivanov', table: 'TB-05', bet: '$650', note: 'Cash' },
    { id: 'TX-0064', date: '21-09-26', patron: 'F. O\'Connor', table: 'TB-10', bet: '$8,100', note: 'Marker extended' },
    { id: 'TX-0065', date: '22-09-26', patron: 'H. Dupont', table: 'TB-01', bet: '$3,900', note: 'Cleared' },
    { id: 'TX-0066', date: '22-09-26', patron: 'J. Adler', table: 'TB-03', bet: '$12,800', note: 'Paid in cash' },
    { id: 'TX-0067', date: '22-09-26', patron: 'L. Kowalski', table: 'TB-06', bet: '$5,500', note: 'Settled' },
    { id: 'TX-0068', date: '23-09-26', patron: 'M. Blackwood', table: 'TB-09', bet: '$34,000', note: 'Watch held as collateral' },
    { id: 'TX-0069', date: '23-09-26', patron: 'N. Petrov', table: 'TB-02', bet: '$2,100', note: 'Cleared' },
    { id: 'TX-0070', date: '23-09-26', patron: 'P. Sterling', table: 'TB-08', bet: '$6,800', note: 'Pending' },
    { id: 'TX-0071', date: '24-09-26', patron: 'R. Vance', table: 'TB-04', bet: '$1,400', note: 'Cash' },
    { id: 'TX-0072', date: '24-09-26', patron: 'T. Chen', table: 'TB-07', bet: '$16,200', note: 'High roller room' },
    { id: 'TX-0073', date: '24-09-26', patron: 'V. Hayes', table: 'TB-11', bet: '$4,000', note: 'Settled' },
    { id: 'TX-0074', date: '25-09-26', patron: 'W. Moreau', table: 'TB-05', bet: '$9,300', note: 'Marker cleared' },
    { id: 'TX-0075', date: '25-09-26', patron: 'A. Sinclair', table: 'TB-01', bet: '$2,700', note: 'Cleared' },
    { id: 'TX-0076', date: '25-09-26', patron: 'C. Drake', table: 'TB-03', bet: '$22,500', note: 'VIP lounge' },
    { id: 'TX-0077', date: '26-09-26', patron: 'E. Volkov', table: 'TB-10', bet: '$850', note: 'Cash' },
    { id: 'TX-0078', date: '26-09-26', patron: 'G. Rostov', table: 'TB-02', bet: '$11,200', note: 'Secured marker' },
    { id: 'TX-0079', date: '26-09-26', patron: 'I. Thorne', table: 'TB-06', bet: '$5,000', note: 'Paid in cash' },
    { id: 'TX-0080', date: '27-09-26', patron: 'K. DuPont', table: 'TB-08', bet: '$3,100', note: 'Settled' },
    { id: 'TX-0081', date: '27-09-26', patron: 'L. Adler', table: 'TB-04', bet: '$15,800', note: 'Wire transfer' },
    { id: 'TX-0082', date: '27-09-26', patron: 'N. Kowalski', table: 'TB-12', bet: '$700', note: 'Cleared' },
    { id: 'TX-0083', date: '28-09-26', patron: 'P. Al-Mansoor', table: 'TB-01', bet: '$41,000', note: 'Private suite' },
    { id: 'TX-0084', date: '28-09-26', patron: 'R. Mercer', table: 'TB-07', bet: '$2,600', note: 'Pending' },
    { id: 'TX-0085', date: '28-09-26', patron: 'S. Petrov', table: 'TB-05', bet: '$8,400', note: 'Marker extended' },
    { id: 'TX-0086', date: '29-09-26', patron: 'U. Hayes', table: 'TB-03', bet: '$1,900', note: 'Cleared' },
    { id: 'TX-0087', date: '29-09-26', patron: 'W. Fontaine', table: 'TB-09', bet: '$13,100', note: 'Paid in cash' },
    { id: 'TX-0026', date: '29-09-26', patron: 'Y. Blackwood', table: 'TB-02', bet: '$6,400', note: 'Settled' },
    { id: 'TX-0089', date: '30-09-26', patron: 'A. Drake', table: 'TB-06', bet: '$3,700', note: 'Cash' },
    { id: 'TX-0090', date: '30-09-26', patron: 'C. Volkov', table: 'TB-08', bet: '$28,000', note: 'High stakes lounge' },
    { id: 'TX-0091', date: '04-10-26', patron: 'V. Petrov', table: 'TB-01', bet: '$4,500', note: 'Standard marker' },
    { id: 'TX-0092', date: '04-10-26', patron: 'E. Chen', table: 'TB-04', bet: '$1,100', note: 'Cleared' },
    { id: 'TX-0093', date: '04-10-26', patron: 'G. Sterling', table: 'TB-07', bet: '$9,800', note: 'Marker cleared' },
    { id: 'TX-0094', date: '05-10-26', patron: 'I. Vance', table: 'TB-02', bet: '$17,500', note: 'Secured marker' },
    { id: 'TX-0095', date: '05-10-26', patron: 'K. O\'Brian', table: 'TB-05', bet: '$2,300', note: 'Paid in cash' },
    { id: 'TX-0096', date: '05-10-26', patron: 'L. Rostov', table: 'TB-10', bet: '$5,600', note: 'Settled' },
    { id: 'TX-0097', date: '06-10-26', patron: 'N. Thorne', table: 'TB-03', bet: '$800', note: 'Cash' },
    { id: 'TX-0098', date: '06-10-26', patron: 'P. Kowalski', table: 'TB-06', bet: '$12,100', note: 'Wire transfer' },
    { id: 'TX-0099', date: '06-10-26', patron: 'R. Adler', table: 'TB-09', bet: '$4,400', note: 'Cleared' },
    { id: 'TX-0100', date: '07-10-26', patron: 'S. DuPont', table: 'TB-01', bet: '$25,000', note: 'VIP lounge' },
    { id: 'TX-0101', date: '07-10-26', patron: 'U. Mercer', table: 'TB-08', bet: '$3,200', note: 'Pending' },
    { id: 'TX-0102', date: '07-10-26', patron: 'W. Santos', table: 'TB-05', bet: '$6,900', note: 'Marker extended' },
    { id: 'TX-0103', date: '08-10-26', patron: 'A. Ivanov', table: 'TB-02', bet: '$1,500', note: 'Cleared' },
    { id: 'TX-0104', date: '04-10-26', patron: 'C. Hayes', table: 'TB-04', bet: '$12,000', note: 'Paid in cash' },
    { id: 'TX-0105', date: '08-10-26', patron: 'E. Drake', table: 'TB-07', bet: '$18,900', note: 'Collateral held' },
    { id: 'TX-0106', date: '08-10-26', patron: 'G. Al-Mansoor', table: 'TB-11', bet: '$52,000', note: 'High roller lounge' },
    { id: 'TX-0107', date: '09-10-26', patron: 'I. Fontaine', table: 'TB-03', bet: '$2,800', note: 'Settled' },
    { id: 'TX-0108', date: '09-10-26', patron: 'K. Blackwood', table: 'TB-06', bet: '$7,400', note: 'Paid in cash' },
    { id: 'TX-0109', date: '09-10-26', patron: 'L. Volkov', table: 'TB-10', bet: '$950', note: 'Cash' },
    { id: 'TX-0110', date: '09-10-26', patron: 'N. Vance', table: 'TB-01', bet: '$14,300', note: 'Marker cleared' },
    { id: 'TX-0221', date: '05-10-26', patron: 'Unknown', table: 'TB-02', bet: '$800', note: 'Void transaction' },
    { id: 'TX-0349', date: '05-10-26', patron: 'L. Thorne', table: 'TB-09', bet: '$50,000', note: 'High roller lounge' },
    { id: 'TX-0512', date: '06-10-26', patron: 'M. Vance', table: 'TB-03', bet: '$3,100', note: 'Cleared' },
    { id: 'TX-0626', date: '07-10-26', patron: 'E. Sterling', table: 'TB-01', bet: '$9,400', note: 'Pending audit' },
    { id: 'TX-0892', date: '08-10-26', patron: 'K. O\'Connor', table: 'TB-07', bet: '$15,000', note: 'Secured marker' },
    
    // ================= TARGET CLUE RECORD =================
    { id: 'TX-1011', date: '09-10-26', patron: 'Prince Reincore', table: 'TB-12', bet: '$100,000', note: 'Frug 28, TLV' },
    // =====================================================

    { id: 'TX-1140', date: '10-10-26', patron: 'R. Fletcher', table: 'TB-05', bet: '$2,200', note: 'Settled' },
    { id: 'TX-1141', date: '10-10-26', patron: 'P. Chen', table: 'TB-08', bet: '$6,100', note: 'Cleared' },
    { id: 'TX-1142', date: '10-10-26', patron: 'S. Kowalski', table: 'TB-02', bet: '$11,800', note: 'Paid in cash' },
    { id: 'TX-1143', date: '11-10-26', patron: 'T. Petrov', table: 'TB-04', bet: '$3,500', note: 'Marker extended' },
    { id: 'TX-1144', date: '11-10-26', patron: 'V. Sterling', table: 'TB-07', bet: '$19,000', note: 'VIP Lounge' },
    { id: 'TX-1145', date: '11-10-26', patron: 'W. Adler', table: 'TB-01', bet: '$700', note: 'Cash' },
    { id: 'TX-1146', date: '12-10-26', patron: 'A. O\'Brian', table: 'TB-06', bet: '$8,900', note: 'Settled' },
    { id: 'TX-1147', date: '12-10-26', patron: 'C. Rostov', table: 'TB-09', bet: '$24,000', note: 'Private room' },
    { id: 'TX-1148', date: '12-10-26', patron: 'E. Mercer', table: 'TB-03', bet: '$2,100', note: 'Cleared' },
    { id: 'TX-1149', date: '13-10-26', patron: 'G. Fontaine', table: 'TB-05', bet: '$13,700', note: 'Secured marker' },
    { id: 'TX-1150', date: '13-10-26', patron: 'I. Blackwood', table: 'TB-11', bet: '$4,200', note: 'Paid in cash' },
    { id: 'TX-1151', date: '13-10-26', patron: 'K. Drake', table: 'TB-08', bet: '$1,600', note: 'Settled' },
    { id: 'TX-1152', date: '14-10-26', patron: 'L. Al-Mansoor', table: 'TB-02', bet: '$38,000', note: 'High roller suite' },
    { id: 'TX-1153', date: '14-10-26', patron: 'N. Volkov', table: 'TB-04', bet: '$5,300', note: 'Pending' },
    { id: 'TX-1154', date: '14-10-26', patron: 'P. Hayes', table: 'TB-10', bet: '$9,100', note: 'Marker cleared' },
    { id: 'TX-1155', date: '15-10-26', patron: 'R. Vance', table: 'TB-01', bet: '$2,900', note: 'Cleared' },
    { id: 'TX-1156', date: '15-10-26', patron: 'S. Thorne', table: 'TB-07', bet: '$16,500', note: 'Wire transfer' },
    { id: 'TX-1157', date: '15-10-26', patron: 'U. Chen', table: 'TB-03', bet: '$850', note: 'Cash' },
    { id: 'TX-1158', date: '16-10-26', patron: 'W. Kowalski', table: 'TB-06', bet: '$10,200', note: 'Settled' },
    { id: 'TX-1159', date: '16-10-26', patron: 'Y. Sterling', table: 'TB-12', bet: '$3,800', note: 'Paid in cash' },
    { id: 'TX-1160', date: '16-10-26', patron: 'A. Petrov', table: 'TB-05', bet: '$7,600', note: 'Marker extended' },
    { id: 'TX-1161', date: '17-10-26', patron: 'C. Adler', table: 'TB-08', bet: '$21,500', note: 'VIP lounge' },
    { id: 'TX-1162', date: '17-10-26', patron: 'E. DuPont', table: 'TB-02', bet: '$1,300', note: 'Cleared' },
    { id: 'TX-1163', date: '17-10-26', patron: 'G. Rostov', table: 'TB-09', bet: '$14,000', note: 'Collateral held' },
    { id: 'TX-1164', date: '18-10-26', patron: 'I. O\'Brian', table: 'TB-04', bet: '$4,700', note: 'Settled' },
    { id: 'TX-1165', date: '18-10-26', patron: 'K. Mercer', table: 'TB-01', bet: '$9,900', note: 'Paid in cash' },
    { id: 'TX-1166', date: '18-10-26', patron: 'L. Fontaine', table: 'TB-07', bet: '$2,400', note: 'Cleared' },
    { id: 'TX-1167', date: '19-10-26', patron: 'N. Blackwood', table: 'TB-10', bet: '$29,000', note: 'High stakes lounge' },
    { id: 'TX-1168', date: '19-10-26', patron: 'P. Drake', table: 'TB-03', bet: '$600', note: 'Cash' },
    { id: 'TX-1169', date: '19-10-26', patron: 'R. Al-Mansoor', table: 'TB-06', bet: '$47,000', note: 'Private room' },
    { id: 'TX-1170', date: '20-10-26', patron: 'S. Volkov', table: 'TB-02', bet: '$3,100', note: 'Pending' },
    { id: 'TX-1171', date: '20-10-26', patron: 'U. Vance', table: 'TB-05', bet: '$8,200', note: 'Marker cleared' },
    { id: 'TX-1172', date: '20-10-26', patron: 'W. Hayes', table: 'TB-08', bet: '$12,600', note: 'Settled' },
    { id: 'TX-1173', date: '21-10-26', patron: 'Y. Thorne', table: 'TB-11', bet: '$1,800', note: 'Cleared' },
    { id: 'TX-1174', date: '21-10-26', patron: 'A. Chen', table: 'TB-01', bet: '$18,100', note: 'Paid in cash' },
    { id: 'TX-1175', date: '21-10-26', patron: 'C. Kowalski', table: 'TB-04', bet: '$5,900', note: 'Marker extended' },
    { id: 'TX-1176', date: '22-10-26', patron: 'E. Sterling', table: 'TB-07', bet: '$2,500', note: 'Settled' },
    { id: 'TX-1177', date: '22-10-26', patron: 'G. Petrov', table: 'TB-03', bet: '$11,400', note: 'Secured marker' },
    { id: 'TX-1178', date: '22-10-26', patron: 'I. Adler', table: 'TB-09', bet: '$7,200', note: 'Cleared' },
    { id: 'TX-1179', date: '23-10-26', patron: 'K. DuPont', table: 'TB-02', bet: '$33,000', note: 'VIP Suite' },
    { id: 'TX-1180', date: '23-10-26', patron: 'L. Rostov', table: 'TB-06', bet: '$900', note: 'Cash' },
    { id: 'TX-1181', date: '23-10-26', patron: 'N. O\'Brian', table: 'TB-10', bet: '$4,300', note: 'Paid in cash' },
    { id: 'TX-1182', date: '24-10-26', patron: 'P. Mercer', table: 'TB-05', bet: '$15,200', note: 'Wire transfer' },
    { id: 'TX-1183', date: '24-10-26', patron: 'R. Fontaine', table: 'TB-08', bet: '$2,700', note: 'Cleared' },
    { id: 'TX-1184', date: '24-10-26', patron: 'S. Blackwood', table: 'TB-01', bet: '$8,600', note: 'Settled' },
    { id: 'TX-1185', date: '25-10-26', patron: 'U. Drake', table: 'TB-04', bet: '$20,000', note: 'High roller lounge' },
    { id: 'TX-1186', date: '25-10-26', patron: 'W. Al-Mansoor', table: 'TB-12', bet: '$62,000', note: 'Private room' },
    { id: 'TX-1187', date: '25-10-26', patron: 'Y. Volkov', table: 'TB-03', bet: '$1,100', note: 'Cash' },
    { id: 'TX-1126', date: '26-10-26', patron: 'A. Vance', table: 'TB-07', bet: '$6,400', note: 'Pending' },
    { id: 'TX-1189', date: '26-10-26', patron: 'C. Hayes', table: 'TB-02', bet: '$13,900', note: 'Paid in cash' },
    { id: 'TX-1190', date: '26-10-26', patron: 'E. Thorne', table: 'TB-06', bet: '$3,200', note: 'Cleared' },
    { id: 'TX-1191', date: '27-10-26', patron: 'G. Chen', table: 'TB-09', bet: '$10,800', note: 'Marker cleared' },
    { id: 'TX-1192', date: '27-10-26', patron: 'I. Kowalski', table: 'TB-01', bet: '$1,700', note: 'Settled' },
    { id: 'TX-1193', date: '27-10-26', patron: 'K. Sterling', table: 'TB-05', bet: '$26,000', note: 'VIP lounge' },
    { id: 'TX-1194', date: '28-10-26', patron: 'L. Petrov', table: 'TB-08', bet: '$4,900', note: 'Cleared' },
    { id: 'TX-1195', date: '28-10-26', patron: 'N. Adler', table: 'TB-03', bet: '$8,100', note: 'Paid in cash' },
    { id: 'TX-1196', date: '28-10-26', patron: 'P. DuPont', table: 'TB-10', bet: '$17,300', note: 'Secured marker' },
    { id: 'TX-1197', date: '29-10-26', patron: 'R. Rostov', table: 'TB-02', bet: '$500', note: 'Cash' },
    { id: 'TX-1198', date: '29-10-26', patron: 'S. O\'Brian', table: 'TB-04', bet: '$11,100', note: 'Wire transfer' },
    { id: 'TX-1199', date: '29-10-26', patron: 'U. Mercer', table: 'TB-07', bet: '$3,600', note: 'Settled' },
    { id: 'TX-1200', date: '29-10-26', patron: 'W. Fontaine', table: 'TB-01', bet: '$14,800', note: 'Marker cleared' },
    { id: 'TX-1299', date: '11-10-26', patron: 'S. Moreau', table: 'TB-08', bet: '$7,800', note: 'Wire transfer' },
    { id: 'TX-1405', date: '12-10-26', patron: 'J. Mercer', table: 'TB-02', bet: '$19,000', note: 'Collateral held' }
  ];

  const filtered = ledgerEntries.filter(
    (e) =>
      e.id.toLowerCase().includes(query.toLowerCase()) ||
      e.patron.toLowerCase().includes(query.toLowerCase()) ||
      e.note.toLowerCase().includes(query.toLowerCase()) ||
      e.table.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-3 font-mono text-xs flex-grow flex flex-col">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">The King of Spades gambling den</span>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">{filtered.length} RECORDS</span>
        </div>
        <h1 className="text-lg font-bold text-white font-sans">Ledger</h1>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search log book entries..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-amber-400 placeholder-zinc-600 focus:outline-none focus:border-amber-600"
        />
      </div>

      <div className="flex-grow border border-zinc-800 bg-zinc-950 rounded-lg overflow-x-auto overflow-y-auto max-w-[80vw]">
        <table className="w-full text-left border-collapse text-[10px] font-mono whitespace-nowrap">
          <thead className="bg-zinc-900 border-b border-zinc-800 sticky top-0 text-zinc-400">
            <tr>
              <th className="p-2 border-r border-zinc-800">REF ID</th>
              <th className="p-2 border-r border-zinc-800">DATE</th>
              <th className="p-2 border-r border-zinc-800">PATRON</th>
              <th className="p-2 border-r border-zinc-800">BET</th>
              <th className="p-2">TRANSACTION MEMO / ADDRESS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {filtered.map((item) => (
              <tr 
                key={item.id} 
                className={`hover:bg-amber-950/20 transition text-zinc-300`}
              >
                <td className="p-2 border-r border-zinc-900 font-bold text-amber-400">{item.id}</td>
                <td className="p-2 border-r border-zinc-900 text-zinc-500">{item.date}</td>
                <td className="p-2 border-r border-zinc-900">{item.patron}</td>
                <td className="p-2 border-r border-zinc-900 text-emerald-400">{item.bet}</td>
                <td className="p-2">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= PAGE 5: CLUE & TAVERN JOURNAL ================= */
function Page7() {
    return (
      <div className="p-4 space-y-3 leading-relaxed">
        <div className="text-[11px] text-zinc-500 border-b border-zinc-900 pb-1 flex justify-between">
          <span>Note for Barman #2</span>
        </div>
        <p style={{ textAlign: "justify", fontFamily: "math" }}>
          I managed it.
          <br/>
          I am in the wind, and they cannot find me where I am.
          <br/>
          Even if they knew, I am deep where they cannot get to me.
          <br/><br/>
          No one from Florin would dare to go to our nation's sworn enemy state.
          <br/><br/>
          Thank you for everything, my friend. May I see you again someday.
        </p>
      </div>
    );
}

function LeafletDarkMap({ lat, lng, zoom, label }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([lat, lng], zoom);

      // Esri World Dark Gray Canvas - 100% Free, No API key needed
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
      }).addTo(map);

      // Custom HTML Pulsing Radar Icon
      const customIcon = L.divIcon({
        className: 'custom-signal-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4">
            <div class="absolute w-8 h-8 rounded-full bg-emerald-500/40 animate-ping"></div>
            <div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg shadow-emerald-500/80 animate-pulse"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([lat, lng], { icon: customIcon }).addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lng], zoom);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, zoom]);

  return (
    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-zinc-800 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {label && (
        <div className="absolute bottom-2 left-2 right-2 z-10 text-center pointer-events-none">
          <span className="inline-block text-[10px] font-mono text-emerald-400 font-bold bg-zinc-950/90 px-2.5 py-1 rounded-md border border-emerald-900/80 shadow-md">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}