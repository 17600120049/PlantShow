/**
 * 流浪植物驿站 - 开源图标库配置说明
 * 
 * 本项目使用开源图标库，主要推荐以下方案：
 */

/* ============================================
 * 方案一：iconfont.cn（推荐，国内稳定）
 * ============================================
 * 
 * 1. 访问 https://www.iconfont.cn/
 * 2. 搜索需要的图标，例如：
 *    - 首页: home
 *    - 收藏: heart
 *    - 用户: user  
 *    - 植物: leaf, plant
 *    - 礼物: gift
 *    - 日历: calendar
 *    - 位置: location, map-pin
 *    - 扫码: scan
 *    - 二维码: qrcode
 *    - 星星: star
 *    - 设置: setting
 *    - 搜索: search
 *    - 时钟: clock
 *    - 箭头: arrow-right, arrow-left
 * 
 * 3. 将图标添加到购物车
 * 4. 点击"下载代码"按钮
 * 5. 解压后将以下文件放入 styles 目录：
 *    - iconfont.ttf
 *    - iconfont.woff
 *    - iconfont.css
 * 
 * 6. 修改 iconfont.css 中的字体路径
 */

/* ============================================
 * 方案二：Bootstrap Icons（备选）
 * ============================================
 * 
 * Bootstrap Icons 是开源的 SVG 图标库
 * 访问: https://icons.getbootstrap.com/
 * 
 * 安装: npm install bootstrap-icons
 * 
 * 在 app.wxss 中引入:
 * @import './node_modules/bootstrap-icons/font/bootstrap-icons.css';
 */

/* ============================================
 * 方案三：Lucide Icons
 * ============================================
 * 
 * Lucide 是一个开源图标库
 * 访问: https://lucide.dev/
 * 
 * 安装: npm install lucide-static
 * 
 * Lucide 主要提供 SVG 图标，需要在 WXML 中直接使用 SVG
 */

/* ============================================
 * 图标使用示例
 * ============================================
 * 
 * <view class="icon-wrapper icon-bg">
 *   <text class="icon-home icon-primary"></text>
 * </view>
 * 
 * <view class="icon-bg icon-bg-light">
 *   <text class="icon-scan icon-white"></text>
 * </view>
 * 
 * <view class="tab-icon">
 *   <text class="icon-home-lg icon-secondary"></text>
 * </view>
 */

/* ============================================
 * 当前使用的图标类名
 * ============================================
 * 
 * 首页相关:
 *   icon-home, icon-home-lg
 * 
 * 收藏相关:
 *   icon-heart, icon-heart-fill, icon-heart-lg
 * 
 * 用户相关:
 *   icon-user, icon-user-lg
 * 
 * 功能图标:
 *   icon-plant, icon-gift, icon-calendar
 *   icon-location, icon-scan, icon-qrcode
 *   icon-star, icon-settings, icon-search
 *   icon-clock, icon-phone
 * 
 * 操作图标:
 *   icon-arrow-right, icon-arrow-left
 *   icon-plus, icon-x, icon-check
 *   icon-share, icon-more
 * 
 * 特殊颜色版本:
 *   icon-white-scan, icon-white-qrcode, icon-white-home
 */
