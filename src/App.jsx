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
  Copy
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

// --- COMPONENT EDITABLE TEXT ---
const EditableText = ({ isAdminMode, value, onChange, className, placeholder, multiline = false, style }) => {
  const safeValue = value === null || value === undefined ? '' : value;

  if (!isAdminMode) {
    return <span className={className} style={{whiteSpace: 'pre-wrap', ...style}}>{safeValue}</span>;
  }
  
  const inputClass = `bg-white text-gray-900 border-2 border-orange-500 rounded px-2 py-1 outline-none shadow-lg min-w-[100px] text-sm md:text-base block ${className}`;
  
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

const OnePageMechanic = () => {
  // --- STATE QUẢN LÝ CHẾ ĐỘ ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newPassword, setNewPassword] = useState(''); 
  const fileInputRef = useRef(null); 
  const [isDataLoaded, setIsDataLoaded] = useState(false); 
  const [saveStatus, setSaveStatus] = useState('idle');
  const [authStatus, setAuthStatus] = useState('checking');
  const [permissionError, setPermissionError] = useState(false);

  // --- STATE DỮ LIỆU ---
  const [activeTab, setActiveTab] = useState('services');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bookingData, setBookingData] = useState({ name: '', phone: '', bike: '', service: '', time: '' });
  const [selectedTag, setSelectedTag] = useState('Tất cả');

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
    { id: 3, name: "Vá lốp không ruột", price: "30.000đ / lỗ", iconUrl: null, desc: "Vá nấm chuẩn kỹ thuật, không hại lốp.", variants: [] }
  ];

  const defaultParts = [
    { id: 1, name: "Lốp Michelin City Grip", price: "850.000đ", img: "⚫", stock: true, imageFile: null, tags: ["Lốp", "Michelin"] },
    { id: 2, name: "Nhớt Motul Scooter", price: "160.000đ", img: "🛢️", stock: true, imageFile: null, tags: ["Nhớt", "Tay Ga"] },
    { id: 3, name: "Gương gù CRG", price: "250.000đ", img: "🔍", stock: false, imageFile: null, tags: ["Kiểng"] },
  ];

  const [shopInfo, setShopInfo] = useState(defaultShopInfo);
  const [services, setServices] = useState(defaultServices);
  const [parts, setParts] = useState(defaultParts);
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);

  // --- FIREBASE AUTH ---
  useEffect(() => {
    const initAuth = async () => {
        try {
            await signInAnonymously(auth);
            setAuthStatus('logged-in');
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            setAuthStatus('error');
        }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
        if(u) setAuthStatus('logged-in');
        setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // --- FIREBASE READ ---
  useEffect(() => {
    if (!user) return;

    const paths = {
        shop: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'shop_info'),
        services: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'services_list'),
        parts: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'parts_list'),
        bookings: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'bookings_list')
    };

    const handleSnapshotError = (error) => {
        console.error("Lỗi đọc dữ liệu:", error);
        if (error.code === 'permission-denied') {
            setPermissionError(true);
        }
    };

    const unsubShop = onSnapshot(paths.shop, (docSnap) => {
        if (docSnap.exists()) setShopInfo(prev => ({ ...prev, ...docSnap.data() }));
    }, handleSnapshotError);

    const unsubServices = onSnapshot(paths.services, (docSnap) => {
        if (docSnap.exists()) setServices(docSnap.data().items || []);
    }, handleSnapshotError);

    const unsubParts = onSnapshot(paths.parts, (docSnap) => {
        if (docSnap.exists()) setParts(docSnap.data().items || []);
    }, handleSnapshotError);

    const unsubBookings = onSnapshot(paths.bookings, (docSnap) => {
        if (docSnap.exists()) setBookings(docSnap.data().items || []);
        setIsDataLoaded(true);
    }, handleSnapshotError);

    return () => {
        unsubShop();
        unsubServices();
        unsubParts();
        unsubBookings();
    };
  }, [user]);

  // --- FIREBASE WRITE (AUTO SAVE) ---
  const saveDataToFirebase = async (collectionName, data) => {
      if (!isDataLoaded || !user) return;
      setSaveStatus('saving');
      try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', collectionName), data);
          setSaveStatus('idle');
      } catch (error) {
          console.error("Lỗi lưu tự động:", error);
          if (error.code === 'permission-denied') {
              setPermissionError(true);
              setSaveStatus('permission-denied');
          } else {
              setSaveStatus('error');
          }
      }
  };

  // --- FORCE SAVE FUNCTION (Dùng cho nút Lưu & Thoát) ---
  const forceSaveAll = async () => {
      if (!user) return;
      setSaveStatus('saving');
      try {
          // Lưu đồng thời tất cả các mục
          await Promise.all([
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'shop_info'), shopInfo),
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'services_list'), { items: services }),
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'parts_list'), { items: parts }),
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'bookings_list'), { items: bookings })
          ]);
          setSaveStatus('idle');
          setIsAdminMode(false); // Chỉ thoát khi đã lưu xong
          alert("✅ Đã lưu dữ liệu thành công lên đám mây!");
      } catch (error) {
          console.error("Lỗi lưu thủ công:", error);
          setSaveStatus('error');
          alert(`❌ Lỗi lưu dữ liệu: ${error.message}\n\nCó thể do:\n1. Ảnh quá nặng (tổng > 1MB)\n2. Chưa mở quyền Firebase Rules.`);
      }
  };

  useEffect(() => {
      if (!isDataLoaded) return;
      const timer = setTimeout(() => saveDataToFirebase('shop_info', shopInfo), 2000);
      return () => clearTimeout(timer);
  }, [shopInfo, isDataLoaded, user]);

  useEffect(() => {
      if (!isDataLoaded) return;
      const timer = setTimeout(() => saveDataToFirebase('services_list', { items: services }), 2000);
      return () => clearTimeout(timer);
  }, [services, isDataLoaded, user]);

  useEffect(() => {
      if (!isDataLoaded) return;
      const timer = setTimeout(() => saveDataToFirebase('parts_list', { items: parts }), 2000);
      return () => clearTimeout(timer);
  }, [parts, isDataLoaded, user]);

  useEffect(() => {
      if (!isDataLoaded) return;
      const timer = setTimeout(() => saveDataToFirebase('bookings_list', { items: bookings }), 2000);
      return () => clearTimeout(timer);
  }, [bookings, isDataLoaded, user]);

  useEffect(() => { document.title = shopInfo.name || "Tiệm Sửa Xe"; }, [shopInfo.name]);

  // --- LOGIC ---
  const uniqueTags = ['Tất cả', ...new Set(parts.flatMap(part => part.tags || []))];
  const filteredParts = selectedTag === 'Tất cả' ? parts : parts.filter(part => part.tags && part.tags.includes(selectedTag));

  // --- HÀM XỬ LÝ ẢNH (NÉN ẢNH CHẤT LƯỢNG CAO HƠN - 800px, 0.8) ---
  const handleImageUpload = (e, targetState, setTargetState, fieldName, itemId = null) => {
    const file = e.target.files[0];
    if (file) {
      // Bỏ giới hạn size đầu vào, để canvas tự nén
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // TĂNG KÍCH THƯỚC LÊN 800px (Rõ hơn)
            const MAX_WIDTH = 800; 
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // TĂNG CHẤT LƯỢNG LÊN 0.8 (Đẹp hơn)
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

            if (itemId !== null) {
                const updatedList = targetState.map(item => item.id === itemId ? { ...item, [fieldName]: compressedDataUrl } : item);
                setTargetState(updatedList);
            } else { 
                setTargetState({ ...targetState, [fieldName]: compressedDataUrl }); 
            }
        };
        img.onerror = () => {
            alert("Không thể đọc file ảnh này.");
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const moveItem = (index, direction, list, setList) => {
    const newList = [...list];
    if (direction === 'up' && index > 0) { [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]]; }
    else if (direction === 'down' && index < list.length - 1) { [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]]; }
    setList(newList);
  };

  const addTag = (partId) => {
    const tag = prompt("Nhập tên nhóm:");
    if (tag) {
        const cleanTag = tag.trim(); if(!cleanTag) return;
        const newParts = parts.map(p => {
            if (p.id === partId) { const currentTags = p.tags || []; if (currentTags.includes(cleanTag)) return p; return { ...p, tags: [...currentTags, cleanTag] }; }
            return p;
        });
        setParts(newParts);
    }
  };

  const removeTag = (partId, tagIndex) => {
      const newParts = parts.map(p => { if (p.id === partId && p.tags) { return { ...p, tags: p.tags.filter((_, i) => i !== tagIndex) }; } return p; });
      setParts(newParts);
  };

  const handleChangePassword = () => {
      if (newPassword && newPassword.length > 0) {
          if (window.confirm(`Đổi mật khẩu thành: ${newPassword}?`)) {
              setShopInfo(prev => ({...prev, adminPassword: newPassword}));
              setNewPassword('');
              alert("Đổi mật khẩu thành công!");
          }
      }
  };

  const handleLogin = () => {
    const currentPass = shopInfo.adminPassword || "1234";
    if (adminPass === currentPass) { setIsAdminMode(true); setShowLoginModal(false); setAdminPass(''); } else { alert('Sai mật khẩu!'); }
  };

  const deleteBooking = (id) => { if(window.confirm("Xóa?")) setBookings(bookings.filter(b => b.id !== id)); };
  const createCalendarReminder = () => { window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Bảo dưỡng xe tại " + shopInfo.name)}`, '_blank'); };
  const addNewService = () => setServices([...services, { id: Date.now(), name: "Dịch vụ mới", price: "0đ", iconUrl: null, desc: "Mô tả...", variants: [] }]);
  const deleteService = (id) => { if(window.confirm("Xóa?")) setServices(services.filter(s => s.id !== id)); };
  const addNewPart = () => setParts([...parts, { id: Date.now(), name: "Phụ tùng mới", price: "0đ", img: "📦", stock: true, tags: [] }]);

  const rulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-800 font-sans pb-20 md:pb-0 relative ${isAdminMode ? 'mb-24' : ''}`}>
      
      {/* MODAL LỖI QUYỀN TRUY CẬP */}
      {permissionError && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
                <div className="bg-red-600 text-white p-4 flex items-center gap-2">
                    <ShieldAlert size={24}/>
                    <h2 className="font-bold text-lg">CẦN CẤU HÌNH FIREBASE RULES</h2>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-700">Web không thể lưu dữ liệu vì Firebase đang chặn quyền ghi. Hãy làm theo các bước sau:</p>
                    <ol className="list-decimal pl-5 text-sm space-y-2 text-gray-600">
                        <li>Truy cập <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 underline font-bold">Firebase Console</a> {'>'} Chọn dự án <strong>van-nghia-moto</strong>.</li>
                        <li>Ở menu trái, chọn <strong>Firestore Database</strong> {'>'} Tab <strong>Rules</strong>.</li>
                        <li>Dán đoạn code dưới đây vào và bấm Publish:</li>
                    </ol>
                    
                    <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs md:text-sm overflow-x-auto relative group">
                        <pre>{rulesSnippet}</pre>
                        <button onClick={() => navigator.clipboard.writeText(rulesSnippet)} className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white px-2 py-1 rounded text-xs flex items-center gap-1"><Copy size={12}/> Copy</button>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700">Đã sửa xong, tải lại trang</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
        <div className="w-full px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative group shrink-0">
                {/* LOGO: HIỂN THỊ TỰ NHIÊN, BỎ KHUNG, BỎ BO TRÒN */}
                {shopInfo.logoUrl ? (
                    <img src={shopInfo.logoUrl} alt="Logo" className="h-16 w-auto object-contain"/>
                ) : (
                    <div className="h-16 w-16 bg-orange-500 rounded flex items-center justify-center text-xl font-bold">TM</div>
                )}
                {isAdminMode && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer opacity-0 group-hover:opacity-100 transition rounded">
                        <Upload size={18} className="text-white"/>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, shopInfo, setShopInfo, 'logoUrl')}/>
                    </label>
                )}
            </div>
            <div className="flex-1 max-w-md ml-2 overflow-hidden">
                <div className="font-bold text-lg leading-tight truncate">
                    <EditableText isAdminMode={isAdminMode} value={shopInfo.name} onChange={(val) => setShopInfo({...shopInfo, name: val})} className="font-bold"/>
                </div>
                <div className="text-xs text-gray-400 hidden md:block truncate">
                    <EditableText isAdminMode={isAdminMode} value={shopInfo.tagline} onChange={(val) => setShopInfo({...shopInfo, tagline: val})}/>
                </div>
            </div>
          </div>
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <button onClick={() => setActiveTab('services')} className={`hover:text-orange-500 ${activeTab === 'services' ? 'text-orange-500' : ''}`}>Dịch Vụ</button>
            <button onClick={() => setActiveTab('parts')} className={`hover:text-orange-500 ${activeTab === 'parts' ? 'text-orange-500' : ''}`}>Phụ Tùng</button>
            <button onClick={() => setActiveTab('reminder')} className={`hover:text-orange-500 ${activeTab === 'reminder' ? 'text-orange-500' : ''}`}>Nhắc Lịch</button>
          </nav>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-slate-800 px-4 py-2 space-y-2">
            <button onClick={() => {setActiveTab('services'); setIsMenuOpen(false)}} className="block w-full text-left py-2 border-b border-slate-700">Dịch Vụ</button>
            <button onClick={() => {setActiveTab('parts'); setIsMenuOpen(false)}} className="block w-full text-left py-2 border-b border-slate-700">Phụ Tùng</button>
            <button onClick={() => {setActiveTab('reminder'); setIsMenuOpen(false)}} className="block w-full text-left py-2">Nhắc Lịch</button>
          </div>
        )}
      </header>

      {/* ADMIN PANEL */}
      {isAdminMode && (
        <div className="bg-white border-b-2 border-orange-500 p-4">
            <div className="w-full px-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <List className="text-orange-500"/>
                            <h2 className="font-bold text-xl">Quản lý & Trạng thái</h2>
                        </div>
                        
                        <div className="flex gap-2 text-xs font-bold mt-1">
                            {authStatus === 'checking' && <span className="text-gray-500">Đang kết nối...</span>}
                            {authStatus === 'logged-in' && <span className="text-green-600 flex items-center gap-1"><Wifi size={12}/> Đã kết nối Cloud</span>}
                            {authStatus === 'error' && <span className="text-red-500 flex items-center gap-1"><ShieldAlert size={12}/> Lỗi kết nối Auth</span>}

                            <span className="text-gray-300">|</span>

                            {saveStatus === 'idle' && <span className="text-green-600">Dữ liệu an toàn</span>}
                            {saveStatus === 'saving' && <span className="text-orange-500 animate-pulse">Đang lưu lên mây...</span>}
                            {saveStatus === 'error' && <span className="text-red-500">Lỗi lưu! (Kiểm tra ảnh)</span>}
                            {saveStatus === 'permission-denied' && (
                                <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded animate-pulse flex items-center gap-1 cursor-pointer" onClick={() => setPermissionError(true)}>
                                    <ShieldAlert size={12}/> LỖI QUYỀN (Bấm để xem cách sửa)
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg mt-2 lg:mt-0">
                        <Lock size={16} className="text-gray-500"/>
                        <input type="text" placeholder="Mật khẩu mới..." className="bg-transparent text-sm outline-none w-32" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                        <button onClick={handleChangePassword} className="bg-slate-900 text-white text-xs px-2 py-1 rounded hover:bg-slate-700">Đổi</button>
                    </div>
                </div>
                {bookings.length === 0 ? <p className="text-gray-500 italic text-sm">Chưa có khách đặt lịch.</p> : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 max-h-60 overflow-y-auto">
                        {bookings.map((b) => (
                            <div key={b.id} className="border border-gray-200 p-3 rounded-lg shadow-sm bg-gray-50 relative">
                                <button onClick={() => deleteBooking(b.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                <div className="font-bold text-slate-800">{b.name} <span className="text-gray-500 font-normal">- {b.phone}</span></div>
                                <div className="text-sm text-gray-600 mt-1"><span className="font-semibold text-orange-600">{b.bike}</span> • {b.time}</div>
                                <div className="text-sm text-gray-700 mt-1 bg-white p-1 rounded border border-gray-100">"{b.service}"</div>
                                <div className="text-xs text-gray-400 mt-1 text-right">{b.created_at}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="bg-slate-800 text-white py-8 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10 w-full px-4 mx-auto">
          <div className="text-orange-500 font-bold uppercase tracking-wider text-sm mb-2">{shopInfo.tagline}</div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
             <EditableText isAdminMode={isAdminMode} value={shopInfo.heroTitle} onChange={(val) => setShopInfo({...shopInfo, heroTitle: val})} className="bg-transparent text-white text-center w-full block" multiline={true} style={{color: isAdminMode ? 'black' : 'white'}}/>
          </h2>
          <div className="text-gray-300 mb-6 max-w-4xl mx-auto">
             <EditableText isAdminMode={isAdminMode} value={shopInfo.heroDesc} onChange={(val) => setShopInfo({...shopInfo, heroDesc: val})} className="bg-transparent text-gray-300 text-center w-full block text-sm md:text-lg" multiline={true} style={{color: isAdminMode ? 'black' : '#d1d5db'}}/>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="w-full px-4 md:px-8 lg:px-12 py-8">
        
        {/* SERVICES TAB - ĐÃ SỬA THÀNH DẠNG CARD DỌC ĐỂ ẢNH TO */}
        {activeTab === 'services' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-l-4 border-orange-500 pl-3">
                <h3 className="text-xl font-bold uppercase">Bảng Giá Dịch Vụ</h3>
                {isAdminMode && <button onClick={addNewService} className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-green-700"><Plus size={16}/> Thêm</button>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {services.map((service, idx) => (
                // Chuyển sang flex-col để ảnh nằm trên, nội dung nằm dưới
                <div key={service.id} className={`bg-white p-0 rounded-xl shadow-sm border ${isAdminMode ? 'border-dashed border-orange-300' : 'border-gray-100'} hover:shadow-md transition relative group flex flex-col h-full overflow-hidden`}>
                  {isAdminMode && (
                      <div className="absolute top-2 right-2 z-20 flex gap-1">
                          <button onClick={() => moveItem(idx, 'up', services, setServices)} className="text-white hover:text-blue-300 p-1 bg-black/30 rounded-full backdrop-blur-sm" title="Lên"><ArrowUp size={14}/></button>
                          <button onClick={() => moveItem(idx, 'down', services, setServices)} className="text-white hover:text-blue-300 p-1 bg-black/30 rounded-full backdrop-blur-sm" title="Xuống"><ArrowDown size={14}/></button>
                          <button onClick={() => deleteService(service.id)} className="text-white hover:text-red-300 p-1 bg-red-500/80 rounded-full backdrop-blur-sm" title="Xóa"><Trash2 size={14}/></button>
                      </div>
                  )}
                  
                  {/* KHUNG ẢNH TO - ASPECT SQUARE (VUÔNG) */}
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-4xl overflow-hidden relative group/icon">
                       {service.iconUrl ? (
                           <img src={service.iconUrl} alt="icon" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                       ) : (
                           <Wrench className="text-gray-400" size={48} />
                       )}
                       {isAdminMode && (
                           <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 cursor-pointer transition">
                               <Upload className="text-white" size={24}/>
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, services, setServices, 'iconUrl', service.id)}/>
                           </label>
                       )}
                  </div>

                  {/* NỘI DUNG DỊCH VỤ */}
                  <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 w-full text-base">
                            <EditableText isAdminMode={isAdminMode} value={service.name} onChange={(val) => { const newS = [...services]; newS[idx].name = val; setServices(newS); }} className="font-bold w-full"/>
                        </h4>
                      </div>
                      
                      {(!service.variants || service.variants.length === 0) && (
                         <div className="text-orange-600 font-bold text-lg mb-2">
                            <EditableText isAdminMode={isAdminMode} value={service.price} onChange={(val) => { const newS = [...services]; newS[idx].price = val; setServices(newS); }}/>
                         </div>
                      )}

                      <div className="text-sm text-gray-500 mb-2 flex-grow">
                            <EditableText isAdminMode={isAdminMode} value={service.desc} onChange={(val) => { const newS = [...services]; newS[idx].desc = val; setServices(newS); }} multiline={true} className="w-full text-xs"/>
                      </div>

                      {(service.variants && service.variants.length > 0 || isAdminMode) && (
                        <div className="mt-auto bg-gray-50 p-2 rounded text-sm space-y-2 border-t border-gray-100">
                            {service.variants?.map((variant, vIdx) => (
                                <div key={vIdx} className="flex justify-between items-center border-b border-gray-200 last:border-0 pb-1 last:pb-0">
                                    <div className="flex-1 flex gap-2">
                                        <EditableText isAdminMode={isAdminMode} value={variant.name} onChange={(val) => { const newS = [...services]; newS[idx].variants[vIdx].name = val; setServices(newS); }} className="w-full text-gray-600"/>
                                        <EditableText isAdminMode={isAdminMode} value={variant.price} onChange={(val) => { const newS = [...services]; newS[idx].variants[vIdx].price = val; setServices(newS); }} className="w-full font-bold text-orange-600 text-right"/>
                                    </div>
                                    {isAdminMode && <button onClick={() => { const newS = [...services]; newS[idx].variants = newS[idx].variants.filter((_, i) => i !== vIdx); setServices(newS); }} className="text-red-400 ml-2"><X size={14}/></button>}
                                </div>
                            ))}
                            {isAdminMode && <button onClick={() => { const newS = [...services]; if(!newS[idx].variants) newS[idx].variants = []; newS[idx].variants.push({name: 'Loại mới', price: '0đ'}); setServices(newS); }} className="text-xs text-blue-600 flex items-center gap-1 mt-1 hover:underline">+ Thêm loại giá</button>}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARTS TAB */}
        {activeTab === 'parts' && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-l-4 border-orange-500 pl-3">
                <h3 className="text-xl font-bold uppercase">Phụ Tùng</h3>
                {isAdminMode && <button onClick={addNewPart} className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-green-700"><Plus size={16}/> Thêm</button>}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                <div className="flex items-center gap-1 mr-2 text-gray-500 text-sm">
                    <Filter size={16}/> Lọc:
                </div>
                {uniqueTags.map((tag) => (
                    <button 
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                            selectedTag === tag 
                            ? 'bg-orange-500 text-white shadow-md' 
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
              {filteredParts.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-gray-400">Không tìm thấy sản phẩm nào thuộc nhóm "{selectedTag}".</div>
              ) : (
                filteredParts.map((part, idx) => (
                    <div key={part.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border ${isAdminMode ? 'border-dashed border-orange-300' : 'border-gray-100'} flex flex-col relative h-full group hover:shadow-lg transition-shadow duration-300`}>
                    {isAdminMode && (
                        <div className="absolute top-2 right-2 z-20 flex gap-1">
                            <button onClick={() => moveItem(idx, 'up', parts, setParts)} className="text-white hover:text-blue-300 p-1 bg-black/30 rounded-full backdrop-blur-sm" title="Lên"><ArrowUp size={14}/></button>
                            <button onClick={() => moveItem(idx, 'down', parts, setParts)} className="text-white hover:text-blue-300 p-1 bg-black/30 rounded-full backdrop-blur-sm" title="Xuống"><ArrowDown size={14}/></button>
                            <button onClick={() => {if(window.confirm('Xóa?')) setParts(parts.filter(p => p.id !== part.id))}} className="text-white hover:text-red-300 p-1 bg-red-500/80 rounded-full backdrop-blur-sm" title="Xóa"><Trash2 size={14}/></button>
                        </div>
                    )}
                    
                    <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-1 max-w-[70%]">
                        {part.tags && part.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 cursor-pointer hover:bg-red-700 backdrop-blur-sm" onClick={() => setSelectedTag(tag)}>
                                {tag}
                                {isAdminMode && <button onClick={(e) => { e.stopPropagation(); removeTag(part.id, tIdx); }} className="hover:text-black ml-1"><X size={10}/></button>}
                            </span>
                        ))}
                        {isAdminMode && (
                            <button onClick={() => addTag(part.id)} className="bg-blue-600/90 text-white text-[10px] px-1.5 py-0.5 rounded hover:bg-blue-700 flex items-center gap-1 shadow backdrop-blur-sm"><Plus size={10}/> Tag</button>
                        )}
                    </div>

                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-4xl overflow-hidden relative group">
                        {part.imageFile ? (
                            <img src={part.imageFile} alt={part.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                        ) : (
                            <ImageIcon className="text-gray-300" size={48}/>
                        )}
                        {isAdminMode && (
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
                                <Upload className="text-white" size={20}/>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, parts, setParts, 'imageFile', part.id)}/>
                            </label>
                        )}
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2 mb-2 flex-grow">
                            <EditableText isAdminMode={isAdminMode} value={part.name} onChange={(val) => { const newP = [...parts]; newP[idx].name = val; setParts(newP); }}/>
                        </h4>
                        <div className="mt-auto pt-2 flex justify-between items-end border-t border-gray-100">
                            <span className="font-bold text-orange-600 text-lg">
                                <EditableText isAdminMode={isAdminMode} value={part.price} onChange={(val) => { const newP = [...parts]; newP[idx].price = val; setParts(newP); }}/>
                            </span>
                            
                            {isAdminMode ? (
                                <label className="flex items-center gap-1 text-[10px] cursor-pointer bg-gray-100 px-2 py-1 rounded">
                                    <input type="checkbox" checked={part.stock} onChange={(e) => { const newP = [...parts]; newP[idx].stock = e.target.checked; setParts(newP); }}/>
                                    {part.stock ? "Còn hàng" : "Hết"}
                                </label>
                            ) : (
                                part.stock ? 
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={10}/> Có hàng</span> : 
                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1"><AlertCircle size={10}/> Hết hàng</span>
                            )}
                        </div>
                    </div>
                    </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* REMINDER TAB */}
        {activeTab === 'reminder' && (
          <div className="animate-fade-in">
             <h3 className="text-xl font-bold border-l-4 border-orange-500 pl-3 mb-6 uppercase">Nhắc Lịch Bảo Dưỡng</h3>
             <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-100 w-full flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                        <Bell className="w-10 h-10 text-orange-500" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold mb-2">Đừng để xe hỏng mới sửa!</h4>
                        <p className="text-gray-600 text-lg">Cài đặt lịch nhắc nhở trên điện thoại của bạn để không quên thay nhớt mỗi <span className="font-bold text-orange-600">1.500km</span>.</p>
                        <ul className="mt-4 text-sm text-gray-500 grid md:grid-cols-2 gap-x-4 gap-y-2 text-left">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Giúp xe bền bỉ hơn</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Tiết kiệm xăng</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Tránh hư hỏng nặng</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> An toàn khi vận hành</li>
                        </ul>
                    </div>
                </div>
                <div className="shrink-0">
                    <button onClick={createCalendarReminder} className="bg-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 hover:scale-105 transition transform flex items-center gap-3">
                        <Calendar size={24}/> Thêm vào Lịch
                    </button>
                    <p className="text-xs text-gray-400 mt-2 text-center">Tự động mở Google Calendar</p>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-8 px-4 mt-8 pb-24">
        <div className="w-full px-4 md:px-8 lg:px-12 grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-white font-bold text-lg mb-4">{shopInfo.name}</h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-3"><MapPin className="text-orange-500 shrink-0" size={18} /><EditableText isAdminMode={isAdminMode} value={shopInfo.address} onChange={(val) => setShopInfo({...shopInfo, address: val})} className="text-slate-300"/></p>
              <p className="flex items-center gap-3"><Clock className="text-orange-500 shrink-0" size={18} /><EditableText isAdminMode={isAdminMode} value={shopInfo.workingHours} onChange={(val) => setShopInfo({...shopInfo, workingHours: val})} className="text-slate-300"/></p>
              <p className="flex items-center gap-3"><Phone className="text-orange-500 shrink-0" size={18} /><EditableText isAdminMode={isAdminMode} value={shopInfo.phone} onChange={(val) => setShopInfo({...shopInfo, phone: val})} className="text-slate-300"/></p>
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 self-start relative overflow-hidden group">
            <h5 className="text-white font-bold flex items-center gap-2 mb-3"><Wifi size={18} className="text-green-400"/> Wifi Miễn Phí</h5>
            <div className="bg-slate-900 p-3 rounded text-center relative z-10">
              <div className="text-xs text-gray-400">Tên mạng:</div>
              <div className="font-mono text-lg text-orange-400 font-bold tracking-wide"><EditableText isAdminMode={isAdminMode} value={shopInfo.wifi} onChange={(val) => setShopInfo({...shopInfo, wifi: val})}/></div>
              <div className="h-px bg-slate-700 my-2"></div>
              <div className="text-xs text-gray-400">Mật khẩu:</div>
              <div className="font-mono text-white tracking-widest"><EditableText isAdminMode={isAdminMode} value={shopInfo.wifiPass} onChange={(val) => setShopInfo({...shopInfo, wifiPass: val})}/></div>
            </div>
            <div className="mt-4 text-center relative">
                <p className="text-xs text-gray-400 mb-2">QR Chuyển khoản:</p>
                {shopInfo.qrCodeUrl ? <img src={shopInfo.qrCodeUrl} alt="QR" className="w-32 h-32 mx-auto rounded border-2 border-white"/> : <div className="w-32 h-32 mx-auto bg-gray-700 flex items-center justify-center text-xs text-gray-400">Chưa có QR</div>}
                {isAdminMode && <label className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition"><span className="text-white text-xs bg-blue-600 px-2 py-1 rounded">Đổi QR</span><input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, shopInfo, setShopInfo, 'qrCodeUrl')}/></label>}
            </div>
          </div>
        </div>
        {!isAdminMode && <div className="flex justify-end mt-4 pt-4 border-t border-slate-800 mr-4 md:mr-8"><button onClick={() => setShowLoginModal(true)} className="text-gray-600 hover:text-white flex items-center gap-1 text-xs"><Settings size={14}/> Quản lý tiệm</button></div>}
      </footer>

      {/* ADMIN FLOATING BAR */}
      {isAdminMode && (
          <div className="fixed bottom-0 left-0 w-full bg-slate-900 text-white p-3 flex justify-between items-center z-50 border-t-2 border-orange-500 shadow-2xl">
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-bold text-sm">CHẾ ĐỘ QUẢN LÝ (ADMIN)</span>
              </div>
              <button 
                onClick={forceSaveAll} 
                className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 text-sm ${saveStatus === 'saving' ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={saveStatus === 'saving'}
              >
                  {saveStatus === 'saving' ? 'ĐANG LƯU...' : <><Save size={16}/> LƯU & THOÁT</>}
              </button>
          </div>
      )}

      {/* MODAL LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
            <div className="bg-white rounded-lg p-6 w-full max-w-sm relative z-10 animate-slide-up">
                <h3 className="font-bold text-lg mb-4 text-center">Đăng nhập chủ tiệm</h3>
                <input type="password" className="w-full border p-3 rounded-lg mb-4 text-center text-xl tracking-widest" placeholder="Mật khẩu" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} autoFocus/>
                <button onClick={handleLogin} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold">Truy cập</button>
                {(!shopInfo.adminPassword || shopInfo.adminPassword === '1234') && (
                    <p className="text-center text-xs text-gray-400 mt-4">Mật khẩu mặc định: 1234</p>
                )}
            </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default OnePageMechanic;
