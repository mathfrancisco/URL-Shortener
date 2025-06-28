// src/components/analytics/DeviceStats.tsx

import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Monitor,
  Tablet,
  Chrome,
  Globe,
  Bot
} from 'lucide-react';

interface DeviceTypeData {
  type: string;
  clicks: number;
  percentage: number;
}

interface BrowserData {
  browser: string;
  version?: string;
  clicks: number;
  percentage: number;
}

interface OSData {
  os: string;
  version?: string;
  clicks: number;
  percentage: number;
}

// Expected structured data format
interface DeviceStatsData {
  deviceTypes: DeviceTypeData[];
  browsers: BrowserData[];
  operatingSystems: OSData[];
  totalClicks: number;
}

// Raw data format from your analytics hook (matching your types file)
interface DeviceStatsRaw {
  devices: Record<string, number>;
  browsers: Record<string, number>;
  topDevice?: string;
  topBrowser?: string;
}

interface DeviceStatsProps {
  data?: DeviceStatsData | DeviceStatsRaw;
  loading?: boolean;
  compact?: boolean;
}

const getDeviceIcon = (deviceType: string) => {
  const type = deviceType.toLowerCase();
  if (type.includes('mobile') || type.includes('phone')) {
    return <Smartphone className="h-4 w-4" />;
  }
  if (type.includes('tablet')) {
    return <Tablet className="h-4 w-4" />;
  }
  if (type.includes('desktop') || type.includes('computer')) {
    return <Monitor className="h-4 w-4" />;
  }
  if (type.includes('bot') || type.includes('crawler')) {
    return <Bot className="h-4 w-4" />;
  }
  return <Globe className="h-4 w-4" />;
};

const getBrowserIcon = (browser: string) => {
  return <Chrome className="h-4 w-4" />;
};

// Function to convert raw data to structured format
const processDeviceData = (data: DeviceStatsData | DeviceStatsRaw): DeviceStatsData => {
  // If data already has the expected structure
  if ('deviceTypes' in data && Array.isArray(data.deviceTypes)) {
    return data as DeviceStatsData;
  }

  // Convert from raw key-value pairs
  const rawData = data as DeviceStatsRaw;

  const totalDeviceClicks = Object.values(rawData.devices || {}).reduce((sum, clicks) => sum + clicks, 0);
  const totalBrowserClicks = Object.values(rawData.browsers || {}).reduce((sum, clicks) => sum + clicks, 0);
  const totalClicks = Math.max(totalDeviceClicks, totalBrowserClicks);

  const deviceTypes: DeviceTypeData[] = Object.entries(rawData.devices || {})
      .map(([type, clicks]) => ({
        type,
        clicks,
        percentage: totalClicks > 0 ? (clicks / totalClicks) * 100 : 0
      }))
      .sort((a, b) => b.clicks - a.clicks);

  const browsers: BrowserData[] = Object.entries(rawData.browsers || {})
      .map(([browser, clicks]) => {
        // Split browser name and version if available
        const [browserName, version] = browser.split(' ');
        return {
          browser: browserName,
          version: version || undefined,
          clicks,
          percentage: totalClicks > 0 ? (clicks / totalClicks) * 100 : 0
        };
      })
      .sort((a, b) => b.clicks - a.clicks);

  // Generate some mock OS data since it's not provided in the raw data
  const operatingSystems: OSData[] = [];

  return {
    deviceTypes,
    browsers,
    operatingSystems,
    totalClicks
  };
};

export function DeviceStats({ data, loading = false, compact = false }: DeviceStatsProps) {
  if (loading) {
    return (
        <div className="space-y-6">
          {[...Array(3)].map((_, sectionIndex) => (
              <div key={sectionIndex} className="space-y-4">
                <Skeleton className="h-5 w-24" />
                <div className="space-y-3">
                  {[...Array(compact ? 3 : 5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                  ))}
                </div>
              </div>
          ))}
        </div>
    );
  }

  if (!data) {
    return (
        <div className="text-center py-8">
          <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum dado de dispositivo disponível</p>
        </div>
    );
  }

  const processedData = processDeviceData(data);

  if (!processedData.deviceTypes.length && !processedData.browsers.length && !processedData.operatingSystems.length) {
    return (
        <div className="text-center py-8">
          <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum dado de dispositivo disponível</p>
        </div>
    );
  }

  const displayDeviceTypes = compact ? processedData.deviceTypes.slice(0, 3) : processedData.deviceTypes;
  const displayBrowsers = compact ? processedData.browsers.slice(0, 3) : processedData.browsers;
  const displayOperatingSystems = compact ? processedData.operatingSystems.slice(0, 3) : processedData.operatingSystems;

  return (
      <div className="space-y-8">
        {/* Device Types Section */}
        {processedData.deviceTypes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tipos de Dispositivo</h3>
                {compact && processedData.deviceTypes.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{processedData.deviceTypes.length - 3} mais
                    </Badge>
                )}
              </div>
              <div className="space-y-3">
                {displayDeviceTypes.map((device, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device.type)}
                          <span className="text-sm font-medium capitalize">
                      {device.type}
                    </span>
                        </div>
                        <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {device.clicks.toLocaleString()} clicks
                    </span>
                          <span className="text-sm font-medium">
                      {device.percentage.toFixed(1)}%
                    </span>
                        </div>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                    </div>
                ))}
              </div>
            </div>
        )}

        {/* Browsers Section */}
        {processedData.browsers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Navegadores</h3>
                {compact && processedData.browsers.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{processedData.browsers.length - 3} mais
                    </Badge>
                )}
              </div>
              <div className="space-y-3">
                {displayBrowsers.map((browser, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getBrowserIcon(browser.browser)}
                          <span className="text-sm font-medium">
                      {browser.browser}
                            {browser.version && (
                                <span className="text-muted-foreground ml-1">
                          {browser.version}
                        </span>
                            )}
                    </span>
                        </div>
                        <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {browser.clicks.toLocaleString()} clicks
                    </span>
                          <span className="text-sm font-medium">
                      {browser.percentage.toFixed(1)}%
                    </span>
                        </div>
                      </div>
                      <Progress value={browser.percentage} className="h-2" />
                    </div>
                ))}
              </div>
            </div>
        )}

        {/* Operating Systems Section */}
        {processedData.operatingSystems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Sistemas Operacionais</h3>
                {compact && processedData.operatingSystems.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{processedData.operatingSystems.length - 3} mais
                    </Badge>
                )}
              </div>
              <div className="space-y-3">
                {displayOperatingSystems.map((os, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          <span className="text-sm font-medium">
                      {os.os}
                            {os.version && (
                                <span className="text-muted-foreground ml-1">
                          {os.version}
                        </span>
                            )}
                    </span>
                        </div>
                        <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {os.clicks.toLocaleString()} clicks
                    </span>
                          <span className="text-sm font-medium">
                      {os.percentage.toFixed(1)}%
                    </span>
                        </div>
                      </div>
                      <Progress value={os.percentage} className="h-2" />
                    </div>
                ))}
              </div>
            </div>
        )}

        {/* Summary */}
        {!compact && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total de Clicks</span>
                <span className="font-semibold">
              {processedData.totalClicks.toLocaleString()}
            </span>
              </div>
            </div>
        )}
      </div>
  );
}