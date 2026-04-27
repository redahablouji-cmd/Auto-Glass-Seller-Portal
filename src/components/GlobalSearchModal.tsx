import React, { useState, useEffect } from 'react';

import { useState } from "react";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchType: 'Vehicle' | 'Manufacturer' | 'PartDetail'; 
  snapshotData: any; 
  onSelectResult: (data: any) => void; 
}

export default function GlobalSearchModal({ isOpen, onClose, searchType, snapshotData, onSelectResult }: GlobalSearchModalProps) {
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [modalState, setModalState] = useState<'idle' | 'loading' | 'results'>('idle');
  const [searchInput, setSearchInput] = useState('');
  const [mockResults, setMockResults] = useState<any[]>([]);

  // --- THE AUTO-FILL MAGIC ---
  useEffect(() => {
    if (isOpen && snapshotData) {
      // 1. Collect all the data the user typed, ignoring empties or "OTHER"
      const queryParts = [
        snapshotData.brand,
        snapshotData.model,
        snapshotData.year,
        snapshotData.manufacturer,
        snapshotData.position,
        snapshotData.bodyType,
        snapshotData.rainSensor,
        snapshotData.camera,
        snapshotData.specialTech === 'None' ? '' : snapshotData.specialTech
      ].filter(part => part && part !== 'OTHER' && part.trim() !== '');

      // 2. Join it together into a clean sentence
      const autoQuery = queryParts.join(' ');
      
      // 3. Drop it directly into the search box!
      setSearchInput(autoQuery);
      setModalState('idle'); // Reset state in case they are opening it a second time
    }
  }, [isOpen, snapshotData]);

  if (!isOpen) return null;

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    
    setModalState('loading');

    // Fake AI Delay (We swap this out in Phase 3!)
    setTimeout(() => {
      setMockResults([
        { id: 1, title: 'Standardized: ' + searchInput.toUpperCase(), code: 'REF-001' },
        { id: 2, title: 'Alternative Match: ' + searchInput, code: 'REF-002' },
        { id: 3, title: 'Broad Match: Check Catalog', code: 'REF-003' },
      ]);
      setModalState('results');
    }, 2500);
  };
// 1. Initialize Gemini (Ensure VITE_GEMINI_API_KEY is in your .env)
 // --- START OF DIRECT API CODE ---
  

  const runAIGlobalSearch = async () => {
    if (!searchInput.trim()) return;

    try {
      // 1. Tell YOUR UI to show the spinning loader
      setModalState('loading'); 

      const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
      
      if (!apiKey) {
        alert("Missing API Key!");
        setModalState('idle'); // <--- CHANGED TO IDLE
        return;
      }

      const prompt = `
        You are an expert Eurocode/ARGIC automotive glass catalog assistant.
        A seller entered this messy phrase: "${searchInput}"

        CRITICAL RULES & GLOSSARY:
        1. "AD" means "Avec Détecteur" (With Rain/Light Sensor). DO NOT change it to "ADAS".
        2. "PB" means "Pare-brise" (Windshield).
        3. "LA" means "Lunette arrière" (Back Glass).
        4. "5P" means "5 Portes" (5 Doors).
        5. "CARRI" usually means "Caméra" (Camera) or "Carré" (Square) depending on context. Correct it appropriately.
        6. Fix obvious spelling errors strictly (e.g., "Laydar" MUST become "Lidar").
        7. Keep technical terms in French if the input implies French (e.g., Pare-brise, Avec Détecteur).

        Fix spelling errors, identify the brand, model, year, manufacturer, position, body type, and tint/technologies.
        Return EXACTLY 3 standardized options based on this data.
        Respond ONLY with a valid JSON array like this:
        [
          {
            "brand": "Clean Brand", "model": "Clean Model", "year": "Clean Year",
            "manufacturer": "Clean Manufacturer", "position": "Clean Position",
            "bodyType": "Clean Body", "tint": "Clean Tint & Tech", "reference": "Clean Reference String"
          }
        ]
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) {
        console.error("API FAILED");
        setModalState('idle'); // <--- CHANGED TO IDLE
        return;
      }

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      
      const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedOptions = JSON.parse(cleanJsonString);

      // 2. Save the AI data
      setMockResults(parsedOptions);

      // 3. Tell YOUR UI to show the results cards
      setModalState('results');

    } catch (error) {
      console.error("Crash Error:", error);
      setModalState('idle'); // <--- CHANGED TO IDLE
    }
  };
  // --- END OF DIRECT API CODE ---
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Global Database Search</h2>
            <p className="text-sm text-slate-500 mt-1">
              {searchType === 'Vehicle' ? 'Triangulating Vehicle Data...' : 'Standardizing Information...'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1">
          
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Review your search criteria:
            </label>
            <div className="flex gap-3">
              <input 
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-medium"
                disabled={modalState === 'loading'}
              />
              <button 
  onClick={runAIGlobalSearch} 
  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
>
  {isSearchingAI ? "Searching..." : "Search"}
</button>
            </div>
          </div>

          {modalState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-indigo-800 font-semibold animate-pulse">Triangulating Global Databases...</p>
            </div>
          )}

          {modalState === 'results' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Select the exact match:</h3>
              {mockResults.map((result: any, index: number) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectResult(result)}
                className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group mb-3"
              >
                <span className="font-semibold text-slate-700 group-hover:text-indigo-700">
                  {/* This maps the exact data the AI sent back */}
                  {result.brand} {result.model} {result.year} {result.manufacturer} {result.position} {result.tint}
                </span>
                <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-xs font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600">
                  REF-00{index + 1}
                </span>
              </button>
            ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}