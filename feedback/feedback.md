1) Feedback giao diện — dạng liệt kê
A. Màn hình khóa / đăng nhập
Điểm ổn
Phong cách dark + tối giản khá hợp với whiteboard cá nhân.
Khối login đặt giữa màn hình, tập trung, dễ hiểu.
Thông điệp ngắn gọn, không rối.
Điểm cần chỉnh
CTA chính đang “mất trọng tâm”
Nút trắng phía dưới nhìn như chưa có label / không nổi rõ vai trò.
Nếu đây là nút mở khóa thì cần text rõ: “Mở khóa” / “Vào workspace”.
Phân cấp thị giác chưa mạnh
Logo + tên app + mô tả + input đang khá gần nhau, làm card hơi “nén”.
Nên tăng khoảng cách theo cụm:
Logo → title
title → mô tả
mô tả → input
input → CTA
Input mật khẩu hơi “mất cảm giác nhập liệu”
Nền input và nền card đều rất tối, độ tương phản chưa đủ.
Nên tăng nhẹ contrast hoặc thêm border/shadow rất mảnh cho input.
Thiếu trạng thái lỗi / loading rõ ràng
Nếu nhập sai passcode, nên có:
text lỗi ngắn dưới input
shake animation nhẹ
disable nút trong lúc verify
Card đang hơi “rỗng ở dưới”
Phần footer “Bảo vệ bằng Static Passcode…” khá nhỏ và chìm.
Có thể thu gọn card height hoặc đẩy footer gần CTA hơn.
B. Màn hình dashboard / danh sách bảng
Điểm ổn
Rất sạch, dễ nhìn, không bị ngợp.
Nút “+ Tạo bảng mới” nổi bật, đúng vai trò primary action.
Card board đơn giản, dễ scan.
Điểm cần chỉnh
Khoảng trống đang quá nhiều
Phần bên dưới dashboard trống lớn, trong khi các board card lại chỉ nằm trong một vùng hẹp.
Cảm giác app “chưa tận dụng không gian”.
Lưới board chưa cân
Các card đang dàn theo hàng nhưng spacing chưa tạo cảm giác “grid system” chắc chắn.
Nên thống nhất:
chiều rộng card
khoảng cách ngang/dọc
max-width container
Thiếu thông tin phân biệt giữa các board
Hiện tại tất cả đều là “Bảng mới”.
Nếu nhiều board sẽ rất khó quản lý.
Nên có ít nhất:
tên board
ngày sửa gần nhất
thumbnail preview nhỏ hoặc badge số phần tử
Header dashboard hơi yếu
“Không gian làm việc” đang đúng chức năng nhưng chưa đủ mạnh về nhận diện.
Có thể thêm dòng phụ kiểu:
“4 bảng • cập nhật gần đây”
hoặc action filter/sort.
Card chưa có affordance rõ
Người dùng nhìn biết “click được”, nhưng chưa thấy các action phụ.
Nên có hover state / menu 3 chấm:
đổi tên
nhân bản
xóa
ghim
C. Màn hình canvas / board editor

Đây là phần quan trọng nhất, và cũng là nơi mình thấy nhiều vấn đề UX + cấu trúc nhất.

Điểm ổn
Canvas fullscreen tạo cảm giác “infinite”.
Toolbars đã gom lên trên, đúng hướng.
Tư duy dark canvas khá hợp với whiteboard.
Vấn đề lớn về UI/UX
Header ngoài + toolbar trong đang “đánh nhau”
Tldraw vốn đã có top UI.
Nếu app còn thêm header riêng phía trên, rất dễ:
che menu trái
lệch toạ độ click
làm toolbar chồng nhau
Đây chính là nguyên nhân của chuỗi bug bạn gặp: menu bị che, nét vẽ lệch, focus mode khó thoát.
Cụm trạng thái góc phải đang hơi “rời rạc”
[ĐÃ LƯU], [KẾT NỐI], ô trắng, bảng màu… chưa tạo thành một control cluster mạch lạc.
Nên gom thành một top-right utility bar có cấu trúc:
Save status
Sync status
Theme / background
Focus mode / exit
More menu
Popup bảng màu đang lơ lửng
Hiện panel màu mở ra giống “đắp thêm” hơn là thuộc về hệ thống UI.
Cần anchor rõ vào công cụ pen / style panel, tránh cảm giác chắp vá.
Tỉ lệ toolbar top chưa tối ưu
Toolbar giữa màn hình đang khá dài, nhưng khoảng cách giữa các nhóm tool chưa rõ.
Nên chia nhóm:
Select / Pan
Draw / Erase / Arrow / Text / Shape
Utility
Canvas chưa có “mode awareness” rõ
Khi vào Focus mode, user cần biết mình đang ở chế độ nào và cách thoát ngay.
Nên luôn có:
badge “Focus mode”
nút “Thoát” cố định
Dark canvas + white stroke preview nhìn ổn, nhưng UI layer chưa thật đồng bộ
Canvas nền đen nhưng các panel, chip, popup vẫn còn cảm giác của “theme khác”.
Cần chuẩn hóa toàn bộ tone đen/trắng cho:
panel
tooltip
button
dropdown
menu
input
2) Lời khuyên về hệ thống code của InfiniNote

Mình sẽ nói thẳng: vấn đề chính hiện tại không nằm ở “thiếu tính năng”, mà nằm ở kiến trúc frontend đang bị trộn giữa “app shell của bạn” và “UI system của tldraw”.
Đó là gốc của hầu hết lỗi gần đây: menu bị che, nét lệch, trạng thái không sync đúng, background/theme bị đè nhau, lỗi asset handler, offline route cũ/mới, v.v.

Khuyến nghị kiến trúc: nên chuyển sang mô hình 4 lớp
1) App Shell Layer

Đây là phần do bạn kiểm soát hoàn toàn, không phụ thuộc tldraw:

routing
lock screen
dashboard board list
auth/passcode
global layout
toast / modal
board metadata
network indicator cấp app
settings panel cấp app

File nên thuộc lớp này

App.jsx
pages/DashboardPage.jsx
pages/BoardPage.jsx
components/LockScreen.jsx
components/Header.jsx
components/BoardCard.jsx
Quy tắc
Không đặt logic canvas vào App Shell
App shell chỉ truyền boardId, initialConfig, userPrefs vào canvas
2) Canvas Integration Layer

Đây là lớp “adapter” giữa app của bạn và tldraw.
Nó phải là lớp mỏng, chỉ làm 4 việc:

mount Tldraw
inject custom components của Tldraw
bridge dữ liệu giữa Tldraw ↔ backend/local store
cấu hình asset / theme / per-board preferences

File nên thuộc lớp này

canvas/InfiniCanvas.jsx
canvas/tldrawComponents.js
canvas/tldrawTheme.js
canvas/registerAssetHandlers.js
canvas/boardPreferences.js
Quy tắc cực quan trọng
InfiniCanvas.jsx không nên chứa quá nhiều business logic.
Nó nên chỉ là “composition root” cho editor.

Ví dụ cấu trúc mong muốn:

<InfiniCanvas
  boardId={boardId}
  boardTheme={boardTheme}
  boardPreferences={prefs}
  onBoardChange={...}
  onConnectionChange={...}
/>

Bên trong:

useBoardSnapshot(boardId)
useBoardSync(boardId, editor)
useBoardAssets(editor)
useBoardTheme(editor, prefs)
useFocusMode(editor, prefs)
3) Realtime / Persistence Layer

