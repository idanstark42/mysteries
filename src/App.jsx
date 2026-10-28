import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, MapPin, Scan, Power, Clock, 
  AlertTriangle, CheckCircle2, RefreshCw, Search, ShieldAlert
} from 'lucide-react';

import L from 'leaflet';

const SIGNAL_CONFIG = {
  lat: 32.07789691777519, // Adjust target latitude
  lng: 34.774121609655985, // Adjust target longitude
  zoom: 15,     // Zoom level (1-18)
  label: "SIGNAL ORIGIN: 32.0853° N, 34.7818° E"
};
const CODE = '1989'

export default function App() {
  const [currentPage, setCurrentPage] = useState('sound');

  // Hash-based routing driven exclusively by QR code scans (#sound to #princelog)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['sound', 'lablog', 'anaomalylog', 'scanner', 'barmanstory', 'logbook', 'princelog'].includes(hash)) {
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
        {currentPage === 'anaomalylog' && <Page3 />}
        {currentPage === 'scanner' && <Page4 />}
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
          Unidentified high-frequency broadcasting system active. Local biological units converging.
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
    <div className="space-y-4 font-mono text-xs text-zinc-300">
      <div className="border-b border-zinc-800 pb-3">
        <span className="text-[10px] text-emerald-400 tracking-wider uppercase font-bold">LABORATORY LOG ARCHIVE</span>
        <h1 className="text-xl font-bold text-white font-sans mt-1">Incident Record #409-B</h1>
      </div>

      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 leading-relaxed">
        <div className="text-[11px] text-zinc-500 border-b border-zinc-900 pb-1 flex justify-between">
          <span>LOG ENTRY: 08:14 AM</span>
          <span>STATION ALPHA</span>
        </div>
        <p>
          <strong className="text-amber-400">System Status:</strong> High-frequency acoustic emitter locked in active loop at 14.2kHz. Interface controls require manual token override.
        </p>
        <p>
          <strong className="text-amber-400">Deactivation Code:</strong> The emergency deactivation phrase was recorded on the technician's coffee receipt during morning shift.
        </p>
        <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg text-amber-200 font-mono text-center my-2">
          COFFEE CODE: <strong className="text-amber-400 text-sm font-bold select-all">BREW-8080</strong>
        </div>
        <p className="text-zinc-400 text-[11px]">
          Note: Proceed to decrypted location letters for secondary gravity field metrics.
        </p>
      </div>
    </div>
  );
}

