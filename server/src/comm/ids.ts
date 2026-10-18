/**
 * 把 ID 集合统一转成数字数组（框架删除接口的 ids 可以是数组，也可以是 "1,2,3"）
 * @param ids ID 集合
 */
export function parseIds(ids: (number | string)[] | string): number[] {
  return (typeof ids === 'string' ? ids.split(',') : ids).map(Number);
}