Đây là nơi cần tách sạch khỏi UI.
Hiện tại mình đoán useWebSocket, save/load snapshot, delta sync, board persistence đang còn dính vào component canvas. Nên tách ra.

Nên có các hook/service riêng

services/boardApi.js
services/boardSocket.js
hooks/useBoardSync.js
hooks/useBoardPresence.js
hooks/useBoardPreferencesSync.js
Tách 3 loại dữ liệu riêng nhau
a) Document data (phải đồng bộ giữa thiết bị)

Đây là dữ liệu thật của board:

shapes
assets
pages
bindings
text content

=> lưu server / sync realtime

b) Board preferences (nên đồng bộ theo board)

Đây là đúng nhu cầu bạn vừa nêu:

background đen/trắng của board
focus mode mặc định của board
có bật grid không
zoom preset / camera reset policy nếu muốn
có hiện minimap / snap mode không

=> lưu theo board, sync giữa thiết bị

Ví dụ:

{
  "boardId": "abc",
  "preferences": {
    "background": "dark",
    "focusMode": false,
    "showGrid": true
  }
}
c) Device/session preferences (không nên sync)

Đây là thứ mỗi máy tự giữ:

vị trí camera hiện tại
tool đang chọn
panel nào đang mở
trạng thái hover/selection tạm thời
viewport size dependent state

=> chỉ local state / localStorage

Nếu không tách 3 lớp state này, app sẽ tiếp tục bị lỗi “máy A đổi cái này làm máy B bị ảnh hưởng sai”.

3) Lời khuyên cụ thể cho các bug bạn đang gặp
A. Menu bị header che / lệch điểm chạm
Gốc vấn đề

Canvas không được chiếm trọn viewport thực sự, hoặc có header overlay nằm ngoài hệ tọa độ của tldraw.

Cách làm đúng
Trang board không dùng header ngoài canvas
Canvas wrapper chiếm full viewport
Toàn bộ nút của board được inject qua components của Tldraw

Tức là:

Dashboard có header riêng → OK
Board page → không có header app-level
B. Đồng bộ “thiết lập theo trang”
Nên lưu theo schema rõ ràng

Trong DB, mỗi board nên có:

{
  "board_id": "board_123",
  "snapshot": {...},
  "preferences": {
    "background": "dark",
    "focus_mode": false,
    "ui_density": "compact"
  },
  "updated_at": "..."
}

Frontend load board:

GET /api/boards/:id
nhận snapshot + preferences
apply snapshot vào editor
apply preferences vào UI/editor
khi đổi background/focus → PATCH preferences riêng, không đụng snapshot
Không nên
nhét preferences vào localStorage rồi kỳ vọng các máy khác sync
trộn preferences vào snapshot của tldraw nếu đó không phải dữ liệu hình vẽ
C. Background trắng/đen

Tính năng này nên là board preference, không phải app theme toàn cục.

Phân biệt:

App theme: giao diện dashboard / lockscreen / panel ngoài canvas
Board background: nền riêng của board A/B/C

Ví dụ:

Dashboard vẫn dark
Board A nền trắng
Board B nền đen

Cách này linh hoạt hơn rất nhiều.

D. Asset upload / paste ảnh

Bạn đã dính đúng kiểu lỗi “Tldraw API đổi signature”.
Để tránh lặp lại, phần asset nên tách riêng thành một module có contract rõ:

registerBoardAssetHandlers(editor, {
  uploadImage: async (file) => url,
  uploadVideo: async (file) => url
})

Bên trong module này:

validate mime
upload Cloudinary
lấy dimensions
return TLAsset đúng schema

Không để logic upload nằm lẫn trong component render.

4) Refactor roadmap mình khuyên làm ngay
Ưu tiên 1 — ổn định kiến trúc canvas
BoardPage full-screen
bỏ header ngoài board page
canvas full viewport
mọi control board đưa vào Tldraw components
Tách InfiniCanvas.jsx
thành:
InfiniCanvas.jsx
useBoardSync.js
useBoardAssets.js
useBoardPreferences.js
tldrawUiOverrides.jsx
Tách state
document sync
board preferences sync
local session state
Ưu tiên 2 — sửa UX dashboard
card board có rename / menu / preview
grid container rõ ràng hơn
metadata rõ hơn
trạng thái “last opened”, “updated x phút trước”
Ưu tiên 3 — chuẩn hóa design system trắng/đen

Tạo 1 file token UI duy nhất:

export const ui = {
  bg: "#000000",
  surface: "#111111",
  surface2: "#1a1a1a",
  text: "#ffffff",
  muted: "#a1a1a1",
  border: "#2a2a2a",
}

Dùng cho:

dashboard
lockscreen
custom panels
buttons
badges
menus

Tldraw palette vẽ thì để riêng, không trộn vào UI token.

5) Kết luận ngắn gọn: mình khuyên bạn đi theo hướng nào
Về giao diện

Nếu mục tiêu là “minimal, chuyên nghiệp, giống app thật chứ không phải demo tldraw bọc ngoài”, thì hướng đúng là:

Dashboard = app shell tối giản
Board editor = full-screen canvas
Toàn bộ control của board nằm trong UI của Tldraw, không overlay header ngoài
UI app chỉ dùng đen / trắng / xám rất ít cấp độ
Board background là setting riêng theo board
Về code

Nếu muốn InfiniNote bền và đỡ “vá bug dây chuyền”, mình khuyên chốt kiến trúc này:

pages/ — dashboard / board / lock
components/ — UI app shell
canvas/ — integration với tldraw
hooks/ — sync, assets, prefs
services/ — api/ws/cloudinary
store/ — app-level state rất mỏng

bộ khung tái cấu trúc cho InfiniNote
Ok. Bước tiếp theo mình đề xuất là mình **vẽ luôn bộ khung tái cấu trúc cho InfiniNote** để bạn có thể cắm thẳng vào code hiện tại.

Mình sẽ làm cho bạn theo **4 phần rất thực dụng**:

# 1) Cấu trúc thư mục mới cho toàn bộ app

Bao gồm tách rõ:

* `pages/`
* `components/`
* `canvas/`
* `hooks/`
* `services/`
* `store/`
* `lib/`

# 2) Luồng state chuẩn cho InfiniNote

Mình sẽ chia rõ 3 lớp state:

* **document state**: shapes / snapshot / assets
* **board preferences**: background, focus mode, grid...
* **session state**: tool đang chọn, panel đang mở, zoom tạm thời...

# 3) Schema dữ liệu board để sync đa thiết bị

Mình sẽ đề xuất luôn schema cho:

* `boards`
* `board_snapshots`
* `board_preferences`
* `presence / realtime sync`
* cách lưu background theo từng board

# 4) Checklist refactor theo 3 giai đoạn

## Giai đoạn 1 — ổn định editor

* bỏ header đè canvas
* full-screen board page
* tách `InfiniCanvas`
* gom asset handler

## Giai đoạn 2 — đồng bộ dữ liệu sạch

* sync board snapshot
* sync board preferences
* tách local session state

## Giai đoạn 3 — polish UI/UX

* dashboard đẹp hơn
* board card có rename/menu
* toolbar gọn hơn
* focus mode + save status chuẩn hơn

---

Nếu bạn muốn, mình làm **ngay bây giờ** dưới dạng **spec hoàn chỉnh cho codebase hiện tại** với format như này:

# INFNINOTE REFACTOR SPEC

* **A. Folder tree đầy đủ**
* **B. Vai trò từng file**
* **C. Mẫu code khung cho từng file**
* **D. Schema MongoDB / JSON**
* **E. Luồng sync WebSocket**
* **F. Checklist refactor theo thứ tự làm**

