import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './components/ui/Card';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { Select } from './components/ui/Select';


const OSIModelSimulator = () => {
  const [devices, setDevices] = useState({
    emisor: null,
    receptor: null
  });
  const [message, setMessage] = useState('');
  const [layers, setLayers] = useState({
    application: '',
    presentation: { encrypted: '', translated: '' },
    session: '',
    transport: '',
    network: '',
    dataLink: '',
    physical: ''
  });
  const [currentLayer, setCurrentLayer] = useState(7);
  const [sending, setSending] = useState(true);

  const SEGMENTATION_LENGTH = 4 * 8; // 4 Bytes

  useEffect(() => {
    // Initialize devices
    const devicesList = [
      new Dispositivo("192.168.1.1", "192.23.12.12", "24-88-90-0-ff-ab", 80, true),
      new Dispositivo("192.168.1.2", "192.36.14.12", "aa-cd-ef-0-aa-54", 50, true),
      new Dispositivo("192.168.1.3", "192.23.12.12", "25-48-b0-0-ff-ab", 80, true),
      new Dispositivo("192.168.1.4", "192.24.16.11", "32-a8-9f-0-ff-56", 50, false)
    ];
    setDevices(prevDevices => ({
      ...prevDevices,
      emisor: devicesList[0],
      receptor: devicesList[1]
    }));
  }, []);

  class Dispositivo {
    constructor(ipPrivada, ipPublica, mac, anchoBanda, conectado) {
      this.ipPrivada = ipPrivada;
      this.ipPublica = ipPublica;
      this.mac = mac;
      this.anchoBanda = anchoBanda;
      this.conectado = conectado;
    }
  }

  const handleDeviceChange = (role, deviceIndex) => {
    const devicesList = [
      new Dispositivo("192.168.1.1", "192.23.12.12", "24-88-90-0-ff-ab", 80, true),
      new Dispositivo("192.168.1.2", "192.36.14.12", "aa-cd-ef-0-aa-54", 50, true),
      new Dispositivo("192.168.1.3", "192.23.12.12", "25-48-b0-0-ff-ab", 80, true),
      new Dispositivo("192.168.1.4", "192.24.16.11", "32-a8-9f-0-ff-56", 50, false)
    ];
    setDevices(prev => ({ ...prev, [role]: devicesList[deviceIndex] }));
  };

  const processLayer = (layerId) => {
    let processedMessage = message;
    switch (layerId) {
      case 7: // Application
        setLayers(prev => ({ ...prev, application: processedMessage }));
        break;
      case 6: // Presentation
        const encrypted = btoa(processedMessage);
        const translated = textToBinary(processedMessage);
        setLayers(prev => ({ ...prev, presentation: { encrypted, translated } }));
        processedMessage = translated;
        break;
      case 5: // Session
        processedMessage = `SESSION_ID:${Math.random().toString(36).substring(7)}|${processedMessage}`;
        setLayers(prev => ({ ...prev, session: processedMessage }));
        break;
      case 4: // Transport
        processedMessage = segmentMessage(processedMessage);
        setLayers(prev => ({ ...prev, transport: processedMessage }));
        break;
      case 3: // Network
        processedMessage = addIPHeaders(processedMessage);
        setLayers(prev => ({ ...prev, network: processedMessage }));
        break;
      case 2: // Data Link
        processedMessage = addMACHeaders(processedMessage);
        setLayers(prev => ({ ...prev, dataLink: processedMessage }));
        break;
      case 1: // Physical
        processedMessage = processedMessage.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
        setLayers(prev => ({ ...prev, physical: processedMessage }));
        break;
      default:
        break;
    }
    setCurrentLayer(layerId - 1);
  };

  const textToBinary = (text) => {
    return text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
  };

  const binaryToText = (binary) => {
    let text = '';
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.substr(i, 8);
      text += String.fromCharCode(parseInt(byte, 2));
    }
    return text;
  };

  const segmentMessage = (msg) => {
    let segmented = [];
    for (let i = 0; i < msg.length; i += SEGMENTATION_LENGTH) {
      segmented.push(msg.substr(i, SEGMENTATION_LENGTH));
    }
    return segmented.join('|');
  };

  const addIPHeaders = (msg) => {
    return `IP_SRC:${devices.emisor.ipPublica},IP_DST:${devices.receptor.ipPublica}|${msg}`;
  };

  const addMACHeaders = (msg) => {
    return `MAC_SRC:${devices.emisor.mac},MAC_DST:${devices.receptor.mac}|${msg}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentLayer(7);
    setSending(true);
    processLayer(7);
  };

  const simulateTransmission = () => {
    setSending(false);
    setCurrentLayer(1);
    // Logic for simulating transmission would go here
  };

  const deprocessLayer = (layerId) => {
    let processedMessage = layers.physical;
    switch (layerId) {
      case 1: // Physical to Data Link
        processedMessage = binaryToText(processedMessage);
        setLayers(prev => ({ ...prev, dataLink: processedMessage }));
        break;
      case 2: // Data Link to Network
        processedMessage = removeMACHeaders(processedMessage);
        setLayers(prev => ({ ...prev, network: processedMessage }));
        break;
      case 3: // Network to Transport
        processedMessage = removeIPHeaders(processedMessage);
        setLayers(prev => ({ ...prev, transport: processedMessage }));
        break;
      case 4: // Transport to Session
        processedMessage = desegmentMessage(processedMessage);
        setLayers(prev => ({ ...prev, session: processedMessage }));
        break;
      case 5: // Session to Presentation
        processedMessage = removeSessionID(processedMessage);
        setLayers(prev => ({ ...prev, presentation: { encrypted: btoa(processedMessage), translated: processedMessage } }));
        break;
      case 6: // Presentation to Application
        processedMessage = atob(layers.presentation.encrypted);
        setLayers(prev => ({ ...prev, application: processedMessage }));
        break;
      default:
        break;
    }
    setCurrentLayer(layerId + 1);
  };

  const removeMACHeaders = (msg) => {
    return msg.split('|')[1];
  };

  const removeIPHeaders = (msg) => {
    return msg.split('|')[1];
  };

  const desegmentMessage = (msg) => {
    return msg.split('|').join('');
  };

  const removeSessionID = (msg) => {
    return msg.split('|')[1];
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-gradient-to-b from-purple-900 to-purple-600 text-white">
      <h1 className="text-2xl font-bold mb-4">OSI Model Simulator</h1>
      
      <Card className="mb-4 bg-purple-800">
        <CardHeader>Devices</CardHeader>
        <CardContent>
          <Select
            value={devices.emisor ? devices.emisor.ipPrivada : ''}
            onChange={(e) => handleDeviceChange('emisor', e.target.value)}
            className="mb-2"
          >
            <option value="">Select Sender</option>
            <option value="0">192.168.1.1</option>
            <option value="1">192.168.1.2</option>
            <option value="2">192.168.1.3</option>
            <option value="3">192.168.1.4</option>
          </Select>
          <Select
            value={devices.receptor ? devices.receptor.ipPrivada : ''}
            onChange={(e) => handleDeviceChange('receptor', e.target.value)}
            className="mb-2"
          >
            <option value="">Select Receiver</option>
            <option value="0">192.168.1.1</option>
            <option value="1">192.168.1.2</option>
            <option value="2">192.168.1.3</option>
            <option value="3">192.168.1.4</option>
          </Select>
          <Button onClick={handleSubmit}>Simulate</Button>
        </CardContent>
      </Card>

      <Card className="mb-4 bg-purple-800">
        <CardHeader>Application Layer</CardHeader>
        <CardContent>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            className="mb-2"
          />
          <Input
            value={layers.application}
            readOnly
            placeholder="Processed message"
            className="mb-2"
          />
          <Button onClick={() => processLayer(7)} disabled={currentLayer !== 7}>Process</Button>
        </CardContent>
      </Card>

      <Card className="mb-4 bg-purple-800">
        <CardHeader>Presentation Layer</CardHeader>
        <CardContent>
          <Input
            value={layers.presentation.encrypted}
            readOnly
            placeholder="Encrypted message"
            className="mb-2"
          />
          <Input
            value={layers.presentation.translated}
            readOnly
            placeholder="Translated message"
            className="mb-2"
          />
          <Button onClick={() => sending ? processLayer(6) : deprocessLayer(6)} disabled={currentLayer !== 6}>
            {sending ? 'Process' : 'Deprocess'}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-4 bg-purple-800">
        <CardHeader>Session Layer</CardHeader>
        <CardContent>
          <Input
            value={layers.session}
            readOnly
            placeholder="Session message"
            className="mb-2"
          />
          <Button onClick={() => sending ? processLayer(5) : deprocessLayer(5)} disabled={currentLayer !== 5}>
            {sending ? 'Process' : 'Deprocess'}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-4 bg-purple-800">
        <CardHeader>Transport Layer</CardHeader>
        <CardContent>
          <Input
            value={layers.transport}
            readOnly
            placeholder="Segmented message"
            className="mb-2"
          />
          <Button onClick={() => sending ? processLayer(4) : deprocessLayer(4)} disabled={currentLayer !== 4}>
            {sending ? 'Process' : 'Deprocess'}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-4 bg-purple-800">
        <CardHeader>Network Layer</CardHeader>
        <CardContent>
          <Input
            value={layers.network}
            readOnly
            placeholder="IP-addressed message"
            className="mb-2"
          />
          <Button onClick={() => sending ? processLayer(3) : deprocessLayer(3)} disabled={currentLayer !== 3}>
            {sending ? 'Process' : 'Deprocess'}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-4 bg-purple-800">
        <CardHeader>Data Link Layer</CardHeader>
        <CardContent>
          <Input
            value={layers.dataLink}
            readOnly
            placeholder="MAC-addressed message"
            className="mb-2"
          />
          <Button onClick={() => sending ? processLayer(2) : deprocessLayer(2)} disabled={currentLayer !== 2}>
            {sending ? 'Process' : 'Deprocess'}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-4 bg-purple-800">
        <CardHeader>Physical Layer</CardHeader>
        <CardContent>
          <Input
            value={layers.physical}
            readOnly
            placeholder="Binary message"
            className="mb-2"
          />
          <Button onClick={() => sending ? processLayer(1) : deprocessLayer(1)} disabled={currentLayer !== 1}>
            {sending ? 'Process' : 'Deprocess'}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-4 bg-purple-700">
        <CardContent>
          <Button onClick={simulateTransmission} disabled={currentLayer !== 1 || !sending}>
            Simulate Transmission
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSIModelSimulator;