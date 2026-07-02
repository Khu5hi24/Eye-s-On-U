import { useTaskStore } from './taskStore';

// Delegate directly to the unified store to maintain shared reactive state
export const useAppStore = useTaskStore;
export type { UnifiedState as AppState } from './taskStore';