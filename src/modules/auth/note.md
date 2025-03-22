# Cách tạo JWT với thuật toán BẤT ĐỐI XỨNG

# Sử dụng thuật toán bất đối xứng với publicKey & privateKey dùng trong hệ thống Authenticated

- **privateKey**:

  - Dùng để `sign` accessToken & refreshToken

  - Không lưu trong hệ thống

- **publicKey**

  - Dùng để `verify` token

  - Lưu lại trong hệ thống

  - Vì **publicKey** không có nhiệm vụ `sign` token --> Nếu bị đánh cắp thì không thể sinh ra nhiều `token`

# Bài toán: 1. Token Rotation (Token xoay vòng)

- Khi refreshToken -> sinh ra cặp acessToken & refreshToken mới -> cần thu hồi refreshToken cũ

- Tuy nhiên nếu accessToken vẫn còn sống => Cần thu hồi cả accessToken

=> 2 việc cần làm sau khi refreshToken: `thu hồi refreshToken cũ + accessToken cũ`

# Bài toán: 2. Blacklist token

- Nhằm thu hồi accessToken nếu còn sống

- Khi logout => lưu accessToken vào blacklist (Redis => hash hoặc lưu `id token (tìm hiểu về: `**jti**`(https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.7))`) => thu hồi accessToken
