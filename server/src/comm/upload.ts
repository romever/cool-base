import * as path from 'path';

/**
 * 允许上传的文件扩展名
 * 不包含 html、svg、js 等能在浏览器中执行脚本的类型，避免通过上传文件发起 XSS
 */
export const UPLOAD_EXTENSIONS = [
  // 图片
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.ico',
  // 文档
  '.pdf',
  '.txt',
  '.csv',
  '.md',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  // 音视频
  '.mp3',
  '.wav',
  '.mp4',
  '.mov',
  '.webm',
  // 压缩包
  '.zip',
  '.rar',
  '.7z',
  '.gz',
];

/**
 * 插件安装包的扩展名，只允许在插件安装接口上传
 */
export const PLUGIN_EXTENSIONS = ['.cool'];

/**
 * 文件名的扩展名是否在上传白名单内
 * @param filename 文件名
 */
export function isAllowedUploadExt(filename: string): boolean {
  return UPLOAD_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}
