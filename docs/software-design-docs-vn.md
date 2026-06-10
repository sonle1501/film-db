# Tài liệu phát triển phần mềm (Software Development Notes)

## Về tài liệu này
Đây là nhật ký ghi lại các ý tưởng và cách giải quyết các bài toán trong quá trình xây dựng hệ thống `film-db`. Đối với các yêu cầu chức năng (Functional Requirements), có thể tham khảo thêm tại tài liệu [SRS.md](./SRS.md).

---

## Mục tiêu (Goal)

### Tận dụng dữ liệu mẫu có sẵn (Dataset)
* **IMDb Dataset**: Tận dụng nguồn dữ liệu non-commercial dồi dào từ IMDb với hàng triệu bộ phim cùng thông tin liên quan (dàn diễn viên, đạo diễn,...). Bộ dữ liệu này được cập nhật hàng ngày.
* **TMDb API**: TMDb cũng là một trang dữ liệu phim miễn phí và cung cấp API để lấy thông tin. Tuy nhiên, việc gọi API liên tục là không cần thiết. Hệ thống chỉ sử dụng API của TMDb cho các tác vụ không bắt buộc như lấy poster của phim.

### Tại sao lại làm film-db
* Giúp người dùng trải nghiệm kho phim khổng lồ qua các tính năng như: tìm kiếm thông minh (smart search), thêm phim vào danh sách yêu thích, khám phá các thông tin thêm.
* Việc có sẵn một cơ sở dữ liệu phim đầy đủ giúp chúng ta dễ dàng mở rộng các tính năng sau này mà không cần phải tích hợp dữ liệu video/streaming. Ví dụ: lấy link xem phim, cập nhật tin tức điện ảnh, tích hợp AI, hoặc xây dựng hệ thống gợi ý phim theo gu (recommendation system)...

---

## Kế hoạch triển khai (Plan)

### Proof of Concept - POC
Liệu có thể chạy pipeline tự động tải dữ liệu từ IMDb rồi import trực tiếp vào PostgreSQL được không ? Chuẩn bị sẵn các kế hoạch dự phòng
* **Vấn đề tải dữ liệu**: Nếu Java không tải được qua URL của IMDb được do bị chặn -> Giải pháp thay thế là tải file thủ công qua browser và sử dụng dữ liệu tĩnh (static data).
* **Vấn đề import dữ liệu**: Nếu không thể import trực tiếp các file thô dạng TSV được -> Cần phải xử lý/định dạng lại dữ liệu trước rồi mới đẩy vào cơ sở dữ liệu.

---

## Kiến trúc & Công nghệ (Architecture & Tech Stack)

* **Kiến trúc Modular Monolith**: Hệ thống được chia tách thành các module nhưng vẫn deploy cùng nhau.
  * *Lý do*: decoupling, dễ đọc code và scale hơn. Việc dùng Modular Monolith tránh sự rối trong code của Monolith truyền thống khi gom chung lại, và cũng tránh sự cồng kềnh của Microservices (overengineering/overkill). Chúng ta hoàn toàn có thể scale thành Microservices sau này nếu cần với kiến trúc này
* **Monorepo**: Giúp quản lý toàn bộ source code tại một nơi duy nhất, dễ dàng phối hợp và tận dụng các công cụ hỗ trợ code bằng AI (agentic coding).
* **PostgreSQL**:
  * FTS - Full-Text Search
  * native Array `[]`
  * Sử dụng lệnh copy của JDBC (JDBC COPY command) để tăng tốc nạp dữ liệu.
  * Tận dụng Materialized Views
* **Gradle**:
  * Tối ưu hóa hiệu năng build
  * Cho phép viết custom plugin để chia sẻ thư viện dùng chung (dependencies), nạp biến môi trường từ các file cấu hình (load env)...
  * Dễ đọc các khai báo hơn
  * (Maven cũng làm được mấy cái này, nhưng Gradle gọn và linh hoạt hơn).

---

## Thiết kế phần mềm (Software Design)

Dưới đây là cách mình triển khai các tính năng và giải quyết các bài toán kỹ thuật cụ thể:

### 1. Tải và xử lý dữ liệu IMDb (Download & Locate Dataset)

#### Gửi request đến IMDb server
* Sử dụng `InputStream`, `OutputStream` kết hợp với các class trong gói `net.http` (như `HttpClient`, `HttpRequest`, `HttpResponse`).
* Gửi HTTP request đến server IMDb để lấy dữ liệu tải xuống dưới dạng stream (`InputStream`).

