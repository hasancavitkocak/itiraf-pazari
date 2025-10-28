'use client';

interface City {
  slug: string;
  name: string;
  id: number;
}

interface CityConfessionPageProps {
  city: City;
}

export function CityConfessionPage({ city }: CityConfessionPageProps) {
  return (
    <div>
      <h1>{city.name} İtirafları</h1>
      <p>Test component</p>
    </div>
  );
}