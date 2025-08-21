// For use on PDPs
// Binds to Dawn's native variantChange event
// Swaps out content in DOM using 'data-content-badge' element

document.addEventListener('DOMContentLoaded', function () {
  const badgeElement = document.querySelector('[data-content-badge]');

  // subscribes to variant changes and dynamically updates the badge in the DOM
  function sunscribeToVariantChange() {
    window.subscribe(window.PUB_SUB_EVENTS.variantChange, function (event) {
      const shopBadges = Theme.badges.shop;
      const inventory = Theme.product.inventory;
      const variant = event.data.variant;
      const variantId = variant.id;
      const variantBadges = Theme.badges.variants[variantId];
      const lowStockThreshold = Theme.badges.lowStockThreshold;
      let matchingBadge = false;

      // early return if no variant badges found
      if (!variantBadges) return;

      // loop through shop badges in order
      for (let i = 0; i < shopBadges.length; ++i) {
        const shopBadge = shopBadges[i];
        const badgeName = shopBadge.name;

        if (badgeName == 'out-of-stock') {
          // skip this badge if product is not out of stock
          if (variant.available) continue;
        } else if (variant.available && badgeName == 'low-stock') {
          // skip this badge if product is not low stock
          if (inventory[variantId] >= lowStockThreshold) continue;
        } else if (badgeName == 'sale') {
          // skip this badge if no compare price or compare price < price
          if (variant.compare_at_price == null || variant.compare_at_price < variant.price) {
            continue;
          }
        }

        // search variant badges for match
        for (let k = 0; k < variantBadges.length; ++k) {
          const variantBadgeName = variantBadges[k];
          // if names match
          if (variantBadgeName == shopBadge.name) {
            matchingBadge = shopBadge;
            break;
          }
        }

        // we found a match!
        if (matchingBadge) {
          updateBadgeInDOM(matchingBadge);
          return;
        }
      }

      // if we went through all of that and didn't find a matching badge
      hideBadge();
    });

    function hideBadge() {
      badgeElement.style.display = 'none';
    }

    function updateBadgeInDOM(newBadge) {
      // update badge text
      badgeElement.textContent = newBadge.display_text;

      // update color css vars
      badgeElement.style.setProperty('--color-badge-foreground', newBadge.text_color);
      badgeElement.style.setProperty('--color-badge-background', newBadge.bg_color);
      badgeElement.style.setProperty('--color-badge-border', newBadge.border_color);

      // make sure the badge is visible
      badgeElement.style.display = 'inline-block';
    }
  }

  if (Theme && badgeElement && window.subscribe && window.PUB_SUB_EVENTS) {
    sunscribeToVariantChange();
  } else {
    console.error('could not find badgeElement or subscribe to window.subscribe');
  }
});
