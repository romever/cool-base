import * as path from 'path';
import * as fs from 'fs';

/**
 * 项目数据目录：启动目录（server/）下的 data，与 Midway 的 appDir 一致
 * @returns
 */
export const pDataPath = () => {
  const dirPath = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

/**
 * 上传目录
 * @returns
 */
export const pUploadPath = () => {
  const uploadPath = path.join(pDataPath(), 'upload');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

/**
 * 插件目录
 * @returns
 */
export const pPluginPath = () => {
  const pluginPath = path.join(pDataPath(), 'plugin');
  if (!fs.existsSync(pluginPath)) {
    fs.mkdirSync(pluginPath, { recursive: true });
  }
  return pluginPath;
};

/**
 * sqlite 数据库文件
 */
export const pSqlitePath = () => {
  return path.join(pDataPath(), 'cool.sqlite');
};

/**
 * 缓存目录
 * @returns
 */
export const pCachePath = () => {
  return path.join(pDataPath(), 'cache');
};
