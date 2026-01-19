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
  Grid,
  FolderOpen,
  Check
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
    if (!safeValue && placeholder && placeholder.includes("Mô tả")) return null;
    return <span className={className} style={{whiteSpace: 'pre-wrap', ...style}}>{safeValue}</span>;
  }
  
  const inputClass = `bg-white text-gray-900 border border-orange-400 rounded px-2 py-1 outline-none shadow-sm w-full text-base block focus:ring-1 focus:ring-orange-200 transition-all ${className}`;
  
  if (multiline) {
    return (
      <textarea 
        value={safeValue} 
        onChange={(e) => onChange(e.target.value)} 
        className={inputClass}
        placeholder={placeholder}
        rows={3}
        style={{ width: '100%', minHeight: '60px', ...style }}
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

// --- COMPONENT TAG MANAGER (CẢI TIẾN: CHỈ 1 TAG) ---
const TagManagerModal = ({ item, allTags, onClose, onUpdateTags }) => {
    const [newTag, setNewTag] = useState('');
    // Lấy tag đầu tiên hoặc rỗng
    const currentTag = (item.tags && item.tags.length > 0) ? item.tags[0] : null;

    const handleSelectTag = (tag) => {
        onUpdateTags([tag]); // Thay thế toàn bộ mảng tags bằng 1 tag duy nhất
        onClose();
    };

    const handleAddNew = () => {
        const cleanTag = newTag.trim();
        if (cleanTag) {
            onUpdateTags([cleanTag]);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><FolderOpen size={18}/> Chọn Nhóm Sản Phẩm</h3>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {/* Input thêm mới */}
                    <div className="flex gap-2 mb-6">
                        <input 
                            type="text" 
                            className="border-2 border-gray-300 p-2 rounded-lg flex-1 text-base focus:border-orange-500 outline-none" 
                            placeholder="Tạo nhóm mới..." 
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                        />
                        <button onClick={handleAddNew} className="bg-green-600 text-white px-4 rounded-lg text-sm font-bold shadow hover:bg-green-700">Tạo</button>
                    </div>

                    {/* Danh sách tag cũ */}
                    <div>
                        <p className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider">Danh sách nhóm hiện có:</p>
                        <div className="space-y-2">
                            {/* Nút bỏ chọn */}
                            <button 
                                onClick={() => handleSelectTag(null)}
                                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition flex justify-between items-center ${!currentTag ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                <span>Chưa phân loại</span>
                                {!currentTag && <Check size={18}/>}
                            </button>

                            {/* Các tag khác */}
                            {allTags.filter(t => t !== 'Tất cả' && t !== 'Khác').map(tag => (
                                <button 
                                    key={tag} 
                                    onClick={() => handleSelectTag(tag)}
                                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition flex justify-between items-center ${currentTag === tag ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold' : 'border-gray-100 hover:bg-gray-50 text-gray-700'}`}
                                >
                                    <span>{tag}</span>
                                    {currentTag === tag && <Check size={18}/>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
                <div className="relative h-64 bg-gray-50 shrink-0 flex items-center justify-center overflow-hidden border-b border-gray-100">
                    {displayImage ? (
                        <img src={displayImage} alt={item.name} className="w-full h-full object-contain p-4" />
                    ) : (
                         <div className="flex flex-col items-center text-gray-400">
                            {item.price ? <ImageIcon size={64} /> : <Wrench size={64}/>}
                            <span className="text-sm mt-2">Không có ảnh</span>
                         </div>
                    )}
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                    >
                        <X size={24}/>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">{item.name}</h3>
                    
                    {(!item.variants || item.variants.length === 0) && (
                        <div className="text-3xl font-extrabold text-orange-600 mb-6">{item.price}</div>
                    )}

                    {item.desc && item.desc.trim() !== "" && (
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Thông tin chi tiết</h4>
                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{item.desc}</p>
                        </div>
                    )}

                    {item.variants && item.variants.length > 0 && (
                        <div className="mb-6">
                             <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Bảng giá</h4>
                             <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                {item.variants.map((v, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-gray-100 p-3 text-base last:border-0 hover:bg-gray-50">
                                        <span className="font-medium text-slate-800">{v.name}</span>
                                        <span className="font-bold text-orange-600">{v.price}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                    
                    {item.stock !== undefined && (
                        <div className={`text-lg font-bold mb-6 flex items-center justify-center gap-2 p-3 rounded-xl border ${item.stock ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {item.stock ? <CheckCircle size={24}/> : <AlertCircle size={24}/>}
                            {item.stock ? 'SẢN PHẨM CÒN HÀNG' : 'TẠM HẾT HÀNG'}
                        </div>
                    )}
                    <button onClick={onClose} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-95 transition shadow-lg">Đóng</button>
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
  
  // --- STATE QUAN TRỌNG: KHỞI TẠO NULL ĐỂ BIẾT ĐANG TẢI HAY LỖI ---
  const [isDataLoaded, setIsDataLoaded] = useState(false); 
  const [saveStatus, setSaveStatus] = useState('idle');
  const [authStatus, setAuthStatus] = useState('checking');
  const [permissionError, setPermissionError] = useState(false);
  
  const [viewItem, setViewItem] = useState(null);
  const [editingTagItem, setEditingTagItem] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false); 
  
  const [activeTab, setActiveTab] = useState('services');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);

  // --- STATE DỮ LIỆU: BẮT ĐẦU LÀ NULL (KHÔNG PHẢI MẢNG RỖNG) ---
  const [shopInfo, setShopInfo] = useState(null);
  const [services, setServices] = useState(null);
  const [parts, setParts] = useState(null);
  const [categoriesOrder, setCategoriesOrder] = useState(null);
  const [selectedTag, setSelectedTag] = useState('Tất cả');

  // --- FIREBASE AUTH ---
  useEffect(() => { 
      const initAuth = async () => { 
          try { 
              await signInAnonymously(auth); 
              setAuthStatus('logged-in'); 
          } catch (error) { 
              console.error(error); 
              setAuthStatus('error'); 
          } 
      }; 
      initAuth(); 
      const u = onAuthStateChanged(auth, setUser); 
      return () => u(); 
  }, []);
  
  // --- FIREBASE READ ---
  useEffect(() => {
    if (!user) return;
    const paths = {
        shop: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'shop_info'),
        services: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'services_list'),
        parts: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'parts_list'),
        categories: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'categories_list'),
        bookings: doc(db, 'artifacts', appId, 'public', 'data', 'content', 'bookings_list')
    };
    const handleErr = (error) => { 
        console.error("Lỗi đọc:", error);
        if (error.code === 'permission-denied') setPermissionError(true); 
    };
    
    // Chỉ cập nhật state khi Firestore trả về dữ liệu. 
    // Nếu chưa có (mới tạo), ta set giá trị mặc định, nhưng vẫn đánh dấu là loaded.
    
    const uS = onSnapshot(paths.shop, (s) => { 
        setShopInfo(s.exists() ? s.data() : { name: "VĂN NGHĨA MOTO", tagline: "Chuyên sửa xe máy", address: "", phone: "", workingHours: "", adminPassword: "1234", wifi: "", wifiPass: "" }); 
    }, handleErr);
    
    const uSv = onSnapshot(paths.services, (s) => { 
        setServices(s.exists() ? s.data().items || [] : []); 
    }, handleErr);
    
    const uP = onSnapshot(paths.parts, (s) => { 
        setParts(s.exists() ? s.data().items || [] : []); 
    }, handleErr);

    const uC = onSnapshot(paths.categories, (s) => { 
        setCategoriesOrder(s.exists() ? s.data().items || [] : []);
    }, handleErr);

    const uB = onSnapshot(paths.bookings, (s) => { 
        if(s.exists()) setBookings(s.data().items||[]); 
        // Khi tất cả snapshot đầu tiên đã chạy (hoặc ít nhất 1 cái quan trọng), ta coi như đã load
        // Ở đây dùng bookings làm trigger cuối cùng là tạm ổn
        setIsDataLoaded(true); 
    }, handleErr);
    
    return () => { uS(); uSv(); uP(); uC(); uB(); };
  }, [user]);

  // --- FIREBASE WRITE (QUAN TRỌNG: CHỈ LƯU KHI ĐÃ LOAD XONG) ---
  const saveDataToFirebase = async (collectionName, data) => {
      // GUARD CLAUSE QUAN TRỌNG NHẤT:
      // Nếu chưa load xong (isDataLoaded === false) HOẶC dữ liệu là null -> KHÔNG ĐƯỢC LƯU
      if (!isDataLoaded || !user || data === null) return;
      
      setSaveStatus('saving');
      try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', collectionName), data);
          setSaveStatus('idle');
      } catch (error) {
          console.error(`Lỗi lưu ${collectionName}:`, error);
          if (error.code === 'permission-denied') { 
              setPermissionError(true); 
              setSaveStatus('permission-denied'); 
          } else { 
              setSaveStatus('error'); 
          }
      }
  };
  
  // Debounce saves
  useEffect(() => { const t = setTimeout(() => saveDataToFirebase('shop_info', shopInfo), 2000); return () => clearTimeout(t); }, [shopInfo, isDataLoaded]);
  useEffect(() => { const t = setTimeout(() => saveDataToFirebase('services_list', { items: services }), 2000); return () => clearTimeout(t); }, [services, isDataLoaded]);
  useEffect(() => { const t = setTimeout(() => saveDataToFirebase('parts_list', { items: parts }), 2000); return () => clearTimeout(t); }, [parts, isDataLoaded]);
  useEffect(() => { const t = setTimeout(() => saveDataToFirebase('categories_list', { items: categoriesOrder }), 2000); return () => clearTimeout(t); }, [categoriesOrder, isDataLoaded]);

  // Force Save
  const forceSaveAll = async () => {
      if (!user || !isDataLoaded) return;
      setSaveStatus('saving');
      try {
          await Promise.all([
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'shop_info'), shopInfo),
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'services_list'), { items: services }),
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'parts_list'), { items: parts }),
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'content', 'categories_list'), { items: categoriesOrder })
          ]);
          setSaveStatus('idle'); setIsAdminMode(false); alert("✅ Đã lưu dữ liệu!");
      } catch (error) { setSaveStatus('error'); alert(`❌ Lỗi lưu: ${error.message}`); }
  };

  useEffect(() => { if (shopInfo?.name) document.title = shopInfo.name; }, [shopInfo]);

  // Loading Screen
  if (!isDataLoaded || !shopInfo || !services || !parts) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
              <Loader className="animate-spin text-orange-500" size={48} />
              <p className="text-gray-500 font-bold">Đang tải dữ liệu cửa hàng...</p>
          </div>
      );
  }

  // --- LOGIC HIỂN THỊ DANH MỤC ---
  const getCategories = (items) => {
      const usedTags = new Set();
      items.forEach(item => {
          if (item.tags && item.tags.length > 0) {
              usedTags.add(item.tags[0]); 
          } else {
              usedTags.add("Khác");
          }
      });
      const usedTagsArray = Array.from(usedTags);
      const order = categoriesOrder || []; // Fallback nếu categoriesOrder null
      
      return usedTagsArray.sort((a, b) => {
          const idxA = order.indexOf(a);
          const idxB = order.indexOf(b);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
      });
  };

  const getAllUniqueTags = () => {
      const all = new Set();
      parts.forEach(p => p.tags && p.tags.forEach(t => all.add(t)));
      return Array.from(all);
  };

  const partCategories = getCategories(parts);

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
            e.target.value = '';
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
                  e.target.value = '';
              }
              img.src = ev.target.result;
          }
          reader.readAsDataURL(file);
      }
  }

  const handleQRUpload = (e) => {
      const file = e.target.files[0];
      if(file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                  const MAX = 500; let w = img.width; let h = img.height;
                  if(w>h){if(w>MAX){h*=MAX/w;w=MAX}}else{if(h>MAX){w*=MAX/h;h=MAX}}
                  canvas.width = w; canvas.height = h; ctx.drawImage(img, 0, 0, w, h);
                  setShopInfo(p => ({...p, qrCodeUrl: canvas.toDataURL('image/jpeg', 0.8)}));
                  e.target.value = '';
              }
              img.src = ev.target.result;
          }
          reader.readAsDataURL(file);
      }
  }

  const handleRemoveMedia = (list, setList, itemId) => { if(window.confirm('Xóa ảnh?')) setList(list.map(i => i.id === itemId ? { ...i, images: [] } : i)); };
  const moveItem = (idx, dir, list, setList) => { const n = [...list]; if (dir === 'up' && idx > 0) { [n[idx], n[idx - 1]] = [n[idx - 1], n[idx]]; } else if (dir === 'down' && idx < list.length - 1) { [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; } setList(n); };
  
  // Logic cập nhật tag mới (thay thế tag cũ hoàn toàn)
  const updateTagsForItem = (newTags) => {
      if (!editingTagItem) return;
      const { id, type } = editingTagItem; 
      const setList = type === 'parts' ? setParts : setServices;
      const list = type === 'parts' ? parts : services;
      
      const updatedList = list.map(item => item.id === id ? { ...item, tags: newTags } : item);
      setList(updatedList);
      
      // Tự động thêm tag mới vào danh sách sắp xếp nếu chưa có
      if (newTags.length > 0 && categoriesOrder) {
           const newTag = newTags[0];
           if (!categoriesOrder.includes(newTag)) {
               setCategoriesOrder(prev => [...prev, newTag]);
           }
      }
  };

  const handleRenameCategory = (oldName, newName) => {
      if (!newName || newName === oldName) return;
      const newParts = parts.map(p => { if (p.tags && p.tags.includes(oldName)) { return { ...p, tags: p.tags.map(t => t === oldName ? newName : t) }; } return p; });
      setParts(newParts);
      // Cập nhật cả trong danh sách thứ tự
      if (categoriesOrder) {
        const newOrder = categoriesOrder.map(c => c === oldName ? newName : c);
        setCategoriesOrder(newOrder);
      }
  };

  const handleReorderCategories = (index, direction) => {
      const newOrder = [...partCategories]; 
      if (direction === 'up' && index > 0) { [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]]; } 
      else if (direction === 'down' && index < newOrder.length - 1) { [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]; }
      
      // Merge với danh sách gốc để giữ các tag ẩn
      const baseOrder = categoriesOrder || [];
      const mergedOrder = Array.from(new Set([...newOrder, ...baseOrder]));
      setCategoriesOrder(mergedOrder);
  };

  const deleteBooking = (id) => { if(window.confirm("Xóa?")) setBookings(bookings.filter(b => b.id !== id)); };
  const createCalendarReminder = () => { window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Bảo dưỡng xe tại " + shopInfo.name)}`, '_blank'); };
  const addNewService = () => setServices([...services, { id: Date.now(), name: "Dịch vụ mới", price: "0đ", images: [], desc: "Mô tả...", variants: [] }]);
  const deleteService = (id) => { if(window.confirm("Xóa?")) setServices(services.filter(s => s.id !== id)); };
  // Thêm mới: mặc định tag là "Khác"
  const addNewPart = () => setParts([...parts, { id: Date.now(), name: "Phụ tùng mới", price: "0đ", stock: true, images: [], tags: ["Khác"], variants: [], desc: "" }]);
  const handleLogin = () => { const p = shopInfo?.adminPassword || "1234"; if (adminPass === p) { setIsAdminMode(true); setShowLoginModal(false); setAdminPass(''); } else { alert('Sai mật khẩu!'); } };
  const handleChangePassword = () => { if(newPassword) { if(window.confirm('Đổi mật khẩu?')) { setShopInfo(p => ({...p, adminPassword: newPassword})); setNewPassword(''); alert('Đã đổi!'); } } };

  // --- RENDER ITEM CARD ---
  const renderItemCard = (item, idx, list, setList, type = 'services') => {
      const hasVariants = item.variants && item.variants.length > 0;
      const singleVariant = item.variants && item.variants.length === 1;

      return (
      <div 
        key={item.id} 
        className={`bg-white p-3 rounded-xl shadow-sm border border-gray-200 hover:border-orange-300 hover:shadow-md transition relative group flex flex-row items-start gap-4 h-full ${!isAdminMode ? 'cursor-pointer active:bg-gray-50' : ''}`}
        onClick={() => !isAdminMode && setViewItem(item)}
      >
        {isAdminMode && (
            <div className="absolute top-2 right-2 z-20 flex gap-2">
                <button onClick={(e) => {e.stopPropagation(); moveItem(idx, 'up', list, setList)}} className="text-white hover:text-blue-300 p-2 bg-black/40 rounded-full backdrop-blur-sm shadow-md" title="Lên"><ArrowUp size={16}/></button>
                <button onClick={(e) => {e.stopPropagation(); moveItem(idx, 'down', list, setList)}} className="text-white hover:text-blue-300 p-2 bg-black/40 rounded-full backdrop-blur-sm shadow-md" title="Xuống"><ArrowDown size={16}/></button>
                <button onClick={(e) => {e.stopPropagation(); if(window.confirm('Xóa?')) setList(list.filter(p => p.id !== item.id))}} className="text-white hover:text-red-300 p-2 bg-red-500/80 rounded-full backdrop-blur-sm shadow-md" title="Xóa"><Trash2 size={16}/></button>
            </div>
        )}
        
        {/* Cột ảnh bên trái - NHỎ GỌN DẠNG ICON */}
        <div className="w-24 h-24 bg-white shrink-0 flex items-center justify-center relative border border-gray-200 rounded-lg group/icon overflow-hidden">
                {(item.images && item.images.length > 0) ? (
                    <img src={item.images[0]} alt="icon" className="w-full h-full object-cover" />
                ) : (
                    <Wrench className="text-gray-300" size={32} />
                )}
                
                {isAdminMode && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/icon:opacity-100 transition gap-2">
                        <label className="cursor-pointer text-white hover:text-green-300 p-1"><Upload size={20}/><input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, list, setList, item.id)}/></label>
                        {(item.images && item.images.length > 0) && <button onClick={(e) => { e.stopPropagation(); handleRemoveMedia(list, setList, item.id); }} className="text-red-400 hover:text-red-200 p-1"><Trash2 size={20}/></button>}
                    </div>
                )}
        </div>
        
        {/* Cột nội dung bên phải */}
        <div className="flex-1 flex flex-col justify-between py-0.5">
            <div>
                <h4 className="font-bold text-slate-800 text-lg leading-tight mb-1 pr-6">
                    <EditableText isAdminMode={isAdminMode} value={item.name} onChange={(val) => { const newList = [...list]; newList[idx].name = val; setList(newList); }} className="font-bold w-full"/>
                </h4>
                
                {/* GIÁ THÔNG MINH */}
                {!hasVariants && (
                    <div className="text-orange-600 font-extrabold text-xl mb-1">
                        <EditableText isAdminMode={isAdminMode} value={item.price} onChange={(val) => { const newList = [...list]; newList[idx].price = val; setList(newList); }}/>
                    </div>
                )}

                {singleVariant && (
                    <div className="text-orange-600 font-extrabold text-xl mb-1 flex flex-wrap items-center gap-1">
                        {item.variants[0].price} 
                        <span className="text-xs text-gray-500 font-normal">({item.variants[0].name})</span>
                    </div>
                )}
                
                {(hasVariants && !singleVariant) && (
                    <div className="text-sm text-gray-500 font-medium mb-1 bg-gray-100 px-2 py-0.5 rounded inline-block">{item.variants.length} loại giá</div>
                )}

                {/* Mô tả ngắn */}
                <div className={`text-sm text-gray-500 mb-1 ${isAdminMode ? '' : 'line-clamp-2'}`}>
                    <EditableText isAdminMode={isAdminMode} value={item.desc} onChange={(val) => { const newList = [...list]; newList[idx].desc = val; setList(newList); }} multiline={isAdminMode} placeholder="Mô tả..."/>
                </div>
            </div>

            {/* PHẦN DƯỚI: TRẠNG THÁI & ADMIN TOOLS */}
            <div className="mt-auto w-full">
                {item.stock !== undefined && (
                    isAdminMode ? (
                        <div className="flex flex-col gap-2 mt-2">
                            <label className="flex items-center gap-2 text-sm font-bold cursor-pointer bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200">
                                <input type="checkbox" checked={item.stock} onChange={(e) => { const newList = [...list]; newList[idx].stock = e.target.checked; setList(newList); }} className="w-5 h-5"/>
                                {item.stock ? "HIỆN: CÒN" : "HIỆN: HẾT"}
                            </label>
                             <button onClick={(e) => {e.stopPropagation(); setEditingTagItem({ id: item.id, type, tags: item.tags })}} className="text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 font-bold w-full text-left flex items-center gap-1"><Tag size={12}/> Gắn Thẻ (Nhóm)</button>
                        </div>
                    ) : (
                        <div className={`font-black text-sm uppercase px-2 py-0.5 rounded inline-block ${item.stock ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'}`}>
                            {item.stock ? 'CÒN' : 'HẾT'}
                        </div>
                    )
                )}

                {/* Sửa biến thể - Admin */}
                {isAdminMode && (
                    <div className="mt-2 space-y-2">
                        {item.variants?.map((variant, vIdx) => (
                            <div key={vIdx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-1">
                                <div className="flex-1 flex gap-2">
                                    <EditableText isAdminMode={true} value={variant.name} onChange={(val) => { const newList = [...list]; newList[idx].variants[vIdx].name = val; setList(newList); }} className="w-full text-gray-700 text-sm"/>
                                    <EditableText isAdminMode={true} value={variant.price} onChange={(val) => { const newList = [...list]; newList[idx].variants[vIdx].price = val; setList(newList); }} className="w-full font-bold text-orange-600 text-right text-sm"/>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); const newList = [...list]; newList[idx].variants = newList[idx].variants.filter((_, i) => i !== vIdx); setList(newList); }} className="text-red-400 ml-2 p-1"><X size={16}/></button>
                            </div>
                        ))}
                        <button onClick={(e) => { e.stopPropagation(); const newList = [...list]; if(!newList[idx].variants) newList[idx].variants = []; newList[idx].variants.push({name: 'Loại mới', price: '0đ'}); setList(newList); }} className="text-xs text-blue-600 flex items-center gap-1 mt-2 hover:underline font-bold bg-blue-50 px-3 py-2 rounded w-full justify-center">+ Thêm giá/loại</button>
                    </div>
                )}
            </div>
        </div>
      </div>
  );};

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 md:pb-0 relative text-base md:text-lg`}>
      
      {/* MODAL & ALERTS */}
      <ItemDetailModal item={viewItem} onClose={() => setViewItem(null)} />
      
      {/* MODAL QUẢN LÝ TAG (1 TAG DUY NHẤT) */}
      {editingTagItem && (
          <TagManagerModal 
            item={editingTagItem} 
            allTags={getAllUniqueTags()} 
            onClose={() => setEditingTagItem(null)} 
            onUpdateTags={updateTagsForItem}
          />
      )}
      
      {/* MODAL SẮP XẾP DANH MỤC */}
      {showCategoryManager && (
          <CategoryManagerModal 
            categories={partCategories}
            onReorder={handleReorderCategories}
            onRename={handleRenameCategory}
            onClose={() => setShowCategoryManager(false)}
          />
      )}

      {permissionError && <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80"><div className="bg-white p-6 rounded-xl"><h2 className="text-red-600 font-bold">LỖI QUYỀN FIREBASE</h2><p>Vui lòng mở quyền read/write trong Firestore Rules.</p><button onClick={() => window.location.reload()} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Tải lại</button></div></div>}

      {/* HEADER */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
        {/* GIẢM PADDING HEADER CHO GỌN: py-3 */}
        <div className="w-full px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative group shrink-0">
                {shopInfo?.logoUrl ? <img src={shopInfo.logoUrl} alt="Logo" className="h-16 w-auto object-contain cursor-pointer" onClick={() => setViewItem({ name: 'Logo Quán', images: [shopInfo.logoUrl] })}/> : <div className="h-16 w-16 bg-orange-500 rounded flex items-center justify-center text-xl font-bold">TM</div>}
                {isAdminMode && <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer rounded opacity-0 group-hover:opacity-100 transition"><Upload size={24} className="text-white"/><input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload}/></label>}
            </div>
            <div className="flex-1 max-w-md ml-2 overflow-hidden">
                <div className="font-bold text-xl leading-tight truncate"><EditableText isAdminMode={isAdminMode} value={shopInfo?.name} onChange={(val) => setShopInfo({...shopInfo, name: val})} className="font-bold"/></div>
                <div className="text-sm text-gray-400 hidden md:block truncate"><EditableText isAdminMode={isAdminMode} value={shopInfo?.tagline} onChange={(val) => setShopInfo({...shopInfo, tagline: val})}/></div>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8 text-lg font-bold">
            <button onClick={() => setActiveTab('services')} className={`hover:text-orange-500 ${activeTab === 'services' ? 'text-orange-500' : ''}`}>Dịch Vụ</button>
            <button onClick={() => setActiveTab('parts')} className={`hover:text-orange-500 ${activeTab === 'parts' ? 'text-orange-500' : ''}`}>Phụ Tùng</button>
          </nav>
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={36} /> : <Menu size={36} />}</button>
        </div>
        {isMenuOpen && <div className="md:hidden bg-slate-800 px-6 py-4 space-y-4 text-lg font-bold border-t border-slate-700"><button onClick={() => {setActiveTab('services'); setIsMenuOpen(false)}} className="block w-full text-left py-3 border-b border-slate-600">Dịch Vụ</button><button onClick={() => {setActiveTab('parts'); setIsMenuOpen(false)}} className="block w-full text-left py-3 border-b border-slate-600">Phụ Tùng</button></div>}
      </header>

      {/* ADMIN PANEL */}
      {isAdminMode && (
        <div className="bg-white border-b-2 border-orange-500 p-2 shadow-md">
            <div className="w-full px-2">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-2"><Settings className="text-orange-500" size={24}/><h2 className="font-bold text-lg">Quản trị viên</h2>
                        {saveStatus === 'saving' && <span className="text-sm text-orange-500 font-bold animate-pulse">Đang lưu...</span>}
                        {saveStatus === 'error' && <span className="text-sm text-red-500 font-bold">Lỗi lưu!</span>}
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl w-full md:w-auto">
                        <input type="text" placeholder="Mật khẩu mới..." className="bg-transparent text-base outline-none w-full md:w-48 p-1" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                        <button onClick={handleChangePassword} className="bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-slate-700 font-bold whitespace-nowrap">Đổi</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="bg-slate-800 text-white py-8 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10 w-full px-4 mx-auto">
          <div className="text-orange-500 font-bold uppercase tracking-wider text-base mb-2">{shopInfo?.tagline}</div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4"><EditableText isAdminMode={isAdminMode} value={shopInfo?.heroTitle} onChange={(val) => setShopInfo({...shopInfo, heroTitle: val})} className="bg-transparent text-white text-center w-full block" multiline={true} style={{color: isAdminMode ? 'black' : 'white'}}/></h2>
          <div className="text-gray-300 mb-6 max-w-4xl mx-auto"><EditableText isAdminMode={isAdminMode} value={shopInfo?.heroDesc} onChange={(val) => setShopInfo({...shopInfo, heroDesc: val})} className="bg-transparent text-gray-300 text-center w-full block text-base md:text-lg font-light" multiline={true} style={{color: isAdminMode ? 'black' : '#d1d5db'}}/></div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {/* TỐI ƯU PADDING: px-2 (mobile) -> px-4 (md) -> px-8 (lg) */}
      <main className="w-full px-2 md:px-4 lg:px-8 py-8 max-w-[1920px] mx-auto">
        
        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-l-8 border-orange-500 pl-4 py-1 bg-gray-50 rounded-r-lg">
                <h3 className="text-2xl md:text-3xl font-black uppercase text-slate-800">Dịch Vụ</h3>
                {isAdminMode && <button onClick={addNewService} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 shadow-md text-base"><Plus size={20}/> Thêm</button>}
            </div>
            
            {/* GRID DỊCH VỤ: TĂNG MẬT ĐỘ CHO MOBILE & DESKTOP - DÙNG GRID CHO CẢ ADMIN */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {services.map((service, idx) => renderItemCard(service, idx, services, setServices, 'services'))}
            </div>
          </div>
        )}

        {/* PARTS TAB (MENU NHÀ HÀNG STYLE) */}
        {activeTab === 'parts' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8 border-l-8 border-orange-500 pl-4 py-1 bg-gray-50 rounded-r-lg">
                <h3 className="text-2xl md:text-3xl font-black uppercase text-slate-800">Phụ Tùng</h3>
                {isAdminMode && (
                    <div className="flex gap-2">
                        <button onClick={() => setShowCategoryManager(true)} className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 hover:bg-blue-700 shadow-md text-sm"><List size={18}/> Sắp xếp</button>
                        <button onClick={addNewPart} className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 hover:bg-green-700 shadow-md text-sm"><Plus size={18}/> Thêm</button>
                    </div>
                )}
            </div>

            {partCategories.map(category => {
                const itemsInCategory = parts.filter(p => (p.tags && p.tags.length > 0 ? p.tags[0] === category : category === 'Khác'));
                if (itemsInCategory.length === 0) return null;

                return (
                    <div key={category} className="mb-10">
                        <h4 className="text-xl md:text-2xl font-bold text-slate-700 mb-4 flex items-center gap-3 border-b-2 border-orange-200 pb-2 px-2 sticky top-[72px] bg-white/95 backdrop-blur-md z-30 py-2 rounded-lg shadow-sm">
                           <FolderOpen size={28} className="text-orange-500"/> {category}
                        </h4>
                        
                        {/* GRID PHỤ TÙNG: DÙNG GRID CHO CẢ ADMIN */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {itemsInCategory.map((part) => {
                                const idx = parts.findIndex(p => p.id === part.id);
                                return renderItemCard(part, idx, parts, setParts, 'parts');
                            })}
                        </div>
                    </div>
                );
            })}
          </div>
        )}
      </main>
      
      {/* REMINDER SECTION */}
      <section className="bg-white py-10 px-4 border-t-4 border-orange-500">
         <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block p-4 rounded-full bg-orange-50 mb-4">
                 <Bell className="w-10 h-10 text-orange-600 animate-pulse" />
            </div>
            <h2 className="text-xl md:text-3xl font-black mb-3 text-slate-900 leading-tight uppercase">
                <EditableText isAdminMode={isAdminMode} value={shopInfo?.reminderTitle} onChange={(val) => setShopInfo({...shopInfo, reminderTitle: val})} className="text-center font-black"/>
            </h2>
            <div className="text-base md:text-lg text-gray-600 leading-snug mb-4 max-w-3xl mx-auto font-light">
                <EditableText isAdminMode={isAdminMode} value={shopInfo?.reminderDesc} onChange={(val) => setShopInfo({...shopInfo, reminderDesc: val})} multiline={true} className="text-center bg-transparent p-0 border-none leading-snug"/>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-10 px-4 mt-0 pb-32">
        <div className="w-full px-2 md:px-8 grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-white font-black text-2xl mb-4 border-b-2 border-orange-500 pb-2 inline-block">{shopInfo?.name}</h4>
            <div className="space-y-4 text-base md:text-lg font-medium">
              <div className="flex items-start gap-3">
                  <MapPin className="text-orange-500 shrink-0 mt-1" size={20} />
                  <EditableText isAdminMode={isAdminMode} value={shopInfo?.address} onChange={(val) => setShopInfo({...shopInfo, address: val})} className="text-slate-300 w-full" multiline={isAdminMode}/>
              </div>
              <div className="flex items-center gap-3">
                  <Clock className="text-orange-500 shrink-0" size={20} />
                  <EditableText isAdminMode={isAdminMode} value={shopInfo?.workingHours} onChange={(val) => setShopInfo({...shopInfo, workingHours: val})} className="text-slate-300 w-full" multiline={isAdminMode}/>
              </div>
              <div className="flex items-center gap-3">
                  <Phone className="text-orange-500 shrink-0" size={20} />
                  <EditableText isAdminMode={isAdminMode} value={shopInfo?.phone} onChange={(val) => setShopInfo({...shopInfo, phone: val})} className="text-slate-300"/>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-600 self-start group shadow-lg w-full max-w-sm">
            <h5 className="text-white font-bold flex items-center gap-3 mb-4 text-xl"><Wifi size={24} className="text-green-400"/> Wifi Miễn Phí</h5>
            <div className="bg-slate-900 p-4 rounded-xl text-center relative z-10 border border-slate-700 shadow-inner">
              <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest font-bold">Tên mạng</div>
              <div className="font-mono text-xl text-orange-400 font-bold tracking-wide mb-2"><EditableText isAdminMode={isAdminMode} value={shopInfo?.wifi} onChange={(val) => setShopInfo({...shopInfo, wifi: val})}/></div>
              <div className="h-px bg-slate-700 my-2"></div>
              <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest font-bold">Mật khẩu</div>
              <div className="font-mono text-2xl text-white tracking-widest"><EditableText isAdminMode={isAdminMode} value={shopInfo?.wifiPass} onChange={(val) => setShopInfo({...shopInfo, wifiPass: val})}/></div>
            </div>
            <div className="mt-6 text-center relative">
                <p className="text-xs text-gray-400 mb-2 uppercase font-black tracking-wider">Quét QR chuyển khoản</p>
                {shopInfo?.qrCodeUrl ? <img src={shopInfo.qrCodeUrl} alt="QR" className="w-32 h-32 mx-auto rounded-xl border-4 border-white shadow-lg"/> : <div className="w-32 h-32 mx-auto bg-gray-700 flex items-center justify-center text-xs text-gray-400">Chưa có QR</div>}
                {isAdminMode && <label className="absolute inset-0 bg-black/70 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition rounded-xl"><span className="text-white font-bold bg-blue-600 px-4 py-2 rounded-lg shadow-lg text-sm">Đổi Ảnh QR</span><input type="file" className="hidden" accept="image/*" onChange={handleQRUpload}/></label>}
            </div>
          </div>
        </div>
        {!isAdminMode && <div className="flex justify-end mt-8 pt-4 border-t border-slate-800 mr-2 md:mr-8"><button onClick={() => setShowLoginModal(true)} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm bg-slate-800 px-4 py-2 rounded-full transition hover:bg-slate-700 font-bold shadow-lg"><Settings size={16}/> Quản lý tiệm</button></div>}
      </footer>

      {/* ADMIN FLOATING BAR */}
      {isAdminMode && (
          <div className="fixed bottom-0 left-0 w-full bg-slate-900 text-white p-4 flex justify-between items-center z-50 border-t-4 border-orange-500 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_#22c55e]"></div>
                  <span className="font-bold text-xl">CHẾ ĐỘ ADMIN</span>
              </div>
              <button 
                onClick={forceSaveAll} 
                className={`bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-base shadow-xl transform active:scale-95 transition-all ${saveStatus === 'saving' ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={saveStatus === 'saving'}
              >
                  {saveStatus === 'saving' ? 'ĐANG LƯU...' : <><Save size={20}/> LƯU & THOÁT</>}
              </button>
          </div>
      )}

      {/* MODAL LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm animate-zoom-in shadow-2xl border-4 border-orange-500">
                <h3 className="font-black text-3xl mb-6 text-center text-slate-900 uppercase">Đăng nhập chủ tiệm</h3>
                <input type="password" className="w-full border-2 border-gray-300 p-4 rounded-xl mb-6 text-center text-3xl tracking-widest focus:border-orange-500 outline-none font-bold bg-gray-50 transition-colors" placeholder="••••" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} autoFocus/>
                <button onClick={handleLogin} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xl hover:bg-slate-800 shadow-xl transform active:scale-95 transition-all">TRUY CẬP</button>
                {(!shopInfo?.adminPassword || shopInfo?.adminPassword === '1234') && (
                    <p className="text-center text-base text-red-500 mt-6 font-bold bg-red-50 p-3 rounded-xl border border-red-100">Mật khẩu mặc định: 1234</p>
                )}
            </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        .animate-zoom-in { animation: zoomIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default OnePageMechanic;
