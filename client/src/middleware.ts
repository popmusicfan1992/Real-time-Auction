import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Khai báo các route cần được bảo vệ (Bắt buộc phải có token)
const protectedRoutes = ['/dashboard'];

export function middleware(request: NextRequest) {
  // Lấy token từ cookies (nếu có lưu ở cookies)
  // Trong trường hợp này, vì token được lưu ở localStorage ở client-side, 
  // middleware (chạy ở server) không thể đọc được localStorage.
  // Tuy nhiên, để bảo vệ Route cơ bản từ server-side, chúng ta có thể kiểm tra 
  // cookie nếu ứng dụng có set cookie, HOẶC để client components tự redirect.
  // Vì JWT đang nằm trong localStorage, middleware này sẽ đóng vai trò dự phòng
  // nếu bạn chuyển sang lưu trữ cookie trong tương lai.
  
  // NOTE: Để bảo mật toàn diện trên App Router, thông thường Token phải nằm trong Cookie.
  // Hiện tại, Next.js Middleware không đọc được localStorage.
  // Chúng ta sẽ cho phép đi qua, việc block sẽ do AuthContext xử lý hoặc chúng ta phải chuyển sang cookie-based auth.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
