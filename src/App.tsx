/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Apple, Delete } from 'lucide-react';

type Style = 'ios' | 'android';

export default function App() {
  const [style, setStyle] = useState<Style>('ios');
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const performOperation = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      const newValue = calculate(currentValue, inputValue, operator);
      setPrevValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  }, [display, operator, prevValue]);

  const calculate = (prev: number, next: number, op: string) => {
    switch (op) {
      case '+': return prev + next;
      case '-': return prev - next;
      case '×': return prev * next;
      case '÷': return prev / next;
      default: return next;
    }
  };

  const handleEqual = useCallback(() => {
    const inputValue = parseFloat(display);
    if (operator && prevValue !== null) {
      const newValue = calculate(prevValue, inputValue, operator);
      setDisplay(String(newValue));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  }, [display, operator, prevValue]);

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-4 font-sans">
      {/* Style Toggle */}
      <div className="mb-8 bg-white p-1 rounded-full shadow-sm flex gap-1 border border-zinc-200">
        <button
          onClick={() => setStyle('ios')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${
            style === 'ios' ? 'bg-black text-white' : 'text-zinc-500 hover:bg-zinc-50'
          }`}
        >
          <Apple size={18} />
          <span className="text-sm font-medium">iOS</span>
        </button>
        <button
          onClick={() => setStyle('android')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${
            style === 'android' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:bg-zinc-50'
          }`}
        >
          <Smartphone size={18} />
          <span className="text-sm font-medium">Android</span>
        </button>
      </div>

      <div className="relative w-full max-w-[360px] aspect-[9/19] max-h-[780px]">
        <AnimatePresence mode="wait">
          {style === 'ios' ? (
            <IosCalculator
              key="ios"
              display={display}
              inputDigit={inputDigit}
              inputDot={inputDot}
              clearAll={clearAll}
              toggleSign={toggleSign}
              inputPercent={inputPercent}
              performOperation={performOperation}
              handleEqual={handleEqual}
              activeOperator={operator}
            />
          ) : (
            <AndroidCalculator
              key="android"
              display={display}
              inputDigit={inputDigit}
              inputDot={inputDot}
              clearAll={clearAll}
              toggleSign={toggleSign}
              inputPercent={inputPercent}
              performOperation={performOperation}
              handleEqual={handleEqual}
              activeOperator={operator}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface CalcProps {
  key?: string;
  display: string;
  inputDigit: (d: string) => void;
  inputDot: () => void;
  clearAll: () => void;
  toggleSign: () => void;
  inputPercent: () => void;
  performOperation: (op: string) => void;
  handleEqual: () => void;
  activeOperator: string | null;
}

function IosCalculator({
  display,
  inputDigit,
  inputDot,
  clearAll,
  toggleSign,
  inputPercent,
  performOperation,
  handleEqual,
  activeOperator
}: CalcProps) {
  const btnClass = "w-full aspect-square rounded-full flex items-center justify-center text-2xl font-medium transition-opacity active:opacity-70";
  const grayBtn = "bg-[#a5a5a5] text-black";
  const darkBtn = "bg-[#333333] text-white";
  const orangeBtn = "bg-[#ff9f0a] text-white";
  const activeOrangeBtn = "bg-white text-[#ff9f0a]";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full h-full bg-black rounded-[48px] p-6 flex flex-col shadow-2xl border-[8px] border-zinc-800 overflow-hidden"
    >
      <div className="flex-1 flex flex-col justify-end items-end pb-4 px-2">
        <div className="text-white text-7xl font-light tracking-tight overflow-hidden text-right w-full">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <button onClick={clearAll} className={`${btnClass} ${grayBtn}`}>{display === '0' ? 'AC' : 'C'}</button>
        <button onClick={toggleSign} className={`${btnClass} ${grayBtn}`}>+/-</button>
        <button onClick={inputPercent} className={`${btnClass} ${grayBtn}`}>%</button>
        <button 
          onClick={() => performOperation('÷')} 
          className={`${btnClass} ${activeOperator === '÷' ? activeOrangeBtn : orangeBtn}`}
        >÷</button>

        <button onClick={() => inputDigit('7')} className={`${btnClass} ${darkBtn}`}>7</button>
        <button onClick={() => inputDigit('8')} className={`${btnClass} ${darkBtn}`}>8</button>
        <button onClick={() => inputDigit('9')} className={`${btnClass} ${darkBtn}`}>9</button>
        <button 
          onClick={() => performOperation('×')} 
          className={`${btnClass} ${activeOperator === '×' ? activeOrangeBtn : orangeBtn}`}
        >×</button>

        <button onClick={() => inputDigit('4')} className={`${btnClass} ${darkBtn}`}>4</button>
        <button onClick={() => inputDigit('5')} className={`${btnClass} ${darkBtn}`}>5</button>
        <button onClick={() => inputDigit('6')} className={`${btnClass} ${darkBtn}`}>6</button>
        <button 
          onClick={() => performOperation('-')} 
          className={`${btnClass} ${activeOperator === '-' ? activeOrangeBtn : orangeBtn}`}
        >-</button>

        <button onClick={() => inputDigit('1')} className={`${btnClass} ${darkBtn}`}>1</button>
        <button onClick={() => inputDigit('2')} className={`${btnClass} ${darkBtn}`}>2</button>
        <button onClick={() => inputDigit('3')} className={`${btnClass} ${darkBtn}`}>3</button>
        <button 
          onClick={() => performOperation('+')} 
          className={`${btnClass} ${activeOperator === '+' ? activeOrangeBtn : orangeBtn}`}
        >+</button>

        <button 
          onClick={() => inputDigit('0')} 
          className="col-span-2 bg-[#333333] text-white text-2xl font-medium rounded-full flex items-center pl-8 active:opacity-70 transition-opacity"
        >0</button>
        <button onClick={inputDot} className={`${btnClass} ${darkBtn}`}>.</button>
        <button onClick={handleEqual} className={`${btnClass} ${orangeBtn}`}>=</button>
      </div>
      
      {/* Home Indicator */}
      <div className="mt-8 mb-2 flex justify-center">
        <div className="w-32 h-1.5 bg-white rounded-full opacity-20" />
      </div>
    </motion.div>
  );
}

function AndroidCalculator({
  display,
  inputDigit,
  inputDot,
  clearAll,
  toggleSign,
  inputPercent,
  performOperation,
  handleEqual,
  activeOperator
}: CalcProps) {
  const btnClass = "w-full aspect-square rounded-3xl flex items-center justify-center text-xl font-medium transition-all active:scale-95";
  const opBtn = "bg-[#D3E2FF] text-[#001D49] hover:bg-[#C2D7FF]";
  const numBtn = "bg-[#F7F9FF] text-[#1A1C1E] hover:bg-[#EEF1F8]";
  const actionBtn = "bg-[#005AC1] text-white hover:bg-[#004A9F]";
  const clearBtn = "text-[#BA1A1A] bg-[#FFDAD6] hover:bg-[#FFB4AB]";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full h-full bg-[#FDFBFF] rounded-[32px] p-6 flex flex-col shadow-2xl border-[1px] border-zinc-200 overflow-hidden"
    >
      <div className="flex-1 flex flex-col justify-end items-end pb-8">
        <div className="text-[#44474E] text-xl mb-2 opacity-60">
          {activeOperator ? `${activeOperator}` : ''}
        </div>
        <div className="text-[#1A1C1E] text-6xl font-normal overflow-hidden text-right w-full">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <button onClick={clearAll} className={`${btnClass} ${clearBtn}`}>AC</button>
        <button onClick={toggleSign} className={`${btnClass} ${opBtn}`}>+/-</button>
        <button onClick={inputPercent} className={`${btnClass} ${opBtn}`}>%</button>
        <button onClick={() => performOperation('÷')} className={`${btnClass} ${opBtn}`}>÷</button>

        <button onClick={() => inputDigit('7')} className={`${btnClass} ${numBtn}`}>7</button>
        <button onClick={() => inputDigit('8')} className={`${btnClass} ${numBtn}`}>8</button>
        <button onClick={() => inputDigit('9')} className={`${btnClass} ${numBtn}`}>9</button>
        <button onClick={() => performOperation('×')} className={`${btnClass} ${opBtn}`}>×</button>

        <button onClick={() => inputDigit('4')} className={`${btnClass} ${numBtn}`}>4</button>
        <button onClick={() => inputDigit('5')} className={`${btnClass} ${numBtn}`}>5</button>
        <button onClick={() => inputDigit('6')} className={`${btnClass} ${numBtn}`}>6</button>
        <button onClick={() => performOperation('-')} className={`${btnClass} ${opBtn}`}>-</button>

        <button onClick={() => inputDigit('1')} className={`${btnClass} ${numBtn}`}>1</button>
        <button onClick={() => inputDigit('2')} className={`${btnClass} ${numBtn}`}>2</button>
        <button onClick={() => inputDigit('3')} className={`${btnClass} ${numBtn}`}>3</button>
        <button onClick={() => performOperation('+')} className={`${btnClass} ${opBtn}`}>+</button>

        <button onClick={() => inputDigit('0')} className={`${btnClass} ${numBtn}`}>0</button>
        <button onClick={inputDot} className={`${btnClass} ${numBtn}`}>.</button>
        <button className={`${btnClass} ${numBtn}`}>
          <Delete size={20} className="text-[#44474E]" />
        </button>
        <button onClick={handleEqual} className={`${btnClass} ${actionBtn}`}>=</button>
      </div>

      {/* Navigation Bar */}
      <div className="mt-10 mb-2 flex justify-center gap-12">
        <div className="w-4 h-4 rounded-sm border-2 border-zinc-300" />
        <div className="w-4 h-4 rounded-full border-2 border-zinc-300" />
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-zinc-300 rotate-[-90deg]" />
      </div>
    </motion.div>
  );
}
