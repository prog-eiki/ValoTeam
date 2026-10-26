import { getAgentById, getMapById, TEAM_INFO } from '../data/valorantData';
import { ExportLayout, Lineup, Player } from '../types/lineup';

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  offsetY = 0
) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgRatio > targetRatio) {
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2 + offsetY;
    sy = Math.max(0, Math.min(img.height - sh, sy));
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialFontSize: number,
  minFontSize: number,
  fontWeight: string,
  fontFamily: string
): string {
  let size = initialFontSize;
  while (size >= minFontSize) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) {
      return ctx.font;
    }
    size -= 1;
  }
  return `${fontWeight} ${minFontSize}px ${fontFamily}`;
}

function getRoleAccentColor(role?: string): string {
  switch (role) {
    case 'Duelist':
      return '#E63946';
    case 'Initiator':
      return '#73FBD3';
    case 'Controller':
      return '#C8A273';
    case 'Sentinel':
      return '#60A5FA';
    default:
      return '#C8A273';
  }
}

export async function renderLineupToCanvas(
  lineup: Lineup,
  players: Player[],
  layout: ExportLayout
): Promise<string> {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font loading timeout
    }
  }

  const canvas = document.createElement('canvas');
  const isLandscape = layout === 'landscape';
  const W = isLandscape ? 1920 : 1080;
  const H = isLandscape ? 1080 : 1350;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const mapInfo = getMapById(lineup.mapId);
  const logoImg = await loadImage(TEAM_INFO.logoUrl);
  const mapSplashImg = mapInfo ? await loadImage(mapInfo.splash) : null;

  // 1. Deep Black Base Background
  ctx.fillStyle = '#07080A';
  ctx.fillRect(0, 0, W, H);

  // 2. Map Splash Background with subtle dark blend
  if (mapSplashImg) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    drawCoverImage(ctx, mapSplashImg, 0, 0, W, H);
    ctx.restore();
  }

  // Dark vignette & crimson esports atmosphere gradients
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, 'rgba(7, 8, 10, 0.88)');
  bgGrad.addColorStop(0.22, 'rgba(7, 8, 10, 0.65)');
  bgGrad.addColorStop(0.75, 'rgba(7, 8, 10, 0.85)');
  bgGrad.addColorStop(1, 'rgba(7, 8, 10, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Radial dark red glow in top-left and bottom-right
  const redGlow1 = ctx.createRadialGradient(W * 0.15, H * 0.1, 20, W * 0.15, H * 0.1, W * 0.55);
  redGlow1.addColorStop(0, 'rgba(158, 20, 27, 0.26)');
  redGlow1.addColorStop(1, 'rgba(158, 20, 27, 0)');
  ctx.fillStyle = redGlow1;
  ctx.fillRect(0, 0, W, H);

  const redGlow2 = ctx.createRadialGradient(W * 0.85, H * 0.88, 20, W * 0.85, H * 0.88, W * 0.5);
  redGlow2.addColorStop(0, 'rgba(158, 20, 27, 0.22)');
  redGlow2.addColorStop(1, 'rgba(158, 20, 27, 0)');
  ctx.fillStyle = redGlow2;
  ctx.fillRect(0, 0, W, H);

  // Subtle Tactical Grid Lines
  ctx.save();
  ctx.strokeStyle = 'rgba(200, 162, 115, 0.04)';
  ctx.lineWidth = 1;
  const gridStep = 60;
  for (let x = 0; x < W; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.restore();

  // Top & Bottom Tactical Frame Accent Bars
  const topBarGrad = ctx.createLinearGradient(0, 0, W, 0);
  topBarGrad.addColorStop(0, '#9E141B');
  topBarGrad.addColorStop(0.5, '#C8A273');
  topBarGrad.addColorStop(1, '#9E141B');
  ctx.fillStyle = topBarGrad;
  ctx.fillRect(0, 0, W, 6);

  if (isLandscape) {
    await drawLandscapeComposition(ctx, W, H, lineup, players, logoImg, mapSplashImg, mapInfo?.name || lineup.mapId, mapInfo?.coordinates || '', mapInfo?.sites || '');
  } else {
    await drawPortraitComposition(ctx, W, H, lineup, players, logoImg, mapSplashImg, mapInfo?.name || lineup.mapId, mapInfo?.coordinates || '');
  }

  return canvas.toDataURL('image/png', 1.0);
}

async function drawLandscapeComposition(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  lineup: Lineup,
  players: Player[],
  logoImg: HTMLImageElement | null,
  mapSplashImg: HTMLImageElement | null,
  mapName: string,
  mapCoords: string,
  mapSites: string
) {
  const padX = 72;
  const headerY = 44;

  // Header Glass Panel
  ctx.save();
  drawRoundedRect(ctx, padX, headerY, W - padX * 2, 136, 20);
  ctx.fillStyle = 'rgba(18, 21, 27, 0.85)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(200, 162, 115, 0.25)';
  ctx.stroke();
  ctx.restore();

  // Left: BBT Original Logo + Team Name
  const logoSize = 98;
  const logoX = padX + 26;
  const logoY = headerY + 19;

  if (logoImg) {
    ctx.save();
    ctx.shadowColor = 'rgba(158, 20, 27, 0.6)';
    ctx.shadowBlur = 18;
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    ctx.restore();
  }

  const brandTextX = logoX + logoSize + 22;
  ctx.fillStyle = '#9E141B';
  ctx.font = '700 14px Inter, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('VALORANT TACTICAL ROSTER', brandTextX, headerY + 42);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#C8A273';
  ctx.font = '700 44px Oswald, Impact, sans-serif';
  ctx.fillText('BIGBLACKTEA', brandTextX, headerY + 86);

  // BBT Badge next to BIGBLACKTEA
  const bbtTitleWidth = ctx.measureText('BIGBLACKTEA').width;
  const badgeX = brandTextX + bbtTitleWidth + 16;
  ctx.save();
  drawRoundedRect(ctx, badgeX, headerY + 52, 68, 36, 8);
  ctx.fillStyle = 'rgba(158, 20, 27, 0.28)';
  ctx.fill();
  ctx.strokeStyle = '#9E141B';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#ECE8E1';
  ctx.font = '700 20px Oswald, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BBT', badgeX + 34, headerY + 77);
  ctx.restore();

  ctx.fillStyle = '#878C8F';
  ctx.font = '500 15px Inter, sans-serif';
  ctx.fillText('CREATE YOUR LINEUP. OWN THE MAP.', brandTextX, headerY + 112);

  // Center: Lineup Name
  const centerX = W / 2 + 30;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#878C8F';
  ctx.font = '600 13px Inter, sans-serif';
  ctx.fillText('ACTIVE LINEUP CONFIGURATION', centerX, headerY + 44);

  const lineupTitle = (lineup.name || `${mapName} Main`).toUpperCase();
  ctx.fillStyle = '#ECE8E1';
  ctx.font = fitText(ctx, lineupTitle, 520, 44, 24, '700', 'Oswald, sans-serif');
  ctx.fillText(lineupTitle, centerX, headerY + 92);

  // Accent underline under lineup title
  const underlineW = 120;
  ctx.fillStyle = '#9E141B';
  ctx.fillRect(centerX - underlineW / 2, headerY + 106, underlineW, 4);
  ctx.restore();

  // Right: Map Thumbnail Banner inside Header
  const mapCardW = 340;
  const mapCardH = 104;
  const mapCardX = W - padX - mapCardW - 18;
  const mapCardY = headerY + 16;

  ctx.save();
  drawRoundedRect(ctx, mapCardX, mapCardY, mapCardW, mapCardH, 14);
  ctx.clip();
  if (mapSplashImg) {
    drawCoverImage(ctx, mapSplashImg, mapCardX, mapCardY, mapCardW, mapCardH);
  } else {
    ctx.fillStyle = '#1B1F27';
    ctx.fillRect(mapCardX, mapCardY, mapCardW, mapCardH);
  }
  const mapGrad = ctx.createLinearGradient(mapCardX, mapCardY, mapCardX + mapCardW, mapCardY);
  mapGrad.addColorStop(0, 'rgba(10, 12, 16, 0.92)');
  mapGrad.addColorStop(0.65, 'rgba(10, 12, 16, 0.65)');
  mapGrad.addColorStop(1, 'rgba(158, 20, 27, 0.35)');
  ctx.fillStyle = mapGrad;
  ctx.fillRect(mapCardX, mapCardY, mapCardW, mapCardH);

  ctx.strokeStyle = 'rgba(200, 162, 115, 0.45)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, mapCardX, mapCardY, mapCardW, mapCardH, 14);
  ctx.stroke();

  ctx.fillStyle = '#C8A273';
  ctx.font = '700 12px Inter, sans-serif';
  ctx.fillText('SELECTED MAP', mapCardX + 20, mapCardY + 30);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 36px Oswald, sans-serif';
  ctx.fillText(mapName.toUpperCase(), mapCardX + 20, mapCardY + 68);

  ctx.fillStyle = '#A0A5AB';
  ctx.font = '500 12px JetBrains Mono, monospace';
  ctx.fillText(mapSites || mapCoords || 'TACTICAL MAP', mapCardX + 20, mapCardY + 90);
  ctx.restore();

  // 5 Active Player & Agent Cards
  const cardsY = 212;
  const cardsH = 720;
  const totalContentW = W - padX * 2;
  const gap = 24;
  const cardW = (totalContentW - gap * 4) / 5;

  for (let i = 0; i < 5; i++) {
    const slot = lineup.slots[i] || { slotIndex: i, playerId: null, agentId: null };
    const cardX = padX + i * (cardW + gap);
    await drawAgentPlayerCard(ctx, cardX, cardsY, cardW, cardsH, slot.playerId, slot.agentId, i + 1, players);
  }

  // Bottom Footer & Optional Substitute Slot
  const footerY = 960;
  const footerH = 82;

  ctx.save();
  drawRoundedRect(ctx, padX, footerY, totalContentW, footerH, 16);
  ctx.fillStyle = 'rgba(15, 17, 22, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Left side of footer: Team Motto & Timestamp
  ctx.fillStyle = '#C8A273';
  ctx.font = '700 16px Oswald, sans-serif';
  ctx.fillText('BIGBLACKTEA (BBT)  •  OFFICIAL STARTING FIVE', padX + 28, footerY + 36);

  const dateStr = new Date(lineup.updatedAt || Date.now()).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  ctx.fillStyle = '#878C8F';
  ctx.font = '500 14px Inter, sans-serif';
  ctx.fillText(`Stand: ${dateStr}  |  Map: ${mapName}  |  VALORANT Lineup Builder`, padX + 28, footerY + 60);

  // Right side of footer: Substitute Player (if assigned)
  const subPlayer = lineup.substitute?.playerId
    ? players.find((p) => p.id === lineup.substitute?.playerId)
    : null;
  const subAgent = lineup.substitute?.agentId ? getAgentById(lineup.substitute.agentId) : null;

  if (subPlayer || subAgent) {
    const subBoxW = 470;
    const subBoxX = W - padX - subBoxW - 14;
    const subBoxY = footerY + 11;
    const subBoxH = 60;

    drawRoundedRect(ctx, subBoxX, subBoxY, subBoxW, subBoxH, 12);
    ctx.fillStyle = 'rgba(158, 20, 27, 0.16)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(158, 20, 27, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    let textStartX = subBoxX + 18;
    if (subAgent) {
      const subIcon = await loadImage(subAgent.displayIcon);
      if (subIcon) {
        ctx.save();
        drawRoundedRect(ctx, subBoxX + 12, subBoxY + 8, 44, 44, 8);
        ctx.clip();
        ctx.fillStyle = '#14171D';
        ctx.fillRect(subBoxX + 12, subBoxY + 8, 44, 44);
        ctx.drawImage(subIcon, subBoxX + 12, subBoxY + 8, 44, 44);
        ctx.restore();
        textStartX = subBoxX + 68;
      }
    }

    ctx.fillStyle = '#C8A273';
    ctx.font = '700 11px Inter, sans-serif';
    ctx.fillText('6TH MAN / ERSATZSPIELER', textStartX, subBoxY + 22);

    const subLabel = `${subPlayer ? `${subPlayer.name} ${subPlayer.tag}` : 'Unbesetzt'}${
      subAgent ? `  •  ${subAgent.name.toUpperCase()} (${subAgent.role})` : ''
    }`;
    ctx.fillStyle = '#ECE8E1';
    ctx.font = fitText(ctx, subLabel, subBoxW - (textStartX - subBoxX) - 16, 17, 12, '700', 'Inter, sans-serif');
    ctx.fillText(subLabel, textStartX, subBoxY + 46);
  } else {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#878C8F';
    ctx.font = '600 14px JetBrains Mono, monospace';
    ctx.fillText('BBT ESPORTS TACTICAL SYSTEM', W - padX - 28, footerY + 47);
  }
  ctx.restore();
}

