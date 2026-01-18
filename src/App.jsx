import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench, 
  Calendar, 
  Clock, 
  Phone, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  Menu,
  X,
  Wifi,
  MessageCircle,
  Bell,
  Settings,
  Trash2,
  Plus,
  Upload,
  LogOut,
  Save,
  Edit3,
  List,
  Download,
  FileJson,
  ImageIcon,
  ArrowUp,
  ArrowDown,
  Tag,
  Filter,
  Lock,
  Loader,
  Database,
  ShieldAlert,
  Copy,
  ZoomIn,
  Grid
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyBoGEjONZazyxz1J4FY2cXhB_x31ZLZsLE",
  authDomain: "van-nghia-moto.firebaseapp.com",
  projectId: "van-nghia-moto",
  storageBucket: "van-nghia-moto.firebasestorage.app",
  messagingSenderId: "782684807237",
  appId: "1:782684807237:web:8e92462847d1848448832c",
  measurementId: "G-ZDSKMJC6ZY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'van-nghia-moto-data'; 

// --- COMPONENT EDITABLE TEXT (CHỮ TO HƠN) ---
const EditableText = ({ isAdminMode, value, onChange, className, placeholder, multiline = false, style }) => {
  const safeValue = value === null || value === undefined ? '' : value;

  if (!isAdminMode) {
    return <span className={className} style={{whiteSpace: 'pre-wrap', ...style}}>{safeValue}</span>;
  }
  
  const inputClass = `bg-white text-gray-900 border-2 border-orange-500 rounded px-2 py-2 outline-none shadow-lg w-full text-lg block ${className}`;
  
  if (multiline) {
    return (
      <textarea 
        value={safeValue} 
        onChange={(e) => onChange(e.target.value)} 
        className={inputClass}
        placeholder={placeholder}
        rows={3}
        style={{ width: '100%', ...style }}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }
  return (
    <input 
      type="text" 
      value={safeValue} 
      onChange={(e) => onChange(e.target.value)} 
      className={inputClass}
      placeholder={placeholder}
      style={{ width: '100%', color: 'black', ...style }}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

// --- COMPONENT ITEM DETAIL MODAL ---
const ItemDetailModal = ({ item, onClose }) => {
    if (!item) return null;
    const displayImage = (item.images && item.images.length > 0) ? item.images[0] : (item.iconUrl || item.imageFile);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in flex flex-col max-h-[90vh]" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Media Header */}
                <div className="relative h-72 bg-gray-100 shrink-0 flex items-center justify-center overflow-hidden">
                    {displayImage ? (
                        <img src={displayImage} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                         <div className="flex flex-col items-center text-gray-400">
                            {item.price ? <ImageIcon size={80} /> : <Wrench size={80}/>}
                            <span className="text-sm mt-2">Không có ảnh</span>
                         </div>
                    )}
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition"
                    >
                        <X size={24}/>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">{item.name}</h3>
                    
                    {(!item.variants || item.variants.length === 0) && (
                        <div className="text-3xl font-extrabold text-orange-600 mb-6">
                            {item.price}
                        </div>
                    )}

                    {item.desc && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-xl">
                            <h4 className="text-base font-bold text-gray-500 uppercase mb-2">Mô tả</h4>
                            <p className="text-lg text-gray-800 leading-relaxed">{item.desc}</p>
                        </div>
                    )}

                    {/* Bảng giá biến thể */}
                    {item.variants && item.variants.length > 0 && (
                        <div className="mb-6">
                             <h4 className="text-base font-bold text-gray-500 uppercase mb-3">Bảng giá chi tiết</h4>
                             <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden">
                                {item.variants.map((v, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-gray-100 p-4 text-lg last:border-0">
                                        <span className="font-medium text-slate-700">{v.name}</span>
                                        <span className="font-bold text-orange-600">{v.price}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    {/* Tình trạng kho */}
                    {item.stock !== undefined && (
                        <div className={`text-xl font-bold mb-8 flex items-center gap-3 p-4 rounded-xl ${item.stock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {item.stock ? <CheckCircle size={28}/> : <AlertCircle size={28}/>}
                            {item.stock ? 'CÒN HÀNG' : 'HẾT HÀNG'}
                        </div>
                    )}

                    <button 
                        onClick={onClose} 
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-95 transition shadow-lg"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

const OnePageMechanic = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newPassword, setNewPassword] = useState(''); 
  const fileInputRef = useRef(null); 
  const [isDataLoaded, setIsDataLoaded] = useState(false); 
  const [saveStatus, setSaveStatus] = useState('idle');
  const [authStatus, setAuthStatus] = useState('checking');
  const [permissionError, setPermissionError] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const [activeTab, setActiveTab] = useState('services');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);

  const defaultShopInfo = {
    name: "VĂN NGHĨA MOTO",
    tagline: "Chuẩn xác - Chất lượng - Chuyên nghiệp",
    heroTitle: "XẾ YÊU CẦN CHĂM SÓC?",
    heroDesc: "Thợ lành nghề, làm kỹ từng chi tiết. Không vẽ bệnh, báo giá trước khi làm.",
    phone: "0909.123.456",
    address: "123 Đường Số 1, Quận Bình Tân, TP.HCM",
    workingHours: "8:00 Sáng - 7:00 Tối (Cả Chủ Nhật)",
    wifi: "VanNghia_Free",
    wifiPass: "0909123456",
    logoUrl: null,
    qrCodeUrl: null,
    adminPassword: "1234" 
  };

  const defaultServices = [
    { id: 1, name: "Thay nhớt Motul/Castrol", iconUrl: null, desc: "Nhớt chính hãng, miễn phí công thay.", variants: [{ name: "Xe Số", price: "120.000đ" }, { name: "Xe Tay Ga", price: "140.000đ" }] },
    { id: 2, name: "Vệ sinh nồi xe tay ga", price: "150.000đ", iconUrl: null, desc: "Khắc phục rung đầu, lì máy, hao xăng.", variants: [] },
  ];

  const defaultParts = [
    { id: 1, name: "Lốp Michelin City Grip", price: "850.000đ", img: "⚫", stock: true, imageFile: null, tags: ["Lốp"] },
    { id: 2, name: "Nhớt Motul Scooter", price: "160.000đ", img: "🛢️", stock: true, imageFile: null, tags: ["Nhớt"] },
  ];

  const [shopInfo, setShopInfo] = useState(defaultShopInfo);
  const [services, setServices] = useState(defaultServices);
  const [parts, setParts] = useState(defaultParts);

  // --- FIREBASE AUTH & SYNC (Giữ nguyên logic cũ) ---
  useEffect(() => { const initAuth = async () => { try { await signInAnonymously(auth); setAuthStatus('logged-in'); } catch (error) { console.error(error); setAuthStatus('error'); } }; initAuth(); const u = onAuthStateChanged(auth, setUser); return () => u(); }, []);
  
  useEffect(() => {
    if (!user) return;
    const paths = {
        shop: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'shop_info'),
        services: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'services_list'),
        parts: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'parts_list'),
        bookings: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'bookings_list')
    };
    const handleErr = (error) => { if (error.code === 'permission-denied') setPermissionError(true); };
    const uS = onSnapshot(paths.shop, (s) => { if(s.exists()) setShopInfo(prev => ({...prev, ...s.data()})); }, handleErr);
    const uSv = onSnapshot(paths.services, (s) => { if(s.exists()) { const d = s.data().items||[]; setServices(d.map(i => ({...i, images: i.images || (i.iconUrl ? [i.iconUrl] : [])}))); } }, handleErr);
    const uP = onSnapshot(paths.parts, (s) => { if(s.exists()) { const d = s.data().items||[]; setParts(d.map(i => ({...i, images: i.images || (i.imageFile ? [i.imageFile] : [])}))); } }, handleErr);
    const uB = onSnapshot(paths.bookings, (s) => { if(s.exists()) setBookings(s.data().items||[]); setIsDataLoaded(true); }, handleErr);
    return () => { uS(); uSv(); uP(); uB(); };
  }, [user]);

  const forceSaveAll = async () => {
      if (!user) return;
      setSaveStatus('saving');
      try {
          await Promise.all([
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'shop_info'), shopInfo),
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'services_list'), { items: services }),
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'parts_list'), { items: parts }),
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'bookings_list'), { items: bookings })
          ]);
          setSaveStatus('idle'); setIsAdminMode(false); alert("✅ Đã lưu dữ liệu!");
      } catch (error) { setSaveStatus('error'); alert(`❌ Lỗi lưu: ${error.message}`); }
  };
  
  // Debounce saves
  useEffect(() => { if (!isDataLoaded) return; const t = setTimeout(() => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'shop_info'), shopInfo), 2000); return () => clearTimeout(t); }, [shopInfo, isDataLoaded]);
  useEffect(() => { if (!isDataLoaded) return; const t = setTimeout(() => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'services_list'), { items: services }), 2000); return () => clearTimeout(t); }, [services, isDataLoaded]);
  useEffect(() => { if (!isDataLoaded) return; const t = setTimeout(() => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'parts_list'), { items: parts }), 2000); return () => clearTimeout(t); }, [parts, isDataLoaded]);
  useEffect(() => { if (!isDataLoaded) return; const t = setTimeout(() => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'bookings_list'), { items: bookings }), 2000); return () => clearTimeout(t); }, [bookings, isDataLoaded]);

  useEffect(() => { document.title = shopInfo.name || "Tiệm Sửa Xe"; }, [shopInfo.name]);

  // --- LOGIC PHÂN NHÓM (MENU NHÀ HÀNG) ---
  // Lấy danh sách các nhóm (Dựa trên tag đầu tiên của mỗi món)
  const getCategories = (items) => {
      const cats = new Set();
      items.forEach(item => {
          if (item.tags && item.tags.length > 0) {
              cats.add(item.tags[0]); // Lấy tag đầu tiên làm tên nhóm
          } else {
              cats.add("Khác");
          }
      });
      return Array.from(cats).sort();
  };

  const partCategories = getCategories(parts);

  // --- HELPERS ---
  const handleImageUpload = (e, list, setList, itemId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
            const MAX_SIZE = 800; let w = img.width; let h = img.height;
            if (w > h) { if (w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; } } else { if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; } }
            canvas.width = w; canvas.height = h; ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            const updated = list.map(i => i.id === itemId ? { ...i, images: [compressed] } : i);
            setList(updated);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                  const MAX = 500; let w = img.width; let h = img.height;
                  if(w>h){if(w>MAX){h*=MAX/w;w=MAX}}else{if(h>MAX){w*=MAX/h;h=MAX}}
                  canvas.width = w; canvas.height = h; ctx.drawImage(img, 0, 0, w, h);
                  setShopInfo(p => ({...p, logoUrl: canvas.toDataURL('image/jpeg', 0.8)}));
              }
              img.src = ev.target.result;
          }
          reader.readAsDataURL(file);
      }
  }

  const handleRemoveMedia = (list, setList, itemId) => { if(window.confirm('Xóa ảnh?')) setList(list.map(i => i.id === itemId ? { ...i, images: [] } : i)); };
  const moveItem = (idx, dir, list, setList) => { const n = [...list]; if (dir === 'up' && idx > 0) { [n[idx], n[idx - 1]] = [n[idx - 1], n[idx]]; } else if (dir === 'down' && idx < list.length - 1) { [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; } setList(n); };
  
  // Hàm thêm tag: Chỉ nhập 1 lần, dùng làm tên nhóm luôn
  const addTag = (partId) => { const tag = prompt("Nhập tên nhóm (VD: Lốp, Nhớt...):"); if (tag && tag.trim()) { const clean = tag.trim(); setParts(parts.map(p => p.id === partId ? { ...p, tags: [clean] } : p)); } };
  
  const deleteBooking = (id) => { if(window.confirm("Xóa?")) setBookings(bookings.filter(b => b.id !== id)); };
  const createCalendarReminder = () => { window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Bảo dưỡng xe tại " + shopInfo.name)}`, '_blank'); };
  const addNewService = () => setServices([...services, { id: Date.now(), name: "Dịch vụ mới", price: "0đ", images: [], desc: "Mô tả...", variants: [] }]);
  const deleteService = (id) => { if(window.confirm("Xóa?")) setServices(services.filter(s => s.id !== id)); };
  const addNewPart = () => setParts([...parts, { id: Date.now(), name: "Phụ tùng mới", price: "0đ", img: "📦", stock: true, images: [], tags: ["Khác"] }]);
  const handleLogin = () => { const p = shopInfo.adminPassword || "1234"; if (adminPass === p) { setIsAdminMode(true); setShowLoginModal(false); setAdminPass(''); } else { alert('Sai mật khẩu!'); } };
  const handleChangePassword = () => { if(newPassword) { if(window.confirm('Đổi mật khẩu?')) { setShopInfo(p => ({...p, adminPassword: newPassword})); setNewPassword(''); alert('Đã đổi!'); } } };

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 md:pb-0 relative text-base md:text-lg`}>
      
      {/* MODAL & ALERTS */}
      <ItemDetailModal item={viewItem} onClose={() => setViewItem(null)} />
      {permissionError && <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80"><div className="bg-white p-6 rounded-xl"><h2 className="text-red-600 font-bold">LỖI QUYỀN FIREBASE</h2><p>Vui lòng mở quyền read/write trong Firestore Rules.</p><button onClick={() => window.location.reload()} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Tải lại</button></div></div>}

      {/* HEADER */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
        <div className="w-full px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative group shrink-0">
                {shopInfo.logoUrl ? <img src={shopInfo.logoUrl} alt="Logo" className="h-16 w-auto object-contain cursor-pointer" onClick={() => setViewItem({ name: 'Logo Quán', images: [shopInfo.logoUrl] })}/> : <div className="h-16 w-16 bg-orange-500 rounded flex items-center justify-center text-xl font-bold">TM</div>}
                {isAdminMode && <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer rounded opacity-0 group-hover:opacity-100 transition"><Upload size={24} className="text-white"/><input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload}/></label>}
            </div>
            <div className="flex-1 ml-2 overflow-hidden">
                <div className="font-bold text-xl leading-tight truncate"><EditableText isAdminMode={isAdminMode} value={shopInfo.name} onChange={(val) => setShopInfo({...shopInfo, name: val})} className="font-bold"/></div>
                <div className="text-sm text-gray-400 hidden md:block truncate"><EditableText isAdminMode={isAdminMode} value={shopInfo.tagline} onChange={(val) => setShopInfo({...shopInfo, tagline: val})}/></div>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8 text-lg font-medium">
            <button onClick={() => setActiveTab('services')} className={`hover:text-orange-500 ${activeTab === 'services' ? 'text-orange-500' : ''}`}>Dịch Vụ</button>
            <button onClick={() => setActiveTab('parts')} className={`hover:text-orange-500 ${activeTab === 'parts' ? 'text-orange-500' : ''}`}>Phụ Tùng</button>
            <button onClick={() => setActiveTab('reminder')} className={`hover:text-orange-500 ${activeTab === 'reminder' ? 'text-orange-500' : ''}`}>Nhắc Lịch</button>
          </nav>
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={32} /> : <Menu size={32} />}</button>
        </div>
        {isMenuOpen && <div className="md:hidden bg-slate-800 px-4 py-4 space-y-4 text-lg"><button onClick={() => {setActiveTab('services'); setIsMenuOpen(false)}} className="block w-full text-left py-2 border-b border-slate-700">Dịch Vụ</button><button onClick={() => {setActiveTab('parts'); setIsMenuOpen(false)}} className="block w-full text-left py-2 border-b border-slate-700">Phụ Tùng</button><button onClick={() => {setActiveTab('reminder'); setIsMenuOpen(false)}} className="block w-full text-left py-2">Nhắc Lịch</button></div>}
      </header>

      {/* ADMIN PANEL */}
      {isAdminMode && (
        <div className="bg-white border-b-2 border-orange-500 p-4">
            <div className="w-full px-4">
                <div className="flex flex-col lg:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-2"><List className="text-orange-500"/><h2 className="font-bold text-xl">Quản lý ({bookings.length} đơn)</h2>
                        {saveStatus === 'saving' && <span className="text-sm text-orange-500 font-bold animate-pulse">Đang lưu...</span>}
                        {saveStatus === 'error' && <span className="text-sm text-red-500 font-bold">Lỗi lưu!</span>}
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <input type="text" placeholder="Mật khẩu mới..." className="bg-transparent text-sm outline-none w-32 p-2" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                        <button onClick={handleChangePassword} className="bg-slate-900 text-white text-sm px-4 py-2 rounded hover:bg-slate-700 font-bold">Đổi</button>
                    </div>
                </div>
                {/* Booking List */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                    {bookings.map((b) => (
                        <div key={b.id} className="border border-gray-200 p-4 rounded-lg shadow-sm bg-gray-50 relative">
                            <button onClick={() => deleteBooking(b.id)} className="absolute top-2 right-2 text-red-500 p-2"><Trash2 size={20}/></button>
                            <div className="font-bold text-lg">{b.name}</div>
                            <div className="text-base">{b.bike} - {b.time}</div>
                            <div className="text-sm text-gray-500">{b.created_at}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="w-full px-4 md:px-8 lg:px-12 py-8">
        
        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-l-8 border-orange-500 pl-4 py-1">
                <h3 className="text-3xl font-bold uppercase text-slate-800">Dịch Vụ</h3>
                {isAdminMode && <button onClick={addNewService} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg text-lg"><Plus size={24}/> Thêm</button>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {services.map((service, idx) => (
                <div key={service.id} className={`bg-white p-4 rounded-2xl shadow-md border-2 border-gray-100 hover:shadow-xl hover:border-orange-200 transition duration-300 relative group flex flex-col h-full ${!isAdminMode ? 'cursor-pointer' : ''}`} onClick={() => !isAdminMode && setViewItem(service)}>
                  {/* Ảnh Icon */}
                  <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden relative mb-4 border border-gray-200">
                       {(service.images && service.images.length > 0) ? (
                           <img src={service.images[0]} alt="icon" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                       ) : (
                           <Wrench className="text-gray-300" size={64} />
                       )}
                       {isAdminMode && (
                           <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition gap-4">
                               <label className="cursor-pointer text-white hover:text-green-400 p-2 bg-white/10 rounded-full"><Upload size={28}/><input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, services, setServices, service.id)}/></label>
                               {(service.images && service.images.length > 0) && <button onClick={(e) => { e.stopPropagation(); handleRemoveMedia(services, setServices, service.id); }} className="text-red-400 hover:text-red-200 p-2 bg-white/10 rounded-full"><Trash2 size={28}/></button>}
                           </div>
                       )}
                  </div>
                  {/* Admin Controls */}
                  {isAdminMode && (
                    <div className="flex justify-between mb-2">
                        <button onClick={() => moveItem(idx, 'up', services, setServices)} className="p-2 bg-gray-100 rounded hover:bg-blue-100"><ArrowUp size={20}/></button>
                        <button onClick={() => moveItem(idx, 'down', services, setServices)} className="p-2 bg-gray-100 rounded hover:bg-blue-100"><ArrowDown size={20}/></button>
                        <button onClick={() => deleteService(service.id)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 size={20}/></button>
                    </div>
                  )}
                  <div className="flex-1 flex flex-col">
                      <h4 className="font-bold text-slate-900 text-xl mb-2 leading-snug"><EditableText isAdminMode={isAdminMode} value={service.name} onChange={(val) => { const newS = [...services]; newS[idx].name = val; setServices(newS); }} className="font-bold w-full"/></h4>
                      {(!service.variants || service.variants.length === 0) && <div className="text-orange-600 font-extrabold text-2xl mb-2"><EditableText isAdminMode={isAdminMode} value={service.price} onChange={(val) => { const newS = [...services]; newS[idx].price = val; setServices(newS); }}/></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARTS TAB (MENU NHÀ HÀNG STYLE) */}
        {activeTab === 'parts' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8 border-l-8 border-orange-500 pl-4 py-1">
                <h3 className="text-3xl font-bold uppercase text-slate-800">Phụ Tùng</h3>
                {isAdminMode && <button onClick={addNewPart} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg text-lg"><Plus size={24}/> Thêm</button>}
            </div>

            {/* HIỂN THỊ THEO NHÓM (SECTION) */}
            {partCategories.map(category => {
                const itemsInCategory = parts.filter(p => (p.tags && p.tags.length > 0 ? p.tags[0] === category : category === 'Khác'));
                if (itemsInCategory.length === 0) return null;

                return (
                    <div key={category} className="mb-12">
                        {/* TIÊU ĐỀ NHÓM */}
                        <h4 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
                           <Grid size={24} className="text-orange-500"/> {category}
                        </h4>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {itemsInCategory.map((part) => {
                                const idx = parts.findIndex(p => p.id === part.id); // Tìm index thực để sửa
                                return (
                                    <div key={part.id} className={`bg-white rounded-2xl shadow-md overflow-hidden border-2 border-gray-100 hover:border-orange-200 hover:shadow-xl transition duration-300 flex flex-col h-full group ${!isAdminMode ? 'cursor-pointer' : ''}`} onClick={() => !isAdminMode && setViewItem(part)}>
                                        {/* ẢNH */}
                                        <div className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative">
                                            {(part.images && part.images.length > 0) ? (
                                                <img src={part.images[0]} alt={part.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                                            ) : (
                                                <ImageIcon className="text-gray-300" size={64}/>
                                            )}
                                            {/* Admin Controls Overlay */}
                                            {isAdminMode && (
                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition gap-4 z-20">
                                                    <label className="cursor-pointer text-white hover:text-green-300 p-2 bg-white/10 rounded-full"><Upload size={28}/><input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, parts, setParts, part.id)}/></label>
                                                    {(part.images && part.images.length > 0) && <button onClick={(e) => {e.stopPropagation(); handleRemoveMedia(parts, setParts, part.id)}} className="text-red-400 hover:text-red-200 p-2 bg-white/10 rounded-full"><Trash2 size={28}/></button>}
                                                    <div className="flex gap-2 mt-2">
                                                        <button onClick={(e) => {e.stopPropagation(); moveItem(idx, 'up', parts, setParts)}} className="p-2 bg-white/20 text-white rounded"><ArrowUp size={20}/></button>
                                                        <button onClick={(e) => {e.stopPropagation(); moveItem(idx, 'down', parts, setParts)}} className="p-2 bg-white/20 text-white rounded"><ArrowDown size={20}/></button>
                                                        <button onClick={(e) => {e.stopPropagation(); if(window.confirm('Xóa?')) setParts(parts.filter(p => p.id !== part.id))}} className="p-2 bg-red-500/80 text-white rounded"><Trash2 size={20}/></button>
                                                    </div>
                                                    <button onClick={(e) => {e.stopPropagation(); addTag(part.id)}} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full mt-2">Sửa Nhóm</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* NỘI DUNG */}
                                        <div className="p-4 flex flex-col flex-1">
                                            <h5 className="font-bold text-lg text-slate-900 mb-2 leading-tight flex-grow">
                                                <EditableText isAdminMode={isAdminMode} value={part.name} onChange={(val) => { const newP = [...parts]; newP[idx].name = val; setParts(newP); }}/>
                                            </h5>
                                            <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2">
                                                <span className="font-extrabold text-orange-600 text-xl">
                                                    <EditableText isAdminMode={isAdminMode} value={part.price} onChange={(val) => { const newP = [...parts]; newP[idx].price = val; setParts(newP); }}/>
                                                </span>
                                                {/* TRẠNG THÁI KHO: CHỈ HIỆN CÒN HOẶC HẾT */}
                                                {isAdminMode ? (
                                                    <label className="flex items-center gap-2 text-sm cursor-pointer bg-gray-100 px-3 py-2 rounded-lg font-bold">
                                                        <input type="checkbox" checked={part.stock} onChange={(e) => { const newP = [...parts]; newP[idx].stock = e.target.checked; setParts(newP); }} className="w-5 h-5"/>
                                                        {part.stock ? "Đang hiện CÒN" : "Đang hiện HẾT"}
                                                    </label>
                                                ) : (
                                                    <div className={`text-center font-black text-sm py-1 rounded ${part.stock ? 'text-green-600 bg-green-100' : 'text-red-500 bg-red-100'}`}>
                                                        {part.stock ? 'CÒN' : 'HẾT'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
          </div>
        )}

        {/* REMINDER TAB */}
        {activeTab === 'reminder' && (
          <div className="animate-fade-in py-8">
             <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-gray-100 text-center max-w-2xl mx-auto">
                <Bell className="w-24 h-24 text-orange-500 mx-auto mb-6" />
                <h4 className="text-3xl font-black mb-4 text-slate-800">ĐỪNG ĐỂ XE HỎNG MỚI SỬA!</h4>
                <p className="text-gray-600 text-xl mb-8 leading-relaxed">Cài đặt lịch nhắc nhở trên điện thoại để không quên thay nhớt mỗi <span className="font-bold text-orange-600">1.500km</span>.</p>
                <button onClick={createCalendarReminder} className="bg-blue-600 text-white py-4 px-10 rounded-2xl font-bold text-xl shadow-xl hover:bg-blue-700 transform hover:scale-105 transition flex items-center justify-center gap-3 w-full md:w-auto mx-auto">
                    <Calendar size={28}/> THÊM VÀO LỊCH
                </button>
             </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 mt-12 pb-32">
        <div className="w-full px-4 md:px-8 lg:px-12 grid md:grid-cols-2 gap-10">
          <div>
            <h4 className="text-white font-bold text-2xl mb-6">{shopInfo.name}</h4>
            <div className="space-y-4 text-lg">
              <p className="flex items-start gap-3"><MapPin className="text-orange-500 shrink-0 mt-1" size={24} /><EditableText isAdminMode={isAdminMode} value={shopInfo.address} onChange={(val) => setShopInfo({...shopInfo, address: val})} className="text-slate-300"/></p>
              <p className="flex items-center gap-3"><Clock className="text-orange-500 shrink-0" size={24} /><EditableText isAdminMode={isAdminMode} value={shopInfo.workingHours} onChange={(val) => setShopInfo({...shopInfo, workingHours: val})} className="text-slate-300"/></p>
              <p className="flex items-center gap-3"><Phone className="text-orange-500 shrink-0" size={24} /><EditableText isAdminMode={isAdminMode} value={shopInfo.phone} onChange={(val) => setShopInfo({...shopInfo, phone: val})} className="text-slate-300"/></p>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 self-start group">
            <h5 className="text-white font-bold flex items-center gap-3 mb-4 text-xl"><Wifi size={24} className="text-green-400"/> Wifi Miễn Phí</h5>
            <div className="bg-slate-900 p-4 rounded-xl text-center relative z-10">
              <div className="text-sm text-gray-400 mb-1">Tên mạng:</div>
              <div className="font-mono text-2xl text-orange-400 font-bold tracking-wide mb-3"><EditableText isAdminMode={isAdminMode} value={shopInfo.wifi} onChange={(val) => setShopInfo({...shopInfo, wifi: val})}/></div>
              <div className="h-px bg-slate-700 my-2"></div>
              <div className="text-sm text-gray-400 mb-1">Mật khẩu:</div>
              <div className="font-mono text-2xl text-white tracking-widest"><EditableText isAdminMode={isAdminMode} value={shopInfo.wifiPass} onChange={(val) => setShopInfo({...shopInfo, wifiPass: val})}/></div>
            </div>
            <div className="mt-6 text-center relative">
                <p className="text-sm text-gray-400 mb-3 uppercase font-bold">Quét QR chuyển khoản</p>
                {shopInfo.qrCodeUrl ? <img src={shopInfo.qrCodeUrl} alt="QR" className="w-48 h-48 mx-auto rounded-xl border-4 border-white shadow-lg"/> : <div className="w-48 h-48 mx-auto bg-gray-700 flex items-center justify-center text-sm text-gray-400 rounded-xl">Chưa có QR</div>}
                {isAdminMode && <label className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition rounded-xl"><span className="text-white font-bold bg-blue-600 px-4 py-2 rounded-lg shadow">Đổi QR</span><input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, shopInfo, setShopInfo, 'qrCodeUrl')}/></label>}
            </div>
          </div>
        </div>
        {!isAdminMode && <div className="flex justify-end mt-8 pt-8 border-t border-slate-800 mr-4 md:mr-8"><button onClick={() => setShowLoginModal(true)} className="text-gray-500 hover:text-white flex items-center gap-2 text-sm bg-slate-800 px-4 py-2 rounded-full"><Settings size={16}/> Quản lý tiệm</button></div>}
      </footer>

      {/* ADMIN FLOATING BAR */}
      {isAdminMode && (
          <div className="fixed bottom-0 left-0 w-full bg-slate-900 text-white p-4 flex justify-between items-center z-50 border-t-4 border-orange-500 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                  <span className="font-bold text-lg">CHẾ ĐỘ ADMIN</span>
              </div>
              <button 
                onClick={forceSaveAll} 
                className={`bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg transform active:scale-95 transition ${saveStatus === 'saving' ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={saveStatus === 'saving'}
              >
                  {saveStatus === 'saving' ? 'ĐANG LƯU...' : <><Save size={24}/> LƯU & THOÁT</>}
              </button>
          </div>
      )}

      {/* MODAL LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm animate-zoom-in shadow-2xl">
                <h3 className="font-bold text-2xl mb-6 text-center text-slate-900">Đăng nhập chủ tiệm</h3>
                <input type="password" className="w-full border-2 border-gray-300 p-4 rounded-xl mb-6 text-center text-2xl tracking-widest focus:border-orange-500 outline-none font-bold" placeholder="••••" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} autoFocus/>
                <button onClick={handleLogin} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 shadow-lg">TRUY CẬP</button>
                {(!shopInfo.adminPassword || shopInfo.adminPassword === '1234') && (
                    <p className="text-center text-sm text-red-500 mt-4 font-medium bg-red-50 p-2 rounded">Mật khẩu mặc định: 1234</p>
                )}
            </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-zoom-in { animation: zoomIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default OnePageMechanic;
