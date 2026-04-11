/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, ShoppingCart, ArrowRightLeft, Plus, Minus, Upload, ScanLine, Pencil, X, Bell, User, Barcode, LogOut, LayoutDashboard, Boxes, ReceiptText, Settings, HeadphonesIcon, AlertTriangle, ChevronDown, Globe, Trash2, AlertCircle, Clock, History, Image, Download } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Auth from './components/Auth';
import { useLanguage } from './contexts/LanguageContext';
import SearchableSelect from './components/SearchableSelect';

// Initialize Supabase client
const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const isConfigured = url && 
                      key && 
                      url !== 'YOUR_SUPABASE_URL' && 
                      url !== 'mock.supabase.co' && 
                      url.startsWith('http') &&
                      !url.includes('undefined');
  return { url, key, isConfigured };
};

const { url: supabaseUrl, key: supabaseKey, isConfigured: isConfiguredInitial } = getSupabaseConfig();
const supabase = createClient(
  isConfiguredInitial ? supabaseUrl : 'https://mock.supabase.co', 
  isConfiguredInitial ? supabaseKey : 'mock-key'
);

const CAR_CATALOG: Record<string, Record<string, string[]>> = {
  
  "Dacia": {
    "Logan": ["Phase 1 (2004-2008)", "Phase 2 (2008-2012)", "Logan II (2012-2020)", "Logan III (2020-Present)"],
    "Sandero": ["Stepway I (2008-2012)", "Sandero II (2012-2020)", "Sandero III (2020-Present)"],
    "Duster": ["Duster I (2010-2017)", "Duster II (2017-2023)", "Duster III (2024-Present)"],
    "Dokker": ["2012-2021"], "Lodgy": ["2012-2022"], "Jogger": ["2021-Present"], "Spring": ["2021-Present"], "Solenza": ["2003-2005"]
  },
  "Renault": {
    "Twingo": ["Twingo I (1993-2007)", "Twingo II (2007-2014)", "Twingo III (2014-Present)"],
    "Clio": ["Clio II (1998-2005)", "Clio III (2005-2012)", "Clio IV (2012-2019)", "Clio V (2019-Present)"],
    "Megane": ["Megane II (2002-2008)", "Megane III (2008-2016)", "Megane IV (2016-2024)", "Megane E-Tech (2022-Present)"],
    "Kangoo": ["Kangoo I (1997-2007)", "Kangoo II (2007-2021)", "Kangoo III (2021-Present)"],
    "Captur": ["Captur I (2013-2019)", "Captur II (2019-Present)"],
    "Kadjar": ["2015-2022"], "Arkana": ["2021-Present"], "Austral": ["2022-Present"],
    "Espace": ["Espace IV (2002-2014)", "Espace V (2015-2023)", "Espace VI (2023-Present)"],
    "Talisman": ["2015-2022"], "Zoe": ["2012-Present"], "Modus": ["2004-2012"],
    "Express": ["Express Van (2021-Present)"], "Trafic": ["Trafic II (2001-2014)", "Trafic III (2014-Present)"],
    "Master": ["Master II (1997-2010)", "Master III (2010-Present)"]
  },
  "Peugeot": {
    "106": ["1991-2003"], "107": ["2005-2014"], "108": ["2014-2021"],
    "206": ["206 (1998-2012)", "206+ (2009-2013)"], "207": ["2006-2014"],
    "208": ["208 I (2012-2019)", "208 II (2019-Present)"],
    "301": ["301 (2012-Present)"], "307": ["2001-2008"],
    "308": ["308 I (2007-2013)", "308 II (2013-2021)", "308 III (2021-Present)"],
    "406": ["1995-2004"], "407": ["2004-2011"], "408": ["2022-Present"],
    "508": ["508 I (2010-2018)", "508 II (2018-Present)"],
    "2008": ["2008 I (2013-2019)", "2008 II (2019-Present)"],
    "3008": ["3008 I (2008-2016)", "3008 II (2016-2023)", "3008 III (2023-Present)"],
    "5008": ["5008 I (2009-2017)", "5008 II (2017-Present)"],
    "RCZ": ["2010-2015"], "Partner": ["Partner I (1996-2008)", "Partner II (2008-2018)", "Partner III (2018-Present)"],
    "Rifter": ["2018-Present"], "Expert": ["Expert II (2007-2016)", "Expert III (2016-Present)"],
    "Boxer": ["Boxer II (2006-2014)", "Boxer III (2014-Present)"]
  },
  "Citroen": {
    "C1": ["C1 I (2005-2014)", "C1 II (2014-2021)"], "C2": ["2003-2009"],
    "C3": ["C3 I (2002-2009)", "C3 II (2009-2016)", "C3 III (2016-2024)", "C3 IV (2024-Present)"],
    "C3 Aircross": ["2017-Present"],
    "C4": ["C4 I (2004-2010)", "C4 II (2010-2018)", "C4 III (2020-Present)"],
    "C4 Cactus": ["2014-2020"], "C4 Picasso / SpaceTourer": ["2006-2022"],
    "C5": ["C5 I (2001-2008)", "C5 II (2008-2017)", "C5 X (2021-Present)"],
    "C5 Aircross": ["2017-Present"], "C-Elysee": ["2012-Present"],
    "DS3": ["2009-2019"], "DS4": ["2010-2018"], "DS5": ["2011-2018"], "Ami": ["2020-Present"],
    "Berlingo": ["Berlingo I (1996-2008)", "Berlingo II (2008-2018)", "Berlingo III (2018-Present)"],
    "Jumpy": ["Jumpy II (2007-2016)", "Jumpy III (2016-Present)"],
    "Jumper": ["Jumper II (2006-2014)", "Jumper III (2014-Present)"]
  },
  "Volkswagen": {
    "Up!": ["2011-2023"], "Fox": ["2003-2021"],
    "Polo": ["Mk4 (2002-2009)", "Mk5 (2009-2017)", "Mk6 (2017-Present)"],
    "Golf": ["Mk4 (1997-2003)", "Mk5 (2003-2008)", "Mk6 (2008-2012)", "Mk7 (2012-2019)", "Mk8 (2019-Present)"],
    "Beetle": ["New Beetle (1997-2011)", "A5 (2011-2019)"], "Scirocco": ["2008-2017"],
    "Passat": ["B6 (2005-2010)", "B7 (2010-2014)", "B8 (2014-2023)", "B9 (2024-Present)"],
    "Arteon": ["2017-Present"], "Sharan": ["2010-2022"], "Touran": ["2003-2015", "2015-Present"],
    "T-Cross": ["2019-Present"], "T-Roc": ["2017-Present"],
    "Tiguan": ["Tiguan I (2007-2016)", "Tiguan II (2016-2023)", "Tiguan III (2023-Present)"],
    "Touareg": ["Touareg I (2002-2010)", "Touareg II (2010-2018)", "Touareg III (2018-Present)"],
    "ID Series": ["ID.3 (2019-Present)", "ID.4 (2020-Present)", "ID.5 (2021-Present)", "ID.Buzz (2022-Present)"],
    "Caddy": ["Mk3 (2004-2015)", "Mk4 (2015-2020)", "Mk5 (2020-Present)"],
    "Amarok": ["2010-2022", "2023-Present"],
    "Transporter": ["T5 (2003-2015)", "T6 (2015-2019)", "T6.1 (2019-Present)"],
    "Crafter": ["Crafter I (2006-2016)", "Crafter II (2017-Present)"]
  },
  "Audi": {
    "A1": ["8X (2010-2018)", "GB (2018-Present)"], "A2": ["8Z (1999-2005)"],
    "A3": ["8P (2003-2013)", "8V (2012-2020)", "8Y (2020-Present)"],
    "A4": ["B7 (2004-2008)", "B8 (2008-2016)", "B9 (2016-Present)"],
    "A5": ["B8 (2007-2016)", "B9 (2016-Present)"],
    "A6": ["C6 (2004-2011)", "C7 (2011-2018)", "C8 (2018-Present)"],
    "A7": ["4G8 (2010-2018)", "4K8 (2018-Present)"],
    "A8": ["D3 (2002-2009)", "D4 (2009-2017)", "D5 (2017-Present)"],
    "TT": ["8J (2006-2014)", "8S (2014-2023)"], "R8": ["Type 42 (2006-2015)", "Type 4S (2015-2024)"],
    "Q2": ["GA (2016-Present)"], "Q3": ["8U (2011-2018)", "F3 (2018-Present)"],
    "Q4 e-tron": ["2021-Present"], "Q5": ["8R (2008-2017)", "FY (2017-Present)"],
    "Q7": ["4L (2005-2015)", "4M (2015-Present)"], "Q8": ["4M8 (2018-Present)"],
    "e-tron GT": ["2021-Present"]
  },
  "BMW": {
    "1 Series": ["E87 (2004-2011)", "F20 (2011-2019)", "F40 (2019-Present)"],
    "2 Series": ["F22 (2014-2021)", "G42 (2021-Present)", "Active Tourer (2014-Present)"],
    "3 Series": ["E46 (1998-2006)", "E90 (2005-2013)", "F30 (2011-2019)", "G20 (2018-Present)"],
    "4 Series": ["F32 (2013-2020)", "G22 (2020-Present)"],
    "5 Series": ["E60 (2003-2010)", "F10 (2010-2017)", "G30 (2017-2023)", "G60 (2023-Present)"],
    "6 Series": ["E63 (2003-2010)", "F12 (2011-2018)", "G32 (2017-2023)"],
    "7 Series": ["E65 (2001-2008)", "F01 (2008-2015)", "G11 (2015-2022)", "G70 (2022-Present)"],
    "8 Series": ["G15 (2018-Present)"],
    "Z4": ["E85 (2002-2008)", "E89 (2009-2016)", "G29 (2018-Present)"],
    "i Series": ["i3 (2013-2022)", "i4 (2021-Present)", "i8 (2014-2020)", "iX (2021-Present)"],
    "X1": ["E84 (2009-2015)", "F48 (2015-2022)", "U11 (2022-Present)"],
    "X2": ["F39 (2017-2023)", "U10 (2023-Present)"],
    "X3": ["E83 (2003-2010)", "F25 (2010-2017)", "G01 (2017-2024)", "G45 (2024-Present)"],
    "X4": ["F26 (2014-2018)", "G02 (2018-Present)"],
    "X5": ["E53 (1999-2006)", "E70 (2006-2013)", "F15 (2013-2018)", "G05 (2018-Present)"],
    "X6": ["E71 (2008-2014)", "F16 (2014-2019)", "G06 (2019-Present)"],
    "X7": ["G07 (2018-Present)"], "XM": ["G09 (2022-Present)"]
  },
  "Mercedes-Benz": {
    "A-Class": ["W169 (2004-2012)", "W176 (2012-2018)", "W177 (2018-Present)"],
    "B-Class": ["W245 (2005-2011)", "W246 (2011-2018)", "W247 (2018-Present)"],
    "C-Class": ["W203 (2000-2007)", "W204 (2007-2014)", "W205 (2014-2021)", "W206 (2021-Present)"],
    "CLA": ["C117 (2013-2019)", "C118 (2019-Present)"],
    "CLS": ["C219 (2004-2010)", "C218 (2011-2018)", "C257 (2018-2023)"],
    "E-Class": ["W211 (2002-2009)", "W212 (2009-2016)", "W213 (2016-2023)", "W214 (2023-Present)"],
    "S-Class": ["W220 (1998-2005)", "W221 (2006-2013)", "W222 (2014-2020)", "W223 (2020-Present)"],
    "SL / SLC / SLK": ["R171 (2004-2010)", "R172 (2011-2020)", "R231 (2012-2020)", "R232 (2022-Present)"],
    "EQ Series": ["EQA", "EQB", "EQC", "EQE", "EQS"],
    "GLA": ["X156 (2013-2019)", "H247 (2019-Present)"], "GLB": ["X247 (2019-Present)"],
    "GLC": ["X253 (2015-2022)", "X254 (2022-Present)"], "GLE (ML)": ["W164 (2005-2011)", "W166 (2011-2019)", "V167 (2019-Present)"],
    "GLS (GL)": ["X164 (2006-2012)", "X166 (2013-2019)", "X167 (2020-Present)"],
    "G-Class": ["W463 (1990-2018)", "W463A (2018-Present)"],
    "V-Class / Vito": ["W639 (2003-2014)", "W447 (2014-Present)"],
    "Sprinter": ["W903 (1995-2006)", "W906 (2006-2018)", "W907/W910 (2018-Present)"]
  },
  "Porsche": {
    "911": ["996 (1997-2004)", "997 (2004-2012)", "991 (2012-2019)", "992 (2019-Present)"],
    "718 Boxster/Cayman": ["986 (1996-2004)", "987 (2005-2012)", "981 (2012-2016)", "982 (2016-Present)"],
    "Taycan": ["Taycan (2019-Present)"],
    "Panamera": ["970 (2009-2016)", "971 (2016-2023)", "972 (2023-Present)"],
    "Macan": ["95B (2014-2024)", "Macan EV (2024-Present)"],
    "Cayenne": ["9PA (2002-2010)", "92A (2011-2018)", "9YA (2018-Present)"]
  },
  "Toyota": {
    "Aygo": ["AB10 (2005-2014)", "AB40 (2014-2021)", "Aygo X (2021-Present)"],
    "Yaris": ["XP90 (2005-2011)", "XP130 (2011-2020)", "XP210 (2020-Present)"],
    "Corolla": ["E140 (2006-2013)", "E170 (2013-2019)", "E210 (2018-Present)"],
    "Prius": ["XW20 (2003-2009)", "XW30 (2009-2015)", "XW50 (2015-2022)", "XW60 (2022-Present)"],
    "Camry": ["XV40 (2006-2011)", "XV50 (2011-2017)", "XV70 (2017-2024)", "XV80 (2024-Present)"],
    "Supra": ["A90 (2019-Present)"], "GT86 / GR86": ["2012-2021", "2021-Present"],
    "C-HR": ["1st Gen (2016-2023)", "2nd Gen (2023-Present)"],
    "RAV4": ["XA30 (2005-2012)", "XA40 (2012-2018)", "XA50 (2018-Present)"],
    "Land Cruiser": ["Prado J120 (2002-2009)", "Prado J150 (2009-2023)", "Prado J250 (2024-Present)", "LC200 (2007-2021)", "LC300 (2021-Present)"],
    "Hilux": ["N70 (2004-2015)", "AN120 (2015-Present)"],
    "Proace": ["2013-2016", "2016-Present"]
  },
  "Ford": {
    "Ka / Ka+": ["Mk2 (2008-2016)", "Mk3 (2016-2021)"],
    "Fiesta": ["Mk5 (2002-2008)", "Mk6 (2008-2017)", "Mk7 (2017-2023)"],
    "Puma": ["2019-Present"],
    "Focus": ["Mk2 (2004-2011)", "Mk3 (2011-2018)", "Mk4 (2018-Present)"],
    "Mondeo": ["Mk3 (2000-2007)", "Mk4 (2007-2014)", "Mk5 (2014-2022)"],
    "Mustang": ["S197 (2005-2014)", "S550 (2015-2023)", "S650 (2024-Present)"],
    "Mach-E": ["2020-Present"],
    "Kuga": ["Kuga I (2008-2012)", "Kuga II (2012-2019)", "Kuga III (2019-Present)"],
    "Edge": ["2015-2023"], "Explorer": ["2020-Present"],
    "Galaxy / S-Max": ["2006-2015", "2015-2023"],
    "Ranger": ["T6 (2011-2022)", "T6.2 (2022-Present)"],
    "Transit / Tourneo": ["Transit Mk3 (2000-2014)", "Transit Mk4 (2014-Present)", "Transit Custom (2012-Present)"]
  },
  "Skoda": {
    "Citigo": ["2011-2020"], "Fabia": ["Fabia II (2007-2014)", "Fabia III (2014-2021)", "Fabia IV (2021-Present)"],
    "Scala": ["2019-Present"], "Rapid": ["2012-2019"],
    "Octavia": ["Octavia II (2004-2013)", "Octavia III (2013-2020)", "Octavia IV (2020-Present)"],
    "Superb": ["Superb II (2008-2015)", "Superb III (2015-2023)", "Superb IV (2024-Present)"],
    "Kamiq": ["2019-Present"], "Karoq": ["2017-Present"],
    "Kodiaq": ["Kodiaq I (2016-2023)", "Kodiaq II (2024-Present)"],
    "Enyaq": ["2020-Present"]
  },
  "Seat": {
    "Mii": ["2011-2021"], "Ibiza": ["Mk3 (2002-2008)", "Mk4 (2008-2017)", "Mk5 (2017-Present)"],
    "Leon": ["Mk2 (2005-2012)", "Mk3 (2012-2020)", "Mk4 (2020-Present)"],
    "Altea": ["2004-2015"], "Alhambra": ["2010-2020"],
    "Arona": ["2017-Present"], "Ateca": ["2016-Present"], "Tarraco": ["2018-Present"]
  },
  "Opel": {
    "Adam": ["2012-2019"], "Karl": ["2014-2019"],
    "Corsa": ["Corsa D (2006-2014)", "Corsa E (2014-2019)", "Corsa F (2019-Present)"],
    "Astra": ["Astra H (2004-2009)", "Astra J (2009-2015)", "Astra K (2015-2021)", "Astra L (2021-Present)"],
    "Insignia": ["2008-2017", "2017-2022"], "Zafira": ["2005-2014", "2011-2019"],
    "Mokka": ["2012-2019", "2020-Present"], "Crossland": ["2017-Present"],
    "Grandland": ["2017-Present"], "Vivaro": ["2001-2014", "2014-Present"]
  },
  "Fiat": {
    "500": ["500 (2007-Present)", "500X (2014-Present)", "500L (2012-2022)"],
    "Panda": ["Panda II (2003-2012)", "Panda III (2011-Present)"],
    "Punto": ["Punto II (1999-2010)", "Grande Punto (2005-2018)"],
    "Tipo": ["2015-Present"], "Bravo": ["2007-2014"],
    "Doblo": ["Doblo I (2000-2010)", "Doblo II (2010-2022)", "Doblo III (2022-Present)"],
    "Fiorino": ["Fiorino III (2007-Present)"],
    "Ducato": ["Ducato II (1993-2006)", "Ducato III (2006-Present)"]
  },
  "Hyundai": {
    "i10": ["i10 I (2007-2013)", "i10 II (2013-2019)", "i10 III (2019-Present)"],
    "i20": ["i20 I (2008-2014)", "i20 II (2014-2020)", "i20 III (2020-Present)"],
    "i30": ["i30 I (2007-2012)", "i30 II (2012-2017)", "i30 III (2017-Present)"],
    "Accent": ["Accent III (2005-2010)", "Accent IV (2010-2017)", "Accent V (2017-Present)"],
    "Elantra": ["Elantra V (2010-2015)", "Elantra VI (2015-2020)", "Elantra VII (2020-Present)"],
    "Ioniq Series": ["Ioniq (2016-2022)", "Ioniq 5 (2021-Present)", "Ioniq 6 (2022-Present)"],
    "Kona": ["2017-2023", "2024-Present"],
    "Tucson": ["Tucson I (2004-2009)", "Tucson II (2009-2015)", "Tucson III (2015-2020)", "Tucson IV (2020-Present)"],
    "Santa Fe": ["Santa Fe II (2006-2012)", "Santa Fe III (2012-2018)", "Santa Fe IV (2018-2023)", "Santa Fe V (2024-Present)"],
    "Creta": ["Creta I (2014-2019)", "Creta II (2019-Present)"], "Staria": ["2021-Present"]
  },
  "Kia": {
    "Picanto": ["Picanto I (2004-2011)", "Picanto II (2011-2017)", "Picanto III (2017-Present)"],
    "Rio": ["Rio II (2005-2011)", "Rio III (2011-2017)", "Rio IV (2017-2023)"],
    "Ceed": ["Ceed I (2006-2012)", "Ceed II (2012-2018)", "Ceed III (2018-Present)"],
    "Stinger": ["2017-2023"], "EV6 / EV9": ["EV6 (2021-Present)", "EV9 (2023-Present)"],
    "Stonic": ["2017-Present"], "Niro": ["2016-2022", "2022-Present"],
    "Sportage": ["Sportage II (2004-2010)", "Sportage III (2010-2015)", "Sportage IV (2015-2021)", "Sportage V (2021-Present)"],
    "Sorento": ["Sorento II (2009-2014)", "Sorento III (2014-2020)", "Sorento IV (2020-Present)"],
    "Carnival": ["2006-2014", "2015-2021", "2022-Present"]
  },
  "Nissan": {
    "Micra": ["K12 (2002-2010)", "K13 (2010-2017)", "K14 (2017-Present)"],
    "Leaf": ["ZE0 (2010-2017)", "ZE1 (2017-Present)"],
    "Z Models": ["350Z (2002-2008)", "370Z (2009-2020)", "Z (2022-Present)", "GT-R R35 (2007-Present)"],
    "Juke": ["F15 (2010-2019)", "F16 (2019-Present)"],
    "Qashqai": ["J10 (2006-2013)", "J11 (2013-2021)", "J12 (2021-Present)"],
    "X-Trail": ["T30 (2000-2007)", "T31 (2007-2013)", "T32 (2013-2021)", "T33 (2021-Present)"],
    "Pathfinder": ["R51 (2005-2012)", "R52 (2013-2020)"], "Patrol": ["Y61 (1997-2013)", "Y62 (2010-Present)"],
    "Navara": ["D40 (2004-2015)", "D23 (2014-Present)"]
  },
  "Honda": {
    "Jazz / Fit": ["2001-2008", "2008-2013", "2013-2020", "2020-Present"],
    "Civic": ["8th Gen (2006-2011)", "9th Gen (2011-2015)", "10th Gen (2016-2021)", "11th Gen (2022-Present)"],
    "Accord": ["8th Gen (2008-2012)", "9th Gen (2013-2017)", "10th Gen (2018-Present)"],
    "CR-V": ["3rd Gen (2007-2011)", "4th Gen (2012-2016)", "5th Gen (2017-2022)", "6th Gen (2023-Present)"],
    "HR-V": ["2nd Gen (2015-2021)", "3rd Gen (2022-Present)"]
  },
  "Suzuki": {
    "Swift": ["2nd Gen (2004-2010)", "3rd Gen (2010-2017)", "4th Gen (2017-2023)", "5th Gen (2024-Present)"],
    "Vitara": ["3rd Gen (2005-2015)", "4th Gen (2015-Present)"],
    "Jimny": ["3rd Gen (1998-2018)", "4th Gen (2018-Present)"]
  },
  "Mazda": {
    "Mazda2": ["DE (2007-2014)", "DJ (2014-Present)"],
    "Mazda3": ["BL (2008-2013)", "BM/BN (2013-2018)", "BP (2019-Present)"],
    "Mazda6": ["GH (2007-2012)", "GJ/GL (2012-Present)"],
    "MX-5": ["NC (2005-2015)", "ND (2015-Present)"],
    "CX-3": ["2015-Present"], "CX-30": ["2019-Present"],
    "CX-5": ["KE (2012-2017)", "KF (2017-Present)"], "CX-60": ["2022-Present"]
  },
  "Volvo": {
    "C30": ["2006-2013"], "V40": ["2012-2019"], "S60 / V60": ["2010-2018", "2019-Present"],
    "S90 / V90": ["2016-Present"],
    "XC40": ["2017-Present"], "XC60": ["1st Gen (2008-2017)", "2nd Gen (2017-Present)"],
    "XC90": ["1st Gen (2002-2014)", "2nd Gen (2015-Present)"], "EX30 / EX90": ["2023-Present"]
  },
  "Alfa Romeo": {
    "Mito": ["2008-2018"], "147 / 156 / 159": ["1997-2011"],
    "Giulietta": ["2010-2020"], "Giulia": ["2015-Present"],
    "Stelvio": ["2016-Present"], "Tonale": ["2022-Present"]
  },
  "Jeep": {
    "Renegade": ["2014-Present"], "Compass": ["1st Gen (2007-2016)", "2nd Gen (2017-Present)"],
    "Cherokee": ["KL (2014-2023)"],
    "Grand Cherokee": ["WK2 (2011-2021)", "WL (2021-Present)"],
    "Wrangler": ["JK (2007-2018)", "JL (2018-Present)"]
  },
  "Land Rover": {
    "Range Rover Evoque": ["L538 (2011-2018)", "L551 (2018-Present)"],
    "Range Rover Sport": ["L320 (2005-2013)", "L494 (2013-2022)", "L461 (2022-Present)"],
    "Range Rover Velar": ["L560 (2017-Present)"],
    "Discovery": ["L319 (2004-2016)", "L462 (2017-Present)"],
    "Defender": ["Classic (1983-2016)", "L663 (2020-Present)"]
  },
  "BYD": {
    "Atto 3": ["2022-Present"], "Dolphin": ["2023-Present"], "Seal": ["2023-Present"],
    "Han": ["2022-Present"], "Tang": ["2021-Present"]
  },
  "MG": {
    "MG3": ["2011-Present"], "MG4": ["MG4 EV (2022-Present)"],
    "ZS": ["ZS (2017-Present)"], "HS": ["HS (2018-Present)"], "RX5": ["2016-Present"]
  },
  "Chery": {
    "Tiggo 2 Pro": ["2020-Present"], "Tiggo 4 Pro": ["2021-Present"],
    "Tiggo 7 Pro": ["2020-Present"], "Tiggo 8 Pro": ["2021-Present"]
  },
  "Changan": {
    "CS35 Plus": ["2018-Present"], "UNI-T": ["2020-Present"], "UNI-K": ["2020-Present"]
  },
  "Geely": {
    "Coolray": ["2018-Present"], "Azkarra": ["2019-Present"], "Tugella": ["2019-Present"]
  },
  "Mitsubishi": {
    "ASX": ["2010-Present"], "Outlander": ["2006-2012", "2012-2021", "2021-Present"],
    "Pajero": ["2006-2021"],
    "L200": ["Triton Mk4 (2005-2015)", "Triton Mk5 (2015-2023)", "Triton Mk6 (2024-Present)"],
    "Fuso Canter": ["7th Gen (2002-2010)", "8th Gen (2010-Present)"]
  },
  "Isuzu": {
    "D-Max": ["RA/RC (2002-2012)", "RT (2012-2019)", "RG (2019-Present)"],
    "N-Series Truck": ["NKR/NPR (1993-2006)", "N-Series Reward (2006-Present)"]
  },
  "Iveco": {
    "Daily": ["4th Gen (2006-2011)", "5th Gen (2011-2014)", "6th Gen (2014-Present)"],
    "Eurocargo": ["2008-2015", "2015-Present"],
    "Stralis": ["2002-2019"], "S-Way": ["2019-Present"]
  },
  "Volvo Trucks": {
    "FH": ["FH Version 2 (2002-2012)", "FH Version 3/4 (2012-2020)", "FH Version 5 (2020-Present)"],
    "FM": ["FM Version 2 (2001-2013)", "FM Version 3 (2013-2020)", "FM Version 4 (2020-Present)"],
    "FMX": ["FMX 1 (2010-2013)", "FMX 2 (2013-2020)", "FMX 3 (2020-Present)"]
  },
  "Renault Trucks": {
    "Magnum": ["1990-2013"], "Premium": ["1996-2013"],
    "T-Range": ["2013-Present"], "K-Range": ["2013-Present"], "C-Range": ["2013-Present"]
  },
  "Scania": {
    "R-Series": ["PGRT-Series (2004-2016)", "Next Gen R-Series (2016-Present)"],
    "S-Series": ["Next Gen S-Series (2016-Present)"],
    "G-Series": ["PGRT-Series (2007-2016)", "Next Gen G-Series (2017-Present)"]
  },
  "MAN": {
    "TGX": ["1st Gen (2007-2020)", "2nd Gen (2020-Present)"],
    "TGS": ["1st Gen (2007-2020)", "2nd Gen (2020-Present)"],
    "TGL": ["2005-Present"]
  },
  "DAF": {
    "XF": ["XF105 (2005-2013)", "XF Euro 6 (2013-2021)", "New Gen XF (2021-Present)"],
    "CF": ["CF Euro 6 (2013-2021)", "New Gen CF (2021-Present)"]
  },
  "Mercedes-Benz Trucks": {
    "Actros": ["MP2 (2003-2008)", "MP3 (2008-2011)", "MP4 (2011-2018)", "MP5 (2018-Present)"],
    "Arocs": ["2013-Present"],
    "Atego": ["2nd Gen (2004-2013)", "3rd Gen (2013-Present)"]
  }

};

