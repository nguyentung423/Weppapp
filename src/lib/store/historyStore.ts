import { Reading } from "@/lib/types/domain";

const MAX_HISTORY_POINTS = 720;

let readingsHistory: Reading[] = [];

export const historyStore = {
  push(reading: Reading) {
    readingsHistory = [...readingsHistory, reading].slice(-MAX_HISTORY_POINTS);
  },
  getAll() {
    return readingsHistory;
  },
};