#### Nhận và ghi file (Stream writing)
* Sử dụng cấu trúc `try-with-resources` để tự động giải phóng và đóng `InputStream` khi xử lý xong body.
* Đọc dữ liệu theo từng block (chunk) vào buffer (lưu tạm trên RAM) rồi dùng `OutputStream` ghi trực tiếp xuống ổ đĩa cứng.

#### Đánh đổi (Trade-offs)
* *Tại sao không đọc cả file dưới dạng `String`?* Vì file dữ liệu quá lớn, đọc toàn bộ vào RAM sẽ gây tràn bộ nhớ (OutOfMemoryError). Việc dùng stream giúp xử lý file dung lượng lớn an toàn.
* *Tại sao không dùng `BodyHandlers.ofFile()`?* Vì chúng ta cần theo dõi trực tiếp dung lượng đã tải để tính toán và hiển thị % tiến độ (progress bar) thời gian thực cho người dùng.

#### Tổng hợp thành pipeline
* Thiết lập một pipeline download hoàn chỉnh.
* Chạy 7 luồng (thread) riêng biệt để tải đồng thời 7 file dữ liệu từ IMDb.

---

### 2. Import - Copy dữ liệu TSV vào Postgres thông qua Java

#### Định dạng mảng (Array format) & Functional Interface
* Trong dữ liệu của IMDb, kiểu mảng được lưu dạng chuỗi phân tách bằng dấu phẩy, ví dụ cột thể loại phim `genres` là `"Action,Drama"`. Tuy nhiên, để copy trực tiếp vào cột kiểu Array trong PostgreSQL, ta phải format lại thành định dạng mảng của Postgres: `"{Action,Drama}"`.
* Để giải quyết bài toán này, chúng ta khai báo một `@FunctionalInterface` với hàm biến đổi: `String[] format(String[] parts)`. Hàm này nhận vào một mảng chuỗi (chính là các cột của dòng dữ liệu) và trả về một mảng chuỗi đã được định dạng lại.

#### Đa hình (Polymorphism)
* Mỗi file TSV có các cột cần format khác nhau. Ví dụ: file chứa thông tin phim (Movies) cần biến đổi ở cột thứ 9 (chỉ số 8), còn file thông tin tác giả/diễn viên (Person) lại cần xử lý ở cột 5 và 6.
* Do đó, chúng ta cần viết các công thức format riêng cho từng loại file dữ liệu. Tuy nhiên, dù công thức cụ thể ra sao thì chúng vẫn đều implement chung interface định dạng ở trên.
* Nhờ tính đa hình (Polymorphism), tại thời điểm viết code, class [PostgreCopyEngine](../modules/importer/src/main/java/dev/sonle/filmdb/importer/core/PostgreCopyEngine.java) chỉ cần biết và gọi duy nhất hàm `format()`. Lúc chạy thực tế (runtime), hệ thống sẽ tự động gọi logic xử lý định dạng tương ứng cho từng file.

#### StringBuilder
* `StringBuilder` là đối tượng có thể thay đổi (mutable). Nếu dùng class `String` thông thường (immutable), JVM sẽ bị quá tải vì liên tục tạo ra các đối tượng chuỗi mới trên Heap memory mỗi khi nối chuỗi.
* `StringBuilder` chạy nhanh hơn `StringBuffer` do không phải gánh thêm cơ chế đồng bộ hóa (synchronization). Việc này an toàn vì mỗi thread đảm nhận mỗi nhiệm vụ riêng, không dùng chung dữ liệu

#### Lệnh COPY (Copy Command)
* Sử dụng lệnh `COPY` (Bulk Ingestion) của PostgreSQL thông qua API `CopyManager` của JDBC. Phương pháp này giúp nạp dữ liệu nhanh hơn vượt trội so với lệnh `INSERT` thông thường

---

### 3. Staging và Zero-Downtime khi Import

#### Thử thách (Challenge)
Dữ liệu IMDb được cập nhật hàng ngày trên server. Do đó, quản trị viên (admin) cũng cần cập nhật dữ liệu của hệ thống thường xuyên để đồng bộ. Tuy nhiên, nếu cập nhật theo cách thông thường (xóa bảng cũ, import bảng mới), hệ thống sẽ phải dừng hoạt động (downtime) khoảng 30 phút để hoàn thành.

* **Giải pháp**: Sử dụng các bảng tạm (Staging Tables) và cơ chế hoán đổi nguyên tử (Atomic Swap).

