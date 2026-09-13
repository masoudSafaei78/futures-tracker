export function getFundingRisk(fundingRate, fundingIntervalHours) {
  if (fundingRate == null || fundingIntervalHours == null || !Number.isFinite(Number(fundingRate)) || !Number.isFinite(Number(fundingIntervalHours))) {
    return { level: 'unknown', label: 'داده معتبر در دسترس نیست', excludeCandidate: false };
  }
  const rate = Math.abs(Number(fundingRate));
  const interval = Number(fundingIntervalHours);
  const frequent = interval < 4;
  const severe = rate >= 0.5;
  if (frequent && severe) return { level: 'extreme', label: '⛔ ریسک بسیار بالا — فاندینگ شدید و پرتکرار / ترجیحاً معامله نشود', excludeCandidate: true };
  if (severe) return { level: 'very-high', label: '⚠️ خطر خیلی بالا — فاندینگ شدید', excludeCandidate: false };
  if (frequent) return { level: 'high', label: '⚠️ خطر بالا — فاندینگ پرتکرار', excludeCandidate: false };
  return { level: 'normal', label: 'عادی', excludeCandidate: false };
}
