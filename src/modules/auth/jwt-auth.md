# Tổng quan về Authenticated JWT

JWT (JSON Web Token) được sử dụng để xác thực người dùng trong hệ thống. Trong đó:

- `Access Token (ACT)`: Token có thời hạn ngắn, dùng để xác thực các yêu cầu API.

- `Refresh Token (RFT)`: Token có thời hạn dài hơn, dùng để làm mới Access Token khi ACT hết hạn.

- `Redis`: Được sử dụng để lưu trữ và quản lý token, hỗ trợ kiểm soát phiên và thu hồi token khi cần.
  Dưới đây là logic của từng trường hợp:

## TH1: Login

**Mô tả**

Khi người dùng đăng nhập thành công, hệ thống sẽ:

- Tạo Access Token (ACT) và Refresh Token (RFT).
- Lưu token vào Redis dưới dạng hash hoặc ID token, được mã hóa thành chuỗi bằng JSON.stringify.

**Quy trình**

1. Người dùng gửi thông tin đăng nhập (username/password).

2. Hệ thống xác thực thông tin.

3. Nếu hợp lệ:

- Tạo ACT và RFT.
- Lưu vào Redis với cấu trúc:

```typescript
const token = {
  access: '<ACT>',
  refreshToken: '<RFT>',
};

const hashToken = `${md5(JSON.stringify(token))}`;
await this.redis.set(`token_${hashToken}`, hasToken);
```

## TH2: Refresh Token

**Mô tả**

Khi Access Token hết hạn, người dùng gửi Refresh Token để yêu cầu cấp mới token. Hệ thống sẽ:

- Thu hồi token cũ (ACT cũ và RFT cũ).
- Tạo và lưu token mới (ACT mới và RFT mới) vào Redis.

**Quy trình**

1. Client gửi yêu cầu refresh token với RFT cũ.
2. Hệ thống kiểm tra:

- RFT cũ có tồn tại trong Redis không?
- RFT cũ có hết hạn không (dựa trên EXP)?

3. Nếu RFT cũ hợp lệ:

- Thu hồi token cũ:
  - Access Token cũ: Nếu vẫn còn hạn, lưu vào blacklist trên Redis (danh sách token bị từ chối).
  - Refresh Token cũ: Xóa khỏi Redis.
- Tạo ACT mới và RFT mới.
- Lưu ACT mới và RFT mới (kèm EXP của RFT mới) vào Redis.

4. Trả về ACT mới và RFT mới cho client.

**Lý do**

- Thu hồi token cũ ngăn chặn việc sử dụng token không hợp lệ sau khi refresh.
- Lưu ACT cũ vào blacklist đảm bảo các yêu cầu API dùng ACT cũ sẽ bị từ chối.
- Xóa RFT cũ khỏi Redis ngăn chặn việc sử dụng lại RFT cũ để làm mới token.

## TH3: Các Request API Cần Xác Thực Qua Access Token

**Mô tả**

Các API nhạy cảm (ví dụ: lấy profile, API admin) yêu cầu Access Token để xác thực. Hệ thống sử dụng một **AuthGuard** để xử lý các yêu cầu này.

**Quy trình**

1. Client gửi yêu cầu API kèm theo Access Token trong header (thường là `Authorization: Bearer <ACT>`).

2. **AuthGuard** thực hiện các bước kiểm tra:

- Bước 1: Kiểm tra Access Token có tồn tại không (có được gửi lên không, có rỗng không)?

- Bước 2: Lấy thông tin người dùng dựa trên Access Token:

  - Giải mã ACT để lấy thông tin (ví dụ: user ID).

  - Trong service lấy user, kiểm tra Access Token có nằm trong blacklist trên Redis không:

    - Nếu không có trong blacklist: Trả về thông tin người dùng, cho phép truy cập API.

    - Nếu có trong blacklist: Throw lỗi (ví dụ: 401 Unauthorized).

3. Nếu tất cả kiểm tra đều hợp lệ, API tiếp tục xử lý yêu cầu.

**Lý do**

- AuthGuard đảm bảo chỉ các yêu cầu có token hợp lệ mới được xử lý, bảo vệ API nhạy cảm.

- Kiểm tra blacklist giúp từ chối các token đã bị thu hồi (ví dụ: sau khi refresh hoặc logout).