#### Tích hợp vào Pipeline
Dữ liệu mới sẽ được import toàn bộ vào các bảng tạm (`staging tables`). Khi việc import hoàn tất, hệ thống sẽ thực hiện hoán đổi tên (rename) giữa các bảng tạm này với các bảng đang hoạt động (`active tables`) thông qua một script SQL [swap_staging_tables.sql](../apps/backend/src/main/resources/db/script/swap_staging_tables.sql). Toàn bộ quá trình hoán đổi được bọc trong một transaction JDBC duy nhất để đảm bảo nếu có lỗi xảy ra thì sẽ tự động rollback ngay lập tức.

#### Xử lý Index
Các index trên bảng tạm sẽ bị xóa trước khi import dữ liệu, sau đó được tạo lại sau khi import xong và trước khi thực hiện đổi tên. Cách này giúp tránh việc PostgreSQL phải liên tục cập nhật index cho từng dòng dữ liệu trong quá trình import, qua đó tăng đáng kể hiệu năng ghi (write performance).

#### Hủy pipeline từ phía Client (Cancel Pipeline)
Mặc dù chưa triển khai, nhưng về mặt ý tưởng, chúng ta có thể kiểm tra liên tục một flag hủy trong khi đang import theo từng batch dữ liệu, kết hợp với phương thức `CompletableFuture.cancel()` để chuyển trạng thái. Việc dừng pipeline sẽ được thực hiện bằng cách ném ra ngoại lệ `InterruptedException`.
Về bản chất, cơ chế này cần sử dụng kỹ thuật kiểm tra trạng thái chủ động (polling) liên tục trong luồng xử lý.

---

### 4. Hệ thống theo dõi import pipeline (Feedback Pipeline)

#### Thử thách (Challenge)
Khi admin kích hoạt pipeline, họ muốn theo dõi tiến trình chạy theo thời gian thực (real-time) để biết hệ thống đã xử lý được bao nhiêu phần trăm (%).

#### Cơ chế treo bộ đếm khi Download
Đếm bytes đã download, sau đó feedback mỗi giây (nếu feedback theo lượng buffer size thì dễ gây quá tải)

#### Cơ chế treo bộ đếm khi Import
Vì các file tải về là file nén dạng `.gz`, chúng ta không thể biết chính xác dung lượng thực tế sau khi giải nén là bao nhiêu để tính toán phần trăm. Do đó, hệ thống sẽ đếm số bytes thô của file `.gz` đã được decode và copy vào Postgres, rồi so sánh với dung lượng gốc của file `.gz`.

Để làm việc này, chúng ta sử dụng custom class [CountingInputStream](../modules/importer/src/main/java/dev/sonle/filmdb/importer/core/CountingInputStream.java) (kế thừa từ `FilterInputStream` của Java) treo bộ đếm này vào file `.gz` stream. Mỗi khi luồng đọc dữ liệu từ file `.gz`, bộ đếm sẽ ghi nhận số bytes đã xử lý. Hệ thống sẽ phát event cập nhật tiến độ sau mỗi batch 100.000 dòng được ghi vào cơ sở dữ liệu.

---

### 5. Giao tiếp giữa các Modules

Trong project này, chúng ta sử dụng 2 cơ chế giao tiếp chính:
1. **Giao tiếp qua Interface chung (Shared Interface)** đặt ở shared module.
2. **Giao tiếp qua Event** trong shared module, theo mô hình Publisher-Listener, sử dụng Spring Events

Dưới đây là một số ví dụ:

#### Dùng Shared Interface
* **Bài toán**: Module `admin` cần lấy danh sách và thông tin chi tiết của người dùng (Users).
* **Giải quyết**:
  * Khai báo một interface [UserListInterface](../modules/shared/src/main/java/dev/sonle/filmdb/shared/interfaces/UserListInterface.java) tại shared module.
  * Module `admin` chỉ cần gọi các phương thức định nghĩa trong interface này.
  * Module `users` khai báo class [UserListInternalController](../modules/users/src/main/java/dev/sonle/filmdb/users/controller/internal/UserListInternalController.java) để implement các phương thức đó.
  * Bằng cách này, `admin` và `users` có thể trao đổi dữ liệu với nhau thông qua interface trung gian mà không biết về nhau