Chỉ cần nhắn:
**“viết InfiniNote refactor spec”**

Mình sẽ viết thẳng bản đầy đủ cho bạn.

Dưới đây là **InfiniNote Refactor Spec** theo hướng **có thể áp dụng thẳng vào codebase hiện tại** của bạn: mục tiêu là **ổn định editor**, **đồng bộ đa thiết bị đúng bản chất**, và **giảm bug dây chuyền do UI Tldraw bị trộn với app shell**.

---

# INFNINOTE REFACTOR SPEC

## Mục tiêu kiến trúc

1. **Board editor full-screen, sạch lớp UI**
   Không để header/app shell đè lên canvas của Tldraw.
2. **Tách 3 loại state rõ ràng**

   * **Document state**: dữ liệu bảng thật sự (shapes, assets, pages…)
   * **Board preferences**: nền board, focus mode, grid, UI density…
   * **Session state**: tool đang chọn, panel đang mở, zoom tạm…
3. **Tách “app shell” khỏi “canvas integration”**

   * Dashboard, lock screen, routing, board list… là app shell
   * Editor là 1 khối riêng, được mount vào `BoardPage`
4. **Tách persistence / realtime khỏi UI**

   * API + WebSocket + save/load snapshot không nằm trong component render
5. **Cho phép mở rộng**

   * Sau này thêm share board, comments, templates, export, AI assist… mà không đập lại nền.

---

# A. CẤU TRÚC THƯ MỤC ĐỀ XUẤT

```txt
src/
├─ app/
│  ├─ App.jsx
│  ├─ routes.jsx
│  └─ providers/
│     ├─ QueryProvider.jsx
│     ├─ ThemeProvider.jsx
│     └─ ToastProvider.jsx
│
├─ pages/
│  ├─ LockPage.jsx
│  ├─ DashboardPage.jsx
│  └─ BoardPage.jsx
│
├─ components/
│  ├─ app-shell/
│  │  ├─ AppSidebar.jsx
│  │  ├─ AppHeader.jsx
│  │  ├─ StatusBadge.jsx
│  │  └─ EmptyState.jsx
│  │
│  ├─ boards/
│  │  ├─ BoardCard.jsx
│  │  ├─ BoardGrid.jsx
│  │  ├─ CreateBoardButton.jsx
│  │  ├─ RenameBoardDialog.jsx
│  │  └─ BoardCardMenu.jsx
│  │
│  ├─ auth/
│  │  ├─ LockScreen.jsx
│  │  ├─ PasscodeInput.jsx
│  │  └─ UnlockButton.jsx
│  │
│  └─ ui/
│     ├─ Button.jsx
│     ├─ IconButton.jsx
│     ├─ Modal.jsx
│     ├─ Dropdown.jsx
│     ├─ Tooltip.jsx
│     ├─ Input.jsx
│     ├─ Switch.jsx
│     ├─ Badge.jsx
│     └─ Spinner.jsx
│
├─ canvas/
│  ├─ InfiniCanvas.jsx
│  ├─ TldrawHost.jsx
│  ├─ config/
│  │  ├─ tldrawComponents.js
│  │  ├─ tldrawOverrides.js
│  │  ├─ tldrawTools.js
│  │  ├─ tldrawShortcuts.js
│  │  └─ canvasTheme.js
│  │
│  ├─ hooks/
│  │  ├─ useBoardDocument.js
│  │  ├─ useBoardPreferences.js
│  │  ├─ useBoardSession.js
│  │  ├─ useBoardAssets.js
│  │  ├─ useBoardAutosave.js
│  │  ├─ useBoardRealtime.js
│  │  ├─ useBoardConnectionStatus.js
│  │  ├─ useBoardSaveStatus.js
│  │  └─ useFocusMode.js
│  │
│  ├─ ui/
│  │  ├─ CanvasTopRightBar.jsx
│  │  ├─ SaveStatusChip.jsx
│  │  ├─ ConnectionStatusChip.jsx
│  │  ├─ BoardAppearanceMenu.jsx
│  │  ├─ FocusModeToggle.jsx
│  │  ├─ ExitFocusButton.jsx
│  │  └─ CanvasLoadingOverlay.jsx
│  │
│  ├─ assets/
│  │  ├─ registerAssetHandlers.js
│  │  ├─ imageUpload.js
│  │  ├─ videoUpload.js
│  │  └─ assetSchema.js
│  │
│  └─ utils/
│     ├─ editorSnapshot.js
│     ├─ editorDiff.js
│     ├─ editorMigration.js
│     └─ boardPreferencesMapper.js
│
├─ services/
│  ├─ api/
│  │  ├─ httpClient.js
│  │  ├─ boardsApi.js
│  │  ├─ authApi.js
│  │  └─ assetsApi.js
│  │
│  ├─ realtime/
│  │  ├─ boardSocket.js
│  │  ├─ boardPresence.js
│  │  └─ reconnectPolicy.js
│  │
│  └─ storage/
│     ├─ localSessionStorage.js
│     ├─ passcodeStorage.js
│     └─ boardCache.js
│
├─ store/
│  ├─ appStore.js
│  ├─ authStore.js
│  └─ dashboardStore.js
│
├─ lib/
│  ├─ constants.js
│  ├─ time.js
│  ├─ id.js
│  ├─ logger.js
│  ├─ guards.js
│  └─ errors.js
│
├─ styles/
│  ├─ globals.css
│  ├─ tokens.css
│  └─ tldraw-overrides.css
│
└─ types/
   ├─ board.js
   ├─ preferences.js
   ├─ assets.js
   └─ socket.js
```

---

# B. VAI TRÒ CỦA TỪNG KHỐI

---

# 1) `pages/` — chỉ lo route-level composition

## `LockPage.jsx`

* render lock screen
* kiểm tra đã unlock chưa
* điều hướng sang dashboard nếu passcode đúng

## `DashboardPage.jsx`

* lấy danh sách boards
* render grid card
* action tạo / đổi tên / xóa / mở board
* **không chứa logic editor**

## `BoardPage.jsx`

* nhận `boardId` từ route
* load metadata board
* mount `<InfiniCanvas boardId={...} />`
* **không render header overlay lên canvas**

### Nguyên tắc cho `BoardPage`

```jsx
export default function BoardPage() {
  const { boardId } = useParams()

  return (
    <main className="board-page">
      <InfiniCanvas boardId={boardId} />
    </main>
  )
}
```

> `board-page` phải full viewport, không có thanh app-level đè lên trên Tldraw.

---

# 2) `components/` — UI app shell, không đụng Tldraw internals

## Ví dụ:

* `BoardCard`: card ở dashboard
* `RenameBoardDialog`: modal đổi tên board
* `LockScreen`: form nhập passcode
* `AppHeader`: chỉ dùng ở dashboard/lock, **không dùng trong board editor**

---

# 3) `canvas/` — nơi duy nhất được phép “nói chuyện sâu” với Tldraw

Đây là trái tim mới của InfiniNote.

## `InfiniCanvas.jsx`

Là **composition root** của editor. Nó không nên chứa logic lẫn lộn; chỉ:

* load board document
* load board preferences
* mount Tldraw host
* nối các hook sync / asset / autosave / realtime / focus mode

### Skeleton

```jsx
export default function InfiniCanvas({ boardId }) {
  const documentState = useBoardDocument(boardId)
  const preferences = useBoardPreferences(boardId)
  const session = useBoardSession(boardId)

  if (documentState.isLoading || preferences.isLoading) {
    return <CanvasLoadingOverlay />
  }

  return (
    <TldrawHost
      boardId={boardId}
      documentState={documentState}
      preferences={preferences}
      session={session}
    />
  )
}
```