async function drawPortraitComposition(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  lineup: Lineup,
  players: Player[],
  logoImg: HTMLImageElement | null,
  mapSplashImg: HTMLImageElement | null,
  mapName: string,
  mapCoords: string
) {
  const padX = 48;
  const headerY = 38;
  const totalW = W - padX * 2;

  // Header Banner
  ctx.save();
  drawRoundedRect(ctx, padX, headerY, totalW, 152, 20);
  ctx.clip();
  if (mapSplashImg) {
    drawCoverImage(ctx, mapSplashImg, padX, headerY, totalW, 152);
  }
  const grad = ctx.createLinearGradient(padX, headerY, padX + totalW, headerY);
  grad.addColorStop(0, 'rgba(10, 12, 16, 0.95)');
  grad.addColorStop(0.6, 'rgba(10, 12, 16, 0.82)');
  grad.addColorStop(1, 'rgba(158, 20, 27, 0.5)');
  ctx.fillStyle = grad;
  ctx.fillRect(padX, headerY, totalW, 152);

  ctx.strokeStyle = 'rgba(200, 162, 115, 0.35)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, padX, headerY, totalW, 152, 20);
  ctx.stroke();

  if (logoImg) {
    ctx.drawImage(logoImg, padX + 24, headerY + 22, 108, 108);
  }

  const textX = padX + 150;
  ctx.fillStyle = '#C8A273';
  ctx.font = '700 14px Inter, sans-serif';
  ctx.fillText('BIGBLACKTEA (BBT)  •  VALORANT LINEUP', textX, headerY + 42);

  const lineupTitle = (lineup.name || `${mapName} Main`).toUpperCase();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = fitText(ctx, lineupTitle, 520, 44, 24, '700', 'Oswald, sans-serif');
  ctx.fillText(lineupTitle, textX, headerY + 92);

  ctx.fillStyle = '#ECE8E1';
  ctx.font = '600 18px Oswald, sans-serif';
  ctx.fillText(`MAP: ${mapName.toUpperCase()}`, textX, headerY + 126);

  if (mapCoords) {
    ctx.fillStyle = '#878C8F';
    ctx.font = '500 13px JetBrains Mono, monospace';
    ctx.fillText(mapCoords, textX + 160, headerY + 125);
  }
  ctx.restore();

  // Top Row: 3 Cards
  const row1Y = 216;
  const cardH = 475;
  const gap = 22;
  const row1CardW = (totalW - gap * 2) / 3;

  for (let i = 0; i < 3; i++) {
    const slot = lineup.slots[i] || { slotIndex: i, playerId: null, agentId: null };
    const cardX = padX + i * (row1CardW + gap);
    await drawAgentPlayerCard(ctx, cardX, row1Y, row1CardW, cardH, slot.playerId, slot.agentId, i + 1, players);
  }

  // Bottom Row: 2 Cards (centered, or 3 cards if substitute is shown as a card)
  const row2Y = row1Y + cardH + 22;
  const subPlayer = lineup.substitute?.playerId
    ? players.find((p) => p.id === lineup.substitute?.playerId)
    : null;
  const subAgent = lineup.substitute?.agentId ? getAgentById(lineup.substitute.agentId) : null;
  const hasSub = Boolean(subPlayer || subAgent);

  if (hasSub) {
    for (let i = 3; i < 5; i++) {
      const slot = lineup.slots[i] || { slotIndex: i, playerId: null, agentId: null };
      const cardX = padX + (i - 3) * (row1CardW + gap);
      await drawAgentPlayerCard(ctx, cardX, row2Y, row1CardW, cardH, slot.playerId, slot.agentId, i + 1, players);
    }
    const subCardX = padX + 2 * (row1CardW + gap);
    await drawAgentPlayerCard(
      ctx,
      subCardX,
      row2Y,
      row1CardW,
      cardH,
      lineup.substitute?.playerId || null,
      lineup.substitute?.agentId || null,
      6,
      players,
      true
    );
  } else {
    const row2StartX = padX + (totalW - (row1CardW * 2 + gap)) / 2;
    for (let i = 3; i < 5; i++) {
      const slot = lineup.slots[i] || { slotIndex: i, playerId: null, agentId: null };
      const cardX = row2StartX + (i - 3) * (row1CardW + gap);
      await drawAgentPlayerCard(ctx, cardX, row2Y, row1CardW, cardH, slot.playerId, slot.agentId, i + 1, players);
    }
  }

  // Footer
  const footerY = 1215;
  ctx.save();
  drawRoundedRect(ctx, padX, footerY, totalW, 92, 16);
  ctx.fillStyle = 'rgba(15, 17, 22, 0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 162, 115, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#C8A273';
  ctx.font = '700 22px Oswald, sans-serif';
  ctx.fillText('BIGBLACKTEA (BBT)', padX + 28, footerY + 42);

  ctx.fillStyle = '#878C8F';
  ctx.font = '500 15px Inter, sans-serif';
  ctx.fillText('Create your lineup. Own the map.', padX + 28, footerY + 68);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#ECE8E1';
  ctx.font = '700 18px Oswald, sans-serif';
  ctx.fillText(`MAP: ${mapName.toUpperCase()}`, W - padX - 28, footerY + 44);

  const dateStr = new Date(lineup.updatedAt || Date.now()).toLocaleDateString('de-DE');
  ctx.fillStyle = '#878C8F';
  ctx.font = '500 14px JetBrains Mono, monospace';
  ctx.fillText(`STAND: ${dateStr}`, W - padX - 28, footerY + 68);
  ctx.restore();
}

