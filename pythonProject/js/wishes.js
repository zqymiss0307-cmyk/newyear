// 移动端检测函数
function isMobile() {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];
  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  }) || window.innerWidth <= 768;
}

// 原始愿望列表
const ALL_WISHES = [

];

// 根据设备类型提供不同数量的愿望
const WISHES = isMobile() ?
  ALL_WISHES.slice(0, Math.min(ALL_WISHES.length, 20)) : // 移动端限制数量
  ALL_WISHES; // 桌面端使用全部

// 如果需要，也可以提供一个函数来动态获取
function getWishesForDevice() {
  return isMobile() ?
    ALL_WISHES.slice(0, Math.min(ALL_WISHES.length, 20)) :
    ALL_WISHES;
}