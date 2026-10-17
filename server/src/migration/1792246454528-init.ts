import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1792246454528 implements MigrationInterface {
  name = 'Init1792246454528';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "plugin_info" ("id" SERIAL NOT NULL, "createTime" character varying NOT NULL, "updateTime" character varying NOT NULL, "tenantId" integer, "name" character varying NOT NULL, "description" character varying NOT NULL, "keyName" character varying NOT NULL, "hook" character varying NOT NULL, "readme" text NOT NULL, "version" character varying NOT NULL, "logo" text, "author" character varying NOT NULL, "status" integer NOT NULL DEFAULT \'0\', "content" json NOT NULL, "tsContent" json NOT NULL, "pluginJson" json, "config" json, CONSTRAINT "PK_96b52c53274f167372e50d7ec07" PRIMARY KEY ("id")); COMMENT ON COLUMN "plugin_info"."id" IS \'ID\'; COMMENT ON COLUMN "plugin_info"."createTime" IS \'创建时间\'; COMMENT ON COLUMN "plugin_info"."updateTime" IS \'更新时间\'; COMMENT ON COLUMN "plugin_info"."tenantId" IS \'租户ID\'; COMMENT ON COLUMN "plugin_info"."name" IS \'名称\'; COMMENT ON COLUMN "plugin_info"."description" IS \'简介\'; COMMENT ON COLUMN "plugin_info"."keyName" IS \'Key名\'; COMMENT ON COLUMN "plugin_info"."hook" IS \'Hook\'; COMMENT ON COLUMN "plugin_info"."readme" IS \'描述\'; COMMENT ON COLUMN "plugin_info"."version" IS \'版本\'; COMMENT ON COLUMN "plugin_info"."logo" IS \'Logo(base64)\'; COMMENT ON COLUMN "plugin_info"."author" IS \'作者\'; COMMENT ON COLUMN "plugin_info"."status" IS \'状态 0-禁用 1-启用\'; COMMENT ON COLUMN "plugin_info"."content" IS \'内容\'; COMMENT ON COLUMN "plugin_info"."tsContent" IS \'ts内容\'; COMMENT ON COLUMN "plugin_info"."pluginJson" IS \'插件的plugin.json\'; COMMENT ON COLUMN "plugin_info"."config" IS \'配置\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_071da0804576df95363c24357c" ON "plugin_info" ("createTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_d94d7c2437aca9f1b183979b07" ON "plugin_info" ("updateTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_89a39daf328b50686755795546" ON "plugin_info" ("tenantId") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_95719662507de0fbf70ad1b5ee" ON "plugin_info" ("keyName") '
    );
    await queryRunner.query(
      'CREATE TABLE "space_info" ("id" SERIAL NOT NULL, "createTime" character varying NOT NULL, "updateTime" character varying NOT NULL, "tenantId" integer, "url" character varying NOT NULL, "type" character varying NOT NULL, "classifyId" integer, "fileId" character varying NOT NULL, "name" character varying NOT NULL, "size" integer NOT NULL, "version" integer NOT NULL DEFAULT \'1\', "key" character varying NOT NULL, CONSTRAINT "PK_e4a1552d98346f0260cd871beb7" PRIMARY KEY ("id")); COMMENT ON COLUMN "space_info"."id" IS \'ID\'; COMMENT ON COLUMN "space_info"."createTime" IS \'创建时间\'; COMMENT ON COLUMN "space_info"."updateTime" IS \'更新时间\'; COMMENT ON COLUMN "space_info"."tenantId" IS \'租户ID\'; COMMENT ON COLUMN "space_info"."url" IS \'地址\'; COMMENT ON COLUMN "space_info"."type" IS \'类型\'; COMMENT ON COLUMN "space_info"."classifyId" IS \'分类ID\'; COMMENT ON COLUMN "space_info"."fileId" IS \'文件id\'; COMMENT ON COLUMN "space_info"."name" IS \'文件名\'; COMMENT ON COLUMN "space_info"."size" IS \'文件大小\'; COMMENT ON COLUMN "space_info"."version" IS \'文档版本\'; COMMENT ON COLUMN "space_info"."key" IS \'文件位置\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_eb1da2f304c760846b5add09b3" ON "space_info" ("createTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_d7a2539961e9aacba8b353f3c9" ON "space_info" ("updateTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_6001c5ed2088b893c0d69bb244" ON "space_info" ("tenantId") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_0975633032bfe6574468b3a4ae" ON "space_info" ("fileId") '
    );
    await queryRunner.query(
      'CREATE TABLE "space_type" ("id" SERIAL NOT NULL, "createTime" character varying NOT NULL, "updateTime" character varying NOT NULL, "tenantId" integer, "name" character varying NOT NULL, "parentId" integer, CONSTRAINT "PK_5ecc239af9d8ad8104c7f21a2cc" PRIMARY KEY ("id")); COMMENT ON COLUMN "space_type"."id" IS \'ID\'; COMMENT ON COLUMN "space_type"."createTime" IS \'创建时间\'; COMMENT ON COLUMN "space_type"."updateTime" IS \'更新时间\'; COMMENT ON COLUMN "space_type"."tenantId" IS \'租户ID\'; COMMENT ON COLUMN "space_type"."name" IS \'类别名称\'; COMMENT ON COLUMN "space_type"."parentId" IS \'父分类ID\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_6669449501d275f367ca295472" ON "space_type" ("createTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_0749b509b68488caecd4cc2bbc" ON "space_type" ("updateTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_5e7f846b8cdabbceba95ed3314" ON "space_type" ("tenantId") '
    );
    await queryRunner.query(
      'CREATE TABLE "base_sys_user_role" ("id" SERIAL NOT NULL, "createTime" character varying NOT NULL, "updateTime" character varying NOT NULL, "tenantId" integer, "userId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_ae4c555b94a0326c42b6ce71a46" PRIMARY KEY ("id")); COMMENT ON COLUMN "base_sys_user_role"."id" IS \'ID\'; COMMENT ON COLUMN "base_sys_user_role"."createTime" IS \'创建时间\'; COMMENT ON COLUMN "base_sys_user_role"."updateTime" IS \'更新时间\'; COMMENT ON COLUMN "base_sys_user_role"."tenantId" IS \'租户ID\'; COMMENT ON COLUMN "base_sys_user_role"."userId" IS \'用户ID\'; COMMENT ON COLUMN "base_sys_user_role"."roleId" IS \'角色ID\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_fa9555e03e42fce748c9046b1c" ON "base_sys_user_role" ("createTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_3e36c0d2b1a4c659c6b4fc64b3" ON "base_sys_user_role" ("updateTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_2f1dc0b6aad5604a2ddf37fba6" ON "base_sys_user_role" ("tenantId") '
    );
    await queryRunner.query(
      'CREATE TABLE "base_sys_role_menu" ("id" SERIAL NOT NULL, "createTime" character varying NOT NULL, "updateTime" character varying NOT NULL, "tenantId" integer, "roleId" integer NOT NULL, "menuId" integer NOT NULL, CONSTRAINT "PK_44312aeaaacb4fe752e6dfc46bf" PRIMARY KEY ("id")); COMMENT ON COLUMN "base_sys_role_menu"."id" IS \'ID\'; COMMENT ON COLUMN "base_sys_role_menu"."createTime" IS \'创建时间\'; COMMENT ON COLUMN "base_sys_role_menu"."updateTime" IS \'更新时间\'; COMMENT ON COLUMN "base_sys_role_menu"."tenantId" IS \'租户ID\'; COMMENT ON COLUMN "base_sys_role_menu"."roleId" IS \'角色ID\'; COMMENT ON COLUMN "base_sys_role_menu"."menuId" IS \'菜单ID\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_3641f81d4201c524a57ce2aa54" ON "base_sys_role_menu" ("createTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_f860298298b26e7a697be36e5b" ON "base_sys_role_menu" ("updateTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_fd2d8bbe13949cfa56b1ed0a5d" ON "base_sys_role_menu" ("tenantId") '
    );
    await queryRunner.query(
      'CREATE TABLE "base_sys_role_department" ("id" SERIAL NOT NULL, "createTime" character varying NOT NULL, "updateTime" character varying NOT NULL, "tenantId" integer, "roleId" integer NOT NULL, "departmentId" integer NOT NULL, CONSTRAINT "PK_d51c868f1d6d1300e8019d9be55" PRIMARY KEY ("id")); COMMENT ON COLUMN "base_sys_role_department"."id" IS \'ID\'; COMMENT ON COLUMN "base_sys_role_department"."createTime" IS \'创建时间\'; COMMENT ON COLUMN "base_sys_role_department"."updateTime" IS \'更新时间\'; COMMENT ON COLUMN "base_sys_role_department"."tenantId" IS \'租户ID\'; COMMENT ON COLUMN "base_sys_role_department"."roleId" IS \'角色ID\'; COMMENT ON COLUMN "base_sys_role_department"."departmentId" IS \'部门ID\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_e881a66f7cce83ba431cf20194" ON "base_sys_role_department" ("createTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_cbf48031efee5d0de262965e53" ON "base_sys_role_department" ("updateTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_055658b2de49d547635e06f160" ON "base_sys_role_department" ("tenantId") '
    );
    await queryRunner.query(
      'CREATE TABLE "base_sys_role" ("id" SERIAL NOT NULL, "createTime" character varying NOT NULL, "updateTime" character varying NOT NULL, "tenantId" integer, "userId" character varying NOT NULL, "name" character varying NOT NULL, "label" character varying(50), "remark" character varying, "relevance" boolean NOT NULL DEFAULT false, "menuIdList" json NOT NULL, "departmentIdList" json NOT NULL, CONSTRAINT "PK_f51520240feced97cc423c4ef65" PRIMARY KEY ("id")); COMMENT ON COLUMN "base_sys_role"."id" IS \'ID\'; COMMENT ON COLUMN "base_sys_role"."createTime" IS \'创建时间\'; COMMENT ON COLUMN "base_sys_role"."updateTime" IS \'更新时间\'; COMMENT ON COLUMN "base_sys_role"."tenantId" IS \'租户ID\'; COMMENT ON COLUMN "base_sys_role"."userId" IS \'用户ID\'; COMMENT ON COLUMN "base_sys_role"."name" IS \'名称\'; COMMENT ON COLUMN "base_sys_role"."label" IS \'角色标签\'; COMMENT ON COLUMN "base_sys_role"."remark" IS \'备注\'; COMMENT ON COLUMN "base_sys_role"."relevance" IS \'数据权限是否关联上下级\'; COMMENT ON COLUMN "base_sys_role"."menuIdList" IS \'菜单权限\'; COMMENT ON COLUMN "base_sys_role"."departmentIdList" IS \'部门权限\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_6f01184441dec49207b41bfd92" ON "base_sys_role" ("createTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_d64ca209f3fc52128d9b20e97b" ON "base_sys_role" ("updateTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_953dc26a4e8bd5d9c989295796" ON "base_sys_role" ("tenantId") '
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_469d49a5998170e9550cf113da" ON "base_sys_role" ("name") '
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_f3f24fbbccf00192b076e549a7" ON "base_sys_role" ("label") '
    );
    await queryRunner.query(
      'CREATE TABLE "base_sys_menu" ("id" SERIAL NOT NULL, "createTime" character varying NOT NULL, "updateTime" character varying NOT NULL, "tenantId" integer, "key" character varying(100), "parentId" integer, "name" character varying NOT NULL, "router" character varying, "perms" text, "type" integer NOT NULL DEFAULT \'0\', "icon" character varying, "orderNum" integer NOT NULL DEFAULT \'0\', "viewPath" character varying, "keepAlive" boolean NOT NULL DEFAULT true, "isShow" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_d340a4bb3f8be8b2896536b2ec7" PRIMARY KEY ("id")); COMMENT ON COLUMN "base_sys_menu"."id" IS \'ID\'; COMMENT ON COLUMN "base_sys_menu"."createTime" IS \'创建时间\'; COMMENT ON COLUMN "base_sys_menu"."updateTime" IS \'更新时间\'; COMMENT ON COLUMN "base_sys_menu"."tenantId" IS \'租户ID\'; COMMENT ON COLUMN "base_sys_menu"."key" IS \'稳定标识\'; COMMENT ON COLUMN "base_sys_menu"."parentId" IS \'父菜单ID\'; COMMENT ON COLUMN "base_sys_menu"."name" IS \'菜单名称\'; COMMENT ON COLUMN "base_sys_menu"."router" IS \'菜单地址\'; COMMENT ON COLUMN "base_sys_menu"."perms" IS \'权限标识\'; COMMENT ON COLUMN "base_sys_menu"."type" IS \'类型 0-目录 1-菜单 2-按钮\'; COMMENT ON COLUMN "base_sys_menu"."icon" IS \'图标\'; COMMENT ON COLUMN "base_sys_menu"."orderNum" IS \'排序\'; COMMENT ON COLUMN "base_sys_menu"."viewPath" IS \'视图地址\'; COMMENT ON COLUMN "base_sys_menu"."keepAlive" IS \'路由缓存\'; COMMENT ON COLUMN "base_sys_menu"."isShow" IS \'是否显示\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_05e3d6a56604771a6da47ebf8e" ON "base_sys_menu" ("createTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_d5203f18daaf7c3fe0ab34497f" ON "base_sys_menu" ("updateTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_2087f9610c1fc5a184bedaacef" ON "base_sys_menu" ("tenantId") '
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_281b10201f5da39a427c4819a9" ON "base_sys_menu" ("key") '
    );
    await queryRunner.query(
      'CREATE TABLE "base_sys_user" ("id" SERIAL NOT NULL, "createTime" character varying NOT NULL, "updateTime" character varying NOT NULL, "tenantId" integer, "departmentId" integer, "userId" integer, "name" character varying, "username" character varying(100) NOT NULL, "password" character varying NOT NULL, "passwordV" integer NOT NULL DEFAULT \'1\', "nickName" character varying, "headImg" character varying, "phone" character varying(20), "email" character varying, "remark" character varying, "status" integer NOT NULL DEFAULT \'1\', "socketId" character varying, CONSTRAINT "PK_bc158670c4ab66bb902af4b225c" PRIMARY KEY ("id")); COMMENT ON COLUMN "base_sys_user"."id" IS \'ID\'; COMMENT ON COLUMN "base_sys_user"."createTime" IS \'创建时间\'; COMMENT ON COLUMN "base_sys_user"."updateTime" IS \'更新时间\'; COMMENT ON COLUMN "base_sys_user"."tenantId" IS \'租户ID\'; COMMENT ON COLUMN "base_sys_user"."departmentId" IS \'部门ID\'; COMMENT ON COLUMN "base_sys_user"."userId" IS \'创建者ID\'; COMMENT ON COLUMN "base_sys_user"."name" IS \'姓名\'; COMMENT ON COLUMN "base_sys_user"."username" IS \'用户名\'; COMMENT ON COLUMN "base_sys_user"."password" IS \'密码\'; COMMENT ON COLUMN "base_sys_user"."passwordV" IS \'密码版本, 作用是改完密码，让原来的token失效\'; COMMENT ON COLUMN "base_sys_user"."nickName" IS \'昵称\'; COMMENT ON COLUMN "base_sys_user"."headImg" IS \'头像\'; COMMENT ON COLUMN "base_sys_user"."phone" IS \'手机\'; COMMENT ON COLUMN "base_sys_user"."email" IS \'邮箱\'; COMMENT ON COLUMN "base_sys_user"."remark" IS \'备注\'; COMMENT ON COLUMN "base_sys_user"."status" IS \'状态 0-禁用 1-启用\'; COMMENT ON COLUMN "base_sys_user"."socketId" IS \'socketId\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_ca8611d15a63d52aa4e292e46a" ON "base_sys_user" ("createTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_a0f2f19cee18445998ece93ddd" ON "base_sys_user" ("updateTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_94cb6e88070603ac6729d514fd" ON "base_sys_user" ("tenantId") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_0cf944da378d70a94f5fefd803" ON "base_sys_user" ("departmentId") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_40541b0502eb2422c73ae2aad1" ON "base_sys_user" ("userId") '
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_469ad55973f5b98930f6ad627b" ON "base_sys_user" ("username") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_9ec6d7ac6337eafb070e4881a8" ON "base_sys_user" ("phone") '
    );
    await queryRunner.query(
      'CREATE TABLE "base_sys_log" ("id" SERIAL NOT NULL, "createTime" character varying NOT NULL, "updateTime" character varying NOT NULL, "tenantId" integer, "userId" integer, "action" character varying NOT NULL, "ip" character varying, "params" json, CONSTRAINT "PK_9a1635db425d22a297fd3c293ad" PRIMARY KEY ("id")); COMMENT ON COLUMN "base_sys_log"."id" IS \'ID\'; COMMENT ON COLUMN "base_sys_log"."createTime" IS \'创建时间\'; COMMENT ON COLUMN "base_sys_log"."updateTime" IS \'更新时间\'; COMMENT ON COLUMN "base_sys_log"."tenantId" IS \'租户ID\'; COMMENT ON COLUMN "base_sys_log"."userId" IS \'用户ID\'; COMMENT ON COLUMN "base_sys_log"."action" IS \'行为\'; COMMENT ON COLUMN "base_sys_log"."ip" IS \'ip\'; COMMENT ON COLUMN "base_sys_log"."params" IS \'参数\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_c9382b76219a1011f7b8e7bcd1" ON "base_sys_log" ("createTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_bfd44e885b470da43bcc39aaa7" ON "base_sys_log" ("updateTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_384bde153859845bf0dcdc00f6" ON "base_sys_log" ("tenantId") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_51a2caeb5713efdfcb343a8772" ON "base_sys_log" ("userId") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_938f886fb40e163db174b7f6c3" ON "base_sys_log" ("action") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_24e18767659f8c7142580893f2" ON "base_sys_log" ("ip") '
    );
    await queryRunner.query(
      'CREATE TABLE "base_sys_department" ("id" SERIAL NOT NULL, "createTime" character varying NOT NULL, "updateTime" character varying NOT NULL, "tenantId" integer, "name" character varying NOT NULL, "userId" integer, "parentId" integer, "orderNum" integer NOT NULL DEFAULT \'0\', CONSTRAINT "PK_df6e3a2c01406d8670ada6a68d9" PRIMARY KEY ("id")); COMMENT ON COLUMN "base_sys_department"."id" IS \'ID\'; COMMENT ON COLUMN "base_sys_department"."createTime" IS \'创建时间\'; COMMENT ON COLUMN "base_sys_department"."updateTime" IS \'更新时间\'; COMMENT ON COLUMN "base_sys_department"."tenantId" IS \'租户ID\'; COMMENT ON COLUMN "base_sys_department"."name" IS \'部门名称\'; COMMENT ON COLUMN "base_sys_department"."userId" IS \'创建者ID\'; COMMENT ON COLUMN "base_sys_department"."parentId" IS \'上级部门ID\'; COMMENT ON COLUMN "base_sys_department"."orderNum" IS \'排序\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_be4c53cd671384fa588ca9470a" ON "base_sys_department" ("createTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_ca1473a793961ec55bc0c8d268" ON "base_sys_department" ("updateTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_f19e8ffd9c62ddb17e76c8b9d7" ON "base_sys_department" ("tenantId") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_f5fb5ac30b3609c27af3517727" ON "base_sys_department" ("userId") '
    );
    await queryRunner.query(
      'CREATE TABLE "base_sys_conf" ("id" SERIAL NOT NULL, "createTime" character varying NOT NULL, "updateTime" character varying NOT NULL, "tenantId" integer, "cKey" character varying NOT NULL, "cValue" character varying NOT NULL, CONSTRAINT "PK_0f98b7fb11bc5657ef55392c09a" PRIMARY KEY ("id")); COMMENT ON COLUMN "base_sys_conf"."id" IS \'ID\'; COMMENT ON COLUMN "base_sys_conf"."createTime" IS \'创建时间\'; COMMENT ON COLUMN "base_sys_conf"."updateTime" IS \'更新时间\'; COMMENT ON COLUMN "base_sys_conf"."tenantId" IS \'租户ID\'; COMMENT ON COLUMN "base_sys_conf"."cKey" IS \'配置键\'; COMMENT ON COLUMN "base_sys_conf"."cValue" IS \'配置值\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_905208f206a3ff9fd513421971" ON "base_sys_conf" ("createTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_4c6f27f6ecefe51a5a196a047a" ON "base_sys_conf" ("updateTime") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_03fc424a2f8093a538730a7ff2" ON "base_sys_conf" ("tenantId") '
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_9be195d27767b4485417869c3a" ON "base_sys_conf" ("cKey") '
    );
    await queryRunner.query(
      'CREATE TABLE "query-result-cache" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id"))'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "query-result-cache"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_9be195d27767b4485417869c3a"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_03fc424a2f8093a538730a7ff2"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_4c6f27f6ecefe51a5a196a047a"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_905208f206a3ff9fd513421971"'
    );
    await queryRunner.query('DROP TABLE "base_sys_conf"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_f5fb5ac30b3609c27af3517727"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_f19e8ffd9c62ddb17e76c8b9d7"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_ca1473a793961ec55bc0c8d268"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_be4c53cd671384fa588ca9470a"'
    );
    await queryRunner.query('DROP TABLE "base_sys_department"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_24e18767659f8c7142580893f2"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_938f886fb40e163db174b7f6c3"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_51a2caeb5713efdfcb343a8772"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_384bde153859845bf0dcdc00f6"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_bfd44e885b470da43bcc39aaa7"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_c9382b76219a1011f7b8e7bcd1"'
    );
    await queryRunner.query('DROP TABLE "base_sys_log"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_9ec6d7ac6337eafb070e4881a8"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_469ad55973f5b98930f6ad627b"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_40541b0502eb2422c73ae2aad1"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_0cf944da378d70a94f5fefd803"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_94cb6e88070603ac6729d514fd"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_a0f2f19cee18445998ece93ddd"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_ca8611d15a63d52aa4e292e46a"'
    );
    await queryRunner.query('DROP TABLE "base_sys_user"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_281b10201f5da39a427c4819a9"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_2087f9610c1fc5a184bedaacef"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_d5203f18daaf7c3fe0ab34497f"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_05e3d6a56604771a6da47ebf8e"'
    );
    await queryRunner.query('DROP TABLE "base_sys_menu"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_f3f24fbbccf00192b076e549a7"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_469d49a5998170e9550cf113da"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_953dc26a4e8bd5d9c989295796"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_d64ca209f3fc52128d9b20e97b"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_6f01184441dec49207b41bfd92"'
    );
    await queryRunner.query('DROP TABLE "base_sys_role"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_055658b2de49d547635e06f160"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_cbf48031efee5d0de262965e53"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_e881a66f7cce83ba431cf20194"'
    );
    await queryRunner.query('DROP TABLE "base_sys_role_department"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_fd2d8bbe13949cfa56b1ed0a5d"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_f860298298b26e7a697be36e5b"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_3641f81d4201c524a57ce2aa54"'
    );
    await queryRunner.query('DROP TABLE "base_sys_role_menu"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_2f1dc0b6aad5604a2ddf37fba6"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_3e36c0d2b1a4c659c6b4fc64b3"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_fa9555e03e42fce748c9046b1c"'
    );
    await queryRunner.query('DROP TABLE "base_sys_user_role"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_5e7f846b8cdabbceba95ed3314"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_0749b509b68488caecd4cc2bbc"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_6669449501d275f367ca295472"'
    );
    await queryRunner.query('DROP TABLE "space_type"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_0975633032bfe6574468b3a4ae"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_6001c5ed2088b893c0d69bb244"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_d7a2539961e9aacba8b353f3c9"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_eb1da2f304c760846b5add09b3"'
    );
    await queryRunner.query('DROP TABLE "space_info"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_95719662507de0fbf70ad1b5ee"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_89a39daf328b50686755795546"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_d94d7c2437aca9f1b183979b07"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_071da0804576df95363c24357c"'
    );
    await queryRunner.query('DROP TABLE "plugin_info"');
  }
}
