import { CoolEvent, Event } from '@cool-midway/core';
import { Inject } from '@midwayjs/core';
import { BaseTranslateService } from '../service/translate';
import { BaseSysMenuSyncService } from '../service/sys/menu_sync';

/**
 * 菜单
 */
@CoolEvent()
export class BaseMenuEvent {
  @Inject()
  baseSysMenuSyncService: BaseSysMenuSyncService;

  @Inject()
  baseTranslateService: BaseTranslateService;

  /**
   * 服务启动后，把各模块 menu.json 同步到数据库
   * 菜单定义有误时直接抛出，让启动失败
   */
  @Event('onServerReady')
  async onServerReady() {
    await this.baseSysMenuSyncService.sync();
    // 菜单翻译依赖同步后的菜单数据
    await this.baseTranslateService.check();
    this.baseTranslateService.loadTranslations();
  }
}