---

# 4) `services/` — toàn bộ IO: API / socket / local storage

Tất cả call fetch / ws / upload file phải dồn vào đây.

---

# C. LUỒNG STATE CHUẨN CHO INFNINOTE

Đây là phần quan trọng nhất.
InfiniNote phải có **3 lớp state tách rời**:

---

# 1) DOCUMENT STATE (dữ liệu board thật)

Đây là dữ liệu cần sync giữa thiết bị.

## Bao gồm

* shapes
* bindings
* assets
* pages
* camera snapshot nếu bạn muốn “board opens where last editor left it” (thường không nên)
* text / arrow / notes / images

## Không bao gồm

* panel đang mở
* user đang cầm tool gì
* popup màu đang bật
* focus mode local tạm thời nếu bạn không muốn sync

## Nguồn dữ liệu

* load từ server khi mở board
* nhận patch qua WebSocket
* autosave snapshot/delta

---

# 2) BOARD PREFERENCES (setting theo từng board)

Đây là thứ bạn vừa cần để sync giữa nhiều máy.

## Bao gồm

* `background`: `"dark" | "light"`
* `focusModeDefault`: `boolean`
* `showGrid`: `boolean`
* `uiDensity`: `"compact" | "comfortable"`
* `snapMode`: `boolean`
* `showToolbarLabels`: `boolean` (nếu muốn)
* `boardAccent` (nếu sau này cho custom màu board)

## Đặc điểm

* sync giữa máy A và B
* không phải dữ liệu hình vẽ
* lưu riêng với snapshot

---

# 3) SESSION STATE (theo phiên / theo máy)

Đây là state tạm, không sync.

## Bao gồm

* tool đang chọn
* popup màu đang mở
* zoom hiện tại
* camera hiện tại
* panel trái/phải đang mở
* object đang hover
* selection tạm
* toast UI

## Lưu ở đâu

* React state
* Zustand local store
* localStorage nếu muốn nhớ theo máy

---

# D. DATA MODEL / SCHEMA ĐỀ XUẤT

Bạn có thể dùng MongoDB hoặc bất kỳ DB document-based nào.
Mình đề xuất **tách `boards` và `board_documents`** thay vì nhét tất cả vào 1 document khổng lồ.

---

# 1) `boards`

Chứa metadata board + preferences nhẹ.

```json
{
  "_id": "board_123",
  "title": "Sơ đồ video 1",
  "ownerId": "user_local",
  "createdAt": "2026-06-25T04:00:00.000Z",
  "updatedAt": "2026-06-25T04:10:00.000Z",
  "lastOpenedAt": "2026-06-25T04:20:00.000Z",
  "thumbnailUrl": null,
  "archived": false,
  "preferences": {
    "background": "dark",
    "focusModeDefault": false,
    "showGrid": true,
    "uiDensity": "compact"
  }
}
```

## Vì sao để `preferences` ở đây?

* load dashboard nhanh
* không phải mở cả snapshot nặng mới biết board nền gì
* dễ patch độc lập

---

# 2) `board_documents`

Chứa snapshot editor / document data

```json
{
  "_id": "boarddoc_123",
  "boardId": "board_123",
  "version": 12,
  "snapshot": {
    "document": {},
    "session": {},
    "store": {}
  },
  "updatedAt": "2026-06-25T04:10:00.000Z"
}
```

### Gợi ý thực tế

Nếu snapshot Tldraw quá lớn, có thể tách:

* `snapshotCompressed`
* hoặc lưu JSON gzip/base64 ở backend

---

# 3) `board_presence` (nếu làm realtime presence)

```json
{
  "boardId": "board_123",
  "connections": [
    {
      "clientId": "macbook-phat",
      "userLabel": "Phát-Mac",
      "lastSeenAt": "2026-06-25T04:21:00.000Z"
    }
  ]
}
```

---

# 4) `board_events` (nếu muốn event sourcing / debug sync)

Không bắt buộc, nhưng rất hữu ích khi debug realtime.

```json
{
  "_id": "evt_001",
  "boardId": "board_123",
  "type": "shape.created",
  "payload": {},
  "clientId": "macbook-phat",
  "createdAt": "2026-06-25T04:21:10.000Z"
}
```

---

# E. API CONTRACT ĐỀ XUẤT

---

# 1) Dashboard

## `GET /api/boards`

Trả danh sách board:

```json
[
  {
    "id": "board_123",
    "title": "Bảng mới",
    "updatedAt": "2026-06-25T04:10:00.000Z",
    "lastOpenedAt": "2026-06-25T04:20:00.000Z",
    "thumbnailUrl": null,
    "preferences": {
      "background": "dark"
    }
  }
]
```

## `POST /api/boards`

Tạo board mới.

## `PATCH /api/boards/:id`

Update metadata:

* title
* archived
* thumbnailUrl

## `PATCH /api/boards/:id/preferences`

Update preferences của board:

```json
{
  "background": "light",
  "focusModeDefault": true
}
```

---

# 2) Board document

## `GET /api/boards/:id/document`

Trả snapshot editor:

```json
{
  "boardId": "board_123",
  "version": 12,
  "snapshot": { ... }
}
```

## `PUT /api/boards/:id/document`

Ghi snapshot đầy đủ:

```json
{
  "version": 13,
  "snapshot": { ... }
}
```

## `POST /api/boards/:id/document/delta`

Nếu sau này muốn delta sync:

```json
{
  "baseVersion": 13,
  "operations": [...]
}
```

---

# 3) Assets

## `POST /api/assets/upload`

Upload ảnh/video:

* trả `url`, `width`, `height`, `mimeType`

```json
{
  "url": "https://...",
  "width": 1920,
  "height": 1080,
  "mimeType": "image/png"
}
```

---

# F. BOARD PAGE / CANVAS PAGE QUY TẮC CỨNG

Đây là rule quan trọng để tránh bug “menu bị che / nét vẽ lệch / toolbar đè nhau”.

## BoardPage phải:

1. chiếm full viewport
2. **không có app header overlay**
3. Tldraw là phần tử gốc chiếm toàn màn hình
4. top-right status bar phải là **custom component nằm trong canvas layer**, không phải header ngoài

### CSS gợi ý

```css
html, body, #root {
  width: 100%;
  height: 100%;
  margin: 0;
}

.board-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
```

---

# G. THIẾT KẾ `InfiniCanvas` MỚI

## Mục tiêu

`InfiniCanvas` chỉ là **orchestrator**.
Nó không nên vừa render, vừa fetch, vừa sync socket, vừa upload asset, vừa set background, vừa autosave trong một file 1000 dòng.

---

# 1) `InfiniCanvas.jsx`

```jsx
export default function InfiniCanvas({ boardId }) {
  const boardDocument = useBoardDocument(boardId)
  const boardPreferences = useBoardPreferences(boardId)
  const boardSession = useBoardSession(boardId)

  if (boardDocument.isLoading || boardPreferences.isLoading) {
    return <CanvasLoadingOverlay />
  }

  return (
    <TldrawHost
      boardId={boardId}
      boardDocument={boardDocument}
      boardPreferences={boardPreferences}
      boardSession={boardSession}
    />
  )
}
```

---

# 2) `TldrawHost.jsx`

Nơi mount `Tldraw` thật sự.

### Nhiệm vụ

