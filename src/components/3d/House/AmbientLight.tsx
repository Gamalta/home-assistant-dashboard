import {useEffect, useState} from 'react';

export function AmbientLight() {
  const [ambientIntensity, setAmbientIntensity] = useState(0.5);

  useEffect(() => {
    const updateAmbientIntensity = () => {
      const now = new Date();
      const hour = now.getHours() ?? 12;

      let intensity = 0.7; //day
      if (hour >= 19 || hour < 6) {
        intensity = 0.05; //night
      } else if (hour >= 6 && hour < 8) {
        intensity = 0.05 + ((hour - 6) / 2) * 0.45; //sunrise
      } else if (hour >= 17 && hour < 19) {
        intensity = 0.5 - ((hour - 17) / 2) * 0.45; //sunset
      }
      setAmbientIntensity(intensity);
    };
    const interval = setInterval(updateAmbientIntensity, 60000);

    updateAmbientIntensity();

    return () => clearInterval(interval);
  }, []);

  return <ambientLight intensity={ambientIntensity} />;
}
