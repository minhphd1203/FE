# FE Todo List: Report-Refund Violation System

## Overview / Tổng quan

Implementation of fraud report + refund flow on transaction detail page. Buyer can report fraudulent transaction → admin approves → buyer clicks refund button → get money back.

Triển khai luồng báo cáo gian lận + hoàn tiền trên trang chi tiết giao dịch. Buyer có thể báo cáo giao dịch gian lận → admin duyệt → buyer bấm nút hoàn tiền → nhận lại tiền.

---

## Phase 1: Transaction Detail Page Enhancement

### 1.1 Add Report Button to Transaction Detail

- [ ] Locate transaction detail component
- [ ] Add "Report" button in action area
- [ ] Style button (red/warning color)
- [ ] Add click handler → open report modal

**Vietnamese:** Thêm nút "Báo cáo" vào trang chi tiết giao dịch

### 1.2 Create Report Modal/Form

- [ ] Design modal UI:
  - [ ] Report reason dropdown
  - [ ] Description textarea
  - [ ] Submit/Cancel buttons
  - [ ] Success/Error toast messages
- [ ] Populate dropdown with violation reasons from API
- [ ] Pre-select "Fraudulent Listing - Buyer Demands Refund" as option

**Vietnamese:** Tạo modal báo cáo với dropdown lý do + textarea mô tả

### 1.3 Submit Report with TransactionId

- [ ] Call `POST /api/buyer/v1/reports` with:
  ```json
  {
    "reportedBikeId": "bike-id",
    "reportedUserId": "seller-id",
    "reasonId": "refund-reason-id",
    "description": "user input",
    "transactionId": "current-transaction-id" // NEW: Link transaction
  }
  ```
- [ ] Handle success → show "Report submitted, admin will review"
- [ ] Handle error → show error message
- [ ] Close modal

**Vietnamese:** Gửi báo cáo với transactionId để track giao dịch

---

## Phase 2: Report Status Monitoring

### 2.1 Fetch Report Status

- [ ] After report submitted, store `reportId` in local state
- [ ] Poll `GET /api/buyer/v1/reports?status=pending` every 5 seconds
- [ ] OR subscribe to WebSocket (if implemented)
- [ ] Find report by `reportId`

**Vietnamese:** Fetch trạng thái báo cáo mỗi 5 giây

### 2.2 Detect Admin Approval

- [ ] Watch for report status change from `pending` → `resolved`
- [ ] Check if `reason.autoResolveAction === 'refund'`
- [ ] If true → **Transform button** from "Report" to "Request Refund"
- [ ] Enable the new button

**Vietnamese:** Phát hiện admin duyệt và chuyển nút từ "Báo cáo" sang "Hoàn tiền"

### 2.3 Show Approval Status

- [ ] Add info message: "Admin approved your report. You can now request a refund."
- [ ] Show timestamp when approval happened
- [ ] Optional: Show admin name/note

**Vietnamese:** Hiển thị thông báo duyệt và cho phép hoàn tiền

---

## Phase 3: Refund Button Implementation

### 3.1 Refund Button States

```
Initial:        "Report"           (submit report modal)
After submit:   "Pending Approval" (disabled, tooltip: "Admin reviewing")
After approve:  "Request Refund"   (enabled, blue/success color)
After refund:   "Refund Complete"  (disabled, green check)
```

- [ ] Implement button state machine
- [ ] Update styling based on state
- [ ] Show appropriate tooltips/help text

**Vietnamese:** 4 trạng thái nút: Report → Pending → Hoàn tiền → Hoàn tất

### 3.2 Call Refund API

- [ ] On "Request Refund" click:
  ```javascript
  POST /api/payment/v1/refund/:transactionId
  {
    "reason": "Fraudulent listing",
    "reportId": "report-uuid"  // Link back to report
  }
  ```
- [ ] Show loading spinner while processing
- [ ] Handle success → show "Refund processing" toast
- [ ] Handle error:
  - [ ] "Already have refund" → show refund ID
  - [ ] "Transaction not completed" → show error
  - [ ] "Refund provider error" → show retry button

**Vietnamese:** Gọi API hoàn tiền với reportId để link báo cáo

### 3.3 Show Refund Status

- [ ] Poll `GET /api/payment/v1/refund/:refundId/status`
- [ ] Display:
  - [ ] Refund amount
  - [ ] Refund status (pending/completed/failed)
  - [ ] Processed timestamp
  - [ ] Link to original report
- [ ] Auto-refresh when status changes

**Vietnamese:** Hiển thị trạng thái hoàn tiền + amount

---

## Phase 4: Error Handling & Edge Cases

### 4.1 Validation

- [ ] Can only report after transaction completed ✅ (backend enforces)
- [ ] Can only report if delivery not received yet
- [ ] Hide report button if already reported
- [ ] Hide refund button if already refunded

### 4.2 Error Messages

- [ ] "Transaction not completed" → disable report button
- [ ] "Past 24 hours" → show message (backend allows anyway, but warn users)
- [ ] "Already refunded" → show "Refund already processed"
- [ ] "Provider error" → show retry option

**Vietnamese:** Xử lý lỗi & edge cases

### 4.3 Loading States

- [ ] Show skeleton/spinner while fetching report status
- [ ] Show spinner during refund API call
- [ ] Show spinner while fetching refund status