* inject `components`
* inject `overrides`
* nhận `onMount(editor)`
* apply snapshot
* đăng ký asset handlers
* gắn autosave / realtime / save status / connection status

### Skeleton

```jsx
export default function TldrawHost({
  boardId,
  boardDocument,
  boardPreferences,
  boardSession
}) {
  const handleMount = useCallback((editor) => {
    applyBoardSnapshot(editor, boardDocument.data.snapshot)
    registerBoardAssetHandlers(editor)
  }, [boardDocument.data])

  return (
    <div className="canvas-host">
      <Tldraw
        onMount={handleMount}
        components={tldrawComponents}
        overrides={tldrawOverrides}
      >
        <CanvasTopRightBar boardId={boardId} />
      </Tldraw>
    </div>
  )
}
```

---

# H. CÁC HOOK BẮT BUỘC PHẢI TÁCH

---

# 1) `useBoardDocument(boardId)`

## Trách nhiệm

* fetch snapshot board
* expose `data`, `isLoading`, `error`
* expose `saveSnapshot(snapshot)`
* expose `updateFromRemotePatch(patch)`

### Return shape

```js
{
  data,
  isLoading,
  error,
  saveSnapshot,
  applyRemoteDelta
}
```

---

# 2) `useBoardPreferences(boardId)`

## Trách nhiệm

* fetch preferences của board
* patch background/focus/grid
* optimistic update nhẹ

### Return shape

```js
{
  data: {
    background: 'dark',
    focusModeDefault: false,
    showGrid: true,
    uiDensity: 'compact'
  },
  isLoading,
  updatePreferences: async (patch) => {}
}
```

---

# 3) `useBoardSession(boardId)`

## Trách nhiệm

* local UI state theo máy
* selected tool
* panel visibility
* local zoom snapshot nếu muốn

### Không gọi API

Chỉ local state.

---

# 4) `useBoardAssets(boardId, editor)`

## Trách nhiệm

* upload ảnh/video
* paste asset
* validate file
* trả TLAsset đúng schema cho Tldraw

### Không render UI

---

# 5) `useBoardAutosave(boardId, editor)`

## Trách nhiệm

* lắng nghe thay đổi editor
* debounce 1–3 giây
* save snapshot lên server
* cập nhật save status

---

# 6) `useBoardRealtime(boardId, editor)`

## Trách nhiệm

* connect socket
* gửi local delta
* nhận remote delta
* tránh loop echo

---

# 7) `useFocusMode(editor, boardPreferences)`

## Trách nhiệm

* enter/exit focus mode
* đọc default từ board preferences
* đảm bảo luôn có đường thoát focus mode

---

# I. SAVE STATUS / CONNECTION STATUS — CÁCH LÀM ĐÚNG

Bạn đang có chip `[ĐÃ LƯU] [KẾT NỐI]` ở góc phải — hướng này đúng, nhưng nên biến thành state machine rõ ràng.

---

# 1) Save status enum

```ts
type SaveStatus =
  | 'idle'
  | 'dirty'
  | 'saving'
  | 'saved'
  | 'error'
```

## Logic

* user chỉnh sửa → `dirty`
* debounce save bắt đầu → `saving`
* save ok → `saved`
* save fail → `error`

---

# 2) Connection status enum

```ts
type ConnectionStatus =
  | 'offline'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'
```

---

# 3) Top-right bar nên gồm

* SaveStatusChip
* ConnectionStatusChip
* Appearance menu
* Focus toggle / Exit focus
* More menu

### Không nên

* nhét màu vẽ, status save, status socket, background switch lẫn lộn vào một popup.

---

# J. BACKGROUND / THEME: TÁCH 2 HỆ KHÁC NHAU

Đây là điểm rất quan trọng để app đỡ loạn.

---

# 1) App theme

Áp dụng cho:

* lock screen
* dashboard
* modal app shell
* board list

Ví dụ: dark cố định.

---

# 2) Board background

Áp dụng cho canvas của từng board:

* board A nền đen
* board B nền trắng

## Nên lưu ở `boards.preferences.background`

---

# K. THIẾT KẾ DASHBOARD MỚI

## Mục tiêu

* không gian làm việc nhìn “app thật”
* card board dễ phân biệt
* dễ mở rộng rename / duplicate / delete

---

# 1) Card board nên có

* title
* last opened / updated
* thumbnail mini (nếu có)
* menu 3 chấm

## Ví dụ layout card

* dòng 1: tên board
* dòng 2: “Cập nhật 5 phút trước”
* góc phải: menu

---

# 2) Grid dashboard

* `max-width` cố định
* responsive 1 / 2 / 3 / 4 cột
* spacing dọc/ngang thống nhất

---

# 3) Nút “Tạo bảng mới”

* nên sticky ở vùng header dashboard
* có loading state nếu tạo board qua API

---

# L. LOCK SCREEN — SPEC NHỎ NHƯNG NÊN CHUẨN

## Cần có

* input passcode rõ ràng
* nút mở khóa có label
* trạng thái loading / lỗi
* nếu passcode sai: feedback ngay dưới input

## Không nên

* nút trắng trống label
* input quá chìm vào nền

---

# M. THIẾT KẾ FILE CỤ THỂ — MẪU KHỞI TẠO

---

# `services/api/boardsApi.js`

```js
import { http } from './httpClient'

export async function getBoards() {
  return http.get('/api/boards')
}

export async function createBoard(payload = {}) {
  return http.post('/api/boards', payload)
}

export async function updateBoard(boardId, payload) {
  return http.patch(`/api/boards/${boardId}`, payload)
}

export async function getBoardDocument(boardId) {
  return http.get(`/api/boards/${boardId}/document`)
}

export async function saveBoardDocument(boardId, payload) {
  return http.put(`/api/boards/${boardId}/document`, payload)
}

export async function updateBoardPreferences(boardId, payload) {
  return http.patch(`/api/boards/${boardId}/preferences`, payload)
}
```

---

# `canvas/hooks/useBoardPreferences.js`

```js
import { useEffect, useState, useCallback } from 'react'
import { getBoard, updateBoardPreferences } from '../../services/api/boardsApi'

const DEFAULT_PREFS = {
  background: 'dark',
  focusModeDefault: false,
  showGrid: true,
  uiDensity: 'compact'
}

export function useBoardPreferences(boardId) {
  const [data, setData] = useState(DEFAULT_PREFS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      setIsLoading(true)
      try {
        const board = await getBoard(boardId)
        if (!active) return
        setData({ ...DEFAULT_PREFS, ...(board.preferences || {}) })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [boardId])

  const updatePreferences = useCallback(async (patch) => {
    setData(prev => ({ ...prev, ...patch }))
    await updateBoardPreferences(boardId, patch)
  }, [boardId])

  return { data, isLoading, updatePreferences }
}
```

> Lưu ý: API trên cần có `getBoard(boardId)` hoặc sửa thành endpoint riêng. Nếu muốn, có thể lấy board metadata ngay từ `BoardPage` rồi truyền xuống.

---

# `canvas/assets/registerAssetHandlers.js`

```js
import { uploadImageAsset, uploadVideoAsset } from './imageUpload'

export function registerBoardAssetHandlers(editor, { boardId }) {
  editor.registerExternalAssetHandler('file', async ({ file }) => {
    if (file.type.startsWith('image/')) {
      return uploadImageAsset(file, { boardId })
    }

    if (file.type.startsWith('video/')) {
      return uploadVideoAsset(file, { boardId })
    }

    throw new Error('Unsupported asset type')
  })
}
```

