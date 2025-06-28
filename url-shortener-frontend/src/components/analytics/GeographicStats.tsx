// src/components/analytics/GeographicStats.tsx
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin } from "lucide-react";

interface CountryData {
  country: string;
  countryCode: string;
  clicks: number;
  percentage: number;
}

interface CityData {
  city: string;
  country: string;
  clicks: number;
  percentage: number;
}

// Updated interface to match the actual data structure from your analytics hook
interface GeographicData {
  countries: CountryData[];
  cities: CityData[];
  totalClicks: number;
}

// Alternative interface for when data comes as key-value pairs (from your types file)
interface GeographicStatsRaw {
  countries: Record<string, number>;
  cities: Record<string, number>;
  topCountry?: string;
  topCity?: string;
  geoDataAvailable: boolean;
}

interface GeographicStatsProps {
  data?: GeographicData | GeographicStatsRaw;
  loading?: boolean;
  compact?: boolean;
}

const getCountryFlag = (countryCode: string) => {
  const flags: Record<string, string> = {
    BR: "🇧🇷", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷",
    ES: "🇪🇸", IT: "🇮🇹", JP: "🇯🇵", CA: "🇨🇦", AU: "🇦🇺",
    AR: "🇦🇷", MX: "🇲🇽", PT: "🇵🇹", IN: "🇮🇳", CN: "🇨🇳",
    RU: "🇷🇺", KR: "🇰🇷", NL: "🇳🇱", SE: "🇸🇪", NO: "🇳🇴",
    DK: "🇩🇰", FI: "🇫🇮", CH: "🇨🇭", AT: "🇦🇹", BE: "🇧🇪",
    PL: "🇵🇱", CZ: "🇨🇿", HU: "🇭🇺", GR: "🇬🇷", TR: "🇹🇷",
    IL: "🇮🇱", SA: "🇸🇦", AE: "🇦🇪", ZA: "🇿🇦", EG: "🇪🇬",
    NG: "🇳🇬", KE: "🇰🇪", TH: "🇹🇭", VN: "🇻🇳", ID: "🇮🇩",
    MY: "🇲🇾", SG: "🇸🇬", PH: "🇵🇭", NZ: "🇳🇿", CL: "🇨🇱",
    PE: "🇵🇪", CO: "🇨🇴", VE: "🇻🇪", EC: "🇪🇨", UY: "🇺🇾",
    PY: "🇵🇾", BO: "🇧🇴",
  };
  return flags[countryCode] || "🌍";
};

// Function to convert raw data to structured format
const processGeographicData = (data: GeographicData | GeographicStatsRaw): GeographicData => {
  // If data already has the expected structure
  if ('countries' in data && Array.isArray(data.countries)) {
    return data as GeographicData;
  }

  // Convert from raw key-value pairs
  const rawData = data as GeographicStatsRaw;

  const totalClicks = Object.values(rawData.countries).reduce((sum, clicks) => sum + clicks, 0);

  const countries: CountryData[] = Object.entries(rawData.countries)
      .map(([country, clicks]) => ({
        country,
        countryCode: country.slice(-2), // Assume last 2 chars are country code
        clicks,
        percentage: totalClicks > 0 ? (clicks / totalClicks) * 100 : 0
      }))
      .sort((a, b) => b.clicks - a.clicks);

  const cities: CityData[] = Object.entries(rawData.cities || {})
      .map(([city, clicks]) => ({
        city: city.split(',')[0] || city, // Extract city name
        country: city.split(',')[1]?.trim() || 'Unknown',
        clicks,
        percentage: totalClicks > 0 ? (clicks / totalClicks) * 100 : 0
      }))
      .sort((a, b) => b.clicks - a.clicks);

  return {
    countries,
    cities,
    totalClicks
  };
};

export function GeographicStats({ data, loading = false, compact = false }: GeographicStatsProps) {
  if (loading) {
    return (
        <div className="space-y-4">
          {[...Array(compact ? 3 : 8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
          ))}
        </div>
    );
  }

  if (!data) {
    return (
        <div className="text-center py-8">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum dado geográfico disponível</p>
        </div>
    );
  }

  const processedData = processGeographicData(data);

  if (!processedData.countries.length && !processedData.cities.length) {
    return (
        <div className="text-center py-8">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum dado geográfico disponível</p>
        </div>
    );
  }

  const displayCountries = compact ? processedData.countries.slice(0, 5) : processedData.countries;
  const displayCities = compact ? processedData.cities.slice(0, 5) : processedData.cities;

  return (
      <div className="space-y-6">
        {/* Countries Section */}
        {processedData.countries.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <h4 className="font-medium">Países</h4>
                <Badge variant="secondary" className="font-mono">
                  {processedData.countries.length} países
                </Badge>
              </div>

              <div className="space-y-3">
                {displayCountries.map((country, index) => (
                    <div key={country.countryCode} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                    <span className="text-lg" title={country.country}>
                      {getCountryFlag(country.countryCode)}
                    </span>
                          <span className="font-medium text-sm">
                      {country.country}
                    </span>
                          {index === 0 && <Badge variant="outline" className="text-xs">Top</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">
                      {country.clicks.toLocaleString()}
                    </span>
                          <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
                      {country.percentage.toFixed(1)}%
                    </span>
                        </div>
                      </div>
                      <Progress value={country.percentage} className="h-2" />
                    </div>
                ))}
              </div>

              {compact && processedData.countries.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{processedData.countries.length - 5} países adicionais
                  </p>
              )}
            </div>
        )}

        {/* Cities Section */}
        {processedData.cities.length > 0 && !compact && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <h4 className="font-medium">Cidades</h4>
                <Badge variant="secondary" className="font-mono">
                  {processedData.cities.length} cidades
                </Badge>
              </div>

              <div className="space-y-3">
                {displayCities.map((city, index) => (
                    <div key={`${city.city}-${city.country}`} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-sm">
                      {city.city}
                    </span>
                          <span className="text-xs text-muted-foreground">
                      {city.country}
                    </span>
                          {index === 0 && <Badge variant="outline" className="text-xs">Top</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">
                      {city.clicks.toLocaleString()}
                    </span>
                          <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
                      {city.percentage.toFixed(1)}%
                    </span>
                        </div>
                      </div>
                      <Progress value={city.percentage} className="h-2" />
                    </div>
                ))}
              </div>
            </div>
        )}

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total de cliques</span>
            <span className="font-mono font-medium">
            {processedData.totalClicks.toLocaleString()}
          </span>
          </div>
        </div>
      </div>
  );
}