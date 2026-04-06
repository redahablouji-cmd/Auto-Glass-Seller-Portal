/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, ShoppingCart, ArrowRightLeft, Plus, Minus, Upload, ScanLine, Pencil, X, Bell, User, Barcode, LogOut, LayoutDashboard, Boxes, ReceiptText, Settings, HeadphonesIcon, AlertTriangle, ChevronDown, Globe } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Auth from './components/Auth';
import { useLanguage } from './contexts/LanguageContext';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const CAR_CATALOG: Record<string, Record<string, string[]>> = {
  "Dacia": {
    "Logan": ["2005-2012", "2013-2020", "2021-Present"],
    "Sandero": ["2008-2012", "2013-2020", "2021-Present"],
    "Duster": ["2010-2017", "2018-2023", "2024-Present"],
    "Dokker": ["2012-2021"]
  },
  "Renault": {
    "Clio": ["Clio III (2005-2012)", "Clio IV (2012-2019)", "Clio V (2019-Present)"],
    "Kangoo": ["2007-2020", "2021-Present"],
    "Express": ["2021-Present"],
    "Megane": ["Megane 3 (2008-2016)", "Megane 4 (2016-Present)"]
  },
  "Peugeot": {
    "208": ["2012-2019", "2019-Present"],
    "301": ["2012-Present"],
    "3008": ["2016-2023", "2024-Present"],
    "Partner": ["2008-2018", "2018-Present"]
  },
  "Volkswagen": {
    "Golf": ["Golf 6 (2008-2012)", "Golf 7 (2012-2019)", "Golf 8 (2019-Present)"],
    "Touareg": ["2011-2018", "2018-Present"],
    "Caddy": ["2010-2020", "2020-Present"]
  },
  "Porsche": {
    "Cayenne": ["2011-2018", "2019-Present", "Turbo GT (2022-Present)"],
    "Macan": ["2014-2021", "2022-Present"]
  },
  "Mercedes-Benz": {
    "G-Class": ["W463 (1990-2018)", "G63 AMG (2019-Present)"],
    "E-Class": ["W213 (2016-2023)", "W214 (2024-Present)"]
  },
  "Ford": {
    "Ranger": ["2011-2022", "2023-Present"],
    "F-150 Raptor": ["2017-2020", "2021-Present"]
  },
  "Hyundai": {
    "Tucson": ["2015-2020", "2021-Present"],
    "Accent": ["2011-2017", "2018-Present"]
  }
};

// Mock data aligned with the provided schema
const MOCK_INVENTORY = [
  { inventory_id: '1', master_sku: 'SKU-1001', quantity: 12, unit_price: 1250.00, manufacturer: 'XYG', universal_catalog: { make: 'Toyota', model: 'Corolla', year: '2019-2023' } },
  { inventory_id: '2', master_sku: 'SKU-1002', quantity: 5, unit_price: 850.00, manufacturer: 'Pilkington', universal_catalog: { make: 'Renault', model: 'Clio IV', year: '2012-2019' } },
  { inventory_id: '3', master_sku: 'SKU-1003', quantity: 8, unit_price: 2100.00, manufacturer: 'Saint-Gobain Sekurit', universal_catalog: { make: 'Mercedes-Benz', model: 'C-Class', year: '2014-2021' } },
];