// Mock data aligned with the provided schema
const MOCK_INVENTORY = [
  { inventory_id: '1', master_sku: 'SKU-1001', quantity: 12, unit_price: 1250.00, manufacturer: 'XYG', universal_catalog: { make: 'Toyota', model: 'Corolla', year: '2019-2023' } },
  { inventory_id: '2', master_sku: 'SKU-1002', quantity: 5, unit_price: 850.00, manufacturer: 'Pilkington', universal_catalog: { make: 'Renault', model: 'Clio IV', year: '2012-2019' } },
  { inventory_id: '3', master_sku: 'SKU-1003', quantity: 8, unit_price: 2100.00, manufacturer: 'Saint-Gobain Sekurit', universal_catalog: { make: 'Mercedes-Benz', model: 'C-Class', year: '2014-2021' } },
];

const MANUFACTURERS = ['Saint-Gobain Sekurit', 'Pilkington', 'AGC Automotive', 'XYG', 'Fuyao (FYG)', 'Benson', 'NordGlass', 'Guardian', 'Shatterprufe', 'Other'];
const GLASS_POSITIONS = ['Front Windshield', 'Rear Window', 'Front Left Door', 'Front Right Door', 'Rear Left Door', 'Rear Right Door', 'Quarter Glass', 'Sunroof', 'Other'];

