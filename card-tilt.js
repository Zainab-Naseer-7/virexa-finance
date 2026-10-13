/**
 * VIREXA FINANCE — 3D Interactive Card Physics & Tier Switcher
 * Realistic tilt, specular light sheen, and card tier styling
 */

document.addEventListener('DOMContentLoaded', () => {
  const cardElement = document.getElementById('interactiveVirexaCard');
  const cardContainer = document.getElementById('cardContainer');
  const cardGlare = document.getElementById('cardGlare');
  const tierButtons = document.querySelectorAll('.tier-pill');
  const cardTierLabel = document.getElementById('cardTierLabel');

  if (!cardElement || !cardContainer) return;

  let isHovered = false;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let animationFrameId = null;

  // Render loop using lerp (linear interpolation) for buttery smooth motion
  function updateCardTilt() {
    if (!isHovered) {
      targetX = 0;
      targetY = 0;
    }

    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;

    const rotateX = -currentY * 18; // Max 18 degrees tilt
    const rotateY = currentX * 18;

    cardElement.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;

    // Move specular glare
    if (cardGlare) {
      const glareX = (currentX + 1) * 50;
      const glareY = (currentY + 1) * 50;
      cardGlare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.35) 0%, transparent 65%)`;
    }

    // Continue loop if still moving or hovered
    if (isHovered || Math.abs(currentX) > 0.001 || Math.abs(currentY) > 0.001) {
      animationFrameId = requestAnimationFrame(updateCardTilt);
    } else {
      cardElement.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  cardContainer.addEventListener('mouseenter', () => {
    isHovered = true;
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(updateCardTilt);
    }
  });

  cardContainer.addEventListener('mousemove', (e) => {
    const rect = cardContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize coordinates to [-1, 1]
    targetX = (x / rect.width) * 2 - 1;
    targetY = (y / rect.height) * 2 - 1;

    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(updateCardTilt);
    }
  });

  cardContainer.addEventListener('mouseleave', () => {
    isHovered = false;
  });

  // Card Tier Switcher
  tierButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      tierButtons.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');

      const tier = this.getAttribute('data-tier');

      // Remove existing skin classes
      cardElement.classList.remove('obsidian', 'aurora', 'gold');
      cardElement.classList.add(tier);

      if (cardTierLabel) {
        if (tier === 'obsidian') cardTierLabel.textContent = 'TITANIUM OBSIDIAN';
        if (tier === 'aurora') cardTierLabel.textContent = 'AURORA TEAL';
        if (tier === 'gold') cardTierLabel.textContent = 'ROYAL FOUNDER GOLD';
      }

      if (window.showToast) {
        window.showToast(`Selected ${tier.toUpperCase()} Card tier`);
      }
    });
  });
});