#### Dùng cơ chế Publisher-Listener đồng bộ (Synchronous Event)
* **Bài toán**: Người dùng gửi yêu cầu ứng tuyển làm admin, và module `admin` cần tiếp nhận yêu cầu này để xét duyệt.
* **Giải quyết**:
  * Khai báo một event dùng chung tại shared module tên là [RegisterAdminEvent](../modules/shared/src/main/java/dev/sonle/filmdb/shared/event/RegisterAdminEvent.java).
  * Bên phía `users`, ta dùng `ApplicationEventPublisher` để phát event này đi.
  * Bên phía `admin`, ta sử dụng `@EventListener` để lắng nghe event và ghi nhận thông tin yêu cầu vào bảng duyệt (`Pending requests`).
  * Cơ chế này chạy đồng bộ (synchronous), tuần tự và được bọc chung trong transaction (sử dụng Propagation mặc định của Spring).

#### Dùng cơ chế Publisher-Listener bất đồng bộ (Asynchronous Event)
* **Bài toán**: Admin muốn cập nhật tiến độ chạy pipeline theo thời gian thực.
* **Giải quyết**:
  * Hệ thống vẫn phát event dùng chung (như [ImportProgressEvent](../modules/shared/src/main/java/dev/sonle/filmdb/shared/event/ImportProgressEvent.java)), nhưng lần này sẽ xử lý bất đồng bộ - async.
  * Bên module `admin` sử dụng class [ImportJobEventListener](../modules/admin/src/main/java/dev/sonle/filmdb/admin/listener/ImportJobEventListener.java) được đánh dấu `@Async` và `@EventListener` để xử lý event trên một thread mới.
  * Phía module `importer` chỉ việc phát event khi có tiến độ mới và tiếp tục công việc của mình mà không cần chờ đợi bên `admin` xử lý xong.
  * *Ưu điểm*: Xử lý bất đồng bộ giúp tránh tình trạng nghẽn luồng (non-blocking), giúp tối ưu hóa hiệu năng chạy pipeline.

---

### 6. Cơ chế xử lý ngoại lệ (Exception Handling)

Hệ thống xử lý lỗi tập trung dựa trên 2 điểm mấu chốt:
* **Ngoại lệ tự định nghĩa (Custom Exception)**: Được chia thành 2 nhóm rõ ràng:
  * [BusinessException](../modules/shared/src/main/java/dev/sonle/filmdb/shared/exception/BusinessException.java): Lỗi do vi phạm nghiệp vụ phần mềm (ví dụ: không tìm thấy phim, trùng lặp tài khoản,...).
  * [AppException](../modules/shared/src/main/java/dev/sonle/filmdb/shared/exception/AppException.java): Lỗi do hệ thống hoặc lỗi kỹ thuật bên trong (ví dụ: kết nối DB thất bại, lỗi phân tích file,...).
* **Bộ xử lý lỗi toàn cục (Global Exception Handler)**: Xử lý tập trung các custom exception trên và các lỗi phổ biến của hệ thống (như Optimistic Locking, `DataAccessException`, lỗi không xác định...). Class xử lý lỗi này được đánh dấu bằng annotation `@RestControllerAdvice` (xem tại [GlobalExceptionHandler.java](../modules/shared/src/main/java/dev/sonle/filmdb/shared/exception/GlobalExceptionHandler.java)).

#### Nguyên tắc thiết kế:
* **Tránh lộ Stack Trace ra ngoài**: Tuyệt đối không trả về stack trace hay thông tin lỗi hệ thống chi tiết cho client ở môi trường production. Nhiệm vụ ghi log chi tiết thuộc về các class phát sinh lỗi.
* **Tách biệt lỗi nghiệp vụ và lỗi hệ thống**
* **Nguyên tắc Fail-Fast**: Việc có sẵn cấu trúc lỗi tập trung giúp các class trong hệ thống thoải mái throw ngoại lệ ngay khi phát hiện trạng thái sai lệch, không cần phải đắn đo xem layer phía trên sẽ bắt lỗi và xử lý như thế nào.

---

### 7. Xác thực & Phân quyền với Spring Security (Authentication & Authorization)

#### Thử thách (Challenge)
Xây dựng một cơ chế vừa tiện lợi, vừa có khả năng duy trì trạng thái đăng nhập lâu dài (Remember-Me)

* **Giải pháp**: Kết hợp sử dụng cặp token: **Access Token dạng JWT** (vô trạng thái - stateless, thời gian sống ngắn) và **Refresh Token dạng UUID** (có trạng thái - stateful, thời gian sống dài).

#### Quy trình hoạt động:
* Người dùng đăng ký/đăng nhập thành công sẽ nhận được 1 Access Token và 1 Refresh Token.
* **Stateless**: Backend không nhớ bạn là ai. Client phải đính kèm Access Token vào header của mỗi HTTP request gửi lên server.
* Khi Access Token hết hạn, client tự động dùng Refresh Token để xin Access Token mới. Khi cả Refresh Token cũng hết hạn thì người dùng mới cần đăng nhập lại.