> Tên API handler thực tế có thể cần chỉnh theo phiên bản Tldraw bạn đang dùng. Ý chính ở đây là **gom asset logic vào một module riêng**, không nhét vào component render.

---

# N. LỘ TRÌNH REFACTOR 3 GIAI ĐOẠN

---

# GIAI ĐOẠN 1 — ỔN ĐỊNH EDITOR (bắt buộc làm trước)

## Mục tiêu

Chấm dứt các bug kiểu:

* header che menu
* toolbar chồng nhau
* nét vẽ lệch vị trí
* focus mode khó thoát
* panel popup trôi nổi

## Việc phải làm

### 1. Tạo `BoardPage` full-screen

* bỏ header app-level khỏi trang board
* chỉ render `InfiniCanvas`

### 2. Tách `InfiniCanvas` khỏi file editor cũ

* chỉ còn orchestration
* mount `TldrawHost`

### 3. Tạo `CanvasTopRightBar`

* save status
* connection status
* appearance menu
* focus mode

### 4. Tách asset handler ra module riêng

* upload ảnh/video
* paste ảnh

### 5. Chuẩn hóa CSS canvas

* `100vw x 100vh`
* không margin/padding lạ
* không wrapper overlay làm lệch pointer

---

# GIAI ĐOẠN 2 — DỮ LIỆU VÀ ĐỒNG BỘ SẠCH

## Mục tiêu

Sync ổn định giữa thiết bị, không lẫn state.

## Việc phải làm

### 1. Tách API:

* `GET /boards/:id`
* `GET /boards/:id/document`
* `PATCH /boards/:id/preferences`
* `PUT /boards/:id/document`

### 2. Tạo `useBoardDocument`

* load snapshot
* save snapshot
* expose save state

### 3. Tạo `useBoardPreferences`

* sync background/focus/grid

### 4. Tạo `useBoardSession`

* local-only state

### 5. Nếu có realtime:

* `useBoardRealtime`
* `boardSocket.js`
* connection status rõ ràng

---

# GIAI ĐOẠN 3 — POLISH UI/UX

## Mục tiêu

Biến app từ “chạy được” thành “dùng được lâu dài”.

## Việc phải làm

### Dashboard

* card đẹp hơn
* rename / delete / duplicate
* metadata rõ
* preview thumbnail

### Lock screen

* CTA rõ
* error/loading state đẹp hơn

### Canvas

* utility bar gọn hơn
* appearance menu rõ ràng
* focus mode có badge + exit button
* keyboard shortcut help

---

# O. CHECKLIST TRIỂN KHAI THỰC TẾ CHO CODEBASE HIỆN TẠI

## Ngày 1 — dọn kiến trúc

* [ ] tạo `pages/BoardPage.jsx`
* [ ] chuyển route board sang `BoardPage`
* [ ] bỏ header đè canvas
* [ ] tạo `canvas/InfiniCanvas.jsx`
* [ ] tạo `canvas/TldrawHost.jsx`

## Ngày 2 — tách data hooks

* [ ] tạo `useBoardDocument`
* [ ] tạo `useBoardPreferences`
* [ ] tạo `useBoardSession`
* [ ] di chuyển logic save/load ra hooks

## Ngày 3 — asset + status

* [ ] tạo `registerAssetHandlers.js`
* [ ] tạo `CanvasTopRightBar`
* [ ] tạo `SaveStatusChip`
* [ ] tạo `ConnectionStatusChip`

## Ngày 4 — dashboard polish

* [ ] refactor `BoardCard`
* [ ] thêm rename dialog
* [ ] thêm menu 3 chấm
* [ ] chuẩn hóa grid dashboard

## Ngày 5 — cleanup

* [ ] xóa logic editor cũ bị trùng
* [ ] gom constants / theme / helpers
* [ ] test 2 máy cùng 1 board
* [ ] test reload / reconnect / offline / asset paste

---

# P. KHUYẾN NGHỊ KỸ THUẬT THẲNG CHO INFNINOTE HIỆN TẠI

## 1) Đừng để “board background” phụ thuộc app theme

Nó phải là `board.preferences.background`.

## 2) Đừng để save status và socket status sống trong UI component đơn lẻ

Phải có hook/state riêng:

* `useBoardSaveStatus`
* `useBoardConnectionStatus`

## 3) Đừng nhét mọi thứ vào file editor chính

Nếu file editor hiện tại > 500–700 dòng, gần như chắc chắn cần tách.

## 4) Đừng sync session state giữa máy

Nếu sync tool đang chọn, popup đang mở, camera tạm… bạn sẽ tự tạo bug khó chịu.

## 5) Đừng overlay header app-level lên Tldraw

Đây là bug gốc của rất nhiều lỗi bạn đang gặp.

---

# Q. KẾT LUẬN — “bản chốt” nên đi theo

## Kiến trúc chuẩn cho InfiniNote:

* **LockPage** → unlock
* **DashboardPage** → quản lý boards
* **BoardPage** → chỉ mount editor full-screen
* **InfiniCanvas** → orchestrator
* **TldrawHost** → mount editor + custom Tldraw UI
* **useBoardDocument / useBoardPreferences / useBoardSession** → tách 3 lớp state
* **boardsApi / boardSocket / assetHandlers** → tách IO khỏi render

---

Nếu bạn muốn, bước tiếp theo mình có thể làm **thẳng bản áp dụng vào code** cho bạn, theo kiểu:

# “InfiniNote Refactor Patch v1”

Mình sẽ viết luôn:

1. **folder tree khớp với project hiện tại**
2. **code khung cho `BoardPage.jsx`, `InfiniCanvas.jsx`, `TldrawHost.jsx`**
3. **`useBoardPreferences.js` + `boardsApi.js`**
4. **schema MongoDB hoàn chỉnh**
5. **checklist file nào giữ, file nào xóa, file nào tách**

Nếu đi tiếp theo hướng đó, chỉ cần nhắn:
**“Viết Refactor Patch v1 cho InfiniNote”**

Mình sẽ viết theo kiểu **copy-paste vào project** luôn.

Được. Mình sẽ **soạn lại giao diện này thành một bản thiết kế bằng chữ** để bạn có thể dùng làm **UI spec / prompt code / checklist refactor**.

Mình sẽ bám theo đúng tinh thần của ảnh ref:

* **canvas trắng, sạch**
* **toolbar trái dọc**
* **top bar gọn**
* **cụm panel floating ở phía trên**
* **status + nút quay lại ở góc phải**
* cảm giác **minimal / pro / ít nhiễu thị giác**

---

# InfiniNote – UI Design Spec theo ref

---

# 1) Tinh thần giao diện tổng thể

## Mục tiêu cảm giác

Giao diện phải cho cảm giác:

* **sạch**
* **tập trung vào vùng vẽ**
* **ít chi tiết thừa**
* **công cụ nổi trên canvas như một lớp điều khiển**
* **nhìn giống một whiteboard editor chuyên nghiệp**, không giống dashboard web ghép tạm lên Tldraw

## Từ khóa phong cách

* **Floating UI**
* **Dark control bar + light canvas**
* **Rounded medium**
* **Compact spacing**
* **High contrast but soft**
* **Editor-first layout**

---

# 2) Bố cục tổng thể của màn board

## Cấu trúc 5 vùng chính

Giao diện board chia thành 5 vùng:

### A. Vùng canvas chính

* chiếm gần như toàn bộ màn hình
* nền trắng hoặc nền theo board theme
* là vùng quan trọng nhất, phải sạch và thoáng

### B. Thanh công cụ dọc bên trái

