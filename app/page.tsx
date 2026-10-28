import RadioWaveApp from "./radio-wave";

export default function Home() {
  const backendEnabled = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
  return <RadioWaveApp backendEnabled={backendEnabled} />;
}
