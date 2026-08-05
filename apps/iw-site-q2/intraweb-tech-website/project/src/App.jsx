function App() {
  const [state, setState] = React.useState(window.TWEAK_DEFAULTS);

  React.useEffect(() => {
    if (state.density === 'compact') {
      document.documentElement.style.setProperty('--density', '0.85');
    } else {
      document.documentElement.style.setProperty('--density', '1');
    }
  }, [state.density]);

  return (
    <>
      <NavBar />
      <main>
        <Hero variant={state.heroVariant} intensity={state.motionIntensity} />
        <Problem />
        <Services />
        <Process />
        <Differentiators />
        <Stats />
        <TargetClient />
        <CTA />
        <FAQ />
      </main>
      <Footer />
      <Tweaks state={state} setState={setState} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