const positionTranslations: Record<string, string> = {
  "Front Windshield": "Pare-brise avant",
  "Rear Window": "Lunette arrière",
  "Front Left Door": "Vitre porte avant gauche",
  "Front Right Door": "Vitre porte avant droite",
  "Rear Left Door": "Vitre porte arrière gauche",
  "Rear Right Door": "Vitre porte arrière droite",
  "Quarter Glass": "Custode",
  "Sunroof": "Toit ouvrant",
  "Other": "Autre"
};

export interface OrderRecord {
  id: string;
  transaction_id: string;
  created_at: string;
  status: string;
  quantity_ordered: number;
  price?: number;
  agreed_price?: number;
  po_file_url?: string;
  reference_code?: string;
  request_photo_url?: string;
  profiles?: {
    business_name: string;
  };
  live_inventory?: {
    make: string;
    model: string;
    year: string;
    position: string;
  };
  [key: string]: any;
}

export interface InventoryItem {
  inventory_id: string;
  master_sku: string;
  quantity: number;
  unit_price: number;
  manufacturer?: string;
  position?: string;
  reference_code?: string;
  universal_catalog?: {
    make?: string;
    model?: string;
    year?: string;
  } | any[];
  [key: string]: any;
}

export default function App() {
  const { lang, setLang, t } = useLanguage();
  const [session, setSession] = useState<any>(null);
  const TEST_SELLER_ID = session?.user?.id || 'a1111111-1111-1111-1111-111111111111';

  const getTranslatedPosition = (pos: string) => {
    switch(pos) {
      case 'Front Windshield': return t.posFrontWindshield;
      case 'Rear Window': return t.posRearWindow;
      case 'Front Left Door': return t.posFrontLeftDoor;
      case 'Front Right Door': return t.posFrontRightDoor;
      case 'Rear Left Door': return t.posRearLeftDoor;
      case 'Rear Right Door': return t.posRearRightDoor;
      case 'Quarter Glass': return t.posQuarterGlass;
      case 'Sunroof': return t.posSunroof;
      case 'Other': return t.posOther;
      default: return pos;
    }
  };

  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Smart Scanner Module State
  const [scanAction, setScanAction] = useState<'add' | 'sold'>('add');
  const [barcode, setBarcode] = useState('');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [isRecognized, setIsRecognized] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customYear, setCustomYear] = useState('');
  
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [customManufacturer, setCustomManufacturer] = useState('');
  
  const [selectedPosition, setSelectedPosition] = useState('');
  const [customPosition, setCustomPosition] = useState('');

  const [barcodeMatches, setBarcodeMatches] = useState<any[]>([]);
  const [isOverridingMatch, setIsOverridingMatch] = useState(false);

  const [quantity, setQuantity] = useState('');
  // --- PHOTO UPLOAD STATES ---
  const [partPhoto, setPartPhoto] = useState<File | null>(null);
  const [partPhotoUrl, setPartPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // --- MAGIC PASTE LISTENER (CTRL+V) ---
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        // Look for an image or PDF being pasted
        if (items[i].type.indexOf('image') !== -1 || items[i].type === 'application/pdf') {
          const file = items[i].getAsFile();
          if (file) {
            setPartPhoto(file);
            setPartPhotoUrl(URL.createObjectURL(file)); // Creates a fast local preview!
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);
  const [price, setPrice] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  // --- NEW: Shorthand Builder State ---
  const [baseGlassType, setBaseGlassType] = useState(''); // Default to Pare-Brise
  const [bodyType, setBodyType] = useState('');
  
  // Conditional State
  const [rainSensor, setRainSensor] = useState('');
  const [camera, setCamera] = useState('');
  const [tint, setTint] = useState('');
  
  // Checkbox State (Technologies)
  const [techHeated, setTechHeated] = useState(false);
  const [techAcoustic, setTechAcoustic] = useState(false);
  const [techAthermic, setTechAthermic] = useState(false);
  const [techHud, setTechHud] = useState(false);
  const [techAntenna, setTechAntenna] = useState(false);
  const [techMolding, setTechMolding] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editCustomBrand, setEditCustomBrand] = useState('');
  const [editCustomModel, setEditCustomModel] = useState('');
  const [editCustomYear, setEditCustomYear] = useState('');
  const [editQuantity, setEditQuantity] = useState('1');
  const [editPrice, setEditPrice] = useState('');
  const [editReferenceCode, setEditReferenceCode] = useState('');
  const [editManufacturer, setEditManufacturer] = useState('');
  const [editCustomManufacturer, setEditCustomManufacturer] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editCustomPosition, setEditCustomPosition] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cancel Order Modal State
  const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  // Profile Dropdown State
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
// 1. Scanner Memory & Nuclear Key
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [scannerResetCounter, setScannerResetCounter] = useState(0);

  // 2. The Master Reset Tool
  const resetSmartScannerForm = (fullWipe: boolean = true) => {
    setIsRecognized(false);
    setIsOverridingMatch(false);
    setBarcodeMatches([]);
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYear('');
    setCustomBrand('');
    setCustomModel('');
    setCustomYear('');
    setSelectedPosition('');
    setSelectedManufacturer('');
    setReferenceCode('');
    setBaseGlassType('');
    setBodyType('');
    setRainSensor('');
    setCamera('');
    setTint('');
    setTechHeated(false);
    setTechAcoustic(false);
    setTechAthermic(false);
    setTechHud(false);
    setTechAntenna(false);
    setTechMolding(false);
    
    if (fullWipe) {
      setLastScannedCode(''); 
      setScannedBarcode('');  // Wipes the text box
      setBarcode('');         // <--- THE FIX: Wipes the USB Scanner's background memory!
      setPrice('');    
      setQuantity('');   
      setPartPhoto(null);
      setPartPhotoUrl(null);    
    }
    
    // Forces React to build a fresh, empty text box
    setScannerResetCounter(prev => prev + 1);
  };
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message === 'Failed to fetch') {
        console.error('Network Error: Failed to fetch. This is likely due to an incorrect Supabase URL or network connectivity issues.');
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  useEffect(() => {
    const { isConfigured: hasConfig } = getSupabaseConfig();
    if (!hasConfig) return;

    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      }).catch(e => console.error("Supabase getSession error:", e));

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    } catch (e) {
      console.error("Supabase auth setup error:", e);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const { isConfigured: hasConfig } = getSupabaseConfig();
      if (!hasConfig) {
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('business_name, role')
            .eq('user_id', user.id)
            .single();
          
          if (!error && data) {
            setUserProfile(data);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setIsProfileLoading(false);
    };
    fetchProfile();
  }, [session]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkConfigAndFetch = async () => {
      const { isConfigured: isValidConfig } = getSupabaseConfig();

      if (isValidConfig) {
        setIsSupabaseConfigured(true);
        if (session) {
          // Initial load
          await fetchSupabaseData(false);
          
          // Start silent polling every 3 seconds
          interval = setInterval(() => {
            fetchSupabaseData(true);
          }, 3000);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkConfigAndFetch();
    
    // Auto-focus scanner on mount
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session]);

  const fetchSupabaseData = async (silent = false) => {
    if (!isSupabaseConfigured || !session) return;
    try {
      if (!silent) setLoading(true);
      // Fetch inventory
      const { data: invData, error: invError } = await supabase
        .from('live_inventory')
        .select(`
          inventory_id, master_sku, quantity, unit_price, manufacturer, position, reference_code,
          universal_catalog (make, model, year)
        `)
        .eq('seller_id', TEST_SELLER_ID)
        .order('inventory_id', { ascending: false });
      
      if (!invError && invData) setInventory(invData as any);

      // Fetch orders manually to bypass failing relational joins
      const { data: rawOrders, error: ordError } = await supabase
        .from('order_ledger')
        .select('*')
        .eq('seller_id', session.user.id)
        .neq('status', 'Archived')
        .order('created_at', { ascending: false });
      
      if (!ordError && rawOrders) {
        const enrichedOrders = await Promise.all(rawOrders.map(async (order) => {
          // Fetch Inventory Details manually with catalog join
          const { data: invDetails } = await supabase
            .from('live_inventory')
            .select('*, universal_catalog(make, model, year)')
            .eq('inventory_id', order.inventory_id)
            .maybeSingle();

          // Flatten catalog details into live_inventory object
          const enrichedInv = invDetails ? {
            ...invDetails,
            make: invDetails.universal_catalog?.make,
            model: invDetails.universal_catalog?.model,
            year: invDetails.universal_catalog?.year
          } : null;

          // Fetch Buyer Details manually
          const { data: buyerDetails } = await supabase
            .from('profiles')
            .select('business_name')
            .eq('user_id', order.buyer_id)
            .maybeSingle();

          return {
            ...order,
            live_inventory: enrichedInv,
            profiles: buyerDetails
          };
        }));
        setOrders(enrichedOrders);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const applyMatch = async (match: any) => {
    const catalog = Array.isArray(match.universal_catalog) ? match.universal_catalog[0] : match.universal_catalog;
    
    const make = catalog.make;
    const model = catalog.model;
    const year = catalog.year;

    if (CAR_CATALOG[make] && CAR_CATALOG[make][model] && CAR_CATALOG[make][model].includes(year)) {
      setSelectedBrand(make);
      setSelectedModel(model);
      setSelectedYear(year);
      setCustomBrand('');
      setCustomModel('');
      setCustomYear('');
    } else {
      setSelectedBrand('OTHER');
      setCustomBrand(make);
      setCustomModel(model);
      setCustomYear(year);
    }
    
    if (match.position) {
      setSelectedPosition(match.position);
    }

    setIsRecognized(true);
    setIsOverridingMatch(false);
    setBarcodeMatches([]);

    if (isSupabaseConfigured && match.master_sku) {
      try {
        const { data, error } = await (supabase as any)
          .from('live_inventory')
          .select('reference_code, manufacturer, unit_price')
          .eq('master_sku', match.master_sku)
          .limit(1)
          .maybeSingle();
        
        if (error) throw error;

        if (data) {
          parseAndFillShorthand((data as any).reference_code || '');
          
          if ((data as any).manufacturer) {
            setSelectedManufacturer((data as any).manufacturer); 
          }

          if ((data as any).unit_price !== null && (data as any).unit_price !== undefined) {
            setPrice(String((data as any).unit_price)); 
          } else {
            setPrice('');
            
          }
          // Auto-fill the photo if it exists!
          if ((data as any).photo_url) {
            setPartPhotoUrl((data as any).photo_url);
          } else {
            setPartPhotoUrl(null);
          }
        } else {
        setPrice('');
        // If no inventory history, use the dictionary's code
        parseAndFillShorthand(match.reference_code || null);
      }
    } catch (err) {
      console.error("Error fetching inventory history:", err);
      setPrice('');
      // Fallback on error
      parseAndFillShorthand(match.reference_code || null);
    }
  } else {
    setPrice('');
    // Fallback if offline
    parseAndFillShorthand(match.reference_code || null);
  }

    quantityInputRef.current?.focus();
  };

const handleOverride = () => {
    setIsRecognized(false);
    setIsOverridingMatch(true);
  };

  const lookupBarcode = async (code: string) => {
    const trimmedCode = code.trim();
    
    if (!trimmedCode) {
      resetSmartScannerForm(true); 
      return; 
    }

    if (trimmedCode === lastScannedCode) {
      setDuplicateWarning(trimmedCode);
      return; 
    }
    
    setLastScannedCode(trimmedCode);

    if (isSupabaseConfigured) {
      const { data: dictData, error: dictError } = await supabase
        .from('barcode_dictionary')
        .select(`
          master_sku,
          position,
          Manufacturer,
          reference_code,
          universal_catalog (make, model, year)
        `)
        .ilike('factory_barcode', trimmedCode);

      if (dictData && dictData.length > 0) {
        if (dictData.length > 1) {
          setBarcodeMatches(dictData);
          setIsRecognized(false);
          setScannedBarcode(trimmedCode);
        } else {
          await applyMatch(dictData[0]);
          setScannedBarcode(trimmedCode);
        }
      } else {
        if (scanAction === 'sold') {
          setScannedBarcode(trimmedCode);
          setIsRecognized(false);
        } else {
          setIsRecognized(false);
          if (scannedBarcode !== trimmedCode) {
            setSelectedBrand('');
            setSelectedModel('');
            setSelectedYear('');
            setCustomBrand('');
            setCustomModel('');
            setCustomYear('');
            setSelectedManufacturer('');
            setCustomManufacturer('');
            setSelectedPosition('');
            setCustomPosition('');
            // ---> TRIGGERS THE WIPE FOR UNKNOWN BARCODES <---
            parseAndFillShorthand(null); 
            setPrice('');
          }
          setScannedBarcode(trimmedCode);
        }
      }
    } else {
      setIsRecognized(false);
      setSelectedBrand('');
      setSelectedModel('');
      setSelectedYear('');
      setScannedBarcode(trimmedCode);
      // ---> TRIGGERS THE WIPE IF OFFLINE <---
      parseAndFillShorthand(null);
      setPrice('');
    }
  };

// Generates the final shorthand string dynamically
  const generateShorthandString = () => {
    // 1. Tech Features Array
    const techFeatures = [
      techHeated ? 'CHAUFF' : '',
      techAcoustic ? 'ACOUST' : '',
      techAthermic ? 'ATHERM' : '',
      techHud ? '+ HUD' : '',
      techAntenna ? '+ ANT' : '',
      techMolding ? '+ JOINT' : ''
    ].filter(Boolean).join(' '); // Filters out empty strings and joins with spaces

    // 2. Determine which conditionals to include based on Glass Type
    const isPB = baseGlassType === 'PB';
    const isSideOrRear = baseGlassType === 'VL' || baseGlassType === 'LA';

    // 3. Build the String Parts according to your format
    const stringParts = [
      baseGlassType,
      isPB ? rainSensor : '',
      isPB ? camera : '',
      (baseGlassType === 'PB' || baseGlassType === 'LA') ? techFeatures : '',
      isSideOrRear ? tint : '',
      selectedBrand, // From your existing state
      selectedModel, // From your existing state
      selectedYear,  // From your existing state
      bodyType
    ];

    // 4. Filter empty items and join with a single space
    return stringParts.filter(Boolean).join(' ');
  };
  // --- SHORTHAND DECODER (AUTOFILL) ---
  // --- SHORTHAND DECODER (AUTOFILL & RESET) ---
  const parseAndFillShorthand = (refString: string | null) => {
    // 1. THE WIPE: If there is no string (new item), wipe the section clean!
    if (!refString) {
      setBaseGlassType('');
      setBodyType('');
      setRainSensor('');
      setCamera('');
      setTint('');
      setTechHeated(false);
      setTechAcoustic(false);
      setTechAthermic(false);
      setTechHud(false);
      setTechAntenna(false);
      setTechMolding(false);
      return;
    }
    
    // 2. Base Glass
    if (refString.includes('PB')) setBaseGlassType('PB');
    else if (refString.includes('LA')) setBaseGlassType('LA');
    else if (refString.includes('VL')) setBaseGlassType('VL');
    else if (refString.includes('DEF')) setBaseGlassType('DEF');

    // 3. Body Type
    if (refString.includes('3P')) setBodyType('3P');
    else if (refString.includes('4P')) setBodyType('4P');
    else if (refString.includes('5P')) setBodyType('5P');
    else if (refString.includes('BRK')) setBodyType('BRK');
    else if (refString.includes('CP')) setBodyType('CP');

    // 4. Sensors
    if (refString.includes('AD CARRE')) setRainSensor('AD CARRE');
    else if (refString.includes('AD ROND')) setRainSensor('AD ROND');
    else if (refString.includes('AD LOSANGE')) setRainSensor('AD LOSANGE');
    else if (refString.includes('AD')) setRainSensor('AD');
    else setRainSensor('SD');

    // 5. Cameras
    if (refString.includes('+ 2 CAM')) setCamera('+ 2 CAM');
    else if (refString.includes('+ CAM')) setCamera('+ CAM');
    else setCamera('');

    // 6. Technologies
    setTechHeated(refString.includes('CHAUFF'));
    setTechAcoustic(refString.includes('ACOUST'));
    setTechAthermic(refString.includes('ATHERM'));
    setTechHud(refString.includes('+ HUD'));
    setTechAntenna(refString.includes('+ ANT'));
    setTechMolding(refString.includes('+ JOINT'));

    // 7. Tint
    if (refString.includes('CLAIR')) setTint('CLAIR');
    else if (refString.includes('FUME')) setTint('FUME');
    else if (refString.includes('BLEU')) setTint('BLEU');
    else setTint('');
  };

  // This variable holds the live string to display/save
  const currentShorthand = generateShorthandString();
  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const actionText = scanAction === 'add' ? 'Added to' : 'Deducted from';
    
    if (isSupabaseConfigured) {
      try {
        setIsUploadingPhoto(true);
      let finalPhotoUrl = partPhotoUrl; // Use the auto-filled one by default

      // If they pasted/uploaded a BRAND NEW file, upload it to the Bucket!
      if (partPhoto) {
        const fileExt = partPhoto.name.split('.').pop() || 'png';
        const fileName = `${Date.now()}_inventory.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('inventory_photos')
          .upload(fileName, partPhoto);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert("Failed to upload photo. Please try again.");
          setIsUploadingPhoto(false);
          return; // Stop the insertion if upload fails
        }

        const { data: { publicUrl } } = supabase.storage
          .from('inventory_photos')
          .getPublicUrl(fileName);
          
        finalPhotoUrl = publicUrl; 
      }
      setIsUploadingPhoto(false);
        const make = selectedBrand === 'OTHER' ? customBrand : selectedBrand;
        const model = selectedBrand === 'OTHER' ? customModel : selectedModel;
        const year = selectedBrand === 'OTHER' ? customYear : selectedYear;
        const manufacturer = selectedManufacturer === 'Other' ? customManufacturer : selectedManufacturer;
        // Replace the old selectedPosition with our new baseGlassType
        const position = baseGlassType;

        // Add bodyType to the safety check
        if (!make || !model || !year || !manufacturer || !position || !bodyType) {
        alert("Please fill in all car details, manufacturer, position, and body type.");
        return;
    }

        // 1. Generate readable master_sku
        const masterSku = `${make} ${model} ${year}`.toUpperCase();

        // 2. Upsert into universal_catalog
        const { error: catError } = await supabase
          .from('universal_catalog')
          .upsert({
            master_sku: masterSku,
            make,
            model,
            photo_url: finalPhotoUrl,
            year
          });
          
        if (catError) throw catError;

        // 3. Link in barcode_dictionary (Insert to allow multiple matches or override)
        const { data: existingLink } = await supabase
          .from('barcode_dictionary')
          .select('factory_barcode')
          .eq('factory_barcode', scannedBarcode)
          .eq('master_sku', masterSku)
          .maybeSingle();

        if (!existingLink) {
          await supabase
            .from('barcode_dictionary')
            .insert({
              factory_barcode: scannedBarcode,
              photo_url: finalPhotoUrl,
              master_sku: masterSku
            });
        }

        const qtyNum = parseInt(quantity, 10);

        // 4. Check existing inventory
        const { data: existingInv, error: invError } = await supabase
          .from('live_inventory')
          .select('inventory_id, quantity')
          .eq('seller_id', TEST_SELLER_ID)
          .eq('master_sku', masterSku)
          .eq('manufacturer', manufacturer)
          .eq('position', position)
          .maybeSingle();

        if (scanAction === 'add') {
          const priceNum = parseFloat(price);
          if (existingInv) {
            // Update existing
            await supabase
              .from('live_inventory')
              .update({ 
                quantity: existingInv.quantity + qtyNum,
                ...(priceNum ? { unit_price: priceNum } : {}),
                ...(referenceCode ? { reference_code: currentShorthand } : {})
               })
              .eq('inventory_id', existingInv.inventory_id);
          } else {
            // Insert new
            await supabase
              .from('live_inventory')
              .insert({
                seller_id: TEST_SELLER_ID,
                master_sku: masterSku,
                quantity: qtyNum,
                unit_price: priceNum || 0,
                manufacturer: manufacturer,
                position: baseGlassType,
                reference_code: currentShorthand || null
              });
          }
        } else {
          // Sold offline
          if (existingInv) {
            const newQty = Math.max(0, existingInv.quantity - qtyNum);
            await supabase
              .from('live_inventory')
              .update({ quantity: newQty })
              .eq('inventory_id', existingInv.inventory_id);
          } else {
            alert(`Item not found in your inventory.`);
            return;
          }
        }

        await fetchSupabaseData();
        
        // Reset form
        // Reset form
      resetSmartScannerForm(true);;
        
        barcodeInputRef.current?.focus();
      } catch (error) {
        console.error('Error processing scan:', error);
        alert('An error occurred while saving. Please check the console.');
      }
    } else {
      alert(`[Mock] ${actionText} inventory: ${quantity}x of ${scannedBarcode}`);
      setBarcode('');
      setScannedBarcode('');
      setIsRecognized(false);
      barcodeInputRef.current?.focus();
    }
  };

  const updateQuantity = async (id: string, currentQty: number, change: number) => {
    const newQty = Math.max(0, currentQty + change);
    
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('live_inventory')
          .update({ quantity: newQty })
          .eq('inventory_id', id);
        await fetchSupabaseData();
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    } else {
      setInventory(inventory.map(item => 
        item.inventory_id === id ? { ...item, quantity: newQty } : item
      ));
    }
  };

// 1. State for the Inventory Modal
const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

// 2. CSV Download Logic
const downloadHistoryCSV = () => {
  const historyOrders = orders.filter(o => ['Completed', 'Rejected', 'Cancelled'].includes(o.status));
  const headers = ['Date', 'Brand', 'Model', 'Year', 'Position', 'Price', 'Qty', 'Total', 'Status'];
  
  const rows = historyOrders.map(o => [
    new Date(o.created_at).toLocaleDateString(),
    (o.live_inventory as any)?.universal_catalog?.make || '',
    (o.live_inventory as any)?.universal_catalog?.model || '',
    (o.live_inventory as any)?.universal_catalog?.year || '',
    (o.live_inventory as any)?.position || '',
    o.unit_price,
    o.quantity_ordered,
    o.total_price,
    o.status
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "seller_order_history.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (isSupabaseConfigured) {
      setUpdatingOrderId(orderId);
      try {
        // 1. Fetch order details to know WHAT glass to deduct
const { data: orderData, error: orderError } = await supabase
  .from('order_ledger')
  .select('inventory_id, quantity_ordered')
  .eq('id', orderId)
  .single();

if (orderError) throw orderError;

// 2. If marking as Completed, deduct inventory
if (newStatus === 'Completed' && orderData) {
  // Fetch current stock
  const { data: invData, error: fetchError } = await supabase
    .from('live_inventory')
    .select('quantity')
    .eq('inventory_id', orderData.inventory_id) // <--- FIXED HERE!
    .single();

  if (fetchError) throw fetchError;

  const newQuantity = (invData?.quantity || 0) - orderData.quantity_ordered;

  // Update the stock in the database
  const { error: updateInvError } = await supabase
    .from('live_inventory')
    .update({ quantity: newQuantity })
    .eq('inventory_id', orderData.inventory_id); // <--- FIXED HERE!

  if (updateInvError) throw updateInvError;
}

// 3. Finally, update the order status
const { error } = await supabase
  .from('order_ledger')
  .update({ status: newStatus })
  .eq('id', orderId);

        if (error) throw error;

        // Update local state immediately
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        
        let msg = t.orderAccepted;
        if (newStatus === 'Rejected') msg = t.orderRejected;
        if (newStatus === 'Prepare for Delivery') msg = t.orderPreparing;
        if (newStatus === 'Completed') msg = t.orderCompleted;

        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error('Error updating order status:', error);
        alert(t.errorUpdatingOrder);
      } finally {
        setUpdatingOrderId(null);
      }
    } else {
      // Mock update
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      setSuccessMessage(t.orderAccepted);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsCancellingOrder(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('order_ledger')
          .update({ status: 'Cancelled' })
          .eq('id', orderToCancel.id);

        if (error) throw error;
      }

      setOrders(prev => prev.map(o => o.id === orderToCancel.id ? { ...o, status: 'Cancelled' } : o));
      setSuccessMessage(t.orderCancelledSuccess);
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsCancelOrderModalOpen(false);
      setOrderToCancel(null);
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(t.errorCancellingOrder);
    } finally {
      setIsCancellingOrder(false);
    }
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    
    const make = item.universal_catalog?.make || '';
    const model = item.universal_catalog?.model || '';
    const year = item.universal_catalog?.year || '';

    if (CAR_CATALOG[make] && CAR_CATALOG[make][model] && CAR_CATALOG[make][model].includes(year)) {
      setEditBrand(make);
      setEditModel(model);
      setEditYear(year);
      setEditCustomBrand('');
      setEditCustomModel('');
      setEditCustomYear('');
    } else {
      setEditBrand('OTHER');
      setEditCustomBrand(make);
      setEditCustomModel(model);
      setEditCustomYear(year);
    }

    setEditQuantity(item.quantity?.toString() || '1');
    setEditPrice(item.unit_price?.toString() || '');
    setEditReferenceCode(item.reference_code || '');

    const mfg = item.manufacturer || '';
    if (MANUFACTURERS.includes(mfg)) {
      setEditManufacturer(mfg);
      setEditCustomManufacturer('');
    } else {
      setEditManufacturer('Other');
      setEditCustomManufacturer(mfg);
    }

    const pos = item.position || '';
    if (GLASS_POSITIONS.includes(pos)) {
      setEditPosition(pos);
      setEditCustomPosition('');
    } else {
      setEditPosition('Other');
      setEditCustomPosition(pos);
    }

    setIsEditModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!editingItem || !isSupabaseConfigured) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('live_inventory')
        .delete()
        .eq('inventory_id', editingItem.inventory_id);

      if (error) throw error;

      // Update local state
      setInventory(prev => prev.filter(item => item.inventory_id !== editingItem.inventory_id));
      
      // Close modals
      setIsDeleteModalOpen(false);
      setIsEditModalOpen(false);
      // HARD WORKSPACE RESET (Safety Measure)
    setScannedBarcode('');  // <--- FIXED: Now matches your real state!
      setLastScannedCode(''); // <--- ADDED: Wipes the duplicate memory
      setIsRecognized(false);
      setSelectedBrand('');
      setSelectedModel('');
      setSelectedYear('');
      setSelectedPosition('');
      setSelectedManufacturer('');
      setReferenceCode('');
    // Ensure this next line matches your actual Search state name (e.g., setSearchQuery or setInventorySearchQuery)
    // setInventorySearchQuery('');
      // Show success toast
      setSuccessMessage(t.itemDeletedSuccess);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(t.deleteError || 'An error occurred while deleting the item.');
    } finally {
      setIsDeleting(false);
    }
    resetSmartScannerForm(true);
  };

  const handleMoveVehicle = async () => {
    if (!editingItem || !isSupabaseConfigured) return;
    
    const make = editBrand === 'OTHER' ? editCustomBrand : editBrand;
    const model = editBrand === 'OTHER' ? editCustomModel : editModel;
    const year = editBrand === 'OTHER' ? editCustomYear : editYear;
    const manufacturer = editManufacturer === 'Other' ? editCustomManufacturer : editManufacturer;
    
    // 1. Make sure it uses the old editPosition, NOT baseGlassType!
    const position = editPosition === 'Other' ? editCustomPosition : editPosition;

    // 2. Remove bodyType from this check!
    if (!make || !model || !year || !manufacturer || !position) {
      alert("Please fill in all car details, manufacturer, and position.");
      return;
    }

    const newQty = parseInt(editQuantity, 10);
    const newPrice = parseFloat(editPrice);

    if (isNaN(newQty) || newQty < 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (isNaN(newPrice) || newPrice < 0) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      const newMasterSku = `${make} ${model} ${year}`.toUpperCase();

      // Upsert into universal_catalog
      const { error: catError } = await supabase
        .from('universal_catalog')
        .upsert({
          master_sku: newMasterSku,
          make,
          model,
          year
        });

      if (catError) throw catError;

      if (newMasterSku === editingItem.master_sku && manufacturer === editingItem.manufacturer && position === editingItem.position) {
        // Scenario A: Vehicle, Manufacturer, and Position stayed the same - Simple Update
        await supabase
          .from('live_inventory')
          .update({ 
            quantity: newQty,
            unit_price: newPrice,
            reference_code: editReferenceCode || null
          })
          .eq('inventory_id', editingItem.inventory_id);
      } else {
        // Scenario B: Vehicle, Manufacturer, OR Position changed - Safe Merge required
        // Step 1: Check for Existing Destination
        const { data: existingInv, error: invError } = await supabase
          .from('live_inventory')
          .select('inventory_id, quantity')
          .eq('seller_id', TEST_SELLER_ID)
          .eq('master_sku', newMasterSku)
          .eq('manufacturer', manufacturer)
          .eq('position', position)
          .maybeSingle();

        if (existingInv) {
          // Step 3: MERGE
          await supabase
            .from('live_inventory')
            .update({ 
              quantity: existingInv.quantity + newQty,
              unit_price: newPrice,
              reference_code: editReferenceCode || null
            })
            .eq('inventory_id', existingInv.inventory_id);

          // DELETE the old, incorrect row
          await supabase
            .from('live_inventory')
            .delete()
            .eq('inventory_id', editingItem.inventory_id);
        } else {
          // Step 2: UPDATE old row's master_sku, manufacturer, position, quantity, and price
          await supabase
            .from('live_inventory')
            .update({ 
              master_sku: newMasterSku,
              manufacturer: manufacturer,
              position: baseGlassType,
              quantity: newQty,
              unit_price: newPrice,
              reference_code: editReferenceCode || null
            })
            .eq('inventory_id', editingItem.inventory_id);
        }
      }

      await fetchSupabaseData();
      setIsEditModalOpen(false);
      setEditingItem(null);
      // HARD WORKSPACE RESET (Safety Measure)
      // HARD WORKSPACE RESET (Safety Measure)
      setScannedBarcode('');  // Clears the scanner box visually
      setIsRecognized(false);
      setSelectedBrand('');
      setSelectedModel('');
      setSelectedYear('');
      setSelectedPosition('');
      setSelectedManufacturer('');
      setReferenceCode('');
      // (lastScannedCode is intentionally NOT cleared so the warning works!)
    } catch (error) {
      console.error('Error moving/editing vehicle:', error);
      alert('An error occurred while saving changes.');
    }
    resetSmartScannerForm(true);
  };

  const qtyNum = parseInt(quantity, 10);
  const priceNum = parseFloat(price);
  const isQtyValid = !isNaN(qtyNum) && qtyNum > 0;
  const isPriceValid = scanAction === 'sold' || (!isNaN(priceNum) && priceNum > 0);
  
  const isCategorized = isRecognized || 
    (selectedBrand === 'OTHER' 
      ? (customBrand.trim() !== '' && customModel.trim() !== '' && customYear.trim() !== '')
      : (selectedBrand !== '' && selectedModel !== '' && selectedYear !== ''));

  const isManufacturerValid = selectedManufacturer !== '' && (selectedManufacturer !== 'Other' || customManufacturer.trim() !== '');
  const isPositionValid = selectedPosition !== '' && (selectedPosition !== 'Other' || customPosition.trim() !== '');

  const isFormValid = 
    scannedBarcode !== '' && 
    (selectedBrand !== '' || customBrand !== '') && 
    (selectedModel !== '' || customModel !== '') && 
    (selectedYear !== '' || customYear !== '') && 
    baseGlassType !== '' &&   // <-- Now checks the new Glass Type!
    bodyType !== '' &&        // <-- Now checks the new Body Type!
    parseInt(quantity) > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-hidden selection:bg-cyan-200">
      {/* Decorative Background Elements for Futuristic Feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              {t.appTitle}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <Globe className="w-4 h-4 text-slate-500" />
              <button 
                onClick={() => setLang('en')}
                className={`text-xs font-bold transition-colors ${lang === 'en' ? 'text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                EN
              </button>
              <span className="text-slate-300">|</span>
              <button 
                onClick={() => setLang('fr')}
                className={`text-xs font-bold transition-colors ${lang === 'fr' ? 'text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                FR
              </button>
            </div>

            <button className="relative p-2 text-slate-500 hover:text-cyan-600 transition-colors rounded-full hover:bg-white/50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-white/50 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    {/* Account Header */}
                    <div className="bg-slate-50 p-4 border-b border-slate-100">
                      {isProfileLoading ? (
                        <div className="space-y-2 animate-pulse">
                          <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                        </div>
                      ) : (
                        <>
                          <div className="font-bold text-slate-800 truncate">
                            {userProfile?.business_name || 'Business Name'}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {userProfile?.role ? (lang === 'fr' ? (userProfile.role === 'Buyer' ? t.buyer : t.seller) : userProfile.role) : 'Role'}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Quick Links */}
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors text-left">
                        <LayoutDashboard className="w-4 h-4" /> {t.dashboard}
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors text-left">
                        <Boxes className="w-4 h-4" /> {t.myInventory}
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors text-left">
                        <ReceiptText className="w-4 h-4" /> {t.orderLedger}
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors text-left">
                        <Settings className="w-4 h-4" /> {t.preferences}
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors text-left">
                        <HeadphonesIcon className="w-4 h-4" /> {t.helpSupport}
                      </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-2 border-t border-slate-100">
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsCredentialModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-medium"
                      >
                        <AlertTriangle className="w-4 h-4" /> {t.requestCredentialChange}
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="p-2 border-t border-slate-100 bg-slate-50">
                      <button 
                        onClick={async () => {
                          if (isSupabaseConfigured) {
                            try {
                              await supabase.auth.signOut();
                            } catch (e) {
                              console.error("Sign out error:", e);
                            }
                          } else {
                            setSession(null);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" /> {t.logOut}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto p-6 space-y-10 pb-24 relative z-10">
        
        {!isSupabaseConfigured && (
          <div className="bg-white/70 backdrop-blur-md border border-cyan-200/50 rounded-2xl p-4 flex items-start gap-3 text-sm text-cyan-800 shadow-sm">
            <div className="mt-0.5">ℹ️</div>
            <div>
              <p className="font-semibold text-cyan-900">{t.runningDemoMode}</p>
              <p className="opacity-80 mt-1">{t.demoModeDesc}</p>
            </div>
          </div>
        )}

        {/* 1. Top Section: Smart Scanner Module */}
        <section>
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Barcode className="w-6 h-6 text-cyan-500" />
                {t.smartScanner}
              </h2>
              
              {/* Action Toggle */}
              <div className="flex p-1 bg-slate-200/50 rounded-full w-fit border border-slate-300/30">
                <button
        onClick={() => {
          setScanAction('add');        // 1. Switches the mode
          resetSmartScannerForm(true); // 2. Wipes the scanner clean!
        }}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    scanAction === 'add' 
                      ? 'bg-white shadow-sm text-cyan-600' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.addToInventory}
                </button>
                <button
        onClick={() => {
          setScanAction('sold');       // 1. Switches the mode
          resetSmartScannerForm(true); // 2. Wipes the scanner clean!
        }}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    scanAction === 'sold' 
                      ? 'bg-white shadow-sm text-indigo-600' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.soldOffline}
                </button>
              </div>
            </div>

            <form onSubmit={handleScanSubmit} className="space-y-5">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Barcode className={`h-6 w-6 transition-colors ${scanAction === 'add' ? 'text-cyan-500' : 'text-indigo-500'}`} />
                </div>
                <input
                  id="main-barcode-input"
                  key={scannerResetCounter}
                  autoComplete="off"
                  ref={barcodeInputRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => {
                    setBarcode(e.target.value);
                  }}
                  onFocus={() => setIsScanning(true)}
                  onBlur={() => {
                    setIsScanning(false);
                    if (barcode.trim() && barcode.trim() !== scannedBarcode) {
                      lookupBarcode(barcode);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      lookupBarcode(barcode);
                    }
                  }}
                  className="block w-full pl-12 pr-32 py-4 border border-slate-200 rounded-2xl bg-white/50 text-slate-800 text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 transition-all shadow-inner"
                  placeholder={t.scanBarcodePlaceholder}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="button"
                    onClick={() => barcodeInputRef.current?.focus()}
                    className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-all duration-300 ${
                      isScanning 
                        ? 'text-green-600 bg-green-50 border-green-300 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                        : 'text-slate-500 bg-slate-100 border-slate-200 hover:bg-slate-200 hover:text-slate-700'
                    }`}
                  >
                    {isScanning ? t.scanning : t.usbReady}
                  </button>
                </div>
              </div>
              
              {/* Part Details / New Part Form */}
              {scannedBarcode && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  {barcodeMatches.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <p className="text-sm font-bold text-slate-700">
                          {t.multipleMatches}
                        </p>
                      </div>
                      <select
                        onChange={async (e) => {
                          const match = barcodeMatches.find(m => m.master_sku === e.target.value);
                          if (match) await applyMatch(match);
                        }}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
                        defaultValue=""
                      >
                        <option value="" disabled>{t.selectVehicle}</option>
                        {barcodeMatches.map(match => {
                          const cat = Array.isArray(match.universal_catalog) ? match.universal_catalog[0] : match.universal_catalog;
                          return (
                            <option key={match.master_sku} value={match.master_sku}>
                              {cat?.make} {cat?.model} ({cat?.year})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isRecognized ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                          <p className="text-sm font-bold text-slate-700">
                            {isRecognized ? t.recognizedPart : t.newPartDetected}
                          </p>
                        </div>
                        {isRecognized && !isOverridingMatch && (
                          <button
                            type="button"
                            onClick={handleOverride}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 underline-offset-2"
                          >
                            {t.incorrectVehicle}
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {isRecognized ? (
                          <div className="sm:col-span-2 bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center">
                            <span className="font-bold text-slate-800">
                              {selectedBrand === 'OTHER' ? customBrand : selectedBrand} {selectedBrand === 'OTHER' ? customModel : selectedModel} ({selectedBrand === 'OTHER' ? customYear : selectedYear})
                            </span>
                          </div>
                        ) : (
                          <>
                            <SearchableSelect
                              label={t.brand}
                              options={Object.keys(CAR_CATALOG)}
                              value={selectedBrand}
                              onChange={(val) => {
                                setSelectedBrand(val);
                                setSelectedModel('');
                                setSelectedYear('');
                              }}
                              placeholder={t.selectBrand}
                              showOtherOption
                              otherLabel={t.otherNotInList}
                              required
                            />
                            
                            {selectedBrand !== 'OTHER' && (
                              <>
                                <SearchableSelect
                                  label={t.model}
                                  options={selectedBrand ? Object.keys(CAR_CATALOG[selectedBrand] || {}) : []}
                                  value={selectedModel}
                                  onChange={(val) => {
                                    setSelectedModel(val);
                                    setSelectedYear('');
                                  }}
                                  disabled={!selectedBrand}
                                  placeholder={t.selectModel}
                                  required
                                />
                                
                                <SearchableSelect
                                  label={t.yearRange}
                                  options={selectedBrand && selectedModel ? (CAR_CATALOG[selectedBrand]?.[selectedModel] || []) : []}
                                  value={selectedYear}
                                  onChange={(val) => setSelectedYear(val)}
                                  disabled={!selectedModel}
                                  placeholder={t.selectYear}
                                  required
                                />
                              </>
                            )}
                          </>
                        )}
                        
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.manufacturer}</label>
                          <select
                            value={selectedManufacturer}
                            onChange={(e) => setSelectedManufacturer(e.target.value)}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
                            required
                          >
                            <option value="" disabled>{t.selectManufacturer}</option>
                            {MANUFACTURERS.map(mfg => (
                              <option key={mfg} value={mfg}>{mfg}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {selectedBrand === 'OTHER' && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-4">
                          <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                            {t.ensureSpelling}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <input
                              type="text"
                              placeholder={t.customBrand}
                              value={customBrand}
                              onChange={(e) => setCustomBrand(e.target.value)}
                              className="block w-full px-3 py-2.5 border border-amber-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                              required
                            />
                            <input
                              type="text"
                              placeholder={t.customModel}
                              value={customModel}
                              onChange={(e) => setCustomModel(e.target.value)}
                              className="block w-full px-3 py-2.5 border border-amber-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                              required
                            />
                            <input
                              type="text"
                              placeholder={t.customYear}
                              value={customYear}
                              onChange={(e) => setCustomYear(e.target.value)}
                              className="block w-full px-3 py-2.5 border border-amber-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                              required
                            />
                          </div>
                        </div>
                      )}
                      
                      {selectedManufacturer === 'Other' && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4">
                          <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-3">
                            {t.ensureMfgSpelling}
                          </p>
                          <input
                            type="text"
                            placeholder={t.customManufacturerName}
                            value={customManufacturer}
                            onChange={(e) => setCustomManufacturer(e.target.value)}
                            className="block w-full px-3 py-2.5 border border-amber-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                            required
                          />
                        </div>
                      )}

                      {selectedPosition === 'Other' && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4">
                          <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-3">
                            {t.ensurePosSpelling}
                          </p>
                          <input
                            type="text"
                            placeholder={t.customPositionName}
                            value={customPosition}
                            onChange={(e) => setCustomPosition(e.target.value)}
                            className="block w-full px-3 py-2.5 border border-amber-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* --- SMART IDENTIFICATION DETAILS (HIDDEN UNTIL SCAN) --- */}
          {scannedBarcode && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider mb-2">Part Identification Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Full French Glass List with Hidden Abbreviations */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Position du Vitrage (Required)</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cyan-500"
                    value={baseGlassType}
                    onChange={(e) => setBaseGlassType(e.target.value)}
                    required
                  >
                    <option value="" disabled>Sélectionner une position...</option>
                    <option value="PB">Pare-brise avant (PB)</option>
                    <option value="LA">Lunette arrière (LA)</option>
                    <option value="VL">Vitre porte avant gauche (VL)</option>
                    <option value="VL">Vitre porte avant droite (VL)</option>
                    <option value="VL">Vitre porte arrière gauche (VL)</option>
                    <option value="VL">Vitre porte arrière droite (VL)</option>
                    <option value="VL">Vitre de custode (VL)</option>
                    <option value="DEF">Déflecteur (DEF)</option>
                  </select>
                </div>

                {/* Body Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Body Type (Required)</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cyan-500"
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Body Type...</option>
                    <option value="3P">3 Portes (3P)</option>
                    <option value="4P">4 Portes (4P)</option>
                    <option value="5P">5 Portes (5P)</option>
                    <option value="BRK">Break (BRK)</option>
                    <option value="CP">Coupé (CP)</option>
                  </select>
                </div>

                {/* Tint (Only shows if VL or LA is selected) */}
                {(baseGlassType === 'VL' || baseGlassType === 'LA') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Teinte du Verre</label>
                    <select 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cyan-500"
                      value={tint}
                      onChange={(e) => setTint(e.target.value)}
                    >
                      <option value="">Vert (Standard)</option>
                      <option value="CLAIR">Clair / Blanc</option>
                      <option value="FUME">Surteinté / Fumé</option>
                      <option value="BLEU">Bleu</option>
                    </select>
                  </div>
                )}
              </div>

              {/* PB ONLY: Sensors and Cameras */}
              {baseGlassType === 'PB' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Détecteur de Pluie / Lumière</label>
                    <select 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cyan-500"
                      value={rainSensor}
                      onChange={(e) => setRainSensor(e.target.value)}
                    >
                      <option value="SD">Sans Détecteur (SD)</option>
                      <option value="AD">Avec Détecteur (AD)</option>
                      <option value="AD CARRE">Détecteur Carré</option>
                      <option value="AD ROND">Détecteur Rond</option>
                      <option value="AD LOSANGE">Détecteur Losange</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Caméra d'Aide à la Conduite</label>
                    <select 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cyan-500"
                      value={camera}
                      onChange={(e) => setCamera(e.target.value)}
                    >
                      <option value="">Sans Caméra</option>
                      <option value="+ CAM">1 Caméra (+ CAM)</option>
                      <option value="+ 2 CAM">2 Caméras (+ 2 CAM)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* PB or LA ONLY: Special Technologies */}
              {(baseGlassType === 'PB' || baseGlassType === 'LA') && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Special Technologies</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
                    <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={techHeated} onChange={(e) => setTechHeated(e.target.checked)} className="rounded text-cyan-600" />
                      <span>Chauffant</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={techAcoustic} onChange={(e) => setTechAcoustic(e.target.checked)} className="rounded text-cyan-600" />
                      <span>Acoustique</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={techAthermic} onChange={(e) => setTechAthermic(e.target.checked)} className="rounded text-cyan-600" />
                      <span>Athermique</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={techHud} onChange={(e) => setTechHud(e.target.checked)} className="rounded text-cyan-600" />
                      <span>HUD</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={techAntenna} onChange={(e) => setTechAntenna(e.target.checked)} className="rounded text-cyan-600" />
                      <span>Antenne Intégrée</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={techMolding} onChange={(e) => setTechMolding(e.target.checked)} className="rounded text-cyan-600" />
                      <span>Avec Joint / Encapsulé</span>
                    </label>
                  </div>
                </div>
              )}

              {/* The Shorthand Output Box */}
              <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 shadow-inner">
                 <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Generated Reference Code</div>
                 <div className="font-mono text-cyan-400 font-bold text-lg">
                    {currentShorthand || "Awaiting mandatory inputs..."}
                 </div>
              </div>
              {/* --- REQUIRED PART PHOTO UPLOAD --- */}
            <div className="mt-4 p-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-100 transition-colors relative">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Part Condition Photo (Required)
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="file"
                  accept="image/*, application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPartPhoto(file);
                      setPartPhotoUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                
                <div className="text-xs text-slate-400 italic text-center sm:text-left whitespace-nowrap">
                  Or press <kbd className="bg-white px-2 py-1 rounded border shadow-sm text-slate-600 font-sans mx-1">Ctrl</kbd> + <kbd className="bg-white px-2 py-1 rounded border shadow-sm text-slate-600 font-sans mx-1">V</kbd> to paste
                </div>
              </div>

              {/* Image Preview Window */}
              {partPhotoUrl && (
                <div className="mt-4 relative inline-block rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                  {partPhotoUrl.includes('pdf') ? (
                     <div className="bg-red-50 text-red-600 px-6 py-4 font-bold text-sm">PDF Attached ✓</div>
                  ) : (
                    <img src={partPhotoUrl} alt="Part Preview" className="h-32 object-cover" />
                  )}
                  <button 
                    type="button"
                    onClick={() => { setPartPhoto(null); setPartPhotoUrl(null); }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs hover:bg-red-600 shadow-lg"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            </div>
          )}
          {/* --- END SMART IDENTIFICATION DETAILS --- */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.quantity}</label>
                  <input
                    ref={quantityInputRef}
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 transition-all font-bold text-lg"
                    placeholder="1"
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                    {scanAction === 'add' ? t.unitPriceMad : t.salePriceMad}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 transition-all font-bold text-lg"
                    placeholder="0.00"
                    required={scanAction === 'add'}
                  />
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 ${
                      !isFormValid 
                        ? 'bg-slate-300 cursor-not-allowed'
                        : scanAction === 'add'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] focus:ring-cyan-500'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] focus:ring-indigo-500'
                    }`}
                  >
                    {scanAction === 'add' ? <Plus className="w-5 h-5" /> : <ArrowRightLeft className="w-5 h-5" />}
                    {scanAction === 'add' ? t.executeInsert : t.executeUpdate}
                  </button>
                </div>
              </div>
            </form>
          </div>
          </section>

        {/* 2. Middle Section: Office Dashboard (Order Management) */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
              <LayoutDashboard className="w-7 h-7 text-indigo-600" />
              {t.officeDashboard}
              <span className="bg-indigo-100 text-indigo-700 text-sm py-1 px-3 rounded-full font-bold border border-indigo-200">
                {orders.length}
              </span>
            </h2>
          </div>

          {/* ZONE A: Action Required (Urgent) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-700">{t.actionRequired}</h3>
              <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200 uppercase tracking-wider">
                {t.urgent}
              </span>
            </div>
            
            <div className="grid gap-3">
              {loading ? (
                <div className="text-center py-8 text-slate-500">{t.loadingOrders}</div>
              ) : orders.filter(o => o.status === 'Pending' || o.status === 'Requested').length === 0 ? (
                <div className="text-center py-6 text-slate-400 bg-white/40 rounded-2xl border border-dashed border-slate-200 italic">
                  {t.noPendingOrders}
                </div>
              ) : (
                orders.filter(o => o.status === 'Pending' || o.status === 'Requested').map((order) => (
                  <div key={order.id} className="relative bg-white/80 backdrop-blur-md border border-amber-200/60 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                    <button
                      onClick={() => {
                        setOrderToCancel(order);
                        setIsCancelOrderModalOpen(true);
                      }}
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                        <ShoppingCart className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-tight">{order.transaction_id}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(order.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-base truncate">
                          {order.profiles?.business_name || t.unknown}
                        </h3>
                        <p className="text-sm text-slate-600 font-medium mt-0.5">
                          {order.live_inventory?.make || ''} {order.live_inventory?.model || ''} ({order.live_inventory?.year || ''}) • {getTranslatedPosition(order.live_inventory?.position)}
                        </p>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                          <span>{t.qty}: <strong className="text-slate-700">{order.quantity_ordered}</strong></span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="font-bold text-indigo-600">
                            {(Number(order.price || order.agreed_price || 0) * order.quantity_ordered).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
                          </span>
                        </p>
                        {order.reference_code && (
                          <p className="text-sm mt-1.5">
                            <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{t.refCode}: {order.reference_code}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {order.request_photo_url && (
                        <button 
                          onClick={() => window.open(order.request_photo_url, '_blank')}
                          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-indigo-700 py-2 px-4 rounded-xl text-xs font-bold transition-all border border-indigo-200 hover:border-indigo-300 shadow-sm group"
                        >
                          <Image className="w-3.5 h-3.5 text-indigo-500 group-hover:-translate-y-0.5 transition-transform" />
                          {t.viewRefPhoto}
                        </button>
                      )}
                      {order.po_file_url && (
                        <button 
                          onClick={() => window.open(order.po_file_url, '_blank')}
                          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-cyan-700 py-2 px-4 rounded-xl text-xs font-bold transition-all border border-cyan-200 hover:border-cyan-300 shadow-sm group"
                        >
                          <Upload className="w-3.5 h-3.5 text-cyan-500 group-hover:-translate-y-0.5 transition-transform" />
                          {t.viewPO}
                        </button>
                      )}
                      
                      {updatingOrderId === order.id ? (
                        <div className="flex items-center gap-2 px-4 py-2">
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-bold text-indigo-600">Updating...</span>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'Accepted')}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm shadow-green-200"
                          >
                            {t.accept}
                          </button>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'Rejected')}
                            className="flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 py-2 px-4 rounded-xl text-xs font-bold transition-all border border-red-200 hover:border-red-300 shadow-sm"
                          >
                            {t.reject}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ZONE B: In Progress (Active) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold text-slate-700">{t.inProgress}</h3>
              <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200 uppercase tracking-wider">
                {t.active}
              </span>
            </div>
            
            <div className="grid gap-3">
              {orders.filter(o => o.status === 'Accepted' || o.status === 'Prepare for Delivery').length === 0 ? (
                <div className="text-center py-6 text-slate-400 bg-white/40 rounded-2xl border border-dashed border-slate-200 italic">
                  {t.noOrders}
                </div>
              ) : (
                orders.filter(o => o.status === 'Accepted' || o.status === 'Prepare for Delivery').map((order) => (
                  <div key={order.id} className="relative bg-white/80 backdrop-blur-md border border-blue-200/60 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                    <button
                      onClick={() => {
                        setOrderToCancel(order);
                        setIsCancelOrderModalOpen(true);
                      }}
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-tight">{order.transaction_id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            order.status === 'Accepted' ? 'text-green-600 bg-green-50 border-green-200' : 'text-blue-600 bg-blue-50 border-blue-200'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-base truncate">
                          {order.profiles?.business_name || t.unknown}
                        </h3>
                        <p className="text-sm text-slate-600 font-medium mt-0.5">
                          {order.live_inventory?.make || ''} {order.live_inventory?.model || ''} ({order.live_inventory?.year || ''}) • {getTranslatedPosition(order.live_inventory?.position)}
                        </p>
                        {order.reference_code && (
                          <p className="text-sm mt-1.5">
                            <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{t.refCode}: {order.reference_code}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {order.request_photo_url && (
                        <button 
                          onClick={() => window.open(order.request_photo_url, '_blank')}
                          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-indigo-700 py-2 px-4 rounded-xl text-xs font-bold transition-all border border-indigo-200 hover:border-indigo-300 shadow-sm group"
                        >
                          <Image className="w-3.5 h-3.5 text-indigo-500 group-hover:-translate-y-0.5 transition-transform" />
                          {t.viewRefPhoto}
                        </button>
                      )}
                      {order.po_file_url && (
                        <button 
                          onClick={() => window.open(order.po_file_url, '_blank')}
                          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-cyan-700 py-2 px-4 rounded-xl text-xs font-bold transition-all border border-cyan-200 hover:border-cyan-300 shadow-sm group"
                        >
                          <Upload className="w-3.5 h-3.5 text-cyan-500 group-hover:-translate-y-0.5 transition-transform" />
                          {t.viewPO}
                        </button>
                      )}
                      
                      {updatingOrderId === order.id ? (
                        <div className="flex items-center gap-2 px-4 py-2">
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-bold text-indigo-600">Updating...</span>
                        </div>
                      ) : (
                        <>
                          {order.status === 'Accepted' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Prepare for Delivery')}
                              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-200"
                            >
                              {t.prepareForDelivery}
                            </button>
                          )}
                          {order.status === 'Prepare for Delivery' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm shadow-slate-300"
                            >
                              {t.markAsCompleted}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

{/* 3. Bottom Section: Active Inventory Catalog */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-2 gap-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <Package className="w-5 h-5 text-cyan-500" />
              {t.activeInventory}
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={t.searchCatalog}
                value={inventorySearchQuery}
                onChange={(e) => setInventorySearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 w-full text-slate-800 placeholder-slate-400 shadow-sm transition-all"
              />
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-slate-500">{t.loadingCatalog}</div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-12 text-slate-500">{t.noActiveInventory}</div>
            ) : (
              <div className="divide-y divide-slate-100/80">
                {inventory
                  .filter(item => {
                    const searchStr = inventorySearchQuery.toLowerCase();
                    const catalog = Array.isArray(item.universal_catalog) ? item.universal_catalog[0] : item.universal_catalog;
                    const make = catalog?.make?.toLowerCase() || '';
                    const model = catalog?.model?.toLowerCase() || '';
                    const year = catalog?.year?.toLowerCase() || '';
                    const sku = item.master_sku?.toLowerCase() || '';
                    const manufacturer = item.manufacturer?.toLowerCase() || '';
                    const position = item.position?.toLowerCase() || '';
                    
                    return make.includes(searchStr) || 
                           model.includes(searchStr) || 
                           year.includes(searchStr) || 
                           sku.includes(searchStr) || 
                           manufacturer.includes(searchStr) || 
                           position.includes(searchStr);
                  })
                  .slice(0, 8).map((item) => (
                  <div key={item.inventory_id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/40 transition-colors">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {item.master_sku}
                        </span>
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 transition-colors"
                        >
                          <Pencil className="w-3 h-3" /> {t.editVehicle}
                        </button>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg truncate">
                        {item.universal_catalog?.make} {item.universal_catalog?.model} <span className="text-slate-400 font-normal mx-1">|</span> <span className="text-slate-600">{lang === 'fr' ? (positionTranslations[item.position] || item.position || t.unknownPosition) : (item.position || t.unknownPosition)}</span> <span className="text-slate-400 font-normal mx-1">|</span> <span className="text-indigo-600">{item.manufacturer || t.unknown}</span>
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
  <p className="text-sm text-slate-500 font-medium">{item.universal_catalog?.year}</p>
  {item.reference_code && (
    <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-50 text-red-600 border border-red-200 rounded-md">
      REF: {item.reference_code}
    </span>
  )}
</div>
{inventory.length > 8 && (
  <div className="p-4 bg-white/50 border-t border-slate-100 flex justify-center">
    <button 
      onClick={() => setIsInventoryModalOpen(true)}
      className="px-6 py-2 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-colors"
    >
      Show All Inventory ({inventory.length} items)
    </button>
  </div>
)}
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-8">
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{t.unitPrice}</div>
                        <div className="font-bold text-slate-800 text-lg">
                          {item.unit_price.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} <span className="text-xs font-semibold text-slate-500">MAD</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-slate-100/80 rounded-2xl p-1 border border-slate-200/60 shadow-inner">
                        <button 
                          onClick={() => updateQuantity(item.inventory_id, item.quantity, -1)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-bold text-lg text-slate-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.inventory_id, item.quantity, 1)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-cyan-600 hover:bg-white hover:shadow-sm transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      
          {/* ZONE C: Order History (My Transactions) */}
          <div className="space-y-4">
            
            {/* NEW TITLE AREA WITH CSV BUTTON */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 mb-4 gap-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-700">{t.orderHistory || "My Transactions"}</h3>
              </div>
              <button 
                onClick={downloadHistoryCSV}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" /> Download CSV
              </button>
            </div>
            
            {/* NEW TABLE DESIGN */}
            <div className="grid gap-3">
              {orders.filter(o => ['Completed', 'Rejected', 'Cancelled'].includes(o.status)).length === 0 ? (
                <div className="text-center py-6 text-slate-400 bg-white/40 rounded-2xl border border-dashed border-slate-200 italic">
                  {t.noOrders}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  
                  {/* Table Header (Hidden on Mobile) */}
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-2">Date</div>
                    <div className="col-span-4">Item Details</div>
                    <div className="col-span-2">Unit Price</div>
                    <div className="col-span-1">Qty</div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-1">Status</div>
                  </div>
                  
                  {/* Table Rows */}
                  <div className="divide-y divide-slate-100">
                    {orders.filter(o => ['Completed', 'Rejected', 'Cancelled'].includes(o.status)).map((order) => (
                      <div key={order.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors">
                        
                        <div className="col-span-2 text-sm text-slate-500 flex md:block justify-between">
                          <div className="font-semibold text-slate-700">{new Date(order.created_at).toLocaleDateString()}</div>
                          <div className="text-xs">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                        
                        <div className="col-span-4">
  <div className="font-bold text-slate-800">
    {(order.live_inventory as any)?.universal_catalog?.make} {(order.live_inventory as any)?.universal_catalog?.model}
  </div>
  <div className="text-xs text-slate-500 mt-0.5">
    • {(order.live_inventory as any)?.manufacturer} • {(order.live_inventory as any)?.universal_catalog?.year}
  </div>
  <div className="flex gap-3 mt-2">
    {order.request_photo_url && (
      <button onClick={() => window.open(order.request_photo_url, '_blank')} className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 hover:text-indigo-800">
        <Image className="w-3 h-3" /> {t.viewRefPhoto}
      </button>
    )}
    {order.po_file_url && (
      <button onClick={() => window.open(order.po_file_url, '_blank')} className="text-[10px] text-slate-500 font-bold flex items-center gap-1 hover:text-slate-700">
        <Upload className="w-3 h-3" /> {t.viewPO}
      </button>
    )}
  </div>
</div>
                        
                        <div className="col-span-2 font-bold text-slate-800 text-sm flex md:block justify-between">
                          <span className="md:hidden text-xs font-normal text-slate-400">Price:</span>
                          {order.unit_price} MAD
                        </div>
                        
                        <div className="col-span-1 text-sm text-slate-600 font-medium flex md:block justify-between">
                          <span className="md:hidden text-xs font-normal text-slate-400">Qty:</span>
                          x{order.quantity_ordered}
                        </div>
                        
                        <div className="col-span-2 font-bold text-blue-600 text-sm flex md:block justify-between">
                          <span className="md:hidden text-xs font-normal text-slate-400">Total:</span>
                          {order.total_price} MAD
                        </div>
                        
                        <div className="col-span-1 flex md:block justify-end">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'Completed' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                            order.status === 'Rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                            'bg-orange-50 text-orange-600 border border-orange-100'
                          }`}>
                            {order.status}
                          </span>
                        </div>
          
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        
      </section>

        

      {/* Edit Vehicle Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
                {t.moveStock}
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500 mb-1">{t.movingInventory}</p>
                <p className="font-bold text-slate-800">{editingItem?.quantity}x {editingItem?.manufacturer || t.unknown} {t.windshields}</p>
                <p className="text-xs text-slate-400 mt-1">{t.currentlyAssignedTo} {editingItem?.master_sku}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SearchableSelect
                  label={t.brand}
                  options={Object.keys(CAR_CATALOG)}
                  value={editBrand}
                  onChange={(val) => {
                    setEditBrand(val);
                    setEditModel('');
                    setEditYear('');
                  }}
                  placeholder={t.selectBrand}
                  showOtherOption
                  otherLabel={t.otherNotInList}
                  required
                />
                
                {editBrand !== 'OTHER' && (
                  <>
                    <SearchableSelect
                      label={t.model}
                      options={editBrand ? Object.keys(CAR_CATALOG[editBrand] || {}) : []}
                      value={editModel}
                      onChange={(val) => {
                        setEditModel(val);
                        setEditYear('');
                      }}
                      disabled={!editBrand}
                      placeholder={t.selectModel}
                      required
                    />
                    
                    <SearchableSelect
                      label={t.yearRange}
                      options={editBrand && editModel ? (CAR_CATALOG[editBrand]?.[editModel] || []) : []}
                      value={editYear}
                      onChange={(val) => setEditYear(val)}
                      disabled={!editModel}
                      placeholder={t.selectYear}
                      required
                    />
                  </>
                )}
              </div>

              {editBrand === 'OTHER' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-4">
                  <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                    {t.ensureSpelling}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder={t.customBrand}
                      value={editCustomBrand}
                      onChange={(e) => setEditCustomBrand(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-amber-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                      required
                    />
                    <input
                      type="text"
                      placeholder={t.customModel}
                      value={editCustomModel}
                      onChange={(e) => setEditCustomModel(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-amber-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                      required
                    />
                    <input
                      type="text"
                      placeholder={t.customYear}
                      value={editCustomYear}
                      onChange={(e) => setEditCustomYear(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-amber-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.manufacturer}</label>
                    <select
                      value={editManufacturer}
                      onChange={(e) => setEditManufacturer(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400"
                      required
                    >
                      <option value="" disabled>{t.selectManufacturer}</option>
                      {MANUFACTURERS.map(mfg => (
                        <option key={mfg} value={mfg}>{mfg}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.glassPosition}</label>
                    <select
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400"
                      required
                    >
                      <option value="" disabled>{t.selectPosition}</option>
                      {GLASS_POSITIONS.map(pos => (
                        <option key={pos} value={pos}>{getTranslatedPosition(pos)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {editManufacturer === 'Other' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4">
                    <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-3">
                      {t.ensureMfgSpelling}
                    </p>
                    <input
                      type="text"
                      placeholder={t.customManufacturerName}
                      value={editCustomManufacturer}
                      onChange={(e) => setEditCustomManufacturer(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-amber-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                      required
                    />
                  </div>
                )}

                {editPosition === 'Other' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4">
                    <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-3">
                      {t.ensurePosSpelling}
                    </p>
                    <input
                      type="text"
                      placeholder={t.customPositionName}
                      value={editCustomPosition}
                      onChange={(e) => setEditCustomPosition(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-amber-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.refCode} (OPTIONAL)</label>
                  <input
                    type="text"
                    value={editReferenceCode}
                    onChange={(e) => setEditReferenceCode(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400"
                    placeholder="e.g. REF-12345"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.quantity}</label>
                  <input
                    type="number"
                    min="0"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.unitPriceMad}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-5 py-2.5 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t.deleteItem}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleMoveVehicle}
                  disabled={
                    editBrand === 'OTHER' 
                      ? (!editCustomBrand || !editCustomModel || !editCustomYear)
                      : (!editBrand || !editModel || !editYear)
                  }
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.saveChanges}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-red-50/50">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {t.deleteConfirmTitle}
              </h2>
              <button 
                onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.deleteConfirmBody}
              </p>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors disabled:opacity-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t.confirmDelete}...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t.confirmDelete}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {isCancelOrderModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-red-50/50">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {t.cancelOrderTitle}
              </h2>
              <button 
                onClick={() => !isCancellingOrder && setIsCancelOrderModalOpen(false)}
                disabled={isCancellingOrder}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.cancelOrderBody}
              </p>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCancelOrderModalOpen(false)}
                disabled={isCancellingOrder}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors disabled:opacity-50"
              >
                {t.goBack}
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancellingOrder}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCancellingOrder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t.confirmCancellation}...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t.confirmCancellation}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Change Modal */}
      {isCredentialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {t.updateBusinessCredentials}
              </h2>
              <button 
                onClick={() => setIsCredentialModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.credentialChangeBody1}
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                {t.credentialChangeBody2}
              </p>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCredentialModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors"
              >
                {t.cancel}
              </button>
              <a
                href="mailto:support@autoglassportal.com?subject=Request%20Credential%20Change"
                onClick={() => setIsCredentialModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl transition-colors shadow-sm flex items-center gap-2"
              >
                <HeadphonesIcon className="w-4 h-4" />
                {t.contactSupport}
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 z-[100] bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}
      </main>
      {/* Full Inventory Modal */}
{isInventoryModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
      
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Package className="w-6 h-6 text-cyan-500" />
          Full Active Inventory ({inventory.length} items)
        </h2>
        <button
          onClick={() => setIsInventoryModalOpen(false)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
        >
          {/* If you don't have an 'X' icon imported, you can just use text: "Close" */}
          <span className="font-bold text-lg px-2">X</span>
        </button>
      </div>

      {/* Modal Body (Scrollable) */}
      <div className="overflow-y-auto p-6">
        <div className="divide-y divide-slate-100/80">
          
          {/* WE WILL REUSE YOUR INVENTORY CODE HERE */}
          {inventory.map((item) => (
            <div key={item.inventory_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">
                  {item.universal_catalog?.make} {item.universal_catalog?.model}
                </h3>
                <div className="text-sm text-slate-500 mt-1 flex gap-2 items-center">
                  <span>{item.universal_catalog?.year}</span>
                  <span>•</span>
                  <span>{item.position}</span>
                  <span>•</span>
                  <span>{item.manufacturer}</span>
                  {item.reference_code && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-50 text-red-600 border border-red-200 rounded-md">
                      REF: {item.reference_code}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800 text-lg">
                  {item.unit_price} <span className="text-xs text-slate-500">MAD</span>
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">
                  Qty: {item.quantity}
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  </div>
)}
{/* Duplicate Scan Warning Modal */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-orange-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                {/* You can use an AlertTriangle icon here if you have it imported, otherwise text is fine */}
                <span className="text-3xl font-bold">!</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Duplicate Scan Detected</h3>
              <p className="text-slate-600 mb-6">
                You just scanned the barcode <span className="font-bold text-slate-800">{duplicateWarning}</span>. Are you sure you want to rescan and overwrite your current workspace?
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDuplicateWarning(null)} // The "NO" button
                  className="px-6 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  No, Cancel
                </button>
                <button
                  onClick={() => {
                    // The "YES" button: wipe the memory and force the scan!
                    setBarcode(''); // <--- MAKE SURE THIS WORD MATCHES YOUR STATE
                    setDuplicateWarning(null);
                    lookupBarcode(duplicateWarning); // Instantly search it again
                  }}
                  className="px-6 py-2.5 font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
                >
                  Yes, Rescan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Duplicate Scan Warning Modal */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-orange-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">!</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Duplicate Scan Detected</h3>
              <p className="text-slate-600 mb-6">
                You just added/scanned the barcode <span className="font-bold text-slate-800">{duplicateWarning}</span>. Are you sure you want to reuse it?
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDuplicateWarning(null);
                    resetSmartScannerForm(true); // Wipes it clean so they can start fresh
                  }} 
                  className="px-6 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  No, Cancel
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDuplicateWarning(null);
                    resetSmartScannerForm(true); // Nuclear wipe
                  }}
                  className="px-6 py-2.5 font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
                >
                  Yes, Reset Scanner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}