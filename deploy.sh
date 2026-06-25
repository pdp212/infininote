#!/bin/bash
# Script hỗ trợ commit và deploy nhanh chóng cho InfiniNote

# Màu sắc hiển thị
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Bắt đầu quá trình đưa code lên GitHub để deploy tự động...${NC}"

# Kiểm tra xem có argument (commit message) nào được truyền vào không
if [ -z "$1" ]
then
    echo -e "${YELLOW}Cảnh báo: Bạn chưa nhập thông điệp commit.${NC}"
    read -p "Vui lòng nhập lời nhắn commit (VD: update UI): " COMMIT_MSG
    
    # Nếu vẫn để trống thì dùng message mặc định
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Update InfiniNote codebase"
        echo -e "${YELLOW}Dùng lời nhắn mặc định: '${COMMIT_MSG}'${NC}"
    fi
else
    COMMIT_MSG="$1"
fi

# Chạy các lệnh Git
echo -e "\n${BLUE}1. Đang thêm các file thay đổi (git add .)...${NC}"
git add .

echo -e "\n${BLUE}2. Đang commit (git commit)...${NC}"
git commit -m "$COMMIT_MSG"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Không có thay đổi nào để commit, hoặc có lỗi xảy ra.${NC}"
    exit 1
fi

echo -e "\n${BLUE}3. Đang đẩy lên GitHub (git push)...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Push thành công!${NC}"
    echo -e "${GREEN}👉 Vercel (Frontend) và Render (Backend) sẽ tự động bắt đầu quá trình build & deploy.${NC}"
else
    echo -e "\n${RED}❌ Push thất bại. Hãy kiểm tra lại kết nối mạng hoặc conflict Git.${NC}"
    exit 1
fi
