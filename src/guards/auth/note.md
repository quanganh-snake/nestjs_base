# Quy trình Auth Guard

1. Kiểm tra token hợp lệ không?

- Có Token ?

- Get được user từ Token? -> lấy được user -> lưu vào header

2. Kiểm tra ACT trong blacklist

- Kiểm tra trước khi get user -> nếu đã tồn tại ACT trong backlist -> không trả về dữ liệu user nữa
