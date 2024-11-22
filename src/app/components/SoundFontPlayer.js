"use client";
import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Select, HStack } from '@chakra-ui/react';
import Soundfont from 'soundfont-player';

const SoundFontPlayer = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [instrument, setInstrument] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('acoustic_grand_piano');

  // List of available instruments
  // we can add more instruments here
  const instruments = [
    'acoustic_grand_piano',
    'electric_piano_1',
    'saxophone',
    'acoustic_guitar_nylon',
    'violin',
  ];

  useEffect(() => {
    const ac = new AudioContext();
    setAudioContext(ac);
    return () => {
      ac.close();
    };
  }, []);

  const loadInstrument = useCallback(async (instrumentName) => {
    if (audioContext) {
      const loadedInstrument = await Soundfont.instrument(audioContext, instrumentName);
      setInstrument(loadedInstrument);
    }
  }, [audioContext]);

  useEffect(() => {
    if (isPlaying) {
      stopPlaying();
    }
    loadInstrument(selectedInstrument);
  }, [selectedInstrument, loadInstrument]);

  const playNote = () => {
    if (instrument) {
      setIsPlaying(true);
      const note = 'C4';
      if (isLooping) {
        instrument.play(note, 0, { loop: true });
      } else {
        instrument.play(note);
      }
    }
  };

  const stopPlaying = () => {
    if (instrument) {
      setIsPlaying(false);
      instrument.stop();
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (isPlaying) {
      stopPlaying();
      playNote();
    }
  };

  return (
    <Box p={4}>
      <Select
        value={selectedInstrument}
        onChange={(e) => setSelectedInstrument(e.target.value)}
        mb={4}
      >
        {instruments.map((inst) => (
          <option key={inst} value={inst}>
            {inst.replace(/_/g, ' ')}
          </option>
        ))}
      </Select>
      
      <HStack spacing={4}>
        <Button
          onClick={playNote}
          colorScheme="green"
          isDisabled={!instrument || isPlaying}
        >
          Play
        </Button>
        <Button
          onClick={stopPlaying}
          colorScheme="red"
          isDisabled={!instrument || !isPlaying}
        >
          Stop
        </Button>
        <Button
          onClick={toggleLoop}
          colorScheme={isLooping ? "purple" : "gray"}
          isDisabled={!instrument}
        >
          Loop: {isLooping ? "On" : "Off"}
        </Button>
      </HStack>
    </Box>
  );
};

export default SoundFontPlayer; 