const MOCK_ORDERS = [
  { transaction_id: 'ORD-8832', master_sku: 'SKU-1001', quantity_ordered: 2, agreed_price: 2500.00, status: 'Requested', universal_catalog: { make: 'Toyota', model: 'Corolla' } },
  { transaction_id: 'ORD-8835', master_sku: 'SKU-1002', quantity_ordered: 1, agreed_price: 850.00, status: 'Requested', universal_catalog: { make: 'Renault', model: 'Clio IV' } },
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

  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  // Smart Scanner Module State
  const [scanAction, setScanAction] = useState<'add' | 'sold'>('add');
  const [barcode, setBarcode] = useState('');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [isRecognized, setIsRecognized] = useState(false);
  
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

  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

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
  const [editManufacturer, setEditManufacturer] = useState('');
  const [editCustomManufacturer, setEditCustomManufacturer] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editCustomPosition, setEditCustomPosition] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile Dropdown State
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsProfileLoading(true);
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
      setIsProfileLoading(false);
    };
    fetchProfile();
  }, [session]);

  useEffect(() => {
    const checkConfigAndFetch = async () => {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setIsSupabaseConfigured(true);
        if (session) {
          await fetchSupabaseData();
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
  }, [session]);

  const fetchSupabaseData = async () => {
    try {
      setLoading(true);
      // Fetch inventory
      const { data: invData, error: invError } = await supabase
        .from('live_inventory')
        .select(`
          inventory_id, master_sku, quantity, unit_price, manufacturer, position,
          universal_catalog (make, model, year)
        `)
        .eq('seller_id', TEST_SELLER_ID)
        .order('inventory_id', { ascending: false });
      
      if (!invError && invData) setInventory(invData as any);

      // Fetch orders
      const { data: ordData, error: ordError } = await supabase
        .from('order_ledger')
        .select(`
          transaction_id, master_sku, quantity_ordered, agreed_price, status,
          universal_catalog (make, model)
        `)
        .eq('seller_id', TEST_SELLER_ID)
        .eq('status', 'Requested')
        .order('transaction_id', { ascending: false });
      
      if (!ordError && ordData) setOrders(ordData as any);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyMatch = (match: any) => {
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
    
    setIsRecognized(true);
    setIsOverridingMatch(false);
    setBarcodeMatches([]);
    quantityInputRef.current?.focus();
  };

  const handleOverride = () => {
    setIsOverridingMatch(true);
    setIsRecognized(false);
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYear('');
    setCustomBrand('');
    setCustomModel('');
    setCustomYear('');
  };

  const lookupBarcode = async (code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;
    
    setBarcodeMatches([]);
    setIsOverridingMatch(false);

    if (isSupabaseConfigured) {
      const { data: dictData, error: dictError } = await supabase
        .from('barcode_dictionary')
        .select(`
          master_sku,
          universal_catalog (make, model, year)
        `)
        .ilike('factory_barcode', trimmedCode);

      if (dictData && dictData.length > 0) {
        if (dictData.length > 1) {
          setBarcodeMatches(dictData);
          setIsRecognized(false);
          setScannedBarcode(trimmedCode);
        } else {
          applyMatch(dictData[0]);
          setScannedBarcode(trimmedCode);
        }
      } else {
        if (scanAction === 'sold') {
          // No alert here to avoid spamming if triggered on blur
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
    }
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const actionText = scanAction === 'add' ? 'Added to' : 'Deducted from';
    
    if (isSupabaseConfigured) {
      try {
        const make = selectedBrand === 'OTHER' ? customBrand : selectedBrand;
        const model = selectedBrand === 'OTHER' ? customModel : selectedModel;
        const year = selectedBrand === 'OTHER' ? customYear : selectedYear;
        const manufacturer = selectedManufacturer === 'Other' ? customManufacturer : selectedManufacturer;
        const position = selectedPosition === 'Other' ? customPosition : selectedPosition;

        if (!make || !model || !year || !manufacturer || !position) {
          alert("Please fill in all car details, manufacturer, and position.");
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
                ...(priceNum ? { unit_price: priceNum } : {})
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
                position: position
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
        setBarcode('');
        setScannedBarcode('');
        setIsRecognized(false);
        setSelectedBrand('');
        setSelectedModel('');
        setSelectedYear('');
        setCustomBrand('');
        setCustomModel('');
        setCustomYear('');
        setQuantity('1');
        if (scanAction === 'add') setPrice('');
        setSelectedPosition('');
        setCustomPosition('');
        
        setBarcodeMatches([]);
        setIsOverridingMatch(false);
        
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
      
      // Show success toast
      setSuccessMessage(t.itemDeletedSuccess);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(t.deleteError || 'An error occurred while deleting the item.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveVehicle = async () => {
    if (!editingItem || !isSupabaseConfigured) return;
    
    const make = editBrand === 'OTHER' ? editCustomBrand : editBrand;
    const model = editBrand === 'OTHER' ? editCustomModel : editModel;
    const year = editBrand === 'OTHER' ? editCustomYear : editYear;
    const manufacturer = editManufacturer === 'Other' ? editCustomManufacturer : editManufacturer;
    const position = editPosition === 'Other' ? editCustomPosition : editPosition;

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
            unit_price: newPrice
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
              unit_price: newPrice
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
              position: position,
              quantity: newQty,
              unit_price: newPrice
            })
            .eq('inventory_id', editingItem.inventory_id);
        }
      }

      await fetchSupabaseData();
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error moving/editing vehicle:', error);
      alert('An error occurred while saving changes.');
    }
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
    barcode.trim() !== '' && 
    barcode.trim() === scannedBarcode && 
    isQtyValid && 
    isPriceValid && 
    isCategorized &&
    isManufacturerValid &&
    isPositionValid;

  if (!session) {
    return <Auth onLogin={setSession} />;
  }

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
                        onClick={() => supabase.auth.signOut()}
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
                  type="button"
                  onClick={() => setScanAction('add')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    scanAction === 'add' 
                      ? 'bg-white shadow-sm text-cyan-600' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.addToInventory}
                </button>
                <button 
                  type="button"
                  onClick={() => setScanAction('sold')}
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
                        onChange={(e) => {
                          const match = barcodeMatches.find(m => m.master_sku === e.target.value);
                          if (match) applyMatch(match);
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
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.brand}</label>
                              <select
                                value={selectedBrand}
                                onChange={(e) => {
                                  setSelectedBrand(e.target.value);
                                  setSelectedModel('');
                                  setSelectedYear('');
                                }}
                                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
                                required
                              >
                                <option value="" disabled>{t.selectBrand}</option>
                                {Object.keys(CAR_CATALOG).map(brand => (
                                  <option key={brand} value={brand}>{brand}</option>
                                ))}
                                <option value="OTHER">{t.otherNotInList}</option>
                              </select>
                            </div>
                            
                            {selectedBrand !== 'OTHER' && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.model}</label>
                                  <select
                                    value={selectedModel}
                                    onChange={(e) => {
                                      setSelectedModel(e.target.value);
                                      setSelectedYear('');
                                    }}
                                    disabled={!selectedBrand}
                                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 disabled:opacity-50"
                                    required
                                  >
                                    <option value="" disabled>{t.selectModel}</option>
                                    {selectedBrand && CAR_CATALOG[selectedBrand] && Object.keys(CAR_CATALOG[selectedBrand]).map(model => (
                                      <option key={model} value={model}>{model}</option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.yearRange}</label>
                                  <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    disabled={!selectedModel}
                                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 disabled:opacity-50"
                                    required
                                  >
                                    <option value="" disabled>{t.selectYear}</option>
                                    {selectedBrand && selectedModel && CAR_CATALOG[selectedBrand]?.[selectedModel]?.map(year => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                                </div>
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
                        
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.glassPosition}</label>
                          <select
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
                            required
                          >
                            <option value="" disabled>{t.selectPosition}</option>
                            {GLASS_POSITIONS.map(pos => (
                              <option key={pos} value={pos}>{getTranslatedPosition(pos)}</option>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        {/* 2. Middle Section: Pending Orders (Priority View) */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <ShoppingCart className="w-5 h-5 text-indigo-500" />
              {t.pendingOrders}
              <span className="bg-indigo-100 text-indigo-700 text-xs py-0.5 px-2.5 rounded-full font-bold ml-2 border border-indigo-200">
                {orders.length}
              </span>
            </h2>
          </div>
          
          <div className="grid gap-3">
            {loading ? (
              <div className="text-center py-8 text-slate-500">{t.loadingOrders}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-white/50 rounded-3xl border border-slate-200">{t.noPendingOrders}</div>
            ) : (
              orders.map((order) => (
                <div key={order.transaction_id} className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                      <ShoppingCart className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{order.transaction_id}</span>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {order.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base">
                        {order.universal_catalog?.make} {order.universal_catalog?.model}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{t.qty}: <strong className="text-slate-700">{order.quantity_ordered}</strong></span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="font-bold text-indigo-600">{order.agreed_price.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</span>
                      </p>
                    </div>
                  </div>
                  
                  <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-cyan-700 py-2.5 px-5 rounded-xl text-sm font-bold transition-all border border-cyan-200 hover:border-cyan-300 shadow-sm w-full sm:w-auto group">
                    <Upload className="w-4 h-4 text-cyan-500 group-hover:-translate-y-0.5 transition-transform" />
                    {t.uploadBonDeCommande}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 3. Bottom Section: Active Inventory Catalog */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <Package className="w-5 h-5 text-cyan-500" />
              {t.activeInventory}
            </h2>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={t.searchCatalog}
                className="pl-9 pr-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 w-64 text-slate-800 placeholder-slate-400 shadow-sm transition-all"
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
                {inventory.map((item) => (
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
                      <p className="text-sm text-slate-500 font-medium">{item.universal_catalog?.year}</p>
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

      </main>

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
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.brand}</label>
                  <select
                    value={editBrand}
                    onChange={(e) => {
                      setEditBrand(e.target.value);
                      setEditModel('');
                      setEditYear('');
                    }}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400"
                    required
                  >
                    <option value="" disabled>{t.selectBrand}</option>
                    {Object.keys(CAR_CATALOG).map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                    <option value="OTHER">{t.otherNotInList}</option>
                  </select>
                </div>
                
                {editBrand !== 'OTHER' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.model}</label>
                      <select
                        value={editModel}
                        onChange={(e) => {
                          setEditModel(e.target.value);
                          setEditYear('');
                        }}
                        disabled={!editBrand}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 disabled:opacity-50"
                        required
                      >
                        <option value="" disabled>{t.selectModel}</option>
                        {editBrand && CAR_CATALOG[editBrand] && Object.keys(CAR_CATALOG[editBrand]).map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{t.yearRange}</label>
                      <select
                        value={editYear}
                        onChange={(e) => setEditYear(e.target.value)}
                        disabled={!editModel}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 disabled:opacity-50"
                        required
                      >
                        <option value="" disabled>{t.selectYear}</option>
                        {editBrand && editModel && CAR_CATALOG[editBrand]?.[editModel]?.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
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
    </div>
  );
}