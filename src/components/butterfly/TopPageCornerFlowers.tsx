import Image from "next/image";

/**
 * Layer 3 of the Top Page background (redesign spec v2.9 §4.1):
 * restrained flower/sakura decoration in the four corners only — nothing
 * placed in the center, so it never competes with the title or CTA.
 *
 * Source: 07_icon_set_butterfly_envelope_mic.png, bottom half
 * (see README_inventory.md — listed there as "④花装飾の一部").
 */
export default function TopPageCornerFlowers() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* top-left: crystal + rose cluster, mirrored to point into the corner */}
      <div
        className="absolute -left-6 -top-6 opacity-80"
        style={{ width: 150, height: 135, transform: "scaleX(-1) scaleY(-1)" }}
      >
        <Image
          src="/images/decor/corner_flower_crystal_rose.png"
          alt=""
          width={367}
          height={331}
          sizes="150px"
          className="h-full w-full object-contain"
        />
      </div>

      {/* top-right: sakura branch, mirrored vertically to drape down from the top */}
      <div
        className="absolute -right-4 -top-4 opacity-80"
        style={{ width: 128, height: 142, transform: "scaleY(-1)" }}
      >
        <Image
          src="/images/decor/corner_flower_sakura.png"
          alt=""
          width={298}
          height={331}
          sizes="128px"
          className="h-full w-full object-contain"
        />
      </div>

      {/* bottom-left: sakura branch, natural orientation */}
      <div className="absolute -bottom-6 -left-4 opacity-70" style={{ width: 132, height: 146 }}>
        <Image
          src="/images/decor/corner_flower_sakura.png"
          alt=""
          width={298}
          height={331}
          sizes="132px"
          className="h-full w-full object-contain"
        />
      </div>

      {/* bottom-right: crystal + rose cluster, mirrored horizontally only */}
      <div
        className="absolute -bottom-6 -right-6 opacity-70"
        style={{ width: 150, height: 135, transform: "scaleX(-1)" }}
      >
        <Image
          src="/images/decor/corner_flower_crystal_rose.png"
          alt=""
          width={367}
          height={331}
          sizes="150px"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
