import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('assets/icon.svg');
const outputDir = path.resolve('public/icon');

const sizes = [
    16,
    32,
    48,
    64,
    128,
    256,
    512,
    1024
];

async function generate() {
  console.log('⚡ [CountdownAlarm Assets] 开始一键编译 PNG 图标阵列...');
  
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}.png`);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✅ 成功输出高精度图标: icon-${size}.png (${size}x${size}px)`);
  }
  console.log('🚀 静态资产编译完成，完美合流！');
}

generate().catch(console.error);