async function drawAgentPlayerCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  playerId: string | null,
  agentId: string | null,
  slotNumber: number,
  players: Player[],
  isSubstitute = false
) {
  const player = playerId ? players.find((p) => p.id === playerId) : null;
  const agent = agentId ? getAgentById(agentId) : null;
  const roleAccent = isSubstitute ? '#C8A273' : getRoleAccentColor(agent?.role);

  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, 20);
  ctx.clip();

  // Card Base Gradient
  const cardBg = ctx.createLinearGradient(x, y, x, y + h);
  cardBg.addColorStop(0, '#161922');
  cardBg.addColorStop(0.55, '#101218');
  cardBg.addColorStop(1, '#090A0D');
  ctx.fillStyle = cardBg;
  ctx.fillRect(x, y, w, h);

  // Subtle Role/Crimson Glow behind Agent Portrait
  const portraitGlow = ctx.createRadialGradient(
    x + w / 2,
    y + h * 0.38,
    10,
    x + w / 2,
    y + h * 0.38,
    w * 0.75
  );
  portraitGlow.addColorStop(0, isSubstitute ? 'rgba(200, 162, 115, 0.22)' : 'rgba(158, 20, 27, 0.32)');
  portraitGlow.addColorStop(1, 'rgba(158, 20, 27, 0)');
  ctx.fillStyle = portraitGlow;
  ctx.fillRect(x, y, w, h);

  // Diagonal Tactical Stripe Accent
  ctx.save();
  ctx.strokeStyle = 'rgba(200, 162, 115, 0.05)';
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.moveTo(x - 40, y + h * 0.45);
  ctx.lineTo(x + w + 40, y + h * 0.2);
  ctx.stroke();
  ctx.restore();

  // Large watermark Agent Name vertically or top
  if (agent) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.font = '800 66px Oswald, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(agent.name.toUpperCase(), x + w / 2, y + 92);
    ctx.restore();
  }

  // Top Slot Badge & Role Pill
  ctx.save();
  ctx.fillStyle = isSubstitute ? 'rgba(200, 162, 115, 0.2)' : 'rgba(255, 255, 255, 0.06)';
  drawRoundedRect(ctx, x + 16, y + 16, isSubstitute ? 88 : 54, 28, 8);
  ctx.fill();
  ctx.fillStyle = isSubstitute ? '#C8A273' : '#878C8F';
  ctx.font = '700 12px JetBrains Mono, monospace';
  ctx.fillText(isSubstitute ? '6TH SUB' : `#0${slotNumber}`, x + 28, y + 34);
  ctx.restore();

  if (agent) {
    const roleIconImg = await loadImage(agent.roleIcon);
    if (roleIconImg) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.drawImage(roleIconImg, x + w - 42, y + 18, 24, 24);
      ctx.restore();
    }
  }

  // Agent Full Portrait
  if (agent) {
    const portraitImg = (await loadImage(agent.fullPortrait)) || (await loadImage(agent.displayIcon));
    if (portraitImg) {
      const targetH = h * 0.76;
      const aspect = portraitImg.width / portraitImg.height;
      const targetW = targetH * aspect;
      const drawX = x + (w - targetW) / 2;
      const drawY = y + 36;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 24;
      ctx.drawImage(portraitImg, drawX, drawY, targetW, targetH);
      ctx.restore();
    }
  } else {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.font = '700 22px Oswald, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KEIN AGENT', x + w / 2, y + h * 0.42);
    ctx.restore();
  }

  // Bottom Nameplate Overlay Gradient
  const plateH = 175;
  const plateY = y + h - plateH;
  const plateGrad = ctx.createLinearGradient(x, plateY - 50, x, y + h);
  plateGrad.addColorStop(0, 'rgba(9, 10, 13, 0)');
  plateGrad.addColorStop(0.28, 'rgba(9, 10, 13, 0.92)');
  plateGrad.addColorStop(1, 'rgba(7, 8, 10, 0.99)');
  ctx.fillStyle = plateGrad;
  ctx.fillRect(x, plateY - 50, w, plateH + 50);

  // Horizontal Accent Divider above Player Name
  const barGrad = ctx.createLinearGradient(x + 20, 0, x + w - 20, 0);
  barGrad.addColorStop(0, isSubstitute ? '#C8A273' : '#9E141B');
  barGrad.addColorStop(0.5, roleAccent);
  barGrad.addColorStop(1, 'rgba(200, 162, 115, 0.15)');
  ctx.fillStyle = barGrad;
  ctx.fillRect(x + 22, y + h - 122, w - 44, 3);

  // Player Name (Directly under the Agent Portrait)
  const playerName = player ? player.name : 'Offener Slot';
  const playerTag = player ? player.tag : '';

  ctx.fillStyle = '#FFFFFF';
  ctx.font = fitText(ctx, playerName, w - 44, 28, 16, '800', 'Inter, sans-serif');
  ctx.fillText(playerName, x + 22, y + h - 84);

  if (playerTag) {
    ctx.fillStyle = '#C8A273';
    ctx.font = '600 13px JetBrains Mono, monospace';
    ctx.fillText(playerTag, x + 22, y + h - 62);
  }

  // Agent Name & Role Badge at bottom of card
  const agentLabel = agent ? agent.name.toUpperCase() : 'NICHT ZUGEWIESEN';
  ctx.fillStyle = '#ECE8E1';
  ctx.font = '700 22px Oswald, sans-serif';
  ctx.fillText(agentLabel, x + 22, y + h - 26);

  if (agent) {
    const roleText = agent.role.toUpperCase();
    ctx.font = '700 11px Inter, sans-serif';
    const roleW = ctx.measureText(roleText).width + 20;
    const roleX = x + w - roleW - 20;
    const roleY = y + h - 44;

    drawRoundedRect(ctx, roleX, roleY, roleW, 24, 6);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.fill();
    ctx.strokeStyle = roleAccent;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = roleAccent;
    ctx.textAlign = 'center';
    ctx.fillText(roleText, roleX + roleW / 2, roleY + 16);
    ctx.textAlign = 'left';
  }

  // Card Outer Border
  drawRoundedRect(ctx, x, y, w, h, 20);
  ctx.lineWidth = 2;
  ctx.strokeStyle = isSubstitute ? 'rgba(200, 162, 115, 0.5)' : 'rgba(158, 20, 27, 0.55)';
  ctx.stroke();

  ctx.restore();
}

export function sanitizeFilename(input: string): string {
  return (
    input
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '') || 'Lineup'
  );
}
