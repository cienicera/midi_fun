'use client';
import React, { useRef, useState, useEffect } from 'react';
import { setupRNBO } from '../../lib/rnboHelper';
import './styles/RNBOComponent.css';

const RNBOComponent = () => {
  const contextRef = useRef(null);
  const deviceRef = useRef(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState('keyboard');
  const [parameters, setParameters] = useState([]);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [tempInputValues, setTempInputValues] = useState({});

  const initializeAudio = async () => {
    const WAContext = window.AudioContext || window.webkitAudioContext;
    const context = new WAContext();
    contextRef.current = context;

    const outputNode = context.createGain();
    outputNode.connect(context.destination);

    try {
      await context.resume();
      setAudioInitialized(true);
      const device = await setupRNBO(context, outputNode, {
        patchExportURL: '/export/patch.export.json',
        dependenciesURL: '/export/dependencies.json',
        onParameterChange: handleParameterChange,
        onMessageEvent: handleMessageEvent,
      });
      deviceRef.current = device;

      // Initialize parameters and presets
      if (device) {
        setParameters(device.parameters);
      }
    } catch (err) {
      console.error('Error initializing RNBO:', err);
    }
  };

  const handleParameterChange = (param) => {
    if (!isDraggingSlider) {
      setParameters(prevParams => 
        prevParams.map(p => 
          p.id === param.id ? { ...p, value: param.value } : p
        )
      );
    }
  };

  const handleInputChange = (paramId, value) => {
    // Update temporary value while typing
    setTempInputValues(prev => ({
      ...prev,
      [paramId]: value
    }));
  };

  const handleInputBlur = (param) => {
    // On blur, validate and update the actual value
    const newValue = parseFloat(tempInputValues[param.id]);
    if (!isNaN(newValue)) {
      const clampedValue = Math.min(Math.max(newValue, param.min), param.max);
      handleSliderChange(param.id, clampedValue);
    }
    // Clear temporary value
    setTempInputValues(prev => ({
      ...prev,
      [param.id]: undefined
    }));
  };

  const handleKeyDown = (e, param) => {
    if (e.key === 'Enter') {
      e.target.blur(); // This will trigger the blur handler
    }
  };

  const handleMessageEvent = (ev) => {
    const device = deviceRef.current;
    if (device && device.outports.findIndex(elt => elt.tag === ev.tag) >= 0) {
      setConsoleOutput(`${ev.tag}: ${ev.payload}`);
    }
  };

  const handleSliderChange = (paramId, value) => {
    const device = deviceRef.current;
    if (device) {
      const param = device.parameters.find(p => p.id === paramId);
      if (param) {
        param.value = parseFloat(value);
      }
    }
  };

  const handleMIDINote = (note) => {
    const device = deviceRef.current;
    if (!device) return;

    const midiChannel = 0;
    const midiPort = 0;
    const noteDurationMs = 250;
    const currentTime = device.context.currentTime * 1000;

    const noteOnEvent = new RNBO.MIDIEvent(
      currentTime,
      midiPort,
      [144 + midiChannel, note, 100]
    );
    const noteOffEvent = new RNBO.MIDIEvent(
      currentTime + noteDurationMs,
      midiPort,
      [128 + midiChannel, note, 0]
    );

    device.scheduleEvent(noteOnEvent);
    device.scheduleEvent(noteOffEvent);
  };

  return (
    <div className="rnbo-container">
      {!audioInitialized ? (
        <button className="initialize-button" onClick={initializeAudio}>
          Initialize Audio
        </button>
      ) : (
        <div className="control-panel">
          <h1 className="patcher-title">Midi Fun Patcher</h1>
          
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'keyboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('keyboard')}
            >
              Keyboard
            </button>
            <button 
              className={`tab ${activeTab === 'parameters' ? 'active' : ''}`}
              onClick={() => setActiveTab('parameters')}
            >
              Parameters
            </button>
            <button 
              className={`tab ${activeTab === 'console' ? 'active' : ''}`}
              onClick={() => setActiveTab('console')}
            >
              Console
            </button>
          </div>

          <div className={`tab-content ${activeTab === 'keyboard' ? 'active' : ''}`}>
            <div className="midi-keyboard">
              {[50, 52, 56, 63, 69].map((note) => (
                <button
                  key={note}
                  className="midi-key"
                  onMouseDown={() => handleMIDINote(note)}
                >
                  {note}
                </button>
              ))}
            </div>
            
            <div className="presets">
              <h2>Presets</h2>
            <select id="preset-select"></select>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'parameters' ? 'active' : ''}`}>
          <div className="parameter-sliders">
        {parameters.map((param) => (
          <div key={param.id} className="parameter-control">
            <label htmlFor={param.id}>{param.name}</label>
            <div className="slider-container">
              <input
                type="range"
                id={param.id}
                min={param.min}
                max={param.max}
                step={(param.max - param.min) / 1000}
                value={param.value}
                onChange={(e) => handleSliderChange(param.id, e.target.value)}
                onMouseDown={() => setIsDraggingSlider(true)}
                onMouseUp={() => setIsDraggingSlider(false)}
                className="w-full"
              />
              <input
                type="number"
                value={
                  tempInputValues[param.id] !== undefined
                    ? tempInputValues[param.id]
                    : parseFloat(param.value).toFixed(1)
                }
                onChange={(e) => handleInputChange(param.id, e.target.value)}
                onBlur={() => handleInputBlur(param)}
                onKeyDown={(e) => handleKeyDown(e, param)}
                className="w-20 text-right px-2 py-1"
              />
            </div>
          </div>
        ))}
      </div>
          </div>

          <div className={`tab-content ${activeTab === 'console' ? 'active' : ''}`}>
            <div className="console-output">
              <pre>{consoleOutput}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RNBOComponent;