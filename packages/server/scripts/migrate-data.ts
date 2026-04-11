/**
 * 数据迁移脚本：将现有笔记迁移到默认用户
 *
 * 使用方法:
 * npx tsx scripts/migrate-data.ts
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password.js';

const prisma = new PrismaClient();

async function migrate() {
  console.log('开始数据迁移...');

  // 1. 检查是否已有默认用户
  let defaultUser = await prisma.user.findUnique({
    where: { name: 'admin' },
  });

  if (!defaultUser) {
    // 2. 创建默认用户
    console.log('创建默认用户 admin...');
    defaultUser = await prisma.user.create({
      data: {
        name: 'admin',
        email: 'admin@conan.local',
        password: await hashPassword('admin123'), // 默认密码
      },
    });
    console.log(`默认用户已创建：ID=${defaultUser.id}`);
  } else {
    console.log(`默认用户已存在：ID=${defaultUser.id}`);
  }

  // 3. 查询所有笔记
  const allNotes = await prisma.note.findMany({});

  if (allNotes.length === 0) {
    console.log('没有需要迁移的笔记');
  } else {
    console.log(`找到 ${allNotes.length} 条笔记`);

    // 4. 检查是否所有笔记都已有关联用户
    const notesWithoutUser = allNotes.filter(n => n.userId === undefined || n.userId === null);

    if (notesWithoutUser.length > 0) {
      // 批量更新笔记
      await prisma.note.updateMany({
        where: {
          id: { in: notesWithoutUser.map((n) => n.id) },
        },
        data: {
          userId: defaultUser.id,
        },
      });
      console.log(`已将 ${notesWithoutUser.length} 条笔记迁移到用户 admin`);
    } else {
      console.log('所有笔记已关联用户');
    }
  }

  console.log('数据迁移完成！');
  console.log('');
  console.log('默认账户信息:');
  console.log('  用户名：admin');
  console.log('  邮箱：admin@conan.local');
  console.log('  密码：admin123');
  console.log('');
  console.log('请及时修改默认密码！');
}

migrate()
  .catch((err) => {
    console.error('迁移失败:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
