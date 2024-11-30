export async function setupRNBO(context, outputNode, options = {}) {
    const patchExportURL = options.patchExportURL || '/export/patch.export.json';
    const dependenciesURL = options.dependenciesURL || 'export/dependencies.json';

    // Create gain node and connect it to audio output if not provided
    if (!outputNode) {
        outputNode = context.createGain();
        outputNode.connect(context.destination);
    }

    // Fetch the exported patcher
    let response, patcher;
    try {
        response = await fetch(patchExportURL);
        patcher = await response.json();

        if (!window.RNBO) {
            await loadRNBOScript(patcher.desc.meta.rnboversion);
        }
    } catch (err) {
        console.error('Error loading patcher:', err);
        handleError(err, response, patchExportURL);
        return;
    }

    // Load dependencies if they exist
    let dependencies = [];
    try {
        const dependenciesResponse = await fetch(dependenciesURL);
        dependencies = await dependenciesResponse.json();
        dependencies = dependencies.map(d => 
            d.file ? { ...d, file: "export/" + d.file } : d
        );
    } catch (e) {
        console.log('No dependencies found or error loading dependencies');
    }

    // Create the RNBO device
    let device;
    try {
        device = await RNBO.createDevice({ context, patcher });
        
        // Load dependencies if any exist
        if (dependencies.length) {
            await device.loadDataBufferDependencies(dependencies);
        }
    } catch (err) {
        console.error('Error creating RNBO device:', err);
        handleError(err);
        return;
    }

    // Connect the device to the audio graph
    device.node.connect(outputNode);

    // Set up UI elements
    updatePatcherTitle(patcher);
    makeSliders(device);
    makeInportForm(device);
    attachOutports(device);
    loadPresets(device, patcher);
    makeMIDIKeyboard(device);

    // Auto-resume audio context on user interaction
    document.body.onclick = () => context.resume();

    return device;
}

