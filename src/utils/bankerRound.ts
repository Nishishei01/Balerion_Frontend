// ฟังชั่นสำหรับทศนิยมอิงจากแบงค์
export const bankerRound = (num: number) => {
  const n = num * 100;
  const res = parseFloat(n.toFixed(4));
  const floor = Math.floor(res);
  const frac = res - floor;

  if (frac === 0.5) {
    return (floor % 2 === 0 ? floor : floor + 1) / 100;
  }

  return Math.round(res) / 100;
};
