// 1. KHO KHAI BÁO: Nhập khẩu các công cụ cần dùng
import React, { useEffect, useRef } from 'react'; 
import * as fabric from 'fabric'; // Nhập thư viện đồ họa Fabric

// 2. KHU VỰC CHÍNH (COMPONENT): Đây là nơi tạo ra giao diện
function App() {
  
  // Tạo một cái "móc" (ref) để dính code vào thẻ HTML
  const canvasRef = useRef(null); 
  const fabricCanvas = useRef(null); // Biến để lưu cái bảng vẽ

  // useEffect: Chạy 1 lần duy nhất khi web vừa tải xong
  useEffect(() => {
    // Tạo ra một bảng vẽ (Canvas) kích thước 300x400
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: 300,
      height: 400,
      backgroundColor: 'transparent' // Nền trong suốt
    });

    fabricCanvas.current = initCanvas; // Lưu lại để dùng sau

    // Dọn dẹp khi tắt web (Quy tắc bắt buộc của React)
    return () => {
      initCanvas.dispose();
    }
  }, []);

  // Hàm: Chức năng thêm chữ vào áo
  const themChuVaoAo = () => {
    // Tạo một đối tượng chữ
    const chuMoi = new fabric.IText('Lớp 12A', {
      left: 50,      // Cách trái 50px
      top: 100,      // Cách trên 100px
      fill: 'red',   // Màu đỏ
      fontSize: 30   // Cỡ chữ
    });
    
    // Thêm chữ đó vào bảng vẽ
    fabricCanvas.current.add(chuMoi);
  };

  // 3. KHU VỰC HIỂN THỊ (Giao diện người dùng nhìn thấy)
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Web Thiết Kế Áo - Bài 1</h1>
      
      {/* Nút bấm */}
      <button onClick={themChuVaoAo} style={{ padding: '10px 20px', fontSize: '16px', marginBottom: '20px', cursor: 'pointer' }}>
        + Thêm Chữ
      </button>

      {/* Khu vực cái áo và bảng vẽ */}
      <div style={{ position: 'relative', width: '500px', height: '600px', border: '1px solid #ccc', margin: '0 auto' }}>
        
        {/* Ảnh cái áo nền */}
        <img 
          src="pod-project\image\tshirt.jpeg" 
          alt="Ao Thun"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />

        {/* Bảng vẽ trong suốt đè lên ngực áo */}
        <div style={{ 
          position: 'absolute', 
          top: '120px', 
          left: '100px', 
          border: '1px dashed blue' // Viền xanh để bạn dễ nhìn vùng in
        }}>
          <canvas ref={canvasRef} />
        </div>

      </div>
    </div>
  );
}

export default App;