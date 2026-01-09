import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

function App() {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);

useEffect(() => {
    // 1. Khởi tạo Canvas (Giữ nguyên kích thước 500x600)
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 600,
      backgroundColor: '#fff'
    });

    fabricCanvas.current = initCanvas;

    // 2. Nạp ảnh áo và ÉP DÃN ra toàn màn hình
    fabric.Image.fromURL('/ao-thun.jpg').then((img) => {
      
      // Tính toán tỷ lệ để ảnh dãn ra vừa khít khung 500x600
      // Dù ảnh gốc to hay nhỏ, nó cũng sẽ bị ép về đúng kích thước này
      img.set({
        originX: 'left', 
        originY: 'top',
        scaleX: initCanvas.width / img.width,   // Ép chiều ngang
        scaleY: initCanvas.height / img.height  // Ép chiều dọc
      });

      // Gán làm hình nền
      initCanvas.backgroundImage = img;
      initCanvas.renderAll();
    });

    return () => {
      initCanvas.dispose();
    }
  }, []);

  // Chức năng Thêm Chữ
  const themChu = () => {
    if (!fabricCanvas.current) return;
    const chuMoi = new fabric.IText('Lớp Tôi', {
      left: 200, top: 200, // Chỉnh vị trí xuất hiện cho đẹp
      fontFamily: 'Arial',
      fill: '#D81B60',
      fontSize: 30
    });
    fabricCanvas.current.add(chuMoi);
    fabricCanvas.current.setActiveObject(chuMoi);
  };

  // Chức năng Upload Ảnh (Như bài cũ)
  const xuLyUploadAnh = (e) => {
    const fileAnh = e.target.files[0];
    if (!fileAnh) return;

    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target.result;
      try {
        const img = await fabric.Image.fromURL(data);
        img.scaleToWidth(150); 
        img.set({ left: 180, top: 250 }); // Đặt vị trí mặc định vào giữa ngực áo
        fabricCanvas.current.add(img);
        fabricCanvas.current.setActiveObject(img);
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(fileAnh);
    e.target.value = '';
  };

  // Chức năng Lưu Ảnh (Bây giờ sẽ lưu cả áo!)
  const luuAnh = () => {
    if (!fabricCanvas.current) return;
    
    // Xuất toàn bộ Canvas ra ảnh
    const dataURL = fabricCanvas.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1 // Giữ nguyên kích thước 500x600
    });

    const link = document.createElement('a');
    link.download = 'mockup-ao-thun.png'; // Tên file tải về
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Web Thiết Kế Áo - Phiên bản Mockup</h1>
      
      {/* THANH CÔNG CỤ */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={themChu} style={btnStyle}>+ Thêm Chữ</button>
        
        <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
           <button style={btnStyle}>+ Tải Ảnh Lên</button>
           <input type="file" accept="image/*" onChange={xuLyUploadAnh}
             style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} 
           />
        </div>

        <button onClick={luuAnh} style={{...btnStyle, backgroundColor: '#28a745'}}>
          💾 Tải Ảnh Về (Cả Áo)
        </button>
      </div>

      {/* KHU VỰC HIỂN THỊ */}
      {/* Bây giờ chỉ cần Canvas thôi, không cần thẻ img nền nữa */}
      <div style={{ border: '1px solid #ccc', display: 'inline-block', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
          <canvas ref={canvasRef} />
      </div>

      <p style={{marginTop: '10px', color: '#666', fontStyle: 'italic'}}>
        Lưu ý: Bây giờ hình cái áo là một phần của bản vẽ, bạn có thể tải về trọn vẹn.
      </p>
    </div>
  );
}

const btnStyle = {
  padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
};

export default App;