/* ================= PAGE 3: GRAVITY ANOMALY AGENT ================= */
function Page3() {
  return (
    <div className="space-y-5 flex-grow flex flex-col justify-between">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-950/40 border border-red-800/50 rounded-full text-red-400 text-[10px] font-mono uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> Incident Report // Field Agent Clearance
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Gravity Anomaly Case</h1>
        
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 text-xs text-zinc-300 leading-relaxed">
          <p className="text-amber-400/90 font-medium">
            Agent Operational Briefing:
          </p>
          <p>
            The intercepted encoded letters have been decrypted. Localized gravitational constant fluctuation detected at primary coordinates.
          </p>
          <p>
            The anomaly core has locked into resonance. Standard emergency manual shutdown is disabled. 
          </p>
          <p className="text-zinc-400 border-l-2 border-amber-500 pl-3 italic text-[11px]">
            Protocol Requirement: Access Page 4 and scan two verified barcodes within <strong className="text-amber-300">60 seconds</strong> to undo the anomaly.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= PAGE 4: BARCODE SCANNER & TIMER ================= */
function Page4() {
  const [scanState, setScanState] = useState('IDLE'); // IDLE, WAITING_2, SUCCESS, EXPIRED
  const [timeLeft, setTimeLeft] = useState(60);
  const [scannedCodes, setScannedCodes] = useState([]);
  const [statusMsg, setStatusMsg] = useState('Position target barcode in camera view.');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let timer;
    if (scanState === 'WAITING_2' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && scanState === 'WAITING_2') {
      setScanState('EXPIRED');
      setStatusMsg('SEQUENCE FAILED: 60-second window expired. Reset required.');
      stopCamera();
    }
    return () => clearInterval(timer);
  }, [scanState, timeLeft]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (e) {
      setStatusMsg('Camera feed active or fallback triggers available below.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleSimulatedScan = (codeName) => {
    if (scanState === 'IDLE' || scanState === 'EXPIRED') {
      setScannedCodes([codeName]);
      setScanState('WAITING_2');
      setTimeLeft(60);
      setStatusMsg(`Barcode 1 Accepted [${codeName}]. Scan second barcode before timer ends!`);
      startCamera();
    } else if (scanState === 'WAITING_2') {
      if (scannedCodes.includes(codeName)) {
        setStatusMsg('Error: Duplicate barcode scanned. Scan a different barcode!');
        return;
      }
      setScannedCodes((prev) => [...prev, codeName]);
      setScanState('SUCCESS');
      setStatusMsg('ANOMALY UNDONE! Gravitational field stabilized successfully.');
      stopCamera();
    }
  };

  const handleReset = () => {
    setScanState('IDLE');
    setScannedCodes([]);
    setTimeLeft(60);
    setStatusMsg('Position target barcode in camera view.');
  };

  return (
    <div className="space-y-5 flex-grow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-amber-500 font-mono uppercase tracking-widest font-bold">ANOMALY COUNTERMEASURE</span>
          <div className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            <Clock className={`w-3.5 h-3.5 ${scanState === 'WAITING_2' ? 'text-amber-400 animate-spin' : 'text-zinc-500'}`} />
            <span className={timeLeft < 15 ? 'text-red-400 font-bold animate-pulse' : 'text-zinc-200'}>{timeLeft}s</span>
          </div>
        </div>

        {/* Viewfinder / Camera Feed */}
        <div className="relative w-full aspect-square bg-zinc-950 rounded-2xl border-2 border-zinc-800 overflow-hidden flex flex-col items-center justify-center my-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          
          <div className="relative z-10 w-48 h-48 border-2 border-amber-500/60 rounded-xl flex items-center justify-center">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400 -mt-0.5 -ml-0.5"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400 -mt-0.5 -mr-0.5"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400 -mb-0.5 -ml-0.5"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400 -mb-0.5 -mr-0.5"></div>
            <div className="w-full h-0.5 bg-amber-500/40 animate-pulse"></div>
          </div>

          <div className="absolute bottom-3 inset-x-3 bg-zinc-950/90 border border-zinc-800 backdrop-blur p-2.5 rounded-xl text-[11px] text-center text-zinc-300 font-mono">
            {statusMsg}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 my-2">
          <div className={`p-2.5 rounded-lg border text-center text-xs font-mono flex items-center justify-center gap-1.5 ${scannedCodes[0] ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Barcode 1
          </div>
          <div className={`p-2.5 rounded-lg border text-center text-xs font-mono flex items-center justify-center gap-1.5 ${scannedCodes[1] ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Barcode 2
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wide text-center">Camera / Barcode Trigger Controls</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSimulatedScan('BARCODE-01')}
            disabled={scanState === 'SUCCESS'}
            className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-mono border border-zinc-700 flex items-center justify-center gap-1"
          >
            <Scan className="w-3.5 h-3.5 text-amber-400" /> Scan Barcode 1
          </button>
          <button
            onClick={() => handleSimulatedScan('BARCODE-02')}
            disabled={scanState === 'SUCCESS'}
            className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-mono border border-zinc-700 flex items-center justify-center gap-1"
          >
            <Scan className="w-3.5 h-3.5 text-amber-400" /> Scan Barcode 2
          </button>
        </div>
        
        {scanState === 'EXPIRED' && (
          <button
            onClick={handleReset}
            className="w-full py-2.5 bg-red-900/40 hover:bg-red-800/60 border border-red-700 text-red-200 text-xs font-bold rounded-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Timer
          </button>
        )}
      </div>
    </div>
  );
}

/* ================= PAGE 5: CLUE & TAVERN JOURNAL ================= */
function Page5() {
  return (
    <div className="space-y-4 text-zinc-300 font-sans text-xs">
      <div className="border-b border-zinc-800 pb-2">
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold">LOCATION CLUE // JOURNAL</span>
        <h1 className="text-xl font-bold text-white mt-0.5">The Old Port Tavern</h1>
      </div>

      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 leading-relaxed">
        <p className="italic text-zinc-400 border-l-2 border-amber-500 pl-3">
          "Following the address led to a dimly lit bar. The bartender slid over a worn notebook page."
        </p>
        <p>
          <strong className="text-white">Bartender's Log Entry:</strong> "High-stakes games move through the cellar archive. The ledger records every address involved in the syndicate."
        </p>
        <p className="text-zinc-400 text-[11px]">
          Inspect Page 6 via its QR code at the bar to search the gambling den log book.
        </p>
      </div>
    </div>
  );
}

/* ================= PAGE 6: HARD-TO-FIND DENSE LEDGER ================= */
function Page6() {
  const [query, setQuery] = useState('');

  const ledgerEntries = [
    { id: 'TX-0091', date: '04-12-88', patron: 'V. Petrov', table: 'TB-01', bet: '$4,500', note: 'Standard marker' },
    { id: 'TX-0104', date: '04-12-88', patron: 'C. Hayes', table: 'TB-04', bet: '$12,000', note: 'Paid in cash' },
    { id: 'TX-0221', date: '05-12-88', patron: 'Unknown', table: 'TB-02', bet: '$800', note: 'Void transaction' },
    { id: 'TX-0349', date: '05-12-88', patron: 'L. Thorne', table: 'TB-09', bet: '$50,000', note: 'High roller lounge' },
    { id: 'TX-0512', date: '06-12-88', patron: 'M. Vance', table: 'TB-03', bet: '$3,100', note: 'Cleared' },
    { id: 'TX-0688', date: '07-12-88', patron: 'E. Sterling', table: 'TB-01', bet: '$9,400', note: 'Pending audit' },
    { id: 'TX-0892', date: '08-12-88', patron: "K. O'Connor", table: 'TB-07', bet: '$15,000', note: 'Secured marker' },
    { id: 'TX-1011', date: '09-12-88', patron: 'Dr. Aris (TARGET)', table: 'TB-12', bet: '$100,000', note: 'FINAL QR LOCATION: 442 Blackwood Street' },
    { id: 'TX-1140', date: '10-12-88', patron: 'R. Fletcher', table: 'TB-05', bet: '$2,200', note: 'Settled' },
    { id: 'TX-1299', date: '11-12-88', patron: 'S. Moreau', table: 'TB-08', bet: '$7,800', note: 'Wire transfer' },
    { id: 'TX-1405', date: '12-12-88', patron: 'J. Mercer', table: 'TB-02', bet: '$19,000', note: 'Collateral held' },
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
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">ARCHIVE LEDGER // DENSE RECORD</span>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">{filtered.length} RECORDS</span>
        </div>
        <h1 className="text-lg font-bold text-white font-sans">Gambling Den Log Book</h1>
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

      <div className="flex-grow border border-zinc-800 bg-zinc-950 rounded-lg overflow-x-auto overflow-y-auto max-h-[50vh]">
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
                className={`hover:bg-amber-950/20 transition ${item.id === 'TX-1011' ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-zinc-300'}`}
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

      <p className="text-[10px] text-zinc-500 text-center italic">
        * Search the log book to find the final target address with QR for Page 7.
      </p>
    </div>
  );
}

/* ================= PAGE 7: FINAL RESOLUTION JOURNAL ================= */
function Page7() {
  return (
    <div className="space-y-4 text-xs text-zinc-300 font-sans">
      <div className="border-b border-zinc-800 pb-2">
        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">CASE FILE DECLASSIFIED</span>
        <h1 className="text-xl font-bold text-white mt-1">Final Master Journal</h1>
      </div>

      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 leading-relaxed">
        <p className="text-emerald-400 font-semibold text-sm">
          Everything Explained:
        </p>
        <p>
          1. <strong className="text-white">Mystery 1 (Cat Signal):</strong> The high-frequency 14.2 kHz feline attractor tone was set up to draw stray animals to mask local lab equipment signatures.
        </p>
        <p>
          2. <strong className="text-white">Mystery 2 (Gravity Anomaly):</strong> Intercepted coded letters led to the anomaly grid, which was neutralized by syncing the dual 60-second barcode scan.
        </p>
        <p>
          3. <strong className="text-white">Mystery 3 (Gambling Syndicate):</strong> The tavern clue and dense log book search uncovered 442 Blackwood Street, exposing the mastermind behind all three anomalies.
        </p>
      </div>

      <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-center space-y-1">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
        <div className="text-xs font-bold text-emerald-300">CASE CLOSED // ALL MYSTERIES SOLVED</div>
        <p className="text-[10px] text-emerald-500 font-mono">CONGRATULATIONS, INVESTIGATOR.</p>
      </div>
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