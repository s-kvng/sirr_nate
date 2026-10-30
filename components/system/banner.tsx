"use client";

import { useFx } from "@/lib/system/fx";

/** LEVEL UP and QUEST COMPLETE (SPEC §4.6). Decorative: toasts carry the news. */
export function BannerLayer() {
  const banner = useFx((s) => s.banner);
  const clear = useFx((s) => s.clearBanner);

  return (
    <div className="banner-layer" aria-hidden="true">
      {banner && (
        <p
          key={banner.id}
          className="banner"
          data-kind={banner.kind}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget && !e.pseudoElement) clear(banner.id);
          }}
        >
          {banner.text}
        </p>
      )}
    </div>
  );
}
