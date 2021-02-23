import React, {useRef, useState, useCallback} from 'react';
import Eye, {EyeLateralities} from './components/eye';
import Body from './components/body';
import Counter from './components/counter';
import Banger from './components/banger';
import Cat from './components/cat';
import {
  getRotatingMessage,
  getInitialCounter,
  playBangSound,
  playMeowSound,
  radianBetween
} from './App.utils';
import './App.css';
import './console_art';

// empirical iris dimension
const IRIS_WIDTH = 20; // px
const IRIS_HEIGHT = 12;

const App = () => {
  const [counter, setCounter] = useState(getInitialCounter());
  const [message, setMessage] = useState(getRotatingMessage(counter));
  const [irisStyle, setIrisStyle] = useState<React.CSSProperties | undefined>();
  const [bangerStyle, setBangerStyle] = useState<React.CSSProperties | undefined>();
  const [catStyle, setCatStyle] = useState<React.CSSProperties | undefined>();
  const [catTargetPosition, setCatTargetPosition] = useState<[number, number]>();
  const [showCat, setShowCat] = useState(false);

  const eyesRef = useRef<HTMLDivElement | null>(null);
  const bangerRef = useRef<HTMLDivElement | null>(null);
  const catRef = useRef<HTMLDivElement | null>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    setBangerStyle({
      left: e.pageX - (bangerRef.current?.clientWidth || 0 as number) / 2,
      top: e.pageY - (bangerRef.current?.clientHeight || 0 as number) / 2
    });

    // animate eye movements
    const irisOffsetX = IRIS_WIDTH * ((e.clientX / window.innerWidth) - 0.5);
    const irisOffsetY = IRIS_HEIGHT * ((e.clientY / window.innerHeight) - 0.5);
    setIrisStyle({transform: `translate(${irisOffsetX}px, ${irisOffsetY}px)`});

    if (!catTargetPosition) {
      // note: stop changing position after pooping
      const cursorX = e.pageX - (catRef.current?.clientWidth || 0 as number) / 2;
      const cursorY = e.pageY - (catRef.current?.clientHeight || 0 as number) / 2;
      const cartesianX = cursorX - window.innerWidth / 2;
      const cartesianY = (cursorY - window.innerHeight / 2) * -1;
      const rotation = radianBetween([0, 1], [cartesianX, cartesianY]) * (cartesianX < 0 ? -1 : 1);
      setCatStyle({
        left: cursorX,
        top: cursorY,
        transform: `rotate(${rotation}rad)`
      });
    }
  };

  const onClick = () => {
    if (showCat) {
      if (catTargetPosition) return;

      // shoot poop to the devil
      const eyesRect = eyesRef.current?.getBoundingClientRect();
      const targetLeft = eyesRect?.left || window.innerWidth / 2; // fallback to center
      const targetTop = eyesRect?.top || window.innerHeight / 2;
      setCatTargetPosition([targetLeft, targetTop]);
      playMeowSound();
    } else {
      // update counter. this should trigger animation in the banger component
      const nextCounter = counter + 1;
      setCounter(nextCounter);
      setMessage(getRotatingMessage(nextCounter));
      playBangSound();

      // let the cat poops every third clicks
      setShowCat(nextCounter % 3 === 0);
    }
  };

  const onCatAnimationComplete = () => {
    setShowCat(false);
    setCatTargetPosition(undefined);
  };

  const onCatAnimationFrame = (poopLeft: number, poopTop: number) => {
    // animate eye movements
    const irisOffsetX = IRIS_WIDTH * ((poopLeft / window.innerWidth) - 0.5);
    const irisOffsetY = IRIS_HEIGHT * ((poopTop / window.innerHeight) - 0.5);
    setIrisStyle({transform: `translate(${irisOffsetX}px, ${irisOffsetY}px)`});
  };

  let cursor;
  if (showCat) {
    cursor = (
      <Cat
        onAnimationComplete={onCatAnimationComplete}
        onAnimationFrame={onCatAnimationFrame}
        ref={catRef}
        style={catStyle}
        targetPosition={catTargetPosition}/>
    );
  } else {
    cursor = (
      <Banger
        counter={counter}
        ref={bangerRef}
        style={bangerStyle}/>
    );
  }

  return (
    <div className='App' onMouseMove={onMouseMove} onClick={onClick}>
      <div className='app-background'/>
      <h1 className='message'>{message}</h1>
      <div className='min-aung-hlaing'>
        <div className='min-aung-hlaing-inner'>
          <div className='eyes' ref={eyesRef}>
            <Eye
              laterality={EyeLateralities.LEFT}
              irisStyle={irisStyle}/>
            <Eye
              laterality={EyeLateralities.RIGHT}
              irisStyle={irisStyle}/>
          </div>
          <Body/>
        </div>
      </div>
      {cursor}
      <Counter value={counter}/>
    </div>
  );
}

export default App;
