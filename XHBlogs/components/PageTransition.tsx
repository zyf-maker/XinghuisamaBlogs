"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

/**
 * 页面入场：只做位移，不做透明度。
 *
 * 为什么不能淡入：`opacity < 1` 的元素会成为新的 backdrop root，
 * 它内部所有 `backdrop-filter` 只能采样到这一层子树——
 * 也就是说卡片背后什么都没有，「毛玻璃」会退化成一块半透明白板，
 * 入场那一秒整页还会发灰。所以这里只用 y 位移。
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ y: 12 }}
      animate={{ y: 0 }}
      transition={{ ease: "easeOut", duration: 0.45 }}
    >
      {children}
    </motion.div>
  );
}
