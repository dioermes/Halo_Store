import { videoSrcWithFrame } from "@/lib/video";

function attr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function AutoplayClip({
  id,
  src,
  desktopSrc,
  preload = "auto",
  boot = true,
}: {
  id: string;
  src: string;
  desktopSrc?: string;
  preload?: "auto" | "none" | "metadata";
  boot?: boolean;
}) {
  const source = attr(videoSrcWithFrame(src));
  const desktop = desktopSrc ? attr(videoSrcWithFrame(desktopSrc)) : "";
  const html = `<video id="${attr(id)}" class="halo-bg-video absolute inset-0 h-full w-full object-cover" src="${source}"${desktop ? ` data-desktop-src="${desktop}"` : ""}${boot ? " autoplay" : ""} muted loop playsinline webkit-playsinline preload="${preload}" disablepictureinpicture aria-hidden="true"></video>`;

  return (
    <>
      <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: html }} />
      {boot ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var v=document.getElementById(${JSON.stringify(id)});if(!v)return;v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute("webkit-playsinline","true");v.play().catch(function(){});})();`,
          }}
        />
      ) : null}
    </>
  );
}