export async function loadRNBOScript(version) {
    return new Promise((resolve, reject) => {
        if (/^\d+\.\d+\.\d+-dev$/.test(version)) {
            throw new Error('Exported with a Debug Version! Use a valid RNBO version.');
        }
        const script = document.createElement('script');
        script.src = `https://c74-public.nyc3.digitaloceanspaces.com/rnbo/${encodeURIComponent(version)}/rnbo.min.js`;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load RNBO script version ${version}`));
        document.body.appendChild(script);
    });
}

function makeSliders(device) {
    const pdiv = document.getElementById('rnbo-parameter-sliders');
    if (!pdiv) return;

    const noParamLabel = document.getElementById("no-param-label");
    if (noParamLabel && device.numParameters > 0) {
        pdiv.removeChild(noParamLabel);
    }

    let isDraggingSlider = false;
    let uiElements = {};

    device.parameters.forEach((param) => {
        const sliderContainer = document.createElement('div');
        const label = document.createElement('label');
        const slider = document.createElement('input');
        const text = document.createElement('input');

        // Set up label
        label.setAttribute("name", param.name);
        label.setAttribute("for", param.name);
        label.setAttribute("class", "param-label");
        label.textContent = `${param.name}: `;

        // Set up slider
        slider.type = 'range';
        slider.setAttribute("class", "param-slider");
        slider.setAttribute("id", param.id);
        slider.setAttribute("name", param.name);
        slider.min = param.min;
        slider.max = param.max;
        slider.value = param.value;
        slider.step = param.steps > 1 ? 
            (param.max - param.min) / (param.steps - 1) : 
            (param.max - param.min) / 1000.0;

        // Set up text input
        text.value = param.value.toFixed(1);
        text.type = 'text';

        // Event listeners
        slider.addEventListener('pointerdown', () => isDraggingSlider = true);
        slider.addEventListener('pointerup', () => {
            isDraggingSlider = false;
            slider.value = param.value;
            text.value = param.value.toFixed(1);
        });
        slider.addEventListener('input', () => {
            param.value = parseFloat(slider.value);
        });

        text.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                let newValue = parseFloat(text.value);
                if (!isNaN(newValue)) {
                    newValue = Math.min(Math.max(newValue, param.min), param.max);
                    text.value = newValue;
                    param.value = newValue;
                } else {
                    text.value = param.value;
                }
            }
        });

        uiElements[param.id] = { slider, text };

        sliderContainer.appendChild(label);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(text);
        pdiv.appendChild(sliderContainer);
    });

    // Subscribe to parameter changes
    device.parameterChangeEvent.subscribe(param => {
        if (!isDraggingSlider) {
            uiElements[param.id].slider.value = param.value;
        }
        uiElements[param.id].text.value = param.value.toFixed(1);
    });
}

function makeInportForm(device) {
    const idiv = document.getElementById("rnbo-inports");
    if (!idiv) return;

    const inportForm = document.getElementById("inport-form");
    const inportSelect = document.getElementById("inport-select");
    const inportText = document.getElementById("inport-text");
    
    const inports = device.messages.filter(message => 
        message.type === RNBO.MessagePortType.Inport
    );

    if (inports.length === 0) {
        if (inportForm) idiv.removeChild(inportForm);
        return;
    }

    const noInportsLabel = document.getElementById("no-inports-label");
    if (noInportsLabel) idiv.removeChild(noInportsLabel);

    let inportTag = null;
    
    inports.forEach(inport => {
        const option = document.createElement("option");
        option.innerText = inport.tag;
        inportSelect.appendChild(option);
    });

    inportSelect.onchange = () => inportTag = inportSelect.value;
    inportTag = inportSelect.value;

    inportForm.onsubmit = (ev) => {
        ev.preventDefault();
        const values = inportText.value.split(/\s+/).map(s => parseFloat(s));
        const messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, inportTag, values);
        device.scheduleEvent(messageEvent);
    };
}

function attachOutports(device) {
    const consoleDiv = document.getElementById('rnbo-console');
    const consoleReadout = document.getElementById('rnbo-console-readout');
    if (!consoleDiv || !consoleReadout) return;

    const outports = device.outports;
    if (outports.length < 1) {
        const consoleInnerDiv = document.getElementById("rnbo-console-div");
        if (consoleInnerDiv) consoleDiv.removeChild(consoleInnerDiv);
        return;
    }

    const noOutportsLabel = document.getElementById("no-outports-label");
    if (noOutportsLabel) consoleDiv.removeChild(noOutportsLabel);

    device.messageEvent.subscribe((ev) => {
        if (outports.findIndex(elt => elt.tag === ev.tag) < 0) return;
        console.log(`${ev.tag}: ${ev.payload}`);
        consoleReadout.innerText = `${ev.tag}: ${ev.payload}`;
    });
}

function loadPresets(device, patcher) {
    const presets = patcher.presets || [];
    if (presets.length < 1) return;
  
    const presetSelect = document.getElementById('preset-select');
    presets.forEach((preset, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = preset.name;
      presetSelect.appendChild(option);
    });
  
    presetSelect.addEventListener('change', () => {
      const selectedPreset = presets[presetSelect.value];
      device.setPreset(selectedPreset.preset);
    });
  }

function makeMIDIKeyboard(device) {
    const mdiv = document.getElementById("rnbo-clickable-keyboard");
    if (!mdiv || device.numMIDIInputPorts === 0) return;

    const noMidiLabel = document.getElementById("no-midi-label");
    if (noMidiLabel) mdiv.removeChild(noMidiLabel);

    const midiNotes = [50, 52, 56, 63, 69];
    midiNotes.forEach(note => {
        const key = document.createElement("div");
        const label = document.createElement("p");
        label.textContent = note;
        key.appendChild(label);

        key.addEventListener("pointerdown", () => {
            const midiChannel = 0;
            const midiPort = 0;
            const noteDurationMs = 250;

            const noteOnMessage = [144 + midiChannel, note, 100];
            const noteOffMessage = [128 + midiChannel, note, 0];

            const noteOnEvent = new RNBO.MIDIEvent(
                device.context.currentTime * 1000,
                midiPort,
                noteOnMessage
            );
            const noteOffEvent = new RNBO.MIDIEvent(
                device.context.currentTime * 1000 + noteDurationMs,
                midiPort,
                noteOffMessage
            );

            device.scheduleEvent(noteOnEvent);
            device.scheduleEvent(noteOffEvent);
            key.classList.add("clicked");
        });

        key.addEventListener("pointerup", () => key.classList.remove("clicked"));
        key.style.padding = "10px";
        key.style.border = "1px solid black";
        key.style.margin = "5px";
        key.style.display = "inline-block";

        mdiv.appendChild(key);
    });
}

function updatePatcherTitle(patcher) {
    const titleElement = document.getElementById("patcher-title");
    if (titleElement && patcher.desc && patcher.desc.meta) {
        titleElement.innerText = `${patcher.desc.meta.filename || "Unnamed Patcher"} (v${patcher.desc.meta.rnboversion})`;
    }
}

function handleError(error, response, url) {
    const errorContext = { error };
    
    if (response && (response.status >= 300 || response.status < 200)) {
        errorContext.header = "Couldn't load patcher export bundle";
        errorContext.description = `Check the URL being loaded. Currently trying to load "${url}".`;
    }
    
    if (typeof guardrails === "function") {
        guardrails(errorContext);
    } else {
        throw error;
    }
}