export function AutoplayClip({
  id,
  src,
  desktopSrc,
  preload = "auto",
  autoPlay = true,
}: {
  id: string;
  src: string;
  desktopSrc?: string;
  preload?: "auto" | "none" | "metadata";
  autoPlay?: boolean;
}) {
  const url = src.split("#")[0];
  const desktop = desktopSrc?.split("#")[0];

  return (
    <video
      id={id}
      className="halo-bg-video absolute inset-0 h-full w-full object-cover"
      src={autoPlay ? url : undefined}
      data-src={autoPlay ? undefined : url}
      data-desktop-src={desktop}
      autoPlay={autoPlay}
      muted
      loop
      playsInline
      preload={preload}
      controls={false}
      disablePictureInPicture
      aria-hidden
    />
  );
}