#### Cơ chế đăng nhập và so khớp mật khẩu
* Việc xác thực đăng nhập được giao cho `AuthenticationManager` (được cấu hình bean trong [SecurityConfig](../modules/shared/src/main/java/dev/sonle/filmdb/shared/security/SecurityConfig.java) và inject vào [AuthService](../modules/users/src/main/java/dev/sonle/filmdb/users/service/AuthService.java)).
* `AuthenticationManager` chọn provider để xử lý, chúng ta config `DaoAuthenticationProvider` làm provider để xử lý, lấy thông tin tài khoản qua `UserDetailsService` và so khớp mật khẩu bằng `BCryptPasswordEncoder`.
* *Lưu ý*: Hàm `encode()` của `PasswordEncoder` giúp hash mật khẩu dạng text thô để lưu xuống database, còn hàm `matches()` dùng để so khớp mật khẩu dạng text thô do người dùng nhập vào với mật khẩu đã hash lưu trong DB. BCrypt là thuật toán băm mật khẩu được Java khuyên dùng.

#### Cơ chế tạo và xác thực JWT
* Khi người dùng đăng nhập thành công, phương thức `generateToken()` trong [JwtService](../modules/shared/src/main/java/dev/sonle/filmdb/shared/security/JwtService.java) sẽ lấy thông tin `username` cùng thời gian hiệu lực, mã hóa chúng để tạo ra phần Payload của JWT. Phần chữ ký (Signature) sẽ được ký bằng khóa bí mật `JWT_SECRET`.
* Khi nhận được request từ client, backend sẽ tự động tính toán lại chữ ký dựa trên header.payload nhận được và so sánh với Signature trong hệ thống
* Hệ thống xác thực trực tiếp dựa trên thuật toán và khóa bí mật nằm trên RAM mà không cần truy vấn database để kiểm tra token có hợp lệ hay không. Chỉ khi cần trích xuất thông tin người dùng từ `username` trong token thì mới truy vấn database.
* *Filter*: Sử dụng `OncePerRequestFilter` để đảm bảo filter xác thực chỉ chạy đúng một lần cho mỗi request đi vào ứng dụng. Dòng lệnh `filterChain.doFilter(request, response)` cho phép request đi tiếp qua các filter tiếp theo trong chuỗi.
* Trạng thái xác thực sau đó sẽ được lưu vào `SecurityContextHolder` (lưu tạm trên bộ nhớ RAM của thread hiện tại). Các filter phân quyền phía sau sẽ đọc thông tin từ đây để quyết định cho phép truy cập hay từ chối request.

#### Cơ chế Refresh Token
* Refresh Token là một chuỗi ngẫu nhiên dạng UUID được lưu trữ trong cơ sở dữ liệu (stateful) và có thể thu hồi (clear) bất kỳ lúc nào nếu phát hiện nghi vấn bảo mật.
* Token này được gửi về client qua Cookie với các cờ bảo vệ:
  * `HttpOnly(true)`: Ngăn chặn mã độc Javascript truy cập nhằm chống tấn công XSS.
  * `SameSite("Strict")`: Chỉ gửi cookie nếu request xuất phát từ chính trang web của hệ thống để chống tấn công CSRF.
  * `Secure(true)`: Chỉ gửi cookie đi qua các kết nối được bảo mật bằng HTTPS.
* Browser lưu refresh token vào vùng nhớ Cookie, tự động đính kèm cookie vào Header cookie khi gửi request

#### Đạt được tính năng Remember-Me (Duy trì đăng nhập)
* Khi Access Token hết hạn, request của client sẽ bị server trả về lỗi `401 Unauthorized`.
* Phía client, Axios Interceptor sẽ tự động phát hiện lỗi 401, sau đó thực hiện gọi ngầm API `/api/auth/refresh` với tùy chọn `withCredentials: true` để xin Access Token mới bằng HttpOnly Cookie Refresh Token.
* Khi có Access Token mới, nó sẽ được lưu vào `Zustand` (RAM của frontend) để dùng tiếp. Toàn bộ quá trình này diễn ra hoàn toàn ngầm và tự động (silent refresh), giúp người dùng không cảm thấy bị ngắt quãng trải nghiệm ngay cả khi họ reload lại trang.

---

### 8. Công cụ tìm kiếm thông minh (Search Engine)

