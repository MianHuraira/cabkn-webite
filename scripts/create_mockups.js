const path = require('path');
const sharp = require(path.join(process.cwd(), 'node_modules/sharp'));
const fs = require('fs');

const userDir = 'C:/Users/mugha/.gemini/antigravity-ide/brain/edb773e3-ee62-4349-aafc-69c69378bda3/.user_uploaded/';
const brainDir = 'C:/Users/mugha/.gemini/antigravity-ide/brain/edb773e3-ee62-4349-aafc-69c69378bda3/';
const assetsDir = path.join(__dirname, '../src/components/assets/Images');

async function createPhoneMockup(screenshotPath, targetWidth = 195, targetHeight = 430) {
  const bezel = Math.round(targetWidth * 0.038);
  const screenWidth = targetWidth - (bezel * 2);
  const screenHeight = targetHeight - (bezel * 2);
  const cornerRadius = Math.round(targetWidth * 0.15);
  const screenRadius = cornerRadius - bezel + 2;

  // 1. Resize screenshot
  const resizedScreenBuffer = await sharp(screenshotPath)
    .resize(screenWidth, screenHeight, { fit: 'cover' })
    .toBuffer();

  // 2. Screen Mask SVG
  const screenMaskSvg = Buffer.from(`
    <svg width="${screenWidth}" height="${screenHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${screenWidth}" height="${screenHeight}" rx="${screenRadius}" ry="${screenRadius}" fill="black" />
    </svg>
  `);

  const maskedScreen = await sharp(resizedScreenBuffer)
    .composite([{ input: screenMaskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 3. Chassis + HUD dimensions
  const padX = 65;
  const padY = 65;
  const totalWidth = targetWidth + (padX * 2);
  const totalHeight = targetHeight + (padY * 2);

  const phoneX = padX;
  const phoneY = padY;
  const screenX = phoneX + bezel;
  const screenY = phoneY + bezel;

  const islandWidth = Math.round(targetWidth * 0.23);
  const islandHeight = Math.max(12, Math.round(targetHeight * 0.032));
  const islandX = screenX + (screenWidth - islandWidth) / 2;
  const islandY = screenY + 6;

  const chassisSvg = Buffer.from(`
    <svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="phoneShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="22" stdDeviation="20" flood-color="#000000" flood-opacity="0.65" />
          <feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#002b42" flood-opacity="0.4" />
        </filter>

        <filter id="hudGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="titanium" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#94a3b8" />
          <stop offset="25%" stop-color="#cbd5e1" />
          <stop offset="45%" stop-color="#475569" />
          <stop offset="70%" stop-color="#64748b" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>

        <linearGradient id="innerBezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
      </defs>

      <!-- Holographic HUD Rings & Cyan Ambient Flare -->
      <g filter="url(#hudGlow)" opacity="0.85">
        <circle cx="${totalWidth / 2}" cy="${totalHeight / 2}" r="${targetHeight * 0.44}" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="15 19" opacity="0.55" />
        <circle cx="${totalWidth / 2}" cy="${totalHeight / 2}" r="${targetHeight * 0.5}" fill="none" stroke="#0ea5e9" stroke-width="1" stroke-dasharray="72 42 13 36" opacity="0.65" />
        
        <line x1="${phoneX - 32}" y1="${phoneY + 85}" x2="${phoneX - 7}" y2="${phoneY + 85}" stroke="#38bdf8" stroke-width="1.5" />
        <circle cx="${phoneX - 32}" cy="${phoneY + 85}" r="2" fill="#38bdf8" />

        <line x1="${phoneX + targetWidth + 7}" y1="${phoneY + 140}" x2="${phoneX + targetWidth + 32}" y2="${phoneY + 140}" stroke="#38bdf8" stroke-width="1.5" />
        <circle cx="${phoneX + targetWidth + 32}" cy="${phoneY + 140}" r="2" fill="#38bdf8" />

        <!-- Floating Ride Icon Pill -->
        <rect x="${phoneX - 40}" y="${phoneY + 160}" width="26" height="26" rx="7" fill="#004a70" fill-opacity="0.85" stroke="#38bdf8" stroke-width="1" />
        <circle cx="${phoneX - 27}" cy="${phoneY + 173}" r="4.5" fill="none" stroke="#ffffff" stroke-width="1.2" />

        <rect x="${phoneX + targetWidth + 15}" y="${phoneY + 210}" width="26" height="26" rx="7" fill="#004a70" fill-opacity="0.85" stroke="#38bdf8" stroke-width="1" />
        <circle cx="${phoneX + targetWidth + 28}" cy="${phoneY + 223}" r="4.5" fill="none" stroke="#ffffff" stroke-width="1.2" />
      </g>

      <!-- Phone Outer Chassis with Shadow -->
      <rect x="${phoneX}" y="${phoneY}" width="${targetWidth}" height="${targetHeight}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#titanium)" filter="url(#phoneShadow)" />

      <!-- Outer Rim Highlights -->
      <rect x="${phoneX + 1}" y="${phoneY + 1}" width="${targetWidth - 2}" height="${targetHeight - 2}" rx="${cornerRadius - 1}" ry="${cornerRadius - 1}" fill="none" stroke="#f1f5f9" stroke-width="0.8" opacity="0.7" />

      <!-- Inner Black Bezel -->
      <rect x="${phoneX + 2}" y="${phoneY + 2}" width="${targetWidth - 4}" height="${targetHeight - 4}" rx="${cornerRadius - 2}" ry="${cornerRadius - 2}" fill="url(#innerBezel)" />
    </svg>
  `);

  const topOverlaySvg = Buffer.from(`
    <svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22" />
          <stop offset="35%" stop-color="#ffffff" stop-opacity="0.06" />
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
        <clipPath id="screenClipArea">
          <rect x="${screenX}" y="${screenY}" width="${screenWidth}" height="${screenHeight}" rx="${screenRadius}" ry="${screenRadius}" />
        </clipPath>
      </defs>

      <!-- Dynamic Island Pill -->
      <rect x="${islandX}" y="${islandY}" width="${islandWidth}" height="${islandHeight}" rx="${islandHeight / 2}" ry="${islandHeight / 2}" fill="#000000" />
      <circle cx="${islandX + islandWidth - 9}" cy="${islandY + islandHeight / 2}" r="3" fill="#111827" />

      <!-- Glass Glare across Screen -->
      <rect x="${screenX}" y="${screenY}" width="${screenWidth}" height="${screenHeight}" rx="${screenRadius}" ry="${screenRadius}" fill="url(#glassGlare)" pointer-events="none" clip-path="url(#screenClipArea)" />
    </svg>
  `);

  return sharp(chassisSvg)
    .composite([
      { input: maskedScreen, left: screenX, top: screenY },
      { input: topOverlaySvg, left: 0, top: 0 }
    ])
    .png()
    .toBuffer();
}

async function buildAll() {
  const configs = [
    {
      name: 'heroDailyRides.jpg',
      base: path.join(assetsDir, 'hero1.png'),
      screenshot: path.join(userDir, 'media_1788530604711.png'), // Fresh Home App Screenshot
      phoneWidth: 175,
      phoneHeight: 385,
      targetCanvasWidth: 1920,
      targetCanvasHeight: 1080,
      customPos: { x: 1525, y: 282 },
    },
    {
      name: 'heroAirport.jpg',
      base: path.join(brainDir, 'hero_airport_ride_1788517096135.jpg'),
      screenshot: path.join(userDir, 'media_1788524989658.png'), // Profile
      phoneWidth: 195,
      phoneHeight: 430,
      targetCanvasWidth: 1920,
      targetCanvasHeight: 1080,
      rightOffset: 160,
      topRatio: 0.28,
    },
    {
      name: 'heroTour.jpg',
      base: path.join(brainDir, 'hero_tour_ride_1788517142020.jpg'),
      screenshot: path.join(userDir, 'media_1788524989842.png'), // Shop/Tours
      phoneWidth: 195,
      phoneHeight: 430,
      targetCanvasWidth: 1920,
      targetCanvasHeight: 1080,
      rightOffset: 160,
      topRatio: 0.28,
    },
    {
      name: 'heroParcel.jpg',
      base: path.join(brainDir, 'hero_parcel_ride_1788517192803.jpg'),
      screenshot: path.join(userDir, 'media_1788524989604.png'), // Chat
      phoneWidth: 195,
      phoneHeight: 430,
      targetCanvasWidth: 1920,
      targetCanvasHeight: 1080,
      rightOffset: 160,
      topRatio: 0.28,
    },
    {
      name: 'heroVip.jpg',
      base: path.join(brainDir, 'hero_vip_ride_1788517245556.jpg'),
      screenshot: path.join(userDir, 'media_1788530592662.png'), // Fresh Wallet Screenshot
      phoneWidth: 204,
      phoneHeight: 460,
      targetCanvasWidth: 1920,
      targetCanvasHeight: 1080,
      customPos: { x: 1515, y: 295 },
    },
  ];

  for (const cfg of configs) {
    console.log(`Processing ${cfg.name}...`);

    // 1. Load and resize base image to standard Full HD (1920x1080)
    const baseBuffer = await sharp(cfg.base)
      .resize(cfg.targetCanvasWidth, cfg.targetCanvasHeight, { fit: 'cover', position: 'center' })
      .toBuffer();

    // 2. Generate phone mockup buffer
    const mockupBuffer = await createPhoneMockup(cfg.screenshot, cfg.phoneWidth, cfg.phoneHeight);

    // 3. Mockup dimensions with padding
    const padX = 65;
    const padY = 65;
    const mockupFullWidth = cfg.phoneWidth + (padX * 2);

    let posX, posY;
    if (cfg.customPos) {
      posX = cfg.customPos.x - padX;
      posY = cfg.customPos.y - padY;
    } else {
      posX = cfg.targetCanvasWidth - mockupFullWidth - cfg.rightOffset + padX;
      posY = Math.round(cfg.targetCanvasHeight * cfg.topRatio);
    }

    // 4. Composite together
    const finalImage = await sharp(baseBuffer)
      .composite([
        { input: mockupBuffer, left: posX, top: posY }
      ])
      .jpeg({ quality: 94 })
      .toBuffer();

    const destPath = path.join(assetsDir, cfg.name);
    fs.writeFileSync(destPath, finalImage);
    console.log(`Successfully written ${destPath}`);
  }

  console.log('All 5 hero images successfully created with compact, elegant phone mockups!');
}

buildAll().catch(err => {
  console.error('Error in buildAll:', err);
  process.exit(1);
});
