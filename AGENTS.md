# AGENT.md

# InfiniNote Engineering Guide

> InfiniNote là một ứng dụng ghi chú cá nhân với canvas vô hạn.
>
> Triết lý của dự án:
>
> **Mở cực nhanh.**
> **Ghi chú tức thì.**
> **Canvas vô hạn.**
> **Đồng bộ ổn định.**
> **Không phình tính năng.**

---

# Mission

Mọi thay đổi phải giúp InfiniNote trở nên:

* nhanh hơn
* ổn định hơn
* đơn giản hơn

KHÔNG được làm ứng dụng trở nên phức tạp hơn chỉ để có thêm tính năng.

---

# Core Principles

## 1. Note First

InfiniNote KHÔNG phải:

* Notion
* Obsidian
* ClickUp
* Trello

InfiniNote chỉ giải quyết một việc:

> Mở ra → ghi ngay → đóng lại.

Nếu một tính năng làm chậm quy trình này thì không nên thêm.

---

## 2. Performance First

Ưu tiên:

1. Startup time
2. Render speed
3. Sync latency
4. Memory usage

Không được thêm feature làm chậm boot.

Board phải mở gần như tức thì.

---

## 3. Simplicity First

Ưu tiên:

ít code hơn

ít state hơn

ít dependency hơn

ít abstraction hơn

Nếu có hai cách giải quyết:

* cách A: 500 dòng
* cách B: 100 dòng

thì chọn B nếu vẫn đúng kiến trúc.

---

## 4. One Source of Truth

Không được tồn tại nhiều state mô tả cùng một trạng thái.

Ví dụ:

❌

loadState

isLoading

boardPhase

Cùng tồn tại.

✔

Chỉ giữ:

boardPhase

---

## 5. Backend is Truth

Frontend không được tự giả định dữ liệu.

Rename

Delete

Create

Metadata

đều phải xác nhận từ Backend.

Không cập nhật local rồi hi vọng server sẽ giống.

---

# Product Scope

InfiniNote chỉ bao gồm:

* Infinite Canvas
* Notes
* Text
* Draw
* Images
* Multi-board
* Journal
* Offline cache
* Auto Save
* Real-time Sync
* Mobile Support
* Search

KHÔNG chủ động thêm:

* AI Chat
* LLM
* Plugin System
* Database Query
* Team Workspace
* Kanban
* Wiki
* CRM
* Email
* Calendar
* Whiteboard Multiplayer phức tạp

Đó là phạm vi của sản phẩm khác.

---

# Architecture Rules

Ưu tiên:

Frontend

React

Zustand

tldraw

Backend

FastAPI

MongoDB

WebSocket

Không thêm framework mới nếu không thật sự cần.

---

# State Management

Không tạo state mới nếu có thể tái sử dụng state hiện có.

Ưu tiên:

Server State

↓

Zustand

↓

Component State

↓

Local Variable

Không đảo ngược thứ tự này.

---

# Sync Rules

Realtime Sync là tính năng quan trọng nhất.

Mọi thay đổi liên quan đến Sync phải đảm bảo:

* không mất dữ liệu
* không duplicate
* không loop
* không race condition
* không block UI

Camera

Selection

Current Tool

Temporary UI

không được đồng bộ.

Chỉ đồng bộ dữ liệu của Board.

---

# Dashboard Rules

Dashboard chỉ có nhiệm vụ:

* mở board
* tạo board
* rename
* delete
* journal
* search

Không biến Dashboard thành Workspace Manager.

---

# UI Rules

UI phải:

* tối giản
* ít popup
* ít modal
* ít animation

Mọi pixel đều phải có lý do tồn tại.

---

# Mobile Rules

Trên mobile:

ưu tiên thao tác bằng một tay.

Không hiển thị panel desktop.

Không ép người dùng zoom để bấm.

---

# Performance Budget

Board mở:

< 500ms

Realtime Sync:

< 500ms

Dashboard:

< 300ms

Không merge PR nếu làm chậm hơn đáng kể.

---

# Code Rules

Ưu tiên:

đọc được

đơn giản

ít dependency

ít magic

Không over-engineering.

Không tạo abstraction khi mới chỉ có một implementation.

---

# Logging

Các log phải có prefix rõ ràng:

[BOOT]

[SYNC]

[WS]

[API]

[BOARD]

[ERROR]

Không để console.log() ngẫu nhiên.

---

# Before Every Change

AI phải tự hỏi:

1.

Có làm ứng dụng nhanh hơn không?

2.

Có làm code đơn giản hơn không?

3.

Có phá triết lý Note First không?

4.

Có phát sinh state dư thừa không?

5.

Có thêm dependency không cần thiết không?

Nếu có từ 2 câu trả lời "Có" theo hướng tiêu cực, hãy dừng và đề xuất phương án khác.

---

# Definition of Done

Một tính năng chỉ được coi là hoàn thành khi:

✓ Build thành công

✓ Không phát sinh regression

✓ Desktop hoạt động

✓ Mobile hoạt động

✓ Offline hoạt động

✓ Reconnect hoạt động

✓ Refresh không lỗi

✓ Console không có lỗi nghiêm trọng

✓ Có Manual Verification

Không merge nếu chỉ "chạy được trên máy của AI".

---

# Current Project Status

Version:

v1.0 Beta

Current Goal:

Ổn định hệ thống.

Chỉ nhận:

* Bug Fix
* Performance
* Refactor
* Stability

Không thêm feature mới nếu chưa thật sự cần.

---

# Long-term Vision

InfiniNote là nơi lưu trữ ý tưởng.

AI Assistant sẽ là một dự án độc lập sử dụng InfiniNote làm Knowledge Base.

Không tích hợp AI trực tiếp vào InfiniNote.