* nằm sát mép trái
* dạng cột đứng
* chứa tool vẽ chính

### C. Thanh điều khiển góc trên trái

* chứa menu, tên page, undo/redo, duplicate/delete, menu mở rộng
* là cụm điều hướng/chỉnh sửa cấp board/page

### D. Cụm bảng điều khiển nổi phía trên

* là các popup/panel xuất hiện khi chọn object hoặc tool
* ví dụ: màu, độ dày nét, style, căn chỉnh, bo góc, kích thước stroke
* nằm ngang phía trên canvas, không che trung tâm quá nhiều

### E. Cụm trạng thái góc trên phải

* hiển thị:

  * trạng thái lưu
  * trạng thái kết nối
  * nút quay lại dashboard
* đây là khu “hệ thống”, không trộn với công cụ vẽ

---

# 3) Layout chi tiết từng khu vực

---

# 3.1. Canvas Area – vùng trung tâm

## Vai trò

Là không gian làm việc chính, mọi thứ còn lại chỉ là lớp điều khiển nổi bên trên.

## Thiết kế

* nền mặc định: **trắng #F7F7F5 hoặc trắng tinh #FFFFFF**
* không có viền khung lớn bao canvas
* không có card container ôm toàn bộ canvas
* canvas phải “thở”, chiếm full-screen

## Quy tắc

* top-level board page phải là **full viewport**
* canvas phải được render trực tiếp bên dưới các floating bar
* không để app header ngoài editor đè lên

## Khoảng trống

* chừa khoảng trái cho toolbar
* chừa khoảng trên cho top controls
* nhưng vẫn phải giữ cảm giác full-screen

---

# 3.2. Left Toolbar – thanh công cụ dọc bên trái

## Vị trí

* neo cố định bên trái
* cách mép trên khoảng 50–70px
* cách mép trái khoảng 12–16px

## Hình dạng

* một thanh dọc bo góc lớn
* nền tối
* chia thành 2 khối:

  1. **khối tool chính**
  2. **khối zoom / navigation phía dưới**

## Kích thước gợi ý

* rộng khoảng **56–64px**
* icon button vuông **40–44px**
* khoảng cách giữa icon: **6–8px**
* bo góc thanh: **18–22px**

## Màu

* nền toolbar: **#17181C**
* border rất nhẹ: **rgba(255,255,255,0.06)**
* icon thường: **#CFCFD4**
* icon active: nền xanh hoặc tím nhạt + icon trắng

## Danh sách tool nên có theo thứ tự

### Khối 1 – công cụ vẽ

1. **Select / Move**
2. **Hand / Pan**
3. **Pen / Draw**
4. **Arrow**
5. **Line**
6. **Text**
7. **Sticky note / Note**
8. **Image / Media**
9. **Rectangle**
10. **More tools** hoặc Shape picker

> Nếu muốn tối giản như ref, chỉ hiển thị 7–8 tool phổ biến trước, phần còn lại cho vào “More”.

### Khối 2 – điều hướng dưới cùng

* zoom percentage
* zoom in
* zoom out
* fit to screen / center canvas

## Trạng thái active

Tool đang chọn phải:

* có nền màu nổi rõ
* icon sáng hơn
* có cảm giác “được ghim”

Ví dụ:

* nền active: **#3B82F6** hoặc **#4F46E5**
* icon active: trắng

---

# 3.3. Top-left Control Bar – cụm điều khiển trên trái

Đây là phần trong ref mà bạn đang chỉ mũi tên vào.

## Mục tiêu

Gộp các thao tác cấp page/board vào một thanh ngang gọn, không chiếm nhiều chiều cao.

## Vị trí

* nằm góc trên trái
* cách mép trên 12–16px
* nằm bên phải toolbar trái, không đè lên toolbar

## Cấu trúc thanh

Thanh này nên là **1 khối dark floating bar** gồm 3 phần:

### Phần A – menu chính

* icon hamburger/menu
* click mở menu:

  * Edit
  * View
  * Export
  * Upload media
  * Preferences
  * Help

### Phần B – tên page / dropdown page

* text: `Page 1`
* có icon dropdown
* click để:

  * đổi tên page
  * thêm page
  * duplicate page
  * xóa page
  * chuyển page

### Phần C – action nhanh

* undo
* redo
* delete
* duplicate
* more

## Hình thức

* background: **#17181C**
* height: **44–48px**
* border-radius: **14–16px**
* padding ngang: **10–12px**
* icon button nhỏ gọn, đồng bộ

## Spacing đề xuất

* khoảng cách giữa các nhóm: **10–14px**
* mỗi icon action: 32–36px
* text page name rõ, không quá nhỏ

---

# 3.4. Floating Property Panels – cụm panel nổi phía trên

Đây là phần rất quan trọng để giao diện “ra chất editor”.

## Vai trò

Khi user chọn một object hoặc tool, các bảng điều khiển ngữ cảnh sẽ nổi lên phía trên:

* bảng màu
* stroke width
* opacity
* fill / outline
* dash / line style
* align / distribute
* size preset S/M/L/XL
* shape style (vuông, bo góc, tròn…)

## Cách tổ chức đúng

Thay vì dồn tất cả vào một panel dài, nên chia thành **nhiều cụm floating panel nhỏ**, đặt cạnh nhau theo hàng ngang.

---

## Cụm panel nên có

### Panel 1 – Color panel

Chứa:

* palette màu
* opacity slider
* có thể thêm color picker sau

### Panel 2 – Size / stroke panel

Chứa:

* stroke width slider
* preset `S / M / L / XL`

### Panel 3 – Stroke style / shape style panel

Chứa:

* nét liền / nét đứt / dotted
* góc vuông / bo góc / bo tròn
* fill style nếu có

### Panel 4 – Align / layout panel

Chỉ hiện khi chọn nhiều object hoặc object phù hợp:

* align left / center / right
* align top / middle / bottom
* distribute horizontally / vertically
* duplicate / lock / group

---

# 3.5. Cách panel nổi xuất hiện

## Nguyên tắc hiển thị

### Khi chưa chọn object

* chỉ hiện toolbar chính
* panel style có thể ẩn hoặc hiện tối giản theo tool đang active

### Khi chọn 1 object

* hiện panel style liên quan tới object đó

### Khi chọn nhiều object

* hiện thêm panel align / distribute

### Khi chọn text

* thay panel style bằng panel text:

  * font size
  * weight
  * align
  * color

---

# 4) Cụm status góc trên phải

Đây là phần nên giữ rất gọn và rõ ràng.

## Thành phần

1. **Save status**
2. **Connection status**
3. **Back button**

## Cách sắp xếp

3 phần nằm trên cùng một hàng ngang, neo góc phải.

---

## 4.1. Save status chip

Text ví dụ:

* `Đã lưu`
* `Đang lưu...`
* `Chưa lưu`
* `Lỗi lưu`

### Thiết kế

* dạng chip nhỏ bo tròn
* nền tối trong suốt nhẹ hoặc xanh nhẹ
* icon check nhỏ nếu saved

### Màu

* saved: xanh lá dịu
* saving: vàng/neutral
* error: đỏ nhạt

---

## 4.2. Connection status chip

Text ví dụ:

* `Đã kết nối`
* `Đang kết nối`
* `Mất kết nối`

### Thiết kế

* giống save chip nhưng tách riêng
* có chấm tròn trạng thái bên trái

---

## 4.3. Nút “Quay lại”

Đây là CTA điều hướng rõ ràng.

### Thiết kế

* pill button
* màu tím/xanh tím như ref
* text trắng
* không quá to

