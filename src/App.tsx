import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface Item {
  id: number;
  text: string;
}

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [angle, setAngle] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddItem = () => {
    if (inputValue.trim() !== '') {
      const newItem: Item = { id: Date.now(), text: inputValue };
      setItems([...items, newItem]);
      setInputValue('');
    }
  };

  const handleDeleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const drawRoulette = (context: CanvasRenderingContext2D, rotationAngle: number) => {
    const radius = 200;
    const centerX = context.canvas.width / 2;
    const centerY = context.canvas.height / 2;
    const angleStep = (2 * Math.PI) / items.length;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    items.forEach((item, index) => {
      const angle = index * angleStep + rotationAngle;
      const nextAngle = (index + 1) * angleStep + rotationAngle;

      context.beginPath();
      context.moveTo(centerX, centerY);
      context.arc(centerX, centerY, radius, angle, nextAngle);
      context.closePath();

      // Color alternativo para cada sección
      context.fillStyle = index % 2 === 0 ? '#FFD700' : '#FF6347';
      context.fill();
      context.stroke();

      // Posicionar el texto
      const textAngle = angle + angleStep / 2;
      const textX = centerX + (radius / 1.5) * Math.cos(textAngle);
      const textY = centerY + (radius / 1.5) * Math.sin(textAngle);
      context.fillStyle = 'black';
      context.font = '14px Arial';
      context.fillText(item.text, textX - context.measureText(item.text).width / 2, textY);
    });
  };

  const spinRoulette = () => {
    if (items.length === 0) return;

    setIsSpinning(true);
    setSelectedItem(null);
    let spinAngle = 0;
    const spinDuration = 4000;
    const spinInterval = 10;
    const maxSpeed = 0.02;
    const easingOut = (t: number) => (--t) * t * t + 1;

    const spinStart = Date.now();

    const spin = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - spinStart;
      if (elapsed < spinDuration) {
        const progress = elapsed / spinDuration;
        const easedProgress = easingOut(progress);
        spinAngle = easedProgress * (2 * Math.PI * 5 + Math.random() * 2 * Math.PI); // 5 vueltas completas más un ángulo aleatorio
        setAngle(spinAngle);
        requestAnimationFrame(spin);
      } else {
        const finalAngle = spinAngle % (2 * Math.PI);
        const selectedIndex = Math.floor((items.length - (finalAngle / (2 * Math.PI)) * items.length) % items.length);
        setSelectedItem(items[selectedIndex]);
        setIsSpinning(false);
      }
    };

    requestAnimationFrame(spin);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        drawRoulette(context, angle);
      }
    }
  }, [items, angle]);

  return (
    <div className="App">
      <h1>Ruleta de Items</h1>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
      />
      <button onClick={handleAddItem}>Guardar</button>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.text}
            <button onClick={() => handleDeleteItem(item.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <canvas ref={canvasRef} width={500} height={500} />
      <button onClick={spinRoulette} disabled={isSpinning}>Girar</button>
      {selectedItem && <h2>Elemento seleccionado: {selectedItem.text}</h2>}
    </div>
  );
};

export default App;
