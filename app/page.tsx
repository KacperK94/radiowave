import RadioWaveApp from "./radio-wave";

export default function Home() {
  // Keep the live shoutbox disabled until its functions are deployed to Convex.
  // This prevents a missing `shoutbox:list` backend function from crashing the page.
  const backendEnabled =
    process.env.NEXT_PUBLIC_CONVEX_SHOUTBOX_ENABLED === "true" &&
    Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
  return <RadioWaveApp backendEnabled={backendEnabled} />;
}