#### Thử thách (Challenge)
Xây dựng một bộ máy tìm kiếm phim thông minh, đúng ý người dùng, ngang hoặc hơn cả IMDb bản gốc.

#### Nguyên tắc cốt lõi:
1. Dự đoán và tìm cách khớp tối đa ý định của người dùng (user's intent) với kết quả trả về.
2. Xếp hạng các kết quả dựa trên điểm độ liên quan (Relevance Score) từ cao xuống thấp.

* **Công thức tính điểm**:
  $$\text{Relevance Score} = \text{Match Score} \times \text{Boost Score}$$
  * `Match Score`: Độ trùng khớp của từ khóa tìm kiếm so với thông tin phim trong cơ sở dữ liệu.
  * `Boost Score`: Hệ số ưu tiên dựa trên độ phổ biến (lượt vote) và điểm số đánh giá thực tế của phim.

#### Cơ chế tính Match Score
Quy trình tính điểm trùng khớp từ khóa được triển khai chi tiết tại phương thức `searchSmart` trong [SearchRepository.java](../modules/search/src/main/java/dev/sonle/filmdb/search/repository/SearchRepository.java):

1. **Xử lý từ khóa tìm kiếm (Query processing)**:
   Sử dụng hàm `websearch_to_tsquery` của PostgreSQL để chuyển đổi từ khóa nhập vào thành câu truy vấn FTS. Chúng ta sẽ trích xuất ra các dạng tìm kiếm sau:
   * Từ khóa gốc (Literal Query).
   * Từ khóa tìm kiếm dạng tiếng Anh (`ts_q_eng`).
   * Từ khóa tìm kiếm dạng đơn giản/chung chung (`ts_q_simp`).
   * Hệ số co giãn theo độ dài từ khóa (`length_scale`): Giới hạn tối đa là 1.0 (đạt điểm tối đa khi từ khóa từ 10 ký tự trở lên).
2. **Xây dựng Vector tìm kiếm trong Postgres**:
   Hệ thống biến đổi tiêu đề phim thành các FTS Vector để so sánh:
   * **English Search Vector** (được đánh trọng số ưu tiên cao cho tiêu đề chính `primary_title` so với tiêu đề gốc `original_title`): Hệ số nhân điểm là `0.2`.
   * **Simple Search Vector** (không cố chuyển đổi sang tiếng Anh mà giữ nguyên văn bản thô để tìm kiếm chung chung): Hệ số nhân điểm là `0.4`.
3. **Tính điểm và cộng điểm thưởng**:
   * Khớp FTS tiếng Anh (`ts_q_eng`) với `main_search_vector`: Nhân hệ số `0.2`.
   * Khớp FTS chung chung (`ts_q_simp`) với `main_simple_search_vector`: Nhân hệ số `0.4`.
   * Sử dụng hàm `similarity` để so khớp gần đúng (fuzzy search) từ khóa gốc với tiêu đề chính `primary_title`: Nhân hệ số `0.4` (giúp người dùng gõ sai chính tả một chút vẫn tìm được phim).
   * **Cộng điểm thưởng khớp tiền tố (Prefix Match Bonus)**: Nếu người dùng gõ từ khóa dài từ 3 ký tự trở lên và tiêu đề phim bắt đầu bằng đúng từ khóa đó, cộng thêm `1.0 * length_scale`.
   * **Cộng điểm thưởng vị trí xuất hiện (Position Match Bonus)**: Từ người dũng gõ từ khóa xuất hiện càng sớm trong tiêu đề thì điểm cộng càng cao (tính bằng công thức `(1.0 / vị trí xuất hiện) * length_scale`).

#### Cơ chế tính Boost Score
Hệ số này độc lập với từ khóa tìm kiếm của người dùng, hoàn toàn phụ thuộc vào danh tiếng và chất lượng thực tế của phim nhằm đưa những phim chất lượng nhất lên đầu trang kết quả.

* **Công thức tính**:
  $$\text{Boost Score} = P(N) + (W(N) \times Q(R))$$
  * $P(N)$ (Popularity Score): Điểm cộng dựa trên độ nổi tiếng (lượt đánh giá $N$ - `num_votes`).
  * $W(N)$ (Weighting Gate): Hệ số kiểm soát mức độ ảnh hưởng của chất lượng phim dựa trên lượt vote.
  * $Q(R)$ (Quality Score): Điểm chất lượng dựa trên điểm đánh giá phim $R$ - `average_rating`.

*Chi tiết cách đánh giá số liệu:*
* **Điểm nổi tiếng $P(N)$**:
  * Dưới 100 lượt vote: `0.10` (phim rất ít người biết).
  * Dưới 300 lượt vote: `0.25`.
  * Dưới 500 lượt vote: `0.40`.
  * Dưới 1.000 lượt vote: `0.60`.
  * Dưới 5.000 lượt vote: `0.80`.
  * Dưới 10.000 lượt vote: `1.00`.
  * Từ 10.000 lượt vote trở lên: Điểm cộng tăng dần theo hàm logarit `1.20 + LEAST(1.8, log(10, num_votes / 10000.0) / log(10, 100.0))`. Điểm cộng tối đa là `3.0` (trong đó phần logarit được giới hạn cao nhất là `1.8`). Hàm log giúp kìm lại tốc độ tăng điểm khi số vote quá khủng (ví dụ phim 200k vote và 300k vote không chênh lệch quá nhiều vì đều đã quá uy tín).
* **Hệ số kiểm soát $W(N)$**:
  * Dưới 100 lượt vote: `0.0` (phim quá ít lượt vote thì điểm đánh giá cao hay thấp đều không đáng tin, không cho phép điểm chất lượng đóng góp vào hệ số boost).
  * Dưới 500 lượt vote: `0.3`.
  * Dưới 5.000 lượt vote: `0.6`.
  * Từ 5.000 lượt vote trở lên: `1.0` (điểm đánh giá được ghi nhận 100%).
* **Điểm chất lượng $Q(R)$**:
  * Điểm dưới 3.0: `-0.20` (phim quá tệ sẽ bị trừ điểm thẳng tay để dìm xuống dưới, chúng ta né những phim tiêu cực 1 chút).
  * Điểm dưới 4.0: `0.05`.
  * Điểm dưới 5.0: `0.15`.
  * Điểm từ 5.0 trở lên: `0.30` (đạt mức chất lượng uy tín).

#### Tìm kiếm thời gian thực (Live Search) & Tìm kiếm tiếng Việt
* **Tìm kiếm tiếng Việt (Vietnamese Search)**: Tận dụng cột vector được định dạng riêng cho tiếng Việt (`vietnamese_search_vector` và `vietnamese_titles_concat`) để so sánh
* **Live Search**: Bỏ qua Vector FTS p để tiết kiệm tài nguyên. Thay vào đó, hệ thống chỉ sử dụng so khớp gần đúng `similarity` (hệ số `0.5`), điểm thưởng prefix match, điểm thưởng vị trí và lọc nhanh bằng các toán tử như `%` (fuzzy search của extension `pg_trgm`) và `ILIKE` (so khớp chính xác không phân biệt hoa thường).

---

### 9.CI/CD & Máy chủ nội bộ (Home Server)

#### Docker
* **Multi-stage Build (Build xong chạy)**: Cả frontend và backend đều dựng image môi trường build trước để compile, sau đó chỉ copy chọn lọc sản phẩm cuối cùng (như file JAR hoặc thư mục Next.js build) vào image chạy thực tế. Cách này giúp loại bỏ hoàn toàn các file rác và thư viện build, giảm dung lượng image xuống mức tối thiểu.
* **FAT JAR**: Java được đóng gói dưới dạng file `.jar` chạy độc lập thay vì file `.war` truyền thống, vì Spring Boot đã tích hợp sẵn máy chủ Tomcat bên trong.
* **Volume Mount trong Docker Compose**: Sử dụng cơ chế mount phân vùng dữ liệu `pgdata` của PostgreSQL trực tiếp từ ổ đĩa vật lý của máy host (do hệ điều hành quản lý) vào container.
  * Giúp container ghi dữ liệu trực tiếp xuống ổ cứng SSD của máy host mà không cần đi qua trung gian của Storage Driver (như `overlay2`), qua đó tăng tốc độ đọc/ghi dữ liệu.
  * Khi chạy lệnh `docker compose down` rồi `up` lại, container mới sinh ra vẫn được gắn lại đúng phân vùng `pgdata` cũ giúp dữ liệu không bị mất mát.

#### Quy trình triển khai ứng dụng (Project Flow)
Hệ thống hỗ trợ 2 môi trường chính:
1. **Local Development (docker-compose.yml)**: Tiến hành build image trực tiếp tại máy cục bộ rồi khởi chạy container.
2. **Production (docker-compose.prod.yml)**: Quy trình build image và push lên GitHub Container Registry (GHCR) sẽ do GitHub Actions tự động thực hiện. Tại máy chủ, chúng ta khởi chạy container cập nhật tự động [Watchtower](https://github.com/containrrr/watchtower). Watchtower sẽ lắng nghe GHCR, nếu phát hiện có image mới được push lên, nó sẽ tự động pull về và khởi động lại container tương ứng mà không cần admin thao tác thủ công.

#### API và Định tuyến (Routing)

##### Giới hạn tần suất gọi (Rate Limiting)
Sử dụng cấu hình `limit_req` của Nginx với tùy chọn `burst=X nodelay`.
* Ví dụ cấu hình đăng nhập: 10 request/giây (`10r/s`). Nginx cho phép xử lý ngay lập tức các request đến dồn dập (burst) miễn là hàng đợi lưu tạm chưa vượt quá dung lượng `X` (ở đây là 10). Nếu số request vượt quá giới hạn hàng đợi này, Nginx sẽ lập tức trả về lỗi `429 Too Many Requests` thay vì xếp hàng chờ đợi.

##### Trích xuất địa chỉ IP thực tế (Real IP headers)
Nginx truyền các header `X-Real-IP` và `X-Forwarded-For` đến Backend. Nếu thiếu các cấu hình này, khi luồng request đi từ `Internet` $\rightarrow$ `Ngrok` $\rightarrow$ `Nginx` $\rightarrow$ `Backend`, Spring Boot Backend sẽ luôn nhìn thấy địa chỉ IP của tất cả request là địa chỉ IP nội bộ của container Nginx.

##### Định tuyến Request qua Nginx
* **Request đến Frontend**: Nginx chuyển tiếp đến container Next.js. Từ Next.js, nếu cần dữ liệu từ API, nó có thể tự gọi đến backend container thông qua tên miền nội bộ của Docker (Internal Domain Names) mà không cần đi vòng ra ngoài Internet.
* **Request đến API Backend**: Nginx chuyển thẳng đến container Spring Boot xử lý rồi trả kết quả về cho client.

Sơ đồ luồng request tổng quát:
$$\text{Client} \xrightarrow{\text{Internet}} \text{Ngrok Server} \xrightarrow{\text{Home Server}} \text{Ngrok Container} \rightarrow \text{Nginx} \rightarrow \text{Frontend / Backend Container}$$

##### Cơ chế vượt rào chặn API (Bypass API blocks)
Một số nhà mạng Việt Nam chặn truy cập trực tiếp đến API của TMDb. Để giải quyết, Backend của chúng ta không gọi thẳng đến TMDb mà gửi request thông qua một container trung gian chạy **Cloudflare WARP** (`caomingjun/warp`).
* Cấu hình biến môi trường JVM (`JAVA_TOOL_OPTIONS`) trong container backend để thiết lập proxy: `-Dhttp.proxyHost=warp -Dhttp.proxyPort=1080 ...`.
* Đồng thời, cấu hình loại trừ các địa chỉ mạng nội bộ qua tham số `-Dhttp.nonProxyHosts="localhost|127.0.0.1|db|frontend|backend"`.
* Khi Spring Boot cần gọi API bên ngoài internet, request sẽ được chuyển tiếp qua cổng proxy của container `warp`. Container này kết nối an toàn đến mạng Cloudflare để chuyển tiếp request đến TMDb và lấy kết quả trả về, giải quyết triệt để vấn đề bị chặn mạng.

---

### 10. Các giải pháp kỹ thuật khác

* *API Versioning**: Sử dụng cấu hình [WebMvcConfig](../modules/shared/src/main/java/dev/sonle/filmdb/shared/config/WebMvcConfig.java) để định tuyến và quản lý các phiên bản API khác nhau một cách linh hoạt.
* **TMDb Poster Integration**: Sử dụng ID của phim để gọi API từ TMDb lấy URL ảnh poster tương ứng hiển thị lên giao diện.
* **Config bên ngoài**: Sử dụng `@ConfigurationProperties` của Spring Boot để tự động map các biến môi trường và file cấu hình bên ngoài rồi nạp vào trong.
* **Custom Gradle Plugin**: Viết plugin [filmdb.env-loader.gradle.kts](../build-logic/src/main/kotlin/filmdb.env-loader.gradle.kts) tự động đọc file cấu hình `secret.env` và nạp các biến môi trường vào các task chạy Java/Test. Điều này giúp dev có thể chạy ứng dụng qua command line hoặc chạy unit test dễ dàng mà không cần phải nạp biến môi trường thủ công hay phụ thuộc vào IDE.
* **Modern java approach**: Ưu tiên sử dụng DTO để trao đổi dữ liệu, sử dụng `Optional` để hạn chế lỗi Null Pointer Exception, và dùng `Enum`