**Vietnamese:** Hiển thị loading states

---

## Phase 5: UI/UX Enhancements

### 5.1 Report History

- [ ] Show link: "View all my reports"
- [ ] Links to user's reports list page
- [ ] Display timestamp of current report

**Vietnamese:** Liên kết đến danh sách báo cáo của user

### 5.2 Refund History

- [ ] Show link: "View all my refunds"
- [ ] Links to refund history page
- [ ] Show refund amount + status

**Vietnamese:** Liên kết đến danh sách hoàn tiền

### 5.3 Information Panel

- [ ] Add collapsible info section in transaction detail:
  - [ ] "About Refunds": How refund process works
  - [ ] "Report Status": Current report status if any
  - [ ] "Refund Status": Current refund status if any
  - [ ] "Seller Info": Link to report admin's decision notes

**Vietnamese:** Panel thông tin về quy trình hoàn tiền

### 5.4 Toast Notifications

- [ ] Success: "Report submitted successfully"
- [ ] Success: "Admin has approved your report"
- [ ] Success: "Refund requested! Money will be returned to your original payment method"
- [ ] Error: Show specific error message
- [ ] Info: "Waiting for admin review..."

**Vietnamese:** Toast thông báo cho các sự kiện

---

## Phase 6: Integration & Testing

### 6.1 API Integration

- [ ] ✅ Report submission endpoint working
- [ ] ✅ Report status fetch working
- [ ] ✅ Refund API endpoint working
- [ ] ✅ Refund status fetch working
- [ ] Test with mock data

### 6.2 State Management

- [ ] Use Redux/Zustand to manage:
  - [ ] `currentReport` state
  - [ ] `currentRefund` state
  - [ ] `buttonState` (report/pending/refund/complete)
  - [ ] Polling interval

**Vietnamese:** Quản lý state bằng Redux/Zustand

### 6.3 Testing Scenarios

- [ ] Submit report → see pending state
- [ ] Approve report in admin → see button change to "Request Refund"
- [ ] Click "Request Refund" → see loading
- [ ] Mock refund completion → see success state
- [ ] Test error scenarios:
  - [ ] Already refunded
  - [ ] Transaction not completed
  - [ ] Network error

**Vietnamese:** Test các scenario khác nhau

### 6.4 Component Tests

- [ ] Render transaction with report button
- [ ] Modal opens/closes
- [ ] Form validation works
- [ ] API calls triggered correctly
- [ ] Button state changes work
- [ ] Error handling displays correctly

**Vietnamese:** Unit test các component

---

## Technical Stack

- **State Management:** Redux / Zustand (choose what project uses)
- **API Client:** Axios / Fetch API
- **UI Library:** Material-UI / Ant Design (match project)
- **Polling:** setInterval + cleanup on unmount
- **Error Handling:** Try-catch + error boundaries

---

## Files to Create/Modify

### New Files:

- [ ] `src/components/TransactionDetail/ReportModal.tsx`
- [ ] `src/components/TransactionDetail/RefundStatusPanel.tsx`
- [ ] `src/hooks/useReportStatus.ts` (custom hook for polling)
- [ ] `src/hooks/useRefundStatus.ts` (custom hook for polling)
- [ ] `src/api/refundApi.ts` (refund API calls)
- [ ] `src/__tests__/refundFlow.test.tsx` (integration tests)

### Modify:

- [ ] `src/pages/TransactionDetail.tsx` - Add report button + refund button
- [ ] `src/components/TransactionDetail/index.tsx` - Add modals
- [ ] `src/api/reportApi.ts` - Already exists, use it
- [ ] `src/store/` - Add refund state (if using Redux)

---

## Timeline Estimate

| Phase     | Tasks                       | Days         |
| --------- | --------------------------- | ------------ |
| 1         | Report button + modal       | 1-2 days     |
| 2         | Status monitoring + polling | 1 day        |
| 3         | Refund button + API         | 1-2 days     |
| 4         | Error handling              | 0.5 day      |
| 5         | UI/UX enhancements          | 1 day        |
| 6         | Testing                     | 1-2 days     |
| **Total** |                             | **5-8 days** |

---

## Dependencies / Prerequisites

- ✅ Backend refund API endpoints ready
- ✅ Report API with transactionId support ready
- ✅ Admin dashboard to approve reports ready
- ✅ Database migrations applied (0024_unknown_whizzer)

---

## Notes / Ghi chú

**Vietnamese:**

- Flow cơ bản: Buyer report → Admin duyệt → FE thấy duyệt → hiện nút hoàn tiền → Buyer bấm → hoàn tiền
- Cần fetch report status định kỳ để phát hiện admin duyệt
- ReportId + TransactionId của refund để track audit trail
- Nút có 4 trạng thái: Report / Pending / Hoàn tiền / Hoàn tất
- Error handling cho trường hợp đã hoàn tiền rồi hoặc tidak hợp lệ

**English:**

- Direct flow: Report → Admin approves → Detect change → Show refund button → User clicks → Refund processed
- Must poll report status periodically to detect approval
- Both reportId + transactionId linked in refund for audit trail
- Button has 4 states: Report / Pending / Request Refund / Complete
- Handle edge cases: already refunded, invalid transaction, validation errors
