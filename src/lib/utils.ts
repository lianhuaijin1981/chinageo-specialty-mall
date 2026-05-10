import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化价格
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price)) {
    return '¥0.00';
  }
  return `¥${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// 转换为slug（支持中文）
export function slugify(str: string): string {
  return str
    .trim()
    .replace(/[\s]+/g, '-')  // 空格替换为连字符
    .replace(/[^\w\-\u4e00-\u9fff\u3400-\u4dbf]+/g, '')  // 保留字母、数字、下划线、连字符、中文
    .replace(/\-\-+/g, '-')  // 多个连字符合并为一个
    .toLowerCase();  // 英文转为小写
}
