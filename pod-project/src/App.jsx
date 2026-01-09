import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import './App.css'; // Nhập file CSS giao diện

function App() {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  
  // State để theo dõi đối tượng đang được chọn
  const [selectedObject, setSelectedObject] = useState(null);
  // State cho các thuộc tính của chữ
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false); // Trạng thái: Đang vẽ hay không?

  // --- KHỞI TẠO CANVAS ---
  useEffect(() => {
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 600,
      backgroundColor: '#fff'
    });

    fabricCanvas.current = initCanvas;

    // Nạp ảnh áo làm nền và ép dãn vừa khung
    fabric.Image.fromURL('/t-shirt.jpg').then((img) => {
      img.set({
        originX: 'left', 
        originY: 'top',
        scaleX: initCanvas.width / img.width,
        scaleY: initCanvas.height / img.height
      });
      initCanvas.backgroundImage = img;
      initCanvas.renderAll();
    });

    // --- LẮNG NGHE SỰ KIỆN CHỌN ĐỐI TƯỢNG ---
    // Khi người dùng click vào một đối tượng (chữ/ảnh)
    initCanvas.on('selection:created', (e) => handleObjectSelection(e.selected[0]));
    initCanvas.on('selection:updated', (e) => handleObjectSelection(e.selected[0]));
    // Khi người dùng click ra ngoài (bỏ chọn)
    initCanvas.on('selection:cleared', () => {
        setSelectedObject(null);
        resetTextControls();
    });

    return () => {
      initCanvas.dispose();
    }
  }, []);

  // Hàm xử lý khi chọn đối tượng
  const handleObjectSelection = (obj) => {
      setSelectedObject(obj);
      // Nếu là chữ, cập nhật các nút điều khiển theo thuộc tính của chữ đó
      if (obj.type === 'i-text') {
          setTextColor(obj.fill);
          setFontFamily(obj.fontFamily);
          setIsBold(obj.fontWeight === 'bold');
          setIsItalic(obj.fontStyle === 'italic');
      }
  };

  const resetTextControls = () => {
      setTextColor('#000000');
      setFontFamily('Arial');
      setIsBold(false);
      setIsItalic(false);
  }

  // --- CÁC CHỨC NĂNG THÊM MỚI ---
  const addText = () => {
    if (!fabricCanvas.current) return;
    const text = new fabric.IText('Nội dung...', {
      left: 250, top: 200, originX: 'center',
      fontFamily: 'Arial', fill: '#333', fontSize: 30
    });
    fabricCanvas.current.add(text);
    fabricCanvas.current.setActiveObject(text);
  };

  const addShape = (type) => {
      if (!fabricCanvas.current) return;
      let shape;
      if(type === 'rect'){
          shape = new fabric.Rect({ left: 250, top: 300, fill: '#4a90e2', width: 100, height: 60, originX: 'center' });
      } else if (type === 'circle'){
          shape = new fabric.Circle({ left: 250, top: 300, fill: '#e74c3c', radius: 40, originX: 'center' });
      }
      fabricCanvas.current.add(shape);
      fabricCanvas.current.setActiveObject(shape);
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target.result;
      const img = await fabric.Image.fromURL(data);
      img.scaleToWidth(150);
      img.set({ left: 250, top: 300, originX: 'center' });
      fabricCanvas.current.add(img);
      fabricCanvas.current.setActiveObject(img);
      fabricCanvas.current.renderAll();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Demo chức năng thêm Icon (Bạn cần có file ảnh trong thư mục public)
  const addIconDemo = (iconName) => {
      // Đây là ví dụ, bạn cần có file star.png hoặc heart.png trong thư mục public
      // Nếu không có file, nó sẽ lỗi.
      const iconPath = `/${iconName}.png`; 
      fabric.Image.fromURL(iconPath).then(img => {
        if(!img) { alert("Chưa có file icon trong thư mục public!"); return;}
        img.scaleToWidth(80);
        img.set({ left: 250, top: 250, originX: 'center' });
        fabricCanvas.current.add(img);
        fabricCanvas.current.setActiveObject(img);
      }).catch(err => console.log("Lỗi tải icon (có thể do thiếu file):", err));
  }

  // --- CÁC CHỨC NĂNG CHỈNH SỬA (Khi đã chọn đối tượng) ---
  
  // Thay đổi màu sắc
  const changeColor = (e) => {
      const newColor = e.target.value;
      setTextColor(newColor);
      if(selectedObject) {
          selectedObject.set('fill', newColor);
          fabricCanvas.current.renderAll();
      }
  };

  // Thay đổi Font
  const changeFont = (e) => {
      const newFont = e.target.value;
      setFontFamily(newFont);
      if(selectedObject && selectedObject.type === 'i-text') {
          selectedObject.set('fontFamily', newFont);
          fabricCanvas.current.renderAll();
      }
  }

  // Toggle Bold / Italic
  const toggleStyle = (styleType) => {
      if(!selectedObject || selectedObject.type !== 'i-text') return;
      if(styleType === 'bold'){
          const newValue = !isBold;
          setIsBold(newValue);
          selectedObject.set('fontWeight', newValue ? 'bold' : 'normal');
      } else if (styleType === 'italic'){
          const newValue = !isItalic;
          setIsItalic(newValue);
          selectedObject.set('fontStyle', newValue ? 'italic' : 'normal');
      }
      fabricCanvas.current.renderAll();
  }


  // Xóa đối tượng đang chọn
  const deleteSelected = () => {
      if(fabricCanvas.current && selectedObject){
          fabricCanvas.current.remove(selectedObject);
          fabricCanvas.current.discardActiveObject();
          fabricCanvas.current.renderAll();
          setSelectedObject(null);
      }
  }
  // --- TÍNH NĂNG MỚI: VẼ TAY (PAINT MODE) ---
  const toggleDrawing = () => {
    if (!fabricCanvas.current) return;
    const newMode = !isDrawing;
    setIsDrawing(newMode);
    
    fabricCanvas.current.isDrawingMode = newMode;
    
    if (newMode) {
      // Cấu hình cọ vẽ
      const brush = new fabric.PencilBrush(fabricCanvas.current);
      brush.color = textColor; // Lấy luôn màu đang chọn ở bảng màu
      brush.width = 5;         // Độ to nét vẽ
      fabricCanvas.current.freeDrawingBrush = brush;
    }
  };

  // --- TÍNH NĂNG MỚI: QUẢN LÝ LỚP (LAYERS) ---
  const moveLayer = (direction) => {
    if (!selectedObject || !fabricCanvas.current) return;
    
    const canvas = fabricCanvas.current;

    if (direction === 'up') {
      // Đưa đối tượng lên trên cùng
      canvas.bringObjectToFront(selectedObject);
    } else {
      // Đưa đối tượng lùi xuống một bước
      canvas.sendObjectBackwards(selectedObject);
    }
    
    // Lưu ý: Vì cái áo là "backgroundImage" (hình nền), 
    // nên dù bạn có đưa xuống thấp nhất thì nó vẫn nằm TRÊN cái áo.
    // Yên tâm nhé!
    
    canvas.renderAll(); // Cập nhật lại hình ảnh
  }

  // --- CHỨC NĂNG HỆ THỐNG ---
  const downloadMockup = () => {
    if (!fabricCanvas.current) return;
    // multiplier: 2 giúp ảnh tải về nét hơn (phóng to 2 lần)
    const dataURL = fabricCanvas.current.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    const link = document.createElement('a');
    link.download = 'thiet-ke-ao-printtique.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ================= GIAO DIỆN (JSX) =================
  return (
    <div className="app-container">
      
      {/* === THANH SIDEBAR BÊN TRÁI === */}
      <div className="sidebar">
        <h2>Printtique Designer</h2>

        {/* Phần 1: Các nút thêm mới (Luôn hiện) */}
        <div className="tool-section">
          <h3>Thêm nội dung</h3>
          <div className="button-group">
            <button className="btn" onClick={addText}>T</button>
            <button className="btn" onClick={() => addShape('rect')}>■</button>
            <button className="btn" onClick={() => addShape('circle')}>●</button>
          </div>
        </div>

         <div className="tool-section">
          <h3>Upload & Icons</h3>
          <div className="upload-btn-wrapper" style={{marginBottom: '10px'}}>
            <button className="btn" style={{width: '100%'}}>Tải ảnh lên</button>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div className="button-group">
             {/* Các nút này chỉ hoạt động nếu bạn có file ảnh tương ứng trong folder public */}
             <button className="btn" onClick={() => addIconDemo('star')}>★ Sao</button>
             <button className="btn" onClick={() => addIconDemo('heart')}>♥ Tim</button>
          </div>
        </div>
        
        <div className="button-group">
          <button className="btn" onClick={addText}>T</button>
          <button className="btn" onClick={() => addShape('rect')}>■</button>
          <button className="btn" onClick={() => addShape('circle')}>●</button>
          
          {/* Nút mới */}
          <button 
            className={`btn ${isDrawing ? 'active' : ''}`} 
            onClick={toggleDrawing}
            title="Chế độ vẽ tay"
          >
            🖌 Vẽ
          </button>
        </div>

        {/* Phần 2: Các nút chỉnh sửa (Chỉ hiện khi chọn đối tượng) */}
        {selectedObject && (
  <div className="tool-section" style={{ backgroundColor: '#f0f2f5', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
    
    {/* 1. TIÊU ĐỀ HỘP CÔNG CỤ */}
    <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginTop: 0 }}>
      Đang chọn: {
        selectedObject.type === 'i-text' ? '✍ Văn bản' : 
        selectedObject.type === 'image' ? '🖼 Hình ảnh' : 
        selectedObject.type === 'path' ? '🖌 Nét vẽ' : 'Hình khối'
      }
    </h3>

    {/* 2. CÔNG CỤ RIÊNG CHO VĂN BẢN (Chỉ hiện khi chọn chữ) */}
    {selectedObject.type === 'i-text' && (
      <div style={{ marginBottom: '15px' }}>
        <div className="control-row">
          <label style={{ fontWeight: 'bold' }}>Màu chữ:</label>
          <input 
            type="color" 
            value={textColor} 
            onChange={changeColor} 
            style={{ cursor: 'pointer', height: '30px', width: '50px' }}
          />
        </div>

        <div className="control-row">
          <label style={{ fontWeight: 'bold' }}>Phông chữ:</label>
          <select value={fontFamily} onChange={changeFont} style={{ padding: '5px', flex: 1, marginLeft: '10px' }}>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Roboto">Roboto</option>
          </select>
        </div>

        <div className="button-group" style={{ marginTop: '10px' }}>
          <button 
            className={`btn ${isBold ? 'active' : ''}`} 
            onClick={() => toggleStyle('bold')}
            style={{ fontWeight: 'bold' }}
          >
            B
          </button>
          <button 
            className={`btn ${isItalic ? 'active' : ''}`} 
            onClick={() => toggleStyle('italic')}
            style={{ fontStyle: 'italic' }}
          >
            I
          </button>
        </div>
      </div>
    )}

    {/* 3. CÔNG CỤ CHUNG: QUẢN LÝ LỚP (Layer) - Hiện cho TẤT CẢ đối tượng */}
    <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '5px', marginBottom: '15px' }}>
      <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Sắp xếp vị trí:</label>
      <div className="button-group" style={{ width: '100%' }}>
        <button className="btn" onClick={() => moveLayer('up')} title="Đưa lên một lớp">
          ⬆ Lên trên
        </button>
        <button className="btn" onClick={() => moveLayer('down')} title="Đưa xuống một lớp">
          ⬇ Xuống dưới
        </button>
      </div>
    </div>

    {/* 4. CÔNG CỤ CHUNG: XÓA */}
    <button 
      className="btn" 
      onClick={deleteSelected}
      style={{ 
        backgroundColor: '#ff4757', 
        color: 'white', 
        width: '100%', 
        padding: '10px',
        fontWeight: 'bold',
        marginTop: '5px',
        border: 'none'
      }}
    >
      🗑 Xóa đối tượng này
    </button>
  </div>
)}

        {/* Phần 3: Hành động cuối */}
        <div className="tool-section" style={{border: 'none', marginTop: 'auto'}}>
             <button className="btn primary" style={{width: '100%', padding: '15px', fontSize: '1.1rem'}} onClick={downloadMockup}>
                 💾 Tải Mockup Về
             </button>
        </div>

      </div>

      {/* === KHU VỰC BÀN LÀM VIỆC TRUNG TÂM === */}
      <div className="main-content">
        <div className="canvas-container-wrapper">
             <canvas ref={canvasRef} />
        </div>
      </div>

    </div>
  );
}

export default App;