### Hành vi

* quay về dashboard
* có thể confirm nếu board đang dirty chưa save

---

# 5) Thiết kế menu thả xuống bên trái giống ref

Trong ảnh ref, menu mở từ góc trên trái đang rất đúng tinh thần app editor.
Menu này nên là **command menu cấp board/page**.

## Danh sách menu đề xuất

### Edit

* Undo
* Redo
* Cut
* Copy
* Paste
* Duplicate
* Delete
* Select all

### View

* Zoom in
* Zoom out
* Fit to screen
* Toggle grid
* Toggle focus mode

### Export

* Export PNG
* Export SVG
* Export PDF
* Copy as image

### Insert

* Upload media
* Insert image
* Insert embed
* Add note
* Add page

### Preferences

* Background: light / dark
* Grid on/off
* Snap on/off
* UI density
* Language

### Help

* Keyboard shortcuts
* Tips
* About

---

# 6) Hệ thống phân cấp thị giác

Để giao diện giống ref và không bị “rối web app”, bạn cần chia rõ cấp độ visual.

## Cấp 1 – Canvas

* sáng nhất / thoáng nhất
* chiếm diện tích lớn nhất

## Cấp 2 – Toolbar & control bars

* nền tối
* nổi lên như lớp điều khiển
* không quá dày

## Cấp 3 – Popover / dropdown

* nền tối hơn một chút
* đổ bóng rõ hơn
* dùng cho hành động ngữ cảnh

## Cấp 4 – status chip

* nhỏ, gọn, ít gây chú ý
* chỉ là feedback hệ thống

---

# 7) Màu sắc đề xuất

## Canvas

* White: `#F7F7F5` hoặc `#FFFFFF`

## Surface tối

* Toolbar / topbar / popup: `#17181C`
* Surface level 2: `#1E2026`

## Text

* text chính trên nền tối: `#F5F5F7`
* text phụ: `#B9BCC6`

## Border

* `rgba(255,255,255,0.06)` hoặc `0.08`

## Accent

* xanh tool active: `#3B82F6`
* tím CTA quay lại: `#7C5CFF`
* xanh lưu thành công: `#10B981`
* xanh kết nối: `#22C55E`

---

# 8) Bo góc – bóng đổ – spacing

## Border radius

* toolbar lớn: `20px`
* top bar: `16px`
* popover/panel: `16px`
* icon button: `12px`
* status chip: `999px`

## Shadow

Dùng shadow mềm, không quá đậm:

* `0 8px 24px rgba(0,0,0,0.22)`

## Spacing

* khoảng cách giữa các floating group: `12px`
* padding trong panel: `12–14px`
* khoảng cách icon: `8px`

---

# 9) Hành vi UI khi người dùng thao tác

---

# 9.1. Khi vừa mở board

Hiển thị:

* toolbar trái
* top-left control bar
* status góc phải
* canvas trắng sạch
* **không mở sẵn quá nhiều panel**

---

# 9.2. Khi chọn shape

Hiển thị thêm:

* panel màu
* panel size/stroke
* panel style
* nếu nhiều shape thì thêm align panel

---

# 9.3. Khi đang vẽ bằng pen / shape

* chỉ giữ các panel liên quan đến công cụ đó
* không bung quá nhiều menu không cần thiết

---

# 9.4. Khi vào focus mode

* ẩn bớt dashboard/navigation UI
* chỉ giữ:

  * toolbar trái
  * panel ngữ cảnh tối thiểu
  * nút thoát focus nhỏ

---

# 10) Spec chữ hoàn chỉnh cho trang board

Dưới đây là bản mô tả có thể dùng như **UI brief cho coder**:

---

# BOARD EDITOR UI SPEC

## Khung tổng thể

Trang board là một màn hình full-screen editor, nền canvas sáng, mọi công cụ được hiển thị dưới dạng floating dark controls nằm phía trên canvas.

## Góc trái

Một thanh công cụ dọc bo góc lớn nằm sát mép trái, chứa các công cụ chính như select, pen, arrow, text, image, rectangle. Phía dưới thanh là cụm zoom và điều hướng canvas.

## Góc trên trái

Một thanh điều khiển ngang bo góc vừa, nền tối, chứa:

* nút mở menu chính
* tên page hiện tại dưới dạng dropdown
* undo / redo
* duplicate / delete
* more actions

## Phía trên canvas

Khi người dùng chọn object, các panel điều khiển ngữ cảnh sẽ xuất hiện thành từng khối nhỏ nằm ngang:

* bảng màu
* chỉnh stroke / size
* kiểu nét / kiểu shape
* căn chỉnh / phân bố

Các panel này phải là dark floating popovers, không gắn cứng vào layout dashboard.

## Góc trên phải

Một cụm chip trạng thái nằm ngang gồm:

* trạng thái lưu
* trạng thái kết nối
* nút quay lại dashboard

Các chip nhỏ, gọn, ít gây nhiễu, nhưng phải đủ rõ để người dùng biết trạng thái hệ thống.

## Canvas

Canvas là vùng ưu tiên tuyệt đối. Không có header web app truyền thống đè lên. Không có card wrapper bao ngoài. Không gian phải thoáng, sạch, tạo cảm giác đang làm việc trên một bảng vô hạn.

---

# 11) Gợi ý chia component theo đúng giao diện này

Nếu bạn muốn code theo đúng ref, mình khuyên tách thành các component sau:

## Layout chính

* `BoardPage`
* `InfiniCanvas`
* `TldrawHost`

## Floating UI

* `LeftToolbar`
* `TopLeftBoardBar`
* `CanvasStatusBar`
* `FloatingColorPanel`
* `FloatingStrokePanel`
* `FloatingAlignPanel`
* `PageDropdownMenu`
* `BoardMainMenu`

## Status

* `SaveStatusChip`
* `ConnectionStatusChip`
* `BackToDashboardButton`

---

# 12) Lời khuyên quan trọng để giao diện ra đúng “chất ref”

## Nên làm

* để **canvas full-screen**
* dùng **toolbar tối nổi trên nền sáng**
* giữ **số lượng control hiển thị mặc định ít**
* chỉ mở panel khi có ngữ cảnh
* chia control thành **nhiều panel nhỏ** thay vì 1 panel khổng lồ
* tách **status hệ thống** khỏi **công cụ vẽ**

## Không nên làm

* không đặt dashboard header lên board page
* không nhét save status, background toggle, page controls, menu app vào cùng một bar dài hỗn tạp
* không để panel style mở tràn ngang chiếm hết mép trên
* không để quá nhiều icon nhỏ không nhóm logic

---

Nếu bạn muốn, bước tiếp theo mình có thể làm **ngay bản “UI Blueprint hoàn chỉnh”** cho giao diện này theo đúng kiểu dev handoff, gồm 3 phần:

# 1) Sơ đồ bố cục ASCII của toàn bộ màn board

để nhìn là biết từng khối nằm đâu

# 2) Danh sách component + props

ví dụ:

* `LeftToolbar({ activeTool, onToolChange })`
* `TopLeftBoardBar({ pageName, onUndo, onRedo })`
* `FloatingColorPanel({ color, opacity, onChange })`

# 3) Bộ token UI đầy đủ

* spacing
* radius
* shadow
* màu
* z-index
* kích thước toolbar / panel / chip

Nếu muốn, chỉ cần nhắn:
**“Viết UI Blueprint hoàn chỉnh cho InfiniNote theo ref này”**

Mình sẽ viết tiếp thành **bản spec để code giao diện luôn**.
