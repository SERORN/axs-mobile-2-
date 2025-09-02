import dayjs from "dayjs";

/**
 * Calculate parking fee based on plaza configuration
 * @param entry ISO string of entry time
 * @param exit ISO string of exit time
 * @param config pricing config for the plaza
 */
export function calculateParkingFee(
  entry: string,
  exit: string,
  config: PlazaPricingConfig
): number {
  const inTime = dayjs(entry);
  const outTime = dayjs(exit);
  const diffMinutes = outTime.diff(inTime, "minute");

  if (diffMinutes <= config.graceMinutes) return 0;

  let fee = 0;
  const hours = Math.ceil((diffMinutes - config.graceMinutes) / 60);

  if (config.name === "Angelopolis") {
    // $20 first hr, $8 subsequent, 3rd hr free
    if (hours >= 1) fee += 20;
    if (hours >= 2) fee += 8;
    if (hours >= 3) fee -= 8; // free third hour
    if (hours > 3) fee += (hours - 3) * 8;
  } else if (config.name === "Galerias Serdan") {
    if (hours >= 1) fee += 18;
    if (hours >= 3) {
      fee += (hours - 2) * 8;
    }
  } else {
    // default rate
    fee = hours * config.defaultRate;
  }
  return fee;
}

export interface PlazaPricingConfig {
  name: string;
  graceMinutes: number;
  defaultRate: number;
}
