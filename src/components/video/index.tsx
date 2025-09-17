interface VideoProps {
  src: string;
  width?: string | number;
  height?: string | number;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
}

export default function Video({
  src,
  width = "90%",
  height,
  autoPlay = false,
  loop = true,
  muted = true,
  controls = true,
  className,
}: VideoProps) {
  // Ensure the src has .mp4 extension if no extension is provided
  const videoSrc = src.includes('.') ? src : `${src}.mp4`;
  
  return (
    <p style={{ textAlign: "center" }}>
      <video
        width={width}
        height={height}
        loop={loop}
        muted={muted}
        autoPlay={autoPlay}
        controls={controls}
        className={className}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </p>
  );
}
